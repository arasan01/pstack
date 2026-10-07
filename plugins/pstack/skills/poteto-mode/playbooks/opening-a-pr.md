### Opening a PR

Invoked at the end of every other playbook.

**Worktree.** Work from a git worktree off main. Subagents inherit it. Multiple `Agent` calls on the same branch each get their own worktree, or `git fetch && git reset --hard origin/<branch>` between them. Dirty branch with unrelated work: patch out, fresh worktree, apply. Snarled worktree: reset from main, redo minimally. Before you commit, merge, or deploy from a worktree, list the live agents and stop every one that holds it, including grandchildren you never launched. A delegate's children do not inherit its brief, so a read-only instruction never reaches them. Confirm each stop, then run `git status` and read the tree you are about to ship.

**Commits.** Commit liberally. Rebase into small, ordered commits before opening PRs. Each commit is a future PR: landable, ordered to tell the story. Amend when the fix belongs in a just-made commit. New commit when separable.

**PRs.** Run `/deslop` over the diff before commit and `/no-comments` before review. Write every PR title, description, and commit body with `/technical-writing`, then `/unslop`. For Japanese text, apply `/deslop` in prose-only mode using its shared Japanese reference. Keep the project's required template and language. Apply every technical-writing layer except Diátaxis.

**Titles.** Use Conventional Commits in the form `type(scope): subject`. Use `feat`, `fix`, `docs`, `refactor`, `test`, `chore`, or `perf` as the type. Use the changed area, such as `pstack` or `poteto-mode`, as the scope. Keep the subject short and imperative. Name a real symbol when one carries the change. For example, `fix(pstack): retarget opening-a-pr babysit trigger`. Do not add a trailing period.

**Descriptions.** Write for the reviewer deciding whether this change is correct, safe to merge, and safe to use. The PR body is a briefing, not an execution diary. Each sentence must explain intent, changed behavior, a review-relevant decision or limitation, a risk, a rollout action, or verification evidence. Delete a sentence when removing it would not change any of those judgments.

Start from the diff and observed results, not a filled-out generic template. State why the change exists and what the user or consumer will notice. Give the actual verification command or scenario and its result. A small PR may need only a short summary and verification. Do not repeat the title, the diff, or the same change under several headings.

Use the repository's required PR template. Otherwise use short sections only where they add information:

- `## Summary` explains the problem and changed behavior in one to three short sentences or bullets. Name a path or symbol only when it helps the reviewer understand a contract, rename, or entry point.
- `## Verification` states what actually ran and what it proved. Name failed or unrun relevant checks and the remaining gap. Compilation or unit tests do not imply end-to-end verification. For a performance change, give one primary before/after number with units and link the method and remaining evidence.
- `## Risks` or `## Compatibility` names a real behavior change, affected consumer, public-contract change, or known limitation. Do not add stock reassurance or a list of everything unchanged.
- `## Rollout` names required migration order, configuration, deployment steps, or rollback actions. Keep instructions the operator needs in the body.
- `## Review notes` names a non-obvious tradeoff or requests a specific reviewer decision. Include an out-of-scope issue only when it affects what this PR promises or what the reviewer must decide.

Do not add empty sections, invented alternatives, generic risk statements, a file-by-file inventory, full SHAs, rebase history, agent names, skill names, swarm lane recitals, repeated test counts, or self-awarded verdicts. Do not publish the editing checklist. Link detailed logs and artifacts only when they support a claim, using a location the reviewer can access, not a machine-local path. Attach images or videos only when they prove a visual change.

Read the body once as the reviewer before creating or updating the PR. Remove process narration and duplicate facts, then check that brevity did not hide breaking changes, migration requirements, failed checks, or verification gaps. Aim for a body readable in under a minute and roughly 40 lines or fewer, but never meet a length target by deleting information needed to approve or operate the change. The squash commit body may reuse this briefing; it does not restate its subject.

**Forge.** Resolve the forge before the first PR operation and keep that choice for create, edit, view, watch, and merge. GitHub CLI (`gh`) is the default. If `command -v origin` succeeds and Origin can resolve the repository, prefer `origin pr ...`. If Origin is absent or cannot resolve the repository, stay on `gh` and record the fallback. Do not require Graphite (`gt`).

**Built-in PR tool.** When the run provides a built-in PR tool, create, edit, retarget, and mark ready through it, never through a forge CLI. Its own instructions say how. A PR made with the CLI misses what the tool tracks, such as a description later runs can edit. Use the resolved forge for everything the tool does not cover, and for every PR operation when the run has no such tool.

**Size and stacks.** Prefer five narrow PRs to one large PR. A stack is a base-branch chain. The root PR targets trunk. Each child branch rebases onto its parent's exact tip and its PR targets the parent branch. Without a built-in PR tool, create a child with `origin pr create --status open --base <parent-branch>` or `gh pr create --base <parent-branch>` according to the resolved forge, and retarget an existing child with `origin pr edit <pr> --base <parent-branch>` or `gh pr edit <pr> --base <parent-branch>`. Branch from trunk only for independent work. Rebase on trunk before substantial stack work.

**Readiness.** Open every PR ready, never as a draft. A built-in PR tool can default to draft, so set `draft: false` on every creation call through it. With Origin, pass `--status open`. With `gh`, omit `--draft`. If a PR still opens as a draft, mark it ready through the PR tool, or run `origin pr ready <number>` or `gh pr ready <number>` according to the resolved forge. Run `origin pr view <number>` or `gh pr view <number>` before you refer to PR status.

**Babysit.** Opening a PR does not start a babysit. Post the URL and keep building. Finish the phase or stack first. Run a separate babysit pass only when the user asks for one after the whole stack exists, per `babysit.md`. A babysit for each new PR stalls the build and spends checks on commits that later waves restart. Push back when feedback drifts from intent.

A subagent that opens a PR runs `interrogate`, `/deslop`, and `/no-comments`, and posts the URL. Then it returns to the parent without babysitting, unless it is an Autopilot-full or Autopilot-stack owner. That owner's brief assigns the babysit loop and is the ask `playbooks/babysit.md` waits for. The owner starts the loop after its code-ready report and reports merge-ready or STACK-READY as its playbook says. The rules here and in `playbooks/babysit.md` that hold babysitting until a whole stack is built do not apply to that owner.
