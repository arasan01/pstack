---
name: arena
description: "Spawn N parallel candidates at the same task, pick a base, graft the strongest parts of the losers into it. Use for /arena, 'arena this', 'throw it in the arena', or when one attempt at a non-trivial artifact would lock in the wrong shape."
---

# Arena

Use the shared guidance in `skill:poteto-mode` within the accepted brief. Reading it does not start another workflow or select an agent or model.

Apply the phases (Frame, Fan out, Cross-judge, Pick, Graft, Verify) within the accepted task brief and native policy. Use the existing plan for work you coordinate. For an assigned subtask, reuse the parent plan and grounding without duplicating whole-task todos. A candidate assignment ends at the requested artifact, not a new arena. Invocation type grants no additional authority or permissions.

## Phase A: Frame

Every candidate gets the same prompt, so the prompt is the contract.

1. State the artifact each candidate is producing.
2. Derive the rubric, 3-6 concrete gradeable criteria for what success looks like on *this* task. It is the picker's tool in Phase D. Candidates only see the task.
3. Select runners through native agent settings and `modelRoles`. Use a supported override only for an explicit model comparison or named-model request. Preserve independent perspectives even when runners share a model.
4. Give each candidate its own output location (a git worktree where possible, otherwise `/tmp/arena-<slug>/candidate-<n>/`), per the **separate-before-serializing-shared-state** principle skill.

If a runner is refused, identify the cause. Replace an unavailable runner only with a policy-allowed selection. Do not bypass a denial or silently switch models. Aim for at least two artifacts unless the user asked for one; report any shortfall, or the blocker if none ran.

## Phase B: Fan out

Spawn all N subagents in one `task` call containing N independent entries in `tasks[]`, each with the task, the path to the shared grounding, its own output path, and instructions to produce the artifact and a short rationale naming the alternatives it considered and what it rejected.

If a candidate produces no output, proceed with N-1 and note the dropout.

## Phase C: Cross-judge

After all candidates finish, resolve the parent's model family and a policy-allowed judge from another family through native settings. Dispatch a read-only `reviewer`. If either family is unknown or no eligible judge can run, skip Phase C and say why.

The judge sees the rubric and candidates by path label, scores each criterion, and recommends a base with rationale. It runs in parallel with your reading in Phase D. Do not spawn it while candidates are still writing.

Skipping this cross-judge does not waive an independent correctness review required by another playbook.

## Phase D: Pick a base

Read every candidate end to end before picking. Score each against the rubric criterion by criterion, not on holistic feel. When Phase C ran, compare with the cross-judge and read both rationales before resolving disagreement. When Phase C skipped, pick against the rubric yourself and disclose that no cross-judge ran.

Pick the base a future maintainer can extend most easily without breaking invariants. When two feel tied, prefer the cleaner boundary or smaller API, per the Laziness Protocol.

## Phase E: Graft

Walk each losing candidate once more for what is worth porting into the base, usually one or two things per candidate, not most of it. Fold each graft in by hand, per the **redesign-from-first-principles** principle skill, so the result stays coherent under one mental model. Don't paste mechanically.

If the candidates converge on one shape, that is strong agreement. Note it and ship the consensus shape. No graft is needed. If they wildly diverge, Phase A was under-specified. Reframe and re-run rather than averaging the divergence.

## Phase F: Verify

Verify the synthesized artifact like any other output, per the **prove-it-works** principle skill. If verification finds a problem the arena missed, either Phase A was wrong (re-frame and re-run) or a candidate caught it and you missed the graft (go back to Phase E). Don't paper over it.

## Outputs

One synthesized artifact, with a short synthesis note naming the base and why, the cross-judge's verdict or why Phase C skipped, each graft with its source candidate, what was rejected and why, any replacements or dropouts, the final candidate count, and the verification result.
