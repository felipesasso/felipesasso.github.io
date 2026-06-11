/* React Design Patterns — reference data
   Each pattern: id, name, category, complexity, whenToUse (one-liner),
   summary (intro paragraph), howItWorks (bullets), samples (labelled code
   blocks), watchOut (pitfalls). Rendered by app.js.

   Fields suffixed with `_pt` hold the Brazilian Portuguese translation of
   the field with the same name (or, for arrays, the same-index entry).
   Code samples (`samples[].code`), identifiers, JSX, prop/hook names and
   import paths are left untranslated since they're literal code. The
   `category` value itself (the key into CATEGORIES) is also left as-is —
   CATEGORIES_PT below provides its translated display label. */

const CATEGORIES = {
    'Logic Reuse': 'logic-reuse',
    'Component API': 'component-api',
    'Architecture': 'architecture',
    'State Mgmt': 'state-mgmt',
    'Data Flow': 'data-flow',
    'Error Handling': 'error-handling',
    'Forms': 'forms'
};

const CATEGORIES_PT = {
    'Logic Reuse': 'Reuso de Lógica',
    'Component API': 'API de Componentes',
    'Architecture': 'Arquitetura',
    'State Mgmt': 'Gerenciamento de State',
    'Data Flow': 'Fluxo de Dados',
    'Error Handling': 'Tratamento de Erros',
    'Forms': 'Formulários'
};

