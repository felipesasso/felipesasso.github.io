/**
 * Step-by-step data for the OAuth 2.0 Flow Simulator.
 *
 * Each flow declares its participants (`actors`) and an ordered list of
 * `steps`. A step is an arrow from one actor to another (or a self-step
 * when `from === to`), plus everything the detail panel needs: a prose
 * description, the raw bytes on the wire, a field-by-field breakdown and
 * optional security notes. `channel` drives the front/back-channel badge.
 *
 * Fields suffixed with `_pt` hold the Brazilian Portuguese translation of
 * the field with the same name; `wire` blocks (raw HTTP/JSON examples) and
 * parameter `name`s are left untranslated since they're literal protocol
 * text.
 */
const OAUTH_FLOWS = {
    'auth-code': {
        name: 'Authorization Code',
        name_pt: 'Authorization Code',
        badge: 'Recommended',
        badge_pt: 'Recomendado',
        badgeKind: 'ok',
        summary:
            'The flow to reach for when your app has a backend. The user authenticates on the front channel (browser redirects), but the actual tokens are exchanged on the back channel — server to server — so they never touch the browser.',
        summary_pt:
            'O fluxo a ser usado quando seu aplicativo tem um backend. O usuário se autentica no front channel (redirecionamentos do navegador), mas a troca dos tokens em si acontece no back channel — servidor a servidor — para que eles nunca passem pelo navegador.',
        note: 'Modern guidance (OAuth 2.1, and the OAuth 2.0 Security BCP) says to pair this flow with <strong>PKCE</strong> — a one-time <code>code_challenge</code>/<code>code_verifier</code> pair — even for confidential clients. The steps below show the classic shape; PKCE just adds two extra parameters.',
        note_pt:
            'As recomendações atuais (OAuth 2.1 e o OAuth 2.0 Security BCP) dizem para combinar este fluxo com <strong>PKCE</strong> — um par <code>code_challenge</code>/<code>code_verifier</code> de uso único — mesmo para clientes confidenciais. As etapas abaixo mostram o formato clássico; o PKCE apenas adiciona dois parâmetros extras.',
        noteKind: 'info',
        actors: [
            { id: 'user', label: 'User / Browser', label_pt: 'Usuário / Navegador', icon: 'user' },
            { id: 'client', label: 'Client App', label_pt: 'Aplicativo Cliente', sub: 'web app backend', sub_pt: 'backend da aplicação web', icon: 'app' },
            { id: 'auth', label: 'Authorization Server', label_pt: 'Servidor de Autorização', icon: 'shield' },
            { id: 'api', label: 'Resource Server', label_pt: 'Servidor de Recursos', sub: 'API', sub_pt: 'API', icon: 'server' },
        ],
        steps: [
            {
                from: 'user',
                to: 'client',
                channel: 'front',
                title: 'User clicks “Sign in”',
                title_pt: 'Usuário clica em “Entrar”',
                description:
                    'Everything starts with the user asking the client app to log them in. The client doesn’t show its own password form — instead it’s about to hand the user off to the authorization server.',
                description_pt:
                    'Tudo começa com o usuário pedindo ao aplicativo cliente para fazer login. O cliente não mostra seu próprio formulário de senha — em vez disso, está prestes a redirecionar o usuário para o servidor de autorização.',
                wire: 'GET https://app.example.com/login HTTP/1.1',
            },
            {
                from: 'client',
                to: 'auth',
                channel: 'front',
                title: 'Redirect to /authorize',
                title_pt: 'Redirecionamento para /authorize',
                description:
                    'The client builds an authorization URL and redirects the user’s browser to it. This is the front channel: the whole request is visible in the address bar, which is exactly why it asks for a code rather than a token.',
                description_pt:
                    'O cliente monta uma URL de autorização e redireciona o navegador do usuário para ela. Este é o front channel: a requisição inteira fica visível na barra de endereços — e é exatamente por isso que ele pede um código em vez de um token.',
                wireLabel: 'The redirect',
                wireLabel_pt: 'O redirecionamento',
                wire: 'HTTP/1.1 302 Found\nLocation: https://auth.example.com/authorize\n    ?response_type=code\n    &client_id=web-app-123\n    &redirect_uri=https://app.example.com/callback\n    &scope=openid profile email\n    &state=xK9fQ2pL',
                params: [
                    { name: 'response_type=code', note: 'Asks for a short-lived authorization code instead of a token — the defining move of this flow.', note_pt: 'Pede um código de autorização de curta duração em vez de um token — a característica que define este fluxo.' },
                    { name: 'client_id=web-app-123', note: 'Public identifier the client got when it registered with the authorization server.', note_pt: 'Identificador público que o cliente recebeu ao se registrar no servidor de autorização.' },
                    { name: 'redirect_uri=https://app.example.com/callback', note: 'Where the browser will be sent back to. Must exactly match a URI registered ahead of time — this is the main defense against the code being delivered to an attacker.', note_pt: 'Para onde o navegador será enviado de volta. Precisa corresponder exatamente a uma URI registrada previamente — essa é a principal defesa contra o código ser entregue a um atacante.' },
                    { name: 'scope=openid profile email', note: 'What the client is asking permission to access.', note_pt: 'O que o cliente está pedindo permissão para acessar.' },
                    { name: 'state=xK9fQ2pL', note: 'Random value the client generated. It comes back in step 4 and must match — that’s the CSRF protection.', note_pt: 'Valor aleatório gerado pelo cliente. Ele volta na etapa 4 e precisa corresponder — essa é a proteção contra CSRF.' },
                ],
            },
            {
                from: 'user',
                to: 'auth',
                channel: 'front',
                title: 'User authenticates & consents',
                title_pt: 'Usuário se autentica e consente',
                description:
                    'The login form belongs to the authorization server and lives on its domain. The client app never sees the user’s password — that separation is half the point of OAuth.',
                description_pt:
                    'O formulário de login pertence ao servidor de autorização e fica no domínio dele. O aplicativo cliente nunca vê a senha do usuário — essa separação é metade do propósito do OAuth.',
                wire: 'POST https://auth.example.com/login HTTP/1.1\nContent-Type: application/x-www-form-urlencoded\n\nusername=felipe&password=••••••••',
            },
            {
                from: 'auth',
                to: 'client',
                channel: 'front',
                title: 'Redirect back with a code',
                title_pt: 'Redirecionamento de volta com um código',
                description:
                    'The authorization server sends the browser back to the registered redirect URI, carrying a one-time authorization code in the query string. The code is deliberately low-value: if it leaks from browser history or logs, it’s useless without the client’s secret.',
                description_pt:
                    'O servidor de autorização manda o navegador de volta para a redirect URI registrada, levando um código de autorização de uso único na query string. O código tem valor propositalmente baixo: se vazar pelo histórico do navegador ou por logs, é inútil sem o secret do cliente.',
                wireLabel: 'The redirect URI, filled in',
                wireLabel_pt: 'A redirect URI, preenchida',
                wire: 'HTTP/1.1 302 Found\nLocation: https://app.example.com/callback\n    ?code=SplxlOBeZQQYbYS6WxSbIA\n    &state=xK9fQ2pL',
                params: [
                    { name: 'code=SplxlOBeZQQYbYS6WxSbIA', note: 'Single-use, expires in about a minute, and can only be redeemed by the client that started the flow.', note_pt: 'Uso único, expira em cerca de um minuto, e só pode ser trocado pelo cliente que iniciou o fluxo.' },
                    { name: 'state=xK9fQ2pL', note: 'The client must check this equals the value it sent in step 2 before doing anything else.', note_pt: 'O cliente precisa verificar se este valor é igual ao que enviou na etapa 2 antes de fazer qualquer outra coisa.' },
                ],
            },
            {
                from: 'client',
                to: 'auth',
                channel: 'back',
                title: 'Exchange the code for tokens',
                title_pt: 'Troca do código por tokens',
                description:
                    'Now the browser drops out of the picture. The client’s backend calls the token endpoint directly, proving its identity with its client secret and handing over the code.',
                description_pt:
                    'Agora o navegador sai de cena. O backend do cliente chama o endpoint de token diretamente, provando sua identidade com o client secret e entregando o código.',
                wireLabel: 'The token request',
                wireLabel_pt: 'A requisição de token',
                wire: 'POST /token HTTP/1.1\nHost: auth.example.com\nAuthorization: Basic d2ViLWFwcC0xMjM6czNjcjN0\nContent-Type: application/x-www-form-urlencoded\n\ngrant_type=authorization_code\n&code=SplxlOBeZQQYbYS6WxSbIA\n&redirect_uri=https://app.example.com/callback',
                params: [
                    { name: 'Authorization: Basic …', note: 'client_id:client_secret, base64-encoded. This is what makes the client “confidential” — only its backend knows the secret.', note_pt: 'client_id:client_secret, codificado em base64. É isso que torna o cliente “confidencial” — só o backend dele conhece o secret.' },
                    { name: 'grant_type=authorization_code', note: 'Tells the token endpoint which flow is being completed.', note_pt: 'Diz ao endpoint de token qual fluxo está sendo concluído.' },
                    { name: 'redirect_uri=…', note: 'Repeated and re-checked, to bind the exchange to the original authorization request.', note_pt: 'Repetida e revalidada, para vincular esta troca à requisição de autorização original.' },
                ],
            },
            {
                from: 'auth',
                to: 'client',
                channel: 'back',
                title: 'Token response',
                title_pt: 'Resposta com os tokens',
                description:
                    'The authorization server validates the code and the client’s credentials, then returns the real prize. Because this hop is server-to-server, none of these tokens ever pass through the browser.',
                description_pt:
                    'O servidor de autorização valida o código e as credenciais do cliente, e então retorna o prêmio de verdade. Como esse passo é servidor a servidor, nenhum desses tokens passa pelo navegador.',
                wireLabel: 'The tokens',
                wireLabel_pt: 'Os tokens',
                wire: 'HTTP/1.1 200 OK\nContent-Type: application/json\n\n{\n    "access_token": "eyJhbGciOiJSUzI1NiIsImtpZCI6...",\n    "token_type": "Bearer",\n    "expires_in": 3600,\n    "refresh_token": "8xLOxBtZp8qV2nM4",\n    "scope": "openid profile email",\n    "id_token": "eyJhbGciOiJSUzI1NiIsInR5cCI6..."\n}',
                params: [
                    { name: 'access_token', note: 'Short-lived credential for calling the API. Often a JWT, but the client should treat it as opaque.', note_pt: 'Credencial de curta duração para chamar a API. Costuma ser um JWT, mas o cliente deve tratá-la como opaca.' },
                    { name: 'refresh_token', note: 'Long-lived credential for silently getting fresh access tokens. Only safe to issue here because it stays on the server.', note_pt: 'Credencial de longa duração para obter novos access tokens silenciosamente. Só é seguro emiti-la aqui porque ela permanece no servidor.' },
                    { name: 'id_token', note: 'OpenID Connect addition: a JWT describing who the user is, for the client itself.', note_pt: 'Adição do OpenID Connect: um JWT descrevendo quem é o usuário, para o próprio cliente.' },
                ],
                stepNote: { kind: 'info', text: '<strong>Why this flow wins:</strong> the access and refresh tokens travel only on this back channel — the browser saw nothing but a one-time code.', text_pt: '<strong>Por que este fluxo se destaca:</strong> os tokens de acesso e de atualização trafegam apenas por este back channel — o navegador não viu nada além de um código de uso único.' },
            },
            {
                from: 'client',
                to: 'api',
                channel: 'back',
                title: 'Call the API',
                title_pt: 'Chamada à API',
                description:
                    'The client presents the access token as a Bearer credential on every request to the resource server.',
                description_pt:
                    'O cliente apresenta o access token como uma credencial Bearer em toda requisição ao servidor de recursos.',
                wire: 'GET /v1/me HTTP/1.1\nHost: api.example.com\nAuthorization: Bearer eyJhbGciOiJSUzI1NiIsImtpZCI6...',
            },
            {
                from: 'api',
                to: 'client',
                channel: 'back',
                title: 'Protected resource returned',
                title_pt: 'Recurso protegido retornado',
                description:
                    'The resource server validates the token (signature, expiry, scopes) and returns the data. When the access token expires, the client uses its refresh token to get a new one — no user interaction needed.',
                description_pt:
                    'O servidor de recursos valida o token (assinatura, expiração, escopos) e retorna os dados. Quando o access token expira, o cliente usa o refresh token para obter um novo — sem precisar de interação do usuário.',
                wire: 'HTTP/1.1 200 OK\nContent-Type: application/json\n\n{\n    "sub": "u_42",\n    "name": "Felipe",\n    "email": "felipe@example.com"\n}',
            },
        ],
    },

    implicit: {
        name: 'Implicit',
        name_pt: 'Implicit',
        badge: 'Deprecated',
        badge_pt: 'Descontinuado',
        badgeKind: 'warn',
        summary:
            'The original shortcut for single-page apps: skip the code exchange entirely and have the authorization server hand the access token straight back in the redirect. Fewer round-trips — and a much bigger attack surface.',
        summary_pt:
            'O atalho original para single-page apps: pular completamente a troca do código e fazer o servidor de autorização devolver o access token diretamente no redirecionamento. Menos idas e voltas — e uma superfície de ataque bem maior.',
        note: '<strong>Don’t build new apps on this flow.</strong> The OAuth 2.0 Security BCP deprecates it and OAuth 2.1 removes it outright. SPAs should use Authorization Code <strong>with PKCE</strong> instead. It’s still worth understanding — both to recognize it in old systems and to appreciate what the code exchange protects you from.',
        note_pt:
            '<strong>Não construa novos aplicativos com este fluxo.</strong> O OAuth 2.0 Security BCP o descontinua e o OAuth 2.1 o remove completamente. SPAs devem usar Authorization Code <strong>com PKCE</strong> no lugar dele. Ainda vale a pena entendê-lo — tanto para reconhecê-lo em sistemas antigos quanto para perceber do que a troca de código te protege.',
        noteKind: 'warn',
        actors: [
            { id: 'spa', label: 'Browser + SPA', label_pt: 'Navegador + SPA', sub: 'no backend', sub_pt: 'sem backend', icon: 'user' },
            { id: 'auth', label: 'Authorization Server', label_pt: 'Servidor de Autorização', icon: 'shield' },
            { id: 'api', label: 'Resource Server', label_pt: 'Servidor de Recursos', sub: 'API', sub_pt: 'API', icon: 'server' },
        ],
        steps: [
            {
                from: 'spa',
                to: 'spa',
                channel: 'device',
                title: 'User clicks “Sign in”',
                title_pt: 'Usuário clica em “Entrar”',
                description:
                    'The client here is a single-page app running entirely in the browser. There is no backend to keep a client secret, which is the constraint this whole flow was designed around.',
                description_pt:
                    'O cliente aqui é uma single-page app rodando inteiramente no navegador. Não há backend para guardar um client secret, e essa é a restrição em torno da qual todo este fluxo foi desenhado.',
            },
            {
                from: 'spa',
                to: 'auth',
                channel: 'front',
                title: 'Redirect to /authorize (response_type=token)',
                title_pt: 'Redirecionamento para /authorize (response_type=token)',
                description:
                    'Same authorization endpoint as before — but one parameter changes everything. Asking for response_type=token means the access token itself will come back through the browser.',
                description_pt:
                    'O mesmo endpoint de autorização de antes — mas um parâmetro muda tudo. Pedir response_type=token significa que o próprio access token vai voltar pelo navegador.',
                wireLabel: 'The redirect',
                wireLabel_pt: 'O redirecionamento',
                wire: 'GET https://auth.example.com/authorize\n    ?response_type=token\n    &client_id=spa-456\n    &redirect_uri=https://spa.example.com/callback\n    &scope=profile email\n    &state=xK9fQ2pL HTTP/1.1',
                params: [
                    { name: 'response_type=token', note: 'The defining move of the implicit flow: skip the code, return the access token directly in the redirect.', note_pt: 'A característica que define o fluxo implícito: pular o código e devolver o access token diretamente no redirecionamento.' },
                    { name: 'client_id=spa-456', note: 'Still required — but there is no client secret to go with it. The redirect URI is the only thing tying the response to this app.', note_pt: 'Ainda é obrigatório — mas não há um client secret para acompanhá-lo. A redirect URI é a única coisa que liga a resposta a este aplicativo.' },
                    { name: 'redirect_uri / scope / state', note: 'Work exactly as in the Authorization Code flow.', note_pt: 'Funcionam exatamente como no fluxo Authorization Code.' },
                ],
            },
            {
                from: 'spa',
                to: 'auth',
                channel: 'front',
                title: 'User authenticates & consents',
                title_pt: 'Usuário se autentica e consente',
                description:
                    'Identical to the Authorization Code flow: the user logs in on the authorization server’s own pages and approves the requested scopes.',
                description_pt:
                    'Idêntico ao fluxo Authorization Code: o usuário faz login nas próprias páginas do servidor de autorização e aprova os escopos solicitados.',
                wire: 'POST https://auth.example.com/login HTTP/1.1\nContent-Type: application/x-www-form-urlencoded\n\nusername=felipe&password=••••••••',
            },
            {
                from: 'auth',
                to: 'spa',
                channel: 'front',
                title: 'Redirect back with the token in the fragment',
                title_pt: 'Redirecionamento de volta com o token no fragmento',
                description:
                    'Here’s the shortcut — and the weak spot. The access token rides back inside the URL fragment (after the #). Fragments are never sent to servers, but they sit in browser history, can leak through redirects, and are readable by any script on the page.',
                description_pt:
                    'Aqui está o atalho — e o ponto fraco. O access token volta dentro do fragmento da URL (depois do #). Fragmentos nunca são enviados a servidores, mas ficam no histórico do navegador, podem vazar por redirecionamentos e são legíveis por qualquer script na página.',
                wireLabel: 'The redirect URI, filled in',
                wireLabel_pt: 'A redirect URI, preenchida',
                wire: 'HTTP/1.1 302 Found\nLocation: https://spa.example.com/callback\n    #access_token=2YotnFZFEjr1zCsicMWpAA\n    &token_type=Bearer\n    &expires_in=3600\n    &state=xK9fQ2pL',
                params: [
                    { name: '#access_token=…', note: 'Note the # — the token lives in the fragment, not the query string, so at least it never reaches the callback server’s logs.', note_pt: 'Note o # — o token vive no fragmento, não na query string, então pelo menos nunca chega aos logs do servidor de callback.' },
                    { name: 'expires_in=3600', note: 'Tokens are kept deliberately short-lived, because there is no safe way to refresh them here.', note_pt: 'Os tokens são propositalmente de curta duração, porque não há uma forma segura de renová-los aqui.' },
                    { name: '(no refresh_token)', note: 'Refresh tokens are forbidden in the implicit flow — far too dangerous to expose to the browser.', note_pt: 'Refresh tokens são proibidos no fluxo implícito — perigoso demais para expor ao navegador.' },
                ],
                stepNote: { kind: 'warn', text: '<strong>The core problem:</strong> a bearer token in a URL. Anything that can read the address bar, the history, or run JS on the page can steal it.', text_pt: '<strong>O problema central:</strong> um bearer token dentro de uma URL. Qualquer coisa que consiga ler a barra de endereços, o histórico ou rodar JS na página pode roubá-lo.' },
            },
            {
                from: 'spa',
                to: 'spa',
                channel: 'device',
                title: 'SPA parses the fragment',
                title_pt: 'A SPA lê o fragmento',
                description:
                    'The callback page pulls the token out of window.location.hash with JavaScript and (usually) scrubs it from the URL. From this point on the token lives in browser memory.',
                description_pt:
                    'A página de callback extrai o token de window.location.hash com JavaScript e (normalmente) o remove da URL. A partir daqui o token vive na memória do navegador.',
                wireLabel: 'In the callback page',
                wireLabel_pt: 'Na página de callback',
                wire: "const params = new URLSearchParams(\n    window.location.hash.slice(1)\n);\nconst token = params.get('access_token');\nhistory.replaceState(null, '', '/callback');",
            },
            {
                from: 'spa',
                to: 'api',
                channel: 'device',
                title: 'Call the API from the browser',
                title_pt: 'Chamada à API a partir do navegador',
                description:
                    'The SPA attaches the token to its fetch/XHR calls. Same Bearer header as any other flow — the difference is purely in how the token got here.',
                description_pt:
                    'A SPA anexa o token às suas chamadas fetch/XHR. O mesmo header Bearer de qualquer outro fluxo — a diferença está só em como o token chegou até aqui.',
                wire: 'GET /v1/me HTTP/1.1\nHost: api.example.com\nAuthorization: Bearer 2YotnFZFEjr1zCsicMWpAA',
            },
            {
                from: 'api',
                to: 'spa',
                channel: 'device',
                title: 'Protected resource returned',
                title_pt: 'Recurso protegido retornado',
                description:
                    'The resource server validates the token and answers. When it expires, the SPA has to send the user through the redirect dance again (often hidden in an iframe) — there is no refresh token to lean on.',
                description_pt:
                    'O servidor de recursos valida o token e responde. Quando ele expira, a SPA precisa levar o usuário pela dança de redirecionamento de novo (geralmente escondida em um iframe) — não há refresh token para recorrer.',
                wire: 'HTTP/1.1 200 OK\nContent-Type: application/json\n\n{\n    "sub": "u_42",\n    "name": "Felipe"\n}',
            },
        ],
    },

    'client-credentials': {
        name: 'Client Credentials',
        name_pt: 'Client Credentials',
        badge: 'Machine-to-machine',
        badge_pt: 'Máquina a máquina',
        badgeKind: 'ok',
        summary:
            'The flow for when there is no user at all — a cron job, a daemon, one backend talking to another. No browser, no redirects, no redirect URI: the client simply authenticates as itself and asks for a token.',
        summary_pt:
            'O fluxo para quando não há usuário algum — um cron job, um daemon, um backend conversando com outro. Sem navegador, sem redirecionamentos, sem redirect URI: o cliente simplesmente se autentica como ele mesmo e pede um token.',
        note: 'The whole flow rests on the <strong>client secret</strong>, so it only belongs in environments that can actually keep one — servers, not mobile apps or SPAs. Rotate secrets, scope tokens tightly, and prefer mTLS or private_key_jwt over Basic auth where your provider supports it.',
        note_pt:
            'Todo o fluxo depende do <strong>client secret</strong>, então ele só faz sentido em ambientes que conseguem realmente guardar um — servidores, não apps móveis ou SPAs. Faça rotação dos secrets, restrinja bem os escopos dos tokens e prefira mTLS ou private_key_jwt em vez de Basic auth quando seu provedor suportar.',
        noteKind: 'info',
        actors: [
            { id: 'svc', label: 'Client Service', label_pt: 'Serviço Cliente', sub: 'daemon / job / backend', sub_pt: 'daemon / job / backend', icon: 'app' },
            { id: 'auth', label: 'Authorization Server', label_pt: 'Servidor de Autorização', icon: 'shield' },
            { id: 'api', label: 'Resource Server', label_pt: 'Servidor de Recursos', sub: 'API', sub_pt: 'API', icon: 'server' },
        ],
        steps: [
            {
                from: 'svc',
                to: 'svc',
                channel: 'device',
                title: 'A job needs to call an API',
                title_pt: 'Um job precisa chamar uma API',
                description:
                    'A nightly report job (say) wakes up and needs data from another service. It acts on its own behalf — there is no user to log in, so the entire front channel disappears from the diagram.',
                description_pt:
                    'Um job de relatório noturno (por exemplo) acorda e precisa de dados de outro serviço. Ele age em nome próprio — não há usuário para fazer login, então todo o front channel desaparece do diagrama.',
            },
            {
                from: 'svc',
                to: 'auth',
                channel: 'back',
                title: 'Request a token with its own credentials',
                title_pt: 'Solicita um token com as próprias credenciais',
                description:
                    'One POST to the token endpoint. The service authenticates as itself — its client id and secret are the whole identity story.',
                description_pt:
                    'Um único POST ao endpoint de token. O serviço se autentica como ele mesmo — seu client id e secret são toda a história de identidade.',
                wireLabel: 'The token request',
                wireLabel_pt: 'A requisição de token',
                wire: 'POST /token HTTP/1.1\nHost: auth.example.com\nAuthorization: Basic cmVwb3J0LWpvYjpzM2NyM3Q=\nContent-Type: application/x-www-form-urlencoded\n\ngrant_type=client_credentials\n&scope=reports:read',
                params: [
                    { name: 'grant_type=client_credentials', note: 'The defining move: no code, no user — just “give me a token for myself”.', note_pt: 'A característica que define o fluxo: sem código, sem usuário — apenas “me dê um token para mim mesmo”.' },
                    { name: 'Authorization: Basic …', note: 'client_id:client_secret base64-encoded. There is no redirect URI anywhere in this flow — the secret is doing all the work.', note_pt: 'client_id:client_secret codificado em base64. Não há redirect URI em nenhum lugar deste fluxo — o secret faz todo o trabalho.' },
                    { name: 'scope=reports:read', note: 'Even machines should get least-privilege tokens.', note_pt: 'Até máquinas devem receber tokens com privilégio mínimo.' },
                ],
            },
            {
                from: 'auth',
                to: 'svc',
                channel: 'back',
                title: 'Token response',
                title_pt: 'Resposta com o token',
                description:
                    'Straight back comes the access token. Notice what’s missing compared to the user flows: no refresh token (the client can just ask again with its credentials) and no id_token (there is no user identity to describe).',
                description_pt:
                    'O access token volta direto. Repare no que está faltando comparado aos fluxos com usuário: nenhum refresh token (o cliente pode simplesmente pedir de novo com suas credenciais) e nenhum id_token (não há identidade de usuário para descrever).',
                wireLabel: 'The token',
                wireLabel_pt: 'O token',
                wire: 'HTTP/1.1 200 OK\nContent-Type: application/json\n\n{\n    "access_token": "eyJhbGciOiJSUzI1NiIsImtpZCI6...",\n    "token_type": "Bearer",\n    "expires_in": 3600,\n    "scope": "reports:read"\n}',
                params: [
                    { name: 'access_token', note: 'Represents the client itself, not any user. APIs will see the client’s identity in the token’s sub/client_id claim.', note_pt: 'Representa o próprio cliente, não um usuário. As APIs verão a identidade do cliente na claim sub/client_id do token.' },
                    { name: '(no refresh_token)', note: 'Pointless here — re-running step 2 is exactly as cheap as a refresh would be.', note_pt: 'Inútil aqui — repetir a etapa 2 é tão barato quanto um refresh seria.' },
                ],
            },
            {
                from: 'svc',
                to: 'api',
                channel: 'back',
                title: 'Call the API',
                title_pt: 'Chamada à API',
                description:
                    'Business as usual: the token goes in the Bearer header.',
                description_pt:
                    'Como sempre: o token vai no header Bearer.',
                wire: 'GET /v1/reports/daily HTTP/1.1\nHost: api.example.com\nAuthorization: Bearer eyJhbGciOiJSUzI1NiIsImtpZCI6...',
            },
            {
                from: 'api',
                to: 'svc',
                channel: 'back',
                title: 'Protected resource returned',
                title_pt: 'Recurso protegido retornado',
                description:
                    'The resource server checks the token and its scopes and returns the data. Four steps, zero redirects — the simplest flow in the spec.',
                description_pt:
                    'O servidor de recursos verifica o token e seus escopos e retorna os dados. Quatro etapas, zero redirecionamentos — o fluxo mais simples da especificação.',
                wire: 'HTTP/1.1 200 OK\nContent-Type: application/json\n\n{\n    "report": "daily-summary",\n    "rows": 1284\n}',
            },
        ],
    },
};
