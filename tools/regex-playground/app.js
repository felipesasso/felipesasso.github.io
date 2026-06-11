/**
 * Regex Playground with Security Rules.
 *
 * Lets a visitor build an input-validation regex (allow-list or deny-list,
 * with an optional full-match wrap) and immediately see two things:
 *  - how it treats their own test string, with matches highlighted
 *  - how it fares against a library of well-known injection payloads
 */
(function () {
    const patternInput = document.getElementById('rxp-pattern');
    const flagsInput = document.getElementById('rxp-flags');
    const errorEl = document.getElementById('rxp-error');
    const modeGroup = document.getElementById('rxp-mode');
    const fullMatchCheckbox = document.getElementById('rxp-fullmatch');
    const modeHelpEl = document.getElementById('rxp-mode-help');
    const presetListEl = document.getElementById('rxp-preset-list');
    const testInput = document.getElementById('rxp-test-input');
    const testBadge = document.getElementById('rxp-test-badge');
    const testPreview = document.getElementById('rxp-test-preview');
    const categoriesEl = document.getElementById('rxp-categories');
    const statsEl = document.getElementById('rxp-stats');
    const onlySlippedCheckbox = document.getElementById('rxp-only-slipped');
    const resultsEl = document.getElementById('rxp-results');
    const customInput = document.getElementById('rxp-custom-input');

    const state = {
        pattern: '',
        flags: '',
        mode: 'deny', // 'deny' = a match means reject; 'allow' = a match means accept
        fullMatch: false,
        activePreset: 0,
        enabledCategories: new Set(PAYLOAD_CATEGORIES.map((c) => c.id)),
        onlySlipped: false,
    };

    const APP_TRANSLATIONS = {
        en: {
            invalidPattern: (error) => `Invalid pattern or flags: ${error}`,
            modeHelpDeny:
                '<strong>Deny-list mode</strong> &mdash; a match means the input is <strong>rejected</strong>. ' +
                'For each payload below, "Blocked" means your pattern matched it (good); "Slips through" means it didn\'t.',
            modeHelpAllow:
                '<strong>Allow-list mode</strong> &mdash; the input is only <strong>accepted</strong> if it matches. ' +
                'For each payload below, "Blocked" means your pattern did <em>not</em> match it (good); "Slips through" means it did.',
            fixPattern: 'Fix pattern',
            empty: 'Empty',
            acceptedByFilter: 'Accepted by filter',
            rejectedByFilter: 'Rejected by filter',
            customPayloadNote: 'Custom payload',
            customGroupName: 'Custom',
            fixPatternForSweep: 'Fix the pattern above to run the payload sweep.',
            statsText: (blocked, total, slipped, pct) =>
                `<strong>${blocked}</strong> of <strong>${total}</strong> payloads blocked (<strong>${slipped}</strong> slip through) &mdash; ${pct}% blocked`,
            selectCategory: 'Select at least one category (or add custom payloads) to run the sweep.',
            noPayloads: 'No payloads to show. Either everything was blocked, or no categories are selected.',
            blocked: 'Blocked',
            slipsThrough: 'Slips through',
        },
        pt: {
            invalidPattern: (error) => `Padrão ou flags inválidos: ${error}`,
            modeHelpDeny:
                '<strong>Modo deny-list</strong> &mdash; uma correspondência significa que a entrada é <strong>rejeitada</strong>. ' +
                'Para cada payload abaixo, "Bloqueado" significa que seu padrão o reconheceu (bom); "Passa despercebido" significa que não.',
            modeHelpAllow:
                '<strong>Modo allow-list</strong> &mdash; a entrada só é <strong>aceita</strong> se corresponder ao padrão. ' +
                'Para cada payload abaixo, "Bloqueado" significa que seu padrão <em>não</em> o reconheceu (bom); "Passa despercebido" significa que reconheceu.',
            fixPattern: 'Corrija o padrão',
            empty: 'Vazio',
            acceptedByFilter: 'Aceito pelo filtro',
            rejectedByFilter: 'Rejeitado pelo filtro',
            customPayloadNote: 'Payload personalizado',
            customGroupName: 'Custom',
            fixPatternForSweep: 'Corrija o padrão acima para executar a varredura de payloads.',
            statsText: (blocked, total, slipped, pct) =>
                `<strong>${blocked}</strong> de <strong>${total}</strong> payloads bloqueados (<strong>${slipped}</strong> passam despercebidos) &mdash; ${pct}% bloqueados`,
            selectCategory: 'Selecione pelo menos uma categoria (ou adicione payloads personalizados) para executar a varredura.',
            noPayloads: 'Nenhum payload para exibir. Ou tudo foi bloqueado, ou nenhuma categoria está selecionada.',
            blocked: 'Bloqueado',
            slipsThrough: 'Passa despercebido',
        },
    };

    let currentLanguage = 'en';

    function t(key) {
        return (APP_TRANSLATIONS[currentLanguage] && APP_TRANSLATIONS[currentLanguage][key]) || APP_TRANSLATIONS.en[key];
    }

    function pick(item, field) {
        if (currentLanguage === 'pt' && item[`${field}_pt`] !== undefined) {
            return item[`${field}_pt`];
        }
        return item[field];
    }

    function esc(str) {
        return String(str)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');
    }

    /**
     * Builds the regex objects used for evaluation, given the current
     * pattern/flags/fullMatch state. Returns { testRegex, highlightRegex,
     * error } — both regexes are null if the pattern/flags are invalid.
     */
    function compile() {
        const result = { testRegex: null, highlightRegex: null, error: null };
        try {
            result.highlightRegex = new RegExp(state.pattern, state.flags.replace(/[gy]/g, '') + 'g');
        } catch (err) {
            result.error = err.message;
            return result;
        }
        try {
            const cleanFlags = state.flags.replace(/[gy]/g, '');
            const src = state.fullMatch ? `^(?:${state.pattern})$` : state.pattern;
            result.testRegex = new RegExp(src, cleanFlags);
        } catch (err) {
            result.error = err.message;
        }
        return result;
    }

    function highlight(str, regex) {
        if (!regex || str === '') return esc(str);
        let out = '';
        let lastIndex = 0;
        regex.lastIndex = 0;
        let match;
        let guard = 0;
        while ((match = regex.exec(str)) !== null && guard < 1000) {
            guard++;
            const text = match[0];
            if (text === '') {
                out += esc(str[match.index] || '');
                regex.lastIndex = match.index + 1;
                lastIndex = match.index + 1;
                if (match.index >= str.length) break;
                continue;
            }
            out += esc(str.slice(lastIndex, match.index));
            out += `<mark class="rxp-match">${esc(text)}</mark>`;
            lastIndex = match.index + text.length;
        }
        out += esc(str.slice(lastIndex));
        return out;
    }

    function renderError(error) {
        if (error) {
            errorEl.textContent = t('invalidPattern')(error);
            errorEl.classList.remove('hidden');
        } else {
            errorEl.classList.add('hidden');
        }
    }

    function renderModeHelp() {
        modeHelpEl.innerHTML = state.mode === 'deny' ? t('modeHelpDeny') : t('modeHelpAllow');
    }

    function renderPresets() {
        presetListEl.innerHTML = PRESET_PATTERNS.map((preset, i) => `
            <button type="button" class="rxp-preset-chip${i === state.activePreset ? ' is-active' : ''}" data-preset="${i}" title="${esc(pick(preset, 'description'))}">
                ${esc(pick(preset, 'name'))}
            </button>
        `).join('');
    }

    function renderTester(compiled) {
        const value = testInput.value;

        if (compiled.error) {
            testBadge.textContent = t('fixPattern');
            testBadge.className = 'rxp-badge is-neutral';
            testPreview.innerHTML = '';
            return;
        }

        if (value === '') {
            testBadge.textContent = t('empty');
            testBadge.className = 'rxp-badge is-neutral';
            testPreview.innerHTML = '';
            return;
        }

        const matched = compiled.testRegex.test(value);
        const accepted = state.mode === 'allow' ? matched : !matched;

        testBadge.textContent = accepted ? t('acceptedByFilter') : t('rejectedByFilter');
        testBadge.className = `rxp-badge ${accepted ? 'is-accept' : 'is-reject'}`;
        testPreview.innerHTML = highlight(value, compiled.highlightRegex);
    }

    function renderCategories() {
        categoriesEl.innerHTML = PAYLOAD_CATEGORIES.map((cat) => `
            <label class="rxp-category-chip">
                <input type="checkbox" data-category="${cat.id}" ${state.enabledCategories.has(cat.id) ? 'checked' : ''} />
                ${esc(pick(cat, 'name'))} (${cat.payloads.length})
            </label>
        `).join('');
    }

    function getCustomPayloads() {
        return customInput.value
            .split('\n')
            .map((line) => line.trim())
            .filter((line) => line.length > 0)
            .map((value) => ({ value, note: t('customPayloadNote') }));
    }

    function evaluatePayload(value, compiled) {
        const matched = compiled.testRegex.test(value);
        const accepted = state.mode === 'allow' ? matched : !matched;
        return accepted ? 'slip' : 'blocked';
    }

    function renderSweep(compiled) {
        if (compiled.error) {
            statsEl.innerHTML = '';
            resultsEl.innerHTML = `<p class="rxp-empty-note">${esc(t('fixPatternForSweep'))}</p>`;
            return;
        }

        const groups = [];
        let total = 0;
        let blocked = 0;

        PAYLOAD_CATEGORIES.forEach((cat) => {
            if (!state.enabledCategories.has(cat.id)) return;
            const items = cat.payloads.map((p) => ({ ...p, status: evaluatePayload(p.value, compiled), note: pick(p, 'note') }));
            items.forEach((item) => {
                total++;
                if (item.status === 'blocked') blocked++;
            });
            groups.push({ id: cat.id, name: pick(cat, 'name'), items });
        });

        const customPayloads = getCustomPayloads();
        if (customPayloads.length) {
            const items = customPayloads.map((p) => ({ ...p, status: evaluatePayload(p.value, compiled) }));
            items.forEach((item) => {
                total++;
                if (item.status === 'blocked') blocked++;
            });
            groups.push({ id: 'custom', name: t('customGroupName'), items });
        }

        const slipped = total - blocked;
        const pct = total > 0 ? Math.round((blocked / total) * 100) : 0;

        if (total === 0) {
            statsEl.innerHTML = `<p class="rxp-empty-note">${esc(t('selectCategory'))}</p>`;
            resultsEl.innerHTML = '';
            return;
        }

        statsEl.innerHTML = `
            <p class="rxp-stats-text">
                ${t('statsText')(blocked, total, slipped, pct)}
            </p>
            <div class="rxp-stats-bar">
                <div class="rxp-stats-fill-blocked" style="width:${pct}%"></div>
                <div class="rxp-stats-fill-slip" style="width:${100 - pct}%"></div>
            </div>
        `;

        const visibleGroups = groups
            .map((group) => ({
                ...group,
                items: state.onlySlipped ? group.items.filter((item) => item.status === 'slip') : group.items,
            }))
            .filter((group) => group.items.length > 0);

        if (visibleGroups.length === 0) {
            resultsEl.innerHTML = `<p class="rxp-empty-note">${esc(t('noPayloads'))}</p>`;
            return;
        }

        resultsEl.innerHTML = visibleGroups.map((group) => `
            <div class="rxp-category-group">
                <p class="rxp-category-group-title">${esc(group.name)}</p>
                ${group.items.map((item) => `
                    <div class="rxp-payload-item">
                        <div class="rxp-payload-main">
                            <code class="rxp-payload-code">${highlight(item.value, compiled.highlightRegex)}</code>
                            ${item.note ? `<p class="rxp-payload-note">${esc(item.note)}</p>` : ''}
                        </div>
                        <span class="rxp-payload-badge ${item.status === 'blocked' ? 'is-blocked' : 'is-slip'}">
                            ${item.status === 'blocked' ? t('blocked') : t('slipsThrough')}
                        </span>
                    </div>
                `).join('')}
            </div>
        `).join('');
    }

    function render() {
        const compiled = compile();
        renderError(compiled.error);
        renderModeHelp();
        renderTester(compiled);
        renderSweep(compiled);
    }

    function applyPreset(index) {
        const preset = PRESET_PATTERNS[index];
        if (!preset) return;
        state.pattern = preset.pattern;
        state.flags = preset.flags;
        state.mode = preset.mode;
        state.fullMatch = preset.fullMatch;
        state.activePreset = index;

        patternInput.value = preset.pattern;
        flagsInput.value = preset.flags;
        fullMatchCheckbox.checked = preset.fullMatch;
        updateModeButtons();
        renderPresets();
        render();
    }

    function updateModeButtons() {
        modeGroup.querySelectorAll('.rxp-segment').forEach((btn) => {
            const isActive = btn.dataset.mode === state.mode;
            btn.classList.toggle('is-active', isActive);
            btn.setAttribute('aria-checked', String(isActive));
        });
    }

    function init() {
        // Seed from the first preset.
        const initial = PRESET_PATTERNS[0];
        state.pattern = initial.pattern;
        state.flags = initial.flags;
        state.mode = initial.mode;
        state.fullMatch = initial.fullMatch;

        patternInput.value = state.pattern;
        flagsInput.value = state.flags;
        fullMatchCheckbox.checked = state.fullMatch;

        modeGroup.querySelectorAll('.rxp-segment').forEach((btn) => {
            btn.setAttribute('role', 'radio');
            btn.addEventListener('click', () => {
                state.mode = btn.dataset.mode;
                state.activePreset = -1;
                updateModeButtons();
                renderPresets();
                render();
            });
        });
        updateModeButtons();

        renderPresets();
        renderCategories();

        patternInput.addEventListener('input', () => {
            state.pattern = patternInput.value;
            state.activePreset = -1;
            renderPresets();
            render();
        });

        flagsInput.addEventListener('input', () => {
            state.flags = flagsInput.value.replace(/[^a-z]/gi, '');
            flagsInput.value = state.flags;
            state.activePreset = -1;
            renderPresets();
            render();
        });

        fullMatchCheckbox.addEventListener('change', () => {
            state.fullMatch = fullMatchCheckbox.checked;
            state.activePreset = -1;
            renderPresets();
            render();
        });

        presetListEl.addEventListener('click', (e) => {
            const btn = e.target.closest('.rxp-preset-chip');
            if (!btn) return;
            applyPreset(Number(btn.dataset.preset));
        });

        categoriesEl.addEventListener('change', (e) => {
            const checkbox = e.target.closest('input[data-category]');
            if (!checkbox) return;
            if (checkbox.checked) {
                state.enabledCategories.add(checkbox.dataset.category);
            } else {
                state.enabledCategories.delete(checkbox.dataset.category);
            }
            render();
        });

        onlySlippedCheckbox.addEventListener('change', () => {
            state.onlySlipped = onlySlippedCheckbox.checked;
            render();
        });

        testInput.addEventListener('input', () => {
            const compiled = compile();
            renderTester(compiled);
        });

        customInput.addEventListener('input', () => render());

        render();
    }

    window.rxpSetLanguage = function (lang) {
        currentLanguage = lang === 'pt' ? 'pt' : 'en';
        renderPresets();
        renderCategories();
        render();
    };

    init();
})();
