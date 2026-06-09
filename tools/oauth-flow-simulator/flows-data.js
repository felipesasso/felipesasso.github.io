/**
 * Step-by-step data for the OAuth 2.0 Flow Simulator.
 *
 * Each flow declares its participants (`actors`) and an ordered list of
 * `steps`. A step is an arrow from one actor to another (or a self-step
 * when `from === to`), plus everything the detail panel needs: a prose
 * description, the raw bytes on the wire, a field-by-field breakdown and
 * optional security notes. `channel` drives the front/back-channel badge.
 */
const OAUTH_FLOWS = {
    'auth-code': {
        name: 'Authorization Code',
        badge: 'Recommended',
        badgeKind: 'ok',
        summary:
            'The flow to reach for when your app has a backend. The user authenticates on the front channel (browser redirects), but the actual tokens are exchanged on the back channel — server to server — so they never touch the browser.',
        note: 'Modern guidance (OAuth 2.1, and the OAuth 2.0 Security BCP) says to pair this flow with <strong>PKCE</strong> — a one-time <code>code_challenge</code>/<code>code_verifier</code> pair — even for confidential clients. The steps below show the classic shape; PKCE just adds two extra parameters.',
        noteKind: 'info',
        actors: [
            { id: 'user', label: 'User / Browser', icon: 'user' },
            { id: 'client', label: 'Client App', sub: 'web app backend', icon: 'app' },
            { id: 'auth', label: 'Authorization Server', icon: 'shield' },
            { id: 'api', label: 'Resource Server', sub: 'API', icon: 'server' },
        ],
        steps: [
            {
                from: 'user',
                to: 'client',
                channel: 'front',
                title: 'User clicks “Sign in”',
                description:
                    'Everything starts with the user asking the client app to log them in. The client doesn’t show its own password form — instead it’s about to hand the user off to the authorization server.',
                wire: 'GET https://app.example.com/login HTTP/1.1',
            },
            {
                from: 'client',
                to: 'auth',
                channel: 'front',
                title: 'Redirect to /authorize',
                description:
                    'The client builds an authorization URL and redirects the user’s browser to it. This is the front channel: the whole request is visible in the address bar, which is exactly why it asks for a code rather than a token.',
                wireLabel: 'The redirect',
                wire: 'HTTP/1.1 302 Found\nLocation: https://auth.example.com/authorize\n    ?response_type=code\n    &client_id=web-app-123\n    &redirect_uri=https://app.example.com/callback\n    &scope=openid profile email\n    &state=xK9fQ2pL',
                params: [
                    { name: 'response_type=code', note: 'Asks for a short-lived authorization code instead of a token — the defining move of this flow.' },
                    { name: 'client_id=web-app-123', note: 'Public identifier the client got when it registered with the authorization server.' },
                    { name: 'redirect_uri=https://app.example.com/callback', note: 'Where the browser will be sent back to. Must exactly match a URI registered ahead of time — this is the main defense against the code being delivered to an attacker.' },
                    { name: 'scope=openid profile email', note: 'What the client is asking permission to access.' },
                    { name: 'state=xK9fQ2pL', note: 'Random value the client generated. It comes back in step 4 and must match — that’s the CSRF protection.' },
                ],
            },
            {
                from: 'user',
                to: 'auth',
                channel: 'front',
                title: 'User authenticates & consents',
                description:
                    'The login form belongs to the authorization server and lives on its domain. The client app never sees the user’s password — that separation is half the point of OAuth.',
                wire: 'POST https://auth.example.com/login HTTP/1.1\nContent-Type: application/x-www-form-urlencoded\n\nusername=felipe&password=••••••••',
            },
            {
                from: 'auth',
                to: 'client',
                channel: 'front',
                title: 'Redirect back with a code',
                description:
                    'The authorization server sends the browser back to the registered redirect URI, carrying a one-time authorization code in the query string. The code is deliberately low-value: if it leaks from browser history or logs, it’s useless without the client’s secret.',
                wireLabel: 'The redirect URI, filled in',
                wire: 'HTTP/1.1 302 Found\nLocation: https://app.example.com/callback\n    ?code=SplxlOBeZQQYbYS6WxSbIA\n    &state=xK9fQ2pL',
                params: [
                    { name: 'code=SplxlOBeZQQYbYS6WxSbIA', note: 'Single-use, expires in about a minute, and can only be redeemed by the client that started the flow.' },
                    { name: 'state=xK9fQ2pL', note: 'The client must check this equals the value it sent in step 2 before doing anything else.' },
                ],
            },
            {
                from: 'client',
                to: 'auth',
                channel: 'back',
                title: 'Exchange the code for tokens',
                description:
                    'Now the browser drops out of the picture. The client’s backend calls the token endpoint directly, proving its identity with its client secret and handing over the code.',
                wireLabel: 'The token request',
                wire: 'POST /token HTTP/1.1\nHost: auth.example.com\nAuthorization: Basic d2ViLWFwcC0xMjM6czNjcjN0\nContent-Type: application/x-www-form-urlencoded\n\ngrant_type=authorization_code\n&code=SplxlOBeZQQYbYS6WxSbIA\n&redirect_uri=https://app.example.com/callback',
                params: [
                    { name: 'Authorization: Basic …', note: 'client_id:client_secret, base64-encoded. This is what makes the client “confidential” — only its backend knows the secret.' },
                    { name: 'grant_type=authorization_code', note: 'Tells the token endpoint which flow is being completed.' },
                    { name: 'redirect_uri=…', note: 'Repeated and re-checked, to bind the exchange to the original authorization request.' },
                ],
            },
            {
                from: 'auth',
                to: 'client',
                channel: 'back',
                title: 'Token response',
                description:
                    'The authorization server validates the code and the client’s credentials, then returns the real prize. Because this hop is server-to-server, none of these tokens ever pass through the browser.',
                wireLabel: 'The tokens',
                wire: 'HTTP/1.1 200 OK\nContent-Type: application/json\n\n{\n    "access_token": "eyJhbGciOiJSUzI1NiIsImtpZCI6...",\n    "token_type": "Bearer",\n    "expires_in": 3600,\n    "refresh_token": "8xLOxBtZp8qV2nM4",\n    "scope": "openid profile email",\n    "id_token": "eyJhbGciOiJSUzI1NiIsInR5cCI6..."\n}',
                params: [
                    { name: 'access_token', note: 'Short-lived credential for calling the API. Often a JWT, but the client should treat it as opaque.' },
                    { name: 'refresh_token', note: 'Long-lived credential for silently getting fresh access tokens. Only safe to issue here because it stays on the server.' },
                    { name: 'id_token', note: 'OpenID Connect addition: a JWT describing who the user is, for the client itself.' },
                ],
                stepNote: { kind: 'info', text: '<strong>Why this flow wins:</strong> the access and refresh tokens travel only on this back channel — the browser saw nothing but a one-time code.' },
            },
            {
                from: 'client',
                to: 'api',
                channel: 'back',
                title: 'Call the API',
                description:
                    'The client presents the access token as a Bearer credential on every request to the resource server.',
                wire: 'GET /v1/me HTTP/1.1\nHost: api.example.com\nAuthorization: Bearer eyJhbGciOiJSUzI1NiIsImtpZCI6...',
            },
            {
                from: 'api',
                to: 'client',
                channel: 'back',
                title: 'Protected resource returned',
                description:
                    'The resource server validates the token (signature, expiry, scopes) and returns the data. When the access token expires, the client uses its refresh token to get a new one — no user interaction needed.',
                wire: 'HTTP/1.1 200 OK\nContent-Type: application/json\n\n{\n    "sub": "u_42",\n    "name": "Felipe",\n    "email": "felipe@example.com"\n}',
            },
        ],
    },

    implicit: {
        name: 'Implicit',
        badge: 'Deprecated',
        badgeKind: 'warn',
        summary:
            'The original shortcut for single-page apps: skip the code exchange entirely and have the authorization server hand the access token straight back in the redirect. Fewer round-trips — and a much bigger attack surface.',
        note: '<strong>Don’t build new apps on this flow.</strong> The OAuth 2.0 Security BCP deprecates it and OAuth 2.1 removes it outright. SPAs should use Authorization Code <strong>with PKCE</strong> instead. It’s still worth understanding — both to recognize it in old systems and to appreciate what the code exchange protects you from.',
        noteKind: 'warn',
        actors: [
            { id: 'spa', label: 'Browser + SPA', sub: 'no backend', icon: 'user' },
            { id: 'auth', label: 'Authorization Server', icon: 'shield' },
            { id: 'api', label: 'Resource Server', sub: 'API', icon: 'server' },
        ],
        steps: [
            {
                from: 'spa',
                to: 'spa',
                channel: 'device',
                title: 'User clicks “Sign in”',
                description:
                    'The client here is a single-page app running entirely in the browser. There is no backend to keep a client secret, which is the constraint this whole flow was designed around.',
            },
            {
                from: 'spa',
                to: 'auth',
                channel: 'front',
                title: 'Redirect to /authorize (response_type=token)',
                description:
                    'Same authorization endpoint as before — but one parameter changes everything. Asking for response_type=token means the access token itself will come back through the browser.',
                wireLabel: 'The redirect',
                wire: 'GET https://auth.example.com/authorize\n    ?response_type=token\n    &client_id=spa-456\n    &redirect_uri=https://spa.example.com/callback\n    &scope=profile email\n    &state=xK9fQ2pL HTTP/1.1',
                params: [
                    { name: 'response_type=token', note: 'The defining move of the implicit flow: skip the code, return the access token directly in the redirect.' },
                    { name: 'client_id=spa-456', note: 'Still required — but there is no client secret to go with it. The redirect URI is the only thing tying the response to this app.' },
                    { name: 'redirect_uri / scope / state', note: 'Work exactly as in the Authorization Code flow.' },
                ],
            },
            {
                from: 'spa',
                to: 'auth',
                channel: 'front',
                title: 'User authenticates & consents',
                description:
                    'Identical to the Authorization Code flow: the user logs in on the authorization server’s own pages and approves the requested scopes.',
                wire: 'POST https://auth.example.com/login HTTP/1.1\nContent-Type: application/x-www-form-urlencoded\n\nusername=felipe&password=••••••••',
            },
            {
                from: 'auth',
                to: 'spa',
                channel: 'front',
                title: 'Redirect back with the token in the fragment',
                description:
                    'Here’s the shortcut — and the weak spot. The access token rides back inside the URL fragment (after the #). Fragments are never sent to servers, but they sit in browser history, can leak through redirects, and are readable by any script on the page.',
                wireLabel: 'The redirect URI, filled in',
                wire: 'HTTP/1.1 302 Found\nLocation: https://spa.example.com/callback\n    #access_token=2YotnFZFEjr1zCsicMWpAA\n    &token_type=Bearer\n    &expires_in=3600\n    &state=xK9fQ2pL',
                params: [
                    { name: '#access_token=…', note: 'Note the # — the token lives in the fragment, not the query string, so at least it never reaches the callback server’s logs.' },
                    { name: 'expires_in=3600', note: 'Tokens are kept deliberately short-lived, because there is no safe way to refresh them here.' },
                    { name: '(no refresh_token)', note: 'Refresh tokens are forbidden in the implicit flow — far too dangerous to expose to the browser.' },
                ],
                stepNote: { kind: 'warn', text: '<strong>The core problem:</strong> a bearer token in a URL. Anything that can read the address bar, the history, or run JS on the page can steal it.' },
            },
            {
                from: 'spa',
                to: 'spa',
                channel: 'device',
                title: 'SPA parses the fragment',
                description:
                    'The callback page pulls the token out of window.location.hash with JavaScript and (usually) scrubs it from the URL. From this point on the token lives in browser memory.',
                wireLabel: 'In the callback page',
                wire: "const params = new URLSearchParams(\n    window.location.hash.slice(1)\n);\nconst token = params.get('access_token');\nhistory.replaceState(null, '', '/callback');",
            },
            {
                from: 'spa',
                to: 'api',
                channel: 'device',
                title: 'Call the API from the browser',
                description:
                    'The SPA attaches the token to its fetch/XHR calls. Same Bearer header as any other flow — the difference is purely in how the token got here.',
                wire: 'GET /v1/me HTTP/1.1\nHost: api.example.com\nAuthorization: Bearer 2YotnFZFEjr1zCsicMWpAA',
            },
            {
                from: 'api',
                to: 'spa',
                channel: 'device',
                title: 'Protected resource returned',
                description:
                    'The resource server validates the token and answers. When it expires, the SPA has to send the user through the redirect dance again (often hidden in an iframe) — there is no refresh token to lean on.',
                wire: 'HTTP/1.1 200 OK\nContent-Type: application/json\n\n{\n    "sub": "u_42",\n    "name": "Felipe"\n}',
            },
        ],
    },

    'client-credentials': {
        name: 'Client Credentials',
        badge: 'Machine-to-machine',
        badgeKind: 'ok',
        summary:
            'The flow for when there is no user at all — a cron job, a daemon, one backend talking to another. No browser, no redirects, no redirect URI: the client simply authenticates as itself and asks for a token.',
        note: 'The whole flow rests on the <strong>client secret</strong>, so it only belongs in environments that can actually keep one — servers, not mobile apps or SPAs. Rotate secrets, scope tokens tightly, and prefer mTLS or private_key_jwt over Basic auth where your provider supports it.',
        noteKind: 'info',
        actors: [
            { id: 'svc', label: 'Client Service', sub: 'daemon / job / backend', icon: 'app' },
            { id: 'auth', label: 'Authorization Server', icon: 'shield' },
            { id: 'api', label: 'Resource Server', sub: 'API', icon: 'server' },
        ],
        steps: [
            {
                from: 'svc',
                to: 'svc',
                channel: 'device',
                title: 'A job needs to call an API',
                description:
                    'A nightly report job (say) wakes up and needs data from another service. It acts on its own behalf — there is no user to log in, so the entire front channel disappears from the diagram.',
            },
            {
                from: 'svc',
                to: 'auth',
                channel: 'back',
                title: 'Request a token with its own credentials',
                description:
                    'One POST to the token endpoint. The service authenticates as itself — its client id and secret are the whole identity story.',
                wireLabel: 'The token request',
                wire: 'POST /token HTTP/1.1\nHost: auth.example.com\nAuthorization: Basic cmVwb3J0LWpvYjpzM2NyM3Q=\nContent-Type: application/x-www-form-urlencoded\n\ngrant_type=client_credentials\n&scope=reports:read',
                params: [
                    { name: 'grant_type=client_credentials', note: 'The defining move: no code, no user — just “give me a token for myself”.' },
                    { name: 'Authorization: Basic …', note: 'client_id:client_secret base64-encoded. There is no redirect URI anywhere in this flow — the secret is doing all the work.' },
                    { name: 'scope=reports:read', note: 'Even machines should get least-privilege tokens.' },
                ],
            },
            {
                from: 'auth',
                to: 'svc',
                channel: 'back',
                title: 'Token response',
                description:
                    'Straight back comes the access token. Notice what’s missing compared to the user flows: no refresh token (the client can just ask again with its credentials) and no id_token (there is no user identity to describe).',
                wireLabel: 'The token',
                wire: 'HTTP/1.1 200 OK\nContent-Type: application/json\n\n{\n    "access_token": "eyJhbGciOiJSUzI1NiIsImtpZCI6...",\n    "token_type": "Bearer",\n    "expires_in": 3600,\n    "scope": "reports:read"\n}',
                params: [
                    { name: 'access_token', note: 'Represents the client itself, not any user. APIs will see the client’s identity in the token’s sub/client_id claim.' },
                    { name: '(no refresh_token)', note: 'Pointless here — re-running step 2 is exactly as cheap as a refresh would be.' },
                ],
            },
            {
                from: 'svc',
                to: 'api',
                channel: 'back',
                title: 'Call the API',
                description:
                    'Business as usual: the token goes in the Bearer header.',
                wire: 'GET /v1/reports/daily HTTP/1.1\nHost: api.example.com\nAuthorization: Bearer eyJhbGciOiJSUzI1NiIsImtpZCI6...',
            },
            {
                from: 'api',
                to: 'svc',
                channel: 'back',
                title: 'Protected resource returned',
                description:
                    'The resource server checks the token and its scopes and returns the data. Four steps, zero redirects — the simplest flow in the spec.',
                wire: 'HTTP/1.1 200 OK\nContent-Type: application/json\n\n{\n    "report": "daily-summary",\n    "rows": 1284\n}',
            },
        ],
    },
};
