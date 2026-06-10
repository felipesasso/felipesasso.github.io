// Content for the Git Workflow Map tool.
// Everything the page renders — diagram details, glossary, cheatsheet — lives here.

const GW_INTRO = `Click any box or arrow in the diagram to see what it means and which commands move your code between places.`;

// The four "places" your code can live, left to right along the diagram.
const GW_STAGES = {
    working: {
        title: 'Working Directory',
        badge: 'Where you edit',
        description: `The actual folder on your computer — the files you open, edit and save in your editor. Git is watching this folder, but it doesn't record anything here automatically. Until you run a Git command, edits just live as plain, uncommitted changes.`,
        bullets: [
            'Also called the "working tree".',
            '`git status` shows what’s changed here but not yet staged.',
            'Nothing here is safe in Git’s history until it’s committed.',
        ],
    },
    staging: {
        title: 'Staging Area',
        badge: 'Your draft commit',
        description: `Also called the "index" or "cache". It's a holding area between your working directory and your commit history — a draft of exactly what will go into your next commit. You can stage some changes and leave others out.`,
        bullets: [
            'Lets you build a commit out of only part of your changes.',
            'Staging a file copies its current content — edit it again afterwards and you’ll need to `git add` it again.',
            'Nothing here is part of the project history yet either — it’s still local and uncommitted.',
        ],
    },
    local: {
        title: 'Local Repository',
        badge: 'Your history (.git)',
        description: `The hidden .git folder inside your project. It stores the complete history of commits, branches and tags — entirely on your machine. You can commit, create branches, and browse history here with zero internet connection.`,
        bullets: [
            'Created by `git init` (new project) or `git clone` (existing project).',
            'A "commit" is a permanent, named snapshot saved here.',
            'Branches are just movable labels pointing at commits in this history.',
        ],
    },
    remote: {
        title: 'Remote Repository',
        badge: 'origin · GitHub',
        description: `A copy of the repository hosted on a server — usually GitHub, GitLab or Bitbucket. It's how you back up your work, share it with teammates, and collaborate. "origin" is just the nickname Git gives by default to the remote you cloned from.`,
        bullets: [
            '"origin" is an alias for a URL — see it with `git remote -v`.',
            'You can have more than one remote (e.g. `origin` and `upstream` for a fork).',
            'Nothing you do locally affects this until you `git push`.',
        ],
    },
};

// Commands shown as pills on the connectors between stages, plus the
// special "git clone" callout. Each key matches a data-detail attribute.
const GW_COMMANDS = {
    add: {
        title: 'git add',
        badge: 'Working Directory → Staging Area',
        description: `Copies the current version of a file from your working directory into the staging area, marking it to be included in your next commit.`,
        example: `git add index.html   # stage one file
git add .            # stage everything changed
git add -p           # choose chunks interactively`,
        notes: `Run \`git status\` any time — staged changes show in green, unstaged changes in red.`,
    },
    'restore-staged': {
        title: 'git restore --staged',
        badge: 'Staging Area → Working Directory',
        description: `Removes a file from the staging area without touching your edits. The changes stay in your working directory — they're just no longer queued for the next commit.`,
        example: `git restore --staged index.html

# older / equivalent syntax:
git reset HEAD index.html`,
        notes: `Unstaging never deletes work — it only changes what the next commit will include.`,
    },
    commit: {
        title: 'git commit',
        badge: 'Staging Area → Local Repository',
        description: `Takes a snapshot of everything currently in the staging area and saves it permanently to your local repository's history, with a message describing what changed.`,
        example: `git commit -m "Add login form validation"

# stage tracked files + commit, in one step
git commit -am "Fix typo in README"`,
        notes: `A commit only includes what was staged — anything left unstaged is not part of it.`,
    },
    reset: {
        title: 'git reset',
        badge: 'Local Repository → Staging Area / Working Directory',
        description: `Moves your branch pointer backwards — effectively "uncommitting". By default it keeps your changes, just unstaged, so you can fix and recommit them.`,
        example: `# undo last commit, keep changes unstaged
git reset HEAD~1

# undo last commit, keep changes staged
git reset --soft HEAD~1

# undo last commit AND discard the changes
git reset --hard HEAD~1`,
        notes: `Avoid rewriting commits that have already been pushed and shared — use \`git revert\` instead.`,
    },
    push: {
        title: 'git push',
        badge: 'Local Repository → Remote Repository',
        description: `Uploads your local commits to the remote repository (e.g. GitHub), updating the branch there to match yours.`,
        example: `git push origin main

# first push of a new branch — also sets it
# as the default for future push/pull
git push -u origin feature/login`,
        notes: `If the remote has commits you don't have yet, the push is rejected — fetch or pull first.`,
    },
    'fetch-pull': {
        title: 'git fetch / git pull',
        badge: 'Remote Repository → Local Repository (→ Working Directory)',
        description: `"git fetch" downloads new commits and branches from the remote but doesn't change your working files or current branch. "git pull" does a fetch AND immediately merges those changes into your current branch.`,
        example: `# download only — look around first
git fetch origin

# download + merge into current branch
git pull origin main

# download + replay your commits on top
git pull --rebase`,
        notes: `git pull = git fetch + git merge. Fetch first if you want to review incoming changes before merging them in.`,
    },
    clone: {
        title: 'git clone',
        badge: 'Remote Repository → brand-new Local setup',
        description: `Downloads a full copy of a remote repository — its entire history and default branch — and sets up a Working Directory, Staging Area and Local Repository on your machine in one go, automatically configured with "origin" pointing at that remote.`,
        example: `git clone https://github.com/user/repo.git
git clone git@github.com:user/repo.git   # via SSH`,
        notes: `Usually the very first command you run for a project that already exists on GitHub.`,
    },
};

