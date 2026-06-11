/* Go Concurrency — animation engine
   A tiny canvas scene player. Scenes are async scripts driven by a virtual
   clock, so they can be paused, restarted and speed-shifted without the
   script knowing. Entities are goroutine boxes, channel tracks, value
   tokens and free-floating labels; captions render as HTML below the
   canvas for readability and accessibility. */

(function () {
    'use strict';

    const W = 720; // logical coordinate width; the canvas scales to fit its container
    const ABORT = Symbol('scene-aborted');

    // Picks a Portuguese string when app.js has switched the language
    // (window.GC_I18N.currentLanguage === 'pt'); used for the few
    // user-facing strings the engine itself draws (e.g. "closed").
    function L(en, pt) {
        return (window.GC_I18N && window.GC_I18N.currentLanguage === 'pt') ? pt : en;
    }

    let paletteCache = null;

    function palette() {
        if (paletteCache) return paletteCache;
        const cs = getComputedStyle(document.body);
        const dark = document.documentElement.classList.contains('dark');
        const v = (name, fallback) => cs.getPropertyValue(name).trim() || fallback;
        paletteCache = {
            text: v('--text-primary', '#26241E'),
            muted: v('--text-secondary', '#5F5C4E'),
            border: v('--border', '#E9E2D2'),
            accent: v('--accent-color', '#4F6F52'),
            brass: v('--brass', '#A9874E'),
            surface: v('--secondary-bg', '#FFFFFF'),
            running: dark ? '#8FB58A' : '#4F6F52',
            blocked: dark ? '#FCD34D' : '#C77E0A',
            killed: dark ? '#F87171' : '#DC2626',
            idle: dark ? '#8B8A7A' : '#9C9A88',
            tokenText: dark ? '#16180F' : '#FFFFFF',
        };
        return paletteCache;
    }

    new MutationObserver(() => {
        paletteCache = null;
    }).observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });

    function stateColor(p, state) {
        if (state === 'running') return p.running;
        if (state === 'blocked') return p.blocked;
        if (state === 'killed') return p.killed;
        return p.idle; // idle / done
    }

    function ease(t) {
        return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
    }

    function roundRect(ctx, x, y, w, h, r) {
        ctx.beginPath();
        ctx.moveTo(x + r, y);
        ctx.arcTo(x + w, y, x + w, y + h, r);
        ctx.arcTo(x + w, y + h, x, y + h, r);
        ctx.arcTo(x, y + h, x, y, r);
        ctx.arcTo(x, y, x + w, y, r);
        ctx.closePath();
    }

    class Scene {
        constructor({ canvas, captionEl, height, script }) {
            this.canvas = canvas;
            this.ctx = canvas.getContext('2d');
            this.captionEl = captionEl;
            this.height = height;
            this.script = script;

            this.speed = 1;
            this.playing = true; // user intent (pause button)
            this.visible = false; // gated by IntersectionObserver
            this.now = 0; // virtual clock, ms
            this.gen = 0; // bumped on restart; orphans old script runs
            this.destroyed = false;
            this.lastReal = null;

            this.goroutines = [];
            this.channels = [];
            this.tokens = [];
            this.labels = [];
            this.banner = null;
            this.timers = []; // { deadline, resolve }
            this.tweens = []; // { obj, fromX, fromY, toX, toY, start, dur, resolve }

            this.resizeObserver = new ResizeObserver(() => this.resize());
            this.resizeObserver.observe(canvas.parentElement);
            this.intersectionObserver = new IntersectionObserver(
                (entries) => {
                    this.visible = entries[0].isIntersecting;
                },
                { threshold: 0.1 }
            );
            this.intersectionObserver.observe(canvas);

            this.resize();
            this.restart();
            this.raf = requestAnimationFrame((t) => this.frame(t));
        }

        resize() {
            const cw = this.canvas.parentElement.clientWidth || W;
            const dpr = window.devicePixelRatio || 1;
            this.scale = cw / W;
            this.dpr = dpr;
            this.canvas.width = Math.round(cw * dpr);
            this.canvas.height = Math.round(this.height * this.scale * dpr);
            this.canvas.style.width = cw + 'px';
            this.canvas.style.height = this.height * this.scale + 'px';
        }

        restart() {
            this.gen++;
            const gen = this.gen;
            this.goroutines = [];
            this.channels = [];
            this.tokens = [];
            this.labels = [];
            this.banner = null;
            this.timers = [];
            this.tweens = [];
            if (this.captionEl) this.captionEl.textContent = '';

            const api = this.makeApi(gen);
            Promise.resolve()
                .then(() => this.script(api))
                .then(() => api.sleep(2400)) // hold the final frame, then loop
                .then(() => {
                    if (gen === this.gen && !this.destroyed) this.restart();
                })
                .catch((e) => {
                    if (e !== ABORT) console.error(e);
                });
        }

        destroy() {
            this.destroyed = true;
            this.gen++;
            cancelAnimationFrame(this.raf);
            this.resizeObserver.disconnect();
            this.intersectionObserver.disconnect();
        }

        frame(t) {
            if (this.destroyed) return;
            if (this.lastReal === null) this.lastReal = t;
            const dt = Math.min(64, t - this.lastReal);
            this.lastReal = t;
            if (this.playing && this.visible) {
                this.now += dt * this.speed;
                this.tick();
            }
            if (this.visible) this.draw();
            this.raf = requestAnimationFrame((next) => this.frame(next));
        }

        tick() {
            const due = this.timers.filter((tm) => tm.deadline <= this.now);
            this.timers = this.timers.filter((tm) => tm.deadline > this.now);
            due.forEach((tm) => tm.resolve());

            const finished = [];
            this.tweens = this.tweens.filter((tw) => {
                const t = Math.min(1, (this.now - tw.start) / tw.dur);
                const e = ease(t);
                tw.obj.x = tw.fromX + (tw.toX - tw.fromX) * e;
                tw.obj.y = tw.fromY + (tw.toY - tw.fromY) * e;
                if (t >= 1) {
                    finished.push(tw);
                    return false;
                }
                return true;
            });
            finished.forEach((tw) => tw.resolve());
        }

        makeApi(gen) {
            const scene = this;
            const alive = () => gen === scene.gen && !scene.destroyed;

            const api = {
                goroutine(label, x, y, w = 130) {
                    const g = { label, x, y, w, h: 46, state: 'idle', note: '' };
                    scene.goroutines.push(g);
                    return g;
                },

                channel(label, x, y, cap) {
                    const slotW = 30;
                    const gap = 5;
                    const width = cap > 0 ? cap * slotW + (cap + 1) * gap : 54;
                    const ch = {
                        label,
                        x,
                        y,
                        cap,
                        slotW,
                        gap,
                        width,
                        height: 36,
                        closed: false,
                        // slot 0 is the exit side (rightmost); higher indexes queue leftwards
                        slotXY(i) {
                            if (cap <= 0) return { x: x + width / 2, y: y + 18 };
                            return { x: x + width - gap - slotW / 2 - i * (slotW + gap), y: y + 18 };
                        },
                        center() {
                            return { x: x + width / 2, y: y + 18 };
                        },
                    };
                    scene.channels.push(ch);
                    return ch;
                },

                token(value, x, y, color) {
                    const t = { value: String(value), x, y, r: 12, color: color || null };
                    scene.tokens.push(t);
                    return t;
                },

                label(text, x, y, opts = {}) {
                    const l = Object.assign({ text, x, y, size: 12, color: 'muted', bold: false, align: 'center' }, opts);
                    scene.labels.push(l);
                    return l;
                },

                state(g, state, note) {
                    g.state = state;
                    g.note = note !== undefined ? note : state;
                },

                remove(t) {
                    const i = scene.tokens.indexOf(t);
                    if (i !== -1) scene.tokens.splice(i, 1);
                },

                closeChannel(ch) {
                    ch.closed = true;
                },

                banner(text) {
                    scene.banner = { text };
                },

                sleep(ms) {
                    if (!alive()) return Promise.reject(ABORT);
                    return new Promise((resolve) => scene.timers.push({ deadline: scene.now + ms, resolve }));
                },

                move(t, x, y, dur = 600) {
                    if (!alive()) return Promise.reject(ABORT);
                    return new Promise((resolve) =>
                        scene.tweens.push({ obj: t, fromX: t.x, fromY: t.y, toX: x, toY: y, start: scene.now, dur, resolve })
                    );
                },

                say(text, pause = 1100) {
                    if (!alive()) return Promise.reject(ABORT);
                    if (scene.captionEl) scene.captionEl.textContent = text;
                    return api.sleep(pause);
                },

                all(promises) {
                    return Promise.all(promises);
                },
            };
            return api;
        }

        draw() {
            const ctx = this.ctx;
            const p = palette();
            const s = this.scale * this.dpr;
            ctx.setTransform(s, 0, 0, s, 0, 0);
            ctx.clearRect(0, 0, W, this.height);
            ctx.textBaseline = 'middle';

            this.channels.forEach((ch) => this.drawChannel(ctx, ch, p));
            this.goroutines.forEach((g) => this.drawGoroutine(ctx, g, p));
            this.labels.forEach((l) => {
                ctx.font = `${l.bold ? '600 ' : ''}${l.size}px Inter, system-ui, sans-serif`;
                ctx.fillStyle = l.color === 'brass' ? p.brass : l.color === 'text' ? p.text : l.color === 'accent' ? p.accent : p.muted;
                ctx.textAlign = l.align;
                ctx.fillText(l.text, l.x, l.y);
            });
            this.tokens.forEach((t) => this.drawToken(ctx, t, p));
            if (this.banner) this.drawBanner(ctx, p);
        }

        drawGoroutine(ctx, g, p) {
            const col = stateColor(p, g.state);
            roundRect(ctx, g.x, g.y, g.w, g.h, 10);
            ctx.fillStyle = p.surface;
            ctx.fill();
            ctx.lineWidth = 1.5;
            ctx.strokeStyle = col;
            ctx.stroke();

            ctx.textAlign = 'center';
            ctx.font = '600 13px Inter, system-ui, sans-serif';
            ctx.fillStyle = g.state === 'done' || g.state === 'killed' ? p.muted : p.text;
            ctx.fillText(g.label, g.x + g.w / 2, g.y + 16);
            ctx.font = '10.5px Inter, system-ui, sans-serif';
            ctx.fillStyle = col;
            ctx.fillText(g.note || g.state, g.x + g.w / 2, g.y + 33);
        }

        drawChannel(ctx, ch, p) {
            const edge = ch.closed ? p.killed : p.border;
            roundRect(ctx, ch.x, ch.y, ch.width, ch.height, 9);
            ctx.fillStyle = p.surface;
            ctx.fill();
            ctx.lineWidth = 1.5;
            if (ch.closed) ctx.setLineDash([4, 3]);
            ctx.strokeStyle = edge;
            ctx.stroke();
            ctx.setLineDash([]);

            if (ch.cap > 0) {
                ctx.lineWidth = 1;
                ctx.strokeStyle = p.border;
                for (let i = 0; i < ch.cap; i++) {
                    const c = ch.slotXY(i);
                    roundRect(ctx, c.x - 13, c.y - 13, 26, 26, 6);
                    ctx.stroke();
                }
            } else {
                ctx.font = '13px Inter, system-ui, sans-serif';
                ctx.fillStyle = p.muted;
                ctx.textAlign = 'center';
                ctx.fillText('→', ch.x + ch.width / 2, ch.y + 18);
            }

            ctx.font = '10.5px Inter, system-ui, sans-serif';
            ctx.textAlign = 'left';
            ctx.fillStyle = p.muted;
            const label = ch.label + (ch.closed ? L('  · closed', '  · fechado') : '');
            ctx.fillStyle = ch.closed ? p.killed : p.muted;
            ctx.fillText(label, ch.x, ch.y - 9);
        }

        drawToken(ctx, t, p) {
            ctx.beginPath();
            ctx.arc(t.x, t.y, t.r, 0, Math.PI * 2);
            ctx.fillStyle = t.color || p.accent;
            ctx.fill();
            ctx.font = '600 10.5px Inter, system-ui, sans-serif';
            ctx.fillStyle = p.tokenText;
            ctx.textAlign = 'center';
            ctx.fillText(t.value, t.x, t.y + 0.5);
        }

        drawBanner(ctx, p) {
            ctx.font = '600 12.5px ui-monospace, SFMono-Regular, Menlo, monospace';
            const text = this.banner.text;
            const tw = ctx.measureText(text).width;
            const bw = tw + 36;
            const bx = (W - bw) / 2;
            const by = this.height - 46;
            roundRect(ctx, bx, by, bw, 32, 8);
            ctx.fillStyle = p.killed;
            ctx.fill();
            ctx.fillStyle = '#FFFFFF';
            ctx.textAlign = 'center';
            ctx.fillText(text, W / 2, by + 16.5);
        }
    }

    window.GoAnimEngine = { Scene };
})();
