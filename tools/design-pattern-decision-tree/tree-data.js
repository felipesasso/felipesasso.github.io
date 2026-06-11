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
        code: {
            python: `class Config:
    _instance = None

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super().__new__(cls)
            cls._instance.settings = cls._load_settings()
        return cls._instance

    @staticmethod
    def _load_settings():
        return {"env": "production"}

# Config() always returns the very same shared instance
a, b = Config(), Config()
assert a is b`,
            go: `package config

import "sync"

type Config struct {
    Env string
}

var (
    instance *Config
    once     sync.Once
)

func Get() *Config {
    once.Do(func() {
        instance = &Config{Env: "production"}
    })
    return instance
}

// config.Get() always returns the very same shared instance`,
        },
        naiveCode: {
            python: `class Config:
    def __init__(self):
        self.settings = self._load_settings()  # re-reads/recomputes on every call

    def _load_settings(self):
        return {"env": "production"}

a = Config()
b = Config()
assert a is not b  # two separate instances, settings loaded twice — and nothing stops a third`,
            go: `type Config struct {
    Env string
}

func NewConfig() *Config {
    return &Config{Env: "production"} // recomputed on every call, by every caller
}

a := NewConfig()
b := NewConfig()
// a != b — every part of the app can end up with its own, possibly-stale copy`,
        },
        classDiagram: {
            classes: [
                { id: 'config', name: 'Config', members: ['- instance: Config', '- settings: dict', '+ getInstance(): Config'] },
            ],
            relations: [
                { from: 'config', to: 'config', type: 'dependency', label: 'always returns same instance' },
            ],
            layout: [['config']],
        },
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
        code: {
            python: `class Request:
    def __init__(self, url):
        self.url = url
        self.headers = {}
        self.timeout = 30

class RequestBuilder:
    def __init__(self, url):
        self._request = Request(url)

    def header(self, key, value):
        self._request.headers[key] = value
        return self

    def timeout(self, seconds):
        self._request.timeout = seconds
        return self

    def build(self):
        return self._request

req = (RequestBuilder("/users")
       .header("Authorization", "Bearer …")
       .timeout(5)
       .build())`,
            go: `type Request struct {
    URL     string
    Headers map[string]string
    Timeout time.Duration
}

type RequestBuilder struct{ request Request }

func NewRequestBuilder(url string) *RequestBuilder {
    return &RequestBuilder{request: Request{
        URL: url, Headers: map[string]string{}, Timeout: 30 * time.Second,
    }}
}

func (b *RequestBuilder) Header(key, value string) *RequestBuilder {
    b.request.Headers[key] = value
    return b
}

func (b *RequestBuilder) Timeout(d time.Duration) *RequestBuilder {
    b.request.Timeout = d
    return b
}

func (b *RequestBuilder) Build() Request { return b.request }

// req := NewRequestBuilder("/users").
//     Header("Authorization", "Bearer …").
//     Timeout(5 * time.Second).
//     Build()`,
        },
        naiveCode: {
            python: `class Request:
    def __init__(self, url, headers=None, timeout=30, retries=0, verify_ssl=True):
        self.url = url
        self.headers = headers or {}
        self.timeout = timeout
        self.retries = retries
        self.verify_ssl = verify_ssl

# every caller has to remember the full parameter list, and its order
req = Request("/users", {"Authorization": "Bearer …"}, 5, 0, True)
# add one more option later and every call site needs revisiting`,
            go: `type Request struct {
    URL       string
    Headers   map[string]string
    Timeout   int
    Retries   int
    VerifySSL bool
}

// every caller fills in the whole struct, in the right shape, every time
req := Request{
    URL:       "/users",
    Headers:   map[string]string{"Authorization": "Bearer …"},
    Timeout:   5,
    Retries:   0,
    VerifySSL: true,
}`,
        },
        classDiagram: {
            classes: [
                { id: 'builder', name: 'RequestBuilder', members: ['- request: Request', '+ header(key, value)', '+ timeout(seconds)', '+ build(): Request'] },
                { id: 'request', name: 'Request', members: ['+ url', '+ headers', '+ timeout'] },
            ],
            relations: [
                { from: 'builder', to: 'request', type: 'dependency', label: 'builds' },
            ],
            layout: [['builder'], ['request']],
        },
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
        code: {
            python: `class UIFactory:
    def create_button(self): raise NotImplementedError
    def create_checkbox(self): raise NotImplementedError

class LightThemeFactory(UIFactory):
    def create_button(self): return LightButton()
    def create_checkbox(self): return LightCheckbox()

class DarkThemeFactory(UIFactory):
    def create_button(self): return DarkButton()
    def create_checkbox(self): return DarkCheckbox()

def render_form(factory: UIFactory):
    button = factory.create_button()
    checkbox = factory.create_checkbox()
    return button.render(), checkbox.render()

# render_form(DarkThemeFactory())  # whole family swapped together`,
            go: `type UIFactory interface {
    CreateButton() Button
    CreateCheckbox() Checkbox
}

type DarkThemeFactory struct{}

func (DarkThemeFactory) CreateButton() Button     { return DarkButton{} }
func (DarkThemeFactory) CreateCheckbox() Checkbox { return DarkCheckbox{} }

type LightThemeFactory struct{}

func (LightThemeFactory) CreateButton() Button     { return LightButton{} }
func (LightThemeFactory) CreateCheckbox() Checkbox { return LightCheckbox{} }

func RenderForm(factory UIFactory) (string, string) {
    return factory.CreateButton().Render(), factory.CreateCheckbox().Render()
}

// RenderForm(DarkThemeFactory{}) // whole family of widgets swapped together`,
        },
        naiveCode: {
            python: `def render_form(theme):
    if theme == "light":
        button = LightButton()
        checkbox = LightCheckbox()
    elif theme == "dark":
        button = DarkButton()
        checkbox = DarkCheckbox()
    else:
        raise ValueError(f"unknown theme {theme}")
    return button.render(), checkbox.render()

# every place that builds UI pieces repeats this same theme check —
# and it's easy for one widget to end up "light" while its neighbor is "dark"`,
            go: `func RenderForm(theme string) (string, string) {
    var button, checkbox string
    switch theme {
    case "light":
        button, checkbox = "LightButton", "LightCheckbox"
    case "dark":
        button, checkbox = "DarkButton", "DarkCheckbox"
    default:
        panic("unknown theme")
    }
    return button, checkbox
    // this same switch gets copy-pasted everywhere a widget is created
}`,
        },
        classDiagram: {
            classes: [
                { id: 'button', name: 'Button', type: 'interface', members: ['+ render()'] },
                { id: 'checkbox', name: 'Checkbox', type: 'interface', members: ['+ render()'] },
                { id: 'factory', name: 'UIFactory', type: 'interface', members: ['+ createButton(): Button', '+ createCheckbox(): Checkbox'] },
                { id: 'light', name: 'LightThemeFactory', members: [] },
                { id: 'dark', name: 'DarkThemeFactory', members: [] },
            ],
            relations: [
                { from: 'light', to: 'factory', type: 'realization' },
                { from: 'dark', to: 'factory', type: 'realization' },
                { from: 'factory', to: 'button', type: 'dependency', label: 'creates' },
                { from: 'factory', to: 'checkbox', type: 'dependency', label: 'creates' },
            ],
            layout: [['button', 'checkbox'], ['factory'], ['light', 'dark']],
        },
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
        code: {
            python: `class DocumentCreator:
    def create_document(self):
        raise NotImplementedError

    def open_document(self):
        return self.create_document().open()

class PDFCreator(DocumentCreator):
    def create_document(self): return PDFDocument()

class SpreadsheetCreator(DocumentCreator):
    def create_document(self): return SpreadsheetDocument()

# PDFCreator().open_document()
# SpreadsheetCreator().open_document()  # subclass picks the concrete class`,
            go: `type DocumentCreator interface {
    CreateDocument() Document
}

type PDFCreator struct{}

func (PDFCreator) CreateDocument() Document { return PDFDocument{} }

type SpreadsheetCreator struct{}

func (SpreadsheetCreator) CreateDocument() Document { return SpreadsheetDocument{} }

func OpenWith(creator DocumentCreator) string {
    return creator.CreateDocument().Open()
}

// OpenWith(PDFCreator{})         // the creator decides the concrete class
// OpenWith(SpreadsheetCreator{})`,
        },
        naiveCode: {
            python: `def open_document(kind, path):
    if kind == "pdf":
        doc = PDFDocument(path)
    elif kind == "spreadsheet":
        doc = SpreadsheetDocument(path)
    else:
        raise ValueError(f"unsupported kind {kind}")
    return doc.open()

# adding a new document type means hunting down every place this branch is duplicated`,
            go: `func OpenDocument(kind, path string) string {
    switch kind {
    case "pdf":
        return NewPDFDocument(path).Open()
    case "spreadsheet":
        return NewSpreadsheetDocument(path).Open()
    default:
        panic("unsupported kind")
    }
    // each new format means another case here — and everywhere else this logic lives
}`,
        },
        classDiagram: {
            classes: [
                { id: 'document', name: 'Document', type: 'interface', members: ['+ open()'] },
                { id: 'creator', name: 'DocumentCreator', type: 'abstract', members: ['+ createDocument(): Document', '+ openDocument()'] },
                { id: 'pdf', name: 'PDFCreator', members: ['+ createDocument(): Document'] },
                { id: 'spreadsheet', name: 'SpreadsheetCreator', members: ['+ createDocument(): Document'] },
            ],
            relations: [
                { from: 'pdf', to: 'creator', type: 'inheritance' },
                { from: 'spreadsheet', to: 'creator', type: 'inheritance' },
                { from: 'creator', to: 'document', type: 'dependency', label: 'creates' },
            ],
            layout: [['document'], ['creator'], ['pdf', 'spreadsheet']],
        },
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
        code: {
            python: `import copy

class Enemy:
    def __init__(self, kind, health, gear):
        self.kind, self.health, self.gear = kind, health, gear

    def clone(self):
        return copy.deepcopy(self)

template = Enemy("goblin", health=30, gear=["dagger", "shield"])
pack = [template.clone() for _ in range(20)]
pack[0].health = 45  # tweak one without touching the template or the rest`,
            go: `type Enemy struct {
    Kind   string
    Health int
    Gear   []string
}

func (e Enemy) Clone() Enemy {
    gear := make([]string, len(e.Gear))
    copy(gear, e.Gear)
    e.Gear = gear
    return e
}

template := Enemy{Kind: "goblin", Health: 30, Gear: []string{"dagger", "shield"}}
pack := make([]Enemy, 20)
for i := range pack {
    pack[i] = template.Clone()
}
pack[0].Health = 45 // tweak one without touching the template or the rest`,
        },
        naiveCode: {
            python: `class Enemy:
    def __init__(self, kind, health, gear):
        self.kind, self.health, self.gear = kind, health, gear

def spawn_goblin():
    # every spawn point has to know — and keep in sync — every single field
    return Enemy("goblin", health=30, gear=["dagger", "shield"])

pack = [spawn_goblin() for _ in range(20)]
# add a field to Enemy and every spawn function silently goes stale`,
            go: `type Enemy struct {
    Kind   string
    Health int
    Gear   []string
}

func SpawnGoblin() Enemy {
    // restates every field — a new Enemy field means hunting down every spawn site
    return Enemy{Kind: "goblin", Health: 30, Gear: []string{"dagger", "shield"}}
}`,
        },
        classDiagram: {
            classes: [
                { id: 'enemy', name: 'Enemy', members: ['- kind, health, gear', '+ clone(): Enemy'] },
            ],
            relations: [
                { from: 'enemy', to: 'enemy', type: 'dependency', label: 'clone() returns a copy' },
            ],
            layout: [['enemy']],
        },
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
        code: {
            python: `class LegacyXMLGateway:
    def send_xml_payment(self, xml: str) -> str:
        return f"<response>processed {xml}</response>"

class PaymentGateway:
    def pay(self, amount, currency): raise NotImplementedError

class LegacyGatewayAdapter(PaymentGateway):
    def __init__(self, legacy: LegacyXMLGateway):
        self._legacy = legacy

    def pay(self, amount, currency):
        xml = f"<payment amount='{amount}' currency='{currency}'/>"
        self._legacy.send_xml_payment(xml)
        return {"amount": amount, "currency": currency, "status": "ok"}

gateway: PaymentGateway = LegacyGatewayAdapter(LegacyXMLGateway())
gateway.pay(42.50, "BRL")  # rest of the app only ever sees PaymentGateway`,
            go: `type LegacyXMLGateway struct{}

func (LegacyXMLGateway) SendXMLPayment(payload string) string {
    return "<response>processed " + payload + "</response>"
}

type PaymentGateway interface {
    Pay(amount float64, currency string) error
}

type LegacyGatewayAdapter struct{ legacy LegacyXMLGateway }

func (a LegacyGatewayAdapter) Pay(amount float64, currency string) error {
    xml := fmt.Sprintf("<payment amount='%.2f' currency='%s'/>", amount, currency)
    a.legacy.SendXMLPayment(xml)
    return nil
}

// var gateway PaymentGateway = LegacyGatewayAdapter{}
// gateway.Pay(42.50, "BRL") // rest of the app only ever sees PaymentGateway`,
        },
        naiveCode: {
            python: `class LegacyXMLGateway:
    def send_xml_payment(self, xml: str) -> str:
        return f"<response>processed {xml}</response>"

def checkout(amount, currency):
    legacy = LegacyXMLGateway()
    xml = f"<payment amount='{amount}' currency='{currency}'/>"
    legacy.send_xml_payment(xml)
    # every call site has to know how to build XML for this one legacy gateway —
    # and rewrite all of it the day a modern gateway replaces it`,
            go: `type LegacyXMLGateway struct{}

func (g LegacyXMLGateway) SendXMLPayment(xml string) string {
    return "<response>processed " + xml + "</response>"
}

func Checkout(amount float64, currency string) {
    legacy := LegacyXMLGateway{}
    xml := fmt.Sprintf("<payment amount='%.2f' currency='%s'/>", amount, currency)
    legacy.SendXMLPayment(xml)
    // every caller is welded directly to this one gateway's XML shape
}`,
        },
        classDiagram: {
            classes: [
                { id: 'gateway', name: 'PaymentGateway', type: 'interface', members: ['+ pay(amount, currency)'] },
                { id: 'adapter', name: 'LegacyGatewayAdapter', members: ['- legacy: LegacyXMLGateway', '+ pay(amount, currency)'] },
                { id: 'legacy', name: 'LegacyXMLGateway', members: ['+ sendXmlPayment(xml)'] },
            ],
            relations: [
                { from: 'adapter', to: 'gateway', type: 'realization' },
                { from: 'adapter', to: 'legacy', type: 'composition', label: 'adapts' },
            ],
            layout: [['gateway'], ['adapter'], ['legacy']],
        },
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
        code: {
            python: `class Coffee:
    def cost(self): return 4.0
    def description(self): return "Coffee"

class MilkDecorator:
    def __init__(self, drink): self._drink = drink
    def cost(self): return self._drink.cost() + 0.5
    def description(self): return self._drink.description() + " + milk"

class SugarDecorator:
    def __init__(self, drink): self._drink = drink
    def cost(self): return self._drink.cost() + 0.2
    def description(self): return self._drink.description() + " + sugar"

order = SugarDecorator(MilkDecorator(Coffee()))
order.description()  # "Coffee + milk + sugar"
order.cost()         # 4.7`,
            go: `type Drink interface {
    Cost() float64
    Description() string
}

type Coffee struct{}

func (Coffee) Cost() float64       { return 4.0 }
func (Coffee) Description() string { return "Coffee" }

type MilkDecorator struct{ Drink Drink }

func (m MilkDecorator) Cost() float64       { return m.Drink.Cost() + 0.5 }
func (m MilkDecorator) Description() string { return m.Drink.Description() + " + milk" }

type SugarDecorator struct{ Drink Drink }

func (s SugarDecorator) Cost() float64       { return s.Drink.Cost() + 0.2 }
func (s SugarDecorator) Description() string { return s.Drink.Description() + " + sugar" }

// order := SugarDecorator{Drink: MilkDecorator{Drink: Coffee{}}}
// order.Description() // "Coffee + milk + sugar"`,
        },
        naiveCode: {
            python: `class Coffee:
    def cost(self): return 4.0
    def description(self): return "Coffee"

class CoffeeWithMilk(Coffee):
    def cost(self): return super().cost() + 0.5
    def description(self): return super().description() + " + milk"

class CoffeeWithMilkAndSugar(CoffeeWithMilk):
    def cost(self): return super().cost() + 0.2
    def description(self): return super().description() + " + sugar"

# one subclass per combination — milk, sugar, milk+sugar, milk+sugar+cream…
order = CoffeeWithMilkAndSugar()`,
            go: `type Coffee struct{}

func (Coffee) Cost() float64       { return 4.0 }
func (Coffee) Description() string { return "Coffee" }

type CoffeeWithMilk struct{ Coffee }

func (c CoffeeWithMilk) Cost() float64       { return c.Coffee.Cost() + 0.5 }
func (c CoffeeWithMilk) Description() string { return c.Coffee.Description() + " + milk" }

type CoffeeWithMilkAndSugar struct{ CoffeeWithMilk }

func (c CoffeeWithMilkAndSugar) Cost() float64 { return c.CoffeeWithMilk.Cost() + 0.2 }

// a new type for every combination of add-ons — the hierarchy keeps exploding`,
        },
        classDiagram: {
            classes: [
                { id: 'drink', name: 'Drink', type: 'interface', members: ['+ cost()', '+ description()'] },
                { id: 'coffee', name: 'Coffee', members: ['+ cost()', '+ description()'] },
                { id: 'milk', name: 'MilkDecorator', members: ['- drink: Drink', '+ cost()', '+ description()'] },
                { id: 'sugar', name: 'SugarDecorator', members: ['- drink: Drink', '+ cost()', '+ description()'] },
            ],
            relations: [
                { from: 'coffee', to: 'drink', type: 'realization' },
                { from: 'milk', to: 'drink', type: 'realization' },
                { from: 'sugar', to: 'drink', type: 'realization' },
                { from: 'milk', to: 'drink', type: 'aggregation', label: 'wraps' },
                { from: 'sugar', to: 'drink', type: 'aggregation', label: 'wraps' },
            ],
            layout: [['drink'], ['coffee', 'milk', 'sugar']],
        },
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
        code: {
            python: `class CodecLibrary:
    def select_codec(self, fmt): return f"codec:{fmt}"

class BufferPool:
    def acquire(self): return "buffer"

class Encoder:
    def encode(self, data, codec, buffer): return f"encoded({data}) via {codec}"

class VideoConverter:
    def __init__(self):
        self._codecs = CodecLibrary()
        self._buffers = BufferPool()
        self._encoder = Encoder()

    def convert(self, file, fmt):
        codec = self._codecs.select_codec(fmt)
        buffer = self._buffers.acquire()
        return self._encoder.encode(file, codec, buffer)

VideoConverter().convert("clip.mov", "mp4")  # one call hides the whole subsystem`,
            go: `type codecLibrary struct{}

func (codecLibrary) SelectCodec(format string) string { return "codec:" + format }

type bufferPool struct{}

func (bufferPool) Acquire() string { return "buffer" }

type encoder struct{}

func (encoder) Encode(data, codec, buffer string) string {
    return "encoded(" + data + ") via " + codec
}

type VideoConverter struct {
    codecs  codecLibrary
    buffers bufferPool
    encoder encoder
}

func (v VideoConverter) Convert(file, format string) string {
    codec := v.codecs.SelectCodec(format)
    buffer := v.buffers.Acquire()
    return v.encoder.Encode(file, codec, buffer)
}

// VideoConverter{}.Convert("clip.mov", "mp4") // one call hides the whole subsystem`,
        },
        naiveCode: {
            python: `def convert_clip(file, fmt):
    codecs = CodecLibrary()
    buffers = BufferPool()
    encoder = Encoder()

    codec = codecs.select_codec(fmt)
    buffer = buffers.acquire()
    return encoder.encode(file, codec, buffer)

# every place that converts a video has to know this exact sequence,
# in this exact order, across three different subsystem classes`,
            go: `func ConvertClip(file, format string) string {
    codecs := CodecLibrary{}
    buffers := BufferPool{}
    encoder := Encoder{}

    codec := codecs.SelectCodec(format)
    buffer := buffers.Acquire()
    return encoder.Encode(file, codec, buffer)
    // callers must learn — and keep in sync with — the whole subsystem's wiring
}`,
        },
        classDiagram: {
            classes: [
                { id: 'converter', name: 'VideoConverter', members: ['+ convert(file, fmt)'] },
                { id: 'codec', name: 'CodecLibrary', members: ['+ selectCodec(fmt)'] },
                { id: 'buffer', name: 'BufferPool', members: ['+ acquire()'] },
                { id: 'encoder', name: 'Encoder', members: ['+ encode(data, codec, buffer)'] },
            ],
            relations: [
                { from: 'converter', to: 'codec', type: 'dependency', label: 'uses' },
                { from: 'converter', to: 'buffer', type: 'dependency', label: 'uses' },
                { from: 'converter', to: 'encoder', type: 'dependency', label: 'uses' },
            ],
            layout: [['converter'], ['codec', 'buffer', 'encoder']],
        },
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
        code: {
            python: `class Node:
    def size(self): raise NotImplementedError

class File(Node):
    def __init__(self, name, num_bytes):
        self.name, self.bytes = name, num_bytes
    def size(self): return self.bytes

class Folder(Node):
    def __init__(self, name):
        self.name, self.children = name, []
    def add(self, node):
        self.children.append(node)
        return self
    def size(self):
        return sum(child.size() for child in self.children)

root = (Folder("project")
        .add(File("readme.md", 1200))
        .add(Folder("src").add(File("main.py", 3400))))
root.size()  # files and folders are summed through the very same interface`,
            go: `type Node interface{ Size() int }

type File struct {
    Name  string
    Bytes int
}

func (f File) Size() int { return f.Bytes }

type Folder struct {
    Name     string
    Children []Node
}

func (f *Folder) Add(n Node) *Folder { f.Children = append(f.Children, n); return f }

func (f Folder) Size() int {
    total := 0
    for _, child := range f.Children {
        total += child.Size()
    }
    return total
}

// root := (&Folder{Name: "project"}).Add(File{Name: "readme.md", Bytes: 1200})
// root.Size() // files and folders are summed through the very same interface`,
        },
        naiveCode: {
            python: `def total_size(item):
    if isinstance(item, File):
        return item.bytes
    elif isinstance(item, Folder):
        total = 0
        for child in item.children:
            total += total_size(child)  # recurse and re-check types by hand
        return total
    raise TypeError("unknown item type")

# every operation on the tree repeats this same File/Folder type-check`,
            go: `func TotalSize(item interface{}) int {
    switch v := item.(type) {
    case File:
        return v.Bytes
    case Folder:
        total := 0
        for _, child := range v.Children {
            total += TotalSize(child) // recurse and re-switch by hand, every time
        }
        return total
    default:
        panic("unknown item type")
    }
}`,
        },
        classDiagram: {
            classes: [
                { id: 'node', name: 'Node', type: 'interface', members: ['+ size(): int'] },
                { id: 'file', name: 'File', members: ['- bytes: int', '+ size(): int'] },
                { id: 'folder', name: 'Folder', members: ['- children: Node[]', '+ add(node)', '+ size(): int'] },
            ],
            relations: [
                { from: 'file', to: 'node', type: 'realization' },
                { from: 'folder', to: 'node', type: 'realization' },
                { from: 'folder', to: 'node', type: 'composition', label: 'contains *' },
            ],
            layout: [['node'], ['file', 'folder']],
        },
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
        code: {
            python: `class Image:
    def display(self): raise NotImplementedError

class RealImage(Image):
    def __init__(self, path):
        self.path = path
        print(f"Loading {path} from disk…")

    def display(self):
        return f"Displaying {self.path}"

class ImageProxy(Image):
    def __init__(self, path):
        self.path, self._real = path, None

    def display(self):
        if self._real is None:
            self._real = RealImage(self.path)  # loaded only when actually needed
        return self._real.display()

gallery = [ImageProxy(f"photo_{i}.jpg") for i in range(100)]
gallery[3].display()  # only photo_3.jpg ever gets read from disk`,
            go: `type Image interface{ Display() string }

type RealImage struct{ path string }

func NewRealImage(path string) *RealImage {
    fmt.Println("Loading", path, "from disk…")
    return &RealImage{path: path}
}

func (r *RealImage) Display() string { return "Displaying " + r.path }

type ImageProxy struct {
    path string
    real *RealImage
}

func (p *ImageProxy) Display() string {
    if p.real == nil {
        p.real = NewRealImage(p.path) // loaded only when actually needed
    }
    return p.real.Display()
}

// gallery[3].Display() // only that one image ever gets read from disk`,
        },
        naiveCode: {
            python: `class RealImage:
    def __init__(self, path):
        self.path = path
        print(f"Loading {path} from disk…")  # happens immediately, for every image

    def display(self):
        return f"Displaying {self.path}"

gallery = [RealImage(f"photo_{i}.jpg") for i in range(100)]
# all 100 images are read from disk up front, even if only one is ever shown
gallery[3].display()`,
            go: `type RealImage struct{ Path string }

func NewRealImage(path string) *RealImage {
    fmt.Println("Loading", path, "from disk…") // runs immediately, for every image
    return &RealImage{Path: path}
}

gallery := make([]*RealImage, 100)
for i := range gallery {
    gallery[i] = NewRealImage(fmt.Sprintf("photo_%d.jpg", i))
}
// 100 disk reads up front, whether or not any image is ever displayed`,
        },
        classDiagram: {
            classes: [
                { id: 'image', name: 'Image', type: 'interface', members: ['+ display()'] },
                { id: 'real', name: 'RealImage', members: ['- path', '+ display()'] },
                { id: 'proxy', name: 'ImageProxy', members: ['- path', '- real: RealImage', '+ display()'] },
            ],
            relations: [
                { from: 'real', to: 'image', type: 'realization' },
                { from: 'proxy', to: 'image', type: 'realization' },
                { from: 'proxy', to: 'real', type: 'aggregation', label: 'lazily creates' },
            ],
            layout: [['image'], ['real', 'proxy']],
        },
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
        code: {
            python: `class Renderer:
    def render_circle(self, radius): raise NotImplementedError

class VectorRenderer(Renderer):
    def render_circle(self, radius):
        return f"Drawing a vector circle of radius {radius}"

class RasterRenderer(Renderer):
    def render_circle(self, radius):
        return f"Drawing {radius * radius} pixels for a circle"

class Circle:
    def __init__(self, renderer: Renderer, radius):
        self.renderer, self.radius = renderer, radius

    def draw(self):
        return self.renderer.render_circle(self.radius)

Circle(VectorRenderer(), 5).draw()
Circle(RasterRenderer(), 5).draw()  # same shape, independent rendering strategy`,
            go: `type Renderer interface{ RenderCircle(radius int) string }

type VectorRenderer struct{}

func (VectorRenderer) RenderCircle(r int) string {
    return fmt.Sprintf("Drawing a vector circle of radius %d", r)
}

type RasterRenderer struct{}

func (RasterRenderer) RenderCircle(r int) string {
    return fmt.Sprintf("Drawing %d pixels for a circle", r*r)
}

type Circle struct {
    Renderer Renderer
    Radius   int
}

func (c Circle) Draw() string { return c.Renderer.RenderCircle(c.Radius) }

// Circle{Renderer: VectorRenderer{}, Radius: 5}.Draw()
// Circle{Renderer: RasterRenderer{}, Radius: 5}.Draw() // same shape, different renderer`,
        },
        naiveCode: {
            python: `class VectorCircle:
    def __init__(self, radius): self.radius = radius
    def draw(self): return f"Drawing a vector circle of radius {self.radius}"

class RasterCircle:
    def __init__(self, radius): self.radius = radius
    def draw(self): return f"Drawing {self.radius * self.radius} pixels for a circle"

class VectorSquare: ...
class RasterSquare: ...
# every new shape needs both a vector AND a raster version — combinations multiply`,
            go: `type VectorCircle struct{ Radius int }

func (c VectorCircle) Draw() string { return fmt.Sprintf("vector circle r=%d", c.Radius) }

type RasterCircle struct{ Radius int }

func (c RasterCircle) Draw() string {
    return fmt.Sprintf("%d pixels for a circle", c.Radius*c.Radius)
}

// type VectorSquare, RasterSquare, VectorTriangle, RasterTriangle ...
// shapes × render styles = a brand new type for every combination`,
        },
        classDiagram: {
            classes: [
                { id: 'circle', name: 'Circle', members: ['- renderer: Renderer', '- radius', '+ draw()'] },
                { id: 'renderer', name: 'Renderer', type: 'interface', members: ['+ renderCircle(radius)'] },
                { id: 'vector', name: 'VectorRenderer', members: ['+ renderCircle(radius)'] },
                { id: 'raster', name: 'RasterRenderer', members: ['+ renderCircle(radius)'] },
            ],
            relations: [
                { from: 'circle', to: 'renderer', type: 'aggregation', label: 'delegates to' },
                { from: 'vector', to: 'renderer', type: 'realization' },
                { from: 'raster', to: 'renderer', type: 'realization' },
            ],
            layout: [['circle', 'renderer'], ['vector', 'raster']],
        },
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
        code: {
            python: `class TreeType:
    """Heavy, shared, immutable data — created once per (mesh, texture) pair."""
    _cache = {}

    def __new__(cls, mesh, texture):
        key = (mesh, texture)
        if key not in cls._cache:
            inst = super().__new__(cls)
            inst.mesh, inst.texture = mesh, texture
            cls._cache[key] = inst
        return cls._cache[key]

class Tree:
    def __init__(self, x, y, tree_type):
        self.x, self.y, self.type = x, y, tree_type

oak = TreeType("oak.mesh", "oak.png")  # created once, shared by every instance
forest = [Tree(i, i * 2, oak) for i in range(1_000_000)]`,
            go: `// TreeType holds the heavy, shared data — one instance per combination.
type TreeType struct {
    Mesh    string
    Texture string
}

var treeTypes = map[string]*TreeType{}

func GetTreeType(mesh, texture string) *TreeType {
    key := mesh + "|" + texture
    if t, ok := treeTypes[key]; ok {
        return t
    }
    t := &TreeType{Mesh: mesh, Texture: texture}
    treeTypes[key] = t
    return t
}

type Tree struct {
    X, Y int
    Type *TreeType // shared pointer, never copied per instance
}

// oak := GetTreeType("oak.mesh", "oak.png")
// forest := make([]Tree, 1_000_000)
// for i := range forest {
//     forest[i] = Tree{X: i, Y: i * 2, Type: oak}
// }`,
        },
        naiveCode: {
            python: `class Tree:
    def __init__(self, x, y, mesh, texture):
        self.x, self.y = x, y
        self.mesh, self.texture = mesh, texture  # duplicated in every single tree

forest = [Tree(i, i * 2, "oak.mesh", "oak.png") for i in range(1_000_000)]
# a million copies of the exact same mesh and texture data, sitting in memory`,
            go: `type Tree struct {
    X, Y          int
    Mesh, Texture string // duplicated per instance — never shared
}

forest := make([]Tree, 1_000_000)
for i := range forest {
    forest[i] = Tree{X: i, Y: i * 2, Mesh: "oak.mesh", Texture: "oak.png"}
}
// a million copies of identical mesh/texture strings, multiplying memory use`,
        },
        classDiagram: {
            classes: [
                { id: 'treetype', name: 'TreeType', members: ['+ mesh', '+ texture'] },
                { id: 'tree', name: 'Tree', members: ['- x, y', '- type: TreeType'] },
            ],
            relations: [
                { from: 'tree', to: 'treetype', type: 'aggregation', label: 'shares' },
            ],
            layout: [['treetype'], ['tree']],
        },
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
        code: {
            python: `class StockPrice:
    def __init__(self, symbol):
        self.symbol, self._observers = symbol, []

    def subscribe(self, observer):
        self._observers.append(observer)

    def set_price(self, price):
        for observer in self._observers:
            observer(self.symbol, price)

ticker = StockPrice("PINS")
ticker.subscribe(lambda sym, price: print(f"chart: {sym} -> {price}"))
ticker.subscribe(lambda sym, price: print(f"alert: {sym} crossed 35!") if price > 35 else None)
ticker.set_price(36.40)  # every subscriber fires automatically, in one shot`,
            go: `type Observer func(symbol string, price float64)

type StockPrice struct {
    Symbol    string
    observers []Observer
}

func (s *StockPrice) Subscribe(o Observer) {
    s.observers = append(s.observers, o)
}

func (s *StockPrice) SetPrice(price float64) {
    for _, o := range s.observers {
        o(s.Symbol, price)
    }
}

// ticker := &StockPrice{Symbol: "PINS"}
// ticker.Subscribe(func(sym string, price float64) { fmt.Println("chart:", sym, price) })
// ticker.SetPrice(36.40) // every subscriber fires automatically, in one shot`,
        },
        naiveCode: {
            python: `class StockPrice:
    def __init__(self, symbol):
        self.symbol = symbol

    def set_price(self, price):
        self.price = price
        # every interested party has to be wired in here, by hand
        chart.update(self.symbol, price)
        if price > 35:
            alerts.notify(f"{self.symbol} crossed 35!")
        # add a new dependent? edit this method and hope you don't break the others`,
            go: `type StockPrice struct{ Symbol string }

func (s *StockPrice) SetPrice(price float64) {
    chart.Update(s.Symbol, price) // hard-wired dependents...
    if price > 35 {
        alerts.Notify(s.Symbol + " crossed 35!")
    }
    // ...edited directly here, every single time something new needs to react
}`,
        },
        classDiagram: {
            classes: [
                { id: 'subject', name: 'StockPrice', members: ['- observers: Observer[]', '+ subscribe(observer)', '+ setPrice(price)'] },
                { id: 'observer', name: 'Observer', type: 'interface', members: ['+ update(symbol, price)'] },
            ],
            relations: [
                { from: 'subject', to: 'observer', type: 'aggregation', label: 'notifies *' },
            ],
            layout: [['subject', 'observer']],
        },
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
        code: {
            python: `class ControlTower:
    def __init__(self):
        self._planes = []

    def register(self, plane):
        plane.tower = self
        self._planes.append(plane)

    def request_landing(self, plane):
        if any(p.status == "landing" for p in self._planes if p is not plane):
            return f"{plane.name}: hold — runway busy"
        plane.status = "landing"
        return f"{plane.name}: cleared to land"

class Plane:
    def __init__(self, name):
        self.name, self.status, self.tower = name, "flying", None

    def land(self):
        return self.tower.request_landing(self)

tower = ControlTower()
a, b = Plane("TAM3210"), Plane("GOL1456")
tower.register(a); tower.register(b)
a.land()  # planes never address each other directly — only the tower`,
            go: `type Plane struct {
    Name   string
    Status string
    tower  *ControlTower
}

func (p *Plane) Land() string { return p.tower.RequestLanding(p) }

type ControlTower struct{ planes []*Plane }

func (t *ControlTower) Register(p *Plane) {
    p.tower = t
    t.planes = append(t.planes, p)
}

func (t *ControlTower) RequestLanding(p *Plane) string {
    for _, other := range t.planes {
        if other != p && other.Status == "landing" {
            return p.Name + ": hold — runway busy"
        }
    }
    p.Status = "landing"
    return p.Name + ": cleared to land"
}

// tower := &ControlTower{}
// a, b := &Plane{Name: "TAM3210"}, &Plane{Name: "GOL1456"}
// tower.Register(a); tower.Register(b)
// a.Land() // planes never address each other directly — only the tower`,
        },
        naiveCode: {
            python: `class Plane:
    def __init__(self, name):
        self.name, self.status = name, "flying"
        self.peers = []  # every plane has to know about every other plane

    def land(self):
        for p in self.peers:
            if p.status == "landing":
                return f"{self.name}: hold — runway busy"
        self.status = "landing"
        return f"{self.name}: cleared to land"

a, b = Plane("TAM3210"), Plane("GOL1456")
a.peers, b.peers = [b], [a]  # wiring grows as O(n²) with the number of planes`,
            go: `type Plane struct {
    Name, Status string
    Peers        []*Plane // every plane must track every other plane directly
}

func (p *Plane) Land() string {
    for _, other := range p.Peers {
        if other.Status == "landing" {
            return p.Name + ": hold — runway busy"
        }
    }
    p.Status = "landing"
    return p.Name + ": cleared to land"
}
// connecting N planes means O(N²) direct references to keep in sync`,
        },
        classDiagram: {
            classes: [
                { id: 'tower', name: 'ControlTower', members: ['- planes: Plane[]', '+ register(plane)', '+ requestLanding(plane)'] },
                { id: 'plane', name: 'Plane', members: ['- tower: ControlTower', '+ land()'] },
            ],
            relations: [
                { from: 'plane', to: 'tower', type: 'aggregation', label: 'delegates to' },
            ],
            layout: [['tower'], ['plane']],
        },
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
        code: {
            python: `class Handler:
    def __init__(self):
        self._next = None

    def then(self, handler):
        self._next = handler
        return handler

    def handle(self, request):
        return self._next.handle(request) if self._next else None

class AuthHandler(Handler):
    def handle(self, request):
        if not request.get("token"):
            return "401 Unauthorized"
        return super().handle(request)

class ValidationHandler(Handler):
    def handle(self, request):
        if not request.get("body"):
            return "400 Bad Request"
        return super().handle(request)

chain = AuthHandler()
chain.then(ValidationHandler())
chain.handle({"token": "abc", "body": {"item": 1}})  # passed along until handled`,
            go: `type Request struct {
    Token string
    Body  map[string]any
}

type Handler interface {
    Handle(r Request) string
    SetNext(h Handler)
}

type baseHandler struct{ next Handler }

func (b *baseHandler) SetNext(h Handler) { b.next = h }

func (b *baseHandler) pass(r Request) string {
    if b.next != nil {
        return b.next.Handle(r)
    }
    return ""
}

type AuthHandler struct{ baseHandler }

func (h *AuthHandler) Handle(r Request) string {
    if r.Token == "" {
        return "401 Unauthorized"
    }
    return h.pass(r)
}

// auth, validate := &AuthHandler{}, &ValidationHandler{}
// auth.SetNext(validate)
// auth.Handle(Request{Token: "abc", Body: map[string]any{"item": 1}})`,
        },
        naiveCode: {
            python: `def handle(request):
    if not request.get("token"):
        return "401 Unauthorized"
    if not request.get("body"):
        return "400 Bad Request"
    # every new check means another nested branch in this same function
    return process(request)

handle({"token": "abc", "body": {"item": 1}})`,
            go: `func Handle(request map[string]any) string {
    if request["token"] == nil {
        return "401 Unauthorized"
    }
    if request["body"] == nil {
        return "400 Bad Request"
    }
    // each new validation step nests one level deeper into this one function
    return Process(request)
}`,
        },
        classDiagram: {
            classes: [
                { id: 'handler', name: 'Handler', type: 'abstract', members: ['- next: Handler', '+ then(handler)', '+ handle(request)'] },
                { id: 'auth', name: 'AuthHandler', members: ['+ handle(request)'] },
                { id: 'validation', name: 'ValidationHandler', members: ['+ handle(request)'] },
            ],
            relations: [
                { from: 'auth', to: 'handler', type: 'inheritance' },
                { from: 'validation', to: 'handler', type: 'inheritance' },
                { from: 'handler', to: 'handler', type: 'dependency', label: 'next →' },
            ],
            layout: [['handler'], ['auth', 'validation']],
        },
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
        code: {
            python: `class PaymentStrategy:
    def pay(self, amount): raise NotImplementedError

class CreditCardPayment(PaymentStrategy):
    def pay(self, amount): return f"Charged R$ {amount:.2f} to credit card"

class PixPayment(PaymentStrategy):
    def pay(self, amount): return f"Generated Pix QR code for R$ {amount:.2f}"

class Checkout:
    def __init__(self, strategy: PaymentStrategy):
        self.strategy = strategy

    def complete(self, amount):
        return self.strategy.pay(amount)

Checkout(PixPayment()).complete(89.90)
Checkout(CreditCardPayment()).complete(89.90)  # same checkout, swapped algorithm`,
            go: `type PaymentStrategy interface {
    Pay(amount float64) string
}

type CreditCardPayment struct{}

func (CreditCardPayment) Pay(amount float64) string {
    return fmt.Sprintf("Charged R$ %.2f to credit card", amount)
}

type PixPayment struct{}

func (PixPayment) Pay(amount float64) string {
    return fmt.Sprintf("Generated Pix QR code for R$ %.2f", amount)
}

type Checkout struct{ Strategy PaymentStrategy }

func (c Checkout) Complete(amount float64) string { return c.Strategy.Pay(amount) }

// Checkout{Strategy: PixPayment{}}.Complete(89.90)
// Checkout{Strategy: CreditCardPayment{}}.Complete(89.90) // same checkout, swapped algorithm`,
        },
        naiveCode: {
            python: `class Checkout:
    def complete(self, amount, method):
        if method == "credit_card":
            return f"Charged R$ {amount:.2f} to credit card"
        elif method == "pix":
            return f"Generated Pix QR code for R$ {amount:.2f}"
        else:
            raise ValueError(f"unknown method {method}")
        # Checkout has to know about every payment algorithm that will ever exist

Checkout().complete(89.90, "pix")`,
            go: `func Complete(amount float64, method string) string {
    switch method {
    case "credit_card":
        return fmt.Sprintf("Charged R$ %.2f to credit card", amount)
    case "pix":
        return fmt.Sprintf("Generated Pix QR code for R$ %.2f", amount)
    default:
        panic("unknown method")
    }
    // Complete must be edited — and retested — every time a new method appears
}`,
        },
        classDiagram: {
            classes: [
                { id: 'checkout', name: 'Checkout', members: ['- strategy: PaymentStrategy', '+ complete(amount)'] },
                { id: 'strategy', name: 'PaymentStrategy', type: 'interface', members: ['+ pay(amount)'] },
                { id: 'creditcard', name: 'CreditCardPayment', members: ['+ pay(amount)'] },
                { id: 'pix', name: 'PixPayment', members: ['+ pay(amount)'] },
            ],
            relations: [
                { from: 'checkout', to: 'strategy', type: 'aggregation', label: 'delegates to' },
                { from: 'creditcard', to: 'strategy', type: 'realization' },
                { from: 'pix', to: 'strategy', type: 'realization' },
            ],
            layout: [['checkout', 'strategy'], ['creditcard', 'pix']],
        },
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
        code: {
            python: `class Command:
    def execute(self): raise NotImplementedError
    def undo(self): raise NotImplementedError

class InsertTextCommand(Command):
    def __init__(self, document, text):
        self.document, self.text = document, text

    def execute(self):
        self.document.content += self.text

    def undo(self):
        self.document.content = self.document.content[:-len(self.text)]

class CommandStack:
    def __init__(self):
        self._history = []

    def run(self, command):
        command.execute()
        self._history.append(command)

    def undo_last(self):
        if self._history:
            self._history.pop().undo()

stack = CommandStack()
stack.run(InsertTextCommand(doc, "Hello"))
stack.undo_last()  # cleanly reverses the last action, whatever it was`,
            go: `type Command interface {
    Execute()
    Undo()
}

type InsertTextCommand struct {
    Doc  *Document
    Text string
}

func (c *InsertTextCommand) Execute() { c.Doc.Content += c.Text }
func (c *InsertTextCommand) Undo() {
    c.Doc.Content = c.Doc.Content[:len(c.Doc.Content)-len(c.Text)]
}

type CommandStack struct{ history []Command }

func (s *CommandStack) Run(c Command) {
    c.Execute()
    s.history = append(s.history, c)
}

func (s *CommandStack) UndoLast() {
    if n := len(s.history); n > 0 {
        s.history[n-1].Undo()
        s.history = s.history[:n-1]
    }
}

// stack.Run(&InsertTextCommand{Doc: doc, Text: "Hello"})
// stack.UndoLast() // cleanly reverses the last action, whatever it was`,
        },
        naiveCode: {
            python: `class Editor:
    def __init__(self):
        self.content = ""
        self._history = []

    def insert(self, text):
        self.content += text
        self._history.append(("insert", text))

    def undo(self):
        if not self._history:
            return
        kind, text = self._history.pop()
        if kind == "insert":
            self.content = self.content[:-len(text)]
        # every new kind of action means another branch here, forever

editor = Editor()
editor.insert("Hello")
editor.undo()`,
            go: `type action struct{ kind, text string }

type Editor struct {
    Content string
    history []action
}

func (e *Editor) Insert(text string) {
    e.Content += text
    e.history = append(e.history, action{"insert", text})
}

func (e *Editor) Undo() {
    if len(e.history) == 0 {
        return
    }
    last := e.history[len(e.history)-1]
    e.history = e.history[:len(e.history)-1]
    if last.kind == "insert" {
        e.Content = e.Content[:len(e.Content)-len(last.text)]
    }
    // a switch that grows with every new editing operation ever added
}`,
        },
        classDiagram: {
            classes: [
                { id: 'stack', name: 'CommandStack', members: ['- history: Command[]', '+ run(command)', '+ undoLast()'] },
                { id: 'command', name: 'Command', type: 'interface', members: ['+ execute()', '+ undo()'] },
                { id: 'insert', name: 'InsertTextCommand', members: ['- document', '- text', '+ execute()', '+ undo()'] },
            ],
            relations: [
                { from: 'stack', to: 'command', type: 'aggregation', label: 'executes *' },
                { from: 'insert', to: 'command', type: 'realization' },
            ],
            layout: [['stack', 'command'], ['insert']],
        },
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
        code: {
            python: `class DataExporter:
    def export(self):
        rows = self._fetch()
        transformed = self._transform(rows)
        return self._write(transformed)

    def _fetch(self):
        return [{"id": 1, "name": "Felipe"}]

    def _transform(self, rows):
        raise NotImplementedError

    def _write(self, data):
        return data

class CsvExporter(DataExporter):
    def _transform(self, rows):
        return "\\n".join(f"{r['id']},{r['name']}" for r in rows)

# CsvExporter().export()  # same fetch -> transform -> write skeleton
# only "_transform" changes between CsvExporter and a future JsonExporter`,
            go: `type Row struct {
    ID   int
    Name string
}

// Exporter supplies the one step that varies; baseExporter owns the skeleton.
type Exporter interface {
    Transform(rows []Row) string
}

type baseExporter struct{ Exporter }

func (b baseExporter) Export() string {
    rows := []Row{{ID: 1, Name: "Felipe"}} // fetch — shared by every exporter
    return b.Transform(rows)               // the one step subclasses customize
}

type CsvExporter struct{ baseExporter }

func (CsvExporter) Transform(rows []Row) string {
    out := ""
    for _, r := range rows {
        out += fmt.Sprintf("%d,%s\\n", r.ID, r.Name)
    }
    return out
}

// exporter := CsvExporter{}
// exporter.baseExporter.Exporter = exporter
// exporter.Export() // same skeleton, only Transform varies`,
        },
        naiveCode: {
            python: `class CsvExporter:
    def export(self):
        rows = [{"id": 1, "name": "Felipe"}]            # duplicated...
        return "\\n".join(f"{r['id']},{r['name']}" for r in rows)

class JsonExporter:
    def export(self):
        rows = [{"id": 1, "name": "Felipe"}]            # ...fetch step,
        import json
        return json.dumps(rows)                          # copy-pasted yet again

# fix a bug in "fetch" and you must remember to fix it in every exporter`,
            go: `type CsvExporter struct{}

func (CsvExporter) Export() string {
    rows := fetchRows() // duplicated fetch step...
    return rowsToCSV(rows)
}

type JSONExporter struct{}

func (JSONExporter) Export() string {
    rows := fetchRows() // ...copy-pasted into every single exporter
    return rowsToJSON(rows)
}
// the shared "fetch -> transform -> write" skeleton lives nowhere — it's re-typed each time`,
        },
        classDiagram: {
            classes: [
                { id: 'exporter', name: 'DataExporter', type: 'abstract', members: ['+ export()', '# fetch()', '# transform(rows)', '# write(data)'] },
                { id: 'csv', name: 'CsvExporter', members: ['# transform(rows)'] },
            ],
            relations: [
                { from: 'csv', to: 'exporter', type: 'inheritance' },
            ],
            layout: [['exporter'], ['csv']],
        },
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
        code: {
            python: `class PlayerState:
    def play(self, player): raise NotImplementedError
    def pause(self, player): raise NotImplementedError

class PlayingState(PlayerState):
    def play(self, player): return "Already playing"
    def pause(self, player):
        player.state = PausedState()
        return "Paused"

class PausedState(PlayerState):
    def play(self, player):
        player.state = PlayingState()
        return "Resumed"
    def pause(self, player): return "Already paused"

class MediaPlayer:
    def __init__(self): self.state = PausedState()
    def play(self): return self.state.play(self)
    def pause(self): return self.state.pause(self)

player = MediaPlayer()
player.play()  # "Resumed" — behavior depends entirely on the current state
player.play()  # "Already playing" — no giant if/else needed anywhere`,
            go: `type PlayerState interface {
    Play(p *MediaPlayer) string
    Pause(p *MediaPlayer) string
}

type PlayingState struct{}

func (PlayingState) Play(p *MediaPlayer) string { return "Already playing" }
func (PlayingState) Pause(p *MediaPlayer) string {
    p.State = PausedState{}
    return "Paused"
}

type PausedState struct{}

func (PausedState) Play(p *MediaPlayer) string {
    p.State = PlayingState{}
    return "Resumed"
}
func (PausedState) Pause(p *MediaPlayer) string { return "Already paused" }

type MediaPlayer struct{ State PlayerState }

func (p *MediaPlayer) Play() string  { return p.State.Play(p) }
func (p *MediaPlayer) Pause() string { return p.State.Pause(p) }

// player := &MediaPlayer{State: PausedState{}}
// player.Play() // "Resumed" — behavior depends entirely on the current state`,
        },
        naiveCode: {
            python: `class MediaPlayer:
    def __init__(self):
        self.status = "paused"

    def play(self):
        if self.status == "paused":
            self.status = "playing"
            return "Resumed"
        elif self.status == "playing":
            return "Already playing"
        # every method needs its own copy of this same status check

    def pause(self):
        if self.status == "playing":
            self.status = "paused"
            return "Paused"
        elif self.status == "paused":
            return "Already paused"`,
            go: `type MediaPlayer struct{ Status string } // "playing" | "paused"

func (p *MediaPlayer) Play() string {
    switch p.Status {
    case "paused":
        p.Status = "playing"
        return "Resumed"
    case "playing":
        return "Already playing"
    }
    return ""
    // Pause() needs the mirror image of this same switch — and so does every new method
}`,
        },
        classDiagram: {
            classes: [
                { id: 'player', name: 'MediaPlayer', members: ['- state: PlayerState', '+ play()', '+ pause()'] },
                { id: 'state', name: 'PlayerState', type: 'interface', members: ['+ play(player)', '+ pause(player)'] },
                { id: 'playing', name: 'PlayingState', members: ['+ play(player)', '+ pause(player)'] },
                { id: 'paused', name: 'PausedState', members: ['+ play(player)', '+ pause(player)'] },
            ],
            relations: [
                { from: 'player', to: 'state', type: 'aggregation', label: 'delegates to' },
                { from: 'playing', to: 'state', type: 'realization' },
                { from: 'paused', to: 'state', type: 'realization' },
            ],
            layout: [['player', 'state'], ['playing', 'paused']],
        },
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
        code: {
            python: `class Playlist:
    def __init__(self):
        self._songs = []

    def add(self, song):
        self._songs.append(song)
        return self

    def __iter__(self):
        return iter(self._songs)  # delegates to Python's own iterator protocol

for song in Playlist().add("A").add("B"):
    print(song)  # the same "for ... in" syntax works for any iterable`,
            go: `type Playlist struct{ songs []string }

func (p *Playlist) Add(song string) *Playlist {
    p.songs = append(p.songs, song)
    return p
}

type SongIterator struct {
    songs []string
    pos   int
}

func (p *Playlist) Iterator() *SongIterator { return &SongIterator{songs: p.songs} }

func (it *SongIterator) HasNext() bool { return it.pos < len(it.songs) }
func (it *SongIterator) Next() string {
    song := it.songs[it.pos]
    it.pos++
    return song
}

// it := playlist.Iterator()
// for it.HasNext() {
//     fmt.Println(it.Next()) // same shape, regardless of how songs are stored
// }`,
        },
        naiveCode: {
            python: `class Playlist:
    def __init__(self):
        self.songs = []  # internal list is public — every caller pokes at it directly

    def add(self, song):
        self.songs.append(song)
        return self

playlist = Playlist().add("A").add("B")
for i in range(len(playlist.songs)):     # every consumer re-derives its own traversal
    print(playlist.songs[i])
# switch the storage to a dict or a tree later, and every one of these loops breaks`,
            go: `type Playlist struct {
    Songs []string // exported slice — anyone can index, mutate, or run out of bounds
}

p := Playlist{Songs: []string{"A", "B"}}
for i := 0; i < len(p.Songs); i++ {     // every consumer rewrites this same loop
    fmt.Println(p.Songs[i])
}
// changing the backing storage means hunting down and rewriting every loop like this`,
        },
        classDiagram: {
            classes: [
                { id: 'playlist', name: 'Playlist', members: ['- songs: string[]', '+ add(song)', '+ iterator(): SongIterator'] },
                { id: 'iterator', name: 'SongIterator', members: ['- songs', '- pos', '+ hasNext(): bool', '+ next(): string'] },
            ],
            relations: [
                { from: 'playlist', to: 'iterator', type: 'dependency', label: 'creates' },
            ],
            layout: [['playlist'], ['iterator']],
        },
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
        code: {
            python: `class EditorMemento:
    def __init__(self, content):
        self._content = content  # "private" — Editor is the only one that reads it

    def content(self):
        return self._content

class Editor:
    def __init__(self):
        self.content = ""

    def type(self, text):
        self.content += text

    def save(self):
        return EditorMemento(self.content)

    def restore(self, memento):
        self.content = memento.content()

editor = Editor()
editor.type("Hello")
checkpoint = editor.save()       # snapshot, without exposing internals
editor.type(" world — oops")
editor.restore(checkpoint)       # back to "Hello"`,
            go: `type EditorMemento struct{ content string } // unexported — internals stay hidden

type Editor struct{ Content string }

func (e *Editor) Type(text string)       { e.Content += text }
func (e *Editor) Save() EditorMemento     { return EditorMemento{content: e.Content} }
func (e *Editor) Restore(m EditorMemento) { e.Content = m.content }

// editor := &Editor{}
// editor.Type("Hello")
// checkpoint := editor.Save()    // snapshot, without exposing internals
// editor.Type(" world — oops")
// editor.Restore(checkpoint)     // back to "Hello"`,
        },
        naiveCode: {
            python: `class Editor:
    def __init__(self):
        self.content = ""

    def type(self, text):
        self.content += text

editor = Editor()
editor.type("Hello")
checkpoint = editor.content       # external code reaches straight into the internals
editor.type(" world — oops")
editor.content = checkpoint       # ...and writes them back directly, bypassing any rules`,
            go: `type Editor struct{ Content string } // exported field — nothing protects its invariants

e := &Editor{}
e.Content += "Hello"
checkpoint := e.Content              // outside code freely reads internal state...
e.Content += " world — oops"
e.Content = checkpoint               // ...and rewrites it directly, however it pleases`,
        },
        classDiagram: {
            classes: [
                { id: 'editor', name: 'Editor', members: ['- content: string', '+ type(text)', '+ save(): EditorMemento', '+ restore(memento)'] },
                { id: 'memento', name: 'EditorMemento', members: ['- content: string'] },
            ],
            relations: [
                { from: 'editor', to: 'memento', type: 'dependency', label: 'creates / restores' },
            ],
            layout: [['editor'], ['memento']],
        },
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
        code: {
            python: `class NumberNode:
    def __init__(self, value): self.value = value
    def accept(self, visitor): return visitor.visit_number(self)

class AddNode:
    def __init__(self, left, right): self.left, self.right = left, right
    def accept(self, visitor): return visitor.visit_add(self)

class PrettyPrintVisitor:
    def visit_number(self, node): return str(node.value)
    def visit_add(self, node):
        return f"({node.left.accept(self)} + {node.right.accept(self)})"

class EvalVisitor:
    def visit_number(self, node): return node.value
    def visit_add(self, node): return node.left.accept(self) + node.right.accept(self)

tree = AddNode(NumberNode(2), AddNode(NumberNode(3), NumberNode(4)))
tree.accept(PrettyPrintVisitor())  # "(2 + (3 + 4))"
tree.accept(EvalVisitor())         # 9 — new operations, the node classes never change`,
            go: `type Node interface{ Accept(v Visitor) string }

type NumberNode struct{ Value int }

func (n NumberNode) Accept(v Visitor) string { return v.VisitNumber(n) }

type AddNode struct{ Left, Right Node }

func (n AddNode) Accept(v Visitor) string { return v.VisitAdd(n) }

type Visitor interface {
    VisitNumber(n NumberNode) string
    VisitAdd(n AddNode) string
}

type PrettyPrintVisitor struct{}

func (p PrettyPrintVisitor) VisitNumber(n NumberNode) string { return fmt.Sprint(n.Value) }
func (p PrettyPrintVisitor) VisitAdd(n AddNode) string {
    return "(" + n.Left.Accept(p) + " + " + n.Right.Accept(p) + ")"
}

// tree := AddNode{NumberNode{2}, AddNode{NumberNode{3}, NumberNode{4}}}
// tree.Accept(PrettyPrintVisitor{}) // "(2 + (3 + 4))" — new ops, same node types`,
        },
        naiveCode: {
            python: `class NumberNode:
    def __init__(self, value): self.value = value
    def pretty_print(self): return str(self.value)
    def evaluate(self): return self.value
    # every new operation means touching NumberNode again...

class AddNode:
    def __init__(self, left, right): self.left, self.right = left, right
    def pretty_print(self):
        return f"({self.left.pretty_print()} + {self.right.pretty_print()})"
    def evaluate(self): return self.left.evaluate() + self.right.evaluate()
    # ...and AddNode, and every node type that will ever be added`,
            go: `type NumberNode struct{ Value int }

func (n NumberNode) PrettyPrint() string { return fmt.Sprint(n.Value) }
func (n NumberNode) Evaluate() int       { return n.Value }

type AddNode struct{ Left, Right Node }

func (n AddNode) PrettyPrint() string {
    return "(" + n.Left.PrettyPrint() + " + " + n.Right.PrettyPrint() + ")"
}
func (n AddNode) Evaluate() int { return n.Left.Evaluate() + n.Right.Evaluate() }

// a new operation means adding a method to every node type that exists — and ever will`,
        },
        classDiagram: {
            classes: [
                { id: 'node', name: 'Node', type: 'interface', members: ['+ accept(visitor)'] },
                { id: 'number', name: 'NumberNode', members: ['+ value', '+ accept(visitor)'] },
                { id: 'add', name: 'AddNode', members: ['- left, right: Node', '+ accept(visitor)'] },
                { id: 'visitor', name: 'Visitor', type: 'interface', members: ['+ visitNumber(node)', '+ visitAdd(node)'] },
                { id: 'pretty', name: 'PrettyPrintVisitor', members: ['+ visitNumber(node)', '+ visitAdd(node)'] },
            ],
            relations: [
                { from: 'number', to: 'node', type: 'realization' },
                { from: 'add', to: 'node', type: 'realization' },
                { from: 'add', to: 'node', type: 'aggregation', label: 'left / right' },
                { from: 'pretty', to: 'visitor', type: 'realization' },
                { from: 'node', to: 'visitor', type: 'dependency', label: 'accept(visitor)' },
            ],
            layout: [['node', 'visitor'], ['number', 'add', 'pretty']],
        },
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
        code: {
            python: `class Equals:
    def __init__(self, field, value): self.field, self.value = field, value
    def interpret(self, ctx): return ctx.get(self.field) == self.value

class GreaterThan:
    def __init__(self, field, value): self.field, self.value = field, value
    def interpret(self, ctx): return ctx.get(self.field, 0) > self.value

class And:
    def __init__(self, left, right): self.left, self.right = left, right
    def interpret(self, ctx):
        return self.left.interpret(ctx) and self.right.interpret(ctx)

rule = And(Equals("status", "open"), GreaterThan("priority", 2))
rule.interpret({"status": "open", "priority": 3})  # True`,
            go: `type Context map[string]any

type Expression interface{ Interpret(ctx Context) bool }

type Equals struct {
    Field string
    Value any
}

func (e Equals) Interpret(ctx Context) bool { return ctx[e.Field] == e.Value }

type GreaterThan struct {
    Field string
    Value int
}

func (g GreaterThan) Interpret(ctx Context) bool {
    v, _ := ctx[g.Field].(int)
    return v > g.Value
}

type And struct{ Left, Right Expression }

func (a And) Interpret(ctx Context) bool {
    return a.Left.Interpret(ctx) && a.Right.Interpret(ctx)
}

// rule := And{Equals{"status", "open"}, GreaterThan{"priority", 2}}
// rule.Interpret(Context{"status": "open", "priority": 3}) // true`,
        },
        naiveCode: {
            python: `def matches(rule_str, ctx):
    # rules look like "status=open AND priority>2" — parsed by hand, every time
    for part in rule_str.split(" AND "):
        if "=" in part:
            field, value = part.split("=")
            if str(ctx.get(field)) != value:
                return False
        elif ">" in part:
            field, value = part.split(">")
            if ctx.get(field, 0) <= int(value):
                return False
    return True
    # every new operator (OR, NOT, ranges…) means patching this one fragile parser

matches("status=open AND priority>2", {"status": "open", "priority": 3})`,
            go: `func Matches(rule string, ctx map[string]any) bool {
    // ad-hoc string splitting stands in for a real grammar
    for _, part := range strings.Split(rule, " AND ") {
        switch {
        case strings.Contains(part, "="):
            kv := strings.SplitN(part, "=", 2)
            if fmt.Sprint(ctx[kv[0]]) != kv[1] {
                return false
            }
        case strings.Contains(part, ">"):
            kv := strings.SplitN(part, ">", 2)
            n, _ := strconv.Atoi(kv[1])
            v, _ := ctx[kv[0]].(int)
            if v <= n {
                return false
            }
        }
    }
    return true
    // every new operator means another fragile branch in this one parsing function
}`,
        },
        classDiagram: {
            classes: [
                { id: 'expression', name: 'Expression', type: 'interface', members: ['+ interpret(ctx): bool'] },
                { id: 'equals', name: 'Equals', members: ['- field, value', '+ interpret(ctx): bool'] },
                { id: 'greaterthan', name: 'GreaterThan', members: ['- field, value', '+ interpret(ctx): bool'] },
                { id: 'and', name: 'And', members: ['- left, right: Expression', '+ interpret(ctx): bool'] },
            ],
            relations: [
                { from: 'equals', to: 'expression', type: 'realization' },
                { from: 'greaterthan', to: 'expression', type: 'realization' },
                { from: 'and', to: 'expression', type: 'realization' },
                { from: 'and', to: 'expression', type: 'aggregation', label: 'left / right' },
            ],
            layout: [['expression'], ['equals', 'greaterthan', 'and']],
        },
    },
};
