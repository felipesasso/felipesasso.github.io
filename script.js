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
        footerBuiltWith: 'Built with Tailwind CSS.',
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
            'F. C. Sasso, R. A. Reinaldo De Moraes and J. E. Martina, "A Proposal for a Unified Identity Card for Use in an Academic Federation Environment," 2014 Ninth International Conference on Availability, Reliability and Security, Fribourg, Switzerland, 2014, pp. 265-272, <a href="https://ieeexplore.ieee.org/document/6980291" target="_blank" rel="noopener noreferrer" class="link-highlight">doi: https://doi.org/10.1101/2021.03.30.434101</a>.',

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
        footerBuiltWith: 'Construído com Tailwind CSS.',
        colorblindMode: 'Modo Daltônico', // New translation key
        englishLanguageTooltip: 'Mudar para Inglês', // New tooltip translation
        portugueseLanguageTooltip: 'Mudar para Português', // New tooltip translation for Portuguese
        emailTooltip: 'Enviar e-mail para Felipe', // New tooltip for email
        phoneTooltip: 'Ligar para Felipe', // New tooltip for phone
        linkedinTooltip: 'Ver perfil de Felipe no LinkedIn', // New tooltip for LinkedIn
        githubTooltip: 'Ver perfil de Felipe no GitHub', // New tooltip for GitHub

        jobTitlePinterest: 'Engenheiro de Software',
        pinterestDesc:
            'Engenheiro de Software no Pinterest com foco em desenvolvimento front-end e experiência do usuário. Desenvolvimento de soluções com React, TypeScript e frameworks modernos para entregar recursos essenciais para milhões de Pinners.',
        pinterestDetail1:
            'Desenvolvimento, teste e implantação de recursos essenciais para milhões de Pinners (usuários do Pinterest).',
        pinterestDetail2:
            'Gerenciamento do ciclo de vida completo de componentes e funcionalidades, desde a análise inicial do design até implantação e testes A/B em produção.',
        pinterestDetail3:
            'Otimização do desempenho da aplicação (tempo de carregamento, renderização, tamanho do bundle) para garantir uma experiência rápida e agradável em todas as plataformas.',
        pinterestDetail4:
            'Colaboração com as equipes de produto e design para transformar conceitos complexos em interfaces intuitivas e altamente escaláveis.',
        jobTitleBairesDev: 'Engenheiro de Software',
        bairesdevDesc:
            'Como uma empresa líder em Soluções de Tecnologia Nearshore, arquitetamos e projetamos soluções de software escaláveis e de alto desempenho para enfrentar os desafios de negócios de nossos clientes. Usando nossa expertise tecnológica e experiência intersetorial, evoluímos a transformação digital em aceleração digital.',
        jobTitleFreeplay: 'Engenheiro de Software Full Stack',
        freeplayDesc:
            'Contribuiu para o Freeplay, uma plataforma projetada para ajudar equipes de produto a construir com Modelos de Linguagem Grandes (LLMs). As responsabilidades incluíram desenvolvimento full-stack, envolvendo back-ends Python, front-ends React e SDKs multi-linguagem (Python, Node, Java).',
        freeplayDetail1: 'Projetou e implementou lógica de servidor e APIs com Python.',
        freeplayDetail2:
            'Desenvolveu interfaces de usuário e funcionalidades interativas usando React.js, JavaScript e TypeScript.',
        freeplayDetail3: 'Projetou e manteve SDKs em Python, Node.js e Java.',
        jobTitleNextRoll: 'Engenheiro Full Stack',
        nextrollDesc:
            'Contribuiu para a RollWorks, uma plataforma líder de marketing B2B, desenvolvendo novas funcionalidades de produto e aprimorando as existentes. Envolvido no desenvolvimento front-end (React) e back-end (Go, Python) para apoiar o marketing baseado em contas e a geração de demanda.',
        nextrollDetail1:
            'Desenvolveu interfaces de usuário responsivas com React.js, JavaScript, e TypeScript.',
        nextrollDetail2: 'Construiu e manteve lógica de servidor e APIs usando Go e Python.',
        jobTitleSenseData: 'Desenvolvedor Back-end',
        sensedataDesc:
            'Desenvolveu e testou APIs robustas usando Python e Flask para uma plataforma de relacionamento com o cliente. Criou dashboards interativos com JavaScript e React para aprimorar a visualização de dados e o engajamento do usuário.',
        jobTitleMsgsc: 'Programador de Pesquisa',
        companyMsgsc: "Canada's Michael Smith Genome Sciences Centre",
        msgscDesc:
            'Desenvolveu APIs (Python, Flask, OpenAPI) e dashboards interativos (JavaScript, React) para CanDIG, uma plataforma distribuída de genômica, e CanCOGEN, visualizando dados de COVID-19.',
        candigPublicationText:
            'L. Jonathan Dursi, Zoltan Bozoky, Richard de Borja, et al., "CanDIG: Secure Federated Genomic Queries e Analyses Across Jurisdictions," bioRxiv 2021.03.30.434101; <a href="https://doi.org/10.1101/2021.03.30.434101" target="_blank" rel="noopener noreferrer" class="link-highlight">doi: https://doi.org/10.1101/2021.03.30.434101</a>.',
        jobTitleCisco: 'Engenheiro de Software',
        ciscoDesc:
            'Contribuiu para a infraestrutura de automação Genie e pyATS da Cisco, projetando, desenvolvendo e testando funcionalidades escaláveis para automação de redes em Python. Desenvolveu parsers baseados em RegEx para vários protocolos de rede e criou scripts Python para testes automatizados de dispositivos.',
        jobTitleBridgehead: 'Especialista de Cozinha',
        bridgeheadDesc:
            'Adquiriu valiosa experiência de trabalho canadense como Especialista de Cozinha, aprimorando habilidades de comunicação, liderança, gerenciamento de pressão e proatividade. Concomitantemente, autodidata e aprimorou habilidades técnicas para se manter atualizado com a tecnologia.',
        bridgeheadSkillPython:
            'Python (requests, BeautifulSoup4, unittest, Django v2.1, virtualenv)',
        bridgeheadSkillFrontend: 'Front-end (HTML, CSS, Bootstrap, Bulma)',
        bridgeheadSkillTools: 'Ferramentas (Git, GitHub, Heroku)',
        bridgeheadSkillProblemSolving: 'Resolução de problemas (desafios HackerRank)',
        jobTitleLabsec: 'Pesquisador/Desenvolvedor',
        companyLabsec: 'Laboratório de Segurança em Computação (LabSEC) - UFSC',
        labsecDesc:
            'Conduziu pesquisa de mestrado envolvendo a proposta e validação de segurança de uma Carteira de Identidade unificada baseada no padrão de passaporte ICAO 9303 para ambientes de federação acadêmica. Contribuiu para vários projetos de segurança durante este período.',
        labsecPublicationText:
            'F. C. Sasso, R. A. Reinaldo De Moraes e J. E. Martina, "A Proposal for a Unified Identity Card for Use in an Academic Federation Environment," 2014 Ninth International Conference on Availability, Reliability and Security, Fribourg, Suíça, 2014, pp. 265-272, <a href="https://ieeexplore.ieee.org/document/6980291" target="_blank" rel="noopener noreferrer" class="link-highlight">doi: https://doi.org/10.1101/2021.03.30.434101</a>.',

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
            'Vários esforços tem sido feitos recentemente no âmbito de federações de identidade. Os esforços para que dados de autenticação sejam disponíveis e utilizáveis por todas as entidades participantes da federação são o pilar deste modelo. No entanto alguns problemas se encontram em aberto. O primeiro deles é o funcionamento offline do processo de autenticação. Hoje o modelo da federação requer que os sistemas trabalhem online de forma síncrona, o que limita seu uso para algumas aplicações. Segundo, os dados da federação somente estão disponíveis para sistemas computacionais e não para as pessoas, tornando difícil a avaliação da avaliação de tais credenciais. Por fim, a federação tem inúmeros problemas técnicos e legais para a disponibilização de dados considerados de uso privados, tais como biométricos. Estes tornariam a autenticação muito mais forte. A proposta desta dissertação foi descrever um cartão de identificação baseado no padrão ICAO 9303 que soluciona os problemas presentes nas Federações de Identidade. Além da criação do cartão, também foi realizado uma avaliação da segurança deste em diversos cenários de uso. Com isso foi possível identificar quais problemas de segurança podem ocorrer durante a utilização do cartão e como resolvê-los.',
        dissertationLink: 'Acessar Dissertação no Repositório UFSC',

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

