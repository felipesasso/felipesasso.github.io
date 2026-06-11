/* Go Concurrency — animation scenes
   One scene per topic, keyed by topic id. Each scene is an async script
   that drives the engine API (engine.js); scripts loop automatically.
   Logical canvas width is 720; heights vary per scene.

   User-facing strings (captions passed to api.say, goroutine/channel/state
   labels and notes) are wrapped in L(en, pt), which picks the Portuguese
   string when window.GC_I18N.currentLanguage === 'pt' (set by app.js),
   falling back to English otherwise. Go identifiers, keywords and syntax
   fragments (e.g. "ch <- 42", "wg.Wait()", "make(chan int)") are kept as-is
   in both languages — only the surrounding prose is translated. */

(function () {
    function L(en, pt) {
        return (window.GC_I18N && window.GC_I18N.currentLanguage === 'pt') ? pt : en;
    }

    const GO_ANIMATIONS = {
    /* ── main exits, goroutines die ───────────────────────────────────── */
    goroutines: {
        height: 215,
        async run(api) {
            const main = api.goroutine('main()', 40, 85);
            api.state(main, 'running');
            await api.say(L('A Go program starts with a single goroutine: main.', 'Um programa Go começa com uma única goroutine: main.'));

            const w1 = api.goroutine('worker(1)', 430, 20);
            api.state(w1, 'running');
            await api.say(L('go worker(1) — the call returns instantly; the worker runs concurrently.', 'go worker(1) — a chamada retorna instantaneamente; o worker roda concorrentemente.'));

            const w2 = api.goroutine('worker(2)', 430, 145);
            api.state(w2, 'running');
            await api.say(L('go worker(2) — three goroutines now share the scheduler.', 'go worker(2) — agora três goroutines compartilham o scheduler.'));
            await api.sleep(700);

            api.state(w1, 'done', L('returned', 'retornou'));
            await api.say(L('worker(1) finishes. Meanwhile main reaches the end of its body…', 'worker(1) termina. Enquanto isso, main chega ao fim do seu corpo…'));
            await api.sleep(500);

            api.state(main, 'done', L('returned', 'retornou'));
            api.state(w2, 'killed', L('killed mid-work', 'morto no meio do trabalho'));
            await api.say(L('When main returns, the whole program exits — worker(2) never gets to finish.', 'Quando main retorna, o programa inteiro termina — worker(2) nunca chega a terminar.'));
        },
    },

    /* ── unbuffered channel handshake ─────────────────────────────────── */
    'unbuffered-channels': {
        height: 195,
        async run(api) {
            const sender = api.goroutine(L('sender', 'remetente'), 40, 80);
            const receiver = api.goroutine(L('receiver', 'receptor'), 550, 80);
            const ch = api.channel('ch := make(chan int)', 333, 85, 0);
            api.state(sender, 'running');
            api.state(receiver, 'idle', L('not ready yet', 'ainda não pronto'));
            await api.say(L('An unbuffered channel has no storage — a send must meet a receive.', 'Um channel sem buffer não tem armazenamento — um envio precisa encontrar um recebimento.'));

            const t = api.token('42', 192, 103);
            api.state(sender, 'blocked', L('ch <- 42 (blocked)', 'ch <- 42 (bloqueado)'));
            await api.say(L('sender executes ch <- 42… nobody is receiving, so it blocks.', 'remetente executa ch <- 42… ninguém está recebendo, então ele bloqueia.'));
            await api.sleep(600);

            api.state(receiver, 'blocked', L('<-ch (waiting)', '<-ch (esperando)'));
            await api.say(L('receiver reaches <-ch — the two goroutines synchronize.', 'receptor chega em <-ch — as duas goroutines se sincronizam.'));

            const mid = ch.center();
            await api.move(t, mid.x, mid.y, 380);
            await api.move(t, 615, 103, 380);
            api.state(sender, 'running', L('send returned', 'envio retornou'));
            api.state(receiver, 'running', L('got 42', 'recebeu 42'));
            await api.say(L('The value is handed off and both continue. The handoff IS the synchronization.', 'O valor é entregue e ambos continuam. A entrega É a sincronização.'));
            await api.sleep(400);
            api.remove(t);
        },
    },

    /* ── buffered channel: fills, blocks, drains ──────────────────────── */
    'buffered-channels': {
        height: 215,
        async run(api) {
            const producer = api.goroutine(L('producer', 'produtor'), 30, 85, 125);
            const consumer = api.goroutine(L('consumer', 'consumidor'), 560, 85, 130);
            const ch = api.channel('ch := make(chan int, 3)', 262, 90, 3);
            api.state(producer, 'running');
            api.state(consumer, 'idle', L('busy elsewhere', 'ocupado em outra coisa'));
            await api.say(L('A buffered channel holds values — sends succeed while there is room.', 'Um channel com buffer guarda valores — envios funcionam enquanto houver espaço.'));

            const queue = [];
            for (let v = 1; v <= 3; v++) {
                const t = api.token(v, 180, 108);
                const slot = ch.slotXY(queue.length);
                api.state(producer, 'running', 'ch <- ' + v);
                await api.move(t, slot.x, slot.y, 420);
                queue.push(t);
            }
            await api.say(L('Three sends complete without blocking — the buffer is now full (3/3).', 'Três envios são concluídos sem bloquear — o buffer agora está cheio (3/3).'));

            const pending = api.token('4', 195, 108);
            api.state(producer, 'blocked', L('ch <- 4 (blocked)', 'ch <- 4 (bloqueado)'));
            await api.say(L('The fourth send blocks: no free slot until someone receives.', 'O quarto envio bloqueia: não há espaço livre até que alguém receba.'));
            await api.sleep(700);

            api.state(consumer, 'running', 'v := <-ch');
            const first = queue.shift();
            await api.move(first, 600, 108, 420);
            api.remove(first);
            await api.all(queue.map((t, i) => api.move(t, ch.slotXY(i).x, ch.slotXY(i).y, 300)));
            await api.say(L('consumer takes the oldest value (FIFO) — a slot frees up…', 'consumidor pega o valor mais antigo (FIFO) — um espaço libera…'));

            const slot = ch.slotXY(queue.length);
            await api.move(pending, slot.x, slot.y, 420);
            queue.push(pending);
            api.state(producer, 'running', L('send completed', 'envio concluído'));
            await api.say(L('…and the blocked send immediately completes. Buffers decouple, they don’t eliminate blocking.', '…e o envio bloqueado se completa imediatamente. Buffers desacoplam, mas não eliminam o bloqueio.'));
        },
    },

    /* ── close + range ────────────────────────────────────────────────── */
    'closing-and-range': {
        height: 200,
        async run(api) {
            const producer = api.goroutine(L('producer', 'produtor'), 30, 85, 125);
            const consumer = api.goroutine('for v := range ch', 545, 85, 150);
            const ch = api.channel('ch := make(chan int, 3)', 270, 90, 3);
            api.state(producer, 'running');
            api.state(consumer, 'running', L('receiving', 'recebendo'));
            await api.say(L('The producer sends a few values, then closes the channel.', 'O produtor envia alguns valores e depois fecha o channel.'));

            const queue = [];
            for (let v = 1; v <= 3; v++) {
                const t = api.token(v, 185, 108);
                const slot = ch.slotXY(queue.length);
                await api.move(t, slot.x, slot.y, 350);
                queue.push(t);
            }

            api.closeChannel(ch);
            api.state(producer, 'done', 'close(ch)');
            await api.say(L('close(ch) — no more sends allowed, but the buffered values are still there.', 'close(ch) — não são permitidos mais envios, mas os valores no buffer ainda estão lá.'));

            while (queue.length) {
                const t = queue.shift();
                await api.move(t, 590, 108, 380);
                api.remove(t);
                await api.all(queue.map((q, i) => api.move(q, ch.slotXY(i).x, ch.slotXY(i).y, 250)));
                if (queue.length === 1) await api.say(L('range keeps receiving until the channel is drained…', 'range continua recebendo até o channel ser drenado…'), 300);
            }

            api.state(consumer, 'done', L('loop exited', 'loop encerrado'));
            await api.say(L('Closed and empty — the range loop exits cleanly. No sentinel values needed.', 'Fechado e vazio — o loop range termina de forma limpa. Não são necessários valores sentinela.'));
        },
    },

    /* ── select between two channels ──────────────────────────────────── */
    select: {
        height: 265,
        async run(api) {
            const p1 = api.goroutine(L('producer A', 'produtor A'), 30, 30, 125);
            const p2 = api.goroutine(L('producer B', 'produtor B'), 30, 185, 125);
            const ch1 = api.channel('ch1', 300, 38, 0);
            const ch2 = api.channel('ch2', 300, 193, 0);
            const main = api.goroutine('main — select', 530, 105, 150);
            api.state(p1, 'running');
            api.state(p2, 'running');
            api.state(main, 'blocked', L('waiting on both', 'esperando os dois'));
            await api.say(L('select blocks on several channel operations at once and runs whichever is ready first.', 'select bloqueia em várias operações de channel ao mesmo tempo e executa a que ficar pronta primeiro.'));

            const t1 = api.token('a1', 180, 56);
            await api.say(L('producer A sends first — the ch1 case wins this round.', 'produtor A envia primeiro — o case ch1 vence esta rodada.'), 400);
            await api.move(t1, ch1.center().x, ch1.center().y, 350);
            await api.move(t1, 605, 128, 420);
            api.state(main, 'running', 'case <-ch1');
            await api.sleep(500);
            api.remove(t1);
            api.state(main, 'blocked', L('waiting on both', 'esperando os dois'));

            const t2 = api.token('b1', 180, 211, '#A9874E');
            await api.say(L('Next iteration, producer B is ready — the ch2 case runs.', 'Na próxima iteração, o produtor B está pronto — o case ch2 executa.'), 400);
            await api.move(t2, ch2.center().x, ch2.center().y, 350);
            await api.move(t2, 605, 128, 420);
            api.state(main, 'running', 'case <-ch2');
            await api.sleep(500);
            api.remove(t2);

            const t3 = api.token('a2', 180, 56);
            const t4 = api.token('b2', 180, 211, '#A9874E');
            api.state(main, 'blocked', L('waiting on both', 'esperando os dois'));
            await api.say(L('If several cases are ready at the same time, select picks one at random.', 'Se vários cases estiverem prontos ao mesmo tempo, select escolhe um aleatoriamente.'), 700);
            await api.all([api.move(t3, ch1.center().x, ch1.center().y, 350), api.move(t4, ch2.center().x, ch2.center().y, 350)]);
            await api.move(t4, 605, 128, 420);
            api.state(main, 'running', L('case <-ch2 (random)', 'case <-ch2 (aleatório)'));
            await api.sleep(500);
            api.remove(t4);
            await api.move(t3, 605, 128, 420);
            api.state(main, 'running', 'case <-ch1');
            api.remove(t3);
            await api.say(L('Random choice prevents one busy channel from starving the others.', 'A escolha aleatória evita que um channel ocupado deixe os outros em starvation.'));
        },
    },

    /* ── WaitGroup counter ────────────────────────────────────────────── */
    waitgroup: {
        height: 255,
        async run(api) {
            const main = api.goroutine('main()', 40, 105);
            api.state(main, 'running');
            const counter = api.label(L('WaitGroup counter: 0', 'Contador do WaitGroup: 0'), 285, 32, { size: 14, bold: true, color: 'brass' });
            await api.say(L('wg.Add(3) — tell the WaitGroup how many goroutines to expect.', 'wg.Add(3) — diz ao WaitGroup quantas goroutines esperar.'));
            counter.text = L('WaitGroup counter: 3', 'Contador do WaitGroup: 3');
            await api.sleep(400);

            const workers = [];
            for (let i = 0; i < 3; i++) {
                const w = api.goroutine('worker(' + (i + 1) + ')', 470, 20 + i * 80);
                api.state(w, 'running');
                workers.push(w);
            }
            api.state(main, 'blocked', 'wg.Wait()');
            await api.say(L('main calls wg.Wait() and blocks until the counter reaches zero.', 'main chama wg.Wait() e bloqueia até o contador chegar a zero.'));

            await api.sleep(700);
            api.state(workers[1], 'done', 'wg.Done()');
            counter.text = L('WaitGroup counter: 2', 'Contador do WaitGroup: 2');
            await api.say(L('Workers finish in any order, each calling wg.Done() on the way out…', 'Os workers terminam em qualquer ordem, cada um chamando wg.Done() ao sair…'), 800);

            api.state(workers[0], 'done', 'wg.Done()');
            counter.text = L('WaitGroup counter: 1', 'Contador do WaitGroup: 1');
            await api.sleep(800);

            api.state(workers[2], 'done', 'wg.Done()');
            counter.text = L('WaitGroup counter: 0', 'Contador do WaitGroup: 0');
            await api.sleep(300);
            api.state(main, 'running', L('Wait() returned', 'Wait() retornou'));
            await api.say(L('Counter hits zero — wg.Wait() returns and main continues, certain all work is done.', 'O contador chega a zero — wg.Wait() retorna e main continua, com certeza de que todo o trabalho terminou.'));
        },
    },

    /* ── mutex: serialized access ─────────────────────────────────────── */
    'mutex-vs-channels': {
        height: 235,
        async run(api) {
            const counter = api.label(L('counter = 0', 'counter = 0'), 360, 38, { size: 15, bold: true, color: 'text' });
            const lock = api.label(L('mutex: unlocked', 'mutex: destravado'), 360, 62, { size: 11.5, color: 'muted' });
            const g1 = api.goroutine(L('goroutine A', 'goroutine A'), 70, 130);
            const g2 = api.goroutine(L('goroutine B', 'goroutine B'), 510, 130);
            api.state(g1, 'running');
            api.state(g2, 'running');
            await api.say(L('Two goroutines both want to do counter++ — an unprotected read-modify-write.', 'Duas goroutines querem fazer counter++ — uma leitura-modificação-escrita desprotegida.'));

            api.state(g1, 'running', L('mu.Lock() ✓', 'mu.Lock() ✓'));
            api.state(g2, 'blocked', L('mu.Lock() blocked', 'mu.Lock() bloqueado'));
            lock.text = L('mutex: held by A', 'mutex: travado por A');
            await api.say(L('A acquires the mutex first. B calls Lock() and has to wait — no interleaving possible.', 'A adquire o mutex primeiro. B chama Lock() e precisa esperar — nenhum entrelaçamento é possível.'));

            counter.text = 'counter = 1';
            api.state(g1, 'running', 'counter++');
            await api.sleep(900);

            api.state(g1, 'done', 'mu.Unlock()');
            api.state(g2, 'running', L('mu.Lock() ✓', 'mu.Lock() ✓'));
            lock.text = L('mutex: held by B', 'mutex: travado por B');
            await api.say(L('A unlocks; B immediately acquires and does its own increment.', 'A destrava; B adquire imediatamente e faz seu próprio incremento.'));

            counter.text = 'counter = 2';
            await api.sleep(700);
            api.state(g2, 'done', 'mu.Unlock()');
            lock.text = L('mutex: unlocked', 'mutex: destravado');
            await api.say(L('Final value: 2, every single run. Without the mutex this is a data race.', 'Valor final: 2, em toda execução. Sem o mutex isso seria uma data race.'));
        },
    },

    /* ── worker pool ──────────────────────────────────────────────────── */
    'worker-pools': {
        height: 290,
        async run(api) {
            const jobs = api.channel(L('jobs (cap 5)', 'jobs (cap 5)'), 30, 130, 5);
            const results = api.channel(L('results (cap 5)', 'results (cap 5)'), 510, 130, 5);
            const workers = [];
            for (let i = 0; i < 3; i++) {
                const w = api.goroutine('worker(' + (i + 1) + ')', 300, 25 + i * 90);
                api.state(w, 'blocked', 'range jobs');
                workers.push(w);
            }
            await api.say(L('Three workers all range over the same jobs channel — each job goes to exactly one of them.', 'Três workers fazem range sobre o mesmo channel jobs — cada job vai para exatamente um deles.'));

            const queue = [];
            for (let v = 1; v <= 5; v++) {
                const t = api.token('j' + v, 15, 105);
                const slot = jobs.slotXY(queue.length);
                await api.move(t, slot.x, slot.y, 220);
                queue.push(t);
            }
            await api.say(L('main queues five jobs. The workers pull them off as fast as they can.', 'main enfileira cinco jobs. Os workers os retiram o mais rápido que conseguem.'), 600);

            const resultQueue = [];
            const workerYs = [48, 138, 228];
            let done = 0;

            const runWorker = async (wi, jobToken, delay) => {
                api.state(workers[wi], 'running', L('processing ', 'processando ') + jobToken.value);
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
            await api.say(L('Jobs run concurrently — a slow job only ties up one worker, not the whole pool.', 'Os jobs rodam concorrentemente — um job lento ocupa apenas um worker, não o pool inteiro.'), 200);
            await api.all(wave1);

            const wave2 = [runWorker(2, queue[0], 600), runWorker(0, queue[1], 800)];
            queue.splice(0, 2);
            await api.all(wave2);

            workers.forEach((w) => api.state(w, 'done', L('jobs closed — exit', 'jobs fechado — sai')));
            await api.say(L('close(jobs) ends every worker’s range loop; five results are waiting in order of completion.', 'close(jobs) encerra o loop range de cada worker; cinco resultados estão esperando na ordem de conclusão.'));
        },
    },

    /* ── fan-out / fan-in ─────────────────────────────────────────────── */
    'fan-out-fan-in': {
        height: 285,
        async run(api) {
            const producers = [];
            const chans = [];
            for (let i = 0; i < 3; i++) {
                const p = api.goroutine(L('source ', 'fonte ') + (i + 1), 25, 20 + i * 90, 115);
                api.state(p, 'running');
                producers.push(p);
                chans.push(api.channel('ch' + (i + 1), 215, 28 + i * 90, 0));
            }
            const merge = api.goroutine('merge()', 350, 110, 120);
            const out = api.channel('out', 525, 118, 0);
            const main = api.goroutine('main', 615, 110, 90);
            api.state(merge, 'running');
            api.state(main, 'running', 'range out');
            await api.say(L('Three sources each produce on their own channel — fan-in merges them into one stream.', 'Três fontes produzem cada uma em seu próprio channel — fan-in as une em um único fluxo.'));

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
                if (k === 1) await api.say(L('merge() runs one forwarding goroutine per source, all sending to the same out channel.', 'merge() roda uma goroutine encaminhadora por fonte, todas enviando para o mesmo channel out.'), 300);
            }

            producers.forEach((p, i) => {
                api.state(p, 'done', 'close(ch' + (i + 1) + ')');
            });
            await api.say(L('When every source closes its channel, the forwarders finish…', 'Quando cada fonte fecha seu channel, os encaminhadores terminam…'), 900);
            api.state(merge, 'done', 'close(out)');
            api.closeChannel(out);
            api.state(main, 'done', L('range exited', 'range encerrado'));
            await api.say(L('…a WaitGroup notices all of them are done, merge closes out, and the consumer’s range ends.', '…um WaitGroup percebe que todos terminaram, merge fecha out, e o range do consumidor termina.'));
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
            const sink = api.goroutine(L('main — print', 'main — print'), 510, 80, 130);
            api.state(gen, 'running');
            api.state(sq, 'running');
            api.state(sink, 'running');
            await api.say(L('A pipeline: each stage receives from upstream, transforms, and sends downstream.', 'Um pipeline: cada estágio recebe de quem está antes, transforma, e envia para quem está depois.'));

            const values = [2, 3, 4];
            for (let i = 0; i < values.length; i++) {
                const v = values[i];
                const t = api.token(v, 110, 103);
                await api.move(t, ch1.center().x, ch1.center().y, 300);
                await api.move(t, 317, 103, 300);
                if (i === 0) await api.say(L('Stages run concurrently: while square works on 2, generate is already sending 3.', 'Os estágios rodam concorrentemente: enquanto square trabalha no 2, generate já está enviando o 3.'), 200);
                t.value = String(v * v);
                await api.sleep(250);
                await api.move(t, ch2.center().x, ch2.center().y, 300);
                await api.move(t, 575, 103, 300);
                api.remove(t);
            }

            api.state(gen, 'done', 'close(nums)');
            await api.say(L('generate closes its channel; square’s range ends, so it closes too…', 'generate fecha seu channel; o range de square termina, então ele também fecha…'), 900);
            api.state(sq, 'done', 'close(squares)');
            api.closeChannel(ch2);
            api.state(sink, 'done', L('range exited', 'range encerrado'));
            await api.say(L('Closing cascades down the pipeline and every stage shuts down cleanly.', 'O fechamento se propaga pelo pipeline e cada estágio desliga de forma limpa.'));
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
            await api.say(L('Workers loop in a select, watching ctx.Done() alongside their real work.', 'Os workers ficam em loop em um select, observando ctx.Done() junto com seu trabalho real.'));
            await api.sleep(900);

            await api.say(L('Something happens — a timeout, a failed request — and main calls cancel().', 'Algo acontece — um timeout, uma requisição com falha — e main chama cancel().'));
            const s1 = api.token('✕', 175, 123, '#DC2626');
            const s2 = api.token('✕', 175, 123, '#DC2626');
            api.state(main, 'running', 'cancel()');
            await api.all([api.move(s1, 540, 43, 600), api.move(s2, 540, 198, 600)]);
            api.remove(s1);
            api.remove(s2);

            api.state(w1, 'done', 'ctx.Done() — return');
            api.state(w2, 'done', 'ctx.Done() — return');
            await api.say(L('Done() is a closed channel: every goroutine watching it unblocks at once and returns.', 'Done() é um channel fechado: toda goroutine que o observa desbloqueia de uma vez e retorna.'));
            await api.say(L('One cancel() tears down the whole tree of work — no goroutine leaks.', 'Um único cancel() derruba toda a árvore de trabalho — sem vazamentos de goroutine.'));
        },
    },

    /* ── deadlock panic ───────────────────────────────────────────────── */
    'deadlocks-and-leaks': {
        height: 190,
        async run(api) {
            const main = api.goroutine('main()', 50, 70);
            const ch = api.channel('ch := make(chan int)', 350, 75, 0);
            api.state(main, 'running');
            await api.say(L('main sends on an unbuffered channel… but no other goroutine will ever receive.', 'main envia em um channel sem buffer… mas nenhuma outra goroutine jamais vai receber.'));

            const t = api.token('1', 200, 93);
            api.state(main, 'blocked', L('ch <- 1 (forever)', 'ch <- 1 (para sempre)'));
            await api.say(L('The send blocks. And blocks. There is nothing left to run.', 'O envio bloqueia. E continua bloqueado. Não sobrou mais nada para rodar.'), 1400);

            await api.say(L('The runtime detects that every goroutine is asleep and panics:', 'O runtime detecta que todas as goroutines estão dormindo e entra em panic:'), 600);
            api.banner('fatal error: all goroutines are asleep - deadlock!');
            api.state(main, 'killed', L('crashed', 'encerrou com falha'));
            await api.sleep(1800);
            api.remove(t);
        },
    },
    };

    window.GO_ANIMATIONS = GO_ANIMATIONS;
})();
