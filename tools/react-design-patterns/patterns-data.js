/* React Design Patterns — reference data
   Each pattern: id, name, category, complexity, whenToUse (one-liner),
   summary (intro paragraph), howItWorks (bullets), samples (labelled code
   blocks), watchOut (pitfalls). Rendered by app.js. */

const CATEGORIES = {
    'Logic Reuse': 'logic-reuse',
    'Component API': 'component-api',
    'Architecture': 'architecture',
    'State Mgmt': 'state-mgmt',
    'Data Flow': 'data-flow',
    'Error Handling': 'error-handling',
    'Forms': 'forms'
};

const PATTERNS = [
    {
        id: 'custom-hooks',
        name: 'Custom Hooks',
        category: 'Logic Reuse',
        complexity: 'Low',
        whenToUse: 'Shared stateful logic across components',
        summary:
            'A custom hook is just a function whose name starts with "use" and that calls other hooks. It lets you extract stateful logic — subscriptions, timers, fetching, form state — out of a component so any number of components can reuse it without sharing any UI. This is the default way to share logic in modern React: reach for it before render props or HOCs.',
        howItWorks: [
            'Move the useState/useEffect logic out of the component into a function named useSomething.',
            'The hook returns whatever the component needs — values, setters, handlers — as an array or object.',
            'Each component that calls the hook gets its own isolated state; hooks share logic, not state.'
        ],
        samples: [
            {
                label: 'useLocalStorage — persistent state',
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
        ]
    },
    {
        id: 'compound-components',
        name: 'Compound Components',
        category: 'Component API',
        complexity: 'Medium',
        whenToUse: 'Flexible, composable UI components',
        summary:
            'Compound components are a set of components that work together as one unit — like &lt;select&gt; and &lt;option&gt; in HTML. A parent owns the shared state and exposes it to its children implicitly through context, so consumers compose the pieces in JSX however they like instead of configuring one giant component through a wall of props.',
        howItWorks: [
            'The parent component (e.g. Tabs) holds the state and provides it via a private context.',
            'Child components (Tabs.List, Tabs.Tab, Tabs.Panel) read that context — consumers never wire them together manually.',
            'Because children are just JSX, consumers can reorder, wrap, style, or omit pieces freely.'
        ],
        samples: [
            {
                label: 'Tabs built as compound components',
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
        ]
    },
    {
        id: 'container-presentational',
        name: 'Container/Presentational',
        category: 'Architecture',
        complexity: 'Low',
        whenToUse: 'Separating data from display',
        summary:
            'Split a feature into two layers: a container that knows how to get data and handle events, and a presentational component that only knows how to render props. The presentational half stays pure — easy to test, easy to drop into Storybook, easy to reuse with a different data source. Hooks have absorbed much of this pattern, but the discipline of keeping "fetch" and "render" apart is as useful as ever.',
        howItWorks: [
            'The presentational component receives everything via props and contains no fetching or business logic.',
            'The container fetches data, holds state, and renders the presentational component.',
            'Today the "container" is often just a custom hook plus a thin wrapper component.'
        ],
        samples: [
            {
                label: 'Container fetches, presentational renders',
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
        ]
    },
    {
        id: 'render-props',
        name: 'Render Props',
        category: 'Logic Reuse',
        complexity: 'Medium',
        whenToUse: 'Dynamic rendering behavior',
        summary:
            'A render prop is a prop whose value is a function that returns JSX. The component owns some logic or state, and instead of deciding what to render, it calls your function with the data and lets you decide. It shines when the consumer must control rendering per-item or per-state — virtualized lists, downshift-style autocompletes, mouse/scroll trackers.',
        howItWorks: [
            'The component computes state (mouse position, list item, async status) and calls props.render(state) — or props.children(state).',
            'The consumer passes a function and gets full control over the output markup.',
            'Unlike a custom hook, the provider can also wrap the output in its own elements (event listeners, measuring divs).'
        ],
        samples: [
            {
                label: 'MouseTracker with a children-as-function API',
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
        ]
    },
    {
        id: 'state-reducer',
        name: 'State Reducer',
        category: 'State Mgmt',
        complexity: 'High',
        whenToUse: 'Consumer-controlled state transitions',
        summary:
            'The state reducer pattern (popularized by Kent C. Dodds in Downshift) inverts control over state updates: a hook or component manages its own state with a reducer, but lets the consumer pass their own reducer to intercept, modify, or veto any transition. It is the most powerful way to make a reusable component customizable without adding a prop for every conceivable behavior.',
        howItWorks: [
            'The component dispatches actions with semantic types ("toggle", "open", "select") to a default reducer.',
            'Consumers may pass a stateReducer(state, action) prop; it sees the default result via action.changes and returns the final state.',
            'The consumer can pass changes through untouched, tweak them, or block them — without forking the component.'
        ],
        samples: [
            {
                label: 'useToggle with consumer-overridable transitions',
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
        ]
    },
    {
        id: 'provider-pattern',
        name: 'Provider Pattern',
        category: 'Data Flow',
        complexity: 'Medium',
        whenToUse: 'Cross-tree data sharing',
        summary:
            'The provider pattern uses React context to make a value available to an entire subtree without threading it through every intermediate component (prop drilling). Pair the provider with a dedicated consumer hook that validates usage, and you get a clean, typed API for app-wide concerns: theme, auth/user, locale, feature flags.',
        howItWorks: [
            'Create a context, then a Provider component that owns the state and supplies { value, actions } to context.',
            'Expose a custom hook (useTheme, useAuth) that calls useContext and throws if no provider is found.',
            'Any descendant — five levels deep or fifty — reads the value with one hook call.'
        ],
        samples: [
            {
                label: 'ThemeProvider + useTheme',
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
        ]
    },
    {
        id: 'higher-order-components',
        name: 'Higher-Order Components',
        category: 'Logic Reuse',
        complexity: 'Medium',
        whenToUse: 'Cross-cutting concerns (auth, logging)',
        summary:
            'A higher-order component is a function that takes a component and returns a new component with extra behavior — authentication gates, logging, analytics, error wrapping. It is the decorator pattern applied to React. Hooks have replaced HOCs for most logic sharing, but HOCs still earn their place when you need to wrap rendering itself (redirects, boundaries) or augment many components uniformly.',
        howItWorks: [
            'withSomething(Component) returns a wrapper component that renders &lt;Component {...props} /&gt; plus the added behavior.',
            'The wrapper can inject props, gate rendering (return a redirect or spinner instead), or wrap the output in other elements.',
            'Compose multiple HOCs by nesting: withAuth(withLogging(Page)).'
        ],
        samples: [
            {
                label: 'withAuth — gate a page behind login',
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
        ]
    },
    {
        id: 'server-components',
        name: 'Server Components (RSC)',
        category: 'Architecture',
        complexity: 'Medium',
        whenToUse: 'Zero-JS data display, server-side fetching',
        summary:
            'React Server Components run only on the server: they can read databases, secrets, and the filesystem directly, render to a serialized tree, and ship zero JavaScript to the browser. Interactivity lives in client components ("islands") marked with "use client". The result is fast data display with a minimal bundle — the server component is the container, the client component is the interactive leaf.',
        howItWorks: [
            'Server components can be async — await the database or fetch directly in the component body, no useEffect, no loading state.',
            'They never re-render on the client and cannot use state or browser APIs.',
            '"use client" marks the boundary; server components can render client components and pass them serializable props (and children).'
        ],
        samples: [
            {
                label: 'Async server component + client island (Next.js App Router)',
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
        ]
    },
    {
        id: 'error-boundaries',
        name: 'Error Boundaries',
        category: 'Error Handling',
        complexity: 'Low',
        whenToUse: 'Graceful failure & fallback UI',
        summary:
            'An error boundary catches JavaScript errors thrown during rendering anywhere in its child tree, logs them, and shows a fallback UI instead of unmounting the whole app to a white screen. Without one, a single throwing component takes down the entire React tree. Place boundaries around independent regions — routes, widgets, sidebars — so one failure stays contained.',
        howItWorks: [
            'A class component implementing static getDerivedStateFromError (render the fallback) and componentDidCatch (log the error) becomes a boundary.',
            'Errors bubble up to the nearest boundary, like try/catch for the component tree.',
            'They do not catch errors in event handlers, async code, or SSR — handle those with try/catch.'
        ],
        samples: [
            {
                label: 'A reusable ErrorBoundary class',
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
        ]
    },
    {
        id: 'controlled-components',
        name: 'Controlled Components',
        category: 'Forms',
        complexity: 'Low',
        whenToUse: 'Predictable form state management',
        summary:
            'A controlled component is a form input whose value is driven entirely by React state: the state is the single source of truth, and every keystroke flows through setState. This makes form values predictable and instantly available for validation, formatting, conditional UI, and submission — at the cost of a render per keystroke. Uncontrolled inputs (refs / FormData) remain a fine choice for simple forms.',
        howItWorks: [
            'Bind value={state} and onChange={(e) => setState(e.target.value)} — the input displays exactly what state holds.',
            'Validation, masking, and derived UI become plain computations on state.',
            'A single state object plus a generic handleChange scales to multi-field forms.'
        ],
        samples: [
            {
                label: 'Controlled form with inline validation',
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
        ]
    }
];
