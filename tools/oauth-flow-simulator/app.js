/**
 * OAuth 2.0 Flow Simulator.
 *
 * Renders the selected flow from OAUTH_FLOWS as a sequence diagram —
 * actor chips on top, dashed lifelines below, one clickable arrow per
 * step — and drives a simple cursor through it. The detail panel shows
 * the current step's wire format and field-by-field breakdown.
 */
(function () {
    const tabsEl = document.getElementById('ofs-tabs');
    const summaryEl = document.getElementById('ofs-summary');
    const flowNoteEl = document.getElementById('ofs-flow-note');
    const actorsEl = document.getElementById('ofs-actors');
    const stepsEl = document.getElementById('ofs-steps');
    const detailEl = document.getElementById('ofs-detail');
    const backBtn = document.getElementById('ofs-back');
    const nextBtn = document.getElementById('ofs-next');
    const restartBtn = document.getElementById('ofs-restart');
    const counterEl = document.getElementById('ofs-counter');

    const ACTOR_ICONS = {
        user: '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.6" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.5 20.118a7.5 7.5 0 0 1 15 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.5-1.632Z"/></svg>',
        app: '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.6" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M9 17.25v1.007a3 3 0 0 1-.879 2.122L7.5 21h9l-.621-.621A3 3 0 0 1 15 18.257V17.25m6-12V15a2.25 2.25 0 0 1-2.25 2.25H5.25A2.25 2.25 0 0 1 3 15V5.25m18 0A2.25 2.25 0 0 0 18.75 3H5.25A2.25 2.25 0 0 0 3 5.25m18 0V12A2.25 2.25 0 0 1 18.75 14.25H5.25A2.25 2.25 0 0 1 3 12V5.25"/></svg>',
        shield: '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.6" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z"/></svg>',
        server: '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.6" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M21.75 17.25v-.228a4.5 4.5 0 0 0-.12-1.03l-2.268-9.64a3.375 3.375 0 0 0-3.285-2.602H7.923a3.375 3.375 0 0 0-3.285 2.602l-2.268 9.64a4.5 4.5 0 0 0-.12 1.03v.228m19.5 0a3 3 0 0 1-3 3H5.25a3 3 0 0 1-3-3m19.5 0a3 3 0 0 0-3-3H5.25a3 3 0 0 0-3 3m16.5 0h.008v.008h-.008v-.008Zm-3 0h.008v.008h-.008v-.008Z"/></svg>',
    };

    const CHANNEL_META = {
        front: { className: 'is-front', label: 'Front channel · via browser redirects', label_pt: 'Front channel · via redirecionamentos do navegador' },
        back: { className: 'is-back', label: 'Back channel · server to server', label_pt: 'Back channel · servidor a servidor' },
        device: { className: 'is-device', label: 'Local · no redirect involved', label_pt: 'Local · sem redirecionamento' },
    };

    const APP_TRANSLATIONS = {
        en: {
            stepCounter: (current, total) => `Step ${current} of ${total}`,
            flowComplete: 'Flow complete ✓',
            nextStep: 'Next step →',
            fieldByField: 'Field by field',
            onTheWire: 'On the wire',
            stepAriaLabel: (n, title) => `Step ${n}: ${title}`,
        },
        pt: {
            stepCounter: (current, total) => `Etapa ${current} de ${total}`,
            flowComplete: 'Fluxo concluído ✓',
            nextStep: 'Próxima etapa →',
            fieldByField: 'Campo a campo',
            onTheWire: 'Na comunicação',
            stepAriaLabel: (n, title) => `Etapa ${n}: ${title}`,
        },
    };

    const state = { flow: 'auth-code', step: 0 };
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
            .replace(/"/g, '&quot;');
    }

    function currentFlow() {
        return OAUTH_FLOWS[state.flow];
    }

    function actorCenter(flow, actorId) {
        const idx = flow.actors.findIndex((a) => a.id === actorId);
        return ((idx + 0.5) / flow.actors.length) * 100;
    }

    function renderTabs() {
        tabsEl.innerHTML = Object.entries(OAUTH_FLOWS)
            .map(([key, flow]) => {
                const active = key === state.flow;
                const badgeWarn = flow.badgeKind === 'warn' ? ' is-warn' : '';
                return `
                    <button type="button" role="tab" class="ofs-tab${active ? ' is-active' : ''}"
                        data-flow="${key}" aria-selected="${active}">
                        ${esc(pick(flow, 'name'))}
                        <span class="ofs-tab-badge${badgeWarn}">${esc(pick(flow, 'badge'))}</span>
                    </button>
                `;
            })
            .join('');
    }

    function renderFlow() {
        const flow = currentFlow();

        summaryEl.textContent = pick(flow, 'summary');
        flowNoteEl.className = 'ofs-flow-note' + (flow.noteKind === 'warn' ? ' is-warn' : '');
        flowNoteEl.innerHTML = `<span>${pick(flow, 'note')}</span>`;

        actorsEl.innerHTML = flow.actors
            .map(
                (actor) => `
                    <div class="ofs-actor">
                        <span class="ofs-actor-chip">${ACTOR_ICONS[actor.icon] || ''}${esc(pick(actor, 'label'))}</span>
                        ${actor.sub ? `<span class="ofs-actor-sub">${esc(pick(actor, 'sub'))}</span>` : ''}
                    </div>
                `
            )
            .join('');

        const lifelines = flow.actors
            .map((actor) => `<div class="ofs-lifeline" style="left: ${actorCenter(flow, actor.id)}%"></div>`)
            .join('');

        const rows = flow.steps
            .map((step, i) => {
                const fromC = actorCenter(flow, step.from);
                const toC = actorCenter(flow, step.to);
                const label = `
                    <span class="ofs-step-label">
                        <span class="ofs-step-num">${i + 1}</span>${esc(pick(step, 'title'))}
                    </span>
                `;
                let shape;
                if (step.from === step.to) {
                    shape = `<span class="ofs-self-pill" style="left: ${fromC}%"></span>`;
                } else {
                    const left = Math.min(fromC, toC);
                    const width = Math.abs(toC - fromC);
                    const head = toC > fromC ? 'to-right' : 'to-left';
                    shape = `
                        <span class="ofs-arrow" style="left: ${left}%; width: ${width}%">
                            <span class="ofs-arrow-head ${head}"></span>
                        </span>
                    `;
                }
                return `<div class="ofs-step-row" data-step="${i}" role="button" tabindex="0"
                    aria-label="${esc(t('stepAriaLabel')(i + 1, pick(step, 'title')))}">${shape}${label}</div>`;
            })
            .join('');

        stepsEl.innerHTML = lifelines + rows;
    }

    function renderDetail() {
        const flow = currentFlow();
        const step = flow.steps[state.step];
        const channel = CHANNEL_META[step.channel];

        const params = (step.params || [])
            .map(
                (p) => `
                    <div class="ofs-param">
                        <p class="ofs-param-name">${esc(p.name)}</p>
                        <p class="ofs-param-note">${esc(pick(p, 'note'))}</p>
                    </div>
                `
            )
            .join('');

        detailEl.innerHTML = `
            <div class="ofs-detail-meta">
                <span class="ofs-detail-step">${esc(t('stepCounter')(state.step + 1, flow.steps.length))}</span>
                ${channel ? `<span class="ofs-channel ${channel.className}">${esc(pick(channel, 'label'))}</span>` : ''}
            </div>
            <h2 class="ofs-detail-title">${esc(pick(step, 'title'))}</h2>
            <p class="ofs-detail-desc">${esc(pick(step, 'description'))}</p>
            ${step.wire ? `<p class="ofs-wire-label">${esc(pick(step, 'wireLabel') || t('onTheWire'))}</p><pre class="ofs-code">${esc(step.wire)}</pre>` : ''}
            ${params ? `<p class="ofs-wire-label">${esc(t('fieldByField'))}</p><div class="ofs-params">${params}</div>` : ''}
            ${step.stepNote ? `<div class="ofs-step-note${step.stepNote.kind === 'warn' ? ' is-warn' : ''}"><span>${pick(step.stepNote, 'text')}</span></div>` : ''}
        `;
    }

    function updateUi() {
        const flow = currentFlow();

        stepsEl.querySelectorAll('.ofs-step-row').forEach((row) => {
            const i = Number(row.dataset.step);
            row.classList.toggle('is-active', i === state.step);
            row.classList.toggle('is-future', i > state.step);
        });

        counterEl.textContent = t('stepCounter')(state.step + 1, flow.steps.length);
        backBtn.disabled = state.step === 0;
        const atEnd = state.step === flow.steps.length - 1;
        nextBtn.disabled = atEnd;
        nextBtn.textContent = atEnd ? t('flowComplete') : t('nextStep');

        renderDetail();
    }

    function setStep(i) {
        const max = currentFlow().steps.length - 1;
        state.step = Math.max(0, Math.min(max, i));
        updateUi();
    }

    function setFlow(key) {
        if (!OAUTH_FLOWS[key]) return;
        state.flow = key;
        state.step = 0;
        renderTabs();
        renderFlow();
        updateUi();
    }

    tabsEl.addEventListener('click', (e) => {
        const tab = e.target.closest('[data-flow]');
        if (tab) setFlow(tab.dataset.flow);
    });

    stepsEl.addEventListener('click', (e) => {
        const row = e.target.closest('.ofs-step-row');
        if (row) setStep(Number(row.dataset.step));
    });

    stepsEl.addEventListener('keydown', (e) => {
        if (e.key !== 'Enter' && e.key !== ' ') return;
        const row = e.target.closest('.ofs-step-row');
        if (row) {
            e.preventDefault();
            setStep(Number(row.dataset.step));
        }
    });

    backBtn.addEventListener('click', () => setStep(state.step - 1));
    nextBtn.addEventListener('click', () => setStep(state.step + 1));
    restartBtn.addEventListener('click', () => setStep(0));

    document.addEventListener('keydown', (e) => {
        const tag = (e.target.tagName || '').toLowerCase();
        if (tag === 'input' || tag === 'textarea' || tag === 'select') return;
        if (e.key === 'ArrowRight') setStep(state.step + 1);
        if (e.key === 'ArrowLeft') setStep(state.step - 1);
    });

    window.ofsSetLanguage = function (lang) {
        currentLanguage = lang === 'pt' ? 'pt' : 'en';
        renderTabs();
        renderFlow();
        updateUi();
    };

    setFlow('auth-code');
})();
