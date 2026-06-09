/* React Design Patterns — rendering logic
   Renders the quick-access index table and one detail card per pattern,
   with category filtering and copy-to-clipboard on code blocks.
   Depends on PATTERNS / CATEGORIES from patterns-data.js. */

(function () {
    const indexBody = document.getElementById('rdp-index-body');
    const details = document.getElementById('rdp-details');
    const filters = document.getElementById('rdp-filters');

    let activeCategory = 'All';

    function escapeHtml(str) {
        return str
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;');
    }

    function badge(category) {
        return `<span class="rdp-badge rdp-badge--${CATEGORIES[category]}">${category}</span>`;
    }

    function complexityDots(level) {
        const filled = { Low: 1, Medium: 2, High: 3 }[level] || 1;
        let dots = '';
        for (let i = 1; i <= 3; i++) {
            dots += `<span class="rdp-dot ${i <= filled ? 'is-filled' : ''}"></span>`;
        }
        return `<span class="rdp-complexity" title="${level} complexity"><span class="rdp-dots">${dots}</span>${level}</span>`;
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
                        ${cat}${cat === 'All' ? ` (${PATTERNS.length})` : ''}
                    </button>`
            )
            .join('');
    }

    function renderIndex() {
        indexBody.innerHTML = visiblePatterns()
            .map(
                (p) => `
                    <tr class="rdp-row" data-target="${p.id}" tabindex="0" role="link" aria-label="Jump to ${p.name}">
                        <td class="rdp-cell-name">${p.name}</td>
                        <td>${badge(p.category)}</td>
                        <td class="rdp-cell-when">${p.whenToUse}</td>
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
                            <h2 class="rdp-pattern-name">${p.name}</h2>
                            <p class="rdp-pattern-when"><strong>When to use:</strong> ${p.whenToUse.toLowerCase()}.</p>
                        </header>

                        <p class="rdp-pattern-summary">${p.summary}</p>

                        <div class="rdp-block">
                            <h3>How it works</h3>
                            <ul>${p.howItWorks.map((item) => `<li>${item}</li>`).join('')}</ul>
                        </div>

                        ${p.samples
                            .map(
                                (sample, i) => `
                                    <div class="rdp-block">
                                        <div class="rdp-code-header">
                                            <h3>${escapeHtml(sample.label)}</h3>
                                            <button class="rdp-copy-btn" data-pattern="${p.id}" data-sample="${i}" aria-label="Copy code sample">
                                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="rdp-copy-icon">
                                                    <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 17.25v3.375c0 .621-.504 1.125-1.125 1.125h-9.75a1.125 1.125 0 0 1-1.125-1.125V7.875c0-.621.504-1.125 1.125-1.125H6.75a9.06 9.06 0 0 1 1.5.124m7.5 10.376h3.375c.621 0 1.125-.504 1.125-1.125V11.25c0-4.46-3.243-8.161-7.5-8.876a9.06 9.06 0 0 0-1.5-.124H9.375c-.621 0-1.125.504-1.125 1.125v3.5m7.5 10.375H9.375a1.125 1.125 0 0 1-1.125-1.125v-9.25m12 6.625v-1.875a3.375 3.375 0 0 0-3.375-3.375h-1.5a1.125 1.125 0 0 1-1.125-1.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H9.75" />
                                                </svg>
                                                <span>Copy</span>
                                            </button>
                                        </div>
                                        <pre class="rdp-code-block"><code>${escapeHtml(sample.code)}</code></pre>
                                    </div>`
                            )
                            .join('')}

                        <div class="rdp-block rdp-watch-out">
                            <h3>Watch out for</h3>
                            <ul>${p.watchOut.map((item) => `<li>${item}</li>`).join('')}</ul>
                        </div>

                        <a href="#rdp-index" class="rdp-back-to-top">↑ Back to index</a>
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

        navigator.clipboard.writeText(sample.code).then(() => {
            const label = btn.querySelector('span');
            label.textContent = 'Copied!';
            btn.classList.add('copied');
            setTimeout(() => {
                label.textContent = 'Copy';
                btn.classList.remove('copied');
            }, 1600);
        });
    });

    renderAll();

    // honor a deep link like /tools/react-design-patterns/#error-boundaries
    if (location.hash) {
        const target = document.getElementById(location.hash.slice(1));
        if (target) target.scrollIntoView({ block: 'start' });
    }
})();
