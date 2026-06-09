/* Go Concurrency — animation scenes
   One scene per topic, keyed by topic id. Each scene is an async script
   that drives the engine API (engine.js); scripts loop automatically.
   Logical canvas width is 720; heights vary per scene. */

const GO_ANIMATIONS = {
    /* ── main exits, goroutines die ───────────────────────────────────── */
    goroutines: {
        height: 215,
        async run(api) {
            const main = api.goroutine('main()', 40, 85);
            api.state(main, 'running');
            await api.say('A Go program starts with a single goroutine: main.');

            const w1 = api.goroutine('worker(1)', 430, 20);
            api.state(w1, 'running');
            await api.say('go worker(1) — the call returns instantly; the worker runs concurrently.');

            const w2 = api.goroutine('worker(2)', 430, 145);
            api.state(w2, 'running');
            await api.say('go worker(2) — three goroutines now share the scheduler.');
            await api.sleep(700);

            api.state(w1, 'done', 'returned');
            await api.say('worker(1) finishes. Meanwhile main reaches the end of its body…');
            await api.sleep(500);

            api.state(main, 'done', 'returned');
            api.state(w2, 'killed', 'killed mid-work');
            await api.say('When main returns, the whole program exits — worker(2) never gets to finish.');
        },
    },

    /* ── unbuffered channel handshake ─────────────────────────────────── */
    'unbuffered-channels': {
        height: 195,
        async run(api) {
            const sender = api.goroutine('sender', 40, 80);
            const receiver = api.goroutine('receiver', 550, 80);
            const ch = api.channel('ch := make(chan int)', 333, 85, 0);
            api.state(sender, 'running');
            api.state(receiver, 'idle', 'not ready yet');
            await api.say('An unbuffered channel has no storage — a send must meet a receive.');

            const t = api.token('42', 192, 103);
            api.state(sender, 'blocked', 'ch <- 42 (blocked)');
            await api.say('sender executes ch <- 42… nobody is receiving, so it blocks.');
            await api.sleep(600);

            api.state(receiver, 'blocked', '<-ch (waiting)');
            await api.say('receiver reaches <-ch — the two goroutines synchronize.');

            const mid = ch.center();
            await api.move(t, mid.x, mid.y, 380);
            await api.move(t, 615, 103, 380);
            api.state(sender, 'running', 'send returned');
            api.state(receiver, 'running', 'got 42');
            await api.say('The value is handed off and both continue. The handoff IS the synchronization.');
            await api.sleep(400);
            api.remove(t);
        },
    },

    /* ── buffered channel: fills, blocks, drains ──────────────────────── */
    'buffered-channels': {
        height: 215,
        async run(api) {
            const producer = api.goroutine('producer', 30, 85, 125);
            const consumer = api.goroutine('consumer', 560, 85, 130);
            const ch = api.channel('ch := make(chan int, 3)', 262, 90, 3);
            api.state(producer, 'running');
            api.state(consumer, 'idle', 'busy elsewhere');
            await api.say('A buffered channel holds values — sends succeed while there is room.');

            const queue = [];
            for (let v = 1; v <= 3; v++) {
                const t = api.token(v, 180, 108);
                const slot = ch.slotXY(queue.length);
                api.state(producer, 'running', 'ch <- ' + v);
                await api.move(t, slot.x, slot.y, 420);
                queue.push(t);
            }
            await api.say('Three sends complete without blocking — the buffer is now full (3/3).');

            const pending = api.token('4', 195, 108);
            api.state(producer, 'blocked', 'ch <- 4 (blocked)');
            await api.say('The fourth send blocks: no free slot until someone receives.');
            await api.sleep(700);

            api.state(consumer, 'running', 'v := <-ch');
            const first = queue.shift();
            await api.move(first, 600, 108, 420);
            api.remove(first);
            await api.all(queue.map((t, i) => api.move(t, ch.slotXY(i).x, ch.slotXY(i).y, 300)));
            await api.say('consumer takes the oldest value (FIFO) — a slot frees up…');

            const slot = ch.slotXY(queue.length);
            await api.move(pending, slot.x, slot.y, 420);
            queue.push(pending);
            api.state(producer, 'running', 'send completed');
            await api.say('…and the blocked send immediately completes. Buffers decouple, they don’t eliminate blocking.');
        },
    },

    /* ── close + range ────────────────────────────────────────────────── */
    'closing-and-range': {
        height: 200,
        async run(api) {
            const producer = api.goroutine('producer', 30, 85, 125);
            const consumer = api.goroutine('for v := range ch', 545, 85, 150);
            const ch = api.channel('ch := make(chan int, 3)', 270, 90, 3);
            api.state(producer, 'running');
            api.state(consumer, 'running', 'receiving');
            await api.say('The producer sends a few values, then closes the channel.');

            const queue = [];
            for (let v = 1; v <= 3; v++) {
                const t = api.token(v, 185, 108);
                const slot = ch.slotXY(queue.length);
                await api.move(t, slot.x, slot.y, 350);
                queue.push(t);
            }

            api.closeChannel(ch);
            api.state(producer, 'done', 'close(ch)');
            await api.say('close(ch) — no more sends allowed, but the buffered values are still there.');

            while (queue.length) {
                const t = queue.shift();
                await api.move(t, 590, 108, 380);
                api.remove(t);
                await api.all(queue.map((q, i) => api.move(q, ch.slotXY(i).x, ch.slotXY(i).y, 250)));
                if (queue.length === 1) await api.say('range keeps receiving until the channel is drained…', 300);
            }

            api.state(consumer, 'done', 'loop exited');
            await api.say('Closed and empty — the range loop exits cleanly. No sentinel values needed.');
        },
    },

    /* ── select between two channels ──────────────────────────────────── */
    select: {
        height: 265,
        async run(api) {
            const p1 = api.goroutine('producer A', 30, 30, 125);
            const p2 = api.goroutine('producer B', 30, 185, 125);
            const ch1 = api.channel('ch1', 300, 38, 0);
            const ch2 = api.channel('ch2', 300, 193, 0);
            const main = api.goroutine('main — select', 530, 105, 150);
            api.state(p1, 'running');
            api.state(p2, 'running');
            api.state(main, 'blocked', 'waiting on both');
            await api.say('select blocks on several channel operations at once and runs whichever is ready first.');

            const t1 = api.token('a1', 180, 56);
            await api.say('producer A sends first — the ch1 case wins this round.', 400);
            await api.move(t1, ch1.center().x, ch1.center().y, 350);
            await api.move(t1, 605, 128, 420);
            api.state(main, 'running', 'case <-ch1');
            await api.sleep(500);
            api.remove(t1);
            api.state(main, 'blocked', 'waiting on both');

            const t2 = api.token('b1', 180, 211, '#A9874E');
            await api.say('Next iteration, producer B is ready — the ch2 case runs.', 400);
            await api.move(t2, ch2.center().x, ch2.center().y, 350);
            await api.move(t2, 605, 128, 420);
            api.state(main, 'running', 'case <-ch2');
            await api.sleep(500);
            api.remove(t2);

            const t3 = api.token('a2', 180, 56);
            const t4 = api.token('b2', 180, 211, '#A9874E');
            api.state(main, 'blocked', 'waiting on both');
            await api.say('If several cases are ready at the same time, select picks one at random.', 700);
            await api.all([api.move(t3, ch1.center().x, ch1.center().y, 350), api.move(t4, ch2.center().x, ch2.center().y, 350)]);
            await api.move(t4, 605, 128, 420);
            api.state(main, 'running', 'case <-ch2 (random)');
            await api.sleep(500);
            api.remove(t4);
            await api.move(t3, 605, 128, 420);
            api.state(main, 'running', 'case <-ch1');
            api.remove(t3);
            await api.say('Random choice prevents one busy channel from starving the others.');
        },
    },

    /* ── WaitGroup counter ────────────────────────────────────────────── */
    waitgroup: {
        height: 255,
        async run(api) {
            const main = api.goroutine('main()', 40, 105);
            api.state(main, 'running');
            const counter = api.label('WaitGroup counter: 0', 285, 32, { size: 14, bold: true, color: 'brass' });
            await api.say('wg.Add(3) — tell the WaitGroup how many goroutines to expect.');
            counter.text = 'WaitGroup counter: 3';
            await api.sleep(400);

            const workers = [];
            for (let i = 0; i < 3; i++) {
                const w = api.goroutine('worker(' + (i + 1) + ')', 470, 20 + i * 80);
                api.state(w, 'running');
                workers.push(w);
            }
            api.state(main, 'blocked', 'wg.Wait()');
            await api.say('main calls wg.Wait() and blocks until the counter reaches zero.');

            await api.sleep(700);
            api.state(workers[1], 'done', 'wg.Done()');
            counter.text = 'WaitGroup counter: 2';
            await api.say('Workers finish in any order, each calling wg.Done() on the way out…', 800);

            api.state(workers[0], 'done', 'wg.Done()');
            counter.text = 'WaitGroup counter: 1';
            await api.sleep(800);

            api.state(workers[2], 'done', 'wg.Done()');
            counter.text = 'WaitGroup counter: 0';
            await api.sleep(300);
            api.state(main, 'running', 'Wait() returned');
            await api.say('Counter hits zero — wg.Wait() returns and main continues, certain all work is done.');
        },
    },

    /* ── mutex: serialized access ─────────────────────────────────────── */
    'mutex-vs-channels': {
        height: 235,
        async run(api) {
            const counter = api.label('counter = 0', 360, 38, { size: 15, bold: true, color: 'text' });
            const lock = api.label('mutex: unlocked', 360, 62, { size: 11.5, color: 'muted' });
            const g1 = api.goroutine('goroutine A', 70, 130);
            const g2 = api.goroutine('goroutine B', 510, 130);
            api.state(g1, 'running');
            api.state(g2, 'running');
            await api.say('Two goroutines both want to do counter++ — an unprotected read-modify-write.');

            api.state(g1, 'running', 'mu.Lock() ✓');
            api.state(g2, 'blocked', 'mu.Lock() blocked');
            lock.text = 'mutex: held by A';
            await api.say('A acquires the mutex first. B calls Lock() and has to wait — no interleaving possible.');

            counter.text = 'counter = 1';
            api.state(g1, 'running', 'counter++');
            await api.sleep(900);

            api.state(g1, 'done', 'mu.Unlock()');
            api.state(g2, 'running', 'mu.Lock() ✓');
            lock.text = 'mutex: held by B';
            await api.say('A unlocks; B immediately acquires and does its own increment.');

            counter.text = 'counter = 2';
            await api.sleep(700);
            api.state(g2, 'done', 'mu.Unlock()');
            lock.text = 'mutex: unlocked';
            await api.say('Final value: 2, every single run. Without the mutex this is a data race.');
        },
    },

    /* ── worker pool ──────────────────────────────────────────────────── */
    'worker-pools': {
        height: 290,
        async run(api) {
            const jobs = api.channel('jobs (cap 5)', 30, 130, 5);
            const results = api.channel('results (cap 5)', 510, 130, 5);
            const workers = [];
            for (let i = 0; i < 3; i++) {
                const w = api.goroutine('worker(' + (i + 1) + ')', 300, 25 + i * 90);
                api.state(w, 'blocked', 'range jobs');
                workers.push(w);
            }
            await api.say('Three workers all range over the same jobs channel — each job goes to exactly one of them.');

            const queue = [];
            for (let v = 1; v <= 5; v++) {
                const t = api.token('j' + v, 15, 105);
                const slot = jobs.slotXY(queue.length);
                await api.move(t, slot.x, slot.y, 220);
                queue.push(t);
            }
            await api.say('main queues five jobs. The workers pull them off as fast as they can.', 600);

            const resultQueue = [];
            const workerYs = [48, 138, 228];
            let done = 0;

            const runWorker = async (wi, jobToken, delay) => {
                api.state(workers[wi], 'running', 'processing ' + jobToken.value);
                await api.move(jobToken, 280, workerYs[wi], 380);
                await api.sleep(delay);
                jobToken.value = jobToken.value.replace('j', 'r');
                const slot = results.slotXY(resultQueue.length);
                resultQueue.push(jobToken);
                await api.move(jobToken, slot.x, slot.y, 380);
                done++;
                api.state(workers[wi], 'blocked', 'range jobs');
            };

            // first wave: three workers grab the first three jobs concurrently
            const wave1 = [runWorker(0, queue[0], 700), runWorker(1, queue[1], 1100), runWorker(2, queue[2], 500)];
            queue.splice(0, 3);
            await api.sleep(450);
            await api.all(queue.map((t, i) => api.move(t, jobs.slotXY(i).x, jobs.slotXY(i).y, 250)));
            await api.say('Jobs run concurrently — a slow job only ties up one worker, not the whole pool.', 200);
            await api.all(wave1);

            const wave2 = [runWorker(2, queue[0], 600), runWorker(0, queue[1], 800)];
            queue.splice(0, 2);
            await api.all(wave2);

            workers.forEach((w) => api.state(w, 'done', 'jobs closed — exit'));
            await api.say('close(jobs) ends every worker’s range loop; five results are waiting in order of completion.');
        },
    },

    /* ── fan-out / fan-in ─────────────────────────────────────────────── */
    'fan-out-fan-in': {
        height: 285,
        async run(api) {
            const producers = [];
            const chans = [];
            for (let i = 0; i < 3; i++) {
                const p = api.goroutine('source ' + (i + 1), 25, 20 + i * 90, 115);
                api.state(p, 'running');
                producers.push(p);
                chans.push(api.channel('ch' + (i + 1), 215, 28 + i * 90, 0));
            }
            const merge = api.goroutine('merge()', 350, 110, 120);
            const out = api.channel('out', 525, 118, 0);
            const main = api.goroutine('main', 615, 110, 90);
            api.state(merge, 'running');
            api.state(main, 'running', 'range out');
            await api.say('Three sources each produce on their own channel — fan-in merges them into one stream.');

            const colors = [null, '#A9874E', '#7C8FB5'];
            const order = [0, 2, 1, 0, 2];
            for (let k = 0; k < order.length; k++) {
                const i = order[k];
                const t = api.token('v' + (k + 1), 165, 46 + i * 90, colors[i]);
                const c = chans[i].center();
                await api.move(t, c.x, c.y, 300);
                await api.move(t, 410, 133, 300);
                const o = out.center();
                await api.move(t, o.x, o.y, 260);
                await api.move(t, 660, 133, 260);
                api.remove(t);
                if (k === 1) await api.say('merge() runs one forwarding goroutine per source, all sending to the same out channel.', 300);
            }

            producers.forEach((p, i) => {
                api.state(p, 'done', 'close(ch' + (i + 1) + ')');
            });
            await api.say('When every source closes its channel, the forwarders finish…', 900);
            api.state(merge, 'done', 'close(out)');
            api.closeChannel(out);
            api.state(main, 'done', 'range exited');
            await api.say('…a WaitGroup notices all of them are done, merge closes out, and the consumer’s range ends.');
        },
    },

    /* ── pipeline stages ──────────────────────────────────────────────── */
    pipelines: {
        height: 200,
        async run(api) {
            const gen = api.goroutine('generate', 15, 80, 110);
            const ch1 = api.channel('nums', 165, 85, 0);
            const sq = api.goroutine('square', 260, 80, 115);
            const ch2 = api.channel('squares', 415, 85, 0);
            const sink = api.goroutine('main — print', 510, 80, 130);
            api.state(gen, 'running');
            api.state(sq, 'running');
            api.state(sink, 'running');
            await api.say('A pipeline: each stage receives from upstream, transforms, and sends downstream.');

            const values = [2, 3, 4];
            for (let i = 0; i < values.length; i++) {
                const v = values[i];
                const t = api.token(v, 110, 103);
                await api.move(t, ch1.center().x, ch1.center().y, 300);
                await api.move(t, 317, 103, 300);
                if (i === 0) await api.say('Stages run concurrently: while square works on 2, generate is already sending 3.', 200);
                t.value = String(v * v);
                await api.sleep(250);
                await api.move(t, ch2.center().x, ch2.center().y, 300);
                await api.move(t, 575, 103, 300);
                api.remove(t);
            }

            api.state(gen, 'done', 'close(nums)');
            await api.say('generate closes its channel; square’s range ends, so it closes too…', 900);
            api.state(sq, 'done', 'close(squares)');
            api.closeChannel(ch2);
            api.state(sink, 'done', 'range exited');
            await api.say('Closing cascades down the pipeline and every stage shuts down cleanly.');
        },
    },

    /* ── context cancellation ─────────────────────────────────────────── */
    'context-cancellation': {
        height: 250,
        async run(api) {
            const main = api.goroutine('main()', 40, 100);
            const w1 = api.goroutine('worker(1)', 470, 20, 150);
            const w2 = api.goroutine('worker(2)', 470, 175, 150);
            api.state(main, 'running');
            api.state(w1, 'running', 'select { <-ctx.Done() … }');
            api.state(w2, 'running', 'select { <-ctx.Done() … }');
            await api.say('Workers loop in a select, watching ctx.Done() alongside their real work.');
            await api.sleep(900);

            await api.say('Something happens — a timeout, a failed request — and main calls cancel().');
            const s1 = api.token('✕', 175, 123, '#DC2626');
            const s2 = api.token('✕', 175, 123, '#DC2626');
            api.state(main, 'running', 'cancel()');
            await api.all([api.move(s1, 540, 43, 600), api.move(s2, 540, 198, 600)]);
            api.remove(s1);
            api.remove(s2);

            api.state(w1, 'done', 'ctx.Done() — return');
            api.state(w2, 'done', 'ctx.Done() — return');
            await api.say('Done() is a closed channel: every goroutine watching it unblocks at once and returns.');
            await api.say('One cancel() tears down the whole tree of work — no goroutine leaks.');
        },
    },

    /* ── deadlock panic ───────────────────────────────────────────────── */
    'deadlocks-and-leaks': {
        height: 190,
        async run(api) {
            const main = api.goroutine('main()', 50, 70);
            const ch = api.channel('ch := make(chan int)', 350, 75, 0);
            api.state(main, 'running');
            await api.say('main sends on an unbuffered channel… but no other goroutine will ever receive.');

            const t = api.token('1', 200, 93);
            api.state(main, 'blocked', 'ch <- 1 (forever)');
            await api.say('The send blocks. And blocks. There is nothing left to run.', 1400);

            await api.say('The runtime detects that every goroutine is asleep and panics:', 600);
            api.banner('fatal error: all goroutines are asleep - deadlock!');
            api.state(main, 'killed', 'crashed');
            await api.sleep(1800);
            api.remove(t);
        },
    },
};
