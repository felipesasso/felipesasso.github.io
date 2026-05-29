// Translations for different languages
const translations = {
    en: {
        name: 'Felipe Coral Sasso',
        jobTitleFull: "Software Engineer | Master's in Computer Science",
        location: 'Florianópolis, Santa Catarina, Brazil',
        summaryTitle: 'Summary',
        summaryText:
            'Software Engineer with 5+ years of experience building robust, scalable back-end systems with Python and crafting dynamic, intuitive user interfaces using React.',
        languagesTitle: 'Languages',
        langPortuguese: 'Portuguese (Native)',
        langEnglish: 'English (Professional Working)',
        topSkillsTitle: 'Top Skills',
        experienceTitle: 'Experience',
        educationTitle: 'Education',
        footerRights: '&copy; {year} Felipe Coral Sasso. All rights reserved.',
        footerBuiltWith: 'Built with care — Fraunces, Inter & Tailwind CSS.',
        colorblindMode: 'Colorblind Mode', // New translation key
        englishLanguageTooltip: 'Switch to English', // New tooltip translation
        portugueseLanguageTooltip: 'Mudar para Português', // New tooltip translation for Portuguese
        emailTooltip: 'Send an email to Felipe', // New tooltip for email
        phoneTooltip: 'Call Felipe', // New tooltip for phone
        linkedinTooltip: "View Felipe's LinkedIn profile", // New tooltip for LinkedIn
        githubTooltip: "View Felipe's GitHub profile", // New tooltip for GitHub

        jobTitlePinterest: 'Software Engineer',
        pinterestDesc:
            'Software Engineer at Pinterest specializing in front-end development and user experience. Leveraging React, TypeScript, and modern styling frameworks to build, test, and deploy key user-facing features for millions of Pinner.',
        pinterestDetail1:
            'Build, test, and deploy key user-facing features for millions of Pinner (Pinterest users).',
        pinterestDetail2:
            'Own the entire lifecycle of components and features, from initial design review to deployment and A/B testing in production.',
        pinterestDetail3:
            'Optimize application performance (load times, rendering, bundle size) to ensure a fast and delightful experience on all platforms.',
        pinterestDetail4:
            'Collaborate closely with product and design teams to translate complex concepts into intuitive and highly scalable UIs.',
        jobTitleBairesDev: 'Software Engineer',
        bairesdevDesc:
            'As a leading Nearshore Technology Solutions company, we architect and engineer scalable and high-performing software solutions to meet the business challenges of our clients. Using our tech expertise and cross-industry experience, we evolve digital transformation into digital acceleration.',
        jobTitleFreeplay: 'Full Stack Software Engineer',
        freeplayDesc:
            'Contributed to Freeplay, a platform designed to help product teams build with Large Language Models (LLMs). Responsibilities included full-stack development, involving Python back-ends, React front-ends, and multi-language SDKs (Python, Node, Java).',
        freeplayDetail1: 'Designed and implemented server-side logic and APIs with Python.',
        freeplayDetail2:
            'Developed user interfaces and interactive features using React.js, JavaScript, and TypeScript.',
        freeplayDetail3: 'Engineered and maintained SDKs in Python, Node.js, and Java.',
        jobTitleNextRoll: 'Full Stack Engineer',
        nextrollDesc:
            'Contributed to RollWorks, a leading B2B marketing platform, by developing new product features and enhancing existing functionalities. Involved in both front-end (React) and back-end (Go, Python) development to support account-based marketing and demand generation.',
        nextrollDetail1:
            'Developed responsive user interfaces with React.js, JavaScript, and TypeScript.',
        nextrollDetail2: 'Built and maintained server-side logic and APIs using Go and Python.',
        jobTitleSenseData: 'Back-end Developer',
        sensedataDesc:
            'Developed and tested robust APIs using Python and Flask for a customer relationship platform. Created interactive dashboards with JavaScript and React to enhance data visualization and user engagement.',
        jobTitleMsgsc: 'Research Programmer',
        companyMsgsc: "Canada's Michael Smith Genome Sciences Centre",
        msgscDesc:
            'Developed APIs (Python, Flask, OpenAPI) and interactive dashboards (JavaScript, React) for CanDIG, a distributed genomics platform, and CanCOGEN, visualizing COVID-19 data.',
        candigPublicationText:
            'L. Jonathan Dursi, Zoltan Bozoky, Richard de Borja, et al., "CanDIG: Secure Federated Genomic Queries and Analyses Across Jurisdictions," bioRxiv 2021.03.30.434101; <a href="https://doi.org/10.1101/2021.03.30.434101" target="_blank" rel="noopener noreferrer" class="link-highlight">doi: https://doi.org/10.1101/2021.03.30.434101</a>.',
        jobTitleCisco: 'Software Engineer',
        ciscoDesc:
            "Contributed to Cisco's Genie and pyATS automation infrastructure by designing, developing and testing scalable features for network automation in Python. Developed RegEx-based parsers for various networking protocols and created Python scripts for automated device testing.",
        jobTitleBridgehead: 'Kitchen Specialist',
        bridgeheadDesc:
            'Gained valuable Canadian work experience as a Kitchen Specialist, enhancing communication, leadership, pressure handling, and pro-activity. Concurrently, self-taught and improved technical skills to stay current with technology.',
        bridgeheadSkillPython:
            'Python (requests, BeautifulSoup4, unittest, Django v2.1, virtualenv)',
        bridgeheadSkillFrontend: 'Front-end (HTML, CSS, Bootstrap, Bulma)',
        bridgeheadSkillTools: 'Tools (Git, GitHub, Heroku)',
        bridgeheadSkillProblemSolving: 'Problem-solving (HackerRank challenges)',
        jobTitleLabsec: 'Researcher/Developer',
        companyLabsec: 'Laboratório de Segurança em Computação (LabSEC) - UFSC',
        labsecDesc:
            "Conducted Master's research involving the proposal and security validation of a unified Identity Card based on the ICAO 9303 passport standard for academic federation environments. Contributed to various security projects during this period.",
        labsecPublicationText:
            'F. C. Sasso, R. A. Reinaldo De Moraes and J. E. Martina, "A Proposal for a Unified Identity Card for Use in an Academic Federation Environment," 2014 Ninth International Conference on Availability, Reliability and Security, Fribourg, Switzerland, 2014, pp. 265-272, <a href="https://ieeexplore.ieee.org/document/6980291" target="_blank" rel="noopener noreferrer" class="link-highlight">doi: 10.1109/ARES.2014.44</a>.',

        techStackLabel: 'Tech Stack:',
        skillsLabel: 'Skills:',
        skillsAcquiredLabel: 'Skills Acquired/Enhanced:',
        relatedPublicationLabel: 'Related Publication:',
        mastersDegree: "Master's degree, Computer Science",
        universityUfsc: 'Universidade Federal de Santa Catarina',
        bachelorsDegree: "Bachelor's degree, Computer Science",
        universityUnesc: 'Universidade do Extremo Sul Catarinense',
        dissertationLabel: "Master's Thesis:",
        dissertationTitle: 'Cartão de identificação humana para autenticação e autorização segura',
        dissertationAbstractLabel: 'Abstract:',
        dissertationAbstract:
            "Several efforts have been made recently to establish identity federations. Efforts towards availability of authentication data to be usable by all entities of the federation are the core of this model. However some issues are still open. The first issue is related to offline operation of the authentication process. Today's model of federation requires that systems work online and synchronously, which limits the use for some applications. The second is related to the fact that data federations are only to computer systems and not by human agents. Thus it is difficult for humans involved in the process to assess such credentials. Finally, federation has numerous technical and legal issues for the provision of private data, such as biometric parameters, and it would make a much stronger authentication process. The purpose of this thesis is to describe an identity card based on the ICAO 9303 standard to solve the problems present in Identity Federations. Besides the creation of the card we also performed an evaluation of the Security in various usage scenarios. It was possible to identify which security issues may arise during the use of the card and how to solve them.",
        dissertationLink: 'Access Thesis at UFSC Repository',

        navWork: 'Work',
        navSkills: 'Skills',
        navExperience: 'Experience',
        navEducation: 'Education',
        navReading: 'Reading',

        workEyebrow: 'Selected Work',
        workTitle: 'Selected Work & Research',
        workPinterestTitle: 'Front-end at scale',
        workPinterestDesc:
            'Building, testing, and shipping user-facing features for millions of Pinners — owning components from design review through to A/B testing in production.',
        workFreeplayTitle: 'Tooling for LLMs',
        workFreeplayDesc:
            'Full-stack work on a platform that helps product teams build with large language models — Python back-ends, React front-ends, and SDKs in Python, Node, and Java.',
        workCandigTitle: 'Federated genomics',
        workCandigDesc:
            "APIs and interactive dashboards for CanDIG, a distributed genomics platform, and CanCOGEN's COVID-19 data — backed by a peer-reviewed publication.",
        workCiscoTitle: 'Network automation',
        workCiscoDesc:
            'Scalable features for the Genie and pyATS automation framework, including RegEx-based protocol parsers and automated device testing in Python.',

        readingEyebrow: 'Off the clock',
        readingTitle: 'Reading',
        readingIntro:
            'A lifelong reader — science fiction, horror, and the classics. Here are a few of my most recent reads.',
        readingSeeAll: 'See {count} books →',

        skillCategoryFrontend: 'Frontend',
        skillCategoryBackend: 'Backend',
        skillCategoryTools: 'Tools & Practices',

        showOlderExperience: 'Show 2 earlier positions',
        hideOlderExperience: 'Hide earlier positions',

        apiDevelopment: 'REST API Development',
        python: 'Python',
        react: 'React',
        typescript: 'Typescript',
        unitTesting: 'Unit Testing',

        present: 'Present',
        year: 'year',
        years: 'years',
        month: 'month',
        months: 'months',
        lessThanAMonth: 'Less than a month',
        monthNames: [
            'January',
            'February',
            'March',
            'April',
            'May',
            'June',
            'July',
            'August',
            'September',
            'October',
            'November',
            'December',
        ],
    },
    pt: {
        name: 'Felipe Coral Sasso',
        jobTitleFull: 'Engenheiro de Software | Mestre em Ciência da Computação',
        location: 'Florianópolis, Santa Catarina, Brasil',
        summaryTitle: 'Resumo',
        summaryText:
            'Engenheiro de Software com mais de 5 anos de experiência na construção de sistemas back-end robustos e escaláveis com Python e na criação de interfaces de usuário dinâmicas e intuitivas usando React.',
        languagesTitle: 'Idiomas',
        langPortuguese: 'Português (Nativo)',
        langEnglish: 'Inglês (Profissional)',
        topSkillsTitle: 'Principais Habilidades',
        experienceTitle: 'Experiência',
        educationTitle: 'Formação',
        footerRights: '&copy; {year} Felipe Coral Sasso. Todos os direitos reservados.',
        footerBuiltWith: 'Construído com carinho — Fraunces, Inter e Tailwind CSS.',
        colorblindMode: 'Modo Daltônico', // New translation key
        englishLanguageTooltip: 'Mudar para Inglês', // New tooltip translation
        portugueseLanguageTooltip: 'Mudar para Português', // New tooltip translation for Portuguese
        emailTooltip: 'Enviar e-mail para Felipe', // New tooltip for email
        phoneTooltip: 'Ligar para Felipe', // New tooltip for phone
        linkedinTooltip: 'Ver perfil de Felipe no LinkedIn', // New tooltip for LinkedIn
        githubTooltip: 'Ver perfil de Felipe no GitHub', // New tooltip for GitHub

        jobTitlePinterest: 'Engenheiro de Software',
        pinterestDesc:
            'Engenheiro de Software no Pinterest com foco em desenvolvimento front-end e experiência do usuário, desenvolvendo soluções com React, TypeScript e frameworks modernos para entregar recursos essenciais para milhões de Pinners.',
        pinterestDetail1:
            'Desenvolvimento, teste e implantação de recursos essenciais para milhões de Pinners (usuários do Pinterest).',
        pinterestDetail2:
            'Gerenciamento do ciclo de vida completo de componentes e funcionalidades, desde a análise inicial do design até a implantação e os testes A/B em produção.',
        pinterestDetail3:
            'Otimização do desempenho da aplicação (tempo de carregamento, renderização, tamanho do bundle) para garantir uma experiência rápida e agradável em todas as plataformas.',
        pinterestDetail4:
            'Colaboração com as equipes de produto e design para transformar conceitos complexos em interfaces intuitivas e altamente escaláveis.',
        jobTitleBairesDev: 'Engenheiro de Software',
        bairesdevDesc:
            'Empresa líder em Soluções de Tecnologia Nearshore, dedicada à arquitetura e à engenharia de soluções de software escaláveis e de alto desempenho para enfrentar os desafios de negócios dos clientes, evoluindo a transformação digital em aceleração digital com expertise tecnológica e experiência intersetorial.',
        jobTitleFreeplay: 'Engenheiro de Software Full Stack',
        freeplayDesc:
            'Desenvolvimento full-stack no Freeplay, uma plataforma projetada para ajudar equipes de produto a construir com grandes modelos de linguagem (LLMs), envolvendo back-ends Python, front-ends React e SDKs multi-linguagem (Python, Node, Java).',
        freeplayDetail1: 'Projeto e implementação de lógica de servidor e APIs com Python.',
        freeplayDetail2:
            'Desenvolvimento de interfaces de usuário e funcionalidades interativas com React.js, JavaScript e TypeScript.',
        freeplayDetail3: 'Projeto e manutenção de SDKs em Python, Node.js e Java.',
        jobTitleNextRoll: 'Engenheiro Full Stack',
        nextrollDesc:
            'Contribuições para a RollWorks, uma plataforma líder de marketing B2B, com o desenvolvimento de novas funcionalidades de produto e o aprimoramento das existentes — no front-end (React) e no back-end (Go, Python) — para apoiar o marketing baseado em contas e a geração de demanda.',
        nextrollDetail1:
            'Desenvolvimento de interfaces de usuário responsivas com React.js, JavaScript e TypeScript.',
        nextrollDetail2: 'Construção e manutenção de lógica de servidor e APIs com Go e Python.',
        jobTitleSenseData: 'Desenvolvedor Back-end',
        sensedataDesc:
            'Desenvolvimento e teste de APIs robustas com Python e Flask para uma plataforma de relacionamento com o cliente, além da criação de dashboards interativos com JavaScript e React para aprimorar a visualização de dados e o engajamento do usuário.',
        jobTitleMsgsc: 'Programador de Pesquisa',
        companyMsgsc: "Canada's Michael Smith Genome Sciences Centre",
        msgscDesc:
            'Desenvolvimento de APIs (Python, Flask, OpenAPI) e dashboards interativos (JavaScript, React) para o CanDIG, uma plataforma distribuída de genômica, e o CanCOGEN, com visualização de dados de COVID-19.',
        candigPublicationText:
            'L. Jonathan Dursi, Zoltan Bozoky, Richard de Borja, et al., "CanDIG: Secure Federated Genomic Queries e Analyses Across Jurisdictions," bioRxiv 2021.03.30.434101; <a href="https://doi.org/10.1101/2021.03.30.434101" target="_blank" rel="noopener noreferrer" class="link-highlight">doi: https://doi.org/10.1101/2021.03.30.434101</a>.',
        jobTitleCisco: 'Engenheiro de Software',
        ciscoDesc:
            'Contribuições para a infraestrutura de automação Genie e pyATS da Cisco, com o projeto, desenvolvimento e teste de funcionalidades escaláveis para automação de redes em Python, incluindo parsers baseados em RegEx para diversos protocolos de rede e scripts Python para testes automatizados de dispositivos.',
        jobTitleBridgehead: 'Especialista de Cozinha',
        bridgeheadDesc:
            'Valiosa experiência de trabalho canadense como Especialista de Cozinha, com o aprimoramento de habilidades de comunicação, liderança, gerenciamento de pressão e proatividade. Paralelamente, aprimoramento autodidata de habilidades técnicas para acompanhar a evolução da tecnologia.',
        bridgeheadSkillPython:
            'Python (requests, BeautifulSoup4, unittest, Django v2.1, virtualenv)',
        bridgeheadSkillFrontend: 'Front-end (HTML, CSS, Bootstrap, Bulma)',
        bridgeheadSkillTools: 'Ferramentas (Git, GitHub, Heroku)',
        bridgeheadSkillProblemSolving: 'Resolução de problemas (desafios HackerRank)',
        jobTitleLabsec: 'Pesquisador/Desenvolvedor',
        companyLabsec: 'Laboratório de Segurança em Computação (LabSEC) - UFSC',
        labsecDesc:
            'Pesquisa de mestrado envolvendo a proposta e a validação de segurança de uma Carteira de Identidade unificada baseada no padrão de passaporte ICAO 9303 para ambientes de federação acadêmica, além de contribuições para diversos projetos de segurança no período.',
        labsecPublicationText:
            'F. C. Sasso, R. A. Reinaldo De Moraes e J. E. Martina, "A Proposal for a Unified Identity Card for Use in an Academic Federation Environment," 2014 Ninth International Conference on Availability, Reliability and Security, Fribourg, Suíça, 2014, pp. 265-272, <a href="https://ieeexplore.ieee.org/document/6980291" target="_blank" rel="noopener noreferrer" class="link-highlight">doi: 10.1109/ARES.2014.44</a>.',

        techStackLabel: 'Stack de Tecnologias:',
        skillsLabel: 'Habilidades:',
        skillsAcquiredLabel: 'Habilidades Adquiridas/Aprimoradas:',
        relatedPublicationLabel: 'Publicação Relacionada:',
        mastersDegree: 'Mestrado, Ciência da Computação',
        universityUfsc: 'Universidade Federal de Santa Catarina',
        bachelorsDegree: 'Bacharelado, Ciência da Computação',
        universityUnesc: 'Universidade do Extremo Sul Catarinense',
        dissertationLabel: 'Dissertação de Mestrado:',
        dissertationTitle: 'Cartão de identificação humana para autenticação e autorização segura',
        dissertationAbstractLabel: 'Resumo:',
        dissertationAbstract:
            'Vários esforços têm sido feitos recentemente no âmbito de federações de identidade. Os esforços para que dados de autenticação sejam disponíveis e utilizáveis por todas as entidades participantes da federação são o pilar deste modelo. No entanto alguns problemas se encontram em aberto. O primeiro deles é o funcionamento offline do processo de autenticação. Hoje o modelo da federação requer que os sistemas trabalhem online de forma síncrona, o que limita seu uso para algumas aplicações. Segundo, os dados da federação somente estão disponíveis para sistemas computacionais e não para as pessoas, tornando difícil a avaliação de tais credenciais. Por fim, a federação tem inúmeros problemas técnicos e legais para a disponibilização de dados considerados de uso privado, tais como biométricos. Estes tornariam a autenticação muito mais forte. A proposta desta dissertação foi descrever um cartão de identificação baseado no padrão ICAO 9303 que soluciona os problemas presentes nas Federações de Identidade. Além da criação do cartão, também foi realizada uma avaliação da segurança deste em diversos cenários de uso. Com isso foi possível identificar quais problemas de segurança podem ocorrer durante a utilização do cartão e como resolvê-los.',
        dissertationLink: 'Acessar Dissertação no Repositório UFSC',

        navWork: 'Trabalhos',
        navSkills: 'Habilidades',
        navExperience: 'Experiência',
        navEducation: 'Formação',
        navReading: 'Leituras',

        workEyebrow: 'Trabalhos Selecionados',
        workTitle: 'Trabalhos e Pesquisas Selecionados',
        workPinterestTitle: 'Front-end em escala',
        workPinterestDesc:
            'Desenvolvimento, teste e entrega de recursos para milhões de Pinners — cuidando de componentes desde a análise de design até testes A/B em produção.',
        workFreeplayTitle: 'Ferramentas para LLMs',
        workFreeplayDesc:
            'Desenvolvimento full-stack em uma plataforma que ajuda equipes a construir com grandes modelos de linguagem — back-ends Python, front-ends React e SDKs em Python, Node e Java.',
        workCandigTitle: 'Genômica federada',
        workCandigDesc:
            'APIs e dashboards interativos para o CanDIG, uma plataforma distribuída de genômica, e os dados de COVID-19 do CanCOGEN — com publicação revisada por pares.',
        workCiscoTitle: 'Automação de redes',
        workCiscoDesc:
            'Funcionalidades escaláveis para o framework de automação Genie e pyATS, incluindo parsers de protocolo baseados em RegEx e testes automatizados de dispositivos em Python.',

        readingEyebrow: 'Nas horas vagas',
        readingTitle: 'Leituras',
        readingIntro:
            'Leitor de longa data — ficção científica, terror e clássicos da literatura. Aqui estão algumas das minhas leituras mais recentes.',
        readingSeeAll: 'Ver {count} livros →',

        skillCategoryFrontend: 'Frontend',
        skillCategoryBackend: 'Backend',
        skillCategoryTools: 'Ferramentas & Práticas',

        showOlderExperience: 'Mostrar 2 posições anteriores',
        hideOlderExperience: 'Ocultar posições anteriores',

        apiDevelopment: 'Desenvolvimento de APIs REST',
        python: 'Python',
        react: 'React',
        typescript: 'Typescript',
        unitTesting: 'Testes Unitários',

        present: 'Atual',
        year: 'ano',
        years: 'anos',
        month: 'mês',
        months: 'meses',
        lessThanAMonth: 'Menos de um mês',
        monthNames: [
            'Janeiro',
            'Fevereiro',
            'Março',
            'Abril',
            'Maio',
            'Junho',
            'Julho',
            'Agosto',
            'Setembro',
            'Outubro',
            'Novembro',
            'Dezembro',
        ],
    },
};