// Simple commit-graph used by the branching diagram.
const GW_BRANCH_COMMANDS = [
    { cmd: 'git branch feature', desc: 'Create a new branch called "feature" pointing at your current commit. Doesn’t switch to it.' },
    { cmd: 'git switch -c feature', desc: 'Create AND switch to "feature" in one step (older equivalent: `git checkout -b feature`).' },
    { cmd: 'git switch main', desc: 'Switch your working directory back to the "main" branch (older equivalent: `git checkout main`).' },
    { cmd: 'git merge feature', desc: 'While on "main", merge the commits from "feature" into it — creates a merge commit joining both histories.' },
    { cmd: 'git push -u origin feature', desc: 'Publish a new local branch to the remote for the first time, and link it for future push/pull.' },
    { cmd: 'git branch -d feature', desc: 'Delete the "feature" branch locally once it’s merged — safe, refuses to delete unmerged work.' },
];

// Glossary of core concepts.
const GW_GLOSSARY = [
    {
        term: 'Repository (repo)',
        definition: `The project as Git tracks it — its files plus the entire history of changes. A repo can exist locally on your machine, remotely on a server, or both at once.`,
    },
    {
        term: 'Working Directory',
        definition: `The folder of files on disk that you're actively editing. Git compares this against the staging area and last commit to figure out what's "changed".`,
    },
    {
        term: 'Staging Area (Index)',
        definition: `A holding area between your working directory and your commit history, where you assemble exactly what should go into the next commit. Filled by \`git add\`.`,
    },
    {
        term: 'Commit',
        definition: `A saved, permanent snapshot of the staged changes — with a unique ID (hash), author, timestamp and message. Commits chained together form your project's history.`,
    },
    {
        term: 'HEAD',
        definition: `A pointer to the commit you currently have checked out — normally "the tip of your current branch". It moves forward automatically when you commit, and you move it manually when you switch branches.`,
    },
    {
        term: 'Branch',
        definition: `A lightweight, movable pointer to a commit, used as an independent line of work. Creating a branch lets you experiment or build a feature without touching "main" until you're ready to merge.`,
    },
    {
        term: 'Local vs. Remote',
        definition: `"Local" is the copy of the repo (with full history) on your machine, inside the .git folder. "Remote" is a copy hosted on a server like GitHub that you and others push to and pull from to share work.`,
    },
    {
        term: 'Origin',
        definition: `The conventional default name Git gives to the remote you cloned from — it's just a nickname for a URL. Run \`git remote -v\` to see what "origin" actually points to. You can rename it or add more remotes.`,
    },
    {
        term: 'Upstream / Tracking branch',
        definition: `A link between a local branch and a remote branch (e.g. local "main" tracks "origin/main"), so plain \`git push\` and \`git pull\` know where to send and receive changes without you specifying every time.`,
    },
    {
        term: 'Clone vs. Fork',
        definition: `\`git clone\` copies a repo onto your machine. "Fork" is a GitHub feature (not core Git) — it copies a repo into your own GitHub account so you can make changes and propose them back via a pull request, without needing write access to the original.`,
    },
    {
        term: 'Merge vs. Rebase',
        definition: `Both combine work from two branches. \`merge\` adds a new "merge commit" that joins the two histories together as-is. \`rebase\` rewrites your branch's commits to sit on top of the other branch's latest commit, producing a straight, linear history (but new commit hashes).`,
    },
    {
        term: 'Pull Request (PR)',
        definition: `A GitHub (not core Git) feature — a request to merge changes from one branch or fork into another, with a dedicated space for code review, comments and CI checks before anything is merged.`,
    },
];

