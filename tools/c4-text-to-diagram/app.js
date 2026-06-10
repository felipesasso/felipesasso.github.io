/**
 * Wires up the C4 Text-to-Diagram editor: example presets, debounced parsing
 * via C4Engine, SVG preview, error reporting and the kind legend.
 */
(function () {
    const sourceEl = document.getElementById('c4t-source');
    const canvasEl = document.getElementById('c4t-canvas');
    const errorsEl = document.getElementById('c4t-errors');
    const legendEl = document.getElementById('c4t-legend');
    const titleEl = document.getElementById('c4t-diagram-title');
    const examplesEl = document.getElementById('c4t-examples');

    const LEGEND_ITEMS = {
        person: { label: 'Person', label_pt: 'Pessoa', swatchClass: 'kind-person' },
        internal: { label: 'Software system / container / component', label_pt: 'Sistema de software / container / componente', swatchClass: 'kind-internal' },
        external: { label: 'External dependency', label_pt: 'Dependência externa', swatchClass: 'kind-external' },
    };

    const APP_TRANSLATIONS = {
        en: {
            issueSingular: 'There is one issue with the diagram source:',
            issuePlural: (n) => `There are ${n} issues with the diagram source:`,
            renderError: (message) => `Couldn't render this diagram: ${message}`,
            emptyCanvas: 'Add a person, system or container to see the diagram appear here.',
        },
        pt: {
            issueSingular: 'Há um problema no texto do diagrama:',
            issuePlural: (n) => `Há ${n} problemas no texto do diagrama:`,
            renderError: (message) => `Não foi possível renderizar este diagrama: ${message}`,
            emptyCanvas: 'Adicione uma pessoa, sistema ou container para ver o diagrama aparecer aqui.',
        },
    };

    let currentLanguage = 'en';
    let activeExampleId = null;

    function t(key) {
        return (APP_TRANSLATIONS[currentLanguage] && APP_TRANSLATIONS[currentLanguage][key]) || APP_TRANSLATIONS.en[key];
    }

    function pick(item, field) {
        if (currentLanguage === 'pt' && item[`${field}_pt`] !== undefined) {
            return item[`${field}_pt`];
        }
        return item[field];
    }

    function renderLegend(kindsUsed) {
        const order = ['person', 'internal', 'external'];
        const used = order.filter((k) => kindsUsed.has(k));
        if (!used.length) {
            legendEl.innerHTML = '';
            return;
        }
        legendEl.innerHTML = used.map((kind) => `
            <span class="c4t-legend-item">
                <span class="c4t-legend-swatch ${LEGEND_ITEMS[kind].swatchClass}"></span>
                ${pick(LEGEND_ITEMS[kind], 'label')}
            </span>
        `).join('');
    }

    function renderErrors(errors) {
        if (!errors.length) {
            errorsEl.classList.add('hidden');
            errorsEl.innerHTML = '';
            return;
        }
        errorsEl.classList.remove('hidden');
        errorsEl.innerHTML = `
            <p class="c4t-errors-title">${errors.length === 1 ? t('issueSingular') : t('issuePlural')(errors.length)}</p>
            <ul>${errors.map((e) => `<li>${escapeHtml(e)}</li>`).join('')}</ul>
        `;
    }

    function escapeHtml(str) {
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    }

    function renderExampleTabs() {
        examplesEl.innerHTML = window.C4_EXAMPLES.map((ex) => `
            <button type="button" class="c4t-example-btn" data-example="${ex.id}">${pick(ex, 'label')}</button>
        `).join('');
        examplesEl.querySelectorAll('.c4t-example-btn').forEach((btn) => {
            btn.addEventListener('click', () => loadExample(btn.dataset.example));
        });
        syncExampleTabs();
    }

    function syncExampleTabs() {
        examplesEl.querySelectorAll('.c4t-example-btn').forEach((btn) => {
            btn.classList.toggle('active', btn.dataset.example === activeExampleId);
        });
    }

    function loadExample(id) {
        const example = window.C4_EXAMPLES.find((ex) => ex.id === id);
        if (!example) return;
        activeExampleId = id;
        sourceEl.value = pick(example, 'source');
        syncExampleTabs();
        update();
    }

    function update() {
        const source = sourceEl.value;
        let result;
        try {
            result = window.C4Engine.render(source, currentLanguage);
        } catch (err) {
            errorsEl.classList.remove('hidden');
            errorsEl.innerHTML = `<p class="c4t-errors-title">${escapeHtml(t('renderError')(err.message || String(err)))}</p>`;
            canvasEl.innerHTML = '';
            legendEl.innerHTML = '';
            titleEl.textContent = '';
            return;
        }

        renderErrors(result.parsed.errors);
        renderLegend(result.kindsUsed);
        titleEl.textContent = result.parsed.title || '';

        const hasContent = result.parsed.root.children.length > 0;
        canvasEl.innerHTML = hasContent
            ? result.svg
            : `<p class="c4t-canvas-empty">${escapeHtml(t('emptyCanvas'))}</p>`;
    }

    let debounceHandle = null;
    sourceEl.addEventListener('input', () => {
        activeExampleId = null;
        syncExampleTabs();
        clearTimeout(debounceHandle);
        debounceHandle = setTimeout(update, 220);
    });

    window.c4tSetLanguage = function (lang) {
        currentLanguage = lang === 'pt' ? 'pt' : 'en';
        renderExampleTabs();
        if (activeExampleId) {
            loadExample(activeExampleId);
        } else {
            update();
        }
    };

    renderExampleTabs();
    loadExample(window.C4_EXAMPLES[0].id);
})();
