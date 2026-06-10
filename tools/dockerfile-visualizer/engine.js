/**
 * DockerfileEngine — parses a Dockerfile into instructions, analyzes the
 * result (build stages, COPY --from dependency edges, layer-cache
 * volatility, lint findings and RUN-merge groups) and renders everything
 * as an SVG build-pipeline graph. Runs entirely in the browser.
 */
(function () {
    'use strict';

    const KNOWN_INSTRUCTIONS = new Set([
        'FROM', 'RUN', 'CMD', 'LABEL', 'MAINTAINER', 'EXPOSE', 'ENV', 'ADD',
        'COPY', 'ENTRYPOINT', 'VOLUME', 'USER', 'WORKDIR', 'ARG', 'ONBUILD',
        'STOPSIGNAL', 'HEALTHCHECK', 'SHELL',
    ]);

    // Dependency manifests / lockfiles — copies of these are cache-friendly
    // because they only change when dependencies change, not on every edit.
    const MANIFEST_RE = /(^|\/)(package(-lock)?\.json|npm-shrinkwrap\.json|yarn\.lock|pnpm-lock\.yaml|bun\.lockb?|go\.(mod|sum)|requirements[\w.-]*\.txt|constraints\.txt|Pipfile(\.lock)?|poetry\.lock|pyproject\.toml|Cargo\.(toml|lock)|pom\.xml|build\.gradle(\.kts)?|settings\.gradle(\.kts)?|gradle\.properties|Gemfile(\.lock)?|composer\.(json|lock)|[\w.-]+\.csproj|packages\.lock\.json|mix\.(exs|lock)|deno\.(json|lock))$/i;

    // RUN commands that download/install dependencies — the expensive steps
    // worth keeping cached.
    const DEP_INSTALL_RE = /\b(npm\s+(ci|install)|yarn\s+(install|--frozen-lockfile)|pnpm\s+(i|install)|pip3?\s+install|poetry\s+install|pipenv\s+install|apt(-get)?\s+(-\S+\s+)*install|apk\s+add|yum\s+install|dnf\s+install|go\s+mod\s+download|cargo\s+fetch|bundle\s+install|composer\s+install|dotnet\s+restore|mix\s+deps\.get)\b/i;

    const SECRET_RE = /(passw(or)?d|secret|token|api[-_]?key|private[-_]?key|credential)/i;

    // Cache volatility levels: 0 = stable, 1 = changes occasionally, 2 = volatile.
    const LEVEL_STABLE = 0;
    const LEVEL_OCCASIONAL = 1;
    const LEVEL_VOLATILE = 2;

    // ---------------------------------------------------------------- parsing

    function parse(source) {
        const lines = source.split(/\r?\n/);
        const errors = [];

        // The escape directive (`# escape=\`` ) is only honoured before the
        // first non-comment line.
        let escapeChar = '\\';
        for (const line of lines) {
            const t = line.trim();
            if (!t) continue;
            const m = t.match(/^#\s*escape\s*=\s*(`|\\)\s*$/i);
            if (m) { escapeChar = m[1]; continue; }
            if (t.startsWith('#')) continue;
            break;
        }
        const trailingEscapeRe = new RegExp((escapeChar === '\\' ? '\\\\' : '`') + '\\s*$');

        const instructions = [];
        let i = 0;
        while (i < lines.length) {
            const startLine = i + 1;
            const first = lines[i].trim();
            if (!first || first.startsWith('#')) { i++; continue; }

            let text = lines[i];
            while (trailingEscapeRe.test(text) && i + 1 < lines.length) {
                text = text.replace(trailingEscapeRe, ' ');
                i++;
                // Comment lines are allowed (and skipped) inside a continuation.
                while (lines[i].trim().startsWith('#') && i + 1 < lines.length) i++;
                if (!lines[i].trim().startsWith('#')) text += ' ' + lines[i].trim();
            }
            i++;

            const flat = text.replace(/\s+/g, ' ').trim();
            const sp = flat.indexOf(' ');
            const rawKeyword = sp === -1 ? flat : flat.slice(0, sp);
            const args = sp === -1 ? '' : flat.slice(sp + 1);
            const keyword = rawKeyword.toUpperCase();

            if (!KNOWN_INSTRUCTIONS.has(keyword)) {
                errors.push(`Line ${startLine}: unknown instruction "${rawKeyword}".`);
                continue;
            }
            instructions.push({ keyword, args, line: startLine });
        }

        return { instructions, errors };
    }

    function parseFrom(args) {
        const tokens = args.split(/\s+/).filter(Boolean);
        let idx = 0;
        while (idx < tokens.length && tokens[idx].startsWith('--')) idx++;
        const ref = tokens[idx] || '';
        let name = null;
        if (tokens[idx + 1] && tokens[idx + 1].toUpperCase() === 'AS' && tokens[idx + 2]) {
            name = tokens[idx + 2];
        }

        let image = ref;
        let tag = null;
        let digest = null;
        const at = image.indexOf('@');
        if (at !== -1) { digest = image.slice(at + 1); image = image.slice(0, at); }
        const lastSlash = image.lastIndexOf('/');
        const colon = image.indexOf(':', lastSlash + 1);
        if (colon !== -1) { tag = image.slice(colon + 1); image = image.slice(0, colon); }

        return { ref, image, tag, digest, name };
    }

    function parseCopyish(args) {
        let from = null;
        const rest = [];
        for (const t of args.split(/\s+/).filter(Boolean)) {
            if (t.startsWith('--')) {
                const m = t.match(/^--from=(.+)$/i);
                if (m) from = m[1];
            } else {
                rest.push(t);
            }
        }

        // Exec/JSON form: COPY ["src", "dest"]
        let paths = rest;
        const joined = rest.join(' ');
        if (joined.startsWith('[')) {
            try {
                const arr = JSON.parse(joined);
                if (Array.isArray(arr)) paths = arr.map(String);
            } catch (e) { /* fall back to the whitespace split */ }
        }

        return {
            from,
            sources: paths.slice(0, -1),
            dest: paths[paths.length - 1] || null,
        };
    }

    function classifySources(keyword, sources) {
        if (!sources.length) return LEVEL_VOLATILE;
        let level = LEVEL_STABLE;
        for (const s of sources) {
            if (/^https?:\/\//i.test(s)) return LEVEL_VOLATILE; // remote content
            const clean = s.replace(/^\.\//, '').replace(/\/+$/, '');
            if (clean === '' || clean === '.' || clean === '..' || clean === '/' || clean === '*') {
                return LEVEL_VOLATILE; // whole build context
            }
            if (MANIFEST_RE.test(clean.replace(/\*/g, ''))) {
                level = Math.max(level, LEVEL_STABLE);
                continue;
            }
            if (/[*?]/.test(clean) || !/\.\w+$/.test(clean)) {
                level = Math.max(level, LEVEL_VOLATILE); // globs and directories ≈ source code
            } else {
                level = Math.max(level, LEVEL_OCCASIONAL); // one specific file
            }
        }
        return level;
    }

    function isBroadCopy(node) {
        return (node.keyword === 'COPY' || node.keyword === 'ADD') &&
            !node.copy.from && node.intrinsic === LEVEL_VOLATILE;
    }

    // --------------------------------------------------------------- analysis

    function analyze(source) {
        const parsed = parse(source);
        const errors = parsed.errors.slice();
        const stages = [];
        const edges = [];
        const warnings = [];
        const stageByName = Object.create(null);
        let current = null;
        let nodeSeq = 0;

        function lookupStage(ref) {
            if (ref == null) return null;
            if (/^\d+$/.test(ref)) return stages[Number(ref)] || null;
            return stageByName[ref.toLowerCase()] || null;
        }

        function addWarning(level, line, message, node) {
            warnings.push({ level, line, message });
            if (node) node.warnings.push({ level, message });
        }

        for (const ins of parsed.instructions) {
            if (ins.keyword === 'FROM') {
                const f = parseFrom(ins.args);
                const baseStage = lookupStage(f.ref);
                const fromNode = {
                    id: 'n' + (nodeSeq++), keyword: 'FROM', args: ins.args,
                    line: ins.line, intrinsic: LEVEL_STABLE, warnings: [],
                };
                current = {
                    index: stages.length,
                    name: f.name,
                    base: f,
                    baseStageIndex: baseStage ? baseStage.index : null,
                    nodes: [fromNode],
                };
                stages.push(current);
                if (f.name) {
                    if (stageByName[f.name.toLowerCase()]) {
                        addWarning('warn', ins.line, `Duplicate stage name "${f.name}" — only the last definition is reachable.`, fromNode);
                    }
                    stageByName[f.name.toLowerCase()] = current;
                }
                if (baseStage) {
                    edges.push({ fromStage: baseStage.index, toStage: current.index, toNodeId: fromNode.id, kind: 'base' });
                }
                continue;
            }

            if (!current) {
                if (ins.keyword !== 'ARG') {
                    errors.push(`Line ${ins.line}: ${ins.keyword} appears before the first FROM — Docker only allows ARG there.`);
                }
                continue;
            }

            const node = {
                id: 'n' + (nodeSeq++), keyword: ins.keyword, args: ins.args,
                line: ins.line, intrinsic: LEVEL_STABLE, warnings: [],
            };

            if (ins.keyword === 'COPY' || ins.keyword === 'ADD') {
                node.copy = parseCopyish(ins.args);
                if (node.copy.from != null) {
                    const src = lookupStage(node.copy.from);
                    if (src) {
                        node.fromStageIndex = src.index;
                        edges.push({ fromStage: src.index, toStage: current.index, toNodeId: node.id, kind: 'copy' });
                    }
                } else {
                    node.intrinsic = classifySources(ins.keyword, node.copy.sources);
                }
            }

            if (ins.keyword === 'RUN') {
                const mountRe = /--mount=\S*?\bfrom=([^,\s]+)/g;
                let m;
                while ((m = mountRe.exec(ins.args))) {
                    const src = lookupStage(m[1]);
                    if (src) {
                        edges.push({ fromStage: src.index, toStage: current.index, toNodeId: node.id, kind: 'mount' });
                    }
                }
            }

            current.nodes.push(node);
        }

        // Cumulative cache volatility: once a layer is volatile, every layer
        // below it in the same stage rebuilds with it. Stage references always
        // point backwards, so a single forward pass resolves inheritance.
        for (const stage of stages) {
            let acc = stage.baseStageIndex != null
                ? stages[stage.baseStageIndex].finalCumulative
                : LEVEL_STABLE;
            for (const node of stage.nodes) {
                let intrinsic = node.intrinsic;
                if (node.fromStageIndex != null) {
                    intrinsic = Math.max(intrinsic, stages[node.fromStageIndex].finalCumulative);
                }
                acc = Math.max(acc, intrinsic);
                node.cumulative = acc;
            }
            stage.finalCumulative = acc;
        }

        lint(stages, warnings, addWarningFactory(warnings));
        const mergeGroups = findMergeGroups(stages, warnings);

        warnings.sort((a, b) => a.line - b.line);
        return { stages, edges, warnings, errors, mergeGroups };
    }

    function addWarningFactory(warnings) {
        return function (level, line, message, node) {
            warnings.push({ level, line, message });
            if (node) node.warnings.push({ level, message });
        };
    }

    function lint(stages, warnings, addWarning) {
        for (const stage of stages) {
            const fromNode = stage.nodes[0];

            // Unpinned base image.
            if (stage.baseStageIndex == null && stage.base.image !== 'scratch' && !stage.base.digest) {
                if (!stage.base.tag) {
                    addWarning('warn', fromNode.line, `Base image "${stage.base.image}" has no tag — it implicitly tracks "latest", which can change under you between builds. Pin a version or digest.`, fromNode);
                } else if (stage.base.tag === 'latest') {
                    addWarning('warn', fromNode.line, `Base image "${stage.base.image}:latest" is not pinned — "latest" can change under you between builds. Pin a version or digest.`, fromNode);
                }
            }

            let cmdCount = 0;
            let entrypointCount = 0;

            for (const node of stage.nodes) {
                if (node.keyword === 'CMD') cmdCount++;
                if (node.keyword === 'ENTRYPOINT') entrypointCount++;

                if (node.keyword === 'MAINTAINER') {
                    addWarning('info', node.line, 'MAINTAINER is deprecated — use LABEL maintainer="..." instead.', node);
                }

                if ((node.keyword === 'ENV' || node.keyword === 'ARG') && SECRET_RE.test(node.args.split('=')[0])) {
                    addWarning('warn', node.line, `${node.keyword} "${node.args.split(/[=\s]/)[0]}" looks like a secret — it gets baked into the image (ARG values stay visible in the build history too). Use build secrets or runtime configuration instead.`, node);
                }

                if (node.keyword === 'ADD' && !node.copy.from) {
                    const hasUrl = node.copy.sources.some((s) => /^https?:\/\//i.test(s));
                    const hasArchive = node.copy.sources.some((s) => /\.(tar(\.(gz|bz2|xz))?|tgz|txz)$/i.test(s));
                    if (!hasUrl && !hasArchive) {
                        addWarning('info', node.line, 'ADD has no benefit over COPY here — prefer COPY for clearer intent and no surprise archive extraction.', node);
                    }
                }

                if (node.keyword === 'RUN') {
                    if (/apt(-get)?\s+update/.test(node.args) && !/install/.test(node.args)) {
                        addWarning('warn', node.line, 'RUN apt-get update in its own layer caches stale package lists forever — combine it with the install in a single RUN.', node);
                    } else if (/apt(-get)?\s+(-\S+\s+)*install/.test(node.args) && !/rm\s+-rf\s+\/var\/lib\/apt\/lists/.test(node.args)) {
                        addWarning('info', node.line, 'Clean up with "rm -rf /var/lib/apt/lists/*" in the same RUN to keep the apt layer small.', node);
                    }

                    // Cache breaker: an expensive dependency install sitting
                    // below a broad COPY rebuilds on every source change.
                    if (node.cumulative === LEVEL_VOLATILE && DEP_INSTALL_RE.test(node.args)) {
                        const breaker = stage.nodes.find((n) => n.line < node.line && isBroadCopy(n));
                        if (breaker) {
                            addWarning('warn', node.line, `Cache breaker: "${shorten(breaker.keyword + ' ' + breaker.args, 40)}" (line ${breaker.line}) invalidates this expensive install on every source change. Copy the dependency manifests first, install, then copy the rest.`, node);
                            if (!breaker.flaggedAsBreaker) {
                                breaker.flaggedAsBreaker = true;
                                addWarning('warn', breaker.line, 'This broad COPY invalidates the cache of every layer below it whenever any file in the build context changes.', breaker);
                            }
                        }
                    }
                }
            }

            if (cmdCount > 1) {
                addWarning('warn', fromNode.line, `Stage ${stageLabel(stage)} has ${cmdCount} CMD instructions — only the last one takes effect.`, null);
            }
            if (entrypointCount > 1) {
                addWarning('warn', fromNode.line, `Stage ${stageLabel(stage)} has ${entrypointCount} ENTRYPOINT instructions — only the last one takes effect.`, null);
            }
        }

        // Root user check on the final stage (the image that actually ships),
        // walking up through any internal base stages.
        if (stages.length) {
            const last = stages[stages.length - 1];
            let cursor = last;
            let hasUser = false;
            const seen = new Set();
            while (cursor && !seen.has(cursor.index)) {
                seen.add(cursor.index);
                if (cursor.nodes.some((n) => n.keyword === 'USER')) { hasUser = true; break; }
                cursor = cursor.baseStageIndex != null ? stages[cursor.baseStageIndex] : null;
            }
            if (!hasUser) {
                const fromNode = last.nodes[0];
                addWarning('warn', fromNode.line, 'No USER instruction in the final stage — the container will run as root. Add a non-root USER before the entrypoint.', fromNode);
            }
        }
    }

    function findMergeGroups(stages, warnings) {
        const groups = [];
        for (const stage of stages) {
            let run = [];
            const flush = () => {
                if (run.length >= 2) {
                    groups.push({ stageIndex: stage.index, nodeIds: run.map((n) => n.id) });
                    warnings.push({
                        level: 'info',
                        line: run[0].line,
                        message: `Lines ${run[0].line}–${run[run.length - 1].line}: ${run.length} consecutive RUN instructions create ${run.length} layers — merging them with "&&" produces a single, smaller layer.`,
                    });
                }
                run = [];
            };
            for (const node of stage.nodes) {
                if (node.keyword === 'RUN') run.push(node);
                else flush();
            }
            flush();
        }
        return groups;
    }

    function stageLabel(stage) {
        return stage.name ? `"${stage.name}"` : `#${stage.index}`;
    }

    // -------------------------------------------------------------- rendering

    const PAD = 16;
    const COL_W = 256;
    const STAGE_GAP = 88;
    const HEADER_H = 38;
    const NODE_H = 44;
    const NODE_GAP = 10;
    const STAGE_PAD = 12;

    function escapeXml(str) {
        return String(str)
            .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
    }

    function shorten(str, max) {
        return str.length <= max ? str : str.slice(0, max - 1) + '…';
    }

    function renderSVG(analysis) {
        const stages = analysis.stages;
        if (!stages.length) return null;

        const stageX = (i) => PAD + i * (COL_W + STAGE_GAP);
        const nodeX = (i) => stageX(i) + STAGE_PAD;
        const nodeY = (k) => PAD + HEADER_H + k * (NODE_H + NODE_GAP);
        const nodeW = COL_W - STAGE_PAD * 2;

        const stageHeights = stages.map((s) => HEADER_H + s.nodes.length * (NODE_H + NODE_GAP) - NODE_GAP + STAGE_PAD);
        const maxStageH = Math.max(...stageHeights);
        const hasLongEdge = analysis.edges.some((e) => e.toStage - e.fromStage > 1);
        const width = PAD * 2 + stages.length * COL_W + (stages.length - 1) * STAGE_GAP;
        const height = PAD * 2 + maxStageH + (hasLongEdge ? 48 : 0);

        const nodePos = {};
        stages.forEach((stage, i) => {
            stage.nodes.forEach((node, k) => {
                nodePos[node.id] = { x: nodeX(i), y: nodeY(k), stage: i, idx: k };
            });
        });

        const parts = [];
        parts.push(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}" role="img" aria-label="Dockerfile build pipeline graph">`);
        parts.push('<defs><marker id="dfv-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" class="dfv-arrowhead"/></marker></defs>');

        // Stage boundaries and labels.
        stages.forEach((stage, i) => {
            const x = stageX(i);
            const title = `stage ${i}${stage.name ? ' · ' + stage.name : ''}`;
            parts.push(`<rect class="dfv-stage-box" x="${x}" y="${PAD}" width="${COL_W}" height="${stageHeights[i]}" rx="10"/>`);
            parts.push(`<text class="dfv-stage-label" x="${x + STAGE_PAD}" y="${PAD + 23}">${escapeXml(title.toUpperCase())}</text>`);
        });

        // Merge-suggestion groups (under the nodes so the dashes frame them).
        for (const group of analysis.mergeGroups) {
            const positions = group.nodeIds.map((id) => nodePos[id]);
            const top = positions[0].y;
            const bottom = positions[positions.length - 1].y + NODE_H;
            const x = nodeX(group.stageIndex);
            parts.push(`<g class="dfv-merge-group"><rect class="dfv-merge-rect" x="${x - 5}" y="${top - 5}" width="${nodeW + 10}" height="${bottom - top + 10}" rx="9"/><title>These adjacent RUN instructions each create a filesystem layer — merge them with &amp;&amp; into a single RUN to save layers and space.</title></g>`);
        }

        // Edges between stages.
        for (const edge of analysis.edges) {
            const target = nodePos[edge.toNodeId];
            const srcStage = stages[edge.fromStage];
            const sx = stageX(edge.fromStage) + COL_W;
            const sy = nodeY(srcStage.nodes.length - 1) + NODE_H / 2;
            const tx = target.x;
            const ty = target.y + NODE_H / 2;

            let c1x; let c1y; let c2x; let c2y;
            if (edge.toStage - edge.fromStage > 1) {
                const dipY = PAD + maxStageH + 30;
                c1x = sx + 70; c1y = dipY; c2x = tx - 70; c2y = dipY;
            } else {
                c1x = sx + 44; c1y = sy; c2x = tx - 44; c2y = ty;
            }
            const labelText = edge.kind === 'copy' ? 'COPY --from' : edge.kind === 'mount' ? 'RUN --mount' : 'base image';
            const lx = (sx + 3 * c1x + 3 * c2x + tx) / 8;
            const ly = (sy + 3 * c1y + 3 * c2y + ty) / 8;
            parts.push(`<path class="dfv-edge kind-${edge.kind}" d="M ${sx} ${sy} C ${c1x} ${c1y}, ${c2x} ${c2y}, ${tx} ${ty}" marker-end="url(#dfv-arrow)"/>`);
            parts.push(`<text class="dfv-edge-label" x="${lx}" y="${ly - 5}" text-anchor="middle">${labelText}</text>`);
        }

        // Instruction nodes.
        stages.forEach((stage) => {
            for (const node of stage.nodes) {
                const pos = nodePos[node.id];
                const cacheClass = `cache-${node.cumulative}`;
                const kindClass = node.keyword === 'FROM' ? ' kind-from' : '';
                const worst = node.warnings.some((w) => w.level === 'warn') ? 'warn'
                    : node.warnings.length ? 'info' : null;

                const tooltipLines = [`${node.keyword} ${node.args}`.trim(), `Line ${node.line} · cache: ${['stable', 'changes occasionally', 'volatile'][node.cumulative]}`];
                for (const w of node.warnings) tooltipLines.push((w.level === 'warn' ? '⚠ ' : '· ') + w.message);

                parts.push(`<g class="dfv-nodeg">`);
                parts.push(`<rect class="dfv-node ${cacheClass}${kindClass}" x="${pos.x}" y="${pos.y}" width="${nodeW}" height="${NODE_H}" rx="8"/>`);
                parts.push(`<text class="dfv-node-kw" x="${pos.x + 12}" y="${pos.y + 18}">${escapeXml(node.keyword)}</text>`);
                parts.push(`<text class="dfv-node-args" x="${pos.x + 12}" y="${pos.y + 33}">${escapeXml(shorten(node.args, 38))}</text>`);
                if (worst) {
                    parts.push(`<circle class="dfv-badge ${worst}" cx="${pos.x + nodeW - 4}" cy="${pos.y + 4}" r="8"/>`);
                    parts.push(`<text class="dfv-badge-text" x="${pos.x + nodeW - 4}" y="${pos.y + 7.5}" text-anchor="middle">!</text>`);
                }
                parts.push(`<title>${escapeXml(tooltipLines.join('\n'))}</title>`);
                parts.push('</g>');
            }
        });

        parts.push('</svg>');
        return parts.join('');
    }

    window.DockerfileEngine = { parse, analyze, renderSVG };
})();
