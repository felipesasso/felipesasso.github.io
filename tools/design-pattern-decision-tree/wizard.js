/**
 * Drives the Design Pattern Decision Tree wizard: walks DPDT_TREE node by
 * node based on the user's answers, then renders the matching pattern from
 * DPDT_PATTERNS. Keeps a path stack so the user can step back or restart.
 */
(function () {
    const trail = document.getElementById('dpdt-trail');
    const stage = document.getElementById('dpdt-stage');

    const CATEGORY_ORDER = ['Creational', 'Structural', 'Behavioral'];

    // Each entry: { nodeId, question, choiceLabel }
    let path = [];
    let current = null; // { type: 'question', nodeId } | { type: 'result', patternId, fromBrowse? } | { type: 'browse' }
    let codeLang = 'python'; // shared across pattern views: 'python' | 'go'
    let currentLanguage = 'en';

    const APP_TRANSLATIONS = {
        en: {
            back: 'Back',
            backToLastQuestion: 'Back to last question',
            backToAllPatterns: 'Back to all patterns',
            startOver: 'Start over',
            questionCounter: (n) => `Question ${n}`,
            recommendedPattern: (category) => `Recommended pattern · ${category}`,
            reachForItWhen: 'Reach for it when…',
            inPractice: 'In practice',
            keepInMind: 'Keep in mind',
            codeExample: 'Code example',
            withoutThePattern: 'Without the pattern',
            withPattern: (name) => `With ${name}`,
            chooseLanguage: 'Choose a language',
            answerOptions: 'Answer options',
            browseAllPatterns: 'Browse all patterns',
            browseAllPatternsLink: 'Or browse all patterns directly',
        },
        pt: {
            back: 'Voltar',
            backToLastQuestion: 'Voltar para a última pergunta',
            backToAllPatterns: 'Voltar para todos os padrões',
            startOver: 'Recomeçar',
            questionCounter: (n) => `Pergunta ${n}`,
            recommendedPattern: (category) => `Padrão recomendado · ${category}`,
            reachForItWhen: 'Use quando…',
            inPractice: 'Na prática',
            keepInMind: 'Cuidados',
            codeExample: 'Exemplo de código',
            withoutThePattern: 'Sem o padrão',
            withPattern: (name) => `Com ${name}`,
            chooseLanguage: 'Escolha uma linguagem',
            answerOptions: 'Opções de resposta',
            browseAllPatterns: 'Ver todos os padrões',
            browseAllPatternsLink: 'Ou veja todos os padrões diretamente',
        },
    };

    function t(key) {
        return (APP_TRANSLATIONS[currentLanguage] && APP_TRANSLATIONS[currentLanguage][key] !== undefined)
            ? APP_TRANSLATIONS[currentLanguage][key]
            : APP_TRANSLATIONS.en[key];
    }

    function pick(item, field) {
        if (currentLanguage === 'pt' && item[`${field}_pt`] !== undefined) {
            return item[`${field}_pt`];
        }
        return item[field];
    }

    function categoryLabel(category) {
        if (currentLanguage === 'pt' && DPDT_CATEGORIES_PT[category] !== undefined) {
            return DPDT_CATEGORIES_PT[category];
        }
        return category;
    }

    function start() {
        path = [];
        current = { type: 'question', nodeId: 'start' };
        render();
    }

    function choose(option) {
        const node = DPDT_TREE[current.nodeId];
        path.push({ nodeId: current.nodeId, question: node.question, option });

        if (option.result) {
            current = { type: 'result', patternId: option.result };
        } else {
            current = { type: 'question', nodeId: option.next };
        }
        render();
    }

    function browseAll() {
        current = { type: 'browse' };
        render();
    }

    function selectPattern(patternId) {
        current = { type: 'result', patternId, fromBrowse: true };
        render();
    }

    function goBack() {
        if (current.type === 'result' && current.fromBrowse) {
            current = { type: 'browse' };
            render();
            return;
        }
        if (current.type === 'browse') {
            start();
            return;
        }
        if (path.length === 0) return;
        const last = path.pop();
        current = { type: 'question', nodeId: last.nodeId };
        render();
    }

    function renderTrail() {
        if (path.length === 0) {
            trail.innerHTML = '';
            return;
        }
        trail.innerHTML = path.map((step, i) => `
            <span class="dpdt-trail-pill">
                <span class="step-num">${i + 1}</span>
                ${pick(step.option, 'label')}
            </span>
        `).join('');
    }

    function renderQuestion(nodeId) {
        const node = DPDT_TREE[nodeId];
        renderTrail();

        stage.innerHTML = `
            <div class="dpdt-fade">
                <p class="dpdt-question">${pick(node, 'question')}</p>
                <div class="dpdt-options" role="group" aria-label="${t('answerOptions')}"></div>
                <div class="dpdt-controls">
                    <button type="button" class="dpdt-text-btn" id="dpdt-back" ${path.length === 0 ? 'disabled' : ''}>
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.75" stroke="currentColor" class="w-3.5 h-3.5">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
                        </svg>
                        ${t('back')}
                    </button>
                    <span class="text-xs text-[var(--text-secondary)]">${t('questionCounter')(path.length + 1)}</span>
                </div>
            </div>
        `;

        const optionsContainer = stage.querySelector('.dpdt-options');
        node.options.forEach((option) => {
            const btn = document.createElement('button');
            btn.type = 'button';
            btn.className = 'dpdt-option';
            btn.innerHTML = `
                <span>${pick(option, 'label')}</span>
                <svg class="arrow w-4 h-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.75" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
                </svg>
            `;
            btn.addEventListener('click', () => choose(option));
            optionsContainer.appendChild(btn);
        });

        const backBtn = document.getElementById('dpdt-back');
        backBtn.addEventListener('click', goBack);

        if (path.length === 0) {
            const browseWrap = document.createElement('div');
            browseWrap.className = 'dpdt-browse-link';
            browseWrap.innerHTML = `
                <button type="button" class="dpdt-text-btn" id="dpdt-browse-all">
                    ${t('browseAllPatternsLink')}
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.75" stroke="currentColor" class="w-3.5 h-3.5">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
                    </svg>
                </button>
            `;
            stage.querySelector('.dpdt-fade').appendChild(browseWrap);
            document.getElementById('dpdt-browse-all').addEventListener('click', browseAll);
        }
    }

    function renderBrowse() {
        renderTrail();

        const categories = CATEGORY_ORDER.map((category) => ({
            category,
            patterns: Object.entries(DPDT_PATTERNS).filter(([, pattern]) => pattern.category === category),
        }));

        stage.innerHTML = `
            <div class="dpdt-fade">
                <p class="dpdt-question">${t('browseAllPatterns')}</p>
                <div class="dpdt-browse-categories">
                    ${categories.map(({ category, patterns }) => `
                        <div class="dpdt-browse-category">
                            <h3>${categoryLabel(category)}</h3>
                            <div class="dpdt-browse-grid" role="group" aria-label="${categoryLabel(category)}">
                                ${patterns.map(([id, pattern]) => `
                                    <button type="button" class="dpdt-browse-item" data-pattern="${id}">${pattern.name}</button>
                                `).join('')}
                            </div>
                        </div>
                    `).join('')}
                </div>
                <div class="dpdt-controls">
                    <button type="button" class="dpdt-text-btn" id="dpdt-back">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.75" stroke="currentColor" class="w-3.5 h-3.5">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
                        </svg>
                        ${t('back')}
                    </button>
                    <span class="text-xs text-[var(--text-secondary)]"></span>
                </div>
            </div>
        `;

        stage.querySelectorAll('.dpdt-browse-item').forEach((btn) => {
            btn.addEventListener('click', () => selectPattern(btn.dataset.pattern));
        });
        document.getElementById('dpdt-back').addEventListener('click', goBack);
    }

    function renderResult(patternId, skipScroll) {
        const pattern = DPDT_PATTERNS[patternId];
        renderTrail();

        stage.innerHTML = `
            <div class="dpdt-fade">
                <span class="dpdt-result-badge">${t('recommendedPattern')(categoryLabel(pattern.category))}</span>
                <h2 class="dpdt-result-name">${pattern.name}</h2>
                <p class="dpdt-result-summary">${pick(pattern, 'summary')}</p>

                <div class="dpdt-result-block">
                    <h3>${t('reachForItWhen')}</h3>
                    <ul>${pick(pattern, 'when').map((point) => `<li>${point}</li>`).join('')}</ul>
                </div>

                <div class="dpdt-result-block">
                    <h3>${t('inPractice')}</h3>
                    <p>${pick(pattern, 'example')}</p>
                </div>

                <div class="dpdt-result-block">
                    <h3>${t('keepInMind')}</h3>
                    <p>${pick(pattern, 'watch')}</p>
                </div>

                ${pattern.classDiagram ? `
                <div class="dpdt-result-block">
                    <h3>Class diagram</h3>
                    <div class="dpdt-diagram" id="dpdt-diagram"></div>
                    <div class="dpdt-diagram-legend">
                        <span>──▷ inheritance / implements</span>
                        <span>┄┄▷ realization (interface)</span>
                        <span>──◆ composition</span>
                        <span>──◇ aggregation</span>
                        <span>┄┄&gt; dependency</span>
                    </div>
                </div>
                ` : ''}

                <div class="dpdt-result-block">
                    <div class="dpdt-code-header">
                        <h3 style="margin-bottom: 0;">${t('codeExample')}</h3>
                        <div class="dpdt-code-tabs" role="group" aria-label="${t('chooseLanguage')}">
                            <button type="button" class="dpdt-code-tab" data-lang="python">Python</button>
                            <button type="button" class="dpdt-code-tab" data-lang="go">Go</button>
                        </div>
                    </div>
                    <div class="dpdt-code-compare">
                        <div class="dpdt-code-pane">
                            <p class="dpdt-code-pane-label is-naive">${t('withoutThePattern')}</p>
                            <pre class="dpdt-code-block"><code id="dpdt-code-naive"></code></pre>
                        </div>
                        <div class="dpdt-code-pane">
                            <p class="dpdt-code-pane-label is-pattern">${t('withPattern')(pattern.name)}</p>
                            <pre class="dpdt-code-block"><code id="dpdt-code-output"></code></pre>
                        </div>
                    </div>
                </div>

                <div class="dpdt-controls" style="border-top: none; padding-top: 0; margin-top: 0.5rem;">
                    <button type="button" class="dpdt-text-btn" id="dpdt-back">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.75" stroke="currentColor" class="w-3.5 h-3.5">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
                        </svg>
                        ${current.fromBrowse ? t('backToAllPatterns') : t('backToLastQuestion')}
                    </button>
                    <button type="button" class="dpdt-text-btn" id="dpdt-restart">
                        ${t('startOver')}
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.75" stroke="currentColor" class="w-3.5 h-3.5">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99" />
                        </svg>
                    </button>
                </div>
            </div>
        `;

        document.getElementById('dpdt-back').addEventListener('click', goBack);
        document.getElementById('dpdt-restart').addEventListener('click', start);

        const codeOutput = stage.querySelector('#dpdt-code-output');
        const codeNaive = stage.querySelector('#dpdt-code-naive');
        const codeTabs = stage.querySelectorAll('.dpdt-code-tab');

        function renderCode() {
            codeOutput.textContent = pattern.code[codeLang];
            codeNaive.textContent = pattern.naiveCode[codeLang];
            codeTabs.forEach((tab) => {
                tab.classList.toggle('active', tab.dataset.lang === codeLang);
            });
        }

        codeTabs.forEach((tab) => {
            tab.addEventListener('click', () => {
                codeLang = tab.dataset.lang;
                renderCode();
            });
        });

        renderCode();

        if (pattern.classDiagram) {
            renderClassDiagram(stage.querySelector('#dpdt-diagram'), pattern.classDiagram);
        }

        if (!skipScroll) {
            stage.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    }

    function render(skipScroll) {
        if (current.type === 'question') {
            renderQuestion(current.nodeId);
        } else if (current.type === 'browse') {
            renderBrowse();
        } else {
            renderResult(current.patternId, skipScroll);
        }
    }

    start();

    window.dpdtSetLanguage = function (lang) {
        currentLanguage = lang === 'pt' ? 'pt' : 'en';
        render(true);
    };
})();
