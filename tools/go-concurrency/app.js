/* Go Concurrency — rendering logic
   Renders the quick-access index table and one detail card per topic, with
   category filtering, copy-to-clipboard on code blocks, and a live canvas
   animation per topic. Depends on GO_TOPICS / GO_CATEGORIES (data.js),
   GO_ANIMATIONS (animations.js) and GoAnimEngine (engine.js).

   Translation: APP_TRANSLATIONS holds every hardcoded UI string (en/pt);
   t(key) looks one up for the current language with an English fallback.
   pick(item, field) returns item[field + '_pt'] when the current language
   is Portuguese and that field exists, else item[field] — used for every
   GO_TOPICS / GO_CATEGORIES field that has a `_pt` sibling in data.js.
   window.GC_I18N exposes the current language to engine.js / animations.js
   so the live canvas animations can render translated captions and labels.
   window.gcSetLanguage(lang), called from index.html's language toggle,
   switches the language and re-renders in place. */

(function () {
    const indexBody = document.getElementById('goc-index-body');
    const details = document.getElementById('goc-details');
    const filters = document.getElementById('goc-filters');

    let activeCategory = 'All';
    let currentLanguage = 'en';
    const scenes = new Map(); // topic id → GoAnimEngine.Scene

    const APP_TRANSLATIONS = {
        en: {
            allLabel: 'All',
            whenToUseLabel: 'When to use',
            howItWorks: 'How it works',
            watchOutFor: 'Watch out for',
            watchItRun: 'Watch it run',
            copy: 'Copy',
            copied: 'Copied!',
            copyAriaLabel: 'Copy code sample',
            backToIndex: '↑ Back to index',
            jumpTo: (name) => `Jump to ${name}`,
            animAriaLabel: (name) => `Animated diagram: ${name}`,
            pauseResumeAriaLabel: 'Pause or resume animation',
            restartAriaLabel: 'Restart animation',
            speedAriaLabel: 'Change animation speed',
            pause: 'Pause',
            play: 'Play',
            restart: 'Restart',
            complexityTitle: (level) => `${level} complexity`,
            complexityLow: 'Low',
            complexityMedium: 'Medium',
            complexityHigh: 'High',
        },
        pt: {
            allLabel: 'Todos',
            whenToUseLabel: 'Quando usar',
            howItWorks: 'Como funciona',
            watchOutFor: 'Cuidados',
            watchItRun: 'Veja funcionando',
            copy: 'Copiar',
            copied: 'Copiado!',
            copyAriaLabel: 'Copiar exemplo de código',
            backToIndex: '↑ Voltar ao índice',
            jumpTo: (name) => `Ir para ${name}`,
            animAriaLabel: (name) => `Diagrama animado: ${name}`,
            pauseResumeAriaLabel: 'Pausar ou retomar a animação',
            restartAriaLabel: 'Reiniciar animação',
            speedAriaLabel: 'Mudar a velocidade da animação',
            pause: 'Pausar',
            play: 'Reproduzir',
            restart: 'Reiniciar',
            complexityTitle: (level) => `Complexidade ${level}`,
            complexityLow: 'Baixa',
            complexityMedium: 'Média',
            complexityHigh: 'Alta',
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

    function escapeHtml(str) {
        return str
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;');
    }

    function categoryLabel(category) {
        if (currentLanguage === 'pt' && typeof GO_CATEGORIES_PT !== 'undefined' && GO_CATEGORIES_PT[category] !== undefined) {
            return GO_CATEGORIES_PT[category];
        }
        return category;
    }

    function badge(category) {
        return `<span class="goc-badge goc-badge--${GO_CATEGORIES[category]}">${escapeHtml(categoryLabel(category))}</span>`;
    }

    function complexityLabel(level) {
        const key = { Low: 'complexityLow', Medium: 'complexityMedium', High: 'complexityHigh' }[level];
        return key ? t(key) : level;
    }

    function complexityDots(level) {
        const filled = { Low: 1, Medium: 2, High: 3 }[level] || 1;
        let dots = '';
        for (let i = 1; i <= 3; i++) {
            dots += `<span class="goc-dot ${i <= filled ? 'is-filled' : ''}"></span>`;
        }
        const label = complexityLabel(level);
        return `<span class="goc-complexity" title="${escapeHtml(t('complexityTitle')(label))}"><span class="goc-dots">${dots}</span>${escapeHtml(label)}</span>`;
    }

    function visibleTopics() {
        return activeCategory === 'All'
            ? GO_TOPICS
            : GO_TOPICS.filter((t) => t.category === activeCategory);
    }

    function renderFilters() {
        const categories = ['All', ...Object.keys(GO_CATEGORIES)];
        filters.innerHTML = categories
            .map(
                (cat) => `
                    <button class="goc-filter ${cat === activeCategory ? 'active' : ''}" data-category="${cat}">
                        ${escapeHtml(cat === 'All' ? t('allLabel') : categoryLabel(cat))}${cat === 'All' ? ` (${GO_TOPICS.length})` : ''}
                    </button>`
            )
            .join('');
    }

    function renderIndex() {
        indexBody.innerHTML = visibleTopics()
            .map(
                (t) => `
                    <tr class="goc-row" data-target="${t.id}" tabindex="0" role="link" aria-label="${escapeHtml(APP_TRANSLATIONS[currentLanguage].jumpTo(pick(t, 'name')))}">
                        <td class="goc-cell-name">${escapeHtml(pick(t, 'name'))}</td>
                        <td>${badge(t.category)}</td>
                        <td class="goc-cell-when">${pick(t, 'whenToUse')}</td>
                        <td>${complexityDots(t.complexity)}</td>
                    </tr>`
            )
            .join('');
    }

    function animBlock(topic) {
        if (!GO_ANIMATIONS[topic.id]) return '';
        return `
            <div class="goc-block">
                <h3>${escapeHtml(t('watchItRun'))}</h3>
                <div class="goc-anim" data-anim="${topic.id}">
                    <div class="goc-anim-canvas"><canvas role="img" aria-label="${escapeHtml(t('animAriaLabel')(pick(topic, 'name')))}"></canvas></div>
                    <p class="goc-anim-caption" aria-live="polite"></p>
                    <div class="goc-anim-bar">
                        <button class="goc-anim-btn" data-action="toggle" aria-label="${escapeHtml(t('pauseResumeAriaLabel'))}">${escapeHtml(t('pause'))}</button>
                        <button class="goc-anim-btn" data-action="restart" aria-label="${escapeHtml(t('restartAriaLabel'))}">${escapeHtml(t('restart'))}</button>
                        <button class="goc-anim-btn" data-action="speed" aria-label="${escapeHtml(t('speedAriaLabel'))}">1&times;</button>
                    </div>
                </div>
            </div>`;
    }

    function renderDetails() {
        details.innerHTML = visibleTopics()
            .map(
                (t) => `
                    <article class="goc-topic" id="${t.id}">
                        <header>
                            <div class="goc-topic-meta">
                                ${badge(t.category)}
                                ${complexityDots(t.complexity)}
                            </div>
                            <h2 class="goc-topic-name">${escapeHtml(pick(t, 'name'))}</h2>
                            <p class="goc-topic-when"><strong>${escapeHtml(APP_TRANSLATIONS[currentLanguage].whenToUseLabel)}:</strong> ${pick(t, 'whenToUse').toLowerCase()}.</p>
                        </header>

                        <p class="goc-topic-summary">${pick(t, 'summary')}</p>

                        ${animBlock(t)}

                        <div class="goc-block">
                            <h3>${escapeHtml(APP_TRANSLATIONS[currentLanguage].howItWorks)}</h3>
                            <ul>${pick(t, 'howItWorks').map((item) => `<li>${item}</li>`).join('')}</ul>
                        </div>

                        ${t.samples
                            .map(
                                (sample, i) => `
                                    <div class="goc-block">
                                        <div class="goc-code-header">
                                            <h3>${escapeHtml(pick(sample, 'label'))}</h3>
                                            <button class="goc-copy-btn" data-topic="${t.id}" data-sample="${i}" aria-label="${escapeHtml(APP_TRANSLATIONS[currentLanguage].copyAriaLabel)}">
                                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="goc-copy-icon">
                                                    <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 17.25v3.375c0 .621-.504 1.125-1.125 1.125h-9.75a1.125 1.125 0 0 1-1.125-1.125V7.875c0-.621.504-1.125 1.125-1.125H6.75a9.06 9.06 0 0 1 1.5.124m7.5 10.376h3.375c.621 0 1.125-.504 1.125-1.125V11.25c0-4.46-3.243-8.161-7.5-8.876a9.06 9.06 0 0 0-1.5-.124H9.375c-.621 0-1.125.504-1.125 1.125v3.5m7.5 10.375H9.375a1.125 1.125 0 0 1-1.125-1.125v-9.25m12 6.625v-1.875a3.375 3.375 0 0 0-3.375-3.375h-1.5a1.125 1.125 0 0 1-1.125-1.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H9.75" />
                                                </svg>
                                                <span>${escapeHtml(APP_TRANSLATIONS[currentLanguage].copy)}</span>
                                            </button>
                                        </div>
                                        <pre class="goc-code-block"><code>${escapeHtml(sample.code)}</code></pre>
                                    </div>`
                            )
                            .join('')}

                        <div class="goc-block goc-watch-out">
                            <h3>${escapeHtml(APP_TRANSLATIONS[currentLanguage].watchOutFor)}</h3>
                            <ul>${pick(t, 'watchOut').map((item) => `<li>${item}</li>`).join('')}</ul>
                        </div>

                        <a href="#goc-index" class="goc-back-to-top">${escapeHtml(APP_TRANSLATIONS[currentLanguage].backToIndex)}</a>
                    </article>`
            )
            .join('');
    }

    function initAnimations() {
        scenes.forEach((scene) => scene.destroy());
        scenes.clear();
        details.querySelectorAll('.goc-anim').forEach((el) => {
            const id = el.dataset.anim;
            const def = GO_ANIMATIONS[id];
            if (!def) return;
            scenes.set(
                id,
                new GoAnimEngine.Scene({
                    canvas: el.querySelector('canvas'),
                    captionEl: el.querySelector('.goc-anim-caption'),
                    height: def.height,
                    script: def.run,
                })
            );
        });
    }

    function renderAll() {
        renderFilters();
        renderIndex();
        renderDetails();
        initAnimations();
    }

    filters.addEventListener('click', (e) => {
        const btn = e.target.closest('.goc-filter');
        if (!btn) return;
        activeCategory = btn.dataset.category;
        renderAll();
    });

    indexBody.addEventListener('click', (e) => {
        const row = e.target.closest('.goc-row');
        if (row) jumpTo(row.dataset.target);
    });

    indexBody.addEventListener('keydown', (e) => {
        if (e.key !== 'Enter' && e.key !== ' ') return;
        const row = e.target.closest('.goc-row');
        if (row) {
            e.preventDefault();
            jumpTo(row.dataset.target);
        }
    });

    function jumpTo(id) {
        const target = document.getElementById(id);
        if (target) {
            target.scrollIntoView({ behavior: 'smooth', block: 'start' });
            history.replaceState(null, '', '#' + id);
        }
    }

    details.addEventListener('click', (e) => {
        const animBtn = e.target.closest('.goc-anim-btn');
        if (animBtn) {
            const scene = scenes.get(animBtn.closest('.goc-anim').dataset.anim);
            if (!scene) return;
            const action = animBtn.dataset.action;
            if (action === 'toggle') {
                scene.playing = !scene.playing;
                animBtn.textContent = scene.playing ? t('pause') : t('play');
            } else if (action === 'restart') {
                scene.restart();
                scene.playing = true;
                animBtn.closest('.goc-anim').querySelector('[data-action="toggle"]').textContent = t('pause');
            } else if (action === 'speed') {
                scene.speed = scene.speed === 1 ? 2 : scene.speed === 2 ? 0.5 : 1;
                animBtn.innerHTML = String(scene.speed).replace('0.5', '½') + '&times;';
            }
            return;
        }

        const btn = e.target.closest('.goc-copy-btn');
        if (!btn) return;
        const topic = GO_TOPICS.find((t) => t.id === btn.dataset.topic);
        const sample = topic && topic.samples[Number(btn.dataset.sample)];
        if (!sample) return;

        navigator.clipboard.writeText(sample.code).then(() => {
            const label = btn.querySelector('span');
            label.textContent = t('copied');
            btn.classList.add('copied');
            setTimeout(() => {
                label.textContent = t('copy');
                btn.classList.remove('copied');
            }, 1600);
        });
    });

    // Exposes the current language to engine.js / animations.js so the
    // live canvas animations can pick translated captions and labels.
    window.GC_I18N = {
        get currentLanguage() {
            return currentLanguage;
        },
    };

    renderAll();

    // honor a deep link like /tools/go-concurrency/#worker-pools
    if (location.hash) {
        const target = document.getElementById(location.hash.slice(1));
        if (target) target.scrollIntoView({ block: 'start' });
    }

    window.gcSetLanguage = function (lang) {
        currentLanguage = lang === 'pt' ? 'pt' : 'en';
        renderAll();
    };
})();
