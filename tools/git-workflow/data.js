// Content for the Git Workflow Map tool.
// Everything the page renders — diagram details, glossary, cheatsheet — lives here.
// Every translatable string has an `_pt` sibling field for Brazilian Portuguese;
// app.js falls back to the English field if a `_pt` field is missing.

const GW_INTRO = `Click any box or arrow in the diagram to see what it means and which commands move your code between places.`;
const GW_INTRO_PT = `Clique em qualquer caixa ou seta do diagrama para ver o que ela significa e quais comandos movem o seu código entre os lugares.`;

// The four "places" your code can live, left to right along the diagram.
const GW_STAGES = {
    working: {
        title: 'Working Directory',
        title_pt: 'Diretório de Trabalho',
        badge: 'Where you edit',
        badge_pt: 'Onde você edita',
        description: `The actual folder on your computer — the files you open, edit and save in your editor. Git is watching this folder, but it doesn't record anything here automatically. Until you run a Git command, edits just live as plain, uncommitted changes.`,
        description_pt: `A pasta de verdade no seu computador — os arquivos que você abre, edita e salva no seu editor. O Git está observando essa pasta, mas não registra nada aqui automaticamente. Até você rodar um comando do Git, as edições continuam sendo apenas mudanças não commitadas.`,
        bullets: [
            'Also called the "working tree".',
            '`git status` shows what’s changed here but not yet staged.',
            'Nothing here is safe in Git’s history until it’s committed.',
        ],
        bullets_pt: [
            'Também chamado de "working tree" (árvore de trabalho).',
            '`git status` mostra o que mudou aqui mas ainda não foi staged.',
            'Nada aqui está seguro no histórico do Git até ser commitado.',
        ],
    },
    staging: {
        title: 'Staging Area',
        title_pt: 'Staging Area',
        badge: 'Your draft commit',
        badge_pt: 'O rascunho do seu commit',
        description: `Also called the "index" or "cache". It's a holding area between your working directory and your commit history — a draft of exactly what will go into your next commit. You can stage some changes and leave others out.`,
        description_pt: `Também chamada de "index" ou "cache". É uma área intermediária entre o seu diretório de trabalho e o histórico de commits — um rascunho exato do que vai entrar no seu próximo commit. Você pode dar stage em algumas mudanças e deixar outras de fora.`,
        bullets: [
            'Lets you build a commit out of only part of your changes.',
            'Staging a file copies its current content — edit it again afterwards and you’ll need to `git add` it again.',
            'Nothing here is part of the project history yet either — it’s still local and uncommitted.',
        ],
        bullets_pt: [
            'Permite montar um commit usando apenas parte das suas mudanças.',
            'Dar stage em um arquivo copia o conteúdo atual dele — se você editar de novo depois, vai precisar rodar `git add` novamente.',
            'Nada aqui ainda faz parte do histórico do projeto — continua local e não commitado.',
        ],
    },
    local: {
        title: 'Local Repository',
        title_pt: 'Repositório Local',
        badge: 'Your history (.git)',
        badge_pt: 'Seu histórico (.git)',
        description: `The hidden .git folder inside your project. It stores the complete history of commits, branches and tags — entirely on your machine. You can commit, create branches, and browse history here with zero internet connection.`,
        description_pt: `A pasta oculta .git dentro do seu projeto. Ela guarda o histórico completo de commits, branches e tags — totalmente na sua máquina. Você pode commitar, criar branches e navegar pelo histórico aqui sem nenhuma conexão com a internet.`,
        bullets: [
            'Created by `git init` (new project) or `git clone` (existing project).',
            'A "commit" is a permanent, named snapshot saved here.',
            'Branches are just movable labels pointing at commits in this history.',
        ],
        bullets_pt: [
            'Criada por `git init` (projeto novo) ou `git clone` (projeto existente).',
            'Um "commit" é um snapshot permanente e nomeado salvo aqui.',
            'Branches são apenas rótulos móveis apontando para commits desse histórico.',
        ],
    },
    remote: {
        title: 'Remote Repository',
        title_pt: 'Repositório Remoto',
        badge: 'origin · GitHub',
        badge_pt: 'origin · GitHub',
        description: `A copy of the repository hosted on a server — usually GitHub, GitLab or Bitbucket. It's how you back up your work, share it with teammates, and collaborate. "origin" is just the nickname Git gives by default to the remote you cloned from.`,
        description_pt: `Uma cópia do repositório hospedada em um servidor — geralmente GitHub, GitLab ou Bitbucket. É assim que você faz backup do seu trabalho, compartilha com o time e colabora. "origin" é apenas o apelido que o Git dá por padrão ao remote de onde você clonou.`,
        bullets: [
            '"origin" is an alias for a URL — see it with `git remote -v`.',
            'You can have more than one remote (e.g. `origin` and `upstream` for a fork).',
            'Nothing you do locally affects this until you `git push`.',
        ],
        bullets_pt: [
            '"origin" é um apelido para uma URL — veja com `git remote -v`.',
            'Você pode ter mais de um remote (ex.: `origin` e `upstream` em um fork).',
            'Nada do que você faz localmente afeta isso até você rodar `git push`.',
        ],
    },
};