// Variable to store the current language
let currentLanguage = 'en'; // Default to English

// Number of books read (filled in once books.json loads); null until known.
let readingBookCount = null;

/**
 * Sets the initial language: saved preference first, then browser language, then English.
 */
function setInitialLanguage() {
    try {
        const saved = localStorage.getItem('language');
        if (saved === 'pt' || saved === 'en') {
            currentLanguage = saved;
            return;
        }
        const browserLang = navigator.language || navigator.userLanguage;
        currentLanguage = (browserLang && browserLang.toLowerCase().startsWith('pt')) ? 'pt' : 'en';
    } catch (e) {
        currentLanguage = 'en';
    }
}

/**
 * Updates the job duration text based on start and end dates.
 * @param {string} lang - The current language ('en' or 'pt').
 */
function updateJobDurations(lang) {
    const durationElements = document.querySelectorAll('[data-job-duration]');
    const currentTranslations = translations[lang];

    durationElements.forEach((element) => {
        const startDateStr = element.dataset.startDate;
        const endDateStr = element.dataset.endDate;
        const locationEn = element.dataset.locationEn || '';
        const locationPt = element.dataset.locationPt || '';

        // Parse start date
        const [startYear, startMonth, startDay] = startDateStr.split('-').map(Number);
        const startDate = new Date(startYear, startMonth - 1, startDay);

        let endDate;
        let isPresent = false;
        // Parse end date or set to current date if 'Present'
        if (endDateStr.toLowerCase() === 'present') {
            endDate = new Date();
            isPresent = true;
        } else {
            const [endYear, endMonth, endDay] = endDateStr.split('-').map(Number);
            endDate = new Date(endYear, endMonth - 1, endDay);
        }

        // Calculate difference in years and months
        let years = endDate.getFullYear() - startDate.getFullYear();
        let months = endDate.getMonth() - startDate.getMonth();

        // Adjust months if end day is earlier than start day in the same month/year
        if (
            endDate.getDate() < startDate.getDate() &&
            !(
                endDate.getFullYear() === startDate.getFullYear() &&
                endDate.getMonth() === startDate.getMonth()
            )
        ) {
            months--;
        }

        // Adjust years if months become negative
        if (months < 0) {
            years--;
            months += 12;
        }

        // Construct duration text
        let durationText = '';
        if (years > 0) {
            durationText +=
                years + ' ' + (years === 1 ? currentTranslations.year : currentTranslations.years);
        }
        if (months > 0) {
            if (years > 0) durationText += ' ';
            durationText +=
                months +
                ' ' +
                (months === 1 ? currentTranslations.month : currentTranslations.months);
        }

        // Handle cases for less than a month
        if (years === 0 && months <= 0 && isPresent) {
            durationText = currentTranslations.lessThanAMonth;
        } else if (years === 0 && months <= 0 && !isPresent) {
            // If not present and duration is 0 or negative (e.g. start and end in same month), show as less than a month.
            durationText = currentTranslations.lessThanAMonth;
        }

        // Construct date range string
        let dateRangeStr = `${
            translations[lang].monthNames[startDate.getMonth()]
        } ${startDate.getFullYear()} - `;
        if (isPresent) {
            dateRangeStr += currentTranslations.present;
        } else {
            dateRangeStr += `${
                translations[lang].monthNames[endDate.getMonth()]
            } ${endDate.getFullYear()}`;
        }

        // Get location string based on language
        const locationStr = lang === 'pt' ? locationPt : locationEn;

        // Set the element's text content
        element.textContent = `${dateRangeStr} (${durationText}) ${locationStr}`;
    });
}

