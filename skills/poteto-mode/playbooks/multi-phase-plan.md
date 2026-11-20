### Multi-phase or multi-PR plan

The plan is the deliverable. Do not implement. Follow the [native operations reference](../references/omp-tools.md) and resolve the project driver through [poteto-mode's Non-negotiables](../SKILL.md#non-negotiables).

1. If the change is one or two files with an obvious approach, say why it does not need a multi-phase plan and stop.
2. Trace the affected code using [pre-change grounding](../SKILL.md#before-choosing-a-change). Settle empirical questions with [Prototype](prototype.md) within the accepted brief. Save the branch, SHA, and evidence. Ask the operator only about product or preference calls an experiment cannot settle.
3. Fill in the checklist below without leaving placeholders. Use the operator's path or `docs/` in the agreed durable project store. Open with the affected consumers and PR IDs in landing order. Record dependencies and file boundaries, then give each PR one change and its own evidence. Use [Autopilot-full](autopilot-full.md) for independent PRs, [Autopilot-stack](autopilot-stack.md) for a dependent chain, or `skill:figure-it-out` for a bespoke program. The execution workflow owns topology and handoff. This plan grants no merge authority.
4. Apply `skill:technical-writing` and `skill:unslop`. Resolve the bundled [check-plan.mjs](../scripts/check-plan.mjs) from the active poteto-mode skill. Run `node <resolved-check-plan-path> <plan.md>` and fix its diagnostics. The checker validates structure, not proof that the planned checks passed.
5. Hand back the plan path and checker output. Stop. Execution requires the operator's explicit go.

````markdown
# <Program> plan

<Under ten lines. Name the change, affected consumers, and PR IDs in landing order.>

## How to read this

One box is one unit of work. Every box names the evidence that checks it. Check a box only when its evidence exists.

<Name the execution workflow and operator-owned items. Link applicable PR mechanics under `playbooks/`.>

Tests alone are not sufficient verification. A PR is verified only when its unit, live, and perf boxes are all checked.

## Program checklist

### Arm the program

- [ ] Present the plan and wait for explicit go. Then record the plan path, PR order, gates, and stopping condition in durable standing orders and the native task list when available.
- [ ] Re-read the execution workflow and standing orders at each hourly audit if the runtime exposes scheduling. Otherwise keep an actual native watcher and report missing recurring wakeups. Check observed progress, reconcile stuck writers before reuse or isolate replacements, and record changes in the decision trail. Send a status message only for a changed state the operator has not seen.
- [ ] On a hold or stand-down, suspend all writes immediately.

### Spawn owners

- [ ] <List which PRs branch from trunk, which wait or stack, their file boundaries, and the review-gated PRs.> Assign one isolated owner per PR under the execution workflow.

### PR mechanics, for every PR

- [ ] Follow `playbooks/opening-a-pr.md`. Run required project checks on the committed head before the PR-facing push, with hooks enabled.
- [ ] Triage review comments per `../references/bugbot-triage.md`. Record base and head at code-ready and after merge prep. Route topology changes and concurrent drift through the topology owner.

### Verdict and merge, for every PR

- [ ] Run an independent swarm at the code-ready head and again for new behavior, a redesign, or a large new diff. Include the gates, live and perf checks, and at least two focused correctness audits. Inspect the evidence rather than the PR body's claims.
- [ ] For a rebase, conflict resolution, or minor fix, get an independent verifier, current gates, and relevant behavioral checks. Reuse prior results only under the patch-id and context rule in `playbooks/shipping.md`. A green CI run or a bot does not count as independent review.
- [ ] Send proven PR-caused defects to the owner under the execution workflow's blocking rule. Record failures already on the base separately unless newly exposed or copied by the PR. Missing reviewers, failed gates, and missing evidence block handoff.

### Boot recipe, for every live lane

- [ ] <Check out the exact PR head in an isolated worktree. Start the real target and its dependencies and confirm readiness. Name the resolved driver or exact commands and the read-only diagnostics. Prepare a real consumer for a library. Cover every affected product interface.>
- [ ] Save and return paths to lane artifacts. For example, capture visual evidence for UIs, terminal output for CLIs, request and side-effect records for services, or public-API consumer output for libraries. Record any unavailable driver as a risk and name how the lane will actually drive the product.

## <Task as a verb phrase> (<PR id>)

**Depends on.** <PR id, or None.>

**Files.**

- [ ] <Name the files to edit, create, or delete.>

**Build.**

- [ ] <One change. Name the symbol and the file.>

**You see.**

- [ ] <One observable result, with the exact log line or screen state.>

**Verify, unit.** Tests alone are not sufficient verification. A PR is verified only when its unit, live, and perf boxes are all checked.

- [ ] <Test file and the case it gains.> Run `<command>`.

**Verify, live.** Tests alone are not sufficient verification. A PR is verified only when its unit, live, and perf boxes are all checked. Ten lanes at the PR head, per the boot recipe.

- [ ] Lane 1. Regression lane against trunk. Run <the same load-bearing scenario> at trunk and head. If trunk lacks the feature, record that and gate <the behavior the diff adds plus the end state the user waits for>. Save `<artifact path>`. Pass when <predicate>.
- [ ] Lane 2. <Scenario.> Save `<artifact path>`. Pass when <predicate>.
- [ ] Lane 3. <Scenario.> Save `<artifact path>`. Pass when <predicate>.
- [ ] Lane 4. <Scenario.> Save `<artifact path>`. Pass when <predicate>.
- [ ] Lane 5. <Scenario.> Save `<artifact path>`. Pass when <predicate>.
- [ ] Lane 6. <Scenario.> Save `<artifact path>`. Pass when <predicate>.
- [ ] Lane 7. <Scenario.> Save `<artifact path>`. Pass when <predicate>.
- [ ] Lane 8. <Scenario.> Save `<artifact path>`. Pass when <predicate>.
- [ ] Lane 9. <Scenario.> Save `<artifact path>`. Pass when <predicate>.
- [ ] Lane 10. <Scenario.> Save `<artifact path>`. Pass when <predicate>.

**Verify, perf.** Tests alone are not sufficient verification. A PR is verified only when its unit, live, and perf boxes are all checked.

- [ ] Metric. <What is measured at both trunk and head. If trunk lacks the feature, also name the diff-added work and the end-to-end state the user waits for.>
- [ ] Probe. <The command or procedure, run at trunk and at the head, interleaved. Both sides must produce the metric.>
- [ ] Baseline. Record the trunk <value> first.
- [ ] Rule. <Head against trunk, with the number that fails. If the scenarios differ, add absolute budgets for the diff-added work and the user-visible end state instead of an invalid ratio.>

**Review gate.** <Visual. or Nonvisual.> Require operator review for a visual interaction change. Use the nonvisual gate when the operator requires review of a nonvisual change. Keep the applicable evidence box. If no gate applies, write `None.` and remove all boxes in this block.

- [ ] Collect lane screenshots and a 30 to 60 second video. Save them to `<media path>` for the operator.
- [ ] Save `<evidence path>` from the named lane. Use observed consumer output or other execution evidence instead of invented media.
- [ ] Post the evidence for the operator's review and stop at merge-ready for their merge click.

**Merge.**

- [ ] Record a current independent verdict, pass the required gates, and finish review-bot triage. Match the reviewed patch and context to the actual head and base under `playbooks/shipping.md`.
- [ ] <Name how the owner or root hands off the verified PR. The operator lands it.>

## Close the program

- [ ] Confirm each box has evidence and report the result required by the execution workflow.

## Appendix A. Prototype evidence

<What each prototype proved, its branch, SHA, and evidence links. List any open questions.>

## Appendix B. Decisions and references

<Rejected alternatives, risks and their owners, required reading, and the decision trail.>
````

**Reply:** the plan path, PR IDs and dependencies, review-gated items, what remains unproven, and the checker's output.
