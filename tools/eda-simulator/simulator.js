/**
 * Event-Driven Architecture Simulator.
 *
 * A small node-graph editor + discrete-time simulation: producers emit
 * messages onto queues/topics at a configured rate, consumers pull from
 * connected queues and take a configurable amount of time (with a
 * configurable failure chance) to process each one. Dragging nodes,
 * wiring ports and tuning the dials all happen on a single canvas; the
 * simulation runs on a virtual clock that can be paused and sped up.
 */
(function () {
    const SVG_NS = 'http://www.w3.org/2000/svg';
    const NODE_WIDTH = 168;
    const CANVAS_W = 780;
    const CANVAS_H = 460;

    const canvas = document.getElementById('eda-canvas');
    const edgesSvg = document.getElementById('eda-edges');
    const canvasWrap = canvas.parentElement;
    const canvasHint = document.getElementById('eda-canvas-hint');
    const inspector = document.getElementById('eda-inspector');
    const playBtn = document.getElementById('eda-play');
    const resetBtn = document.getElementById('eda-reset');
    const speedSelect = document.getElementById('eda-speed');

    const statEls = {
        produced: document.getElementById('stat-produced'),
        delivered: document.getElementById('stat-delivered'),
        failed: document.getElementById('stat-failed'),
        dropped: document.getElementById('stat-dropped'),
    };

    edgesSvg.setAttribute('width', String(CANVAS_W));
    edgesSvg.setAttribute('height', String(CANVAS_H));
    const edgeLayer = document.createElementNS(SVG_NS, 'g');
    const dotLayer = document.createElementNS(SVG_NS, 'g');
    edgesSvg.appendChild(edgeLayer);
    edgesSvg.appendChild(dotLayer);

    const ICONS = {
        producer: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" class="w-4 h-4"><path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m0-15 4.5 4.5M12 4.5 7.5 9"/></svg>',
        queue: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" class="w-4 h-4"><path stroke-linecap="round" stroke-linejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5M3.75 17.25h16.5"/></svg>',
        consumer: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" class="w-4 h-4"><path stroke-linecap="round" stroke-linejoin="round" d="m4.5 12 6 6L19.5 6"/></svg>',
    };

    const KIND_LABEL = { producer: 'Producer', queue: 'Topic / Queue', consumer: 'Consumer' };

    const NAME_POOL = {
        producer: ['Order Service', 'Checkout API', 'Signup Worker', 'Payment Gateway', 'Mobile App'],
        queue: ['orders.created', 'payments.captured', 'users.signedup', 'notifications', 'events.raw'],
        consumer: ['Email Worker', 'Inventory Sync', 'Analytics Sink', 'Fraud Check', 'Audit Logger'],
    };

    const state = {
        nodes: [],
        edges: [],
        nodeSeq: 0,
        edgeSeq: 0,
        msgSeq: 0,
        selectedId: null,
        running: false,
        speed: 1,
        simTimeMs: 0,
        dots: [],
        stats: { produced: 0, delivered: 0, failed: 0, dropped: 0 },
        drag: null,
        connecting: null,
    };

    let pendingPathEl = null;

    // ---------------------------------------------------------------
    // small helpers
    // ---------------------------------------------------------------

    function nodeById(id) {
        return state.nodes.find((n) => n.id === id);
    }

    function edgesFrom(id) {
        return state.edges.filter((e) => e.from === id);
    }

    function edgesTo(id) {
        return state.edges.filter((e) => e.to === id);
    }

    function escapeHtml(str) {
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    }

    function nameFor(type) {
        const used = new Set(state.nodes.filter((n) => n.type === type).map((n) => n.label));
        const free = NAME_POOL[type].find((n) => !used.has(n));
        return free || `${KIND_LABEL[type]} ${state.nodes.filter((n) => n.type === type).length + 1}`;
    }

    function nextPosition(type) {
        const colX = { producer: 24, queue: 304, consumer: 584 };
        const count = state.nodes.filter((n) => n.type === type).length;
        const row = count % 3;
        const col = Math.floor(count / 3);
        return {
            x: Math.min(colX[type] + col * 196, CANVAS_W - NODE_WIDTH - 12),
            y: 24 + row * 148,
        };
    }

    function defaultConfig(type) {
        if (type === 'producer') return { rate: 3 };
        if (type === 'queue') return { capacity: 30 };
        return { latency: 600, failureRate: 5, down: false };
    }

    function defaultRuntime(type) {
        if (type === 'producer') {
            return { emitAcc: 0, rrIndex: 0, totalSent: 0 };
        }
        if (type === 'queue') {
            return {
                buffer: [],
                inWindowCount: 0, outWindowCount: 0,
                inRate: 0, outRate: 0,
                windowStart: state.simTimeMs,
            };
        }
        return {
            busyUntil: null, currentMsg: null,
            totalProcessed: 0, windowCount: 0, rateDisplay: 0,
            windowStart: state.simTimeMs,
        };
    }

    // ---------------------------------------------------------------
    // node + edge lifecycle
    // ---------------------------------------------------------------

    function addNode(type) {
        const pos = nextPosition(type);
        const node = {
            id: `n${++state.nodeSeq}`,
            type,
            x: pos.x,
            y: pos.y,
            label: nameFor(type),
            config: defaultConfig(type),
            runtime: defaultRuntime(type),
            el: null,
            refs: {},
            dropTimer: null,
        };
        state.nodes.push(node);
        renderNode(node);
        selectNode(node.id);
        updateHintVisibility();
        return node;
    }

    function removeNode(id) {
        const node = nodeById(id);
        if (!node) return;
        state.edges = state.edges.filter((e) => {
            if (e.from === id || e.to === id) {
                if (e.pathEl) e.pathEl.remove();
                return false;
            }
            return true;
        });
        if (node.el) node.el.remove();
        state.nodes = state.nodes.filter((n) => n.id !== id);
        if (state.selectedId === id) selectNode(null);
        updateHintVisibility();
    }

    function updateHintVisibility() {
        canvasHint.classList.toggle('hidden', state.nodes.length > 0);
    }

    function canConnect(fromNode, toNode) {
        if (!fromNode || !toNode || fromNode.id === toNode.id) return false;
        if (fromNode.type === 'producer') return toNode.type === 'queue';
        if (fromNode.type === 'queue') return toNode.type === 'consumer';
        return false;
    }

    function edgeExists(fromId, toId) {
        return state.edges.some((e) => e.from === fromId && e.to === toId);
    }

    function addEdge(fromId, toId) {
        if (edgeExists(fromId, toId)) return;
        const edge = { id: `e${++state.edgeSeq}`, from: fromId, to: toId, pathEl: null };
        state.edges.push(edge);
        renderEdge(edge);
    }

    // ---------------------------------------------------------------
    // rendering: nodes
    // ---------------------------------------------------------------

    function nodeBodyTemplate(type) {
        if (type === 'producer') {
            return `
                <div class="eda-node-row"><span>Rate</span><strong data-ref="rate"></strong></div>
                <div class="eda-node-row"><span>Sent</span><strong data-ref="sent"></strong></div>
            `;
        }
        if (type === 'queue') {
            return `
                <div class="eda-node-row"><span>Backlog</span><strong data-ref="backlog"></strong></div>
                <div class="eda-node-bar-track"><div class="eda-node-bar-fill" data-ref="bar"></div></div>
                <div class="eda-node-row"><span>In · out / s</span><strong data-ref="throughput"></strong></div>
            `;
        }
        return `
            <div class="eda-node-row">
                <span class="eda-node-status"><span class="eda-status-dot"></span><span data-ref="status"></span></span>
                <strong data-ref="config"></strong>
            </div>
            <div class="eda-node-row"><span>Processed</span><strong data-ref="processed"></strong></div>
        `;
    }

    function renderNode(node) {
        const el = document.createElement('div');
        el.className = `eda-node ${node.type}`;
        el.style.left = `${node.x}px`;
        el.style.top = `${node.y}px`;
        el.dataset.id = node.id;
        el.innerHTML = `
            <div class="eda-node-head">
                <span class="eda-node-icon">${ICONS[node.type]}</span>
                <div class="min-w-0">
                    <p class="eda-node-title"></p>
                    <p class="eda-node-kind">${KIND_LABEL[node.type]}</p>
                </div>
            </div>
            <div class="eda-node-body">${nodeBodyTemplate(node.type)}</div>
            ${node.type !== 'consumer' ? '<span class="eda-port out" data-port="out" title="Drag to wire to another node"></span>' : ''}
            ${node.type !== 'producer' ? '<span class="eda-port in" data-port="in"></span>' : ''}
        `;
        canvas.appendChild(el);
        node.el = el;

        node.refs = {};
        el.querySelectorAll('[data-ref]').forEach((elm) => {
            node.refs[elm.dataset.ref] = elm;
        });
        node.refs.title = el.querySelector('.eda-node-title');
        node.refs.portOut = el.querySelector('.eda-port.out');
        node.refs.portIn = el.querySelector('.eda-port.in');

        bindNodeEvents(node);
        updateNodeDisplay(node);
    }

    function updateNodeDisplay(node) {
        const r = node.refs;
        r.title.textContent = node.label;

        if (node.type === 'producer') {
            r.rate.textContent = `${node.config.rate.toFixed(1)} msg/s`;
            r.sent.textContent = String(node.runtime.totalSent);
        } else if (node.type === 'queue') {
            const depth = node.runtime.buffer.length;
            const cap = node.config.capacity;
            r.backlog.textContent = `${depth} / ${cap}`;
            const pct = Math.min(100, (depth / cap) * 100);
            r.bar.style.width = `${pct}%`;
            r.bar.classList.toggle('is-hot', pct >= 80);
            r.throughput.textContent = `${node.runtime.inRate.toFixed(1)} · ${node.runtime.outRate.toFixed(1)}`;
        } else {
            const isDown = !!node.config.down;
            const isBusy = !isDown && node.runtime.busyUntil !== null;
            r.status.textContent = isDown ? 'Crashed' : (isBusy ? 'Processing…' : 'Idle');
            node.el.classList.toggle('is-down', isDown);
            node.el.classList.toggle('is-busy', isBusy);
            r.config.textContent = `${node.config.latency} ms · ${node.config.failureRate}% fail`;
            r.processed.textContent = `${node.runtime.totalProcessed} (~${node.runtime.rateDisplay.toFixed(1)}/s)`;
        }
    }

    function flashDrop(node) {
        if (!node.el) return;
        node.el.classList.add('is-dropping');
        if (node.dropTimer) clearTimeout(node.dropTimer);
        node.dropTimer = setTimeout(() => {
            if (node.el) node.el.classList.remove('is-dropping');
        }, 260);
    }

    // ---------------------------------------------------------------
    // rendering: edges + travelling message dots
    // ---------------------------------------------------------------

    function portPoint(node, side) {
        const height = node.el ? node.el.offsetHeight : 100;
        const x = side === 'out' ? node.x + NODE_WIDTH : node.x;
        const y = node.y + height / 2;
        return { x, y };
    }

    function edgeGeometry(fromNode, toNode) {
        const p0 = portPoint(fromNode, 'out');
        const p3 = portPoint(toNode, 'in');
        const dx = Math.max(Math.abs(p3.x - p0.x) * 0.5, 60);
        return {
            p0,
            p1: { x: p0.x + dx, y: p0.y },
            p2: { x: p3.x - dx, y: p3.y },
            p3,
        };
    }

    function pathD(geo) {
        return `M ${geo.p0.x} ${geo.p0.y} C ${geo.p1.x} ${geo.p1.y} ${geo.p2.x} ${geo.p2.y} ${geo.p3.x} ${geo.p3.y}`;
    }

    function bezierAt(t, geo) {
        const u = 1 - t;
        return {
            x: u * u * u * geo.p0.x + 3 * u * u * t * geo.p1.x + 3 * u * t * t * geo.p2.x + t * t * t * geo.p3.x,
            y: u * u * u * geo.p0.y + 3 * u * u * t * geo.p1.y + 3 * u * t * t * geo.p2.y + t * t * t * geo.p3.y,
        };
    }

    function renderEdge(edge) {
        const from = nodeById(edge.from);
        const to = nodeById(edge.to);
        if (!from || !to) return;
        const path = document.createElementNS(SVG_NS, 'path');
        path.setAttribute('class', 'eda-edge-path');
        path.setAttribute('d', pathD(edgeGeometry(from, to)));
        edgeLayer.appendChild(path);
        edge.pathEl = path;
    }

    function updateEdgesForNode(nodeId) {
        state.edges.forEach((edge) => {
            if (!edge.pathEl) return;
            if (edge.from !== nodeId && edge.to !== nodeId) return;
            const from = nodeById(edge.from);
            const to = nodeById(edge.to);
            if (from && to) edge.pathEl.setAttribute('d', pathD(edgeGeometry(from, to)));
        });
    }

    function spawnDot(fromNode, toNode, kind) {
        if (state.dots.length > 90) return;
        const geo = edgeGeometry(fromNode, toNode);
        const circle = document.createElementNS(SVG_NS, 'circle');
        circle.setAttribute('r', '3.5');
        circle.setAttribute('class', `eda-msg-dot${kind ? ` is-${kind}` : ''}`);
        dotLayer.appendChild(circle);
        state.dots.push({ el: circle, geo, start: performance.now(), duration: 460 });
    }

    function updateDots(now) {
        for (let i = state.dots.length - 1; i >= 0; i--) {
            const dot = state.dots[i];
            const t = Math.min(1, (now - dot.start) / dot.duration);
            const pos = bezierAt(t, dot.geo);
            dot.el.setAttribute('cx', String(pos.x));
            dot.el.setAttribute('cy', String(pos.y));
            dot.el.setAttribute('opacity', t > 0.82 ? String(Math.max(0, 1 - (t - 0.82) / 0.18)) : '1');
            if (t >= 1) {
                dot.el.remove();
                state.dots.splice(i, 1);
            }
        }
    }

    // ---------------------------------------------------------------
    // simulation engine (virtual clock, advanced each animation frame)
    // ---------------------------------------------------------------

    function rollWindow(rt, fields) {
        const elapsed = state.simTimeMs - rt.windowStart;
        if (elapsed < 1000) return;
        const factor = 1000 / elapsed;
        fields.forEach(([countKey, rateKey]) => {
            rt[rateKey] = rt[countKey] * factor;
            rt[countKey] = 0;
        });
        rt.windowStart = state.simTimeMs;
    }

    function pickSourceQueue(consumer) {
        const queues = edgesTo(consumer.id)
            .map((e) => nodeById(e.from))
            .filter((n) => n && n.type === 'queue');
        if (queues.length === 0) return null;
        return queues.reduce(
            (best, q) => (!best || q.runtime.buffer.length > best.runtime.buffer.length ? q : best),
            null
        );
    }

    function emitFromProducer(node) {
        state.stats.produced++;
        node.runtime.totalSent++;
        const queues = edgesFrom(node.id)
            .map((e) => nodeById(e.to))
            .filter((n) => n && n.type === 'queue');
        if (queues.length === 0) {
            state.stats.dropped++;
            return;
        }
        const queue = queues[node.runtime.rrIndex % queues.length];
        node.runtime.rrIndex++;
        spawnDot(node, queue);
        queue.runtime.inWindowCount++;
        if (queue.runtime.buffer.length >= queue.config.capacity) {
            state.stats.dropped++;
            flashDrop(queue);
        } else {
            queue.runtime.buffer.push({ id: ++state.msgSeq, bornAt: state.simTimeMs });
        }
    }

    function finishProcessing(node) {
        const rt = node.runtime;
        rt.currentMsg = null;
        rt.busyUntil = null;
        rt.totalProcessed++;
        rt.windowCount++;
        if (Math.random() * 100 < node.config.failureRate) {
            state.stats.failed++;
        } else {
            state.stats.delivered++;
        }
    }

    function simulate(dtMs) {
        state.simTimeMs += dtMs;

        state.nodes.forEach((node) => {
            if (node.type !== 'producer') return;
            const rt = node.runtime;
            const interval = 1000 / Math.max(node.config.rate, 0.05);
            rt.emitAcc += dtMs;
            let guard = 0;
            while (rt.emitAcc >= interval && guard < 40) {
                rt.emitAcc -= interval;
                emitFromProducer(node);
                guard++;
            }
        });

        state.nodes.forEach((node) => {
            if (node.type !== 'consumer') return;
            const rt = node.runtime;
            if (node.config.down) {
                rt.busyUntil = null;
                rt.currentMsg = null;
                return;
            }
            if (rt.busyUntil !== null) {
                if (state.simTimeMs >= rt.busyUntil) finishProcessing(node);
                return;
            }
            const queue = pickSourceQueue(node);
            if (queue && queue.runtime.buffer.length > 0) {
                const msg = queue.runtime.buffer.shift();
                queue.runtime.outWindowCount++;
                rt.currentMsg = msg;
                rt.busyUntil = state.simTimeMs + Math.max(node.config.latency, 1);
                spawnDot(queue, node);
            }
        });

        state.nodes.forEach((node) => {
            if (node.type === 'queue') {
                rollWindow(node.runtime, [['inWindowCount', 'inRate'], ['outWindowCount', 'outRate']]);
            } else if (node.type === 'consumer') {
                rollWindow(node.runtime, [['windowCount', 'rateDisplay']]);
            }
        });
    }

    // ---------------------------------------------------------------
    // selection + inspector panel
    // ---------------------------------------------------------------

    function selectNode(id) {
        state.selectedId = id;
        state.nodes.forEach((n) => n.el && n.el.classList.toggle('is-selected', n.id === id));
        renderInspector();
    }

    function renderInspector() {
        const node = nodeById(state.selectedId);
        if (!node) {
            inspector.classList.add('is-hidden');
            inspector.innerHTML = '';
            return;
        }
        inspector.classList.remove('is-hidden');

        let fieldsHtml = '';
        if (node.type === 'producer') {
            fieldsHtml = `
                <div class="eda-field">
                    <label>Message rate — <span class="eda-field-value" data-out="rate">${node.config.rate.toFixed(1)}</span> msg/s</label>
                    <input type="range" min="0.2" max="20" step="0.2" value="${node.config.rate}" data-cfg="rate" />
                </div>
            `;
        } else if (node.type === 'queue') {
            fieldsHtml = `
                <div class="eda-field">
                    <label>Capacity — <span class="eda-field-value" data-out="capacity">${node.config.capacity}</span> messages</label>
                    <input type="range" min="5" max="200" step="5" value="${node.config.capacity}" data-cfg="capacity" />
                </div>
            `;
        } else {
            fieldsHtml = `
                <div class="eda-field">
                    <label>Processing time — <span class="eda-field-value" data-out="latency">${node.config.latency}</span> ms / message</label>
                    <input type="range" min="50" max="3000" step="50" value="${node.config.latency}" data-cfg="latency" />
                </div>
                <div class="eda-field">
                    <label>Failure chance — <span class="eda-field-value" data-out="failureRate">${node.config.failureRate}</span> %</label>
                    <input type="range" min="0" max="80" step="1" value="${node.config.failureRate}" data-cfg="failureRate" />
                </div>
                <div class="eda-field">
                    <label>Availability</label>
                    <label class="eda-toggle">
                        <input type="checkbox" data-cfg="down" ${node.config.down ? 'checked' : ''} />
                        <span>Simulate crash — stop pulling new messages</span>
                    </label>
                </div>
            `;
        }

        inspector.innerHTML = `
            <p class="eda-inspector-kind mb-2">${KIND_LABEL[node.type]} settings</p>
            <div class="eda-field" style="margin-bottom: 0.85rem; max-width: 22rem;">
                <label>Name</label>
                <input type="text" maxlength="40" value="${escapeHtml(node.label)}" data-cfg="label" aria-label="Node name" />
            </div>
            <div class="eda-field-grid">${fieldsHtml}</div>
            <div class="eda-inspector-actions">
                <button class="eda-danger-btn" type="button" data-action="delete">Remove node</button>
            </div>
        `;

        inspector.querySelectorAll('input[type="range"]').forEach((input) => {
            input.addEventListener('input', () => {
                const key = input.dataset.cfg;
                const value = parseFloat(input.value);
                node.config[key] = value;
                const out = inspector.querySelector(`[data-out="${key}"]`);
                if (out) out.textContent = key === 'rate' ? value.toFixed(1) : String(value);
                updateNodeDisplay(node);
            });
        });

        const labelInput = inspector.querySelector('input[data-cfg="label"]');
        if (labelInput) {
            labelInput.addEventListener('input', () => {
                node.label = labelInput.value.trim() || KIND_LABEL[node.type];
                updateNodeDisplay(node);
            });
        }

        const downToggle = inspector.querySelector('input[data-cfg="down"]');
        if (downToggle) {
            downToggle.addEventListener('change', () => {
                node.config.down = downToggle.checked;
                updateNodeDisplay(node);
            });
        }

        const deleteBtn = inspector.querySelector('[data-action="delete"]');
        if (deleteBtn) {
            deleteBtn.addEventListener('click', () => removeNode(node.id));
        }
    }

    // ---------------------------------------------------------------
    // interaction: dragging nodes, wiring connections
    // ---------------------------------------------------------------

    function bindNodeEvents(node) {
        const el = node.el;

        el.addEventListener('pointerdown', (e) => {
            if (e.target.closest('.eda-port')) return;
            e.preventDefault();
            selectNode(node.id);
            const rect = canvas.getBoundingClientRect();
            state.drag = {
                id: node.id,
                pointerId: e.pointerId,
                offsetX: e.clientX - rect.left - node.x,
                offsetY: e.clientY - rect.top - node.y,
            };
            el.setPointerCapture(e.pointerId);
            el.style.cursor = 'grabbing';
        });

        if (node.refs.portOut) {
            node.refs.portOut.addEventListener('pointerdown', (e) => {
                e.preventDefault();
                e.stopPropagation();
                beginConnection(node);
                onConnectMove(e);
            });
        }
    }

    function nodeAtPoint(clientX, clientY) {
        const elm = document.elementFromPoint(clientX, clientY);
        if (!elm) return null;
        const nodeEl = elm.closest('.eda-node');
        return nodeEl ? nodeById(nodeEl.dataset.id) : null;
    }

    function beginConnection(fromNode) {
        cleanupConnection();
        state.connecting = { fromId: fromNode.id };
        pendingPathEl = document.createElementNS(SVG_NS, 'path');
        pendingPathEl.setAttribute('class', 'eda-pending-path');
        edgeLayer.appendChild(pendingPathEl);
        window.addEventListener('pointermove', onConnectMove);
        window.addEventListener('pointerup', onConnectEnd);
    }

    function onConnectMove(e) {
        if (!state.connecting || !pendingPathEl) return;
        const rect = canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const fromNode = nodeById(state.connecting.fromId);
        if (!fromNode) return;
        const p0 = portPoint(fromNode, 'out');
        const dx = Math.max(Math.abs(x - p0.x) * 0.5, 60);
        const p1 = { x: p0.x + dx, y: p0.y };
        const p2 = { x: x - dx, y };
        pendingPathEl.setAttribute('d', `M ${p0.x} ${p0.y} C ${p1.x} ${p1.y} ${p2.x} ${p2.y} ${x} ${y}`);

        const hovered = nodeAtPoint(e.clientX, e.clientY);
        state.nodes.forEach((n) => n.el && n.el.classList.remove('is-connect-target'));
        if (hovered && canConnect(fromNode, hovered)) {
            hovered.el.classList.add('is-connect-target');
        }
    }

    function onConnectEnd(e) {
        const fromNode = nodeById(state.connecting ? state.connecting.fromId : null);
        const target = nodeAtPoint(e.clientX, e.clientY);
        if (fromNode && target && canConnect(fromNode, target)) {
            addEdge(fromNode.id, target.id);
        }
        cleanupConnection();
    }

    function cleanupConnection() {
        state.nodes.forEach((n) => n.el && n.el.classList.remove('is-connect-target'));
        if (pendingPathEl) {
            pendingPathEl.remove();
            pendingPathEl = null;
        }
        if (state.connecting) {
            window.removeEventListener('pointermove', onConnectMove);
            window.removeEventListener('pointerup', onConnectEnd);
        }
        state.connecting = null;
    }

    window.addEventListener('pointermove', (e) => {
        if (!state.drag) return;
        const node = nodeById(state.drag.id);
        if (!node) return;
        const rect = canvas.getBoundingClientRect();
        let x = e.clientX - rect.left - state.drag.offsetX;
        let y = e.clientY - rect.top - state.drag.offsetY;
        x = Math.max(4, Math.min(x, CANVAS_W - NODE_WIDTH - 4));
        y = Math.max(4, Math.min(y, CANVAS_H - 64 - 4));
        node.x = x;
        node.y = y;
        node.el.style.left = `${x}px`;
        node.el.style.top = `${y}px`;
        updateEdgesForNode(node.id);
    });

    window.addEventListener('pointerup', () => {
        if (!state.drag) return;
        const node = nodeById(state.drag.id);
        if (node && node.el) {
            try { node.el.releasePointerCapture(state.drag.pointerId); } catch (err) { /* already released */ }
            node.el.style.cursor = '';
        }
        state.drag = null;
    });

    window.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') cleanupConnection();
    });

    canvasWrap.addEventListener('pointerdown', (e) => {
        if (e.target === canvas || e.target === canvasWrap || e.target === edgesSvg) {
            selectNode(null);
        }
    });

    // ---------------------------------------------------------------
    // toolbar
    // ---------------------------------------------------------------

    document.querySelectorAll('[data-add]').forEach((btn) => {
        btn.addEventListener('click', () => addNode(btn.dataset.add));
    });

    playBtn.addEventListener('click', () => {
        state.running = !state.running;
        playBtn.textContent = state.running ? 'Pause' : 'Play';
    });

    resetBtn.addEventListener('click', () => {
        state.stats = { produced: 0, delivered: 0, failed: 0, dropped: 0 };
        state.simTimeMs = 0;
        state.dots.forEach((d) => d.el.remove());
        state.dots = [];
        state.nodes.forEach((node) => {
            node.runtime = defaultRuntime(node.type);
            updateNodeDisplay(node);
        });
        refreshUi();
    });

    speedSelect.addEventListener('change', () => {
        state.speed = parseFloat(speedSelect.value);
    });

    // ---------------------------------------------------------------
    // global stats + main loop
    // ---------------------------------------------------------------

    let uiTick = 0;
    function refreshUi() {
        uiTick++;
        if (uiTick % 4 !== 0) return;
        state.nodes.forEach(updateNodeDisplay);
        statEls.produced.textContent = String(state.stats.produced);
        statEls.delivered.textContent = String(state.stats.delivered);
        statEls.failed.textContent = String(state.stats.failed);
        statEls.dropped.textContent = String(state.stats.dropped);
        statEls.failed.classList.toggle('is-warn', state.stats.failed > 0);
        statEls.dropped.classList.toggle('is-warn', state.stats.dropped > 0);
    }

    let lastFrameTs = null;
    function frame(now) {
        if (lastFrameTs !== null) {
            const realDt = Math.min(now - lastFrameTs, 250);
            if (state.running) simulate(realDt * state.speed);
        }
        lastFrameTs = now;
        updateDots(now);
        refreshUi();
        requestAnimationFrame(frame);
    }

    // ---------------------------------------------------------------
    // seed a starter pipeline so the canvas isn't empty on load
    // ---------------------------------------------------------------

    function seedScenario() {
        const producer = addNode('producer');
        const queue = addNode('queue');
        const consumer = addNode('consumer');
        addEdge(producer.id, queue.id);
        addEdge(queue.id, consumer.id);
        selectNode(null);
    }

    seedScenario();
    requestAnimationFrame(frame);
})();