// Commands shown as pills on the connectors between stages, plus the
// special "git clone" callout. Each key matches a data-detail attribute.
const GW_COMMANDS = {
    add: {
        title: 'git add',
        title_pt: 'git add',
        badge: 'Working Directory → Staging Area',
        badge_pt: 'Diretório de Trabalho → Staging Area',
        description: `Copies the current version of a file from your working directory into the staging area, marking it to be included in your next commit.`,
        description_pt: `Copia a versão atual de um arquivo do seu diretório de trabalho para a staging area, marcando-o para ser incluído no seu próximo commit.`,
        example: `git add index.html   # stage one file
git add .            # stage everything changed
git add -p           # choose chunks interactively`,
        example_pt: `git add index.html   # dá stage em um arquivo
git add .            # dá stage em tudo que mudou
git add -p           # escolhe trechos interativamente`,
        notes: `Run \`git status\` any time — staged changes show in green, unstaged changes in red.`,
        notes_pt: `Rode \`git status\` a qualquer momento — mudanças com stage aparecem em verde, sem stage aparecem em vermelho.`,
    },
    'restore-staged': {
        title: 'git restore --staged',
        title_pt: 'git restore --staged',
        badge: 'Staging Area → Working Directory',
        badge_pt: 'Staging Area → Diretório de Trabalho',
        description: `Removes a file from the staging area without touching your edits. The changes stay in your working directory — they're just no longer queued for the next commit.`,
        description_pt: `Remove um arquivo da staging area sem mexer nas suas edições. As mudanças continuam no seu diretório de trabalho — elas só deixam de estar na fila para o próximo commit.`,
        example: `git restore --staged index.html

# older / equivalent syntax:
git reset HEAD index.html`,
        example_pt: `git restore --staged index.html

# sintaxe mais antiga / equivalente:
git reset HEAD index.html`,
        notes: `Unstaging never deletes work — it only changes what the next commit will include.`,
        notes_pt: `Tirar do stage nunca apaga trabalho — só muda o que o próximo commit vai incluir.`,
    },
    commit: {
        title: 'git commit',
        title_pt: 'git commit',
        badge: 'Staging Area → Local Repository',
        badge_pt: 'Staging Area → Repositório Local',
        description: `Takes a snapshot of everything currently in the staging area and saves it permanently to your local repository's history, with a message describing what changed.`,
        description_pt: `Tira um snapshot de tudo que está atualmente na staging area e salva permanentemente no histórico do seu repositório local, com uma mensagem descrevendo o que mudou.`,
        example: `git commit -m "Add login form validation"

# stage tracked files + commit, in one step
git commit -am "Fix typo in README"`,
        example_pt: `git commit -m "Add login form validation"

# dá stage em arquivos rastreados + commita, em um passo só
git commit -am "Fix typo in README"`,
        notes: `A commit only includes what was staged — anything left unstaged is not part of it.`,
        notes_pt: `Um commit inclui só o que estava staged — o que ficou de fora do stage não entra nele.`,
    },
    reset: {
        title: 'git reset',
        title_pt: 'git reset',
        badge: 'Local Repository → Staging Area / Working Directory',
        badge_pt: 'Repositório Local → Staging Area / Diretório de Trabalho',
        description: `Moves your branch pointer backwards — effectively "uncommitting". By default it keeps your changes, just unstaged, so you can fix and recommit them.`,
        description_pt: `Move o ponteiro da sua branch para trás — na prática, "descommitando". Por padrão ele mantém suas mudanças, só sem stage, para você corrigir e commitar de novo.`,
        example: `# undo last commit, keep changes unstaged
git reset HEAD~1

# undo last commit, keep changes staged
git reset --soft HEAD~1

# undo last commit AND discard the changes
git reset --hard HEAD~1`,
        example_pt: `# desfaz o último commit, mantém mudanças sem stage
git reset HEAD~1

# desfaz o último commit, mantém mudanças staged
git reset --soft HEAD~1

# desfaz o último commit E descarta as mudanças
git reset --hard HEAD~1`,
        notes: `Avoid rewriting commits that have already been pushed and shared — use \`git revert\` instead.`,
        notes_pt: `Evite reescrever commits que já foram enviados (push) e compartilhados — use \`git revert\` nesses casos.`,
    },
    push: {
        title: 'git push',
        title_pt: 'git push',
        badge: 'Local Repository → Remote Repository',
        badge_pt: 'Repositório Local → Repositório Remoto',
        description: `Uploads your local commits to the remote repository (e.g. GitHub), updating the branch there to match yours.`,
        description_pt: `Envia seus commits locais para o repositório remoto (ex.: GitHub), atualizando a branch lá para ficar igual à sua.`,
        example: `git push origin main

# first push of a new branch — also sets it
# as the default for future push/pull
git push -u origin feature/login`,
        example_pt: `git push origin main

# primeiro push de uma branch nova — também
# define ela como padrão para futuros push/pull
git push -u origin feature/login`,
        notes: `If the remote has commits you don't have yet, the push is rejected — fetch or pull first.`,
        notes_pt: `Se o remote tiver commits que você ainda não tem, o push é rejeitado — rode fetch ou pull antes.`,
    },
    'fetch-pull': {
        title: 'git fetch / git pull',
        title_pt: 'git fetch / git pull',
        badge: 'Remote Repository → Local Repository (→ Working Directory)',
        badge_pt: 'Repositório Remoto → Repositório Local (→ Diretório de Trabalho)',
        description: `"git fetch" downloads new commits and branches from the remote but doesn't change your working files or current branch. "git pull" does a fetch AND immediately merges those changes into your current branch.`,
        description_pt: `"git fetch" baixa novos commits e branches do remote, mas não muda seus arquivos de trabalho nem a branch atual. "git pull" faz um fetch E já mescla (merge) essas mudanças na sua branch atual.`,
        example: `# download only — look around first
git fetch origin

# download + merge into current branch
git pull origin main

# download + replay your commits on top
git pull --rebase`,
        example_pt: `# só baixa — para dar uma olhada antes
git fetch origin

# baixa + mescla na branch atual
git pull origin main

# baixa + reaplica seus commits por cima
git pull --rebase`,
        notes: `git pull = git fetch + git merge. Fetch first if you want to review incoming changes before merging them in.`,
        notes_pt: `git pull = git fetch + git merge. Faça fetch primeiro se quiser revisar as mudanças antes de mesclá-las.`,
    },
    clone: {
        title: 'git clone',
        title_pt: 'git clone',
        badge: 'Remote Repository → brand-new Local setup',
        badge_pt: 'Repositório Remoto → setup local do zero',
        description: `Downloads a full copy of a remote repository — its entire history and default branch — and sets up a Working Directory, Staging Area and Local Repository on your machine in one go, automatically configured with "origin" pointing at that remote.`,
        description_pt: `Baixa uma cópia completa de um repositório remoto — todo o histórico e a branch padrão — e monta um Diretório de Trabalho, Staging Area e Repositório Local na sua máquina de uma só vez, já configurado com "origin" apontando para esse remote.`,
        example: `git clone https://github.com/user/repo.git
git clone git@github.com:user/repo.git   # via SSH`,
        example_pt: `git clone https://github.com/user/repo.git
git clone git@github.com:user/repo.git   # via SSH`,
        notes: `Usually the very first command you run for a project that already exists on GitHub.`,
        notes_pt: `Geralmente é o primeiro comando que você roda para um projeto que já existe no GitHub.`,
    },
};

