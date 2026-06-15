(function () {
    'use strict';

    // ── constants ────────────────────────────────────────────────────────────
    const TABLE_W  = 215;
    const HEAD_H   = 37;
    const ROW_H    = 30;
    const INNER_W  = 1800;
    const INNER_H  = 900;

    const COL_TYPES = [
        'INT', 'BIGINT', 'SMALLINT', 'TINYINT',
        'FLOAT', 'DOUBLE', 'DECIMAL(10,2)',
        'VARCHAR(255)', 'VARCHAR(100)', 'VARCHAR(50)',
        'CHAR(1)', 'TEXT', 'MEDIUMTEXT',
        'BOOLEAN', 'DATE', 'DATETIME', 'TIMESTAMP',
        'UUID', 'JSON', 'BLOB',
    ];

    // ── translations ─────────────────────────────────────────────────────────
    let currentLanguage = 'en';

    const APP_TRANSLATIONS = {
        en: {
            deleteTableAria: (name) => 'Delete table ' + name,
            deleteTableConfirm: (name) => 'Delete table "' + name + '"?',
            tableProperties: 'Table Properties',
            nameLabel: 'Name',
            tableNamePlaceholder: 'table_name',
            columnsLabel: (count) => 'Columns (' + count + ')',
            typeLabel: 'Type',
            columnNamePlaceholder: 'column_name',
            pkCheckbox: 'PK',
            notNullCheckbox: 'NOT NULL',
            uniqueCheckbox: 'UNIQUE',
            referencesLabel: 'References (FK → Table)',
            fkColumnLabel: '↳ Column',
            fkNoneOption: '— none —',
            removeColumnBtn: 'Remove column',
            addColumnBtn: '+ Add Column',
            noTablesComment: '-- No tables defined yet.',
            replaceSampleConfirm: 'Replace the current schema with the sample?',
            clearAllConfirm: 'Clear all tables?',
            copiedLabel: 'Copied!',
            copyToClipboardBtn: 'Copy to Clipboard',
            copyFailedLabel: 'Copy failed',
            editorEmptyHint: 'Click a table on the canvas to edit it.',
            missingTablesArray: 'Missing tables array',
            couldNotLoadSchema: (msg) => 'Could not load schema: ' + msg,
            newTableName: 'new_table',
            newColumnNamePrefix: 'column_',
        },
        pt: {
            deleteTableAria: (name) => 'Excluir tabela ' + name,
            deleteTableConfirm: (name) => 'Excluir a tabela "' + name + '"?',
            tableProperties: 'Propriedades da Tabela',
            nameLabel: 'Nome',
            tableNamePlaceholder: 'table_name',
            columnsLabel: (count) => 'Colunas (' + count + ')',
            typeLabel: 'Tipo',
            columnNamePlaceholder: 'column_name',
            pkCheckbox: 'PK',
            notNullCheckbox: 'NOT NULL',
            uniqueCheckbox: 'UNIQUE',
            referencesLabel: 'Referências (FK → Tabela)',
            fkColumnLabel: '↳ Coluna',
            fkNoneOption: '— nenhuma —',
            removeColumnBtn: 'Remover coluna',
            addColumnBtn: '+ Adicionar Coluna',
            noTablesComment: '-- Nenhuma tabela definida ainda.',
            replaceSampleConfirm: 'Substituir o esquema atual pelo exemplo?',
            clearAllConfirm: 'Limpar todas as tabelas?',
            copiedLabel: 'Copiado!',
            copyToClipboardBtn: 'Copiar para a Área de Transferência',
            copyFailedLabel: 'Falha ao copiar',
            editorEmptyHint: 'Clique em uma tabela no canvas para editá-la.',
            missingTablesArray: 'Array de tabelas ausente',
            couldNotLoadSchema: (msg) => 'Não foi possível carregar o esquema: ' + msg,
            newTableName: 'new_table',
            newColumnNamePrefix: 'column_',
        },
    };

    // Named `tr` (rather than `t`) because `t` is used pervasively throughout
    // this file as the local variable name for a "table" object.
    function tr(key) {
        const value = (APP_TRANSLATIONS[currentLanguage] && APP_TRANSLATIONS[currentLanguage][key] !== undefined)
            ? APP_TRANSLATIONS[currentLanguage][key]
            : APP_TRANSLATIONS.en[key];
        return value;
    }

    function pick(item, field) {
        if (currentLanguage === 'pt' && item[field + '_pt'] !== undefined) {
            return item[field + '_pt'];
        }
        return item[field];
    }

    // ── state ────────────────────────────────────────────────────────────────
    const S = {
        tables:     [],
        selectedId: null,
        dragging:   null,   // { tableId, offX, offY }
        _id:        1,
    };

    function uid() { return 'i' + (S._id++); }

    // ── data helpers ─────────────────────────────────────────────────────────
    function tbl(id)       { return S.tables.find(t => t.id === id); }
    function col(tId, cId) { const t = tbl(tId); return t && t.columns.find(c => c.id === cId); }
    function tblH(t)       { return HEAD_H + t.columns.length * ROW_H; }

    function relationships() {
        const out = [];
        for (const t of S.tables) {
            for (const c of t.columns) {
                if (c.fk && c.fk.tableId) {
                    const ref = tbl(c.fk.tableId);
                    if (ref) out.push({ fromTbl: t, fromCol: c, toTbl: ref, toColId: c.fk.colId });
                }
            }
        }
        return out;
    }

    // ── actions ──────────────────────────────────────────────────────────────
    function addTable() {
        const n  = S.tables.length;
        const id = uid();
        S.tables.push({
            id,
            name: tr('newTableName'),
            x: 24 + (n % 5) * 240,
            y: 24 + Math.floor(n / 5) * 220,
            columns: [mkCol('id', 'INT', true, true, true)],
        });
        S.selectedId = id;
        render();
    }

    function mkCol(name, type, isPk, isNn, isUq) {
        return { id: uid(), name, type, isPk: !!isPk, isNn: !!isNn, isUq: !!isUq, fk: null };
    }

    function delTable(id) {
        // clear FK references pointing at this table
        S.tables.forEach(t => t.columns.forEach(c => {
            if (c.fk && c.fk.tableId === id) c.fk = null;
        }));
        S.tables = S.tables.filter(t => t.id !== id);
        if (S.selectedId === id) S.selectedId = null;
        render();
    }

    function addCol(tableId) {
        const t = tbl(tableId);
        if (!t) return;
        t.columns.push(mkCol(tr('newColumnNamePrefix') + (t.columns.length + 1), 'VARCHAR(255)', false, false, false));
        render();
    }

    function delCol(tableId, colId) {
        const t = tbl(tableId);
        if (!t) return;
        t.columns = t.columns.filter(c => c.id !== colId);
        render();
    }

    // ── rendering ────────────────────────────────────────────────────────────
    function render() {
        renderTables();
        renderLines();
        renderEditor();
        document.getElementById('rdb-empty-hint').style.display = S.tables.length ? 'none' : '';
    }

    // replace a single table node without touching the rest of the canvas
    function rerenderTableNode(id) {
        const t = tbl(id);
        if (!t) return;
        const old = document.getElementById('rdb-node-' + id);
        if (old) old.replaceWith(buildNode(t));
        renderLines();
    }

    function renderTables() {
        const inner = document.getElementById('rdb-canvas-inner');
        inner.querySelectorAll('.rdb-table').forEach(n => n.remove());
        S.tables.forEach(t => inner.appendChild(buildNode(t)));
    }

    function buildNode(t) {
        const root = ce('div');
        root.className = 'rdb-table' + (t.id === S.selectedId ? ' is-selected' : '');
        root.id = 'rdb-node-' + t.id;
        root.style.cssText = 'left:' + t.x + 'px;top:' + t.y + 'px';

        // header
        const head = ce('div');
        head.className = 'rdb-table-head';

        const title = ce('span');
        title.className = 'rdb-table-title';
        title.textContent = t.name;

        const del = ce('button');
        del.className = 'rdb-table-del';
        del.setAttribute('aria-label', tr('deleteTableAria')(t.name));
        del.textContent = '×';
        del.addEventListener('click', function (e) {
            e.stopPropagation();
            if (confirm(tr('deleteTableConfirm')(t.name))) delTable(t.id);
        });

        head.appendChild(title);
        head.appendChild(del);

        // drag on header
        head.addEventListener('mousedown', function (e) {
            if (e.button !== 0 || e.target === del) return;
            e.preventDefault();
            var wrap = document.getElementById('rdb-canvas-wrap');
            var wr = wrap.getBoundingClientRect();
            S.dragging = {
                tableId: t.id,
                offX: e.clientX - wr.left + wrap.scrollLeft - t.x,
                offY: e.clientY - wr.top  + wrap.scrollTop  - t.y,
            };
            selectTable(t.id);
        });

        root.appendChild(head);

        // column rows
        t.columns.forEach(function (c) {
            var row = ce('div');
            row.className = 'rdb-col-row';
            if (c.isPk) {
                var pk = ce('span');
                pk.className = 'rdb-badge rdb-badge-pk';
                pk.textContent = 'PK';
                row.appendChild(pk);
            }
            if (c.fk && c.fk.tableId) {
                var fk = ce('span');
                fk.className = 'rdb-badge rdb-badge-fk';
                fk.textContent = 'FK';
                row.appendChild(fk);
            }
            var nm = ce('span');
            nm.className = 'rdb-col-name';
            nm.textContent = c.name;
            var tp = ce('span');
            tp.className = 'rdb-col-type';
            tp.textContent = c.type;
            row.appendChild(nm);
            row.appendChild(tp);
            root.appendChild(row);
        });

        // click to select
        root.addEventListener('click', function (e) {
            if (e.target === del) return;
            selectTable(t.id);
        });

        return root;
    }

    function selectTable(id) {
        S.selectedId = id;
        document.querySelectorAll('.rdb-table').forEach(function (n) {
            n.classList.toggle('is-selected', n.id === 'rdb-node-' + id);
        });
        renderEditor();
    }

    // ── SVG relationship lines ────────────────────────────────────────────────
    function renderLines() {
        var svg = document.getElementById('rdb-svg');
        svg.innerHTML = '';

        relationships().forEach(function (rel) {
            var fT = rel.fromTbl, tT = rel.toTbl;
            var fH = tblH(fT), tH = tblH(tT);
            var x1, y1, x2, y2, cp1x, cp1y, cp2x, cp2y;

            if (fT.x + TABLE_W + 18 < tT.x) {
                // from is left of to
                x1 = fT.x + TABLE_W; y1 = fT.y + fH / 2;
                x2 = tT.x;           y2 = tT.y + tH / 2;
                var d = Math.abs(x2 - x1) * 0.46;
                cp1x = x1 + d; cp1y = y1; cp2x = x2 - d; cp2y = y2;
            } else if (tT.x + TABLE_W + 18 < fT.x) {
                // from is right of to
                x1 = fT.x;           y1 = fT.y + fH / 2;
                x2 = tT.x + TABLE_W; y2 = tT.y + tH / 2;
                var d2 = Math.abs(x1 - x2) * 0.46;
                cp1x = x1 - d2; cp1y = y1; cp2x = x2 + d2; cp2y = y2;
            } else if (fT.y + fH < tT.y) {
                // from is above to
                x1 = fT.x + TABLE_W / 2; y1 = fT.y + fH;
                x2 = tT.x + TABLE_W / 2; y2 = tT.y;
                var d3 = Math.abs(y2 - y1) * 0.46;
                cp1x = x1; cp1y = y1 + d3; cp2x = x2; cp2y = y2 - d3;
            } else {
                // from is below to
                x1 = fT.x + TABLE_W / 2; y1 = fT.y;
                x2 = tT.x + TABLE_W / 2; y2 = tT.y + tH;
                var d4 = Math.abs(y1 - y2) * 0.46;
                cp1x = x1; cp1y = y1 - d4; cp2x = x2; cp2y = y2 + d4;
            }

            // lookup ref col name for tooltip
            var refColName = '';
            var refColObj = tT.columns.find(function (c) { return c.id === rel.toColId; });
            if (!refColObj) refColObj = tT.columns.find(function (c) { return c.isPk; });
            if (!refColObj) refColObj = tT.columns[0];
            if (refColObj) refColName = refColObj.name;

            var path = svgEl('path');
            path.setAttribute('class', 'rdb-rel-path');
            path.setAttribute('d', 'M' + x1 + ' ' + y1 + ' C' + cp1x + ' ' + cp1y + ',' + cp2x + ' ' + cp2y + ',' + x2 + ' ' + y2);
            var tip = svgEl('title');
            tip.textContent = fT.name + '.' + rel.fromCol.name + '  →  ' + tT.name + '.' + refColName;
            path.appendChild(tip);
            svg.appendChild(path);

            // arrowhead at (x2,y2)
            var ang = Math.atan2(y2 - cp2y, x2 - cp2x);
            var AL = 9, AW = 0.42;
            var ax1 = x2 - AL * Math.cos(ang - AW), ay1 = y2 - AL * Math.sin(ang - AW);
            var ax2 = x2 - AL * Math.cos(ang + AW), ay2 = y2 - AL * Math.sin(ang + AW);
            var arrow = svgEl('path');
            arrow.setAttribute('class', 'rdb-rel-arrow');
            arrow.setAttribute('d', 'M' + x2 + ' ' + y2 + ' L' + ax1 + ' ' + ay1 + ' L' + ax2 + ' ' + ay2 + ' Z');
            svg.appendChild(arrow);

            // origin dot (one-side marker)
            var dot = svgEl('circle');
            dot.setAttribute('class', 'rdb-rel-dot');
            dot.setAttribute('cx', x1);
            dot.setAttribute('cy', y1);
            dot.setAttribute('r', 3.5);
            svg.appendChild(dot);
        });
    }

    // ── editor panel ─────────────────────────────────────────────────────────
    function renderEditor() {
        var panel = document.getElementById('rdb-editor');

        if (!S.selectedId) {
            panel.innerHTML = '<p class="text-sm text-[var(--text-secondary)]">' + esc(tr('editorEmptyHint')) + '</p>';
            return;
        }

        var t = tbl(S.selectedId);
        if (!t) { S.selectedId = null; renderEditor(); return; }

        var otherTbls = S.tables.filter(function (x) { return x.id !== t.id; });

        var html = '<h3 class="text-sm font-semibold text-[var(--text-primary)] mb-3">' + esc(tr('tableProperties')) + '</h3>';
        html += '<div class="mb-4">';
        html += '<label class="rdb-field-label" for="rdb-tbl-name">' + esc(tr('nameLabel')) + '</label>';
        html += '<input id="rdb-tbl-name" class="rdb-input" value="' + esc(t.name) + '" placeholder="' + esc(tr('tableNamePlaceholder')) + '" autocomplete="off" spellcheck="false">';
        html += '</div>';
        html += '<hr class="rdb-divider">';
        html += '<div class="flex items-center justify-between mb-3">';
        html += '<span class="rdb-field-label mb-0">' + esc(tr('columnsLabel')(t.columns.length)) + '</span>';
        html += '</div>';

        t.columns.forEach(function (c) {
            var typeOpts = COL_TYPES.map(function (tp) {
                return '<option value="' + tp + '"' + (c.type === tp ? ' selected' : '') + '>' + tp + '</option>';
            }).join('');

            var fkTblOpts = '<option value="">' + esc(tr('fkNoneOption')) + '</option>' +
                otherTbls.map(function (ot) {
                    return '<option value="' + ot.id + '"' + (c.fk && c.fk.tableId === ot.id ? ' selected' : '') + '>' + esc(ot.name) + '</option>';
                }).join('');

            var fkColSection = '';
            if (c.fk && c.fk.tableId) {
                var refT = tbl(c.fk.tableId);
                if (refT) {
                    var fkColOpts = refT.columns.map(function (rc) {
                        return '<option value="' + rc.id + '"' + (c.fk.colId === rc.id ? ' selected' : '') + '>' + esc(rc.name) + '</option>';
                    }).join('');
                    fkColSection = '<div class="mt-1"><label class="rdb-field-label">' + esc(tr('fkColumnLabel')) + '</label><select class="rdb-select rdb-fkc" data-col="' + c.id + '">' + fkColOpts + '</select></div>';
                }
            }

            html += '<div class="rdb-col-editor" data-col-id="' + c.id + '">';
            html += '<div class="grid grid-cols-2 gap-2 mb-2">';
            html += '<div><label class="rdb-field-label" for="rdb-cn-' + c.id + '">' + esc(tr('nameLabel')) + '</label>';
            html += '<input id="rdb-cn-' + c.id + '" class="rdb-input rdb-cn" data-col="' + c.id + '" value="' + esc(c.name) + '" placeholder="' + esc(tr('columnNamePlaceholder')) + '" autocomplete="off" spellcheck="false"></div>';
            html += '<div><label class="rdb-field-label">' + esc(tr('typeLabel')) + '</label>';
            html += '<select class="rdb-select rdb-ct" data-col="' + c.id + '">' + typeOpts + '</select></div>';
            html += '</div>';
            html += '<div class="rdb-checks mb-2">';
            html += '<label class="rdb-check-label"><input type="checkbox" class="rdb-pk" data-col="' + c.id + '"' + (c.isPk ? ' checked' : '') + '> ' + esc(tr('pkCheckbox')) + '</label>';
            html += '<label class="rdb-check-label"><input type="checkbox" class="rdb-nn" data-col="' + c.id + '"' + (c.isNn ? ' checked' : '') + '> ' + esc(tr('notNullCheckbox')) + '</label>';
            html += '<label class="rdb-check-label"><input type="checkbox" class="rdb-uq" data-col="' + c.id + '"' + (c.isUq ? ' checked' : '') + '> ' + esc(tr('uniqueCheckbox')) + '</label>';
            html += '</div>';
            html += '<div><label class="rdb-field-label">' + esc(tr('referencesLabel')) + '</label>';
            html += '<select class="rdb-select rdb-fkt" data-col="' + c.id + '">' + fkTblOpts + '</select>';
            html += fkColSection + '</div>';
            html += '<div class="flex justify-end mt-2">';
            html += '<button class="rdb-col-del text-xs text-[var(--text-secondary)] hover:text-red-500 transition-colors cursor-pointer bg-none border-none" data-col="' + c.id + '">' + esc(tr('removeColumnBtn')) + '</button>';
            html += '</div>';
            html += '</div>';
        });

        html += '<button class="rdb-add-col-btn" id="rdb-add-col">' + esc(tr('addColumnBtn')) + '</button>';
        panel.innerHTML = html;

        // ── bind events ──
        document.getElementById('rdb-tbl-name').addEventListener('input', function (e) {
            t.name = e.target.value;
            var titleEl = document.querySelector('#rdb-node-' + t.id + ' .rdb-table-title');
            if (titleEl) titleEl.textContent = e.target.value;
        });

        document.getElementById('rdb-add-col').addEventListener('click', function () {
            addCol(t.id);
        });

        panel.querySelectorAll('.rdb-cn').forEach(function (inp) {
            inp.addEventListener('input', function (e) {
                var c = col(t.id, e.target.dataset.col);
                if (c) { c.name = e.target.value; rerenderTableNode(t.id); }
            });
        });

        panel.querySelectorAll('.rdb-ct').forEach(function (sel) {
            sel.addEventListener('change', function (e) {
                var c = col(t.id, e.target.dataset.col);
                if (c) { c.type = e.target.value; rerenderTableNode(t.id); }
            });
        });

        panel.querySelectorAll('.rdb-pk').forEach(function (cb) {
            cb.addEventListener('change', function (e) {
                var c = col(t.id, e.target.dataset.col);
                if (c) { c.isPk = e.target.checked; rerenderTableNode(t.id); }
            });
        });

        panel.querySelectorAll('.rdb-nn').forEach(function (cb) {
            cb.addEventListener('change', function (e) {
                var c = col(t.id, e.target.dataset.col);
                if (c) c.isNn = e.target.checked;
            });
        });

        panel.querySelectorAll('.rdb-uq').forEach(function (cb) {
            cb.addEventListener('change', function (e) {
                var c = col(t.id, e.target.dataset.col);
                if (c) c.isUq = e.target.checked;
            });
        });

        panel.querySelectorAll('.rdb-fkt').forEach(function (sel) {
            sel.addEventListener('change', function (e) {
                var c = col(t.id, e.target.dataset.col);
                if (!c) return;
                var refId = e.target.value;
                if (!refId) {
                    c.fk = null;
                } else {
                    var refT = tbl(refId);
                    var defCol = refT && (refT.columns.find(function (rc) { return rc.isPk; }) || refT.columns[0]);
                    c.fk = { tableId: refId, colId: defCol ? defCol.id : null };
                }
                render();
            });
        });

        panel.querySelectorAll('.rdb-fkc').forEach(function (sel) {
            sel.addEventListener('change', function (e) {
                var c = col(t.id, e.target.dataset.col);
                if (c && c.fk) { c.fk.colId = e.target.value; renderLines(); }
            });
        });

        panel.querySelectorAll('.rdb-col-del').forEach(function (btn) {
            btn.addEventListener('click', function (e) {
                delCol(t.id, e.target.dataset.col);
            });
        });
    }

    // ── drag ─────────────────────────────────────────────────────────────────
    document.addEventListener('mousemove', function (e) {
        if (!S.dragging) return;
        var wrap = document.getElementById('rdb-canvas-wrap');
        var wr = wrap.getBoundingClientRect();
        var t = tbl(S.dragging.tableId);
        if (!t) return;

        var x = e.clientX - wr.left + wrap.scrollLeft - S.dragging.offX;
        var y = e.clientY - wr.top  + wrap.scrollTop  - S.dragging.offY;

        t.x = Math.max(0, Math.min(x, INNER_W - TABLE_W));
        t.y = Math.max(0, Math.min(y, INNER_H - tblH(t)));

        var el = document.getElementById('rdb-node-' + t.id);
        if (el) { el.style.left = t.x + 'px'; el.style.top = t.y + 'px'; }
        renderLines();
    });

    document.addEventListener('mouseup', function () { S.dragging = null; });

    // ── SQL generation ────────────────────────────────────────────────────────
    function genSQL() {
        if (!S.tables.length) return tr('noTablesComment');
        var sql = '';

        S.tables.forEach(function (t) {
            sql += 'CREATE TABLE `' + t.name + '` (\n';
            var defs = t.columns.map(function (c) {
                var d = '  `' + c.name + '` ' + c.type;
                if (c.isNn && !c.isPk) d += ' NOT NULL';
                if (c.isUq && !c.isPk) d += ' UNIQUE';
                return d;
            });
            var pks = t.columns.filter(function (c) { return c.isPk; }).map(function (c) { return '`' + c.name + '`'; });
            if (pks.length) defs.push('  PRIMARY KEY (' + pks.join(', ') + ')');
            sql += defs.join(',\n') + '\n);\n\n';
        });

        var rels = relationships();
        if (rels.length) {
            rels.forEach(function (r) {
                var refColObj = r.toTbl.columns.find(function (c) { return c.id === r.toColId; })
                             || r.toTbl.columns.find(function (c) { return c.isPk; })
                             || r.toTbl.columns[0];
                var refName = refColObj ? refColObj.name : 'id';
                sql += 'ALTER TABLE `' + r.fromTbl.name + '`\n';
                sql += '  ADD FOREIGN KEY (`' + r.fromCol.name + '`)\n';
                sql += '  REFERENCES `' + r.toTbl.name + '`(`' + refName + '`);\n\n';
            });
        }

        return sql.trim();
    }

    // ── sample schema ─────────────────────────────────────────────────────────
    function loadSample() {
        if (S.tables.length && !confirm(tr('replaceSampleConfirm'))) return;
        S.tables = []; S._id = 1; S.selectedId = null;

        var uId   = uid(), uIdC = uid(), uEmailC = uid(), uNameC = uid(), uCreatedC = uid();
        var pId   = uid(), pIdC = uid(), pUIdC   = uid(), pTitleC = uid(), pBodyC = uid(), pCreatedC = uid();
        var cId   = uid(), cIdC = uid(), cPIdC   = uid(), cUIdC   = uid(), cBodyC  = uid();
        var gId   = uid(), gIdC = uid(), gNameC  = uid();
        var jId   = uid(), jPIdC = uid(), jGIdC  = uid();

        S.tables = [
            {
                id: uId, name: 'users', x: 28, y: 48,
                columns: [
                    { id: uIdC,      name: 'id',         type: 'INT',          isPk: true,  isNn: true,  isUq: true,  fk: null },
                    { id: uEmailC,   name: 'email',       type: 'VARCHAR(255)', isPk: false, isNn: true,  isUq: true,  fk: null },
                    { id: uNameC,    name: 'name',        type: 'VARCHAR(100)', isPk: false, isNn: false, isUq: false, fk: null },
                    { id: uCreatedC, name: 'created_at',  type: 'TIMESTAMP',    isPk: false, isNn: true,  isUq: false, fk: null },
                ],
            },
            {
                id: pId, name: 'posts', x: 310, y: 28,
                columns: [
                    { id: pIdC,      name: 'id',         type: 'INT',          isPk: true,  isNn: true,  isUq: true,  fk: null },
                    { id: pUIdC,     name: 'user_id',     type: 'INT',          isPk: false, isNn: true,  isUq: false, fk: { tableId: uId,  colId: uIdC  } },
                    { id: pTitleC,   name: 'title',       type: 'VARCHAR(255)', isPk: false, isNn: true,  isUq: false, fk: null },
                    { id: pBodyC,    name: 'body',        type: 'TEXT',         isPk: false, isNn: false, isUq: false, fk: null },
                    { id: pCreatedC, name: 'created_at',  type: 'TIMESTAMP',    isPk: false, isNn: true,  isUq: false, fk: null },
                ],
            },
            {
                id: cId, name: 'comments', x: 590, y: 120,
                columns: [
                    { id: cIdC,   name: 'id',       type: 'INT',  isPk: true,  isNn: true,  isUq: true,  fk: null },
                    { id: cPIdC,  name: 'post_id',   type: 'INT',  isPk: false, isNn: true,  isUq: false, fk: { tableId: pId, colId: pIdC } },
                    { id: cUIdC,  name: 'user_id',   type: 'INT',  isPk: false, isNn: true,  isUq: false, fk: { tableId: uId, colId: uIdC } },
                    { id: cBodyC, name: 'body',      type: 'TEXT', isPk: false, isNn: true,  isUq: false, fk: null },
                ],
            },
            {
                id: gId, name: 'tags', x: 28, y: 340,
                columns: [
                    { id: gIdC,   name: 'id',   type: 'INT',          isPk: true,  isNn: true, isUq: true,  fk: null },
                    { id: gNameC, name: 'name', type: 'VARCHAR(100)', isPk: false, isNn: true, isUq: true,  fk: null },
                ],
            },
            {
                id: jId, name: 'post_tags', x: 310, y: 360,
                columns: [
                    { id: jPIdC, name: 'post_id', type: 'INT', isPk: true, isNn: true, isUq: false, fk: { tableId: pId, colId: pIdC } },
                    { id: jGIdC, name: 'tag_id',  type: 'INT', isPk: true, isNn: true, isUq: false, fk: { tableId: gId, colId: gIdC } },
                ],
            },
        ];

        render();
    }

    // ── toolbar wiring ────────────────────────────────────────────────────────
    document.getElementById('rdb-add-table').addEventListener('click', addTable);
    document.getElementById('rdb-load-sample').addEventListener('click', loadSample);

    document.getElementById('rdb-export-sql').addEventListener('click', function () {
        document.getElementById('rdb-sql-pre').textContent = genSQL();
        document.getElementById('rdb-modal-bg').classList.remove('hidden');
    });

    document.getElementById('rdb-modal-close').addEventListener('click', function () {
        document.getElementById('rdb-modal-bg').classList.add('hidden');
    });

    document.getElementById('rdb-modal-bg').addEventListener('click', function (e) {
        if (e.target === document.getElementById('rdb-modal-bg'))
            document.getElementById('rdb-modal-bg').classList.add('hidden');
    });

    document.getElementById('rdb-copy-sql').addEventListener('click', function () {
        var txt = document.getElementById('rdb-sql-pre').textContent;
        copyText(txt).then(function () {
            var btn = document.getElementById('rdb-copy-sql');
            btn.textContent = tr('copiedLabel');
            setTimeout(function () { btn.textContent = tr('copyToClipboardBtn'); }, 2000);
        }).catch(function () {
            var btn = document.getElementById('rdb-copy-sql');
            btn.textContent = tr('copyFailedLabel');
            setTimeout(function () { btn.textContent = tr('copyToClipboardBtn'); }, 2000);
        });
    });

    document.getElementById('rdb-export-json').addEventListener('click', function () {
        var data = JSON.stringify({ tables: S.tables, _id: S._id }, null, 2);
        var blob = new Blob([data], { type: 'application/json' });
        var a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = 'schema.json';
        a.click();
        URL.revokeObjectURL(a.href);
    });

    document.getElementById('rdb-import-json').addEventListener('click', function () {
        document.getElementById('rdb-import-file').click();
    });

    document.getElementById('rdb-import-file').addEventListener('change', function (e) {
        var file = e.target.files[0];
        if (!file) return;
        var reader = new FileReader();
        reader.onload = function (ev) {
            try {
                var data = JSON.parse(ev.target.result);
                if (!Array.isArray(data.tables)) throw new Error(tr('missingTablesArray'));
                S.tables = data.tables;
                S._id = data._id || 9999;
                S.selectedId = null;
                render();
            } catch (err) {
                alert(tr('couldNotLoadSchema')(err.message));
            }
        };
        reader.readAsText(file);
        e.target.value = '';
    });

    document.getElementById('rdb-clear').addEventListener('click', function () {
        if (!S.tables.length || confirm(tr('clearAllConfirm'))) {
            S.tables = []; S.selectedId = null; render();
        }
    });

    // ── utils ─────────────────────────────────────────────────────────────────
    function ce(tag) { return document.createElement(tag); }

    function svgEl(tag) { return document.createElementNS('http://www.w3.org/2000/svg', tag); }

    function copyText(text) {
        if (navigator.clipboard && navigator.clipboard.writeText && window.isSecureContext) {
            return navigator.clipboard.writeText(text);
        }
        return new Promise(function (resolve, reject) {
            try {
                var ta = document.createElement('textarea');
                ta.value = text;
                ta.setAttribute('readonly', '');
                ta.style.position = 'fixed';
                ta.style.top = '-9999px';
                document.body.appendChild(ta);
                ta.select();
                var ok = document.execCommand('copy');
                document.body.removeChild(ta);
                ok ? resolve() : reject(new Error('copy failed'));
            } catch (e) {
                reject(e);
            }
        });
    }

    function esc(s) {
        return String(s)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;');
    }

    window.rdbSetLanguage = function (lang) {
        currentLanguage = lang === 'pt' ? 'pt' : 'en';
        render();
    };

    // ── init ──────────────────────────────────────────────────────────────────
    loadSample();
})();