/**
 * Switches the language of the page content.
 * @param {string} lang - The language to switch to ('en' or 'pt').
 * @param {boolean} persist - Whether to save the choice to localStorage.
 */
function switchLanguage(lang, persist = false) {
    currentLanguage = lang;
    if (persist) localStorage.setItem('language', lang);
    // Iterate over all elements with a 'data-translate-key' attribute
    document.querySelectorAll('[data-translate-key]').forEach((element) => {
        const key = element.dataset.translateKey;
        let translatedText = translations[lang][key] || translations.en[key]; // Fallback to English if key not found

        // Replace {year} placeholder in footer rights
        if (key === 'footerRights') {
            translatedText = translatedText.replace('{year}', new Date().getFullYear());
        }

        // Handle specific cases for elements containing HTML, like links within descriptions
        if (element.tagName === 'A' && element.parentElement.dataset.translateKey === key) {
            // If the parent has the translate key, and this is a simple link text
            if (element.childNodes.length === 1 && element.firstChild.nodeType === Node.TEXT_NODE) {
                // Do not update innerHTML for these specific links, they should retain their original text (email, phone, URLs)
                // The title attribute will still be updated below for tooltips.
            }
        } else if (
            key === 'bccancerDesc' ||
            key === 'labsecPublicationText' ||
            key === 'candigPublicationText' ||
            key === 'msgscDesc'
        ) {
            // For elements that might contain HTML (like publication links)
            const tempDiv = document.createElement('div');
            tempDiv.innerHTML = translatedText;
            // Ensure links within these translated sections also get the highlight class
            tempDiv.querySelectorAll('a').forEach((a) => a.classList.add('link-highlight'));

            element.innerHTML = ''; // Clear existing content
            while (tempDiv.firstChild) {
                element.appendChild(tempDiv.firstChild); // Append new translated content
            }
        }
        // IMPORTANT: Only update innerHTML for elements that are NOT the language buttons AND NOT the contact links
        else if (
            translatedText !== undefined &&
            element.id !== 'lang-en' &&
            element.id !== 'lang-pt' &&
            element.dataset.translateKey !== 'emailTooltip' &&
            element.dataset.translateKey !== 'phoneTooltip' &&
            element.dataset.translateKey !== 'linkedinTooltip' &&
            element.dataset.translateKey !== 'githubTooltip'
        ) {
            // For most elements, just set their innerHTML
            element.innerHTML = translatedText;
        }

        // Update title attribute for buttons and links that have a data-translate-key
        if (
            (element.tagName === 'BUTTON' || element.tagName === 'A') &&
            element.dataset.translateKey
        ) {
            element.title = translatedText;
        }
    });
    // Update job durations, skills, toggle button, and reading link based on the new language
    updateJobDurations(lang);
    populateSkills();
    updateToggleButton();
    updateReadingSeeAll();

    // Update active state and aria-pressed of language buttons
    const btnEn = document.getElementById('lang-en');
    const btnPt = document.getElementById('lang-pt');
    btnEn.classList.toggle('active', lang === 'en');
    btnPt.classList.toggle('active', lang === 'pt');
    btnEn.setAttribute('aria-pressed', lang === 'en' ? 'true' : 'false');
    btnPt.setAttribute('aria-pressed', lang === 'pt' ? 'true' : 'false');
}

