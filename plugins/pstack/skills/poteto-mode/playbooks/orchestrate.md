### Orchestrate

Resolve the driver skill through [poteto-mode's Non-negotiables](../SKILL.md#non-negotiables).

The current runtime owns agent selection, model roles, effort, permissions, task lifecycle, concurrency, and delegation limits. On omp, read [the native mapping](../references/omp-tools.md). The `orch` helper below stores program records only; it never replaces native task, model, or scheduling behavior.

**You own the program, never the code. Author briefs, drain the queue, keep the frontier green, decide.** For a whole project handed to one standing coordinator chat: multi-day, many stacked PRs, dozens to hundreds of subagents, the human checking in twice a day instead of every five minutes. One task driven to a predicate is Autonomous run. One ambitious run needing a bespoke workflow is figure-it-out. Route here when the work outlives any single agent. Work one agent could finish inside the session's budget is not a program.

Ceremony must scale with the program. On cheap near-identical units, collapse it as each section directs.

Three rules carry the rest.

- Completions are queue events, not interrupts.
- Every spawn and every resume carries the standing orders verbatim.
- The brief is the product. A vague brief fails quietly, because a worker cannot ask you a question.

#### Roles and placement

- **Coordinator.** Frames the program, authors briefs, drains results, reports to the operator, and makes decisions. It does not author code. Assign conflicted merges and code changes to scoped owners under native delegation rules. With explicit landing authority it may mechanically integrate independently verified commits when local git work is cheap. Dispatch agents through the current runtime, not through `orch`. Resolve model, effort, and supported speed through the mapping and Subagents section.
- **Sub-coordinator.** Use one per track only when one coordinator cannot manage its results. It owns briefs and aggregate reports, not raw transcript forwarding. Nest only to the runtime's supported depth. If nesting is unavailable, it implements its assigned scope and the parent arranges independent review. Keep a rolling window within native concurrency limits, sized to what one drain can process.
- **Worker / verifier.** Use native delegation and isolation. Give each writer its own worktree or disjoint output paths. A branch name alone does not isolate filesystem writes. Include the full brief and the project's driver path or exact commands for app, native-device, CLI, service, or library execution. Correctness review comes from an agent that did not author the code. Model diversity is useful when native policy supplies it, but never override that policy or count a repeated model as diversity.

Use at most the coordinator, track, and worker layers, and fewer when native nesting rules require it. Choose tracks from the project rather than a fixed swarm tree.

#### Store layout

Choose a project-specific durable store before dispatch, such as `pstack/orchestrate/<project-slug>/` under the resolved Git common directory. Follow [Resume storage](../references/resume-storage.md) when checkpointing a pause. Do not assume `~/.claude/`, a VM path, or a session scratchpad is the store. Keep it outside committed source, available after the expected interruption, and within authorized filesystem paths. Every file has one writer; readers aggregate published facts. Below, `orch` abbreviates `bun <plugin>/skills/poteto-mode/scripts/orch/orch.ts --store <program-store>`. Its TSV and JSON remain readable without the helper.

- `preferences.md` is the standing-orders register: numbered lines, one constraint each (model policy, stack shape and count, verification bar, forbidden paths, escalation policy). For human rulings, retain original wording and attribution per [Claims about human decisions](../../why/references/epistemics.md#claims-about-human-decisions). Label agent interpretations and missing originals. Copies are not new decisions. Paste it verbatim into every spawn and every resume. Directives decay across resumes, and each dropped one costs a human turn. When you catch yourself restating an instruction, append the line before you act (principle-encode-lessons-in-structure).
- `overview.md` is the durable PR and issue DB. Append. Never rewrite wholesale per event.
- `units.tsv` has one row per unit: id, track, state, branch, PR, head SHA, brief path. Update rows in place.
- `frontier.json` is the computed merge frontier, per Stack safety.
- `ledger.tsv` is the verification ledger, per Verification.
- `inbox/` holds completion pointers. `gates.md` parks human gates (question, options, default on no answer).
- `decisions.tsv` is the trail via the show-me-your-work skill.
- `status.md` is derived from `units.tsv` and `ledger.tsv` at each drain, never hand-maintained. Regenerate it from the tables instead of narrating events into it.

#### The brief

Your prompts to agents are your only product, and a sloppy brief compounds into slop across the whole tree. Every spawn carries all of it. A field you cannot fill is a unit you have not scoped yet.

```
GOAL         one sentence, the outcome, executable by a stranger with no chat access
SCOPE        paths this unit may write; paths it may not; its exclusive worktree or branch
CONTEXT      pointers to files and PRs; upstream reports pasted in full when this unit
             depends on them, because workers cannot see siblings
ACCEPTANCE   checkable criteria, one per line
VERIFY       exact commands or the resolved driver skill path, plus known gotchas
TIMEBOX      rough cap on runtime; on expiry, return partial findings and stop rather than run on
FORBIDDEN    no PR retargets or merges, no rebase, no force-push, no fixes outside scope,
             plus unit-specific bans
REPORT       status, branch, head SHA, PRs, verdict, what you actually ran, deviations,
             suggested follow-ups
STANDING     <preferences.md pasted verbatim>
```

Size the brief to the unit. A one-command unit gets the template collapsed to a paragraph that still names goal, scope, the verify command, and the report shape. A 4KB scaffold around a two-line edit costs more to write and obey than the edit. A spawn may reference the standing-orders file by store path. Verbatim paste is for every resume and for any brief that has to stand alone.

A sub-coordinator brief adds its track boundary and unit list, its spawn budget, the drain protocol, and the rollup format (per child: name, status, PR, head SHA, verdict, one line, plus track status and frontier delta).

A dependency is a context relay, not just ordering. Undeclared upstream context makes the worker guess. Missing fields are a refuse-to-spawn condition. Audit one sampled worker brief per sub-coordinator per wave, concurrently with the wave it samples, never as a gate in front of it. A failing brief stops that track and fixes the sub-coordinator's instructions, not just the worker, because brief quality decays late in a run. Never resume-chain a brief. Respawn fresh with consolidated scope.

#### Steps

1. **Frame.** State the done predicate as something countable ("all 126 units merged, each ledger-verified `unit-test-verified` or better"). Quantify scope: units, rough effort, expected stacks, and the wall-clock budget. If one agent could finish inside that budget, stop here and run Autonomous run instead. Collapsing must not depend on another document being present. It means do the work directly in this session, plain workers where they help, verification inline, landing as you go, and none of the store, register, or pilot machinery below. Schedule landing against the budget. By roughly 70% of it, stop spawning and land what is verified. Name the tracks per project. A contested decomposition or one-way door goes through the arena skill before the pilot. Present the framing once. Reversible prep proceeds without waiting.
2. **Initialize program records.** Run `orch init` using the store-bound invocation above. Open the trail via **show-me-your-work**, record standing orders before dispatch, and seed `frontier.json` with `orch frontier set --repo <repo-dir>`, adding `--forge origin` only when that is the resolved forge. This does not install or replace a runtime.
3. **Pilot.** Run one unit through brief, implementation, independent correctness review, verification, ledger entry, and authorized integration. Use it to test the brief, execution recipe, and unit size before scaling. For near-identical cheap units, use the first normal unit as the pilot rather than a separate ceremony; review separation still applies.
4. **Scale.** Spawn a rolling window of workers up to the in-flight cap, refilling as children finish. Blocking batches pay the slowest child of every batch. Spawn track sub-coordinators only past the one-drain threshold in Roles. Recompute ready work after each drain. Relay upstream reports into downstream briefs. Keep sibling communication upward only. The sampled brief audit runs alongside the wave it samples and stops the next refill on failure, not the current one.
5. **Drain.** Run the queue discipline below at every drain point.
6. **Integrate continuously within authority.** Begin with the first independently verified unit while later waves run. A stacker owns topology on heavy repos; otherwise the authorized coordinator may integrate mechanically. Without landing authority, stop each unit at merge-ready. Follow Stack safety and `playbooks/shipping.md`; keep the frontier green before advancing and update it on observed merges or new head SHAs.
7. **Close.** Drain the inbox, reconcile every child to a terminal record, confirm the predicate on the real artifact and each integrated PR's current-head verdict, and audit the decision trail. Preserve original human rulings when recording corrections in standing orders. Keep the durable store for later pickup and postmortem.

#### Queue and drain

- On a completion notification, run `orch inbox push <agent> <unit> <status> [--report PATH]` and return to what you were doing. Never deep-review inline. A completion that needs review becomes a verifier unit. Never review a diff inside a drain.
- Drain at the end of a critical section, a track rollup, a delivered frontier-watch event, and before a human report. Run watchers through native background tools or an exposed scheduler per the mapping. Never assume `/loop` provides agent wakeups. Begin with `orch inbox drain`; arrivals during the drain wait for the next one.
- Critical sections you finish first: authoring a brief, a stack operation, a conflict decision, writing a gate, updating ledger or frontier.
- Each drain classifies every pointer (landed, needs-verify, failed, zombie, noise), writes the resulting rows through `orch unit add`, `orch unit set`, and `orch ledger record`, runs `orch status`, then spawns the next wave in one message.
- Account for every spawned child at its track's rollup: arrived, respawned, or its scope explicitly absorbed. Silently redoing a missing child's work hides both the wasted spend and the coverage gap its result existed to close.
- A drain turn ends with the three lines from `orch status`: counts against the states, what changed, gates open. Detail lives in `status.md`. The full reply contract applies at checkpoints and close.

#### Stack safety

- Compute `frontier.json` after every merge or topology change. Record PR order, branches, heads, generation, and the lowest unmerged PR. `orch frontier set` walks the current branch's PR base chain through the forge, defaulting to `gh`; use `--forge origin` when resolved to Origin. It reads heads from local refs, so use the topology owner's clone. A missing PR is an error, not permission to guess. No `gt` is required.
- Exactly one stacker may mutate a stack's topology. Record ownership in standing orders. Follow [Merge and restack safety](../references/merge-safety.md), including cancellation readback, old-parent boundaries, and explicit remote-head leases before rewriting or retargeting. Use a supported execution environment with sufficient capacity; never assume cloud workers exist.
- Workers never rebase, retarget, or merge. Babysitters follow `playbooks/babysit.md` within one frontier generation and report topology conflicts to its owner.
- PR closes and retargets go through the stacker only. Closing a base PR orphans every chain above it. Merges and stack surgery are units with briefs like any other.
- One retro watcher follows merged PRs for reverts, post-merge CI breaks, and orphaned follow-ups.

#### Verification

Scale execution checks to the unit, but never skip independent correctness review for code changes. For a cheap VERIFY command, the worker may run it and return receipts while an independent reviewer checks the diff and required effects without needlessly repeating the command. Expensive, judgment-laden, or high-risk verification gets dedicated independent lanes. The author, green CI, and review bots do not satisfy review separation. If no independent reviewer can run, the unit remains unapproved.

Write verdicts with `orch ledger record` and check the PR and head with `orch ledger check`. The supported ledger levels are `live-ui-verified | unit-test-verified | type-check-only | verifier-blocked | verifier-failed`. Record the matching UI or nonvisual execution evidence alongside the level rather than inventing an unsupported enum or claiming UI coverage for a CLI. Behavioral changes need consumer execution beyond typechecking. A blocked verdict is not a pass; a failed verdict needs a fix. An author's report remains self-proof until independently reviewed. A new head needs a new record, preserving lane results only when the shipping patch-id and context rule allows it.

A unit is not done until its authorized branch or artifact and verdict are durable. Publish receipts to the store as units complete rather than batching them at the end. If an execution environment disappears, its unpreserved work cannot count as delivered.

#### Liveness and failure

- Use native result delivery and supported read-only status tools. Do not resume an agent merely to check liveness, and do not poll its status while independent work remains. When investigating a stall, inspect the ledger, unit records, forge, pushed branches, and native task state. Transcript mtime alone is not liveness.
- A silent death gets a synthetic postmortem row in the inbox (unit, failure mode, last evidence, options). Replan on evidence as it arrives. Never wait for full quiescence.
- Diagnose failures before replacement. A resource failure may need smaller scope; a transient transport failure may allow retry. Leave model fallback to native policy, not a manual family switch. Reconcile a failed writer's ownership before a replacement uses its worktree or branch. After two failed attempts, record the blocker and replan rather than retrying blindly.
- A zombie that returns hours late reconciles against the current frontier and ledger before anything is accepted. Salvage unique findings through a fresh unit, never a blind merge.
- When continued spawning would produce garbage tree-wide (bad upstream output, broken acceptance, dead infra), write a stop line at the top of the standing orders, let in-flight work finish, fix the cause, clear it.
- Bound your own infra retries the same way you bound a child's. After a few consecutive tool aborts, stop retrying. Write a terminal handoff to durable state (what is done, where it lives, the exact command to resume) and end the run.
- After a session restart, inspect native task state rather than assuming children survived or died. Re-read standing orders and unit records, recompute the frontier, and recover work through its durable branch, PR, and artifacts. Reconcile or stop any existing writer before replacement. The `orch` store lock is bookkeeping only; clearing a dead holder's lock does not release an agent's write ownership.

#### Escalation

Reaches the human, batched into the status page rather than per item: irreversible actions (force-push to shared branches, deploys, deletions, closing someone else's PR), genuine product or preference calls no experiment settles, a standing order that contradicts observed reality, a program-level dead end that survived a replan. Park each as a `gates.md` entry before asking, and route work around it.

Never reaches the human: frontier nudges, rebase mechanics, retries, CI flake triage, review-thread triage, format fixes, scope the brief already forbids (refuse and continue), and "should I keep going". When in doubt, act and log.

Mid-run discoveries fix only what blocks the frontier. Everything else parks in follow-ups. At this fan-out a small scope leak multiplies into PRs nobody asked for.

**Reply:** at checkpoints and close: the predicate and the count against it from `units.tsv` and `ledger.tsv`, tracks and what each landed, the frontier (PR list plus SHAs), verdicts summary, what was abandoned and why, gates awaiting the human (the only asks), the store path, and the trail path. Numbers from the tables, not narrative. Include PR links.
