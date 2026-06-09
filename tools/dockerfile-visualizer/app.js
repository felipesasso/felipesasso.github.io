/**
 * Wires up the Dockerfile Visualizer: example presets, debounced analysis
 * via DockerfileEngine, the SVG pipeline preview, and the findings panel.
 */
(function () {
    const sourceEl = document.getElementById('dfv-source');
    const canvasEl = document.getElementById('dfv-canvas');
    const errorsEl = document.getElementById('dfv-errors');
    const findingsEl = document.getElementById('dfv-findings');
    const statsEl = document.getElementById('dfv-stats');
    const examplesEl = document.getElementById('dfv-examples');

    let activeExampleId = null;

    function escapeHtml(str) {
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    }

    function renderErrors(errors) {
        if (!errors.length) {
            errorsEl.classList.add('hidden');
            errorsEl.innerHTML = '';
            return;
        }
        errorsEl.classList.remove('hidden');
        errorsEl.innerHTML = `
            <p class="dfv-panel-title">${errors.length === 1 ? 'There is one problem with this Dockerfile:' : `There are ${errors.length} problems with this Dockerfile:`}</p>
            <ul>${errors.map((e) => `<li>${escapeHtml(e)}</li>`).join('')}</ul>
        `;
    }

    function renderFindings(warnings) {
        const warns = warnings.filter((w) => w.level === 'warn');
        const infos = warnings.filter((w) => w.level === 'info');

        if (!warns.length && !infos.length) {
            findingsEl.innerHTML = '<div class="dfv-findings-box clean"><p class="dfv-panel-title">No warnings — this Dockerfile looks clean.</p></div>';
            return;
        }

        const section = (title, items, cls) => items.length ? `
            <div class="dfv-findings-box ${cls}">
                <p class="dfv-panel-title">${title}</p>
                <ul>${items.map((w) => `<li><span class="dfv-line-ref">L${w.line}</span> ${escapeHtml(w.message)}</li>`).join('')}</ul>
            </div>
        ` : '';

        findingsEl.innerHTML =
            section(warns.length === 1 ? '1 warning' : `${warns.length} warnings`, warns, 'warn') +
            section(infos.length === 1 ? '1 suggestion' : `${infos.length} suggestions`, infos, 'info');
    }

    function renderExampleTabs() {
        examplesEl.innerHTML = window.DFV_EXAMPLES.map((ex) => `
            <button type="button" class="dfv-example-btn" data-example="${ex.id}">${ex.label}</button>
        `).join('');
        examplesEl.querySelectorAll('.dfv-example-btn').forEach((btn) => {
            btn.addEventListener('click', () => loadExample(btn.dataset.example));
        });
        syncExampleTabs();
    }

    function syncExampleTabs() {
        examplesEl.querySelectorAll('.dfv-example-btn').forEach((btn) => {
            btn.classList.toggle('active', btn.dataset.example === activeExampleId);
        });
    }

    function loadExample(id) {
        const example = window.DFV_EXAMPLES.find((ex) => ex.id === id);
        if (!example) return;
        activeExampleId = id;
        sourceEl.value = example.source;
        syncExampleTabs();
        update();
    }

    function update() {
        let analysis;
        try {
            analysis = window.DockerfileEngine.analyze(sourceEl.value);
        } catch (err) {
            errorsEl.classList.remove('hidden');
            errorsEl.innerHTML = `<p class="dfv-panel-title">Couldn't analyze this Dockerfile: ${escapeHtml(err.message || String(err))}</p>`;
            canvasEl.innerHTML = '';
            findingsEl.innerHTML = '';
            statsEl.textContent = '';
            return;
        }

        renderErrors(analysis.errors);
        renderFindings(analysis.warnings);

        if (!analysis.stages.length) {
            canvasEl.innerHTML = '<p class="dfv-canvas-empty">Add a FROM instruction to see the build pipeline appear here.</p>';
            statsEl.textContent = '';
            return;
        }

        const layerCount = analysis.stages.reduce((sum, s) => sum + s.nodes.filter((n) => ['FROM', 'RUN', 'COPY', 'ADD'].includes(n.keyword)).length, 0);
        statsEl.textContent = `${analysis.stages.length} stage${analysis.stages.length === 1 ? '' : 's'} · ${layerCount} layers`;
        canvasEl.innerHTML = window.DockerfileEngine.renderSVG(analysis);
    }

    let debounceHandle = null;
    sourceEl.addEventListener('input', () => {
        activeExampleId = null;
        syncExampleTabs();
        clearTimeout(debounceHandle);
        debounceHandle = setTimeout(update, 220);
    });

    renderExampleTabs();
    loadExample(window.DFV_EXAMPLES[0].id);
})();