/**
 * Populates the skills section with categorised skill tags.
 */
function populateSkills() {
    const container = document.getElementById('skills-categories');
    if (!container) return;

    const t = translations[currentLanguage];

    const categories = [
        {
            label: t.skillCategoryFrontend,
            skills: ['React', 'TypeScript', 'JavaScript', 'GraphQL', 'CSS'],
        },
        {
            label: t.skillCategoryBackend,
            skills: ['Python', 'Flask', 'Go', 'SQL / PostgreSQL', 'REST APIs'],
        },
        {
            label: t.skillCategoryTools,
            skills: ['Git / GitHub', 'Unit Testing', 'Agile / Scrum', 'CI/CD'],
        },
    ];

    container.innerHTML = '';

    categories.forEach(({ label, skills }) => {
        const categoryDiv = document.createElement('div');

        const labelEl = document.createElement('p');
        labelEl.className = 'skill-category-label';
        labelEl.textContent = label;
        categoryDiv.appendChild(labelEl);

        const skillsWrap = document.createElement('div');
        skillsWrap.className = 'flex flex-wrap gap-2';

        skills.forEach((skill) => {
            const span = document.createElement('span');
            span.className = 'skill-tag';
            span.textContent = skill;
            skillsWrap.appendChild(span);
        });

        categoryDiv.appendChild(skillsWrap);
        container.appendChild(categoryDiv);
    });
}