// Simple commit-graph used by the branching diagram.
const GW_BRANCH_COMMANDS = [
    {
        cmd: 'git branch feature',
        desc: 'Create a new branch called "feature" pointing at your current commit. Doesn’t switch to it.',
        desc_pt: 'Cria uma nova branch chamada "feature" apontando para o seu commit atual. Não muda para ela.',
    },
    {
        cmd: 'git switch -c feature',
        desc: 'Create AND switch to "feature" in one step (older equivalent: `git checkout -b feature`).',
        desc_pt: 'Cria E já muda para "feature" em um passo só (equivalente mais antigo: `git checkout -b feature`).',
    },
    {
        cmd: 'git switch main',
        desc: 'Switch your working directory back to the "main" branch (older equivalent: `git checkout main`).',
        desc_pt: 'Volta seu diretório de trabalho para a branch "main" (equivalente mais antigo: `git checkout main`).',
    },
    {
        cmd: 'git merge feature',
        desc: 'While on "main", merge the commits from "feature" into it — creates a merge commit joining both histories.',
        desc_pt: 'Estando na "main", mescla os commits da "feature" nela — cria um commit de merge juntando os dois históricos.',
    },
    {
        cmd: 'git push -u origin feature',
        desc: 'Publish a new local branch to the remote for the first time, and link it for future push/pull.',
        desc_pt: 'Publica uma branch local nova no remote pela primeira vez, e a vincula para futuros push/pull.',
    },
    {
        cmd: 'git branch -d feature',
        desc: 'Delete the "feature" branch locally once it’s merged — safe, refuses to delete unmerged work.',
        desc_pt: 'Apaga a branch "feature" localmente depois que ela for mesclada — seguro, recusa apagar trabalho não mesclado.',
    },
];

