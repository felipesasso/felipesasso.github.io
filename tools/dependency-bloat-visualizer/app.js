(function () {
    'use strict';

    var $ = function (id) { return document.getElementById(id); };

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
        return n === 1 ? '1 pkg' : Math.round(n) + ' pkgs';
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
            showError(e.message);
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

    function handleFile(file) {
        if (!file) return;
        if (file.size > 60 * 1024 * 1024) {
            showError('That file is over 60 MB — too large to parse in the browser.');
            return;
        }
        var reader = new FileReader();
        reader.onload = function () { loadText(file.name, reader.result); };
        reader.onerror = function () { showError('Could not read the file.'); };
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
        $('stat-weight').textContent = state.bytesMode ? formatBytes(state.root.value) : counts.total + ' pkgs';
        $('stat-weight-label').textContent = state.bytesMode ? 'Total size' : 'Installed packages';
        var srcLine = 'Source: ' + state.meta.source +
            (state.bytesMode ? ' — squares are sized by bytes.' : ' — squares are sized by transitive dependency count (lockfiles carry no size info).');
        if (state.sizeCoverage) srcLine += ' Sizes fetched from the npm registry for ' + state.sizeCoverage + ' packages (unpacked size).';
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
            list.innerHTML = '<p class="bloat-muted">No duplicated libraries found — every package resolves to a single copy. Nice.</p>';
            return;
        }
        list.innerHTML = state.duplicates.slice(0, 30).map(function (d, i) {
            var versions = d.instances.map(function (inst) {
                return '<span class="bloat-dup-ver">' + esc(inst.label) + ' <em>(' + formatWeight(inst.weight) + ')</em></span>';
            }).join('');
            var active = state.highlightName === d.name ? ' is-active' : '';
            return '<button type="button" class="bloat-dup' + active + '" data-dup="' + i + '">' +
                '<span class="bloat-dup-head"><strong>' + esc(d.name) + '</strong>' +
                '<span class="bloat-dup-waste">' + d.instances.length + ' copies · ~' + formatWeight(d.waste) + ' extra</span></span>' +
                '<span class="bloat-dup-vers">' + versions + '</span>' +
                '</button>';
        }).join('');
        if (state.duplicates.length > 30) {
            list.innerHTML += '<p class="bloat-muted">…and ' + (state.duplicates.length - 30) + ' more.</p>';
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
            return '<li><span class="bloat-heavy-name">' + esc(n.name) + (n.version ? ' <em>' + esc(n.version) + '</em>' : '') + (n.dev ? ' <span class="bloat-badge">dev</span>' : '') + '</span>' +
                '<span class="bloat-heavy-size">' + formatWeight(n.value) + ' · ' + pct(n.value, state.root.value) + '</span></li>';
        }).join('') || '<li class="bloat-muted">Nothing to show.</li>';
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
        rows.push(formatWeight(node.value) + ' · ' + pct(node.value, state.root.value) + ' of total');
        if (node.deduped) rows.push('<em>shared — counted where it was first installed</em>');
        if (node.dev) rows.push('<em>dev dependency</em>');
        var dirKids = node.children.length;
        if (dirKids) rows.push(dirKids + (dirKids === 1 ? ' direct child' : ' direct children'));
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
                (c.deduped ? ' <span class="bloat-badge">shared</span>' : '') +
                ' — ' + formatWeight(c.value) + '</li>';
        }).join('');
        if (kids.length > 25) kidHtml += '<li class="bloat-muted">…and ' + (kids.length - 25) + ' more</li>';
        box.innerHTML = '<h3>' + esc(node.name) + (node.version ? ' <em>' + esc(node.version) + '</em>' : '') +
            (node.dev ? ' <span class="bloat-badge">dev</span>' : '') + '</h3>' +
            '<p>' + formatWeight(node.value) + ' (' + pct(node.value, state.root.value) + ' of total) · ' + esc(pathOf(node)) + '</p>' +
            (kids.length ? '<ul>' + kidHtml + '</ul>' : '<p class="bloat-muted">No dependencies of its own.</p>');
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
            status.textContent = 'Fetching sizes… ' + done + '/' + specs.length + (failed ? ' (' + failed + ' unavailable)' : '');
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
                status.textContent = 'Couldn’t reach the npm registry — keeping dependency counts.';
                btn.disabled = false;
                return;
            }
            applySizes(sizes);
            state.sizeCoverage = covered + ' of ' + specs.length;
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
})();