const PATTERNS = [
    {
        id: 'custom-hooks',
        name: 'Custom Hooks',
        name_pt: 'Custom Hooks',
        category: 'Logic Reuse',
        complexity: 'Low',
        whenToUse: 'Shared stateful logic across components',
        whenToUse_pt: 'Compartilhar lógica com state entre componentes',
        summary:
            'A custom hook is just a function whose name starts with "use" and that calls other hooks. It lets you extract stateful logic — subscriptions, timers, fetching, form state — out of a component so any number of components can reuse it without sharing any UI. This is the default way to share logic in modern React: reach for it before render props or HOCs.',
        summary_pt:
            'Um custom hook é apenas uma função cujo nome começa com "use" e que chama outros hooks. Ele permite extrair lógica com state — subscriptions, timers, fetching, state de formulários — de um componente, para que qualquer número de componentes possa reutilizá-la sem compartilhar nenhuma UI. Essa é a forma padrão de compartilhar lógica no React moderno: prefira essa abordagem antes de render props ou HOCs.',
        howItWorks: [
            'Move the useState/useEffect logic out of the component into a function named useSomething.',
            'The hook returns whatever the component needs — values, setters, handlers — as an array or object.',
            'Each component that calls the hook gets its own isolated state; hooks share logic, not state.'
        ],
        howItWorks_pt: [
            'Mova a lógica de useState/useEffect para fora do componente, para uma função chamada useSomething.',
            'O hook retorna o que o componente precisar — values, setters, handlers — como array ou objeto.',
            'Cada componente que chama o hook recebe seu próprio state isolado; hooks compartilham lógica, não state.'
        ],
        samples: [
            {
                label: 'useLocalStorage — persistent state',
                label_pt: 'useLocalStorage — state persistente',
                code: `import { useState, useEffect } from 'react';

function useLocalStorage(key, initialValue) {
  const [value, setValue] = useState(() => {
    try {
      const stored = window.localStorage.getItem(key);
      return stored !== null ? JSON.parse(stored) : initialValue;
    } catch {
      return initialValue;
    }
  });

  useEffect(() => {
    window.localStorage.setItem(key, JSON.stringify(value));
  }, [key, value]);

  return [value, setValue];
}

// Any component can now persist state with one line:
function ThemePicker() {
  const [theme, setTheme] = useLocalStorage('theme', 'light');

  return (
    <select value={theme} onChange={(e) => setTheme(e.target.value)}>
      <option value="light">Light</option>
      <option value="dark">Dark</option>
    </select>
  );
}`
            },
            {
                label: 'useDebouncedValue — debounce anything',
                label_pt: 'useDebouncedValue — debounce de qualquer valor',
                code: `import { useState, useEffect } from 'react';

function useDebouncedValue(value, delayMs = 300) {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delayMs);
    return () => clearTimeout(id); // cancel on change/unmount
  }, [value, delayMs]);

  return debounced;
}

function Search() {
  const [query, setQuery] = useState('');
  const debouncedQuery = useDebouncedValue(query, 400);

  // fire the request only when typing pauses
  useEffect(() => {
    if (debouncedQuery) fetch(\`/api/search?q=\${debouncedQuery}\`);
  }, [debouncedQuery]);

  return <input value={query} onChange={(e) => setQuery(e.target.value)} />;
}`
            }
        ],
        watchOut: [
            'Hooks share logic, not state — two components calling the same hook do not see each other’s values. For shared state, combine with the Provider pattern.',
            'Follow the Rules of Hooks: call them unconditionally, at the top level.',
            'Don’t extract a hook for everything — a hook used by exactly one component is often better left inline until a second consumer appears.'
        ],
        watchOut_pt: [
            'Hooks compartilham lógica, não state — dois componentes que chamam o mesmo hook não enxergam os valores um do outro. Para state compartilhado, combine com o padrão Provider.',
            'Siga as Regras dos Hooks: chame-os de forma incondicional, sempre no nível mais alto.',
            'Não extraia um hook para tudo — um hook usado por exatamente um componente costuma ser melhor mantido inline até que um segundo consumidor apareça.'
        ]
    },
    {
        id: 'compound-components',
        name: 'Compound Components',
        name_pt: 'Compound Components',
        category: 'Component API',
        complexity: 'Medium',
        whenToUse: 'Flexible, composable UI components',
        whenToUse_pt: 'Componentes de UI flexíveis e composable',
        summary:
            'Compound components are a set of components that work together as one unit — like &lt;select&gt; and &lt;option&gt; in HTML. A parent owns the shared state and exposes it to its children implicitly through context, so consumers compose the pieces in JSX however they like instead of configuring one giant component through a wall of props.',
        summary_pt:
            'Compound components são um conjunto de componentes que trabalham juntos como uma única unidade — como &lt;select&gt; e &lt;option&gt; em HTML. Um componente pai detém o state compartilhado e o expõe implicitamente aos filhos via context, de modo que quem consome possa compor as peças em JSX como quiser, em vez de configurar um componente gigante através de uma parede de props.',
        howItWorks: [
            'The parent component (e.g. Tabs) holds the state and provides it via a private context.',
            'Child components (Tabs.List, Tabs.Tab, Tabs.Panel) read that context — consumers never wire them together manually.',
            'Because children are just JSX, consumers can reorder, wrap, style, or omit pieces freely.'
        ],
        howItWorks_pt: [
            'O componente pai (ex.: Tabs) mantém o state e o disponibiliza via um context privado.',
            'Os componentes filhos (Tabs.List, Tabs.Tab, Tabs.Panel) leem esse context — quem consome nunca precisa conectá-los manualmente.',
            'Como os filhos são apenas JSX, quem consome pode reordenar, envolver, estilizar ou omitir peças livremente.'
        ],
        samples: [
            {
                label: 'Tabs built as compound components',
                label_pt: 'Tabs construído como compound components',
                code: `import { createContext, useContext, useState } from 'react';

const TabsContext = createContext(null);

function Tabs({ defaultTab, children }) {
  const [activeTab, setActiveTab] = useState(defaultTab);
  return (
    <TabsContext.Provider value={{ activeTab, setActiveTab }}>
      <div className="tabs">{children}</div>
    </TabsContext.Provider>
  );
}

function TabList({ children }) {
  return <div role="tablist">{children}</div>;
}

function Tab({ id, children }) {
  const { activeTab, setActiveTab } = useContext(TabsContext);
  return (
    <button
      role="tab"
      aria-selected={activeTab === id}
      onClick={() => setActiveTab(id)}
    >
      {children}
    </button>
  );
}

function TabPanel({ id, children }) {
  const { activeTab } = useContext(TabsContext);
  return activeTab === id ? <div role="tabpanel">{children}</div> : null;
}

Tabs.List = TabList;
Tabs.Tab = Tab;
Tabs.Panel = TabPanel;

// Consumers compose the pieces — no prop drilling, no config object:
function Settings() {
  return (
    <Tabs defaultTab="profile">
      <Tabs.List>
        <Tabs.Tab id="profile">Profile</Tabs.Tab>
        <Tabs.Tab id="billing">Billing</Tabs.Tab>
      </Tabs.List>
      <Tabs.Panel id="profile">Profile form…</Tabs.Panel>
      <Tabs.Panel id="billing">Billing details…</Tabs.Panel>
    </Tabs>
  );
}`
            }
        ],
        watchOut: [
            'Throw a helpful error when a child is used outside its parent (context is null) — silent failures are confusing.',
            'Avoid React.Children.map / cloneElement to inject props; context survives intermediate wrapper elements, cloneElement does not.',
            'Great for design-system components (menus, accordions, tables); overkill for components with one fixed layout.'
        ],
        watchOut_pt: [
            'Lance um erro útil quando um filho for usado fora do pai (context é null) — falhas silenciosas confundem.',
            'Evite React.Children.map / cloneElement para injetar props; o context sobrevive a elementos wrapper intermediários, cloneElement não.',
            'Ótimo para componentes de design system (menus, accordions, tabelas); exagero para componentes com um layout fixo único.'
        ]
    },
    {
        id: 'container-presentational',
        name: 'Container/Presentational',
        name_pt: 'Container/Presentational',
        category: 'Architecture',
        complexity: 'Low',
        whenToUse: 'Separating data from display',
        whenToUse_pt: 'Separar dados da exibição',
        summary:
            'Split a feature into two layers: a container that knows how to get data and handle events, and a presentational component that only knows how to render props. The presentational half stays pure — easy to test, easy to drop into Storybook, easy to reuse with a different data source. Hooks have absorbed much of this pattern, but the discipline of keeping "fetch" and "render" apart is as useful as ever.',
        summary_pt:
            'Divida uma feature em duas camadas: um container que sabe buscar dados e lidar com eventos, e um componente presentational que só sabe renderizar a partir de props. A metade presentational permanece pura — fácil de testar, fácil de colocar no Storybook, fácil de reutilizar com outra fonte de dados. Os hooks absorveram boa parte desse padrão, mas a disciplina de manter "fetch" e "render" separados continua tão útil quanto sempre.',
        howItWorks: [
            'The presentational component receives everything via props and contains no fetching or business logic.',
            'The container fetches data, holds state, and renders the presentational component.',
            'Today the "container" is often just a custom hook plus a thin wrapper component.'
        ],
        howItWorks_pt: [
            'O componente presentational recebe tudo via props e não contém lógica de fetching ou de negócio.',
            'O container busca os dados, mantém o state e renderiza o componente presentational.',
            'Hoje o "container" costuma ser apenas um custom hook mais um componente wrapper simples.'
        ],
        samples: [
            {
                label: 'Container fetches, presentational renders',
                label_pt: 'Container busca os dados, presentational renderiza',
                code: `// Presentational: pure, prop-driven, trivially testable
function UserList({ users, onSelect }) {
  if (users.length === 0) return <p>No users found.</p>;
  return (
    <ul>
      {users.map((user) => (
        <li key={user.id}>
          <button onClick={() => onSelect(user)}>{user.name}</button>
        </li>
      ))}
    </ul>
  );
}

// Container: owns data fetching and state
import { useEffect, useState } from 'react';

function UserListContainer() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    fetch('/api/users')
      .then((r) => r.json())
      .then((data) => {
        if (!cancelled) setUsers(data);
      })
      .finally(() => !cancelled && setLoading(false));
    return () => { cancelled = true; };
  }, []);

  if (loading) return <Spinner />;
  return <UserList users={users} onSelect={(u) => console.log(u)} />;
}`
            }
        ],
        watchOut: [
            'Don’t create a container for every component — apply the split where the same UI needs different data sources, or where testing the pure half matters.',
            'A custom hook (useUsers) often replaces the container class entirely; the spirit of the pattern survives as "keep components that render dumb".',
            'Server Components are the modern evolution: the server component is the container, the client component is presentational.'
        ],
        watchOut_pt: [
            'Não crie um container para cada componente — aplique a divisão onde a mesma UI precisa de fontes de dados diferentes, ou onde testar a metade pura importa.',
            'Um custom hook (useUsers) costuma substituir totalmente a classe container; o espírito do padrão sobrevive como "mantenha os componentes de renderização burros".',
            'Server Components são a evolução moderna: o server component é o container, o client component é o presentational.'
        ]
    },
    {
        id: 'render-props',
        name: 'Render Props',
        name_pt: 'Render Props',
        category: 'Logic Reuse',
        complexity: 'Medium',
        whenToUse: 'Dynamic rendering behavior',
        whenToUse_pt: 'Comportamento de renderização dinâmico',
        summary:
            'A render prop is a prop whose value is a function that returns JSX. The component owns some logic or state, and instead of deciding what to render, it calls your function with the data and lets you decide. It shines when the consumer must control rendering per-item or per-state — virtualized lists, downshift-style autocompletes, mouse/scroll trackers.',
        summary_pt:
            'Uma render prop é uma prop cujo valor é uma função que retorna JSX. O componente possui alguma lógica ou state e, em vez de decidir o que renderizar, chama sua função com os dados e deixa você decidir. Brilha quando quem consome precisa controlar a renderização por item ou por state — listas virtualizadas, autocompletes no estilo downshift, rastreadores de mouse/scroll.',
        howItWorks: [
            'The component computes state (mouse position, list item, async status) and calls props.render(state) — or props.children(state).',
            'The consumer passes a function and gets full control over the output markup.',
            'Unlike a custom hook, the provider can also wrap the output in its own elements (event listeners, measuring divs).'
        ],
        howItWorks_pt: [
            'O componente calcula o state (posição do mouse, item da lista, status assíncrono) e chama props.render(state) — ou props.children(state).',
            'Quem consome passa uma função e tem controle total sobre o markup de saída.',
            'Diferente de um custom hook, o provedor também pode envolver a saída em seus próprios elementos (event listeners, divs de medição).'
        ],
        samples: [
            {
                label: 'MouseTracker with a children-as-function API',
                label_pt: 'MouseTracker com uma API children-as-function',
                code: `import { useState } from 'react';

function MouseTracker({ children }) {
  const [pos, setPos] = useState({ x: 0, y: 0 });

  return (
    <div
      style={{ height: '100%' }}
      onMouseMove={(e) => setPos({ x: e.clientX, y: e.clientY })}
    >
      {children(pos)} {/* consumer decides what to render */}
    </div>
  );
}

// Two totally different UIs, one piece of logic:
function App() {
  return (
    <MouseTracker>
      {({ x, y }) => (
        <p>
          Cursor at {x}, {y}
        </p>
      )}
    </MouseTracker>
  );
}`
            },
            {
                label: 'List that delegates item rendering',
                label_pt: 'List que delega a renderização dos itens',
                code: `function List({ items, renderItem, renderEmpty }) {
  if (items.length === 0) return renderEmpty ? renderEmpty() : null;
  return <ul>{items.map((item, i) => <li key={item.id ?? i}>{renderItem(item)}</li>)}</ul>;
}

function Products({ products }) {
  return (
    <List
      items={products}
      renderEmpty={() => <p>Nothing in stock.</p>}
      renderItem={(p) => (
        <>
          <strong>{p.name}</strong> — \${p.price}
        </>
      )}
    />
  );
}`
            }
        ],
        watchOut: [
            'For pure logic sharing (no wrapping markup), a custom hook is simpler — render props earn their keep when the component contributes DOM or layout.',
            'Inline render functions create a new function each render; that’s usually fine, but memoized children will re-render unless you stabilize the function.',
            'Deeply nested render props ("callback pyramid") hurt readability — flatten with hooks where possible.'
        ],
        watchOut_pt: [
            'Para compartilhar lógica pura (sem markup envolvido), um custom hook é mais simples — render props valem a pena quando o componente contribui com DOM ou layout.',
            'Funções de renderização inline criam uma nova função a cada render; geralmente tudo bem, mas filhos memoizados vão re-renderizar a menos que você estabilize a função.',
            'Render props profundamente aninhadas ("pirâmide de callbacks") prejudicam a legibilidade — achate com hooks sempre que possível.'
        ]
    },
    {
        id: 'state-reducer',
        name: 'State Reducer',
        name_pt: 'State Reducer',
        category: 'State Mgmt',
        complexity: 'High',
        whenToUse: 'Consumer-controlled state transitions',
        whenToUse_pt: 'Transições de state controladas por quem consome',
        summary:
            'The state reducer pattern (popularized by Kent C. Dodds in Downshift) inverts control over state updates: a hook or component manages its own state with a reducer, but lets the consumer pass their own reducer to intercept, modify, or veto any transition. It is the most powerful way to make a reusable component customizable without adding a prop for every conceivable behavior.',
        summary_pt:
            'O padrão state reducer (popularizado por Kent C. Dodds no Downshift) inverte o controle sobre as atualizações de state: um hook ou componente gerencia seu próprio state com um reducer, mas permite que quem consome passe seu próprio reducer para interceptar, modificar ou vetar qualquer transição. É a forma mais poderosa de tornar um componente reutilizável customizável sem adicionar uma prop para cada comportamento concebível.',
        howItWorks: [
            'The component dispatches actions with semantic types ("toggle", "open", "select") to a default reducer.',
            'Consumers may pass a stateReducer(state, action) prop; it sees the default result via action.changes and returns the final state.',
            'The consumer can pass changes through untouched, tweak them, or block them — without forking the component.'
        ],
        howItWorks_pt: [
            'O componente despacha actions com tipos semânticos ("toggle", "open", "select") para um reducer padrão.',
            'Quem consome pode passar uma prop stateReducer(state, action); ela vê o resultado padrão via action.changes e retorna o state final.',
            'Quem consome pode repassar as mudanças sem alterá-las, ajustá-las ou bloqueá-las — sem precisar fazer fork do componente.'
        ],
        samples: [
            {
                label: 'useToggle with consumer-overridable transitions',
                label_pt: 'useToggle com transições sobrescrevíveis por quem consome',
                code: `import { useReducer } from 'react';

const actionTypes = { toggle: 'toggle', reset: 'reset' };

function defaultReducer(state, action) {
  switch (action.type) {
    case actionTypes.toggle:
      return { on: !state.on };
    case actionTypes.reset:
      return { on: false };
    default:
      throw new Error(\`Unhandled type: \${action.type}\`);
  }
}

function useToggle({ reducer = defaultReducer } = {}) {
  const [state, dispatch] = useReducer(reducer, { on: false });
  const toggle = () => dispatch({ type: actionTypes.toggle });
  const reset = () => dispatch({ type: actionTypes.reset });
  return { on: state.on, toggle, reset };
}

// Consumer: allow at most 4 toggles, without touching useToggle's code.
function ClickLimiter() {
  const [clicks, setClicks] = useState(0);
  const tooMany = clicks >= 4;

  const { on, toggle, reset } = useToggle({
    reducer(state, action) {
      const changes = defaultReducer(state, action); // what would happen
      if (action.type === actionTypes.toggle && tooMany) {
        return state; // veto the transition
      }
      return changes; // accept the default
    }
  });

  return (
    <>
      <Switch on={on} onClick={() => { toggle(); setClicks(c => c + 1); }} />
      {tooMany && <button onClick={() => { reset(); setClicks(0); }}>Reset</button>}
    </>
  );
}`
            }
        ],
        watchOut: [
            'Export the default reducer and action types — consumers need them to delegate to the default behavior.',
            'Keep action types semantic ("selectItem", not "setState") so consumer reducers can target specific transitions.',
            'This is library-author territory: for app code, plain useReducer or lifted state is almost always enough.'
        ],
        watchOut_pt: [
            'Exporte o reducer padrão e os tipos de actions — quem consome precisa deles para delegar ao comportamento padrão.',
            'Mantenha os tipos de actions semânticos ("selectItem", não "setState") para que reducers de quem consome possam atingir transições específicas.',
            'Este é território de autores de bibliotecas: para código de aplicação, um useReducer simples ou state elevado quase sempre é suficiente.'
        ]
    },
    {
        id: 'provider-pattern',
        name: 'Provider Pattern',
        name_pt: 'Provider Pattern',
        category: 'Data Flow',
        complexity: 'Medium',
        whenToUse: 'Cross-tree data sharing',
        whenToUse_pt: 'Compartilhamento de dados entre a árvore de componentes',
        summary:
            'The provider pattern uses React context to make a value available to an entire subtree without threading it through every intermediate component (prop drilling). Pair the provider with a dedicated consumer hook that validates usage, and you get a clean, typed API for app-wide concerns: theme, auth/user, locale, feature flags.',
        summary_pt:
            'O padrão provider usa o context do React para disponibilizar um valor para toda uma subárvore sem precisar passá-lo por cada componente intermediário (prop drilling). Combine o provider com um hook consumidor dedicado que valida o uso, e você terá uma API limpa e tipada para preocupações globais da aplicação: tema, autenticação/usuário, locale, feature flags.',
        howItWorks: [
            'Create a context, then a Provider component that owns the state and supplies { value, actions } to context.',
            'Expose a custom hook (useTheme, useAuth) that calls useContext and throws if no provider is found.',
            'Any descendant — five levels deep or fifty — reads the value with one hook call.'
        ],
        howItWorks_pt: [
            'Crie um context e, em seguida, um componente Provider que detém o state e fornece { value, actions } ao context.',
            'Exponha um custom hook (useTheme, useAuth) que chama useContext e lança um erro caso nenhum provider seja encontrado.',
            'Qualquer descendente — cinco ou cinquenta níveis abaixo — lê o valor com uma única chamada de hook.'
        ],
        samples: [
            {
                label: 'ThemeProvider + useTheme',
                label_pt: 'ThemeProvider + useTheme',
                code: `import { createContext, useContext, useMemo, useState } from 'react';

const ThemeContext = createContext(null);

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState('light');

  // memoize so consumers don't re-render on unrelated Provider renders
  const value = useMemo(
    () => ({
      theme,
      toggle: () => setTheme((t) => (t === 'light' ? 'dark' : 'light'))
    }),
    [theme]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within <ThemeProvider>');
  return ctx;
}

// Anywhere in the tree:
function ThemeToggle() {
  const { theme, toggle } = useTheme();
  return <button onClick={toggle}>Switch to {theme === 'light' ? 'dark' : 'light'}</button>;
}`
            }
        ],
        watchOut: [
            'Every consumer re-renders when the context value changes — keep contexts small and split fast-changing values into their own context.',
            'Always memoize the value object; a fresh object each render re-renders every consumer.',
            'Context is dependency injection, not a state manager — for complex, frequently-updated global state consider Zustand, Jotai, or Redux.'
        ],
        watchOut_pt: [
            'Todo consumidor re-renderiza quando o valor do context muda — mantenha contexts pequenos e divida valores que mudam com frequência em contexts separados.',
            'Sempre memoize o objeto value; um objeto novo a cada render re-renderiza todos os consumidores.',
            'Context é injeção de dependência, não um gerenciador de state — para state global complexo e atualizado com frequência, considere Zustand, Jotai ou Redux.'
        ]
    },
    {
        id: 'higher-order-components',
        name: 'Higher-Order Components',
        name_pt: 'Higher-Order Components',
        category: 'Logic Reuse',
        complexity: 'Medium',
        whenToUse: 'Cross-cutting concerns (auth, logging)',
        whenToUse_pt: 'Preocupações transversais (autenticação, logging)',
        summary:
            'A higher-order component is a function that takes a component and returns a new component with extra behavior — authentication gates, logging, analytics, error wrapping. It is the decorator pattern applied to React. Hooks have replaced HOCs for most logic sharing, but HOCs still earn their place when you need to wrap rendering itself (redirects, boundaries) or augment many components uniformly.',
        summary_pt:
            'Um higher-order component é uma função que recebe um componente e retorna um novo componente com comportamento extra — gates de autenticação, logging, analytics, tratamento de erros. É o padrão decorator aplicado ao React. Os hooks substituíram os HOCs na maior parte do compartilhamento de lógica, mas HOCs ainda valem a pena quando é preciso envolver a própria renderização (redirects, boundaries) ou aumentar muitos componentes de forma uniforme.',
        howItWorks: [
            'withSomething(Component) returns a wrapper component that renders &lt;Component {...props} /&gt; plus the added behavior.',
            'The wrapper can inject props, gate rendering (return a redirect or spinner instead), or wrap the output in other elements.',
            'Compose multiple HOCs by nesting: withAuth(withLogging(Page)).'
        ],
        howItWorks_pt: [
            'withSomething(Component) retorna um componente wrapper que renderiza &lt;Component {...props} /&gt; mais o comportamento adicionado.',
            'O wrapper pode injetar props, controlar a renderização (retornar um redirect ou spinner em vez disso), ou envolver a saída em outros elementos.',
            'Componha múltiplos HOCs aninhando-os: withAuth(withLogging(Page)).'
        ],
        samples: [
            {
                label: 'withAuth — gate a page behind login',
                label_pt: 'withAuth — protege uma página atrás do login',
                code: `import { Navigate } from 'react-router-dom';
import { useAuth } from './auth';

function withAuth(Component) {
  function AuthenticatedComponent(props) {
    const { user, loading } = useAuth();

    if (loading) return <Spinner />;
    if (!user) return <Navigate to="/login" replace />;

    return <Component {...props} user={user} />;
  }

  // keep a useful name in React DevTools
  AuthenticatedComponent.displayName =
    \`withAuth(\${Component.displayName || Component.name || 'Component'})\`;

  return AuthenticatedComponent;
}

// Usage — any page becomes auth-gated in one line:
const Dashboard = withAuth(function Dashboard({ user }) {
  return <h1>Welcome back, {user.name}</h1>;
});`
            }
        ],
        watchOut: [
            'Always spread {...props} through, set displayName, and hoist statics if the wrapped component has them — half-wrapped HOCs cause subtle bugs.',
            'Never call an HOC inside render (const Wrapped = withAuth(X) inside a component) — it remounts the subtree on every render.',
            'Prefer a hook when you only need logic; prefer an HOC when you need to replace or wrap what gets rendered.'
        ],
        watchOut_pt: [
            'Sempre repasse {...props}, defina displayName, e faça hoist de statics se o componente envolvido os tiver — HOCs mal embrulhados causam bugs sutis.',
            'Nunca chame um HOC dentro do render (const Wrapped = withAuth(X) dentro de um componente) — isso remonta a subárvore a cada render.',
            'Prefira um hook quando você só precisa de lógica; prefira um HOC quando precisa substituir ou envolver o que é renderizado.'
        ]
    },
    {
        id: 'server-components',
        name: 'Server Components (RSC)',
        name_pt: 'Server Components (RSC)',
        category: 'Architecture',
        complexity: 'Medium',
        whenToUse: 'Zero-JS data display, server-side fetching',
        whenToUse_pt: 'Exibição de dados sem JS no cliente, fetching no servidor',
        summary:
            'React Server Components run only on the server: they can read databases, secrets, and the filesystem directly, render to a serialized tree, and ship zero JavaScript to the browser. Interactivity lives in client components ("islands") marked with "use client". The result is fast data display with a minimal bundle — the server component is the container, the client component is the interactive leaf.',
        summary_pt:
            'React Server Components rodam apenas no servidor: podem ler bancos de dados, segredos e o sistema de arquivos diretamente, renderizar para uma árvore serializada e não enviar nenhum JavaScript ao navegador. A interatividade fica em client components ("islands") marcados com "use client". O resultado é exibição de dados rápida com um bundle mínimo — o server component é o container, o client component é a folha interativa.',
        howItWorks: [
            'Server components can be async — await the database or fetch directly in the component body, no useEffect, no loading state.',
            'They never re-render on the client and cannot use state or browser APIs.',
            '"use client" marks the boundary; server components can render client components and pass them serializable props (and children).'
        ],
        howItWorks_pt: [
            'Server components podem ser async — use await direto no corpo do componente para acessar o banco de dados ou fazer fetch, sem useEffect, sem loading state.',
            'Eles nunca re-renderizam no cliente e não podem usar state ou APIs do navegador.',
            '"use client" marca a fronteira; server components podem renderizar client components e passar a eles props serializáveis (e children).'
        ],
        samples: [
            {
                label: 'Async server component + client island (Next.js App Router)',
                label_pt: 'Server component async + client island (Next.js App Router)',
                code: `// app/products/page.jsx — Server Component (default, no directive)
import { db } from '@/lib/db';
import AddToCartButton from './AddToCartButton';

export default async function ProductsPage() {
  // Direct data access — no API route, no useEffect, 0 KB of JS shipped
  const products = await db.product.findMany({ orderBy: { name: 'asc' } });

  return (
    <ul>
      {products.map((p) => (
        <li key={p.id}>
          <h2>{p.name}</h2>
          <p>\${p.price}</p>
          {/* interactivity is an island, hydrated on the client */}
          <AddToCartButton productId={p.id} />
        </li>
      ))}
    </ul>
  );
}

// app/products/AddToCartButton.jsx — Client Component
'use client';

import { useState } from 'react';

export default function AddToCartButton({ productId }) {
  const [added, setAdded] = useState(false);

  async function add() {
    await fetch('/api/cart', {
      method: 'POST',
      body: JSON.stringify({ productId })
    });
    setAdded(true);
  }

  return <button onClick={add}>{added ? 'Added ✓' : 'Add to cart'}</button>;
}`
            }
        ],
        watchOut: [
            'Props crossing the server→client boundary must be serializable — no functions, class instances, or Dates without care.',
            '"use client" marks a boundary, not a single file: everything that module imports becomes client code too. Keep islands small and push them to the leaves.',
            'RSC requires a framework runtime (Next.js App Router, React Router v7, Waku) — it is not a drop-in for a Vite SPA.'
        ],
        watchOut_pt: [
            'Props que cruzam a fronteira servidor→cliente precisam ser serializáveis — nada de funções, instâncias de classe ou Dates sem cuidado.',
            '"use client" marca uma fronteira, não um arquivo isolado: tudo que esse módulo importar também vira código de cliente. Mantenha as islands pequenas e empurre-as para as folhas.',
            'RSC requer um runtime de framework (Next.js App Router, React Router v7, Waku) — não é algo para simplesmente plugar em uma SPA Vite.'
        ]
    },
    {
        id: 'error-boundaries',
        name: 'Error Boundaries',
        name_pt: 'Error Boundaries',
        category: 'Error Handling',
        complexity: 'Low',
        whenToUse: 'Graceful failure & fallback UI',
        whenToUse_pt: 'Falha graciosa e UI de fallback',
        summary:
            'An error boundary catches JavaScript errors thrown during rendering anywhere in its child tree, logs them, and shows a fallback UI instead of unmounting the whole app to a white screen. Without one, a single throwing component takes down the entire React tree. Place boundaries around independent regions — routes, widgets, sidebars — so one failure stays contained.',
        summary_pt:
            'Um error boundary captura erros JavaScript lançados durante a renderização em qualquer lugar da sua árvore de filhos, os registra, e mostra uma UI de fallback em vez de desmontar a aplicação inteira para uma tela branca. Sem um, um único componente que lança erro derruba toda a árvore React. Posicione boundaries ao redor de regiões independentes — rotas, widgets, sidebars — para que uma falha fique contida.',
        howItWorks: [
            'A class component implementing static getDerivedStateFromError (render the fallback) and componentDidCatch (log the error) becomes a boundary.',
            'Errors bubble up to the nearest boundary, like try/catch for the component tree.',
            'They do not catch errors in event handlers, async code, or SSR — handle those with try/catch.'
        ],
        howItWorks_pt: [
            'Um componente de classe que implementa static getDerivedStateFromError (renderiza o fallback) e componentDidCatch (registra o erro) se torna um boundary.',
            'Os erros sobem até o boundary mais próximo, como um try/catch para a árvore de componentes.',
            'Eles não capturam erros em event handlers, código assíncrono ou SSR — trate esses casos com try/catch.'
        ],
        samples: [
            {
                label: 'A reusable ErrorBoundary class',
                label_pt: 'Uma classe ErrorBoundary reutilizável',
                code: `import { Component } from 'react';

class ErrorBoundary extends Component {
  state = { error: null };

  static getDerivedStateFromError(error) {
    return { error }; // switch to fallback UI on next render
  }

  componentDidCatch(error, info) {
    reportToService(error, info.componentStack); // e.g. Sentry
  }

  render() {
    if (this.state.error) {
      return this.props.fallback ?? (
        <div role="alert">
          <p>Something went wrong here.</p>
          <button onClick={() => this.setState({ error: null })}>
            Try again
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

// Contain failures per-region, not just app-wide:
function Dashboard() {
  return (
    <>
      <ErrorBoundary fallback={<p>Chart unavailable.</p>}>
        <RevenueChart />
      </ErrorBoundary>
      <ErrorBoundary fallback={<p>Feed unavailable.</p>}>
        <ActivityFeed />
      </ErrorBoundary>
    </>
  );
}`
            },
            {
                label: 'With react-error-boundary (hooks-friendly)',
                label_pt: 'Com react-error-boundary (amigável a hooks)',
                code: `import { ErrorBoundary } from 'react-error-boundary';

function Fallback({ error, resetErrorBoundary }) {
  return (
    <div role="alert">
      <pre>{error.message}</pre>
      <button onClick={resetErrorBoundary}>Retry</button>
    </div>
  );
}

function App() {
  return (
    <ErrorBoundary
      FallbackComponent={Fallback}
      onError={(error, info) => reportToService(error, info)}
      onReset={() => {/* clear whatever state caused the crash */}}
    >
      <Profile />
    </ErrorBoundary>
  );
}`
            }
        ],
        watchOut: [
            'Boundaries must be class components (or use the react-error-boundary package) — there is no hook equivalent yet.',
            'Event-handler and async errors are not caught; only errors thrown during render, lifecycle, and constructors.',
            'One global boundary is a floor, not a strategy — granular boundaries keep the rest of the page usable.'
        ],
        watchOut_pt: [
            'Boundaries precisam ser componentes de classe (ou usar o pacote react-error-boundary) — ainda não existe equivalente em hook.',
            'Erros em event handlers e código assíncrono não são capturados; apenas erros lançados durante render, lifecycle e constructors.',
            'Um boundary global é um piso, não uma estratégia — boundaries granulares mantêm o restante da página utilizável.'
        ]
    },
    {
        id: 'controlled-components',
        name: 'Controlled Components',
        name_pt: 'Controlled Components',
        category: 'Forms',
        complexity: 'Low',
        whenToUse: 'Predictable form state management',
        whenToUse_pt: 'Gerenciamento previsível de state de formulários',
        summary:
            'A controlled component is a form input whose value is driven entirely by React state: the state is the single source of truth, and every keystroke flows through setState. This makes form values predictable and instantly available for validation, formatting, conditional UI, and submission — at the cost of a render per keystroke. Uncontrolled inputs (refs / FormData) remain a fine choice for simple forms.',
        summary_pt:
            'Um controlled component é um input de formulário cujo valor é totalmente controlado pelo state do React: o state é a única fonte de verdade, e cada tecla digitada passa por setState. Isso torna os valores do formulário previsíveis e disponíveis instantaneamente para validação, formatação, UI condicional e envio — ao custo de um render por tecla. Inputs não controlados (refs / FormData) continuam sendo uma boa escolha para formulários simples.',
        howItWorks: [
            'Bind value={state} and onChange={(e) => setState(e.target.value)} — the input displays exactly what state holds.',
            'Validation, masking, and derived UI become plain computations on state.',
            'A single state object plus a generic handleChange scales to multi-field forms.'
        ],
        howItWorks_pt: [
            'Vincule value={state} e onChange={(e) => setState(e.target.value)} — o input exibe exatamente o que o state contém.',
            'Validação, máscaras e UI derivada viram simples cálculos sobre o state.',
            'Um único objeto de state mais um handleChange genérico escala para formulários com múltiplos campos.'
        ],
        samples: [
            {
                label: 'Controlled form with inline validation',
                label_pt: 'Formulário controlado com validação inline',
                code: `import { useState } from 'react';

function SignupForm() {
  const [form, setForm] = useState({ email: '', password: '' });

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  // validation is just a computation over state
  const emailValid = /^[^@\\s]+@[^@\\s]+\\.[^@\\s]+$/.test(form.email);
  const passwordValid = form.password.length >= 8;
  const canSubmit = emailValid && passwordValid;

  function handleSubmit(e) {
    e.preventDefault();
    submitSignup(form);
  }

  return (
    <form onSubmit={handleSubmit}>
      <input
        name="email"
        type="email"
        value={form.email}
        onChange={handleChange}
        aria-invalid={form.email !== '' && !emailValid}
      />
      {form.email && !emailValid && <p>Enter a valid email.</p>}

      <input
        name="password"
        type="password"
        value={form.password}
        onChange={handleChange}
      />
      {form.password && !passwordValid && <p>At least 8 characters.</p>}

      <button type="submit" disabled={!canSubmit}>Sign up</button>
    </form>
  );
}`
            },
            {
                label: 'Contrast: uncontrolled with FormData',
                label_pt: 'Em contraste: não controlado com FormData',
                code: `// Uncontrolled — the DOM owns the value; read it on submit.
// Fine when you don't need per-keystroke logic.
function ContactForm() {
  function handleSubmit(e) {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    sendMessage({ email: data.get('email'), message: data.get('message') });
  }

  return (
    <form onSubmit={handleSubmit}>
      <input name="email" type="email" defaultValue="" required />
      <textarea name="message" required />
      <button type="submit">Send</button>
    </form>
  );
}`
            }
        ],
        watchOut: [
            'Never mix modes: passing value without onChange freezes the input; switching between undefined and a string triggers the controlled/uncontrolled warning.',
            'Initialize state to \'\' (empty string), not undefined/null.',
            'Large forms re-render on every keystroke — for big or performance-sensitive forms, libraries like React Hook Form use uncontrolled inputs under the hood.'
        ],
        watchOut_pt: [
            'Nunca misture os modos: passar value sem onChange congela o input; alternar entre undefined e uma string dispara o aviso de controlled/uncontrolled.',
            'Inicialize o state com \'\' (string vazia), não undefined/null.',
            'Formulários grandes re-renderizam a cada tecla — para formulários grandes ou sensíveis a performance, bibliotecas como React Hook Form usam inputs não controlados por baixo dos panos.'
        ]
    }
];
