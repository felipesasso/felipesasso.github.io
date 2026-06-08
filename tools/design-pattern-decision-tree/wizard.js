/**
 * Drives the Design Pattern Decision Tree wizard: walks DPDT_TREE node by
 * node based on the user's answers, then renders the matching pattern from
 * DPDT_PATTERNS. Keeps a path stack so the user can step back or restart.
 */
(function () {
    const trail = document.getElementById('dpdt-trail');
    const stage = document.getElementById('dpdt-stage');

    // Each entry: { nodeId, question, choiceLabel }
    let path = [];
    let current = null; // { type: 'question', nodeId } | { type: 'result', patternId }
    let codeLang = 'python'; // shared across pattern views: 'python' | 'go'

    function start() {
        path = [];
        current = { type: 'question', nodeId: 'start' };
        render();
    }

    function choose(option) {
        const node = DPDT_TREE[current.nodeId];
        path.push({ nodeId: current.nodeId, question: node.question, choiceLabel: option.label });

        if (option.result) {
            current = { type: 'result', patternId: option.result };
        } else {
            current = { type: 'question', nodeId: option.next };
        }
        render();
    }

    function goBack() {
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
                ${step.choiceLabel}
            </span>
        `).join('');
    }

    function renderQuestion(nodeId) {
        const node = DPDT_TREE[nodeId];
        renderTrail();

        stage.innerHTML = `
            <div class="dpdt-fade">
                <p class="dpdt-question">${node.question}</p>
                <div class="dpdt-options" role="group" aria-label="Answer options"></div>
                <div class="dpdt-controls">
                    <button type="button" class="dpdt-text-btn" id="dpdt-back" ${path.length === 0 ? 'disabled' : ''}>
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.75" stroke="currentColor" class="w-3.5 h-3.5">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
                        </svg>
                        Back
                    </button>
                    <span class="text-xs text-[var(--text-secondary)]">Question ${path.length + 1}</span>
                </div>
            </div>
        `;

        const optionsContainer = stage.querySelector('.dpdt-options');
        node.options.forEach((option) => {
            const btn = document.createElement('button');
            btn.type = 'button';
            btn.className = 'dpdt-option';
            btn.innerHTML = `
                <span>${option.label}</span>
                <svg class="arrow w-4 h-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.75" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
                </svg>
            `;
            btn.addEventListener('click', () => choose(option));
            optionsContainer.appendChild(btn);
        });

        const backBtn = document.getElementById('dpdt-back');
        backBtn.addEventListener('click', goBack);
    }

    function renderResult(patternId) {
        const pattern = DPDT_PATTERNS[patternId];
        renderTrail();

        stage.innerHTML = `
            <div class="dpdt-fade">
                <span class="dpdt-result-badge">Recommended pattern · ${pattern.category}</span>
                <h2 class="dpdt-result-name">${pattern.name}</h2>
                <p class="dpdt-result-summary">${pattern.summary}</p>

                <div class="dpdt-result-block">
                    <h3>Reach for it when…</h3>
                    <ul>${pattern.when.map((point) => `<li>${point}</li>`).join('')}</ul>
                </div>

                <div class="dpdt-result-block">
                    <h3>In practice</h3>
                    <p>${pattern.example}</p>
                </div>

                <div class="dpdt-result-block">
                    <h3>Keep in mind</h3>
                    <p>${pattern.watch}</p>
                </div>

                <div class="dpdt-result-block">
                    <div class="dpdt-code-header">
                        <h3 style="margin-bottom: 0;">Code example</h3>
                        <div class="dpdt-code-tabs" role="group" aria-label="Choose a language">
                            <button type="button" class="dpdt-code-tab" data-lang="python">Python</button>
                            <button type="button" class="dpdt-code-tab" data-lang="go">Go</button>
                        </div>
                    </div>
                    <pre class="dpdt-code-block"><code id="dpdt-code-output"></code></pre>
                </div>

                <div class="dpdt-controls" style="border-top: none; padding-top: 0; margin-top: 0.5rem;">
                    <button type="button" class="dpdt-text-btn" id="dpdt-back">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.75" stroke="currentColor" class="w-3.5 h-3.5">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
                        </svg>
                        Back to last question
                    </button>
                    <button type="button" class="dpdt-text-btn" id="dpdt-restart">
                        Start over
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
        const codeTabs = stage.querySelectorAll('.dpdt-code-tab');

        function renderCode() {
            codeOutput.textContent = pattern.code[codeLang];
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

        stage.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    function render() {
        if (current.type === 'question') {
            renderQuestion(current.nodeId);
        } else {
            renderResult(current.patternId);
        }
    }

    start();
})();
