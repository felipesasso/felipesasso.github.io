/**
 * Decision tree for the Design Pattern wizard.
 *
 * Each node is either a question (with `options` that lead to another node
 * via `next`, or straight to a pattern via `result`) or implicitly a leaf
 * once an option carries a `result`.
 */
const DPDT_TREE = {
    start: {
        question: 'What are you primarily trying to do?',
        options: [
            { label: 'Create objects in a flexible, decoupled way', next: 'creational' },
            { label: 'Compose classes or objects into larger structures', next: 'structural' },
            { label: 'Manage how objects communicate and share responsibilities', next: 'behavioral' },
        ],
    },

    // ── Creational ──────────────────────────────────────────────────────────
    creational: {
        question: "Should there only ever be a single instance of this object, shared across the whole app?",
        options: [
            { label: 'Yes — exactly one instance, accessed from everywhere', result: 'singleton' },
            { label: 'No — there can be many instances', next: 'creational2' },
        ],
    },
    creational2: {
        question: 'Is constructing this object complex — many optional parts or steps — and would you like to assemble it incrementally?',
        options: [
            { label: 'Yes, I want to build it step by step', result: 'builder' },
            { label: 'No, construction is fairly straightforward', next: 'creational3' },
        ],
    },
    creational3: {
        question: 'Do you need to create whole families of related objects that must be used together — and swapped as a set?',
        options: [
            { label: 'Yes — families of related products', result: 'abstract-factory' },
            { label: 'No — just individual objects, one at a time', next: 'creational4' },
        ],
    },
    creational4: {
        question: 'Do you want to define how an object gets created, but let subclasses decide exactly which class to instantiate?',
        options: [
            { label: 'Yes — delegate the choice of class to subclasses', result: 'factory-method' },
            { label: "No — I'd rather create new objects by copying existing, pre-configured ones", result: 'prototype' },
        ],
    },

    // ── Structural ──────────────────────────────────────────────────────────
    structural: {
        question: 'Are you trying to make two incompatible interfaces work together?',
        options: [
            { label: "Yes — bridging an existing or third-party interface to one my code expects", result: 'adapter' },
            { label: "No, that's not really the issue", next: 'structural2' },
        ],
    },
    structural2: {
        question: 'Do you want to attach new behavior to individual objects at runtime, without subclassing every combination?',
        options: [
            { label: 'Yes — layer responsibilities on dynamically', result: 'decorator' },
            { label: 'No', next: 'structural3' },
        ],
    },
    structural3: {
        question: 'Do you want to hide a complex subsystem behind one simple, friendly entry point?',
        options: [
            { label: 'Yes — give clients a simplified interface', result: 'facade' },
            { label: 'No', next: 'structural4' },
        ],
    },
    structural4: {
        question: 'Do you need to treat individual objects and whole groups (or trees) of them in exactly the same way?',
        options: [
            { label: 'Yes — part-whole hierarchies, like folders and files', result: 'composite' },
            { label: 'No', next: 'structural5' },
        ],
    },
    structural5: {
        question: 'Do you need a stand-in for another object — to control access, defer loading, cache results, or add logging around it?',
        options: [
            { label: 'Yes — a controlled placeholder for the real thing', result: 'proxy' },
            { label: 'No', next: 'structural6' },
        ],
    },
    structural6: {
        question: 'Do you want an abstraction and its implementation to evolve independently, instead of being locked together in one class hierarchy?',
        options: [
            { label: 'Yes — decouple the abstraction from its implementation', result: 'bridge' },
            { label: "No — but I do have huge numbers of similar objects and memory is a real concern", result: 'flyweight' },
        ],
    },

    // ── Behavioral ──────────────────────────────────────────────────────────
    behavioral: {
        question: 'Which of these feels closest to your situation?',
        options: [
            { label: 'Several objects need to coordinate or react to one another', next: 'behavioral-coord' },
            { label: 'I want to encapsulate an action, algorithm, or process as a thing in itself', next: 'behavioral-action' },
            { label: "I'm working with an object's internal state, a collection, or a structure to traverse", next: 'behavioral-state' },
        ],
    },

    'behavioral-coord': {
        question: "Do many objects need to be notified automatically whenever one object's state changes?",
        options: [
            { label: 'Yes — one-to-many, automatic updates', result: 'observer' },
            { label: 'No', next: 'behavioral-coord2' },
        ],
    },
    'behavioral-coord2': {
        question: 'Do your objects talk to each other in a tangled, many-to-many way that you wish you could route through one central coordinator?',
        options: [
            { label: 'Yes — centralize the communication through a mediator', result: 'mediator' },
            { label: 'No — I want to pass a request along a chain of handlers until one of them deals with it', result: 'chain-of-responsibility' },
        ],
    },

    'behavioral-action': {
        question: "Do you want to make an algorithm's implementation swappable at runtime, without a wall of conditionals?",
        options: [
            { label: 'Yes — interchangeable algorithms or strategies', result: 'strategy' },
            { label: 'No', next: 'behavioral-action2' },
        ],
    },
    'behavioral-action2': {
        question: 'Do you want to turn a request or action into a standalone object — so it can be queued, logged, scheduled, or undone?',
        options: [
            { label: 'Yes — encapsulate the action itself as an object', result: 'command' },
            { label: 'No — I have a fixed algorithm skeleton whose individual steps should be customizable by subclasses', result: 'template-method' },
        ],
    },

    'behavioral-state': {
        question: 'Should this object change its behavior depending on its own internal state — almost as if it changed class?',
        options: [
            { label: 'Yes — state-dependent behavior', result: 'state' },
            { label: 'No', next: 'behavioral-state2' },
        ],
    },
    'behavioral-state2': {
        question: "Do you need a uniform way to step through a collection's elements without exposing how it's stored internally?",
        options: [
            { label: 'Yes — sequential traversal behind a common interface', result: 'iterator' },
            { label: 'No', next: 'behavioral-state3' },
        ],
    },
    'behavioral-state3': {
        question: "Do you need to capture an object's internal state now so you can restore it later — without breaking its encapsulation?",
        options: [
            { label: 'Yes — snapshots for undo or rollback', result: 'memento' },
            { label: 'No', next: 'behavioral-state4' },
        ],
    },
    'behavioral-state4': {
        question: 'Do you need to add new operations across a stable set of related classes, without modifying those classes themselves?',
        options: [
            { label: 'Yes — define external operations over a fixed structure', result: 'visitor' },
            { label: "No — I'm modelling and evaluating sentences in a small language or set of rules", result: 'interpreter' },
        ],
    },
};