/**
 * Updates the theme toggle button icon to reflect current state.
 */
function updateThemeButton() {
    const isDark = document.documentElement.classList.contains('dark');
    const btn = document.getElementById('theme-toggle');
    const moon = document.getElementById('icon-moon');
    const sun = document.getElementById('icon-sun');
    if (!btn) return;
    btn.setAttribute('aria-pressed', isDark ? 'true' : 'false');
    btn.setAttribute('aria-label', isDark ? 'Switch to light mode' : 'Switch to dark mode');
    if (moon) moon.classList.toggle('hidden', isDark);
    if (sun) sun.classList.toggle('hidden', !isDark);
}

/**
 * Toggles between light and dark mode.
 * Saves the preference to localStorage.
 */
function toggleTheme() {
    const isDark = document.documentElement.classList.toggle('dark');
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
    updateThemeButton();
}

/**
 * Updates the reading link text with the live book count, in the current
 * language. Falls back to a count-less label until books.json loads.
 */
function updateReadingSeeAll() {
    const el = document.querySelector('[data-translate-key="readingSeeAll"]');
    if (!el) return;
    const template =
        (translations[currentLanguage] && translations[currentLanguage].readingSeeAll) ||
        translations.en.readingSeeAll;
    el.textContent =
        readingBookCount != null
            ? template.replace('{count}', readingBookCount)
            : template.replace('{count} ', '').replace('{count}', '');
}

