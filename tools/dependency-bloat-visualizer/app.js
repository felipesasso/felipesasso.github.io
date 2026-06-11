(function () {
    'use strict';

    var $ = function (id) { return document.getElementById(id); };

    var currentLanguage = 'en';

    var APP_TRANSLATIONS = {
        en: {
            statTotalSize: 'Total size',
            statInstalledPackages: 'Installed packages',
            sourceLine: function (source) { return 'Source: ' + source; },
            sourceBytesNote: ' — squares are sized by bytes.',
            sourcePkgNote: ' — squares are sized by transitive dependency count (lockfiles carry no size info).',
            sourceFetchedNote: function (covered) { return ' Sizes fetched from the npm registry for ' + covered + ' packages (unpacked size).'; },
            coverageOf: function (covered, total) { return covered + ' of ' + total; },

            noDuplicates: 'No duplicated libraries found — every package resolves to a single copy. Nice.',
            dupCopies: function (n) { return n === 1 ? '1 copy' : n + ' copies'; },
            dupExtra: function (waste) { return ' · ~' + waste + ' extra'; },
            andMore: function (n) { return '…and ' + n + ' more.'; },

            heaviestEmpty: 'Nothing to show.',

            unitPkg: '1 pkg',
            unitPkgs: function (n) { return Math.round(n) + ' pkgs'; },
            unitBytes: function (s) { return s; },

            tagShared: 'shared — counted where it was first installed',
            tagDev: 'dev dependency',
            badgeShared: 'shared',
            badgeDev: 'dev',
            directChild: function (n) { return n + (n === 1 ? ' direct child' : ' direct children'); },
            ofTotal: function (pct) { return pct + ' of total'; },
            noOwnDeps: 'No dependencies of its own.',
            andMoreCount: function (n) { return '…and ' + n + ' more'; },

            fileTooLarge: 'That file is over 60 MB — too large to parse in the browser.',
            couldNotRead: 'Could not read the file.',

            fetchingSizes: function (done, total, failedSuffix) { return 'Fetching sizes… ' + done + '/' + total + failedSuffix; },
            failedSuffix: function (failed) { return failed ? ' (' + failed + ' unavailable)' : ''; },
            registryUnreachable: "Couldn't reach the npm registry — keeping dependency counts.",

            // Parser error messages, keyed by the `code` thrown in parsers.js.
            errors: {
                noModulesArray: 'No "modules" array found in this stats file. Re-run webpack with `--json` or `stats: { modules: true }`.',
                invalidJson: function (detail) { return 'This looks like JSON but failed to parse: ' + detail; },
                looksLikePackageJson: 'This looks like a package.json — it only lists direct dependencies. Drop a package-lock.json or yarn.lock instead.',
                unrecognisedJson: 'Unrecognised JSON. Supported: package-lock.json, webpack stats.json, esbuild metafile, rollup/vite visualizer JSON.',
                pnpmNotSupported: 'pnpm-lock.yaml is not supported yet. Try package-lock.json, yarn.lock, or a bundler stats file.',
                unrecognisedFormat: 'Unrecognised file format. Supported: package-lock.json, yarn.lock, webpack stats.json, esbuild metafile, rollup/vite visualizer JSON.',
            },
        },
        pt: {
            statTotalSize: 'Tamanho total',
            statInstalledPackages: 'Pacotes instalados',
            sourceLine: function (source) { return 'Fonte: ' + source; },
            sourceBytesNote: ' — os quadrados são dimensionados por bytes.',
            sourcePkgNote: ' — os quadrados são dimensionados pela contagem de dependências transitivas (lockfiles não trazem informação de tamanho).',
            sourceFetchedNote: function (covered) { return ' Tamanhos buscados no registro do npm para ' + covered + ' pacotes (tamanho descompactado).'; },
            coverageOf: function (covered, total) { return covered + ' de ' + total; },

            noDuplicates: 'Nenhuma biblioteca duplicada encontrada — todo pacote resolve para uma única cópia. Muito bom.',
            dupCopies: function (n) { return n === 1 ? '1 cópia' : n + ' cópias'; },
            dupExtra: function (waste) { return ' · ~' + waste + ' a mais'; },
            andMore: function (n) { return '…e mais ' + n + '.'; },

            heaviestEmpty: 'Nada para mostrar.',

            unitPkg: '1 pacote',
            unitPkgs: function (n) { return Math.round(n) + ' pacotes'; },
            unitBytes: function (s) { return s; },

            tagShared: 'compartilhado — contado onde foi instalado pela primeira vez',
            tagDev: 'dependência de desenvolvimento',
            badgeShared: 'compartilhado',
            badgeDev: 'dev',
            directChild: function (n) { return n + (n === 1 ? ' filho direto' : ' filhos diretos'); },
            ofTotal: function (pct) { return pct + ' do total'; },
            noOwnDeps: 'Sem dependências próprias.',
            andMoreCount: function (n) { return '…e mais ' + n; },

            fileTooLarge: 'Esse arquivo tem mais de 60 MB — muito grande para processar no navegador.',
            couldNotRead: 'Não foi possível ler o arquivo.',

            fetchingSizes: function (done, total, failedSuffix) { return 'Buscando tamanhos… ' + done + '/' + total + failedSuffix; },
            failedSuffix: function (failed) { return failed ? ' (' + failed + ' indisponíveis)' : ''; },
            registryUnreachable: 'Não foi possível acessar o registro do npm — mantendo as contagens de dependências.',

            errors: {
                noModulesArray: 'Nenhum array "modules" encontrado neste arquivo de stats. Rode o webpack novamente com `--json` ou `stats: { modules: true }`.',
                invalidJson: function (detail) { return 'Isso parece JSON, mas falhou ao processar: ' + detail; },
                looksLikePackageJson: 'Isso parece um package.json — ele lista apenas as dependências diretas. Solte um package-lock.json ou yarn.lock.',
                unrecognisedJson: 'JSON não reconhecido. Suportados: package-lock.json, webpack stats.json, esbuild metafile, rollup/vite visualizer JSON.',
                pnpmNotSupported: 'pnpm-lock.yaml ainda não é suportado. Tente package-lock.json, yarn.lock, ou um arquivo de stats do bundler.',
                unrecognisedFormat: 'Formato de arquivo não reconhecido. Suportados: package-lock.json, yarn.lock, webpack stats.json, esbuild metafile, rollup/vite visualizer JSON.',
            },
        },
    };

    function t(key) {
        var dict = APP_TRANSLATIONS[currentLanguage] || APP_TRANSLATIONS.en;
        return dict[key] !== undefined ? dict[key] : APP_TRANSLATIONS.en[key];
    }

    function pick(item, field) {
        if (currentLanguage === 'pt' && item[field + '_pt'] !== undefined) {
            return item[field + '_pt'];
        }
        return item[field];
    }

    var state = {
        root: null,
        meta: null,
        zoom: null,
        bytesMode: false,
        highlightName: null,
        duplicates: [],
        sizeCoverage: null,
    };

    var treemap = new BloatTreemap.Treemap($('bloat-svg'), {
        onZoom: function (node) { zoomTo(node); },
        onSelect: function (node) { showDetails(node); },
        onHover: handleHover,
    });

    /* ------------------------------------------------------------------ *
     * Tree bookkeeping
     * ------------------------------------------------------------------ */

    function finalize(root) {
        (function walk(node, parent) {
            node.parent = parent;
            var value = node.self;
            node.children.forEach(function (c) {
                walk(c, node);
                value += c.value;
            });
            node.value = value;
        })(root, null);
    }

    function pathOf(node) {
        var parts = [];
        for (var n = node; n; n = n.parent) parts.unshift(n.name);
        return parts.join(' › ');
    }

    function eachNode(root, fn) {
        (function walk(node) {
            fn(node);
            node.children.forEach(walk);
        })(root);
    }

    function isPackageNode(node) {
        return node.kind === 'pkg' || (node.version && node.kind !== 'root');
    }

    function findDuplicates(root) {
        // name -> Map(instanceKey -> { nodes, weight }); a library is duplicated
        // when it exists as more than one physical copy (distinct versions in a
        // lockfile, or distinct tree locations in a bundle).
        var byName = new Map();
        eachNode(root, function (node) {
            if (!isPackageNode(node) || node.deduped) return;
            var key = node.version || pathOf(node);
            if (!byName.has(node.name)) byName.set(node.name, new Map());
            var versions = byName.get(node.name);
            if (!versions.has(key)) versions.set(key, { label: node.version || pathOf(node.parent || node), nodes: [] });
            versions.get(key).nodes.push(node);
        });

        var dups = [];
        byName.forEach(function (versions, name) {
            if (versions.size < 2) return;
            var instances = [];
            var weights = [];
            versions.forEach(function (v) {
                var w = v.nodes.reduce(function (s, n) { return s + n.value; }, 0);
                instances.push({ label: v.label, nodes: v.nodes, weight: w });
                weights.push(w);
            });
            instances.sort(function (a, b) { return b.weight - a.weight; });
            var total = weights.reduce(function (s, w) { return s + w; }, 0);
            var waste = total - Math.max.apply(null, weights);
            dups.push({ name: name, instances: instances, waste: waste, total: total });
        });
        dups.sort(function (a, b) { return b.waste - a.waste || b.total - a.total; });
        return dups;
    }

    function countPackages(root) {
        var total = 0;
        var unique = new Set();
        eachNode(root, function (node) {
            if (!isPackageNode(node)) return;
            if (!node.deduped) total++;
            unique.add(node.name);
        });
        return { total: total, unique: unique.size };
    }

    /* ------------------------------------------------------------------ *
     * Formatting
     * ------------------------------------------------------------------ */

    function formatBytes(n) {
        if (n >= 1024 * 1024) return (n / (1024 * 1024)).toFixed(2) + ' MB';
        if (n >= 1024) return (n / 1024).toFixed(1) + ' KB';
        return Math.round(n) + ' B';
    }

    function formatWeight(n) {
        if (state.bytesMode) return formatBytes(n);
        return n === 1 ? t('unitPkg') : t('unitPkgs')(n);
    }

    function pct(part, whole) {
        if (!whole) return '0%';
        var p = (part / whole) * 100;
        return (p >= 10 ? Math.round(p) : p.toFixed(1)) + '%';
    }

    function esc(s) {
        return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
    }

    /* ------------------------------------------------------------------ *
     * Loading files
     * ------------------------------------------------------------------ */

    function loadText(filename, text) {
        var result;
        try {
            result = BloatParsers.parse(filename, text);
        } catch (e) {
            showError(translateParseError(e));
            return;
        }
        $('bloat-error').classList.add('is-hidden');
        state.root = result.root;
        state.meta = result.meta;
        state.bytesMode = result.meta.sizeIsBytes;
        state.highlightName = null;
        state.sizeCoverage = null;
        finalize(state.root);
        state.duplicates = findDuplicates(state.root);
        state.zoom = state.root;
        $('bloat-results').classList.remove('is-hidden');
        $('bloat-fetch-sizes').classList.toggle('is-hidden', !result.meta.canFetchSizes);
        $('bloat-fetch-sizes').disabled = false;
        $('bloat-fetch-status').textContent = '';
        $('bloat-details').classList.add('is-hidden');
        treemap.setHighlight(null);
        renderAll();
        $('bloat-results').scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    function showError(message) {
        var box = $('bloat-error');
        box.textContent = message;
        box.classList.remove('is-hidden');
    }

    // Maps an error thrown by BloatParsers.parse() to a translated message,
    // using the `code` set on the error (see parsers.js); falls back to the
    // error's own (English) message for unexpected errors.
    function translateParseError(e) {
        var errors = t('errors');
        var entry = e && e.code ? errors[e.code] : null;
        if (typeof entry === 'function') return entry(e.detail);
        if (typeof entry === 'string') return entry;
        return e.message;
    }

    function handleFile(file) {
        if (!file) return;
        if (file.size > 60 * 1024 * 1024) {
            showError(t('fileTooLarge'));
            return;
        }
        var reader = new FileReader();
        reader.onload = function () { loadText(file.name, reader.result); };
        reader.onerror = function () { showError(t('couldNotRead')); };
        reader.readAsText(file);
    }

    /* ------------------------------------------------------------------ *
     * Rendering
     * ------------------------------------------------------------------ */

    function renderAll() {
        renderStats();
        renderBreadcrumb();
        treemap.render(state.zoom);
        renderDuplicates();
        renderHeaviest();
    }

    function renderStats() {
        var counts = countPackages(state.root);
        $('stat-total').textContent = counts.total;
        $('stat-unique').textContent = counts.unique;
        $('stat-dups').textContent = state.duplicates.length;
        $('stat-dups').classList.toggle('is-warn', state.duplicates.length > 0);
        $('stat-weight').textContent = state.bytesMode ? formatBytes(state.root.value) : t('unitPkgs')(counts.total);
        $('stat-weight-label').textContent = state.bytesMode ? t('statTotalSize') : t('statInstalledPackages');
        var srcLine = t('sourceLine')(state.meta.source) +
            (state.bytesMode ? t('sourceBytesNote') : t('sourcePkgNote'));
        if (state.sizeCoverage) srcLine += t('sourceFetchedNote')(t('coverageOf')(state.sizeCoverage.covered, state.sizeCoverage.total));
        $('bloat-source').textContent = srcLine;
    }

    function renderBreadcrumb() {
        var crumbs = [];
        for (var n = state.zoom; n; n = n.parent) crumbs.unshift(n);
        var html = crumbs.map(function (node, i) {
            var label = esc(node.name) + (node.version ? ' <span class="bloat-crumb-ver">' + esc(node.version) + '</span>' : '');
            if (i === crumbs.length - 1) return '<span class="bloat-crumb is-current">' + label + '</span>';
            return '<button type="button" class="bloat-crumb" data-crumb="' + i + '">' + label + '</button>';
        }).join('<span class="bloat-crumb-sep">›</span>');
        $('bloat-breadcrumb').innerHTML = html;
        $('bloat-breadcrumb').querySelectorAll('[data-crumb]').forEach(function (btn) {
            btn.addEventListener('click', function () {
                zoomTo(crumbs[parseInt(btn.getAttribute('data-crumb'), 10)]);
            });
        });
        $('bloat-up').disabled = !state.zoom.parent;
    }

    function zoomTo(node) {
        if (!node || !node.children.length) return;
        state.zoom = node;
        renderBreadcrumb();
        treemap.render(state.zoom);
        showDetails(node);
    }

    function renderDuplicates() {
        var list = $('bloat-dups');
        if (!state.duplicates.length) {
            list.innerHTML = '<p class="bloat-muted">' + esc(t('noDuplicates')) + '</p>';
            return;
        }
        list.innerHTML = state.duplicates.slice(0, 30).map(function (d, i) {
            var versions = d.instances.map(function (inst) {
                return '<span class="bloat-dup-ver">' + esc(inst.label) + ' <em>(' + formatWeight(inst.weight) + ')</em></span>';
            }).join('');
            var active = state.highlightName === d.name ? ' is-active' : '';
            return '<button type="button" class="bloat-dup' + active + '" data-dup="' + i + '">' +
                '<span class="bloat-dup-head"><strong>' + esc(d.name) + '</strong>' +
                '<span class="bloat-dup-waste">' + esc(t('dupCopies')(d.instances.length)) + esc(t('dupExtra')(formatWeight(d.waste))) + '</span></span>' +
                '<span class="bloat-dup-vers">' + versions + '</span>' +
                '</button>';
        }).join('');
        if (state.duplicates.length > 30) {
            list.innerHTML += '<p class="bloat-muted">' + esc(t('andMore')(state.duplicates.length - 30)) + '</p>';
        }
        list.querySelectorAll('[data-dup]').forEach(function (btn) {
            btn.addEventListener('click', function () {
                var d = state.duplicates[parseInt(btn.getAttribute('data-dup'), 10)];
                toggleHighlight(d.name);
            });
        });
    }

    function toggleHighlight(name) {
        state.highlightName = state.highlightName === name ? null : name;
        if (state.highlightName) {
            treemap.setHighlight(function (node) {
                for (var n = node; n; n = n.parent) if (n.name === state.highlightName && isPackageNode(n)) return true;
                return node.name === state.highlightName;
            });
        } else {
            treemap.setHighlight(null);
        }
        renderDuplicates();
        if (state.highlightName) $('bloat-treemap-wrap').scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }

    function renderHeaviest() {
        var nodes = [];
        eachNode(state.root, function (node) {
            if (isPackageNode(node) && !node.deduped) nodes.push(node);
        });
        nodes.sort(function (a, b) { return b.value - a.value; });
        $('bloat-heaviest').innerHTML = nodes.slice(0, 10).map(function (n) {
            return '<li><span class="bloat-heavy-name">' + esc(n.name) + (n.version ? ' <em>' + esc(n.version) + '</em>' : '') + (n.dev ? ' <span class="bloat-badge">' + esc(t('badgeDev')) + '</span>' : '') + '</span>' +
                '<span class="bloat-heavy-size">' + formatWeight(n.value) + ' · ' + pct(n.value, state.root.value) + '</span></li>';
        }).join('') || '<li class="bloat-muted">' + esc(t('heaviestEmpty')) + '</li>';
    }

    /* ------------------------------------------------------------------ *
     * Tooltip + details
     * ------------------------------------------------------------------ */

    var tooltip = $('bloat-tooltip');

    function handleHover(node, ev) {
        if (!node) {
            tooltip.classList.add('is-hidden');
            return;
        }
        var rows = ['<strong>' + esc(node.name) + (node.version ? ' ' + esc(node.version) : '') + '</strong>'];
        rows.push(formatWeight(node.value) + ' · ' + esc(t('ofTotal')(pct(node.value, state.root.value))));
        if (node.deduped) rows.push('<em>' + esc(t('tagShared')) + '</em>');
        if (node.dev) rows.push('<em>' + esc(t('tagDev')) + '</em>');
        var dirKids = node.children.length;
        if (dirKids) rows.push(esc(t('directChild')(dirKids)));
        rows.push('<span class="bloat-tip-path">' + esc(pathOf(node)) + '</span>');
        tooltip.innerHTML = rows.join('<br>');
        tooltip.classList.remove('is-hidden');
        var pad = 14;
        var tw = tooltip.offsetWidth;
        var x = ev.clientX + pad;
        if (x + tw > window.innerWidth - 8) x = ev.clientX - tw - pad;
        tooltip.style.left = x + 'px';
        tooltip.style.top = Math.min(ev.clientY + pad, window.innerHeight - tooltip.offsetHeight - 8) + 'px';
    }

    function showDetails(node) {
        var box = $('bloat-details');
        box.classList.remove('is-hidden');
        var kids = node.children.slice().sort(function (a, b) { return b.value - a.value; });
        var kidHtml = kids.slice(0, 25).map(function (c) {
            return '<li>' + esc(c.name) + (c.version ? ' <em>' + esc(c.version) + '</em>' : '') +
                (c.deduped ? ' <span class="bloat-badge">' + esc(t('badgeShared')) + '</span>' : '') +
                ' — ' + formatWeight(c.value) + '</li>';
        }).join('');
        if (kids.length > 25) kidHtml += '<li class="bloat-muted">' + esc(t('andMoreCount')(kids.length - 25)) + '</li>';
        box.innerHTML = '<h3>' + esc(node.name) + (node.version ? ' <em>' + esc(node.version) + '</em>' : '') +
            (node.dev ? ' <span class="bloat-badge">' + esc(t('badgeDev')) + '</span>' : '') + '</h3>' +
            '<p>' + formatWeight(node.value) + ' (' + esc(t('ofTotal')(pct(node.value, state.root.value))) + ') · ' + esc(pathOf(node)) + '</p>' +
            (kids.length ? '<ul>' + kidHtml + '</ul>' : '<p class="bloat-muted">' + esc(t('noOwnDeps')) + '</p>');
    }

    /* ------------------------------------------------------------------ *
     * Optional: fetch real unpacked sizes from the npm registry
     * ------------------------------------------------------------------ */

    var CACHE_KEY = 'bloat-npm-size-cache-v1';

    function loadCache() {
        try { return JSON.parse(localStorage.getItem(CACHE_KEY)) || {}; } catch (e) { return {}; }
    }

    function saveCache(cache) {
        try { localStorage.setItem(CACHE_KEY, JSON.stringify(cache)); } catch (e) { /* quota — fine */ }
    }

    function fetchSizes() {
        var btn = $('bloat-fetch-sizes');
        var status = $('bloat-fetch-status');
        var wanted = new Map(); // "name@version" -> {name, version}
        eachNode(state.root, function (node) {
            if (!isPackageNode(node) || node.deduped || !node.version) return;
            if (!/^\d/.test(node.version)) return; // skip file:/link:/workspace versions
            wanted.set(node.name + '@' + node.version, { name: node.name, version: node.version });
        });
        var specs = Array.from(wanted.values());
        if (!specs.length) return;

        btn.disabled = true;
        var cache = loadCache();
        var sizes = {};
        var done = 0;
        var failed = 0;
        var queue = specs.slice();

        function update() {
            status.textContent = t('fetchingSizes')(done, specs.length, t('failedSuffix')(failed));
        }

        function worker() {
            if (!queue.length) return Promise.resolve();
            var spec = queue.shift();
            var key = spec.name + '@' + spec.version;
            var p;
            if (typeof cache[key] === 'number') {
                p = Promise.resolve(cache[key]);
            } else {
                p = fetch('https://registry.npmjs.org/' + encodeURIComponent(spec.name) + '/' + encodeURIComponent(spec.version))
                    .then(function (r) { return r.ok ? r.json() : null; })
                    .then(function (json) {
                        var size = json && json.dist && json.dist.unpackedSize;
                        return typeof size === 'number' ? size : -1;
                    })
                    .catch(function () { return -1; });
            }
            return p.then(function (size) {
                if (size >= 0) {
                    cache[key] = size;
                    sizes[key] = size;
                } else failed++;
                done++;
                if (done % 10 === 0) update();
                return worker();
            });
        }

        update();
        var workers = [];
        for (var i = 0; i < 8; i++) workers.push(worker());
        Promise.all(workers).then(function () {
            saveCache(cache);
            var covered = specs.length - failed;
            if (!covered) {
                // Nothing came back (offline, ad-blocker, registry down) —
                // stay in package-count mode instead of showing 0 B everywhere.
                status.textContent = t('registryUnreachable');
                btn.disabled = false;
                return;
            }
            applySizes(sizes);
            state.sizeCoverage = { covered: covered, total: specs.length };
            status.textContent = '';
            btn.classList.add('is-hidden');
            renderAll();
        });
    }

    function applySizes(sizes) {
        eachNode(state.root, function (node) {
            if (!isPackageNode(node)) { node.self = 0; return; }
            if (node.deduped) { node.self = 0; return; }
            var size = sizes[node.name + '@' + node.version];
            node.self = typeof size === 'number' ? size : 0;
        });
        state.bytesMode = true;
        finalize(state.root);
        state.duplicates = findDuplicates(state.root);
    }

    /* ------------------------------------------------------------------ *
     * Wiring
     * ------------------------------------------------------------------ */

    var dropzone = $('bloat-dropzone');

    ['dragover', 'drop'].forEach(function (evt) {
        window.addEventListener(evt, function (e) { e.preventDefault(); });
    });
    dropzone.addEventListener('dragover', function (e) {
        e.preventDefault();
        dropzone.classList.add('is-over');
    });
    dropzone.addEventListener('dragleave', function () { dropzone.classList.remove('is-over'); });
    dropzone.addEventListener('drop', function (e) {
        e.preventDefault();
        dropzone.classList.remove('is-over');
        if (e.dataTransfer.files && e.dataTransfer.files.length) handleFile(e.dataTransfer.files[0]);
    });
    dropzone.addEventListener('click', function () { $('bloat-file').click(); });
    dropzone.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); $('bloat-file').click(); }
    });
    $('bloat-file').addEventListener('change', function () {
        handleFile(this.files[0]);
        this.value = '';
    });
    $('bloat-sample').addEventListener('click', function (e) {
        e.stopPropagation();
        loadText('package-lock.json', JSON.stringify(window.BLOAT_SAMPLE_LOCK));
    });
    $('bloat-up').addEventListener('click', function () {
        if (state.zoom && state.zoom.parent) zoomTo(state.zoom.parent);
    });
    $('bloat-svg').addEventListener('dblclick', function () {
        if (state.zoom && state.zoom.parent) zoomTo(state.zoom.parent);
    });
    document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape' && state.zoom && state.zoom.parent) zoomTo(state.zoom.parent);
    });
    $('bloat-fetch-sizes').addEventListener('click', fetchSizes);

    var resizeTimer = null;
    window.addEventListener('resize', function () {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(function () {
            if (state.zoom) treemap.render(state.zoom);
        }, 150);
    });
    // Treemap colors depend on the theme; re-render when it flips.
    new MutationObserver(function () {
        if (state.zoom) treemap.render(state.zoom);
    }).observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });

    window.dbvSetLanguage = function (lang) {
        currentLanguage = lang === 'pt' ? 'pt' : 'en';
        if (!state.root) return;
        renderAll();
        if (!$('bloat-details').classList.contains('is-hidden') && state.zoom) {
            showDetails(state.zoom);
        }
    };
})();
