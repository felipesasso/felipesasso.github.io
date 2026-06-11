/* Go Concurrency — quick-reference content
   GO_CATEGORIES maps category name → badge modifier class.
   GO_TOPICS drives the index table and the detail cards; topics whose id
   has an entry in GO_ANIMATIONS (animations.js) also get a live diagram.

   Fields suffixed with `_pt` hold the Brazilian Portuguese translation of
   the field with the same name (or, for arrays, the same-index entries).
   Go code samples (`samples[].code`), keywords, identifiers, and the
   `category` value itself (the key into GO_CATEGORIES) are left
   untranslated since they're literal Go syntax / lookup keys; GO_CATEGORIES
   below has its own `_pt` map for the translated badge labels. */

const GO_CATEGORIES = {
    Basics: 'basics',
    Channels: 'channels',
    Synchronization: 'sync',
    Patterns: 'patterns',
    Pitfalls: 'pitfalls',
};

const GO_CATEGORIES_PT = {
    Basics: 'Básicos',
    Channels: 'Channels',
    Synchronization: 'Sincronização',
    Patterns: 'Padrões',
    Pitfalls: 'Armadilhas',
};

const GO_TOPICS = [
    {
        id: 'goroutines',
        name: 'Goroutines',
        name_pt: 'Goroutines',
        category: 'Basics',
        complexity: 'Low',
        whenToUse: 'You want to run a function concurrently — handle a request, fire off I/O, do background work',
        whenToUse_pt: 'Você quer executar uma função de forma concorrente — atender uma requisição, disparar I/O, fazer trabalho em segundo plano',
        summary:
            'A goroutine is a function running concurrently with the rest of your program, started with the go keyword. They are not OS threads: the Go runtime multiplexes thousands of goroutines onto a handful of threads, and each one starts with a tiny (~2KB) stack that grows on demand. Starting one is so cheap that "just spawn a goroutine" is idiomatic Go — the hard part is knowing when it finishes, which is what channels and WaitGroups are for.',
        summary_pt:
            'Uma goroutine é uma função executando concorrentemente com o resto do seu programa, iniciada com a palavra-chave go. Elas não são threads do sistema operacional: o runtime do Go multiplexa milhares de goroutines em um punhado de threads, e cada uma começa com uma stack minúscula (~2KB) que cresce sob demanda. Iniciar uma é tão barato que "simplesmente disparar uma goroutine" é Go idiomático — a parte difícil é saber quando ela termina, e é para isso que existem channels e WaitGroups.',
        howItWorks: [
            'go f(x) evaluates f and x in the current goroutine, then runs the call in a new goroutine — the statement returns immediately.',
            'The Go scheduler (an M:N scheduler) distributes goroutines across OS threads; goroutines yield at function calls, channel operations and blocking syscalls.',
            'main() itself runs in a goroutine. When it returns, the program exits immediately — other goroutines are not waited for and get no chance to clean up.',
            'A goroutine has no handle or ID you can join on. To know it finished, it must tell you — via a channel, a sync.WaitGroup or similar.',
        ],
        howItWorks_pt: [
            'go f(x) avalia f e x na goroutine atual, e então executa a chamada em uma nova goroutine — a instrução retorna imediatamente.',
            'O scheduler do Go (um scheduler M:N) distribui goroutines entre threads do sistema operacional; goroutines cedem o controle em chamadas de função, operações de channel e syscalls bloqueantes.',
            'O próprio main() roda em uma goroutine. Quando ele retorna, o programa termina imediatamente — outras goroutines não são esperadas e não têm chance de fazer limpeza.',
            'Uma goroutine não tem handle nem ID para você esperar (join). Para saber que ela terminou, ela precisa avisar você — via channel, sync.WaitGroup ou algo parecido.',
        ],
        samples: [
            {
                label: 'Spawning goroutines',
                label_pt: 'Disparando goroutines',
                code: `package main

import (
	"fmt"
	"time"
)

func worker(id int) {
	fmt.Printf("worker %d: starting\\n", id)
	time.Sleep(500 * time.Millisecond) // pretend this is real work
	fmt.Printf("worker %d: done\\n", id)
}

func main() {
	go worker(1) // returns immediately; worker runs concurrently
	go worker(2)

	// Without waiting, main returns first and the program exits
	// before the workers ever print "done".
	time.Sleep(time.Second) // demo only — use sync.WaitGroup in real code
}`,
            },
            {
                label: 'Goroutines and loop variables',
                label_pt: 'Goroutines e variáveis de loop',
                code: `// Go 1.22+: each loop iteration gets its own i, so this prints
// 0, 1, 2 (in some order).
for i := 0; i < 3; i++ {
	go func() {
		fmt.Println(i)
	}()
}

// On older Go versions the variable was shared across iterations and
// this usually printed "3 3 3". The classic fix — still fine today —
// is to pass the value as an argument:
for i := 0; i < 3; i++ {
	go func(i int) {
		fmt.Println(i)
	}(i)
}`,
            },
        ],
        watchOut: [
            'main exiting kills every goroutine instantly — always have a plan for waiting (WaitGroup, channel, errgroup).',
            'A goroutine you start and never hear from again is a leak: it holds its stack and everything it references until the program ends.',
            'Sharing variables between goroutines without synchronization is a data race even if it "seems to work" — run tests with go test -race.',
            'Spawning a goroutine per item with no bound can exhaust memory or overwhelm downstream services — bound concurrency with a worker pool or semaphore.',
        ],
        watchOut_pt: [
            'main terminando mata todas as goroutines instantaneamente — sempre tenha um plano para esperar (WaitGroup, channel, errgroup).',
            'Uma goroutine que você inicia e da qual nunca mais tem notícias é um vazamento: ela mantém sua stack e tudo que referencia até o programa terminar.',
            'Compartilhar variáveis entre goroutines sem sincronização é uma data race mesmo que "pareça funcionar" — rode os testes com go test -race.',
            'Disparar uma goroutine por item sem nenhum limite pode esgotar a memória ou sobrecarregar serviços downstream — limite a concorrência com um worker pool ou semáforo.',
        ],
    },

    {
        id: 'unbuffered-channels',
        name: 'Unbuffered Channels',
        name_pt: 'Channels Sem Buffer',
        category: 'Channels',
        complexity: 'Low',
        whenToUse: 'You need to hand a value between goroutines and synchronize them at the same moment',
        whenToUse_pt: 'Você precisa passar um valor entre goroutines e sincronizá-las no mesmo instante',
        summary:
            'A channel is a typed conduit for sending values between goroutines: ch <- v sends, <-ch receives. An unbuffered channel — make(chan T) — has no storage at all, so every send blocks until a receiver is ready and vice versa. That rendezvous is the point: the handoff doubles as a synchronization event, giving you a hard guarantee about ordering ("the receiver has the value before my next line runs").',
        summary_pt:
            'Um channel é um conduto tipado para enviar valores entre goroutines: ch <- v envia, <-ch recebe. Um channel sem buffer — make(chan T) — não tem nenhum armazenamento, então todo envio bloqueia até que um receptor esteja pronto e vice-versa. Esse encontro (rendezvous) é o ponto principal: a entrega também funciona como um evento de sincronização, dando uma garantia rígida sobre a ordem ("o receptor já tem o valor antes da minha próxima linha rodar").',
        howItWorks: [
            'make(chan T) creates an unbuffered channel of type T. Send and receive are the only operations (plus close).',
            'ch <- v blocks the sender until another goroutine executes <-ch — and the other way around. Whoever arrives first waits.',
            'The value is copied directly from sender to receiver; there is no queue in between.',
            'This "happens-before" guarantee is part of the Go memory model: everything the sender did before the send is visible to the receiver after the receive.',
        ],
        howItWorks_pt: [
            'make(chan T) cria um channel sem buffer do tipo T. Enviar e receber são as únicas operações (além de close).',
            'ch <- v bloqueia o remetente até que outra goroutine execute <-ch — e vice-versa. Quem chegar primeiro espera.',
            'O valor é copiado diretamente do remetente para o receptor; não existe fila no meio do caminho.',
            'Essa garantia de "happens-before" faz parte do modelo de memória do Go: tudo que o remetente fez antes do envio fica visível ao receptor depois do recebimento.',
        ],
        samples: [
            {
                label: 'Send, receive, synchronize',
                label_pt: 'Enviar, receber, sincronizar',
                code: `func main() {
	ch := make(chan string) // unbuffered

	go func() {
		// This send waits here until main is ready to receive.
		ch <- "ping"
	}()

	msg := <-ch // blocks until the goroutine sends
	fmt.Println(msg) // "ping"
}`,
            },
            {
                label: 'A done-signal channel',
                label_pt: 'Um channel de sinalização "done"',
                code: `func main() {
	done := make(chan struct{}) // struct{} = "no data, just a signal"

	go func() {
		doWork()
		close(done) // closing never blocks and wakes every receiver
	}()

	<-done // wait for the worker to finish
	fmt.Println("work complete")
}`,
            },
        ],
        watchOut: [
            'Sending with no receiver (or receiving with no sender) in the same goroutine deadlocks immediately — there is nobody to complete the handshake.',
            'An unbuffered send inside a goroutine that the receiver abandons (e.g. after a timeout) blocks forever: a goroutine leak.',
            'nil channels block forever on both send and receive — a channel you forgot to make() is a silent hang, not an error.',
            'Use chan struct{} for pure signals; it documents that no data flows and costs nothing.',
        ],
        watchOut_pt: [
            'Enviar sem receptor (ou receber sem remetente) na mesma goroutine causa deadlock imediato — não há ninguém para completar o handshake.',
            'Um envio sem buffer dentro de uma goroutine cujo receptor desistiu (por exemplo, após um timeout) bloqueia para sempre: um vazamento de goroutine.',
            'Channels nil bloqueiam para sempre tanto no envio quanto no recebimento — um channel que você esqueceu de criar com make() é uma travada silenciosa, não um erro.',
            'Use chan struct{} para sinais puros; isso documenta que nenhum dado trafega e não custa nada.',
        ],
    },

    {
        id: 'buffered-channels',
        name: 'Buffered Channels',
        name_pt: 'Channels Com Buffer',
        category: 'Channels',
        complexity: 'Low',
        whenToUse: 'Producer and consumer run at different speeds, or you want to bound concurrency with a semaphore',
        whenToUse_pt: 'Produtor e consumidor rodam em velocidades diferentes, ou você quer limitar a concorrência com um semáforo',
        summary:
            'make(chan T, n) creates a channel with an internal FIFO queue of capacity n. Sends only block when the buffer is full and receives only block when it is empty, which decouples producer and consumer: the producer can sprint ahead by up to n values before anyone has to wait. A buffer changes when goroutines block — it never removes the need to think about blocking.',
        summary_pt:
            'make(chan T, n) cria um channel com uma fila FIFO interna de capacidade n. Envios só bloqueiam quando o buffer está cheio e recebimentos só bloqueiam quando está vazio, o que desacopla produtor e consumidor: o produtor pode adiantar-se em até n valores antes de alguém precisar esperar. Um buffer muda quando as goroutines bloqueiam — ele nunca elimina a necessidade de pensar sobre bloqueio.',
        howItWorks: [
            'ch <- v appends to the buffer and returns immediately while there is room; once the buffer holds n values the send blocks like an unbuffered one.',
            '<-ch pops the oldest value (FIFO); it blocks only when the buffer is empty.',
            'len(ch) is the number of values currently buffered, cap(ch) the capacity — useful for monitoring, dangerous for logic (both are stale the moment you read them).',
            'A full buffered channel of struct{} makes a counting semaphore: send to acquire, receive to release.',
        ],
        howItWorks_pt: [
            'ch <- v adiciona ao buffer e retorna imediatamente enquanto houver espaço; assim que o buffer tem n valores, o envio bloqueia como um sem buffer.',
            '<-ch remove o valor mais antigo (FIFO); só bloqueia quando o buffer está vazio.',
            'len(ch) é o número de valores atualmente no buffer, cap(ch) é a capacidade — úteis para monitoramento, perigosos para lógica (ambos já estão desatualizados no momento em que você os lê).',
            'Um channel de struct{} com buffer cheio funciona como um semáforo de contagem: enviar para adquirir, receber para liberar.',
        ],
        samples: [
            {
                label: 'Buffering basics',
                label_pt: 'Conceitos básicos de buffer',
                code: `func main() {
	ch := make(chan int, 2) // room for 2 values

	ch <- 1 // returns immediately: buffer 1/2
	ch <- 2 // returns immediately: buffer 2/2
	// ch <- 3 would block here until someone receives

	fmt.Println(<-ch) // 1 — FIFO order
	fmt.Println(<-ch) // 2
}`,
            },
            {
                label: 'Semaphore: bound concurrency to 3',
                label_pt: 'Semáforo: limitar concorrência a 3',
                code: `func fetchAll(urls []string) {
	sem := make(chan struct{}, 3) // at most 3 fetches in flight
	var wg sync.WaitGroup

	for _, url := range urls {
		wg.Add(1)
		go func(url string) {
			defer wg.Done()
			sem <- struct{}{}        // acquire a slot (blocks if 3 are busy)
			defer func() { <-sem }() // release it
			fetch(url)
		}(url)
	}
	wg.Wait()
}`,
            },
        ],
        watchOut: [
            'A buffer is not a fix for deadlocks — it just delays them until the buffer fills. Size buffers from real requirements (burst size, number of senders), not superstition.',
            'Huge buffers hide backpressure: the producer happily fills memory while the consumer drowns. Often a small buffer (or none) plus visible blocking is healthier.',
            'Using len(ch) to decide whether a send/receive would block is a race — another goroutine can act between your check and your operation. Use select with default instead.',
            'Values stuck in an abandoned buffer are never garbage-collected until the channel itself is unreachable.',
        ],
        watchOut_pt: [
            'Um buffer não conserta deadlocks — ele apenas adia até o buffer encher. Dimensione buffers a partir de requisitos reais (tamanho de rajada, número de remetentes), não por superstição.',
            'Buffers enormes escondem o backpressure: o produtor enche a memória alegremente enquanto o consumidor afoga. Muitas vezes um buffer pequeno (ou nenhum) com bloqueio visível é mais saudável.',
            'Usar len(ch) para decidir se um envio/recebimento vai bloquear é uma race — outra goroutine pode agir entre sua checagem e sua operação. Use select com default em vez disso.',
            'Valores presos em um buffer abandonado nunca são coletados pelo garbage collector até que o próprio channel se torne inacessível.',
        ],
    },

    {
        id: 'channel-directions',
        name: 'Channel Directions',
        name_pt: 'Direções de Channel',
        category: 'Channels',
        complexity: 'Low',
        whenToUse: 'A function only sends or only receives — let the compiler enforce that',
        whenToUse_pt: 'Uma função só envia ou só recebe — deixe o compilador garantir isso',
        summary:
            'Channel types can be restricted to send-only (chan<- T) or receive-only (<-chan T). Using directional types in function signatures documents data flow and turns misuse into a compile error: a consumer physically cannot send on, or close, the channel it ranges over. A bidirectional channel converts to either direction automatically at the call site, so this costs nothing.',
        summary_pt:
            'Tipos de channel podem ser restritos a apenas-envio (chan<- T) ou apenas-recebimento (<-chan T). Usar tipos direcionais em assinaturas de função documenta o fluxo de dados e transforma o uso indevido em erro de compilação: um consumidor fisicamente não consegue enviar para, ou fechar, o channel sobre o qual está iterando. Um channel bidirecional é convertido automaticamente para qualquer direção no ponto de chamada, então isso não custa nada.',
        howItWorks: [
            'chan<- T is send-only ("arrow into the channel"); <-chan T is receive-only ("arrow out of the channel").',
            'Conversion is one-way: chan T converts implicitly to either directional type, but a directional channel can never go back to bidirectional.',
            'Only the sending side can close a channel — and close is a compile error on a <-chan T, which neatly enforces the "senders close" rule.',
            'Returning <-chan T from a constructor function is the idiomatic way to expose a stream of values while keeping the sending side private.',
        ],
        howItWorks_pt: [
            'chan<- T é apenas-envio ("seta entrando no channel"); <-chan T é apenas-recebimento ("seta saindo do channel").',
            'A conversão é em uma só via: chan T converte implicitamente para qualquer tipo direcional, mas um channel direcional nunca volta a ser bidirecional.',
            'Somente o lado que envia pode fechar um channel — e close é um erro de compilação em um <-chan T, o que reforça perfeitamente a regra "quem envia, fecha".',
            'Retornar <-chan T a partir de uma função construtora é a forma idiomática de expor um fluxo de valores mantendo o lado de envio privado.',
        ],
        samples: [
            {
                label: 'Direction-typed producer and consumer',
                label_pt: 'Produtor e consumidor com tipos direcionais',
                code: `// produce can only send on ch — receiving from it is a compile error.
func produce(ch chan<- int) {
	for i := 1; i <= 3; i++ {
		ch <- i
	}
	close(ch) // allowed: produce holds the send side
}

// consume can only receive — "ch <- 99" or "close(ch)" won't compile.
func consume(ch <-chan int) {
	for v := range ch {
		fmt.Println(v)
	}
}

func main() {
	ch := make(chan int) // bidirectional
	go produce(ch)       // converts to chan<- int automatically
	consume(ch)          // converts to <-chan int automatically
}`,
            },
        ],
        watchOut: [
            'Directions are compile-time only — they add zero runtime cost and zero runtime protection if you keep passing the bidirectional channel around.',
            'You cannot convert a directional channel back to bidirectional; keep the original chan T where ownership lives.',
            'A receive-only channel cannot be closed by its holder — if a consumer "needs" to close it, the design is upside down (cancellation should flow via context or a separate done channel).',
        ],
        watchOut_pt: [
            'Direções existem apenas em tempo de compilação — não adicionam custo nem proteção em tempo de execução se você continuar passando o channel bidirecional por aí.',
            'Você não pode converter um channel direcional de volta para bidirecional; mantenha o chan T original onde está a posse (ownership).',
            'Um channel apenas-recebimento não pode ser fechado por quem o detém — se um consumidor "precisa" fechá-lo, o design está invertido (o cancelamento deveria fluir via context ou um channel done separado).',
        ],
    },

    {
        id: 'closing-and-range',
        name: 'Closing & range',
        name_pt: 'Fechamento e range',
        category: 'Channels',
        complexity: 'Medium',
        whenToUse: 'A producer needs to tell consumers "no more values are coming"',
        whenToUse_pt: 'Um produtor precisa avisar os consumidores que "não vêm mais valores"',
        summary:
            'close(ch) marks a channel as finished. Receivers can still drain any buffered values; after that, receives return the zero value immediately instead of blocking. The comma-ok form v, ok := <-ch distinguishes "real zero value" from "closed", and for v := range ch loops until the channel is drained and closed — which makes close the idiomatic end-of-stream signal.',
        summary_pt:
            'close(ch) marca um channel como finalizado. Os receptores ainda podem drenar quaisquer valores em buffer; depois disso, os recebimentos retornam o valor zero imediatamente em vez de bloquear. A forma comma-ok v, ok := <-ch distingue "valor zero de verdade" de "channel fechado", e for v := range ch repete até que o channel seja drenado e fechado — o que faz de close o sinal idiomático de fim de fluxo.',
        howItWorks: [
            'close(ch) is a signal from sender to receivers, not a destructor — channels are garbage-collected like everything else and don\'t need closing unless someone is waiting for the end.',
            'Receiving from a closed channel never blocks: it yields remaining buffered values first, then zero values with ok == false.',
            'for v := range ch receives until the channel is both empty and closed, then exits the loop — no sentinel values, no manual ok checks.',
            'A receive on a closed channel wakes all waiting receivers at once, which is why close(done) broadcasts to any number of goroutines.',
            'The rule of ownership: only the (single) sender closes. Multiple senders need coordination — usually a sync.WaitGroup and a dedicated closer goroutine.',
        ],
        howItWorks_pt: [
            'close(ch) é um sinal do remetente para os receptores, não um destrutor — channels são coletados pelo garbage collector como qualquer outra coisa e não precisam ser fechados a menos que alguém esteja esperando pelo fim.',
            'Receber de um channel fechado nunca bloqueia: primeiro entrega os valores restantes do buffer, depois valores zero com ok == false.',
            'for v := range ch recebe até que o channel esteja vazio e fechado, então sai do loop — sem valores sentinela, sem checagens manuais de ok.',
            'Um recebimento em um channel fechado acorda todos os receptores em espera de uma vez, e é por isso que close(done) faz broadcast para qualquer número de goroutines.',
            'A regra de posse: somente o (único) remetente fecha. Múltiplos remetentes precisam de coordenação — geralmente um sync.WaitGroup e uma goroutine dedicada para fechar.',
        ],
        samples: [
            {
                label: 'close + range',
                label_pt: 'close + range',
                code: `func main() {
	ch := make(chan int, 3)

	go func() {
		for i := 1; i <= 3; i++ {
			ch <- i
		}
		close(ch) // the sender closes — never the receiver
	}()

	for v := range ch { // exits once ch is drained and closed
		fmt.Println(v)
	}

	// comma-ok tells closed apart from a genuine zero value:
	v, ok := <-ch
	fmt.Println(v, ok) // 0 false
}`,
            },
            {
                label: 'Many senders, one closer',
                label_pt: 'Vários remetentes, um único responsável por fechar',
                code: `func produceAll(inputs [][]int) <-chan int {
	out := make(chan int)
	var wg sync.WaitGroup

	for _, batch := range inputs {
		wg.Add(1)
		go func(batch []int) { // many senders…
			defer wg.Done()
			for _, v := range batch {
				out <- v
			}
		}(batch)
	}

	go func() { // …one closer, once they're all done
		wg.Wait()
		close(out)
	}()
	return out
}`,
            },
        ],
        watchOut: [
            'Sending on a closed channel panics. So does closing a channel twice. Both are why only the owning sender should ever call close.',
            'Forgetting to close a channel that a consumer ranges over leaves that consumer blocked forever once values stop coming.',
            'A receive returning the zero value is ambiguous on its own — use comma-ok (or range) when "stream ended" matters.',
            'Don\'t use close for anything except "no more values" / broadcast signals; it carries no payload and can\'t be undone.',
        ],
        watchOut_pt: [
            'Enviar para um channel fechado causa panic. Fechar um channel duas vezes também. Por isso, somente o remetente dono deveria chamar close.',
            'Esquecer de fechar um channel sobre o qual um consumidor itera com range deixa esse consumidor bloqueado para sempre quando os valores param de chegar.',
            'Um recebimento que retorna o valor zero é ambíguo por si só — use comma-ok (ou range) quando "o fluxo terminou" importar.',
            'Não use close para nada além de sinais de "não vêm mais valores" / broadcast; ele não carrega payload e não pode ser desfeito.',
        ],
    },

    {
        id: 'select',
        name: 'select',
        name_pt: 'select',
        category: 'Channels',
        complexity: 'Medium',
        whenToUse: 'A goroutine must wait on several channels at once — multiplexing, timeouts, cancellation, non-blocking ops',
        whenToUse_pt: 'Uma goroutine precisa esperar em vários channels ao mesmo tempo — multiplexação, timeouts, cancelamento, operações não bloqueantes',
        summary:
            'select is switch for channel operations: it blocks until one of its cases (sends or receives) can proceed, then runs that case. If several are ready it picks one uniformly at random, preventing starvation. With a default case it becomes non-blocking; combined with time.After or ctx.Done() it is how Go expresses timeouts and cancellation. Almost every long-lived goroutine ends up as a for { select { … } } loop.',
        summary_pt:
            'select é o switch das operações de channel: ele bloqueia até que um dos seus cases (envios ou recebimentos) possa prosseguir, e então executa esse case. Se vários estiverem prontos, ele escolhe um de forma uniformemente aleatória, evitando starvation. Com um case default ele se torna não bloqueante; combinado com time.After ou ctx.Done() é assim que o Go expressa timeouts e cancelamento. Quase toda goroutine de longa duração acaba virando um loop for { select { … } }.',
        howItWorks: [
            'Each case is a channel send or receive. select evaluates all channel expressions, then blocks until at least one case is ready.',
            'Multiple ready cases → one is chosen at random. This is deliberate: it stops a busy channel from permanently starving the others.',
            'default runs immediately when no case is ready, turning select into a non-blocking attempt ("try-send" / "try-receive").',
            'case <-time.After(d) adds a timeout; case <-ctx.Done() adds cancellation. Both are just receives on channels.',
            'A nil channel in a case is never ready — setting a channel variable to nil is the standard trick for disabling a case inside a loop.',
        ],
        howItWorks_pt: [
            'Cada case é um envio ou recebimento de channel. select avalia todas as expressões de channel, e então bloqueia até que pelo menos um case esteja pronto.',
            'Vários cases prontos → um é escolhido aleatoriamente. Isso é proposital: impede que um channel ocupado deixe os outros em starvation permanentemente.',
            'default roda imediatamente quando nenhum case está pronto, transformando o select em uma tentativa não bloqueante ("try-send" / "try-receive").',
            'case <-time.After(d) adiciona um timeout; case <-ctx.Done() adiciona cancelamento. Ambos são apenas recebimentos em channels.',
            'Um channel nil em um case nunca está pronto — definir uma variável de channel como nil é o truque padrão para desabilitar um case dentro de um loop.',
        ],
        samples: [
            {
                label: 'Multiplex with a timeout',
                label_pt: 'Multiplexar com timeout',
                code: `select {
case msg := <-ch1:
	fmt.Println("from ch1:", msg)
case msg := <-ch2:
	fmt.Println("from ch2:", msg)
case <-time.After(2 * time.Second):
	fmt.Println("timed out waiting for both")
}`,
            },
            {
                label: 'Non-blocking receive with default',
                label_pt: 'Recebimento não bloqueante com default',
                code: `select {
case v := <-results:
	fmt.Println("got a result:", v)
default:
	// nothing ready — do something else instead of blocking
	fmt.Println("no result yet")
}`,
            },
            {
                label: 'The long-lived worker loop',
                label_pt: 'O loop de worker de longa duração',
                code: `func worker(ctx context.Context, jobs <-chan Job) {
	for {
		select {
		case <-ctx.Done():
			return // clean shutdown: context cancelled
		case job, ok := <-jobs:
			if !ok {
				return // clean shutdown: jobs channel closed
			}
			process(job)
		}
	}
}`,
            },
        ],
        watchOut: [
            'select {} with no cases blocks forever — occasionally used on purpose, usually a bug.',
            'A default case inside a hot for loop becomes a busy-wait that burns a CPU core. If you have nothing to do when nothing is ready, you usually don\'t want default.',
            'time.After allocates a new timer per call; in a tight loop prefer a reused time.Timer (or time.Ticker) to avoid churning timers.',
            'Receiving from a closed channel is always ready — pair receives with comma-ok in loops or a closed channel will spin your select at 100% CPU.',
        ],
        watchOut_pt: [
            'select {} sem nenhum case bloqueia para sempre — ocasionalmente usado de propósito, mas geralmente é um bug.',
            'Um case default dentro de um loop for muito ativo vira um busy-wait que consome um núcleo de CPU inteiro. Se você não tem nada a fazer quando nada está pronto, normalmente não quer default.',
            'time.After aloca um novo timer a cada chamada; em um loop apertado, prefira reutilizar um time.Timer (ou time.Ticker) para evitar criar timers em excesso.',
            'Receber de um channel fechado está sempre pronto — combine recebimentos com comma-ok em loops, ou um channel fechado fará seu select girar a 100% de CPU.',
        ],
    },

    {
        id: 'waitgroup',
        name: 'sync.WaitGroup',
        name_pt: 'sync.WaitGroup',
        category: 'Synchronization',
        complexity: 'Low',
        whenToUse: 'You need to wait for a known set of goroutines to finish before moving on',
        whenToUse_pt: 'Você precisa esperar um conjunto conhecido de goroutines terminar antes de continuar',
        summary:
            'A WaitGroup is a thread-safe counter for outstanding goroutines: Add increments it, Done decrements it, and Wait blocks until it reaches zero. It is the standard answer to "how does main know my goroutines finished?" when no values need to come back — fan out work, wait for all of it, continue. (When you also need results or error handling, reach for channels or golang.org/x/sync/errgroup.)',
        summary_pt:
            'Um WaitGroup é um contador thread-safe de goroutines pendentes: Add o incrementa, Done o decrementa, e Wait bloqueia até que chegue a zero. É a resposta padrão para "como o main sabe que minhas goroutines terminaram?" quando nenhum valor precisa voltar — distribua o trabalho (fan out), espere tudo terminar, continue. (Quando você também precisa de resultados ou tratamento de erros, recorra a channels ou ao golang.org/x/sync/errgroup.)',
        howItWorks: [
            'wg.Add(n) before starting goroutines, defer wg.Done() inside each one, wg.Wait() where you need everything finished.',
            'Add must happen before the goroutine starts (in the parent), otherwise Wait can observe the counter at zero before the goroutine registered itself.',
            'defer wg.Done() guarantees the decrement even if the work panics or returns early.',
            'Go 1.25 added wg.Go(f), which wraps Add(1) + go + defer Done() in one call and removes the classic footguns.',
            'A WaitGroup carries no data — combine it with channels when results need to flow back.',
        ],
        howItWorks_pt: [
            'wg.Add(n) antes de iniciar as goroutines, defer wg.Done() dentro de cada uma, wg.Wait() onde você precisa que tudo tenha terminado.',
            'Add precisa acontecer antes da goroutine iniciar (no chamador), caso contrário Wait pode observar o contador em zero antes de a goroutine se registrar.',
            'defer wg.Done() garante o decremento mesmo que o trabalho sofra panic ou retorne antecipadamente.',
            'O Go 1.25 adicionou wg.Go(f), que encapsula Add(1) + go + defer Done() em uma única chamada e elimina as armadilhas clássicas.',
            'Um WaitGroup não carrega dados — combine-o com channels quando resultados precisarem voltar.',
        ],
        samples: [
            {
                label: 'Classic Add / Done / Wait',
                label_pt: 'O clássico Add / Done / Wait',
                code: `func main() {
	var wg sync.WaitGroup

	for i := 1; i <= 3; i++ {
		wg.Add(1) // in the parent, before the goroutine starts
		go func(id int) {
			defer wg.Done() // runs even if work() panics
			work(id)
		}(i)
	}

	wg.Wait() // blocks until the counter is back to zero
	fmt.Println("all workers finished")
}`,
            },
            {
                label: 'Go 1.25+: wg.Go',
                label_pt: 'Go 1.25+: wg.Go',
                code: `func main() {
	var wg sync.WaitGroup

	for i := 1; i <= 3; i++ {
		wg.Go(func() { // Add(1) and Done() are handled for you
			work(i)
		})
	}

	wg.Wait()
}`,
            },
        ],
        watchOut: [
            'Calling Add inside the goroutine is a race against Wait — the program may continue before the work even starts.',
            'More Done calls than Adds panics ("negative WaitGroup counter"); a missing Done makes Wait hang forever.',
            'Pass WaitGroups by pointer (or capture them); copying a WaitGroup after use splits the counter and breaks it.',
            'A WaitGroup can\'t be cancelled or timed out — if a worker hangs, Wait hangs. Pair workers with a context for cancellation.',
            'Reusing a WaitGroup for a second wave is only safe after Wait has returned from the first.',
        ],
        watchOut_pt: [
            'Chamar Add dentro da goroutine é uma race contra Wait — o programa pode continuar antes mesmo do trabalho começar.',
            'Mais chamadas a Done do que a Add causa panic ("negative WaitGroup counter"); um Done faltando faz Wait travar para sempre.',
            'Passe WaitGroups por ponteiro (ou capture-os); copiar um WaitGroup depois de usado divide o contador e o quebra.',
            'Um WaitGroup não pode ser cancelado nem ter timeout — se um worker travar, Wait trava junto. Combine workers com um context para cancelamento.',
            'Reutilizar um WaitGroup para uma segunda leva só é seguro depois que Wait retornar da primeira.',
        ],
    },

    {
        id: 'mutex-vs-channels',
        name: 'Mutexes vs Channels',
        name_pt: 'Mutexes vs Channels',
        category: 'Synchronization',
        complexity: 'Medium',
        whenToUse: 'Several goroutines touch the same data — pick the right protection for the job',
        whenToUse_pt: 'Várias goroutines acessam os mesmos dados — escolha a proteção certa para o trabalho',
        summary:
            '"Don\'t communicate by sharing memory; share memory by communicating" is the slogan, but the practical rule is simpler: use channels to transfer ownership of data and to coordinate (pass results, signal completion, distribute work); use a sync.Mutex to protect shared state like caches and counters where no handoff is happening. A mutex guarding three lines of struct access is clearer and faster than a channel ceremony pretending to be one.',
        summary_pt:
            '"Não se comunique compartilhando memória; compartilhe memória se comunicando" é o slogan, mas a regra prática é mais simples: use channels para transferir a posse de dados e para coordenar (passar resultados, sinalizar conclusão, distribuir trabalho); use um sync.Mutex para proteger estado compartilhado como caches e contadores, onde não há entrega de posse acontecendo. Um mutex protegendo três linhas de acesso a uma struct é mais claro e mais rápido que uma cerimônia de channel fingindo ser um.',
        howItWorks: [
            'mu.Lock() / defer mu.Unlock() makes the lines in between a critical section — only one goroutine at a time can be inside.',
            'sync.RWMutex allows many concurrent readers (RLock) while writers (Lock) get exclusive access — worth it for read-heavy data.',
            'Keep the mutex next to the data it guards (same struct, unexported), and keep critical sections short — never hold a lock across I/O or channel operations.',
            'The channel alternative: one goroutine owns the state and others send it requests — no locks, no races, by construction.',
            'For a lone integer counter, sync/atomic (atomic.Int64) is cheaper than either.',
        ],
        howItWorks_pt: [
            'mu.Lock() / defer mu.Unlock() transforma as linhas entre eles em uma seção crítica — só uma goroutine por vez pode estar dentro.',
            'sync.RWMutex permite vários leitores concorrentes (RLock) enquanto escritores (Lock) obtêm acesso exclusivo — vale a pena para dados com muita leitura.',
            'Mantenha o mutex perto dos dados que ele protege (na mesma struct, não exportado), e mantenha seções críticas curtas — nunca segure um lock durante I/O ou operações de channel.',
            'A alternativa com channel: uma goroutine é dona do estado e as outras enviam requisições para ela — sem locks, sem races, por construção.',
            'Para um único contador inteiro, sync/atomic (atomic.Int64) é mais barato que qualquer um dos dois.',
        ],
        samples: [
            {
                label: 'Mutex-guarded state',
                label_pt: 'Estado protegido por mutex',
                code: `type Counter struct {
	mu sync.Mutex
	n  int
}

func (c *Counter) Inc() {
	c.mu.Lock()
	defer c.mu.Unlock()
	c.n++ // read-modify-write is atomic under the lock
}

func (c *Counter) Value() int {
	c.mu.Lock()
	defer c.mu.Unlock()
	return c.n
}`,
            },
            {
                label: 'Channel-owned state (monitor goroutine)',
                label_pt: 'Estado pertencente a um channel (goroutine monitora)',
                code: `// One goroutine owns the map; everyone else talks to it.
type query struct {
	key   string
	reply chan int
}

func startStore(updates <-chan [2]string, queries <-chan query) {
	store := map[string]int{}
	go func() {
		for {
			select {
			case u := <-updates:
				store[u[0]]++ // only this goroutine touches store
			case q := <-queries:
				q.reply <- store[q.key]
			}
		}
	}()
}`,
            },
        ],
        watchOut: [
            'A data race is undefined behavior in Go, not just "stale reads" — torn writes and corrupted maps included. go run -race is non-negotiable in CI.',
            'Copying a struct that contains a sync.Mutex copies the lock state — pass such structs by pointer (go vet catches this).',
            'Locks don\'t compose: calling another locking method while holding the lock is a classic self-deadlock; two locks taken in different orders across goroutines is the classic mutual one.',
            'Holding a mutex while sending on a channel couples the two worlds and is a common deadlock recipe — release first, then send.',
        ],
        watchOut_pt: [
            'Uma data race é comportamento indefinido em Go, não apenas "leituras desatualizadas" — inclui escritas corrompidas (torn writes) e maps corrompidos. go run -race é inegociável no CI.',
            'Copiar uma struct que contém um sync.Mutex copia o estado do lock — passe essas structs por ponteiro (go vet detecta isso).',
            'Locks não se compõem: chamar outro método que trava enquanto já segura o lock é o clássico self-deadlock; dois locks adquiridos em ordens diferentes por goroutines distintas é o clássico deadlock mútuo.',
            'Segurar um mutex enquanto envia em um channel acopla os dois mundos e é uma receita comum de deadlock — libere primeiro, depois envie.',
        ],
    },

    {
        id: 'worker-pools',
        name: 'Worker Pools',
        name_pt: 'Worker Pools',
        category: 'Patterns',
        complexity: 'Medium',
        whenToUse: 'Many independent tasks, and you want a fixed number of goroutines chewing through them',
        whenToUse_pt: 'Muitas tarefas independentes, e você quer um número fixo de goroutines processando-as',
        summary:
            'A worker pool is N goroutines all ranging over one jobs channel and sending onto one results channel. Because multiple receivers on a channel each get distinct values, the channel itself is the work distributor — no coordinator needed. The pool bounds concurrency (N workers, no matter how many jobs), which protects memory, databases and APIs from unbounded fan-out.',
        summary_pt:
            'Um worker pool é N goroutines todas iterando (range) sobre um único channel jobs e enviando para um único channel results. Como vários receptores em um channel recebem cada um valores distintos, o próprio channel é o distribuidor de trabalho — nenhum coordenador é necessário. O pool limita a concorrência (N workers, não importa quantos jobs existam), o que protege memória, bancos de dados e APIs de um fan-out sem limites.',
        howItWorks: [
            'Start N workers; each does for job := range jobs { results <- process(job) }.',
            'Each value sent on jobs is received by exactly one worker — a channel with many receivers load-balances for free.',
            'When the producer is done it calls close(jobs); every worker\'s range loop ends and the workers return.',
            'To know when all results are in: count them (if the total is known) or use a WaitGroup over the workers and close(results) when they\'re all done.',
            'Pick N from the bottleneck: ~GOMAXPROCS for CPU-bound work, higher for I/O-bound work, or whatever the downstream service can tolerate.',
        ],
        howItWorks_pt: [
            'Inicie N workers; cada um faz for job := range jobs { results <- process(job) }.',
            'Cada valor enviado em jobs é recebido por exatamente um worker — um channel com vários receptores faz balanceamento de carga de graça.',
            'Quando o produtor termina, ele chama close(jobs); o loop range de cada worker termina e os workers retornam.',
            'Para saber quando todos os resultados chegaram: conte-os (se o total for conhecido) ou use um WaitGroup sobre os workers e feche results quando todos terminarem.',
            'Escolha N a partir do gargalo: ~GOMAXPROCS para trabalho limitado por CPU, mais alto para trabalho limitado por I/O, ou o que o serviço downstream conseguir tolerar.',
        ],
        samples: [
            {
                label: 'A complete worker pool',
                label_pt: 'Um worker pool completo',
                code: `func worker(id int, jobs <-chan int, results chan<- int) {
	for j := range jobs { // each job goes to exactly one worker
		results <- j * 2 // pretend this is expensive
	}
}

func main() {
	jobs := make(chan int, 5)
	results := make(chan int, 5)

	for w := 1; w <= 3; w++ {
		go worker(w, jobs, results)
	}

	for j := 1; j <= 5; j++ {
		jobs <- j
	}
	close(jobs) // ends every worker's range loop

	for i := 0; i < 5; i++ { // we know the count, so just collect 5
		fmt.Println(<-results)
	}
}`,
            },
            {
                label: 'Closing results when the count is unknown',
                label_pt: 'Fechando results quando a contagem é desconhecida',
                code: `jobs := make(chan Job)
results := make(chan Result)

var wg sync.WaitGroup
for w := 0; w < 3; w++ {
	wg.Add(1)
	go func() {
		defer wg.Done()
		for j := range jobs {
			results <- process(j)
		}
	}()
}

go func() {
	wg.Wait()      // all workers done…
	close(results) // …so no one else will send
}()

for r := range results { // safe: ends when results is closed
	handle(r)
}`,
            },
        ],
        watchOut: [
            'Forgetting close(jobs) leaves all workers blocked in range forever — a leak of exactly N goroutines.',
            'Closing results from the producer (instead of after wg.Wait()) panics as soon as a worker sends on the closed channel.',
            'If nobody drains results while you\'re still queueing jobs, an unbuffered results channel stalls the whole pool — drain concurrently or buffer adequately.',
            'For pools that must stop early and report errors, golang.org/x/sync/errgroup (with SetLimit) packages this pattern with context cancellation built in.',
        ],
        watchOut_pt: [
            'Esquecer close(jobs) deixa todos os workers bloqueados em range para sempre — um vazamento de exatamente N goroutines.',
            'Fechar results a partir do produtor (em vez de depois de wg.Wait()) causa panic assim que um worker enviar no channel já fechado.',
            'Se ninguém estiver drenando results enquanto você ainda está enfileirando jobs, um channel results sem buffer trava o pool inteiro — drene concorrentemente ou use buffer adequado.',
            'Para pools que precisam parar antecipadamente e reportar erros, o golang.org/x/sync/errgroup (com SetLimit) já encapsula esse padrão com cancelamento via context embutido.',
        ],
    },

    {
        id: 'fan-out-fan-in',
        name: 'Fan-out / Fan-in',
        name_pt: 'Fan-out / Fan-in',
        category: 'Patterns',
        complexity: 'High',
        whenToUse: 'Parallelize a stage across goroutines, then merge their outputs back into one stream',
        whenToUse_pt: 'Paralelizar um estágio entre goroutines e depois unir as saídas de volta em um único fluxo',
        summary:
            'Fan-out is multiple goroutines reading from the same channel to parallelize work; fan-in (merge) is one goroutine-per-source forwarding several channels into a single output channel. Together they let you widen a slow stage of a pipeline and then collapse the results back into one stream. The only subtle part is closing the merged channel: it must close exactly once, after every source is drained — which is a WaitGroup\'s job.',
        summary_pt:
            'Fan-out é ter várias goroutines lendo do mesmo channel para paralelizar o trabalho; fan-in (merge) é uma goroutine por fonte encaminhando vários channels para um único channel de saída. Juntos, eles permitem "alargar" um estágio lento de um pipeline e depois colapsar os resultados de volta em um único fluxo. A única parte sutil é fechar o channel resultante da junção: ele precisa fechar exatamente uma vez, depois que toda fonte for drenada — e isso é trabalho de um WaitGroup.',
        howItWorks: [
            'Fan-out needs no code at all: start several goroutines receiving from the same channel and the values distribute themselves.',
            'Fan-in: for each input channel, start a forwarder goroutine that copies values to the shared out channel.',
            'A WaitGroup counts the forwarders; a final goroutine does wg.Wait() then close(out) — exactly one close, only after all inputs are done.',
            'The consumer just ranges over out, blind to how many sources fed it.',
        ],
        howItWorks_pt: [
            'Fan-out não precisa de nenhum código especial: inicie várias goroutines recebendo do mesmo channel e os valores se distribuem sozinhos.',
            'Fan-in: para cada channel de entrada, inicie uma goroutine "encaminhadora" que copia os valores para o channel out compartilhado.',
            'Um WaitGroup conta os encaminhadores; uma goroutine final faz wg.Wait() e depois close(out) — exatamente um close, apenas depois que todas as entradas terminarem.',
            'O consumidor apenas itera (range) sobre out, sem saber quantas fontes o alimentaram.',
        ],
        samples: [
            {
                label: 'merge: N channels in, one channel out',
                label_pt: 'merge: N channels de entrada, um channel de saída',
                code: `func merge(chs ...<-chan int) <-chan int {
	out := make(chan int)
	var wg sync.WaitGroup

	for _, ch := range chs {
		wg.Add(1)
		go func(ch <-chan int) { // one forwarder per source
			defer wg.Done()
			for v := range ch {
				out <- v
			}
		}(ch)
	}

	go func() {
		wg.Wait()  // every source drained…
		close(out) // …so out can close exactly once
	}()
	return out
}`,
            },
            {
                label: 'Fan out a slow stage, fan the results back in',
                label_pt: 'Distribuir um estágio lento, e juntar os resultados de volta',
                code: `nums := generate(1, 2, 3, 4, 5, 6) // <-chan int

// Fan-out: three goroutines share the same input channel.
c1 := square(nums)
c2 := square(nums)
c3 := square(nums)

// Fan-in: merge the three result streams into one.
for v := range merge(c1, c2, c3) {
	fmt.Println(v) // order is not preserved!
}`,
            },
        ],
        watchOut: [
            'Output order is not input order — values arrive as workers finish. If order matters, tag values with an index and reorder at the end.',
            'Closing out from anywhere except the wg.Wait() goroutine either panics (double close) or truncates the stream.',
            'If the consumer stops reading early, every forwarder blocks on out <- v forever — for cancellable pipelines each send needs a select with a done/ctx case.',
            'Fan-out across a stage with state (e.g. dedup) silently shards that state — make stages stateless or merge state afterwards.',
        ],
        watchOut_pt: [
            'A ordem de saída não é a ordem de entrada — os valores chegam conforme os workers terminam. Se a ordem importa, marque os valores com um índice e reordene no final.',
            'Fechar out de qualquer lugar que não seja a goroutine do wg.Wait() causa panic (close duplo) ou trunca o fluxo.',
            'Se o consumidor parar de ler cedo demais, todo encaminhador fica bloqueado em out <- v para sempre — para pipelines canceláveis, cada envio precisa de um select com um case done/ctx.',
            'Fan-out em um estágio com estado (por exemplo, deduplicação) particiona esse estado silenciosamente — torne os estágios stateless ou mescle o estado depois.',
        ],
    },

    {
        id: 'pipelines',
        name: 'Pipelines',
        name_pt: 'Pipelines',
        category: 'Patterns',
        complexity: 'Medium',
        whenToUse: 'Data flows through a series of transformations and you want the stages to run concurrently',
        whenToUse_pt: 'Dados fluem por uma série de transformações e você quer que os estágios rodem concorrentemente',
        summary:
            'A pipeline chains goroutine stages with channels: each stage receives from upstream, does one thing, and sends downstream. Every stage runs concurrently, so the pipeline naturally overlaps work like an assembly line, and backpressure is built in — a slow stage simply makes upstream sends wait. The idiomatic shape is a function per stage that takes a <-chan, returns a fresh <-chan, and closes its output when its input runs dry.',
        summary_pt:
            'Um pipeline encadeia estágios em goroutines com channels: cada estágio recebe de quem está antes (upstream), faz uma coisa, e envia para quem está depois (downstream). Todo estágio roda concorrentemente, então o pipeline naturalmente sobrepõe o trabalho como uma linha de montagem, e o backpressure já vem embutido — um estágio lento simplesmente faz os envios upstream esperarem. A forma idiomática é uma função por estágio que recebe um <-chan, retorna um novo <-chan, e fecha sua saída quando sua entrada se esgota.',
        howItWorks: [
            'Stage shape: func stage(in <-chan T) <-chan U — start an internal goroutine, return its output channel immediately.',
            'Inside: for v := range in { out <- f(v) } with defer close(out) — closing cascades down the pipeline so everything shuts down when the source ends.',
            'Composition is just nesting: consume(square(generate(...))).',
            'Throughput is set by the slowest stage; fan that stage out across workers and merge it back if it becomes the bottleneck.',
        ],
        howItWorks_pt: [
            'Formato de um estágio: func stage(in <-chan T) <-chan U — inicie uma goroutine interna, retorne seu channel de saída imediatamente.',
            'Por dentro: for v := range in { out <- f(v) } com defer close(out) — o fechamento se propaga pelo pipeline, então tudo desliga quando a fonte termina.',
            'Composição é apenas aninhamento: consume(square(generate(...))).',
            'A vazão (throughput) é definida pelo estágio mais lento; faça fan-out desse estágio entre workers e una os resultados de volta se ele virar o gargalo.',
        ],
        samples: [
            {
                label: 'generate → square → print',
                label_pt: 'generate → square → print',
                code: `func generate(nums ...int) <-chan int {
	out := make(chan int)
	go func() {
		defer close(out) // signals downstream "no more values"
		for _, n := range nums {
			out <- n
		}
	}()
	return out
}

func square(in <-chan int) <-chan int {
	out := make(chan int)
	go func() {
		defer close(out) // cascade the shutdown
		for n := range in {
			out <- n * n
		}
	}()
	return out
}

func main() {
	for v := range square(generate(2, 3, 4)) {
		fmt.Println(v) // 4, 9, 16
	}
}`,
            },
            {
                label: 'A cancellable stage',
                label_pt: 'Um estágio cancelável',
                code: `func square(ctx context.Context, in <-chan int) <-chan int {
	out := make(chan int)
	go func() {
		defer close(out)
		for n := range in {
			select {
			case out <- n * n:
			case <-ctx.Done():
				return // consumer gave up — don't block forever
			}
		}
	}()
	return out
}`,
            },
        ],
        watchOut: [
            'If a consumer stops reading mid-stream, upstream stages block on their sends forever — real pipelines thread a context (or done channel) through every send.',
            'Forgetting defer close(out) in any stage leaves every stage after it hanging in range.',
            'Each stage adds channel-handoff overhead; pipelines pay off for I/O or CPU-heavy stages, not for chaining three cheap arithmetic ops.',
            'Keep stages single-purpose — a stage that filters and transforms and batches is just a hard-to-test function with extra steps.',
        ],
        watchOut_pt: [
            'Se um consumidor parar de ler no meio do fluxo, os estágios upstream ficam bloqueados em seus envios para sempre — pipelines de verdade propagam um context (ou channel done) por todo envio.',
            'Esquecer defer close(out) em qualquer estágio deixa todo estágio seguinte travado em range.',
            'Cada estágio adiciona overhead de troca via channel; pipelines compensam para estágios pesados de I/O ou CPU, não para encadear três operações aritméticas baratas.',
            'Mantenha os estágios com propósito único — um estágio que filtra, transforma e agrupa é apenas uma função difícil de testar com passos extras.',
        ],
    },

    {
        id: 'context-cancellation',
        name: 'Context Cancellation',
        name_pt: 'Cancelamento com Context',
        category: 'Patterns',
        complexity: 'Medium',
        whenToUse: 'Goroutines must stop when a request ends, a timeout fires, or the app shuts down',
        whenToUse_pt: 'Goroutines precisam parar quando uma requisição termina, um timeout dispara, ou a aplicação encerra',
        summary:
            'context.Context is Go\'s standard cancellation signal. ctx.Done() returns a channel that closes when the context is cancelled — by an explicit cancel(), a timeout or a deadline — and because closing a channel wakes every receiver, one cancellation tears down an entire tree of goroutines at once. Any goroutine that can outlive its caller should take a ctx and watch Done() in its select loops; it\'s how servers avoid leaking a goroutine per abandoned request.',
        summary_pt:
            'context.Context é o sinal padrão de cancelamento do Go. ctx.Done() retorna um channel que é fechado quando o context é cancelado — por um cancel() explícito, um timeout ou um deadline — e como fechar um channel acorda todos os receptores, um único cancelamento derruba toda uma árvore de goroutines de uma vez. Qualquer goroutine que possa sobreviver ao seu chamador deveria receber um ctx e observar Done() em seus loops select; é assim que servidores evitam vazar uma goroutine por requisição abandonada.',
        howItWorks: [
            'context.WithCancel(parent) returns a derived ctx and a cancel func; WithTimeout / WithDeadline cancel automatically after a duration or at a time.',
            'ctx.Done() is a receive-only channel that closes on cancellation — built to sit in a select next to your real work.',
            'Cancellation flows down the tree: cancelling a parent cancels every context derived from it; ctx.Err() says why (Canceled vs DeadlineExceeded).',
            'Pass ctx explicitly as the first parameter (func f(ctx context.Context, …)) — never store it in a struct field.',
            'Always defer cancel() even for timeouts — it releases the context\'s timer and bookkeeping promptly.',
        ],
        howItWorks_pt: [
            'context.WithCancel(parent) retorna um ctx derivado e uma função cancel; WithTimeout / WithDeadline cancelam automaticamente após uma duração ou em um horário determinado.',
            'ctx.Done() é um channel apenas-recebimento que fecha no cancelamento — feito para ficar em um select ao lado do seu trabalho real.',
            'O cancelamento flui pela árvore: cancelar um pai cancela todo context derivado dele; ctx.Err() diz o motivo (Canceled vs DeadlineExceeded).',
            'Passe ctx explicitamente como primeiro parâmetro (func f(ctx context.Context, …)) — nunca o guarde em um campo de struct.',
            'Sempre use defer cancel(), mesmo para timeouts — isso libera prontamente o timer e a contabilidade interna do context.',
        ],
        samples: [
            {
                label: 'A worker that stops when cancelled',
                label_pt: 'Um worker que para quando cancelado',
                code: `func worker(ctx context.Context, id int, jobs <-chan Job) {
	for {
		select {
		case <-ctx.Done():
			fmt.Printf("worker %d: stopping: %v\\n", id, ctx.Err())
			return
		case job, ok := <-jobs:
			if !ok {
				return
			}
			process(job)
		}
	}
}

func main() {
	ctx, cancel := context.WithTimeout(context.Background(), 2*time.Second)
	defer cancel() // always — releases the timer

	jobs := make(chan Job)
	for i := 1; i <= 3; i++ {
		go worker(ctx, i, jobs)
	}
	serve(ctx, jobs) // after 2s, every worker sees Done() and returns
}`,
            },
            {
                label: 'Making a blocking call cancellable',
                label_pt: 'Tornando uma chamada bloqueante cancelável',
                code: `func fetchWithContext(ctx context.Context, url string) (Result, error) {
	resCh := make(chan Result, 1) // buffered: the send below never leaks

	go func() {
		resCh <- slowFetch(url)
	}()

	select {
	case res := <-resCh:
		return res, nil
	case <-ctx.Done():
		return Result{}, ctx.Err() // caller cancelled or timed out
	}
}`,
            },
        ],
        watchOut: [
            'A context can\'t kill a goroutine — the goroutine must check Done() itself. Code that never selects on ctx is uncancellable no matter what you pass it.',
            'Forgetting defer cancel() leaks the context\'s resources until the parent is cancelled (go vet\'s lostcancel check finds this).',
            'When abandoning a goroutine on timeout, give its result channel a buffer of 1 so its final send completes instead of leaking the goroutine.',
            'Use context for cancellation and deadlines, not as a grab-bag parameter — context.Value is for request-scoped metadata (trace IDs), not function arguments.',
        ],
        watchOut_pt: [
            'Um context não consegue matar uma goroutine — a goroutine precisa checar Done() por conta própria. Código que nunca faz select em ctx é incancelável, não importa o que você passe a ele.',
            'Esquecer defer cancel() vaza os recursos do context até que o pai seja cancelado (a checagem lostcancel do go vet detecta isso).',
            'Ao abandonar uma goroutine por timeout, dê ao seu channel de resultado um buffer de 1 para que o envio final se complete em vez de vazar a goroutine.',
            'Use context para cancelamento e deadlines, não como um parâmetro "pega-tudo" — context.Value é para metadados do escopo da requisição (trace IDs), não para argumentos de função.',
        ],
    },

    {
        id: 'deadlocks-and-leaks',
        name: 'Deadlocks & Goroutine Leaks',
        name_pt: 'Deadlocks e Vazamentos de Goroutine',
        category: 'Pitfalls',
        complexity: 'High',
        whenToUse: 'Know the failure modes before you debug one at 3am',
        whenToUse_pt: 'Conheça os modos de falha antes de precisar depurar um às 3 da manhã',
        summary:
            'The two classic concurrency failures in Go are deadlocks — every goroutine blocked, which the runtime detects and turns into a panic — and goroutine leaks, where some goroutine blocks forever while the rest of the program moves on. Leaks are the sneakier of the two: nothing crashes, memory just creeps up as abandoned goroutines pile up. Almost all of both come from a channel operation whose partner never shows up.',
        summary_pt:
            'As duas falhas clássicas de concorrência em Go são deadlocks — todas as goroutines bloqueadas, o que o runtime detecta e transforma em panic — e vazamentos de goroutine, onde alguma goroutine bloqueia para sempre enquanto o resto do programa segue em frente. Vazamentos são os mais traiçoeiros dos dois: nada quebra, a memória simplesmente vai subindo conforme goroutines abandonadas se acumulam. Quase todos os casos de ambos vêm de uma operação de channel cujo parceiro nunca aparece.',
        howItWorks: [
            'Deadlock: when every goroutine is blocked, the runtime panics with "fatal error: all goroutines are asleep - deadlock!" and dumps every goroutine\'s stack — read the dump, it names the exact line each goroutine is stuck on.',
            'The detector only fires when ALL goroutines are asleep. One stuck goroutine in a busy server is invisible to it — that\'s a leak, not a deadlock.',
            'Leak recipe #1: send on an unbuffered channel whose receiver gave up (timeout, early return).',
            'Leak recipe #2: range over a channel nobody ever closes.',
            'Diagnosis: runtime.NumGoroutine() for a quick count, pprof\'s goroutine profile (or net/http/pprof) for stacks, and goleak in tests to fail on leftovers.',
        ],
        howItWorks_pt: [
            'Deadlock: quando todas as goroutines estão bloqueadas, o runtime causa panic com "fatal error: all goroutines are asleep - deadlock!" e despeja a stack de cada goroutine — leia o dump, ele indica exatamente em qual linha cada goroutine está travada.',
            'O detector só dispara quando TODAS as goroutines estão dormindo. Uma única goroutine travada em um servidor ocupado é invisível para ele — isso é um vazamento, não um deadlock.',
            'Receita de vazamento nº 1: enviar em um channel sem buffer cujo receptor desistiu (timeout, retorno antecipado).',
            'Receita de vazamento nº 2: fazer range sobre um channel que ninguém nunca fecha.',
            'Diagnóstico: runtime.NumGoroutine() para uma contagem rápida, o goroutine profile do pprof (ou net/http/pprof) para ver as stacks, e goleak nos testes para falhar quando sobrar alguma.',
        ],
        samples: [
            {
                label: 'The simplest deadlock',
                label_pt: 'O deadlock mais simples',
                code: `func main() {
	ch := make(chan int)
	ch <- 1 // blocks forever: no other goroutine exists to receive
	// fatal error: all goroutines are asleep - deadlock!
}

// Fixes, depending on intent:
//   go func() { ch <- 1 }()   // send from another goroutine
//   ch := make(chan int, 1)   // or give it a buffer`,
            },
            {
                label: 'A goroutine leak — and the one-byte fix',
                label_pt: 'Um vazamento de goroutine — e a correção de um caractere',
                code: `func lookup(host string) (Addr, error) {
	ch := make(chan Addr) // unbuffered: this is the bug

	go func() {
		ch <- slowDNS(host) // blocks forever if the caller timed out
	}()

	select {
	case addr := <-ch:
		return addr, nil
	case <-time.After(time.Second):
		return Addr{}, ErrTimeout // goroutine above is now stuck — leaked
	}
}

// Fix: make(chan Addr, 1). The send always completes, the goroutine
// exits, and the unread value is collected with the channel.`,
            },
        ],
        watchOut: [
            'Every go statement should come with an answer to "how does this goroutine end?" If you can\'t say, you\'ve probably written a leak.',
            'Buffered channels don\'t prevent deadlocks, they postpone them — the buffer fills and you\'re back where you started.',
            'Locks deadlock too: two mutexes acquired in opposite orders by two goroutines is the textbook case, and the runtime detector won\'t save you if other goroutines are still running.',
            'Watch goroutine counts in production metrics; a sawtooth that only goes up is a leak announcing itself.',
            'go test -race finds races, not deadlocks or leaks — use goleak (uber-go/goleak) in tests and pprof in production for those.',
        ],
        watchOut_pt: [
            'Toda instrução go deveria vir com uma resposta para "como essa goroutine termina?" Se você não consegue responder, provavelmente escreveu um vazamento.',
            'Channels com buffer não previnem deadlocks, apenas os adiam — o buffer enche e você volta para onde começou.',
            'Locks também causam deadlock: dois mutexes adquiridos em ordens opostas por duas goroutines é o caso clássico de livro-texto, e o detector do runtime não vai te salvar se outras goroutines ainda estiverem rodando.',
            'Acompanhe a contagem de goroutines em métricas de produção; um dente de serra que só sobe é um vazamento se anunciando.',
            'go test -race encontra races, não deadlocks ou vazamentos — use goleak (uber-go/goleak) nos testes e pprof em produção para esses casos.',
        ],
    },
];