/**
 * Sets the initial language based on browser settings.
 * Defaults to 'en' if Portuguese is not detected or navigator.language is unavailable.
 */
function setInitialLanguage() {
    try {
        const browserLang = navigator.language || navigator.userLanguage;
        if (browserLang && browserLang.toLowerCase().startsWith('pt')) {
            currentLanguage = 'pt';
        } else {
            currentLanguage = 'en';
        }
    } catch (e) {
        // Fallback to English if navigator.language is not accessible (e.g., in some test environments)
        console.warn('Could not access browser language, defaulting to English.', e);
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
 */
function switchLanguage(lang) {
    currentLanguage = lang;
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
    // Update job durations and skills list based on the new language
    updateJobDurations(lang);
    populateSkills();

    // Update active state of language buttons
    document.getElementById('lang-en').classList.toggle('active', lang === 'en');
    document.getElementById('lang-pt').classList.toggle('active', lang === 'pt');
}

/**
 * Populates the skills section with translated skill names.
 */
function populateSkills() {
    const skillsContainer = document.getElementById('skills-list');
    if (!skillsContainer) return; // Exit if the container doesn't exist

    // Define the keys for the top skills to be displayed
    const topSkillKeys = ['python', 'apiDevelopment', 'react', 'typescript', 'unitTesting'];

    skillsContainer.innerHTML = ''; // Clear any existing skills

    // Create and append skill elements
    topSkillKeys.forEach((key) => {
        const skillText = translations[currentLanguage][key] || translations.en[key]; // Get translated skill name
        const skillElement = document.createElement('span');
        // Apply Tailwind classes for styling, now using CSS variables
        skillElement.className =
            'bg-[var(--skill-bg)] text-[var(--skill-text)] px-3 py-1 sm:px-4 sm:py-2 rounded-full text-xs sm:text-sm font-medium';
        skillElement.textContent = skillText;
        skillsContainer.appendChild(skillElement);
    });
}

/**
 * Toggles colorblind mode on and off.
 * Saves the preference to localStorage.
 */
function toggleColorblindMode() {
    const body = document.body;
    body.classList.toggle('colorblind-active');
    const isColorblindActive = body.classList.contains('colorblind-active');
    localStorage.setItem('colorblindMode', isColorblindActive ? 'active' : 'inactive');
    updateColorblindButtonState(isColorblindActive);
}

/**
 * Updates the visual state of the colorblind toggle button.
 * @param {boolean} isActive - True if colorblind mode is active, false otherwise.
 */
function updateColorblindButtonState(isActive) {
    const colorblindButton = document.getElementById('colorblind-toggle');
    if (colorblindButton) {
        // The colorblind button has a static title, so no translation needed here.
        // Its title is directly set in index.html for simplicity.
        colorblindButton.classList.toggle('active', isActive);
    }
}

/**
 * Applies the saved colorblind mode preference on page load.
 */
function applySavedColorblindMode() {
    const savedMode = localStorage.getItem('colorblindMode');
    if (savedMode === 'active') {
        document.body.classList.add('colorblind-active');
        updateColorblindButtonState(true);
    } else {
        document.body.classList.remove('colorblind-active');
        updateColorblindButtonState(false);
    }
}

// Set the current year in the footer
document.getElementById('currentYear').textContent = new Date().getFullYear();

// Initialize the page: set initial language and apply saved colorblind mode, then switch to it.
document.addEventListener('DOMContentLoaded', function () {
    setInitialLanguage(); // Determine language based on browser settings
    applySavedColorblindMode(); // Apply saved colorblind mode preference
    switchLanguage(currentLanguage); // Apply the determined language and update content
});
