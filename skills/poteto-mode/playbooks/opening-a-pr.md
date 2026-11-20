### Opening a PR

Use when the operator's request or selected implementation workflow authorizes a PR. This playbook does not extend an investigation, plan, diagnosis, prototype, review-only request, or cleanup beyond its own stopping boundary.

**Prepare the change.** Keep unrelated tracked and untracked work intact. Use separate worktrees or disjoint output paths for concurrent writers under the [native operations reference](../references/omp-tools.md). Reconcile all writers, including descendants, before committing or integrating. Confirm a native stop when supported. Otherwise keep the writer's output isolated. Rebase authorized work into small, landable commits without resetting a dirty tree.

Run `skill:deslop` before committing and `skill:no-comments` before review. Satisfy the selected workflow's independent correctness-review gate. Opening a PR alone does not require an extra `skill:interrogate` run.

**Write the briefing.** Use `skill:technical-writing` and `skill:unslop` for the PR and commit messages. Follow the project's template and language. Write the title as `type(scope): subject`, with a short imperative subject and a real symbol when it carries the change. Aim for a one-minute body of about 40 lines. Without a required template, use the applicable headings below. Drop empty sections.

- `## Why` states the problem and approach.
- `## What changed` states what users or consumers notice. Name both sides of a rename when relevant.
- `## Scope` names coverage and deliberate exclusions.
- `## Tradeoffs` records rejected alternatives the reviewer would ask about.
- `## Blast radius` names affected consumers, compatibility changes, and risks.
- `## Verification` gives the actual commands or scenarios and results. State failed or unrun checks and the resulting gap. For performance, give one primary before-and-after number with units and link the supporting evidence.

Keep required migration, rollout, and rollback instructions in the body. Attach screenshots or video for visual claims and execution evidence for nonvisual work. Unit tests and compilation do not imply end-to-end proof. Link accessible details instead of pasting logs, full SHAs, or agent reports. Do not repeat the subject in the squash commit body.

**Publish and read back.** Resolve the forge once. Use `gh` unless the installed Origin CLI resolves the repository. Record any fallback and never require `gt`. Prefer the native PR tool for supported operations, using only its documented schema. Use the resolved forge for authorized operations the native tool cannot perform.

Open a ready PR unless the operator explicitly asks for a draft. Set the native tool's documented readiness field if available. With Origin use `--status open`, and with `gh` omit `--draft`. If it opens as draft unintentionally, mark it ready with a supported tool. Read the actual PR status before reporting it.

Branch independent changes from trunk. Stack dependent follow-ups by base branch, with each child targeting its parent and the root targeting trunk. The topology owner coordinates changes under [Merge and restack safety](../references/merge-safety.md). After a parent lands, prepare only its next child through [Shipping](shipping.md).

**Post the URL.** Opening a PR does not start [Babysit](babysit.md). Keep building the requested phase or stack, or return to the parent at the assigned handoff. An Autopilot owner whose brief includes babysitting starts it after the code-ready report and stops at merge-ready or STACK-READY as specified by its playbook. No PR tool grants landing authority.
