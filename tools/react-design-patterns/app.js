/* React Design Patterns — rendering logic
   Renders the quick-access index table and one detail card per pattern,
   with category filtering and copy-to-clipboard on code blocks.
   Depends on PATTERNS / CATEGORIES from patterns-data.js. */

(function () {
    const indexBody = document.getElementById('rdp-index-body');
    const details = document.getElementById('rdp-details');
    const filters = document.getElementById('rdp-filters');

    let activeCategory = 'All';
    let currentLanguage = 'en';

    const APP_TRANSLATIONS = {
        en: {
            allLabel: 'All',
            whenToUseLabel: 'When to use',
            howItWorks: 'How it works',
            watchOutFor: 'Watch out for',
            copy: 'Copy',
            copied: 'Copied!',
            copyFailed: 'Copy failed',
            copyAriaLabel: 'Copy code sample',
            backToIndex: '↑ Back to index',
            jumpTo: (name) => `Jump to ${name}`,
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
            copy: 'Copiar',
            copied: 'Copiado!',
            copyFailed: 'Falha ao copiar',
            copyAriaLabel: 'Copiar exemplo de código',
            backToIndex: '↑ Voltar ao índice',
            jumpTo: (name) => `Ir para ${name}`,
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

    function copyText(text) {
        if (navigator.clipboard && navigator.clipboard.writeText && window.isSecureContext) {
            return navigator.clipboard.writeText(text);
        }
        return new Promise((resolve, reject) => {
            try {
                const ta = document.createElement('textarea');
                ta.value = text;
                ta.setAttribute('readonly', '');
                ta.style.position = 'fixed';
                ta.style.top = '-9999px';
                document.body.appendChild(ta);
                ta.select();
                const ok = document.execCommand('copy');
                document.body.removeChild(ta);
                ok ? resolve() : reject(new Error('copy failed'));
            } catch (e) {
                reject(e);
            }
        });
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
        if (currentLanguage === 'pt' && CATEGORIES_PT[category] !== undefined) {
            return CATEGORIES_PT[category];
        }
        return category;
    }

    function badge(category) {
        return `<span class="rdp-badge rdp-badge--${CATEGORIES[category]}">${escapeHtml(categoryLabel(category))}</span>`;
    }

    function complexityLabel(level) {
        const key = { Low: 'complexityLow', Medium: 'complexityMedium', High: 'complexityHigh' }[level];
        return key ? t(key) : level;
    }

    function complexityDots(level) {
        const filled = { Low: 1, Medium: 2, High: 3 }[level] || 1;
        let dots = '';
        for (let i = 1; i <= 3; i++) {
            dots += `<span class="rdp-dot ${i <= filled ? 'is-filled' : ''}"></span>`;
        }
        const label = complexityLabel(level);
        return `<span class="rdp-complexity" title="${escapeHtml(t('complexityTitle')(label))}"><span class="rdp-dots">${dots}</span>${escapeHtml(label)}</span>`;
    }

    function visiblePatterns() {
        return activeCategory === 'All'
            ? PATTERNS
            : PATTERNS.filter((p) => p.category === activeCategory);
    }

    function renderFilters() {
        const categories = ['All', ...Object.keys(CATEGORIES)];
        filters.innerHTML = categories
            .map(
                (cat) => `
                    <button class="rdp-filter ${cat === activeCategory ? 'active' : ''}" data-category="${cat}">
                        ${escapeHtml(cat === 'All' ? t('allLabel') : categoryLabel(cat))}${cat === 'All' ? ` (${PATTERNS.length})` : ''}
                    </button>`
            )
            .join('');
    }

    function renderIndex() {
        indexBody.innerHTML = visiblePatterns()
            .map(
                (p) => `
                    <tr class="rdp-row" data-target="${p.id}" tabindex="0" role="link" aria-label="${escapeHtml(t('jumpTo')(pick(p, 'name')))}">
                        <td class="rdp-cell-name">${escapeHtml(pick(p, 'name'))}</td>
                        <td>${badge(p.category)}</td>
                        <td class="rdp-cell-when">${pick(p, 'whenToUse')}</td>
                        <td>${complexityDots(p.complexity)}</td>
                    </tr>`
            )
            .join('');
    }

    function renderDetails() {
        details.innerHTML = visiblePatterns()
            .map(
                (p) => `
                    <article class="rdp-pattern" id="${p.id}">
                        <header class="rdp-pattern-header">
                            <div class="rdp-pattern-meta">
                                ${badge(p.category)}
                                ${complexityDots(p.complexity)}
                            </div>
                            <h2 class="rdp-pattern-name">${escapeHtml(pick(p, 'name'))}</h2>
                            <p class="rdp-pattern-when"><strong>${escapeHtml(t('whenToUseLabel'))}:</strong> ${pick(p, 'whenToUse').toLowerCase()}.</p>
                        </header>

                        <p class="rdp-pattern-summary">${pick(p, 'summary')}</p>

                        <div class="rdp-block">
                            <h3>${escapeHtml(t('howItWorks'))}</h3>
                            <ul>${pick(p, 'howItWorks').map((item) => `<li>${item}</li>`).join('')}</ul>
                        </div>

                        ${p.samples
                            .map(
                                (sample, i) => `
                                    <div class="rdp-block">
                                        <div class="rdp-code-header">
                                            <h3>${escapeHtml(pick(sample, 'label'))}</h3>
                                            <button class="rdp-copy-btn" data-pattern="${p.id}" data-sample="${i}" aria-label="${escapeHtml(t('copyAriaLabel'))}">
                                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="rdp-copy-icon">
                                                    <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 17.25v3.375c0 .621-.504 1.125-1.125 1.125h-9.75a1.125 1.125 0 0 1-1.125-1.125V7.875c0-.621.504-1.125 1.125-1.125H6.75a9.06 9.06 0 0 1 1.5.124m7.5 10.376h3.375c.621 0 1.125-.504 1.125-1.125V11.25c0-4.46-3.243-8.161-7.5-8.876a9.06 9.06 0 0 0-1.5-.124H9.375c-.621 0-1.125.504-1.125 1.125v3.5m7.5 10.375H9.375a1.125 1.125 0 0 1-1.125-1.125v-9.25m12 6.625v-1.875a3.375 3.375 0 0 0-3.375-3.375h-1.5a1.125 1.125 0 0 1-1.125-1.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H9.75" />
                                                </svg>
                                                <span>${escapeHtml(t('copy'))}</span>
                                            </button>
                                        </div>
                                        <pre class="rdp-code-block"><code>${escapeHtml(sample.code)}</code></pre>
                                    </div>`
                            )
                            .join('')}

                        <div class="rdp-block rdp-watch-out">
                            <h3>${escapeHtml(t('watchOutFor'))}</h3>
                            <ul>${pick(p, 'watchOut').map((item) => `<li>${item}</li>`).join('')}</ul>
                        </div>

                        <a href="#rdp-index" class="rdp-back-to-top">${escapeHtml(t('backToIndex'))}</a>
                    </article>`
            )
            .join('');
    }

    function renderAll() {
        renderFilters();
        renderIndex();
        renderDetails();
    }

    filters.addEventListener('click', (e) => {
        const btn = e.target.closest('.rdp-filter');
        if (!btn) return;
        activeCategory = btn.dataset.category;
        renderAll();
    });

    indexBody.addEventListener('click', (e) => {
        const row = e.target.closest('.rdp-row');
        if (row) jumpTo(row.dataset.target);
    });

    indexBody.addEventListener('keydown', (e) => {
        if (e.key !== 'Enter' && e.key !== ' ') return;
        const row = e.target.closest('.rdp-row');
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
        const btn = e.target.closest('.rdp-copy-btn');
        if (!btn) return;
        const pattern = PATTERNS.find((p) => p.id === btn.dataset.pattern);
        const sample = pattern && pattern.samples[Number(btn.dataset.sample)];
        if (!sample) return;

        const label = btn.querySelector('span');
        copyText(sample.code).then(() => {
            label.textContent = t('copied');
            btn.classList.add('copied');
            setTimeout(() => {
                label.textContent = t('copy');
                btn.classList.remove('copied');
            }, 1600);
        }).catch(() => {
            label.textContent = t('copyFailed');
            setTimeout(() => { label.textContent = t('copy'); }, 1600);
        });
    });

    renderAll();

    // honor a deep link like /tools/react-design-patterns/#error-boundaries
    if (location.hash) {
        const target = document.getElementById(location.hash.slice(1));
        if (target) target.scrollIntoView({ block: 'start' });
    }

    window.rdpSetLanguage = function (lang) {
        currentLanguage = lang === 'pt' ? 'pt' : 'en';
        renderAll();
    };
})();
