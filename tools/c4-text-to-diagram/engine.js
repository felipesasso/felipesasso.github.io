/**
 * Parses a small C4-flavored DSL and lays it out as an SVG diagram.
 *
 * Supported syntax (one statement per line):
 *   title "Some title"
 *   person <id> "Name" "Description"
 *   person_ext <id> "Name" "Description"
 *   system <id> "Name" "Description"
 *   system_ext <id> "Name" "Description"
 *   container <id> "Name" "Technology" "Description"
 *   container_ext <id> "Name" "Technology" "Description"
 *   component <id> "Name" "Technology" "Description"
 *   component_ext <id> "Name" "Technology" "Description"
 *   boundary "Name" { ...nested elements... }
 *   <idA> -> <idB> "Label" "Technology"
 *
 * Lines starting with # or // are treated as comments.
 */
(function (global) {
    const ELEMENT_RE = /^(person_ext|person|system_ext|system|container_ext|container|component_ext|component)\s+([A-Za-z_][\w-]*)\s*(.*)$/;
    const BOUNDARY_RE = /^boundary\s+(.+?)\s*\{$/;
    const RELATIONSHIP_RE = /^([A-Za-z_][\w-]*)\s*->\s*([A-Za-z_][\w-]*)\s*(.*)$/;
    const TITLE_RE = /^title\s+(.+)$/;

    const VISUAL_KIND = {
        person: 'person',
        person_ext: 'person',
        system: 'internal',
        system_ext: 'external',
        container: 'internal',
        container_ext: 'external',
        component: 'internal',
        component_ext: 'external',
    };

    const KIND_LABELS = {
        person: 'Person',
        person_ext: 'Person (external)',
        system: 'Software System',
        system_ext: 'Software System (external)',
        container: 'Container',
        container_ext: 'Container (external)',
        component: 'Component',
        component_ext: 'Component (external)',
    };

    const HAS_TECHNOLOGY = { container: true, container_ext: true, component: true, component_ext: true };

    const MESSAGES = {
        en: {
            unexpectedClose: (lineNo) => `Line ${lineNo}: unexpected "}" — no boundary is open.`,
            duplicateId: (lineNo, id) => `Line ${lineNo}: "${id}" is declared more than once.`,
            unrecognizedLine: (lineNo, raw) => `Line ${lineNo}: couldn't make sense of "${raw}".`,
            unclosedBoundary: () => 'A "boundary { ... }" block is missing its closing "}".',
            undeclaredFrom: (lineNo, id) => `Line ${lineNo}: "${id}" was never declared.`,
            undeclaredTo: (lineNo, id) => `Line ${lineNo}: "${id}" was never declared.`,
        },
        pt: {
            unexpectedClose: (lineNo) => `Linha ${lineNo}: "}" inesperado — nenhum boundary está aberto.`,
            duplicateId: (lineNo, id) => `Linha ${lineNo}: "${id}" foi declarado mais de uma vez.`,
            unrecognizedLine: (lineNo, raw) => `Linha ${lineNo}: não foi possível interpretar "${raw}".`,
            unclosedBoundary: () => 'Um bloco "boundary { ... }" está sem o "}" de fechamento.',
            undeclaredFrom: (lineNo, id) => `Linha ${lineNo}: "${id}" nunca foi declarado.`,
            undeclaredTo: (lineNo, id) => `Linha ${lineNo}: "${id}" nunca foi declarado.`,
        },
    };

    function getMessages(lang) {
        return MESSAGES[lang] || MESSAGES.en;
    }

    // --- Parsing -----------------------------------------------------------

    function extractQuoted(str) {
        const re = /"((?:[^"\\]|\\.)*)"/g;
        const out = [];
        let m;
        while ((m = re.exec(str))) {
            out.push(m[1].replace(/\\(.)/g, '$1'));
        }
        return out;
    }

    function stripComment(line) {
        // Remove a trailing # or // comment, but not inside quoted strings.
        let inQuotes = false;
        for (let i = 0; i < line.length; i++) {
            const ch = line[i];
            if (ch === '"' && line[i - 1] !== '\\') inQuotes = !inQuotes;
            if (!inQuotes) {
                if (ch === '#') return line.slice(0, i);
                if (ch === '/' && line[i + 1] === '/') return line.slice(0, i);
            }
        }
        return line;
    }

    function parse(source, lang) {
        const messages = getMessages(lang);
        const lines = (source || '').split(/\r?\n/);
        const root = { type: 'boundary', name: null, children: [] };
        const stack = [root];
        const nodesById = {};
        const relationships = [];
        const errors = [];
        let title = '';

        lines.forEach((raw, idx) => {
            const lineNo = idx + 1;
            const line = stripComment(raw).trim();
            if (!line) return;

            if (line === '}') {
                if (stack.length > 1) {
                    stack.pop();
                } else {
                    errors.push(messages.unexpectedClose(lineNo));
                }
                return;
            }

            let m;
            if ((m = line.match(TITLE_RE))) {
                const quoted = extractQuoted(m[1]);
                title = quoted.length ? quoted[0] : m[1].trim();
                return;
            }

            if ((m = line.match(BOUNDARY_RE))) {
                const quoted = extractQuoted(m[1]);
                const boundary = { type: 'boundary', name: quoted[0] || m[1].trim(), children: [] };
                stack[stack.length - 1].children.push(boundary);
                stack.push(boundary);
                return;
            }

            if ((m = line.match(ELEMENT_RE))) {
                const kind = m[1];
                const id = m[2];
                const parts = extractQuoted(m[3]);
                const withTech = !!HAS_TECHNOLOGY[kind];
                const node = {
                    type: 'element',
                    kind,
                    id,
                    name: parts[0] || id,
                    technology: withTech ? (parts[1] || '') : '',
                    description: withTech ? (parts[2] || '') : (parts[1] || ''),
                };
                if (nodesById[id]) {
                    errors.push(messages.duplicateId(lineNo, id));
                } else {
                    nodesById[id] = node;
                }
                stack[stack.length - 1].children.push(node);
                return;
            }

            if ((m = line.match(RELATIONSHIP_RE))) {
                const parts = extractQuoted(m[3]);
                relationships.push({
                    from: m[1],
                    to: m[2],
                    label: parts[0] || '',
                    technology: parts[1] || '',
                    lineNo,
                });
                return;
            }

            errors.push(messages.unrecognizedLine(lineNo, raw.trim()));
        });

        if (stack.length > 1) {
            errors.push(messages.unclosedBoundary());
        }

        relationships.forEach((rel) => {
            if (!nodesById[rel.from]) errors.push(messages.undeclaredFrom(rel.lineNo, rel.from));
            if (!nodesById[rel.to]) errors.push(messages.undeclaredTo(rel.lineNo, rel.to));
        });

        return { title, root, nodesById, relationships, errors };
    }

    // --- Layout --------------------------------------------------------------

    const ELEMENT_W = 220;
    const ELEMENT_H = 138;
    const GAP_X = 56;
    const GAP_Y = 84;
    const BOUNDARY_PAD = 26;
    const BOUNDARY_TITLE_H = 32;
    const MAX_ROW_WIDTH = 1040;
    const CANVAS_MARGIN = 32;

    function packIntoRows(children, maxWidth) {
        const rows = [];
        let row = [];
        let rowWidth = 0;
        children.forEach((child) => {
            const addedWidth = child._w + (row.length ? GAP_X : 0);
            if (row.length && rowWidth + addedWidth > maxWidth) {
                rows.push(row);
                row = [child];
                rowWidth = child._w;
            } else {
                row.push(child);
                rowWidth += addedWidth;
            }
        });
        if (row.length) rows.push(row);
        return rows;
    }

    function measure(node) {
        if (node.type === 'element') {
            node._w = ELEMENT_W;
            node._h = ELEMENT_H;
            return;
        }
        node.children.forEach(measure);
        const rows = packIntoRows(node.children, MAX_ROW_WIDTH);
        node._rows = rows;

        let width = 0;
        let height = 0;
        rows.forEach((row, i) => {
            const rowWidth = row.reduce((sum, c) => sum + c._w, 0) + GAP_X * (row.length - 1);
            const rowHeight = Math.max(...row.map((c) => c._h));
            width = Math.max(width, rowWidth);
            height += rowHeight + (i > 0 ? GAP_Y : 0);
        });

        const isRoot = node.name == null;
        const pad = isRoot ? CANVAS_MARGIN : BOUNDARY_PAD;
        const titleH = isRoot ? 0 : BOUNDARY_TITLE_H;
        node._w = width + pad * 2;
        node._h = height + pad * 2 + titleH;
    }

    function place(node, x, y) {
        node._x = x;
        node._y = y;
        if (node.type === 'element') return;

        const isRoot = node.name == null;
        const pad = isRoot ? CANVAS_MARGIN : BOUNDARY_PAD;
        const titleH = isRoot ? 0 : BOUNDARY_TITLE_H;

        let cursorY = y + pad + titleH;
        node._rows.forEach((row) => {
            const rowHeight = Math.max(...row.map((c) => c._h));
            let cursorX = x + pad;
            row.forEach((child) => {
                place(child, cursorX, cursorY + (rowHeight - child._h) / 2);
                cursorX += child._w + GAP_X;
            });
            cursorY += rowHeight + GAP_Y;
        });
    }

    function layout(parsed) {
        // An empty diagram still needs a sane canvas size.
        if (!parsed.root.children.length) {
            parsed.root._w = 320;
            parsed.root._h = 160;
            parsed.root._x = 0;
            parsed.root._y = 0;
            parsed.root._rows = [];
            return { width: parsed.root._w, height: parsed.root._h };
        }
        measure(parsed.root);
        place(parsed.root, 0, 0);
        return { width: parsed.root._w, height: parsed.root._h };
    }

    // --- Rendering -----------------------------------------------------------

    function escapeXml(str) {
        return String(str == null ? '' : str).replace(/[&<>"']/g, (ch) => ({
            '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
        })[ch]);
    }

    function wrapText(text, maxChars, maxLines) {
        if (!text) return [];
        const words = text.split(/\s+/);
        const lines = [];
        let line = '';
        words.forEach((word) => {
            const candidate = line ? `${line} ${word}` : word;
            if (line && candidate.length > maxChars) {
                lines.push(line);
                line = word;
            } else {
                line = candidate;
            }
        });
        if (line) lines.push(line);

        if (lines.length > maxLines) {
            const visible = lines.slice(0, maxLines);
            visible[maxLines - 1] = visible[maxLines - 1].replace(/\s*\S*$/, '') + '…';
            return visible;
        }
        return lines;
    }

    function renderElement(node) {
        const visual = VISUAL_KIND[node.kind] || 'internal';
        const { _x: x, _y: y, _w: w, _h: h } = node;
        const cx = x + w / 2;
        const parts = [`<g class="c4-element">`, `<rect class="c4-box kind-${visual}" x="${x}" y="${y}" width="${w}" height="${h}" rx="8" />`];

        let textY;
        if (visual === 'person') {
            const headCx = cx;
            const headCy = y + 26;
            parts.push(`<circle class="c4-person-glyph" cx="${headCx}" cy="${headCy}" r="10" />`);
            parts.push(`<path class="c4-person-glyph" d="M ${headCx - 17} ${headCy + 28} a17 16 0 0 1 34 0 Z" />`);
            textY = y + 64;
        } else {
            textY = y + 30;
        }

        parts.push(`<text class="c4-box-name" x="${cx}" y="${textY}" text-anchor="middle">${escapeXml(node.name)}</text>`);
        textY += 17;

        const meta = [KIND_LABELS[node.kind], node.technology].filter(Boolean).join(' · ');
        if (meta) {
            parts.push(`<text class="c4-box-meta" x="${cx}" y="${textY}" text-anchor="middle">[${escapeXml(meta)}]</text>`);
            textY += 16;
        } else {
            textY += 4;
        }

        wrapText(node.description, 30, 3).forEach((line) => {
            parts.push(`<text class="c4-box-desc" x="${cx}" y="${textY}" text-anchor="middle">${escapeXml(line)}</text>`);
            textY += 14;
        });

        parts.push('</g>');
        return parts.join('');
    }

    function renderBoundary(node) {
        const parts = [];
        if (node.name != null) {
            parts.push(`<rect class="c4-boundary-box" x="${node._x}" y="${node._y}" width="${node._w}" height="${node._h}" rx="12" />`);
            parts.push(`<text class="c4-boundary-label" x="${node._x + 18}" y="${node._y + 22}">${escapeXml(node.name).toUpperCase()}</text>`);
        }
        node.children.forEach((child) => {
            parts.push(child.type === 'element' ? renderElement(child) : renderBoundary(child));
        });
        return parts.join('');
    }

    function clipToRect(fromX, fromY, toX, toY, rect) {
        const dx = toX - fromX;
        const dy = toY - fromY;
        if (dx === 0 && dy === 0) return { x: fromX, y: fromY };
        const halfW = rect.w / 2;
        const halfH = rect.h / 2;
        let scale = Infinity;
        if (dx !== 0) scale = Math.min(scale, Math.abs(halfW / dx));
        if (dy !== 0) scale = Math.min(scale, Math.abs(halfH / dy));
        return { x: fromX + dx * scale, y: fromY + dy * scale };
    }

    function renderRelationships(relationships, nodesById) {
        const lines = [];
        const labels = [];
        // Returned separately so callers can paint labels above element boxes —
        // otherwise a label that lands near a box gets clipped by it.

        relationships.forEach((rel, i) => {
            const from = nodesById[rel.from];
            const to = nodesById[rel.to];
            if (!from || !to) return;

            const fromCenter = { x: from._x + from._w / 2, y: from._y + from._h / 2 };
            const toCenter = { x: to._x + to._w / 2, y: to._y + to._h / 2 };
            const start = clipToRect(fromCenter.x, fromCenter.y, toCenter.x, toCenter.y, { w: from._w, h: from._h });
            const end = clipToRect(toCenter.x, toCenter.y, fromCenter.x, fromCenter.y, { w: to._w, h: to._h });

            lines.push(`<line class="c4-rel-line" marker-end="url(#c4-arrowhead)" x1="${start.x.toFixed(1)}" y1="${start.y.toFixed(1)}" x2="${end.x.toFixed(1)}" y2="${end.y.toFixed(1)}" />`);

            const lineTexts = wrapText(rel.label, 30, 2);
            if (rel.technology) lineTexts.push(`[${rel.technology}]`);
            if (!lineTexts.length) return;

            // Stagger labels along their line (rather than always centering them)
            // so that two parallel relationships sharing an element don't both
            // drop their label in the same spot.
            const t = 0.5 + (i % 2 === 0 ? -0.16 : 0.16);
            const midX = start.x + (end.x - start.x) * t;
            const midY = start.y + (end.y - start.y) * t;
            const longest = Math.max(...lineTexts.map((t) => t.length));
            const boxW = Math.min(Math.max(longest * 6.1 + 18, 56), 230);
            const boxH = lineTexts.length * 14 + 12;

            labels.push(`<rect class="c4-rel-label-bg" x="${(midX - boxW / 2).toFixed(1)}" y="${(midY - boxH / 2).toFixed(1)}" width="${boxW.toFixed(1)}" height="${boxH}" rx="4" />`);
            let ly = midY - boxH / 2 + 14;
            lineTexts.forEach((t) => {
                labels.push(`<text class="c4-rel-label" x="${midX.toFixed(1)}" y="${ly.toFixed(1)}" text-anchor="middle">${escapeXml(t)}</text>`);
                ly += 14;
            });
        });

        return { lines: lines.join(''), labels: labels.join('') };
    }

    function renderSvg(parsed, dims) {
        const w = Math.max(dims.width, 1);
        const h = Math.max(dims.height, 1);
        const rel = renderRelationships(parsed.relationships, parsed.nodesById);
        return `
            <svg viewBox="0 0 ${w} ${h}" width="${w}" height="${h}" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="${escapeXml(parsed.title || 'C4 diagram')}">
                <defs>
                    <marker id="c4-arrowhead" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7.5" markerHeight="7.5" orient="auto-start-reverse">
                        <path class="c4-arrowhead" d="M 0 0 L 10 5 L 0 10 z" />
                    </marker>
                </defs>
                <g class="c4-rel-lines">${rel.lines}</g>
                <g class="c4-boxes">${renderBoundary(parsed.root)}</g>
                <g class="c4-rel-labels">${rel.labels}</g>
            </svg>
        `;
    }

    function render(source, lang) {
        const parsed = parse(source, lang);
        const dims = layout(parsed);
        const svg = renderSvg(parsed, dims);
        const kindsUsed = new Set();
        Object.keys(parsed.nodesById).forEach((id) => kindsUsed.add(VISUAL_KIND[parsed.nodesById[id].kind]));
        return { parsed, dims, svg, kindsUsed };
    }

    global.C4Engine = { parse, layout, renderSvg, render, KIND_LABELS, VISUAL_KIND };
})(window);