// Glossary of core concepts.
const GW_GLOSSARY = [
    {
        term: 'Repository (repo)',
        term_pt: 'Repositório (repo)',
        definition: `The project as Git tracks it — its files plus the entire history of changes. A repo can exist locally on your machine, remotely on a server, or both at once.`,
        definition_pt: `O projeto da forma como o Git o rastreia — seus arquivos mais todo o histórico de mudanças. Um repo pode existir localmente na sua máquina, remotamente em um servidor, ou nos dois ao mesmo tempo.`,
    },
    {
        term: 'Working Directory',
        term_pt: 'Diretório de Trabalho',
        definition: `The folder of files on disk that you're actively editing. Git compares this against the staging area and last commit to figure out what's "changed".`,
        definition_pt: `A pasta de arquivos em disco que você está editando ativamente. O Git compara isso com a staging area e o último commit para descobrir o que "mudou".`,
    },
    {
        term: 'Staging Area (Index)',
        term_pt: 'Staging Area (Index)',
        definition: `A holding area between your working directory and your commit history, where you assemble exactly what should go into the next commit. Filled by \`git add\`.`,
        definition_pt: `Uma área intermediária entre o seu diretório de trabalho e o histórico de commits, onde você monta exatamente o que vai entrar no próximo commit. Preenchida com \`git add\`.`,
    },
    {
        term: 'Commit',
        term_pt: 'Commit',
        definition: `A saved, permanent snapshot of the staged changes — with a unique ID (hash), author, timestamp and message. Commits chained together form your project's history.`,
        definition_pt: `Um snapshot salvo e permanente das mudanças staged — com um ID único (hash), autor, data/hora e mensagem. Commits encadeados formam o histórico do seu projeto.`,
    },
    {
        term: 'HEAD',
        term_pt: 'HEAD',
        definition: `A pointer to the commit you currently have checked out — normally "the tip of your current branch". It moves forward automatically when you commit, and you move it manually when you switch branches.`,
        definition_pt: `Um ponteiro para o commit que você tem atualmente "dado checkout" — normalmente "a ponta da sua branch atual". Ele avança automaticamente quando você commita, e você o move manualmente ao trocar de branch.`,
    },
    {
        term: 'Branch',
        term_pt: 'Branch',
        definition: `A lightweight, movable pointer to a commit, used as an independent line of work. Creating a branch lets you experiment or build a feature without touching "main" until you're ready to merge.`,
        definition_pt: `Um ponteiro leve e móvel para um commit, usado como uma linha de trabalho independente. Criar uma branch permite experimentar ou construir uma feature sem mexer na "main" até você estar pronto para mesclar.`,
    },
    {
        term: 'Local vs. Remote',
        term_pt: 'Local vs. Remoto',
        definition: `"Local" is the copy of the repo (with full history) on your machine, inside the .git folder. "Remote" is a copy hosted on a server like GitHub that you and others push to and pull from to share work.`,
        definition_pt: `"Local" é a cópia do repo (com histórico completo) na sua máquina, dentro da pasta .git. "Remoto" é uma cópia hospedada em um servidor como o GitHub, para onde você e outras pessoas dão push e pull para compartilhar o trabalho.`,
    },
    {
        term: 'Origin',
        term_pt: 'Origin',
        definition: `The conventional default name Git gives to the remote you cloned from — it's just a nickname for a URL. Run \`git remote -v\` to see what "origin" actually points to. You can rename it or add more remotes.`,
        definition_pt: `O nome padrão que o Git dá por convenção ao remote de onde você clonou — é só um apelido para uma URL. Rode \`git remote -v\` para ver para onde "origin" de fato aponta. Você pode renomeá-lo ou adicionar outros remotes.`,
    },
    {
        term: 'Upstream / Tracking branch',
        term_pt: 'Upstream / Tracking branch',
        definition: `A link between a local branch and a remote branch (e.g. local "main" tracks "origin/main"), so plain \`git push\` and \`git pull\` know where to send and receive changes without you specifying every time.`,
        definition_pt: `Um vínculo entre uma branch local e uma branch remota (ex.: a "main" local rastreia "origin/main"), para que \`git push\` e \`git pull\` simples saibam para onde enviar e de onde receber mudanças sem você especificar toda vez.`,
    },
    {
        term: 'Clone vs. Fork',
        term_pt: 'Clone vs. Fork',
        definition: `\`git clone\` copies a repo onto your machine. "Fork" is a GitHub feature (not core Git) — it copies a repo into your own GitHub account so you can make changes and propose them back via a pull request, without needing write access to the original.`,
        definition_pt: `\`git clone\` copia um repo para a sua máquina. "Fork" é um recurso do GitHub (não é do Git em si) — copia um repo para a sua própria conta do GitHub, para você fazer mudanças e propô-las de volta via pull request, sem precisar de acesso de escrita ao original.`,
    },
    {
        term: 'Merge vs. Rebase',
        term_pt: 'Merge vs. Rebase',
        definition: `Both combine work from two branches. \`merge\` adds a new "merge commit" that joins the two histories together as-is. \`rebase\` rewrites your branch's commits to sit on top of the other branch's latest commit, producing a straight, linear history (but new commit hashes).`,
        definition_pt: `Os dois combinam o trabalho de duas branches. \`merge\` adiciona um novo "commit de merge" que junta os dois históricos como estão. \`rebase\` reescreve os commits da sua branch para ficarem em cima do commit mais recente da outra branch, produzindo um histórico linear (mas com novos hashes de commit).`,
    },
    {
        term: 'Pull Request (PR)',
        term_pt: 'Pull Request (PR)',
        definition: `A GitHub (not core Git) feature — a request to merge changes from one branch or fork into another, with a dedicated space for code review, comments and CI checks before anything is merged.`,
        definition_pt: `Um recurso do GitHub (não é do Git em si) — um pedido para mesclar mudanças de uma branch ou fork em outra, com um espaço dedicado para code review, comentários e checks de CI antes de qualquer coisa ser mesclada.`,
    },
];