/**
 * Loads the reading list from the books page data and renders the most recent
 * reads as a small "shelf" on the home page. Hides the section if it fails.
 */
async function renderReading() {
    const shelf = document.getElementById('reading-shelf');
    const section = document.getElementById('reading');
    if (!shelf) return;

    try {
        const res = await fetch('/livros/books.json', { cache: 'no-cache' });
        if (!res.ok) throw new Error('Failed to load books.json');
        const books = await res.json();
        readingBookCount = Array.isArray(books) ? books.length : 0;

        // books.json is ordered most-recent first.
        const recent = books.slice(0, 6);
        shelf.innerHTML = '';

        recent.forEach((book) => {
            const card = document.createElement('a');
            card.className = 'book-card';
            card.href = 'https://www.goodreads.com/search?q=' + encodeURIComponent(book.title + ' ' + book.author).replace(/%20/g, '+');
            card.target = '_blank';
            card.rel = 'noopener noreferrer';

            const top = document.createElement('div');

            const title = document.createElement('p');
            title.className = 'title';
            title.textContent = book.title;
            title.insertAdjacentHTML('beforeend', '<svg class="book-link-icon" viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" xmlns="http://www.w3.org/2000/svg"><path d="M2.5 9.5 9.5 2.5M5 2.5h4.5v4.5"/></svg>');
            top.appendChild(title);

            const author = document.createElement('p');
            author.className = 'author';
            author.textContent = book.author;
            top.appendChild(author);

            const year = document.createElement('span');
            year.className = 'year';
            year.textContent = book.year != null ? book.year : '';

            card.appendChild(top);
            card.appendChild(year);

            shelf.appendChild(card);
        });

        updateReadingSeeAll();
    } catch (e) {
        if (section) section.style.display = 'none';
    }
}

