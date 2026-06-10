(function () {
    const ALL_DETAILS = Object.assign({}, GW_STAGES, GW_COMMANDS);

    const detailEl = document.getElementById('gw-detail');
    const clickable = document.querySelectorAll('[data-detail]');

    function renderDetail(key) {
        const item = ALL_DETAILS[key];
        if (!item) return;

        clickable.forEach((el) => {
            el.classList.toggle('is-active', el.dataset.detail === key);
        });

        const parts = [];
        parts.push(`<span class="gw-detail-badge">${item.badge}</span>`);
        parts.push(`<h3 class="gw-detail-title">${item.title}</h3>`);
        parts.push(`<p class="gw-detail-desc">${mdCode(item.description)}</p>`);

        if (item.example) {
            parts.push(`<div class="gw-wire-label">Example</div>`);
            parts.push(`<pre class="gw-code">${escapeHtml(item.example)}</pre>`);
        }

        if (item.bullets && item.bullets.length) {
            parts.push(`<ul class="gw-detail-bullets">${item.bullets.map((b) => `<li>${mdCode(b)}</li>`).join('')}</ul>`);
        }

        if (item.notes) {
            parts.push(`<div class="gw-step-note"><span>💡</span><span>${mdCode(item.notes)}</span></div>`);
        }

        detailEl.innerHTML = parts.join('');
    }

    function escapeHtml(str) {
        return str
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;');
    }

    // Turns `backtick` spans into <code> elements for prose pulled from data.js.
    function mdCode(str) {
        return str.replace(/`([^`]+)`/g, (_, code) => `<code>${escapeHtml(code)}</code>`);
    }

    clickable.forEach((el) => {
        el.addEventListener('click', () => renderDetail(el.dataset.detail));
        el.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                renderDetail(el.dataset.detail);
            }
        });
    });

    // Default panel content.
    renderDetail('working');

    // Branching commands list.
    const branchList = document.getElementById('gw-branch-commands');
    if (branchList) {
        branchList.innerHTML = GW_BRANCH_COMMANDS.map((c) => `
            <li class="gw-branch-cmd">
                <code>${c.cmd}</code>
                <span>${mdCode(c.desc)}</span>
            </li>
        `).join('');
    }

    // Glossary grid.
    const glossaryGrid = document.getElementById('gw-glossary-grid');
    if (glossaryGrid) {
        glossaryGrid.innerHTML = GW_GLOSSARY.map((g) => `
            <div class="gw-glossary-card">
                <h3>${g.term}</h3>
                <p>${mdCode(g.definition)}</p>
            </div>
        `).join('');
    }

    // Command cheatsheet.
    const cheatWrap = document.getElementById('gw-cheatsheet');
    if (cheatWrap) {
        cheatWrap.innerHTML = GW_CHEATSHEET.map((group) => `
            <div class="gw-cheat-group">
                <h3 class="gw-cheat-category">${group.category}</h3>
                <div class="gw-cheat-rows">
                    ${group.items.map((item) => `
                        <div class="gw-cheat-row">
                            <code class="gw-cheat-cmd">${item.cmd}</code>
                            <span class="gw-cheat-desc">${mdCode(item.desc)}</span>
                            <button class="gw-copy-btn" type="button" data-copy="${escapeHtml(item.cmd)}" aria-label="Copy command">Copy</button>
                        </div>
                    `).join('')}
                </div>
            </div>
        `).join('');

        cheatWrap.addEventListener('click', (e) => {
            const btn = e.target.closest('.gw-copy-btn');
            if (!btn) return;
            const text = btn.dataset.copy;
            navigator.clipboard.writeText(text).then(() => {
                const original = btn.textContent;
                btn.textContent = 'Copied!';
                btn.classList.add('is-copied');
                setTimeout(() => {
                    btn.textContent = original;
                    btn.classList.remove('is-copied');
                }, 1200);
            });
        });
    }
})();