// Full command cheatsheet, grouped by category.
const GW_CHEATSHEET = [
    {
        category: 'Setup & starting a project',
        category_pt: 'Configuração e início de projeto',
        items: [
            {
                cmd: 'git init',
                desc: 'Turn the current folder into a brand-new, empty Git repository.',
                desc_pt: 'Transforma a pasta atual em um repositório Git novo e vazio.',
            },
            {
                cmd: 'git clone <url>',
                desc: 'Copy an existing remote repository (history and all) to your machine.',
                desc_pt: 'Copia um repositório remoto existente (com histórico e tudo) para a sua máquina.',
            },
            {
                cmd: 'git remote add origin <url>',
                desc: 'Link a local repo (e.g. one started with `git init`) to a remote, so you can push/pull.',
                desc_pt: 'Vincula um repo local (ex.: um criado com `git init`) a um remote, para você poder dar push/pull.',
            },
            {
                cmd: 'git config --global user.name "Your Name"',
                desc: 'Set the name attached to your commits.',
                desc_pt: 'Define o nome associado aos seus commits.',
            },
            {
                cmd: 'git config --global user.email "you@example.com"',
                desc: 'Set the email attached to your commits.',
                desc_pt: 'Define o e-mail associado aos seus commits.',
            },
        ],
    },
    {
        category: 'Day to day: edit → stage → commit',
        category_pt: 'Dia a dia: editar → stage → commit',
        items: [
            {
                cmd: 'git status',
                desc: 'Show what’s changed, what’s staged, and what’s untracked.',
                desc_pt: 'Mostra o que mudou, o que está staged e o que não está rastreado.',
            },
            {
                cmd: 'git diff',
                desc: 'Show line-by-line unstaged changes in the working directory.',
                desc_pt: 'Mostra, linha a linha, as mudanças sem stage no diretório de trabalho.',
            },
            {
                cmd: 'git diff --staged',
                desc: 'Show line-by-line changes that are staged for the next commit.',
                desc_pt: 'Mostra, linha a linha, as mudanças staged para o próximo commit.',
            },
            {
                cmd: 'git add <file>',
                desc: 'Stage a specific file’s current changes.',
                desc_pt: 'Dá stage nas mudanças atuais de um arquivo específico.',
            },
            {
                cmd: 'git add .',
                desc: 'Stage all changed and new files in and below the current folder.',
                desc_pt: 'Dá stage em todos os arquivos novos e modificados na pasta atual e nas subpastas.',
            },
            {
                cmd: 'git commit -m "message"',
                desc: 'Save everything staged as a new commit with a description.',
                desc_pt: 'Salva tudo que está staged como um novo commit com uma descrição.',
            },
            {
                cmd: 'git log --oneline --graph',
                desc: 'View commit history as a compact, graphical list.',
                desc_pt: 'Visualiza o histórico de commits como uma lista compacta e gráfica.',
            },
        ],
    },
    {
        category: 'Branching & merging',
        category_pt: 'Branches e merges',
        items: [
            {
                cmd: 'git branch',
                desc: 'List local branches (the current one is starred).',
                desc_pt: 'Lista as branches locais (a atual aparece com um asterisco).',
            },
            {
                cmd: 'git branch <name>',
                desc: 'Create a new branch without switching to it.',
                desc_pt: 'Cria uma nova branch sem mudar para ela.',
            },
            {
                cmd: 'git switch <branch>',
                desc: 'Switch to an existing branch (older equivalent: `git checkout <branch>`).',
                desc_pt: 'Muda para uma branch existente (equivalente mais antigo: `git checkout <branch>`).',
            },
            {
                cmd: 'git switch -c <name>',
                desc: 'Create a new branch and switch to it in one step.',
                desc_pt: 'Cria uma nova branch e já muda para ela em um passo só.',
            },
            {
                cmd: 'git merge <branch>',
                desc: 'Merge another branch’s commits into your current branch.',
                desc_pt: 'Mescla os commits de outra branch na sua branch atual.',
            },
            {
                cmd: 'git branch -d <name>',
                desc: 'Delete a local branch — refuses if it has unmerged commits.',
                desc_pt: 'Apaga uma branch local — recusa se ela tiver commits não mesclados.',
            },
        ],
    },
    {
        category: 'Working with remotes (GitHub)',
        category_pt: 'Trabalhando com remotes (GitHub)',
        items: [
            {
                cmd: 'git remote -v',
                desc: 'List configured remotes and the URLs they point to.',
                desc_pt: 'Lista os remotes configurados e as URLs para onde apontam.',
            },
            {
                cmd: 'git fetch',
                desc: 'Download new commits and branches from the remote without merging.',
                desc_pt: 'Baixa novos commits e branches do remote sem mesclar.',
            },
            {
                cmd: 'git pull',
                desc: 'Fetch from the remote AND merge into your current branch.',
                desc_pt: 'Faz fetch do remote E mescla na sua branch atual.',
            },
            {
                cmd: 'git push',
                desc: 'Upload your local commits to the remote branch.',
                desc_pt: 'Envia seus commits locais para a branch remota.',
            },
            {
                cmd: 'git push -u origin <branch>',
                desc: 'Push a new branch and remember it for future push/pull.',
                desc_pt: 'Envia uma branch nova e a memoriza para futuros push/pull.',
            },
        ],
    },
    {
        category: 'Undo & cleanup',
        category_pt: 'Desfazer e limpar',
        items: [
            {
                cmd: 'git restore <file>',
                desc: 'Discard unstaged changes to a file, reverting it to the last commit.',
                desc_pt: 'Descarta mudanças sem stage de um arquivo, revertendo-o para o último commit.',
            },
            {
                cmd: 'git restore --staged <file>',
                desc: 'Unstage a file without losing your edits.',
                desc_pt: 'Tira um arquivo do stage sem perder suas edições.',
            },
            {
                cmd: 'git reset HEAD~1',
                desc: 'Undo the last commit, keeping its changes unstaged.',
                desc_pt: 'Desfaz o último commit, mantendo as mudanças sem stage.',
            },
            {
                cmd: 'git revert <commit>',
                desc: 'Create a new commit that undoes a previous one — safe for shared/pushed history.',
                desc_pt: 'Cria um novo commit que desfaz um anterior — seguro para histórico já compartilhado/enviado.',
            },
            {
                cmd: 'git stash',
                desc: 'Temporarily shelve uncommitted changes so you can switch tasks.',
                desc_pt: 'Guarda temporariamente mudanças não commitadas para você trocar de tarefa.',
            },
            {
                cmd: 'git stash pop',
                desc: 'Reapply (and remove) the most recently stashed changes.',
                desc_pt: 'Reaplica (e remove) as mudanças guardadas mais recentemente no stash.',
            },
        ],
    },
];