// Full command cheatsheet, grouped by category.
const GW_CHEATSHEET = [
    {
        category: 'Setup & starting a project',
        items: [
            { cmd: 'git init', desc: 'Turn the current folder into a brand-new, empty Git repository.' },
            { cmd: 'git clone <url>', desc: 'Copy an existing remote repository (history and all) to your machine.' },
            { cmd: 'git remote add origin <url>', desc: 'Link a local repo (e.g. one started with `git init`) to a remote, so you can push/pull.' },
            { cmd: 'git config --global user.name "Your Name"', desc: 'Set the name attached to your commits.' },
            { cmd: 'git config --global user.email "you@example.com"', desc: 'Set the email attached to your commits.' },
        ],
    },
    {
        category: 'Day to day: edit → stage → commit',
        items: [
            { cmd: 'git status', desc: 'Show what’s changed, what’s staged, and what’s untracked.' },
            { cmd: 'git diff', desc: 'Show line-by-line unstaged changes in the working directory.' },
            { cmd: 'git diff --staged', desc: 'Show line-by-line changes that are staged for the next commit.' },
            { cmd: 'git add <file>', desc: 'Stage a specific file’s current changes.' },
            { cmd: 'git add .', desc: 'Stage all changed and new files in and below the current folder.' },
            { cmd: 'git commit -m "message"', desc: 'Save everything staged as a new commit with a description.' },
            { cmd: 'git log --oneline --graph', desc: 'View commit history as a compact, graphical list.' },
        ],
    },
    {
        category: 'Branching & merging',
        items: [
            { cmd: 'git branch', desc: 'List local branches (the current one is starred).' },
            { cmd: 'git branch <name>', desc: 'Create a new branch without switching to it.' },
            { cmd: 'git switch <branch>', desc: 'Switch to an existing branch (older equivalent: `git checkout <branch>`).' },
            { cmd: 'git switch -c <name>', desc: 'Create a new branch and switch to it in one step.' },
            { cmd: 'git merge <branch>', desc: 'Merge another branch’s commits into your current branch.' },
            { cmd: 'git branch -d <name>', desc: 'Delete a local branch — refuses if it has unmerged commits.' },
        ],
    },
    {
        category: 'Working with remotes (GitHub)',
        items: [
            { cmd: 'git remote -v', desc: 'List configured remotes and the URLs they point to.' },
            { cmd: 'git fetch', desc: 'Download new commits and branches from the remote without merging.' },
            { cmd: 'git pull', desc: 'Fetch from the remote AND merge into your current branch.' },
            { cmd: 'git push', desc: 'Upload your local commits to the remote branch.' },
            { cmd: 'git push -u origin <branch>', desc: 'Push a new branch and remember it for future push/pull.' },
        ],
    },
    {
        category: 'Undo & cleanup',
        items: [
            { cmd: 'git restore <file>', desc: 'Discard unstaged changes to a file, reverting it to the last commit.' },
            { cmd: 'git restore --staged <file>', desc: 'Unstage a file without losing your edits.' },
            { cmd: 'git reset HEAD~1', desc: 'Undo the last commit, keeping its changes unstaged.' },
            { cmd: 'git revert <commit>', desc: 'Create a new commit that undoes a previous one — safe for shared/pushed history.' },
            { cmd: 'git stash', desc: 'Temporarily shelve uncommitted changes so you can switch tasks.' },
            { cmd: 'git stash pop', desc: 'Reapply (and remove) the most recently stashed changes.' },
        ],
    },
];
