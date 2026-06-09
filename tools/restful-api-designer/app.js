(function () {
    'use strict';

    // ── constants ────────────────────────────────────────────────────────────
    const METHODS      = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'HEAD'];
    const PARAM_TYPES  = ['string', 'integer', 'number', 'boolean', 'array', 'object'];
    const STATUS_CODES = ['200', '201', '204', '400', '401', '403', '404', '409', '422', '500', '503'];
    const HAS_BODY     = new Set(['POST', 'PUT', 'PATCH']);

    // ── state ────────────────────────────────────────────────────────────────
    const S = {
        info: { title: 'My API', version: '1.0.0', description: '', baseUrl: '' },
        resources: [],
        selectedId: null,
        activeTab: 'params',
        _id: 1,
    };

    let _modalDownload = null;

    function uid() { return 'i' + (S._id++); }

    function findResource(id)  { return S.resources.find(r => r.id === id); }
    function findEndpoint(id) {
        for (const r of S.resources) {
            const ep = r.endpoints.find(e => e.id === id);
            if (ep) return { resource: r, endpoint: ep };
        }
        return null;
    }

    function getPathParams(path) {
        return [...(path || '').matchAll(/\{([^}]+)\}/g)].map(m => m[1]);
    }

    function escHtml(s) {
        if (s == null) return '';
        return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
    }

    // ── endpoint factory ──────────────────────────────────────────────────────
    function mkEndpoint(method) {
        return {
            id:          uid(),
            method:      method || 'GET',
            summary:     '',
            description: '',
            queryParams: [],
            requestBody: { required: false, contentType: 'application/json', description: '', example: '' },
            responses:   [mkResponse('200', 'OK')],
            pathParamMeta: {},
        };
    }

    function mkResponse(code, desc) {
        return { id: uid(), statusCode: code, description: desc, example: '' };
    }

    // ── actions ───────────────────────────────────────────────────────────────
    function addResource() {
        const id = uid();
        S.resources.push({ id, path: '/resource', endpoints: [] });
        render();
        setTimeout(() => {
            const el = document.querySelector('[data-resource-path="' + id + '"]');
            if (el) { el.focus(); el.select(); }
        }, 30);
    }

    function deleteResource(id) {
        const found = S.selectedId && findEndpoint(S.selectedId);
        if (found && found.resource.id === id) S.selectedId = null;
        S.resources = S.resources.filter(r => r.id !== id);
        render();
    }

    function addEndpoint(resourceId) {
        const r = findResource(resourceId);
        if (!r) return;
        const ep = mkEndpoint('GET');
        r.endpoints.push(ep);
        S.selectedId = ep.id;
        S.activeTab  = 'params';
        render();
    }

    function deleteEndpoint(id) {
        for (const r of S.resources) {
            r.endpoints = r.endpoints.filter(e => e.id !== id);
        }
        if (S.selectedId === id) S.selectedId = null;
        render();
    }

    function addQueryParam(epId) {
        const found = findEndpoint(epId);
        if (!found) return;
        found.endpoint.queryParams.push({ id: uid(), name: '', type: 'string', required: false, description: '' });
        render();
    }

    function deleteQueryParam(epId, paramId) {
        const found = findEndpoint(epId);
        if (!found) return;
        found.endpoint.queryParams = found.endpoint.queryParams.filter(p => p.id !== paramId);
        render();
    }

    function addResponse(epId) {
        const found = findEndpoint(epId);
        if (!found) return;
        found.endpoint.responses.push(mkResponse('200', ''));
        render();
    }

    function deleteResponse(epId, respId) {
        const found = findEndpoint(epId);
        if (!found) return;
        found.endpoint.responses = found.endpoint.responses.filter(r => r.id !== respId);
        render();
    }

    // ── render ────────────────────────────────────────────────────────────────
    function render() {
        renderTree();
        renderEditor();
    }

    function renderTree() {
        const el = document.getElementById('api-tree');
        if (!S.resources.length) {
            el.innerHTML = '<p style="font-size:12px;color:var(--text-secondary);text-align:center;padding:12px 4px">No resources yet.</p>';
            return;
        }
        el.innerHTML = S.resources.map(r => `
            <div class="api-resource" data-rid="${r.id}">
                <div class="api-resource-head">
                    <input class="api-resource-path-input"
                           data-resource-path="${r.id}"
                           value="${escHtml(r.path)}"
                           placeholder="/resource"
                           spellcheck="false"
                           autocomplete="off" />
                    <button class="api-resource-del" data-del-resource="${r.id}" title="Delete resource">×</button>
                </div>
                <div class="api-endpoints-list">
                    ${r.endpoints.map(ep => {
                        const sel = ep.id === S.selectedId ? ' is-selected' : '';
                        return `<div class="api-endpoint-item${sel}" data-select-ep="${ep.id}">
                            <span class="api-method-badge api-method-${ep.method.toLowerCase()}">${ep.method}</span>
                            <span class="api-endpoint-label">${escHtml(ep.summary) || '<span class="api-endpoint-summary">No summary</span>'}</span>
                            <button class="api-endpoint-del" data-del-ep="${ep.id}" title="Delete endpoint">×</button>
                        </div>`;
                    }).join('')}
                    <button class="api-add-endpoint-btn" data-add-ep="${r.id}">+ Add Endpoint</button>
                </div>
            </div>
        `).join('');
    }

    function renderEditor() {
        const el = document.getElementById('api-editor-content');
        if (!S.selectedId) {
            el.innerHTML = '<p class="text-sm text-[var(--text-secondary)]">Select an endpoint from the sidebar to edit it.</p>';
            return;
        }
        const found = findEndpoint(S.selectedId);
        if (!found) {
            el.innerHTML = '<p class="text-sm text-[var(--text-secondary)]">Select an endpoint from the sidebar to edit it.</p>';
            return;
        }
        const { resource: res, endpoint: ep } = found;
        const pathParams = getPathParams(res.path);

        el.innerHTML = `
            <div class="api-editor-header">
                <div class="api-method-path-row">
                    <select class="api-method-select" data-ep="${ep.id}" data-field="method">
                        ${METHODS.map(m => `<option value="${m}"${ep.method === m ? ' selected' : ''}>${m}</option>`).join('')}
                    </select>
                    <span class="api-resource-path-label" title="${escHtml(res.path)}">${escHtml(res.path)}</span>
                </div>
                <input class="api-input api-summary-input"
                       value="${escHtml(ep.summary)}"
                       data-ep="${ep.id}" data-field="summary"
                       placeholder="Short summary of this endpoint…" />
                <textarea class="api-input api-description-area"
                          data-ep="${ep.id}" data-field="description"
                          rows="2"
                          placeholder="Longer description (optional)…">${escHtml(ep.description)}</textarea>
            </div>

            <div class="api-tabs">
                ${['params', 'body', 'responses'].map(t => {
                    const labels = { params: 'Parameters', body: 'Request Body', responses: 'Responses' };
                    return `<button class="api-tab-btn${S.activeTab === t ? ' is-active' : ''}" data-tab="${t}">${labels[t]}</button>`;
                }).join('')}
            </div>

            ${renderTab(ep, pathParams)}
        `;
    }

    function renderTab(ep, pathParams) {
        if (S.activeTab === 'params')    return renderParamsTab(ep, pathParams);
        if (S.activeTab === 'body')      return renderBodyTab(ep);
        if (S.activeTab === 'responses') return renderResponsesTab(ep);
        return '';
    }

    function renderParamsTab(ep, pathParams) {
        const meta = ep.pathParamMeta || {};
        const pathSection = pathParams.length ? `
            <div class="api-section-label">Path Parameters</div>
            <div class="api-path-params-grid api-path-params-head">
                <span>Name</span><span>Type</span><span>Description</span>
            </div>
            ${pathParams.map(name => {
                const m = meta[name] || {};
                return `<div class="api-path-params-grid">
                    <span class="api-path-param-name">{${name}}</span>
                    <select class="api-input api-select" data-ep="${ep.id}" data-pp-type="${name}">
                        ${PARAM_TYPES.map(t => `<option value="${t}"${(m.type || 'string') === t ? ' selected' : ''}>${t}</option>`).join('')}
                    </select>
                    <input class="api-input" value="${escHtml(m.description || '')}" data-ep="${ep.id}" data-pp-desc="${name}" placeholder="Description" />
                </div>`;
            }).join('')}
            <hr class="api-divider" />
        ` : '';

        const qpSection = `
            <div class="api-section-label">Query Parameters</div>
            ${ep.queryParams.length ? `
                <div class="api-qp-row api-qp-head">
                    <span>Name</span><span>Type</span><span>Req</span><span>Description</span><span></span>
                </div>` : ''}
            ${ep.queryParams.map(p => `
                <div class="api-qp-row">
                    <input class="api-input" value="${escHtml(p.name)}" data-ep="${ep.id}" data-qp-name="${p.id}" placeholder="param" />
                    <select class="api-input api-select" data-ep="${ep.id}" data-qp-type="${p.id}">
                        ${PARAM_TYPES.map(t => `<option value="${t}"${p.type === t ? ' selected' : ''}>${t}</option>`).join('')}
                    </select>
                    <label class="api-check-label">
                        <input type="checkbox" ${p.required ? 'checked' : ''} data-ep="${ep.id}" data-qp-req="${p.id}" />
                    </label>
                    <input class="api-input" value="${escHtml(p.description)}" data-ep="${ep.id}" data-qp-desc="${p.id}" placeholder="Description" />
                    <button class="api-del-btn" data-ep="${ep.id}" data-del-qp="${p.id}" title="Delete">×</button>
                </div>
            `).join('')}
            <button class="api-add-row-btn" data-add-qp="${ep.id}">+ Add Query Parameter</button>
        `;

        return `<div class="api-tab-pane">${pathSection}${qpSection}</div>`;
    }

    function renderBodyTab(ep) {
        if (!HAS_BODY.has(ep.method)) {
            return `<div class="api-tab-pane"><p class="text-sm text-[var(--text-secondary)]">Request body is not used for ${ep.method} endpoints.</p></div>`;
        }
        const rb = ep.requestBody || {};
        return `
            <div class="api-tab-pane">
                <div class="api-field-group">
                    <label class="api-field-label">Content Type</label>
                    <select class="api-input api-select" style="max-width:260px" data-ep="${ep.id}" data-rb-ct>
                        ${['application/json', 'application/x-www-form-urlencoded', 'multipart/form-data', 'text/plain'].map(ct =>
                            `<option value="${ct}"${rb.contentType === ct ? ' selected' : ''}>${ct}</option>`
                        ).join('')}
                    </select>
                </div>
                <div>
                    <label class="api-check-label">
                        <input type="checkbox" ${rb.required ? 'checked' : ''} data-ep="${ep.id}" data-rb-required />
                        Required
                    </label>
                </div>
                <div class="api-field-group">
                    <label class="api-field-label">Description</label>
                    <input class="api-input" value="${escHtml(rb.description)}" data-ep="${ep.id}" data-rb-desc placeholder="Describe what goes in the body…" />
                </div>
                <div class="api-field-group">
                    <label class="api-field-label">Example (JSON)</label>
                    <textarea class="api-input api-code-area" rows="9" data-ep="${ep.id}" data-rb-example placeholder='{\n  "field": "value"\n}'>${escHtml(rb.example)}</textarea>
                </div>
            </div>
        `;
    }

    function renderResponsesTab(ep) {
        return `
            <div class="api-tab-pane">
                ${ep.responses.map(r => `
                    <div class="api-response-card">
                        <div class="api-response-card-head">
                            <select class="api-input api-select api-select-status" data-ep="${ep.id}" data-resp-code="${r.id}">
                                ${STATUS_CODES.map(c => `<option value="${c}"${r.statusCode === c ? ' selected' : ''}>${c}</option>`).join('')}
                            </select>
                            <input class="api-input" style="flex:1" value="${escHtml(r.description)}" data-ep="${ep.id}" data-resp-desc="${r.id}" placeholder="Description" />
                            <button class="api-del-btn" data-ep="${ep.id}" data-del-resp="${r.id}" title="Delete">×</button>
                        </div>
                        <textarea class="api-input api-code-area" rows="4" data-ep="${ep.id}" data-resp-example="${r.id}" placeholder='{ "id": 1, "name": "…" }'>${escHtml(r.example)}</textarea>
                    </div>
                `).join('')}
                <button class="api-add-row-btn" data-add-resp="${ep.id}">+ Add Response</button>
            </div>
        `;
    }

    // ── event handling ────────────────────────────────────────────────────────
    function bindTree() {
        const tree = document.getElementById('api-tree');

        tree.addEventListener('click', e => {
            const t = e.target;
            if (t.dataset.delResource) { deleteResource(t.dataset.delResource); return; }
            if (t.dataset.addEp)       { addEndpoint(t.dataset.addEp); return; }
            if (t.dataset.delEp)       { deleteEndpoint(t.dataset.delEp); return; }
            const item = t.closest('[data-select-ep]');
            if (item && !t.closest('[data-del-ep]')) {
                S.selectedId = item.dataset.selectEp;
                S.activeTab  = 'params';
                render();
            }
        });

        tree.addEventListener('input', e => {
            const t = e.target;
            if (!t.dataset.resourcePath) return;
            const r = findResource(t.dataset.resourcePath);
            if (r) {
                r.path = t.value;
                // Refresh path param section in editor if it's the active tab
                if (S.activeTab === 'params' && S.selectedId) {
                    const found = findEndpoint(S.selectedId);
                    if (found && found.resource.id === r.id) {
                        renderEditor();
                    }
                }
                // Update the path label in the editor header without full re-render
                const label = document.querySelector('.api-resource-path-label');
                if (label && S.selectedId) {
                    const found = findEndpoint(S.selectedId);
                    if (found && found.resource.id === r.id) label.textContent = r.path;
                }
            }
        });
    }

    function bindEditor() {
        const el = document.getElementById('api-editor-content');

        el.addEventListener('click', e => {
            const t = e.target;
            if (t.dataset.tab)    { S.activeTab = t.dataset.tab; renderEditor(); return; }
            if (t.dataset.addQp)  { addQueryParam(t.dataset.addQp); return; }
            if (t.dataset.delQp)  { deleteQueryParam(t.dataset.ep, t.dataset.delQp); return; }
            if (t.dataset.addResp){ addResponse(t.dataset.addResp); return; }
            if (t.dataset.delResp){ deleteResponse(t.dataset.ep, t.dataset.delResp); return; }
        });

        // Selects and checkboxes → change event
        el.addEventListener('change', e => {
            const t   = e.target;
            const epId = t.dataset.ep;
            if (!epId) return;
            const found = findEndpoint(epId);
            if (!found) return;
            const ep = found.endpoint;

            if (t.dataset.field === 'method') {
                ep.method = t.value;
                // Update badge in tree
                const badge = document.querySelector(`[data-select-ep="${epId}"] .api-method-badge`);
                if (badge) {
                    badge.textContent = t.value;
                    badge.className = 'api-method-badge api-method-' + t.value.toLowerCase();
                }
                // Body tab may become available/unavailable
                if (S.activeTab === 'body') renderEditor();
                return;
            }
            if (t.dataset.ppType) {
                ep.pathParamMeta = ep.pathParamMeta || {};
                ep.pathParamMeta[t.dataset.ppType] = ep.pathParamMeta[t.dataset.ppType] || {};
                ep.pathParamMeta[t.dataset.ppType].type = t.value;
                return;
            }
            if (t.dataset.qpType) {
                const p = ep.queryParams.find(p => p.id === t.dataset.qpType);
                if (p) p.type = t.value;
                return;
            }
            if (t.dataset.qpReq !== undefined) {
                const p = ep.queryParams.find(p => p.id === t.dataset.qpReq);
                if (p) p.required = t.checked;
                return;
            }
            if (t.dataset.respCode) {
                const r = ep.responses.find(r => r.id === t.dataset.respCode);
                if (r) r.statusCode = t.value;
                return;
            }
            if ('rbCt' in t.dataset) {
                ep.requestBody.contentType = t.value;
                return;
            }
            if ('rbRequired' in t.dataset) {
                ep.requestBody.required = t.checked;
                return;
            }
        });

        // Text inputs / textareas → input event (no re-render, just sync state)
        el.addEventListener('input', e => {
            const t   = e.target;
            const epId = t.dataset.ep;
            if (!epId) return;
            const found = findEndpoint(epId);
            if (!found) return;
            const ep = found.endpoint;

            if (t.dataset.field === 'summary') {
                ep.summary = t.value;
                // Patch tree label in-place
                const label = document.querySelector(`[data-select-ep="${epId}"] .api-endpoint-label`);
                if (label) label.textContent = t.value || '';
                return;
            }
            if (t.dataset.field === 'description') { ep.description = t.value; return; }
            if (t.dataset.qpName) {
                const p = ep.queryParams.find(p => p.id === t.dataset.qpName);
                if (p) p.name = t.value;
                return;
            }
            if (t.dataset.qpDesc) {
                const p = ep.queryParams.find(p => p.id === t.dataset.qpDesc);
                if (p) p.description = t.value;
                return;
            }
            if (t.dataset.ppDesc) {
                ep.pathParamMeta = ep.pathParamMeta || {};
                ep.pathParamMeta[t.dataset.ppDesc] = ep.pathParamMeta[t.dataset.ppDesc] || {};
                ep.pathParamMeta[t.dataset.ppDesc].description = t.value;
                return;
            }
            if (t.dataset.respDesc) {
                const r = ep.responses.find(r => r.id === t.dataset.respDesc);
                if (r) r.description = t.value;
                return;
            }
            if (t.dataset.respExample) {
                const r = ep.responses.find(r => r.id === t.dataset.respExample);
                if (r) r.example = t.value;
                return;
            }
            if ('rbDesc' in t.dataset)    { ep.requestBody.description = t.value; return; }
            if ('rbExample' in t.dataset) { ep.requestBody.example = t.value; return; }
        });
    }

    function bindInfoFields() {
        document.getElementById('api-title')      .addEventListener('input', e => { S.info.title       = e.target.value; });
        document.getElementById('api-version')    .addEventListener('input', e => { S.info.version     = e.target.value; });
        document.getElementById('api-base-url')   .addEventListener('input', e => { S.info.baseUrl     = e.target.value; });
        document.getElementById('api-description').addEventListener('input', e => { S.info.description = e.target.value; });
    }

    function bindToolbar() {
        document.getElementById('api-add-resource').addEventListener('click', addResource);
        document.getElementById('api-load-sample') .addEventListener('click', loadSample);
        document.getElementById('api-export-yaml') .addEventListener('click', () => exportSpec('yaml'));
        document.getElementById('api-export-json-spec').addEventListener('click', () => exportSpec('json'));
        document.getElementById('api-save-json')   .addEventListener('click', saveState);
        document.getElementById('api-import-json') .addEventListener('click', () => document.getElementById('api-import-file').click());
        document.getElementById('api-clear')       .addEventListener('click', clearAll);

        document.getElementById('api-import-file').addEventListener('change', e => {
            const file = e.target.files[0];
            if (!file) return;
            const reader = new FileReader();
            reader.onload = ev => {
                try   { loadState(JSON.parse(ev.target.result)); }
                catch { alert('Invalid JSON file.'); }
            };
            reader.readAsText(file);
            e.target.value = '';
        });

        document.getElementById('api-modal-close').addEventListener('click', closeModal);
        document.getElementById('api-modal-copy') .addEventListener('click', () => {
            const pre = document.getElementById('api-modal-pre');
            navigator.clipboard.writeText(pre.textContent).then(() => {
                const btn = document.getElementById('api-modal-copy');
                const orig = btn.textContent;
                btn.textContent = 'Copied!';
                setTimeout(() => { btn.textContent = orig; }, 2000);
            });
        });
        document.getElementById('api-modal-download').addEventListener('click', () => {
            if (_modalDownload) _modalDownload();
        });
        document.getElementById('api-modal-bg').addEventListener('click', e => {
            if (e.target === document.getElementById('api-modal-bg')) closeModal();
        });
    }

    function closeModal() { document.getElementById('api-modal-bg').classList.add('hidden'); }
    function showModal(title, content) {
        document.getElementById('api-modal-title').textContent = title;
        document.getElementById('api-modal-pre').textContent   = content;
        document.getElementById('api-modal-bg').classList.remove('hidden');
    }

    // ── sample data ───────────────────────────────────────────────────────────
    function loadSample() {
        S._id = 1;
        S.info = { title: 'Blog API', version: '1.0.0', description: 'A simple blogging REST API', baseUrl: 'https://api.example.com/v1' };

        function ep(method, summary, qps, body, resps, ppMeta) {
            return {
                id: uid(), method, summary, description: '',
                queryParams:   qps   || [],
                requestBody:   Object.assign({ required: false, contentType: 'application/json', description: '', example: '' }, body),
                responses:     resps || [mkResponse('200', 'OK')],
                pathParamMeta: ppMeta || {},
            };
        }
        function qp(name, type, req, desc) {
            return { id: uid(), name, type, required: !!req, description: desc || '' };
        }
        function rs(code, desc, example) {
            return { id: uid(), statusCode: code, description: desc, example: example || '' };
        }

        const postBody  = '{\n  "title": "Hello World",\n  "body": "Post content here.",\n  "authorId": 1\n}';
        const postResp  = '{\n  "id": 12,\n  "title": "Hello World",\n  "body": "Post content here.",\n  "authorId": 1,\n  "createdAt": "2024-01-15T10:00:00Z"\n}';
        const listResp  = '[\n  {\n    "id": 12,\n    "title": "Hello World",\n    "authorId": 1\n  }\n]';
        const userBody  = '{\n  "name": "Alice",\n  "email": "alice@example.com",\n  "password": "s3cr3t"\n}';
        const userResp  = '{\n  "id": 7,\n  "name": "Alice",\n  "email": "alice@example.com"\n}';
        const errResp   = '{\n  "error": "Not Found",\n  "message": "The requested resource does not exist."\n}';
        const valResp   = '{\n  "error": "Validation Failed",\n  "fields": [\n    { "field": "title", "message": "Required" }\n  ]\n}';

        S.resources = [
            {
                id: uid(), path: '/posts',
                endpoints: [
                    ep('GET',  'List posts',
                       [qp('page', 'integer', false, 'Page number (1-based)'), qp('limit', 'integer', false, 'Items per page (max 100)')],
                       null,
                       [rs('200', 'Paginated list of posts', listResp)]),
                    ep('POST', 'Create a post',
                       [],
                       { required: true, example: postBody },
                       [rs('201', 'Post created', postResp), rs('400', 'Validation error', valResp), rs('401', 'Unauthorized')]),
                ],
            },
            {
                id: uid(), path: '/posts/{postId}',
                endpoints: [
                    ep('GET',    'Get a post by ID',    [], null,
                       [rs('200', 'Post found', postResp), rs('404', 'Post not found', errResp)],
                       { postId: { type: 'integer', description: 'Unique post ID' } }),
                    ep('PUT',    'Replace a post',      [], { required: true, example: postBody },
                       [rs('200', 'Post updated', postResp), rs('400', 'Validation error', valResp), rs('401', 'Unauthorized'), rs('404', 'Not found', errResp)],
                       { postId: { type: 'integer', description: 'Unique post ID' } }),
                    ep('DELETE', 'Delete a post',       [], null,
                       [rs('204', 'Post deleted'), rs('401', 'Unauthorized'), rs('404', 'Not found', errResp)],
                       { postId: { type: 'integer', description: 'Unique post ID' } }),
                ],
            },
            {
                id: uid(), path: '/users',
                endpoints: [
                    ep('POST', 'Register a user',
                       [],
                       { required: true, example: userBody },
                       [rs('201', 'User created', userResp), rs('400', 'Validation error', valResp), rs('409', 'Email already in use')]),
                ],
            },
            {
                id: uid(), path: '/users/{userId}',
                endpoints: [
                    ep('GET', 'Get a user by ID', [], null,
                       [rs('200', 'User found', userResp), rs('404', 'User not found', errResp)],
                       { userId: { type: 'integer', description: 'Unique user ID' } }),
                ],
            },
        ];

        S.selectedId = null;
        syncInfoFields();
        render();
    }

    function clearAll() {
        S.info = { title: 'My API', version: '1.0.0', description: '', baseUrl: '' };
        S.resources  = [];
        S.selectedId = null;
        S._id        = 1;
        syncInfoFields();
        render();
    }

    function syncInfoFields() {
        document.getElementById('api-title')      .value = S.info.title;
        document.getElementById('api-version')    .value = S.info.version;
        document.getElementById('api-base-url')   .value = S.info.baseUrl;
        document.getElementById('api-description').value = S.info.description;
    }

    // ── save / load state ─────────────────────────────────────────────────────
    function saveState() {
        const blob = new Blob([JSON.stringify({ info: S.info, resources: S.resources, _id: S._id }, null, 2)], { type: 'application/json' });
        dlBlob(blob, slugify(S.info.title) + '-api-state.json');
    }

    function loadState(data) {
        if (!data || !Array.isArray(data.resources)) { alert('Invalid state file.'); return; }
        S.info      = Object.assign({ title: '', version: '1.0.0', description: '', baseUrl: '' }, data.info);
        S.resources = data.resources;
        S._id       = data._id || 200;
        S.selectedId = null;
        syncInfoFields();
        render();
    }

    // ── OpenAPI export ────────────────────────────────────────────────────────
    function buildOpenAPI() {
        const spec = {
            openapi: '3.0.3',
            info: { title: S.info.title || 'My API', version: S.info.version || '1.0.0' },
        };
        if (S.info.description) spec.info.description = S.info.description;
        if (S.info.baseUrl)     spec.servers = [{ url: S.info.baseUrl }];

        const paths = {};

        for (const res of S.resources) {
            const fullPath = res.path || '/';
            if (!paths[fullPath]) paths[fullPath] = {};

            for (const ep of res.endpoints) {
                const method = ep.method.toLowerCase();
                const op = {};
                if (ep.summary)     op.summary     = ep.summary;
                if (ep.description) op.description = ep.description;

                // Parameters
                const params = [];
                const pp = getPathParams(res.path);
                for (const name of pp) {
                    const m = (ep.pathParamMeta || {})[name] || {};
                    const param = { name, in: 'path', required: true, schema: { type: m.type || 'string' } };
                    if (m.description) param.description = m.description;
                    params.push(param);
                }
                for (const qp of (ep.queryParams || [])) {
                    if (!qp.name) continue;
                    const param = { name: qp.name, in: 'query', schema: { type: qp.type || 'string' } };
                    if (qp.required)    param.required    = true;
                    if (qp.description) param.description = qp.description;
                    params.push(param);
                }
                if (params.length) op.parameters = params;

                // Request body
                const rb = ep.requestBody || {};
                if (HAS_BODY.has(ep.method)) {
                    const ct     = rb.contentType || 'application/json';
                    const rbSpec = { required: !!rb.required, content: {} };
                    if (rb.description) rbSpec.description = rb.description;
                    const media = {};
                    if (rb.example && rb.example.trim()) {
                        try   { media.example = JSON.parse(rb.example); }
                        catch { media.example = rb.example; }
                    }
                    rbSpec.content[ct] = media;
                    op.requestBody = rbSpec;
                }

                // Responses
                const resps = {};
                for (const r of (ep.responses || [])) {
                    const ro = { description: r.description || '' };
                    if (r.example && r.example.trim()) {
                        try   { ro.content = { 'application/json': { example: JSON.parse(r.example) } }; }
                        catch { ro.content = { 'application/json': { example: r.example } }; }
                    }
                    resps[r.statusCode] = ro;
                }
                op.responses = Object.keys(resps).length ? resps : { '200': { description: 'OK' } };

                paths[fullPath][method] = op;
            }
        }

        spec.paths = paths;
        return spec;
    }

    function exportSpec(format) {
        const spec    = buildOpenAPI();
        const content = format === 'yaml' ? jsToYaml(spec) : JSON.stringify(spec, null, 2);
        const ext     = format === 'yaml' ? '.openapi.yaml' : '.openapi.json';
        const title   = format === 'yaml' ? 'OpenAPI 3.0 — YAML' : 'OpenAPI 3.0 — JSON';
        const fname   = slugify(S.info.title) + ext;

        showModal(title, content);
        _modalDownload = () => dlBlob(new Blob([content], { type: 'text/plain' }), fname);
    }

    // ── YAML serializer ───────────────────────────────────────────────────────
    function jsToYaml(val, depth) {
        depth = depth || 0;
        const pad = '  '.repeat(depth);

        if (val === null || val === undefined) return 'null';
        if (typeof val === 'boolean') return val ? 'true' : 'false';
        if (typeof val === 'number')  return isFinite(val) ? String(val) : 'null';

        if (typeof val === 'string') {
            if (val === '') return "''";
            const needsQuote = (
                /[\n\r\t]/.test(val)              ||
                /^[ \t]|[ \t]$/.test(val)         ||
                /^[{}\[\]#&*!|>'"%@`]/.test(val)  ||
                val.startsWith('-') || val.startsWith(':') || val.startsWith('?') ||
                /^(true|false|null|yes|no|on|off|~)$/i.test(val) ||
                /^\d+(\.\d+)?$/.test(val)         ||
                /: /.test(val)                    ||
                / #/.test(val)
            );
            if (needsQuote) return '"' + val.replace(/\\/g, '\\\\').replace(/"/g, '\\"').replace(/\n/g, '\\n') + '"';
            return val;
        }

        if (Array.isArray(val)) {
            if (!val.length) return '[]';
            return '\n' + val.map(item => {
                if (typeof item === 'object' && item !== null && !Array.isArray(item)) {
                    return yamlObjItem(item, depth, pad);
                }
                return pad + '- ' + jsToYaml(item, depth + 1);
            }).join('\n');
        }

        // Plain object
        const entries = Object.entries(val).filter(([, v]) => v !== undefined);
        if (!entries.length) return '{}';
        return '\n' + entries.map(([k, v]) => {
            const ky = /[\s:#{}[\]&*?|<>=!%@`,]/.test(k) ? '"' + k + '"' : k;
            if (typeof v === 'object' && v !== null) {
                if (Array.isArray(v))     return !v.length ? pad + ky + ': []' : pad + ky + ':' + jsToYaml(v, depth + 1);
                if (!Object.keys(v).length) return pad + ky + ': {}';
                return pad + ky + ':' + jsToYaml(v, depth + 1);
            }
            return pad + ky + ': ' + jsToYaml(v, depth + 1);
        }).join('\n');
    }

    function yamlObjItem(obj, depth, pad) {
        const entries = Object.entries(obj).filter(([, v]) => v !== undefined);
        if (!entries.length) return pad + '- {}';
        return entries.map(([k, v], i) => {
            const prefix = i === 0 ? pad + '- ' : pad + '  ';
            const ky     = /[\s:#{}[\]&*?|<>=!%@`,]/.test(k) ? '"' + k + '"' : k;
            if (typeof v === 'object' && v !== null) {
                if (Array.isArray(v))     return !v.length ? prefix + ky + ': []' : prefix + ky + ':' + jsToYaml(v, depth + 2);
                if (!Object.keys(v).length) return prefix + ky + ': {}';
                return prefix + ky + ':' + jsToYaml(v, depth + 2);
            }
            return prefix + ky + ': ' + jsToYaml(v, depth + 2);
        }).join('\n');
    }

    // ── utilities ─────────────────────────────────────────────────────────────
    function slugify(s) {
        return (s || 'api').toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '') || 'api';
    }

    function dlBlob(blob, name) {
        const url = URL.createObjectURL(blob);
        const a   = document.createElement('a');
        a.href = url; a.download = name; a.click();
        URL.revokeObjectURL(url);
    }

    // ── init ─────────────────────────────────────────────────────────────────
    function init() {
        bindInfoFields();
        bindTree();
        bindEditor();
        bindToolbar();
        render();
    }

    init();
})();
