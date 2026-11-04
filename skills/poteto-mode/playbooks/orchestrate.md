### Orchestrate

**Run the program through scoped owners and inspect what they produce.** Use this playbook for a standing project spanning sessions, PRs and independent workstreams. One task driven to a predicate belongs to Autonomous run; one ambitious run needing a bespoke workflow belongs to figure-it-out. Do not create a program for work one session can finish.

Apply the [workflow invocation contract](../references/workflow-contract.md) and [native operations reference](../references/omp-tools.md). OMP owns task execution, models, permissions, concurrency and lifecycle. The coordinator owns the accepted scope, whole-program todo list, assignments and integration. Use native `task` and result delivery rather than a separate orchestration CLI, queue or scheduler.

#### Ownership

- Give each PR one content owner with an exclusive worktree or disjoint writable paths. A branch alone does not isolate writes. Its owner carries changes, fixes and evidence to handoff.
- Keep one topology owner for stack rebases, retargets and branch rewrites. Content ownership and a verifier's pass do not grant landing authority. Follow [Merge and restack safety](../references/merge-safety.md) before topology changes, including writer reconciliation, cancellation readback and explicit remote-head leases.
- Give each independent assignment a fresh worker with its goal, accepted criteria, input pointers, allowed writes, forbidden actions, verification recipe and stopping condition. Include the upstream evidence a dependent worker needs; do not assume it can see another worker's conversation.
- Use a sub-coordinator only when one area genuinely needs its own work decomposition. Respect native nesting and concurrency limits. It integrates that area's reports, not a second copy of the whole program plan.
- Use an independent non-author for correctness review. Confirm actual model identities before claiming cross-family review, and do not change native policy to manufacture diversity. A missing required reviewer leaves the gate unmet.
- Take one normal unit through implementation, consumer verification, independent review and authorized handoff before expanding. Near-identical cheap units do not need a separate ceremonial pilot.

#### Records and evidence

Use the existing project plan, PRs and associated artifacts as the record of accepted work and observed results. Keep each artifact with one writer, reuse existing records, and retain only the durable material needed to resume or audit the program. Do not recreate a fixed collection of unit tables, verification ledgers, inbox files or generated status files.

Record each unit's branch or artifact, PR, base and head SHAs, verification actually run, evidence locations, independent reviewer and verdict. Distinguish observed consumer results, typechecking, failed checks and blocked or unrun verification. Keep original human rulings attributable per [Claims about human decisions](../../why/references/epistemics.md#claims-about-human-decisions). An agent's interpretation is not a new ruling.

For an existing plan with checked acceptance criteria, use the common contract's checker to detect changed scope and mismatched evidence. Its `consistent` result is not a product-verification verdict. Use **show-me-your-work** for material decisions rather than copying its trail into every record. Publish authorized artifacts as units complete so that losing a worker does not lose delivered work.

Before pausing or resuming, use the existing [Resume storage](../references/resume-storage.md) locator. On restart, inspect native task state, the durable artifacts and the forge. Do not assume old workers stopped, or reuse a worktree while a prior writer may still own it.

#### Supervision

- Read a unit's actual diff or artifact and its verifier's evidence before acceptance. Green CI and an author's summary are inputs, not independent verdicts. Behavioral work needs execution through the matching project driver.
- Tie a verdict to the current head. A new head requires reconciliation and a current verdict; preserve prior lane results only under the [Shipping](shipping.md) patch-id and context rules. Query the forge for the actual PR chain and head instead of guessing from an old report.
- Use native completion events and available PR or CI subscriptions. If those subscriptions are unavailable, use supported background watchers where needed. Do not poll workers, resume them just to ask for status, or invent a recurring wakeup mechanism.
- Account for every assignment as completed, replaced or explicitly absorbed into another scope. A missing result is a coverage gap, not a pass. Inspect a sample of sub-coordinator briefs while their work proceeds and correct the source instructions when they drift.
- Diagnose a stalled or looping worker from its artifacts, pushes and native task state. A resource limit may need a smaller scope; a dropped connection may allow the same consolidated brief. Leave model fallback to OMP. Reconcile the prior writer before replacement, and replan after two failed attempts instead of retrying indefinitely.
- Check late results against the current source and PR state. Accept unique valid work through its owner, not by blindly integrating stale changes.
- Return scope drift to the content owner. Fix demonstrated blockers narrowly and report unrelated improvements separately. Human scope changes update the existing accepted plan before further delegation.
- Before reporting a PR as current, query its live head, state and checks with the resolved forge. Label unavailable state as unconfirmed. Never report a stored verdict as evidence for a different head.

Ask the operator only for an actual product or preference decision, an irreversible action outside the existing grant, or a concrete blocker that survived a replan. Without landing authority, stop at the authorized artifact or merge-ready PR. Neither CI nor orchestration grants permission to merge.

**Reply:** progress against the accepted goal, each PR's live state and current-head verdict with its link, unverified or dropped work and why, durable artifact locations, and the decisions waiting on the operator.