/**
 * Reveals elements with the `.reveal` class as they scroll into view.
 * Respects reduced-motion preferences and degrades gracefully without
 * IntersectionObserver support.
 */
function setupRevealAnimations() {
    const reveals = document.querySelectorAll('.reveal');
    const reduceMotion =
        window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (reduceMotion || !('IntersectionObserver' in window)) {
        reveals.forEach((el) => el.classList.add('is-visible'));
        return;
    }

    const observer = new IntersectionObserver(
        (entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('is-visible');
                    observer.unobserve(entry.target);
                }
            });
        },
        { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
    );

    reveals.forEach((el) => observer.observe(el));
}

/**
 * Updates the toggle button text/icons to reflect current collapsed state.
 */
function updateToggleButton() {
    const olderSection = document.getElementById('older-experience');
    const textSpan = document.getElementById('toggle-older-text');
    const iconDown = document.querySelector('.toggle-icon-down');
    const iconUp = document.querySelector('.toggle-icon-up');
    if (!olderSection || !textSpan) return;

    const isHidden = olderSection.classList.contains('hidden');
    const t = translations[currentLanguage];
    textSpan.textContent = isHidden ? t.showOlderExperience : t.hideOlderExperience;
    if (iconDown) iconDown.classList.toggle('hidden', !isHidden);
    if (iconUp) iconUp.classList.toggle('hidden', isHidden);
}

