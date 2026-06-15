(function () {
    const ALL_DETAILS = Object.assign({}, GW_STAGES, GW_COMMANDS);

    const detailEl = document.getElementById('gw-detail');
    const clickable = document.querySelectorAll('[data-detail]');

    // Translations for strings rendered dynamically by this script
    // (the page chrome's translations live in the inline script in index.html).
    const APP_TRANSLATIONS = {
        en: {
            example: 'Example',
            copy: 'Copy',
            copied: 'Copied!',
            copyFailed: 'Copy failed',
            copyAriaLabel: 'Copy command',
        },
        pt: {
            example: 'Exemplo',
            copy: 'Copiar',
            copied: 'Copiado!',
            copyFailed: 'Falha ao copiar',
            copyAriaLabel: 'Copiar comando',
        },
    };

    let currentLanguage = 'en';
    let activeDetailKey = 'working';

    function t(key) {
        return (APP_TRANSLATIONS[currentLanguage] && APP_TRANSLATIONS[currentLanguage][key]) || APP_TRANSLATIONS.en[key];
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

    // Returns the `${field}_pt` value when in pt and present, else falls back to `field`.
    function pick(item, field) {
        if (currentLanguage === 'pt' && item[`${field}_pt`] !== undefined) {
            return item[`${field}_pt`];
        }
        return item[field];
    }

    function renderDetail(key) {
        const item = ALL_DETAILS[key];
        if (!item) return;

        activeDetailKey = key;

        clickable.forEach((el) => {
            el.classList.toggle('is-active', el.dataset.detail === key);
        });

        const parts = [];
        parts.push(`<span class="gw-detail-badge">${pick(item, 'badge')}</span>`);
        parts.push(`<h3 class="gw-detail-title">${pick(item, 'title')}</h3>`);
        parts.push(`<p class="gw-detail-desc">${mdCode(pick(item, 'description'))}</p>`);

        const example = pick(item, 'example');
        if (example) {
            parts.push(`<div class="gw-wire-label">${t('example')}</div>`);
            parts.push(`<pre class="gw-code">${escapeHtml(example)}</pre>`);
        }

        const bullets = pick(item, 'bullets');
        if (bullets && bullets.length) {
            parts.push(`<ul class="gw-detail-bullets">${bullets.map((b) => `<li>${mdCode(b)}</li>`).join('')}</ul>`);
        }

        const notes = pick(item, 'notes');
        if (notes) {
            parts.push(`<div class="gw-step-note"><span>💡</span><span>${mdCode(notes)}</span></div>`);
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

    function renderBranchCommands() {
        const branchList = document.getElementById('gw-branch-commands');
        if (!branchList) return;
        branchList.innerHTML = GW_BRANCH_COMMANDS.map((c) => `
            <li class="gw-branch-cmd">
                <code>${c.cmd}</code>
                <span>${mdCode(pick(c, 'desc'))}</span>
            </li>
        `).join('');
    }

    function renderGlossary() {
        const glossaryGrid = document.getElementById('gw-glossary-grid');
        if (!glossaryGrid) return;
        glossaryGrid.innerHTML = GW_GLOSSARY.map((g) => `
            <div class="gw-glossary-card">
                <h3>${pick(g, 'term')}</h3>
                <p>${mdCode(pick(g, 'definition'))}</p>
            </div>
        `).join('');
    }

    function renderCheatsheet() {
        const cheatWrap = document.getElementById('gw-cheatsheet');
        if (!cheatWrap) return;
        cheatWrap.innerHTML = GW_CHEATSHEET.map((group) => `
            <div class="gw-cheat-group">
                <h3 class="gw-cheat-category">${pick(group, 'category')}</h3>
                <div class="gw-cheat-rows">
                    ${group.items.map((item) => `
                        <div class="gw-cheat-row">
                            <code class="gw-cheat-cmd">${item.cmd}</code>
                            <span class="gw-cheat-desc">${mdCode(pick(item, 'desc'))}</span>
                            <button class="gw-copy-btn" type="button" data-copy="${escapeHtml(item.cmd)}" aria-label="${t('copyAriaLabel')}">${t('copy')}</button>
                        </div>
                    `).join('')}
                </div>
            </div>
        `).join('');
    }

    function renderAll() {
        renderDetail(activeDetailKey);
        renderBranchCommands();
        renderGlossary();
        renderCheatsheet();
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

    const cheatWrap = document.getElementById('gw-cheatsheet');
    if (cheatWrap) {
        cheatWrap.addEventListener('click', (e) => {
            const btn = e.target.closest('.gw-copy-btn');
            if (!btn) return;
            const text = btn.dataset.copy;
            const original = btn.textContent;
            copyText(text).then(() => {
                btn.textContent = t('copied');
                btn.classList.add('is-copied');
                setTimeout(() => {
                    btn.textContent = original;
                    btn.classList.remove('is-copied');
                }, 1200);
            }).catch(() => {
                btn.textContent = t('copyFailed');
                setTimeout(() => { btn.textContent = original; }, 1200);
            });
        });
    }

    // Exposed so the inline script in index.html can keep this page's
    // dynamic content (detail panel, branch commands, glossary, cheatsheet)
    // in sync with the language toggle.
    window.gwSetLanguage = function (lang) {
        currentLanguage = lang === 'pt' ? 'pt' : 'en';
        renderAll();
    };

    renderAll();
})();
