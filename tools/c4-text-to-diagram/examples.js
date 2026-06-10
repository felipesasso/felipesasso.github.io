/**
 * Starter snippets for the C4 Text-to-Diagram tool, loosely adapted from the
 * canonical "Internet Banking System" example used throughout C4 model docs.
 */
(function (global) {
    global.C4_EXAMPLES = [
        {
            id: 'context',
            label: 'System Context',
            label_pt: 'Contexto do Sistema',
            source: `title "Internet Banking System — System Context"

person Customer "Customer" "A customer of the bank, with personal accounts."
system InternetBanking "Internet Banking System" "Lets customers check balances and make payments."
system_ext Mainframe "Mainframe Banking System" "Stores all core banking information."
system_ext Email "E-mail System" "The bank's internal Microsoft Exchange system."

Customer -> InternetBanking "Views balances and makes payments using"
InternetBanking -> Mainframe "Gets account data from, and posts payments via"
InternetBanking -> Email "Sends e-mail using"
Email -> Customer "Sends e-mails to"`,
            source_pt: `title "Internet Banking System — Contexto do Sistema"

person Customer "Cliente" "Um cliente do banco, com contas pessoais."
system InternetBanking "Internet Banking System" "Permite que os clientes consultem saldos e façam pagamentos."
system_ext Mainframe "Mainframe Banking System" "Armazena todas as informações bancárias principais."
system_ext Email "Sistema de E-mail" "O sistema interno de Microsoft Exchange do banco."

Customer -> InternetBanking "Visualiza saldos e faz pagamentos usando"
InternetBanking -> Mainframe "Obtém dados de conta e envia pagamentos via"
InternetBanking -> Email "Envia e-mail usando"
Email -> Customer "Envia e-mails para"`,
        },
        {
            id: 'containers',
            label: 'Containers',
            label_pt: 'Containers',
            source: `title "Internet Banking System — Containers"

person Customer "Customer" "A customer of the bank, with personal accounts."
system_ext Mainframe "Mainframe Banking System" "Stores all core banking information."

boundary "Internet Banking System" {
  container WebApp "Web Application" "Java, Spring MVC" "Delivers the static site and SPA shell."
  container SPA "Single-Page App" "TypeScript, React" "Provides the banking UI in the browser."
  container API "API Application" "Java, Spring Boot" "Serves banking data over a JSON/HTTPS API."
  container Database "Database" "PostgreSQL" "Stores user credentials and transaction logs."
}

Customer -> WebApp "Visits in browser" "HTTPS"
Customer -> SPA "Uses"
WebApp -> SPA "Delivers to the customer's browser"
SPA -> API "Makes API calls to" "JSON/HTTPS"
API -> Database "Reads from and writes to" "SQL/TCP"
API -> Mainframe "Gets account data from, and posts payments via" "XML/HTTPS"`,
            source_pt: `title "Internet Banking System — Containers"

person Customer "Cliente" "Um cliente do banco, com contas pessoais."
system_ext Mainframe "Mainframe Banking System" "Armazena todas as informações bancárias principais."

boundary "Internet Banking System" {
  container WebApp "Aplicação Web" "Java, Spring MVC" "Entrega o site estático e o shell da SPA."
  container SPA "Single-Page App" "TypeScript, React" "Fornece a interface bancária no navegador."
  container API "Aplicação de API" "Java, Spring Boot" "Disponibiliza os dados bancários via API JSON/HTTPS."
  container Database "Banco de Dados" "PostgreSQL" "Armazena credenciais de usuários e registros de transações."
}

Customer -> WebApp "Acessa pelo navegador" "HTTPS"
Customer -> SPA "Usa"
WebApp -> SPA "Entrega ao navegador do cliente"
SPA -> API "Faz chamadas de API para" "JSON/HTTPS"
API -> Database "Lê e grava em" "SQL/TCP"
API -> Mainframe "Obtém dados de conta e envia pagamentos via" "XML/HTTPS"`,
        },
        {
            id: 'minimal',
            label: 'Minimal',
            label_pt: 'Mínimo',
            source: `title "My System — System Context"

person User "User" "Someone who needs to get things done."
system MySystem "My System" "Helps the user get things done."
system_ext ThirdParty "Third-Party API" "Provides data my system depends on."

User -> MySystem "Uses"
MySystem -> ThirdParty "Reads data from" "HTTPS/JSON"`,
            source_pt: `title "My System — Contexto do Sistema"

person User "Usuário" "Alguém que precisa resolver tarefas."
system MySystem "My System" "Ajuda o usuário a resolver suas tarefas."
system_ext ThirdParty "API de Terceiros" "Fornece dados dos quais meu sistema depende."

User -> MySystem "Usa"
MySystem -> ThirdParty "Lê dados de" "HTTPS/JSON"`,
        },
    ];
})(window);