/**
 * Sets up the expand/collapse toggle for older experience entries.
 */
function setupExperienceCollapse() {
    const toggleBtn = document.getElementById('toggle-older-exp');
    const olderSection = document.getElementById('older-experience');
    if (!toggleBtn || !olderSection) return;

    updateToggleButton();

    toggleBtn.addEventListener('click', () => {
        olderSection.classList.toggle('hidden');
        updateToggleButton();
    });
}

// Set the current year in the footer
document.getElementById('currentYear').textContent = new Date().getFullYear();

// Add shadow to navbar on scroll
window.addEventListener('scroll', () => {
    const nav = document.getElementById('main-nav');
    if (nav) nav.classList.toggle('scrolled', window.scrollY > 10);
});

// Initialize the page: set the language, render dynamic content, and wire up controls.
document.addEventListener('DOMContentLoaded', function () {
    setInitialLanguage();
    switchLanguage(currentLanguage);
    setupExperienceCollapse();
    updateThemeButton();
    renderReading();
    setupRevealAnimations();

    document.getElementById('lang-en').addEventListener('click', () => switchLanguage('en', true));
    document.getElementById('lang-pt').addEventListener('click', () => switchLanguage('pt', true));
    document.getElementById('theme-toggle').addEventListener('click', toggleTheme);
});
