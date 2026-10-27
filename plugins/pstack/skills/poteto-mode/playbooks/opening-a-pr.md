### Opening a PR

Invoked at the end of every other playbook.

**Worktree.** Use a separate worktree for isolated work. On omp, native delegation and isolation rules in [the mapping](../references/omp-tools.md) take precedence. Concurrent writers need separate worktrees or disjoint output paths; a branch alone is not filesystem isolation. Never reset or discard a dirty tree to make room for a delegate. Preserve unrelated tracked and untracked work and use a fresh worktree instead. Before committing or integrating, reconcile every writer that holds the affected tree, including descendants. Confirm a native stop when supported; otherwise keep its output isolated rather than claiming the writer stopped.

**Commits.** Commit liberally. Rebase into small, ordered commits before opening PRs. Each commit is a future PR: landable, ordered to tell the story. Amend when the fix belongs in a just-made commit. New commit when separable. Commit bodies don't restate the subject.

**PRs.** Run `/deslop` over the diff before commit and `/no-comments` before review. Write titles, descriptions, and commit bodies through `/technical-writing`, except its Diátaxis layer, then `/unslop`. Use one word per action, keep articles, and prefer a plain verb over an unnecessary `-ing` phrase. Follow the project's required template and language. For Japanese prose, apply `/deslop`'s shared Japanese reference without starting a code-cleanup pass.

**Titles.** Conventional Commits `type(scope): subject`, no trailing period. Type such as `feat`, `fix`, `docs`, `refactor`, `test`, `chore`, or `perf`. Scope is the area, such as `pstack` or `poteto-mode`. Subject is short, imperative, and names a real symbol when one carries the change, for example `fix(pstack): retarget opening-a-pr babysit trigger`.

**Descriptions.** Write a short briefing for a reviewer deciding whether this is correct, safe to merge, and safe to use. Start from the diff and observed results, not an execution diary. Say why the change exists, what users or consumers notice, what it leaves out, what could break, and how you proved it works.

Use the repository's required template. Otherwise use `##` headings in this order, dropping sections with nothing useful to add:

- `## Why` states the problem and approach in one to three short sentences.
- `## What changed` names the changed behavior in one to three short bullets. Name both sides of a rename when relevant.
- `## Scope` states coverage and deliberate exclusions without repeating the summary.
- `## Tradeoffs` gives actual rejected alternatives a reviewer would ask about.
- `## Blast radius` names affected consumers, compatibility changes, and real risks.
- `## Verification` states actual commands or user scenarios and their outcomes. Name relevant failed or unrun checks and the resulting gap. For performance work, give one primary before-and-after number with units and link its method and remaining evidence.

Keep required migration, rollout, and rollback instructions in the body, even when that needs another section. Compilation and unit tests do not imply end-to-end proof. Attach screenshots or video for visual claims and the matching execution evidence for nonvisual work. Put detailed logs, full SHAs, and review-lane reports in an accessible linked artifact, not a machine-local path.

Read once as the reviewer before publishing. Remove duplicate facts, file inventories, rebase genealogy, process narration, skill names, and self-awarded verdicts. Aim for a one-minute body and roughly 40 lines, but never hide breaking changes, failed checks, or operational instructions to meet that length. The squash commit body may reuse the briefing without restating its subject.

**Forge.** Resolve the forge before the first PR operation and keep that choice for create, edit, view, watch, and merge. GitHub CLI (`gh`) is the default. If `command -v origin` succeeds and Origin can resolve the repository, prefer `origin pr ...`. If Origin is absent or cannot resolve the repository, stay on `gh` and record the fallback. Do not require Graphite (`gt`).

**Native PR tool.** Prefer the current runtime's native PR tool for supported operations, within its permissions and schema. Do not force a platform-specific draft, model, or lifecycle field it does not accept. Use the resolved forge for unsupported operations only when authorized and when it provides the required safety conditions. Tool availability does not grant merge authority.

**Size and stacks.** Prefer narrow, independently reviewable PRs. A stack is a base-branch chain: the root targets trunk and each child targets its parent branch. Its topology owner coordinates bases and rewrites under [Merge and restack safety](../references/merge-safety.md), including pending-request cancellation and explicit leases. After a parent lands, prepare only its next child through `playbooks/shipping.md`; do not rebase or retarget the chain independently. Use a supported native PR tool or the resolved forge's validated create and base-edit operations. Branch from trunk for independent work.

**Readiness.** Open a ready PR unless the operator or project requires a draft. Use the native tool's documented readiness field when available; with Origin use `--status open`, and with `gh` omit `--draft`. If it opens as draft unintentionally, mark it ready through a supported tool, then read the actual PR status before reporting it.

**Babysit.** Opening a PR does not start babysitting. Post the URL and keep building the requested phase or stack. Run a separate babysit pass only when asked, per `playbooks/babysit.md`. Starting one for every new PR stalls the build and repeats checks on superseded heads. Push back on feedback outside the change's intent.

A subagent that opens a PR runs `interrogate`, `/deslop`, and `/no-comments`, and posts the URL. It returns to the parent without babysitting, unless it is an Autopilot-full or Autopilot-stack owner. That owner's brief assigns the babysit loop and is the ask `playbooks/babysit.md` waits for. The owner starts the loop after its code-ready report, reports merge-ready or STACK-READY per its playbook, and is exempt from the rules here and in `playbooks/babysit.md` that hold babysitting until a whole stack is built.