/**
 * Reference info for each Gang of Four pattern the tree can land on.
 */
const DPDT_PATTERNS = {
    singleton: {
        name: 'Singleton',
        category: 'Creational',
        summary: 'Ensures a class has only one instance, and provides a single, well-known point of access to it.',
        when: [
            'You need exactly one shared instance — a config store, connection pool, logger, or cache.',
            'Multiple, unrelated parts of the app must coordinate through the very same shared state.',
        ],
        example: 'An application-wide configuration object that loads settings once on startup and is reused everywhere, instead of every module re-reading the config file from disk.',
        watch: "It's easy to overuse — singletons can hide dependencies and make unit testing harder. Often, passing a single shared instance via dependency injection gets you the same benefit with far less coupling.",
    },
    builder: {
        name: 'Builder',
        category: 'Creational',
        summary: 'Separates the construction of a complex object from its final representation, so the same step-by-step process can produce different results.',
        when: [
            'The object has many optional parameters or parts, and constructor overloads are getting out of hand.',
            'You want a fluent, readable way to assemble something piece by piece, then produce an immutable result.',
        ],
        example: "Constructing an HTTP request through chained calls — `request.setHeader(...).setQuery(...).setTimeout(...).build()` — instead of one constructor with a dozen optional arguments.",
        watch: "Adds a layer of indirection (and an extra class) — for objects with one or two simple fields, a plain constructor or factory function is usually enough.",
    },
    'abstract-factory': {
        name: 'Abstract Factory',
        category: 'Creational',
        summary: 'Provides an interface for creating families of related objects without specifying their concrete classes.',
        when: [
            'Your system needs to stay independent from how its products are created and composed.',
            'Products from the same family must be used together, and you want to be able to swap the whole family at once.',
        ],
        example: 'A UI toolkit that produces matching buttons, checkboxes, and menus for a "light" theme or a "dark" theme — swap the factory, and every widget changes consistently.',
        watch: 'Adding a new kind of product means touching every concrete factory — the family of interfaces can become rigid if the product set keeps growing.',
    },
    'factory-method': {
        name: 'Factory Method',
        category: 'Creational',
        summary: 'Defines an interface for creating an object, but lets subclasses decide which concrete class to instantiate.',
        when: [
            "A class can't anticipate the exact type of objects it needs to create ahead of time.",
            'You want to localize and centralize the "which class do I instantiate?" decision in one overridable place.',
        ],
        example: 'A `DocumentCreator` base class exposes `createDocument()`; `PDFCreator` and `SpreadsheetCreator` subclasses override it to produce the right kind of document.',
        watch: 'Introduces a parallel hierarchy of creators alongside your products — for a single, simple type, a plain factory function is often lighter-weight.',
    },
    prototype: {
        name: 'Prototype',
        category: 'Creational',
        summary: 'Specifies the kinds of objects to create using a prototypical instance, and creates new objects by cloning that prototype.',
        when: [
            'Creating an object from scratch is expensive, but you already have a similar, fully-configured one to copy.',
            'The exact classes to instantiate are only known at runtime, and copying is simpler than re-building.',
        ],
        example: 'Cloning a fully-configured "template" enemy character to spawn dozens of similar foes in a game level, tweaking only what differs.',
        watch: 'Cloning objects with circular references or deeply nested structures can get tricky — you need to be deliberate about deep vs. shallow copies.',
    },
    adapter: {
        name: 'Adapter',
        category: 'Structural',
        summary: 'Converts the interface of one class into another interface that clients expect, letting otherwise-incompatible classes work together.',
        when: [
            "You're integrating a third-party or legacy class whose interface doesn't match what the rest of your code expects.",
            'You want to reuse an existing class without modifying its source.',
        ],
        example: 'Wrapping an old XML-based payment library behind a small adapter class that exposes the clean, JSON-friendly interface the rest of your app expects.',
        watch: "It's a translation layer, not a redesign — if you find yourself adapting the same thing in many places, it may be worth introducing a proper internal abstraction instead.",
    },
    decorator: {
        name: 'Decorator',
        category: 'Structural',
        summary: 'Attaches additional responsibilities to an object dynamically — a flexible alternative to subclassing for extending behavior.',
        when: [
            'You want to add or combine behaviors on individual objects, without affecting every instance of the class.',
            'Subclassing every combination of features would explode into far too many classes.',
        ],
        example: 'Wrapping a base `Coffee` object with `MilkDecorator`, `SugarDecorator`, and `WhipDecorator` to compose an order — each layer adds its own cost and description.',
        watch: 'Stacking many small decorators can make the resulting object graph harder to read and debug — keep each layer focused and well-named.',
    },
    facade: {
        name: 'Facade',
        category: 'Structural',
        summary: 'Provides a single, simplified interface to a larger and more complex set of interfaces in a subsystem.',
        when: [
            'A subsystem is complex, and most callers only ever need a handful of common operations from it.',
            'You want to decouple client code from the subsystem internals, so the internals can change freely.',
        ],
        example: 'A `VideoConverter.convert(file, format)` method that quietly handles codec selection, buffering, and encoding — so callers never touch those details directly.',
        watch: "A facade shouldn't become a god object — it's meant to simplify common cases, not to wrap every possible operation the subsystem offers.",
    },
    composite: {
        name: 'Composite',
        category: 'Structural',
        summary: 'Composes objects into tree structures to represent part-whole hierarchies, so clients can treat individual objects and groups uniformly.',
        when: [
            "You're modelling a recursive, tree-like structure — folders and files, UI components, organization charts.",
            'You want client code to treat a single leaf and an entire branch through the very same interface.',
        ],
        example: 'A file-system model where both `File` and `Folder` implement `getSize()` — folders simply sum the sizes of whatever they contain, leaves or other folders.',
        watch: 'Making the shared interface too generic can leak operations onto leaves that make no sense for them (e.g. `addChild()` on a `File`).',
    },
    proxy: {
        name: 'Proxy',
        category: 'Structural',
        summary: 'Provides a surrogate or placeholder for another object, to control access to it.',
        when: [
            'You need lazy initialization, access control, caching, logging, or remote access — without changing the real object.',
            'You want to add a layer of indirection that is transparent to the client, which keeps using the same interface.',
        ],
        example: 'An `ImageProxy` that defers loading a large image from disk until the moment it actually needs to be displayed on screen.',
        watch: "It looks a lot like Decorator and Adapter on the surface — the distinguishing factor is intent: Proxy controls access to the *same* interface, rather than adding behavior or translating it.",
    },
    bridge: {
        name: 'Bridge',
        category: 'Structural',
        summary: 'Decouples an abstraction from its implementation, so the two can vary and evolve independently.',
        when: [
            'Both the "what" and the "how" have multiple variants, and a single inheritance hierarchy would multiply combinatorially.',
            "You want to swap implementations at runtime, or compile/ship them separately from the abstraction that uses them.",
        ],
        example: 'Separating `Shape` (Circle, Square) from `Renderer` (VectorRenderer, RasterRenderer), so any shape can be drawn by any renderer without a class for every combination.',
        watch: "It adds an extra layer of indirection up front — worth it once you genuinely have two independent dimensions of variation, overkill if you only ever have one.",
    },
    flyweight: {
        name: 'Flyweight',
        category: 'Structural',
        summary: 'Uses sharing to support large numbers of fine-grained objects efficiently, by sharing the state that is common between them.',
        when: [
            "You need to create a huge number of similar objects, and the memory footprint is becoming a real problem.",
            'Much of each object\'s state is identical (intrinsic) and can be shared, leaving only a small amount unique (extrinsic) per instance.',
        ],
        example: 'Rendering a forest of a million trees by sharing one `TreeType` (mesh + texture) across all of them, and storing only each tree\'s position and scale individually.',
        watch: 'Splitting state into "shared" and "unique" parts adds real complexity — reach for it only once profiling shows memory is genuinely the bottleneck.',
    },
    observer: {
        name: 'Observer',
        category: 'Behavioral',
        summary: 'Defines a one-to-many dependency between objects, so that when one object changes state, all its dependents are notified and updated automatically.',
        when: [
            'A change in one object should ripple out to an unknown or varying number of others.',
            'You want to keep the subject and its observers loosely coupled — the subject just announces changes, it never needs to know who is listening.',
        ],
        example: 'A stock-price object that notifies a chart, a ticker widget, and a price-alert service the moment its value updates — none of which the price object needs to know about directly.',
        watch: 'Long observer chains and update cascades can be tricky to trace — and forgetting to unsubscribe is a classic source of memory leaks.',
    },
    mediator: {
        name: 'Mediator',
        category: 'Behavioral',
        summary: 'Defines an object that encapsulates how a set of other objects interact, keeping them from referring to one another directly.',
        when: [
            'A group of objects communicate in a tangled, many-to-many way that is becoming hard to follow or change.',
            'You want to centralize and simplify that communication into one place, so each object only needs to know about the mediator.',
        ],
        example: "An air-traffic control tower that coordinates planes so they never need to talk to each other directly — every plane just talks to the tower.",
        watch: 'Done poorly, the mediator itself can balloon into a tangled "god object" that knows far too much about everyone — keep its responsibilities focused on coordination.',
    },
    'chain-of-responsibility': {
        name: 'Chain of Responsibility',
        category: 'Behavioral',
        summary: 'Passes a request along a chain of potential handlers; each one decides either to process the request or to pass it further down the chain.',
        when: [
            'More than one object could handle a request, and exactly which one should is only known at runtime.',
            'You want to decouple the sender of a request from whichever object ultimately handles it.',
        ],
        example: 'An HTTP middleware pipeline where authentication, logging, and validation handlers each get a chance to inspect, handle, or pass along the incoming request.',
        watch: 'If nothing in the chain handles a request, it can silently fall through — make sure there is always a sensible default or fallback handler at the end.',
    },
    strategy: {
        name: 'Strategy',
        category: 'Behavioral',
        summary: 'Defines a family of interchangeable algorithms, encapsulates each one, and lets the algorithm vary independently from the clients that use it.',
        when: [
            'You have several ways to accomplish the same task and want to switch between them — ideally without a wall of `if`/`switch` statements.',
            'You expect to add new variants over time, and want each one isolated and independently testable.',
        ],
        example: 'A checkout flow that swaps between `CreditCardPayment`, `PixPayment`, and `PayPalPayment` strategies depending on what the customer picks — all behind one `pay()` interface.',
        watch: 'For just two simple, stable variants, a plain conditional can be perfectly fine — Strategy earns its keep once the variants multiply or carry real complexity.',
    },
    command: {
        name: 'Command',
        category: 'Behavioral',
        summary: 'Encapsulates a request as a stand-alone object, letting you parameterize callers with different requests, queue or log them, and support undoable operations.',
        when: [
            'You need to queue, schedule, log, or replay actions — or support undo/redo.',
            'You want to decouple the object that triggers an action from the object that actually performs it.',
        ],
        example: 'Each editor menu action — `Cut`, `Copy`, `Paste` — is its own command object, which makes building an undo/redo stack straightforward.',
        watch: "It can mean a lot of small classes for simple actions — in languages with first-class functions, a plain function or closure often serves the same purpose with less ceremony.",
    },
    'template-method': {
        name: 'Template Method',
        category: 'Behavioral',
        summary: "Defines the skeleton of an algorithm in a base method, deferring some of its individual steps to subclasses without changing the algorithm's overall structure.",
        when: [
            'Several classes follow the same overall process but differ in a few specific steps.',
            'You want to enforce a consistent sequence of steps while still allowing — and inviting — customization at well-defined points.',
        ],
        example: "A `DataExporter` base class defines `export()` as fetch → transform → write; `CsvExporter` and `JsonExporter` subclasses only override `transform()`.",
        watch: "Relies on inheritance, which can be more rigid than composition — if you need to mix and match steps freely at runtime, Strategy may fit better.",
    },
    state: {
        name: 'State',
        category: 'Behavioral',
        summary: "Lets an object alter its behavior when its internal state changes — so much so that it appears to change its class.",
        when: [
            "An object's behavior depends heavily on which state it's currently in.",
            'You notice large `if`/`switch` blocks branching on a "status" or "mode" field scattered through the code.',
        ],
        example: 'A `MediaPlayer` that behaves differently in `Playing`, `Paused`, and `Stopped` states — pressing "play" does something different in each, without one giant conditional.',
        watch: 'Introduces a class per state, which is more ceremony than a single `enum` plus `switch` for very simple, stable state machines.',
    },
    iterator: {
        name: 'Iterator',
        category: 'Behavioral',
        summary: "Provides a way to access the elements of a collection sequentially, without exposing the collection's underlying representation.",
        when: [
            'You want a single, uniform way to step through different kinds of collections.',
            'You need to support multiple, independent traversals over the same collection at the same time.',
        ],
        example: "Iterating over a custom `LinkedList`, `Tree`, or `Graph` with the very same `for...of` syntax you'd use on a plain array.",
        watch: 'Most modern languages bake this pattern into the language itself (iterables, generators) — you rarely need to hand-roll it from scratch anymore.',
    },
    memento: {
        name: 'Memento',
        category: 'Behavioral',
        summary: "Captures and externalizes an object's internal state without violating its encapsulation, so it can be restored to that state later.",
        when: [
            'You need undo, rollback, or "save points" — and the object guards its internals closely.',
            "Exposing the object's internal fields directly to implement this would break its encapsulation.",
        ],
        example: 'A text editor that snapshots the document\'s state before every edit, so the user can hit "undo" and step back through their history.',
        watch: 'Storing full snapshots can get memory-hungry for large objects or long histories — consider storing diffs, or capping how far back you keep state.',
    },
    visitor: {
        name: 'Visitor',
        category: 'Behavioral',
        summary: 'Represents an operation to perform on the elements of an object structure, letting you define new operations without changing the classes of the elements themselves.',
        when: [
            'You need to run several distinct, unrelated operations across a stable, well-known set of classes — like an AST or a document model.',
            "The element classes themselves shouldn't have to change every time you dream up a new operation.",
        ],
        example: 'Adding `exportToPdf`, `prettyPrint`, and `validate` operations over a fixed set of AST node types, each as its own visitor — without touching the node classes.',
        watch: "Adding a brand-new *element* type means updating every visitor — Visitor trades off easy-to-add operations for harder-to-add element types.",
    },
    interpreter: {
        name: 'Interpreter',
        category: 'Behavioral',
        summary: 'Given a simple language, defines a representation for its grammar, along with an interpreter that evaluates sentences in that language.',
        when: [
            'You have a small, well-defined language or rule set that needs to be evaluated repeatedly.',
            'You want to represent grammar rules as a class hierarchy that mirrors the structure of the language itself.',
        ],
        example: 'Evaluating simple filter expressions users type in, like `(status = "open") AND (priority > 2)`, by parsing them into a small tree of expression objects.',
        watch: "Hand-rolling a grammar this way only scales to genuinely small languages — for anything richer, an existing parser generator or expression library is usually a better investment.",
    },
};
