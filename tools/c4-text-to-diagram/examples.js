/**
 * Starter snippets for the C4 Text-to-Diagram tool, loosely adapted from the
 * canonical "Internet Banking System" example used throughout C4 model docs.
 */
(function (global) {
    global.C4_EXAMPLES = [
        {
            id: 'context',
            label: 'System Context',
            source: `title "Internet Banking System — System Context"

person Customer "Customer" "A customer of the bank, with personal accounts."
system InternetBanking "Internet Banking System" "Lets customers check balances and make payments."
system_ext Mainframe "Mainframe Banking System" "Stores all core banking information."
system_ext Email "E-mail System" "The bank's internal Microsoft Exchange system."

Customer -> InternetBanking "Views balances and makes payments using"
InternetBanking -> Mainframe "Gets account data from, and posts payments via"
InternetBanking -> Email "Sends e-mail using"
Email -> Customer "Sends e-mails to"`,
        },
        {
            id: 'containers',
            label: 'Containers',
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
        },
        {
            id: 'minimal',
            label: 'Minimal',
            source: `title "My System — System Context"

person User "User" "Someone who needs to get things done."
system MySystem "My System" "Helps the user get things done."
system_ext ThirdParty "Third-Party API" "Provides data my system depends on."

User -> MySystem "Uses"
MySystem -> ThirdParty "Reads data from" "HTTPS/JSON"`,
        },
    ];
})(window);
