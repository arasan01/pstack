---
name: arena
description: "Spawn N parallel candidates at the same task, pick a base, graft the strongest parts of the losers into it. Use for /arena, 'arena this', 'throw it in the arena', or when one attempt at a non-trivial artifact would lock in the wrong shape."
workflow-contract: ../poteto-mode/references/workflow-contract.md#arena
---

# Arena

Follow the shared [workflow contract](../poteto-mode/references/workflow-contract.md).

For a direct request, reflect the applicable phases (Frame, Fan out, Cross-judge, Pick, Graft, Verify) in the existing owner todo list. As a delegated contributor, apply them within the assigned part of the parent plan.

## Phase A: Frame

Every candidate gets the same prompt, so the prompt is the contract.

1. State the artifact each candidate is producing.
2. Derive the rubric, 3-6 concrete gradeable criteria for what success looks like on *this* task. It is the picker's tool in Phase D. Candidates only see the task.
3. Pick the runners from native `task`, modelRoles, and agent settings. Preserve permissions and fallback policy. Use overrides only after resolving available selectors. Preserve independent candidate perspectives and disclose when native policy supplies no model diversity. Spawn more runners when the arena covers multiple design directions.
4. Give each candidate its own output location (a git worktree where possible, otherwise `/tmp/arena-<slug>/candidate-<n>/`), per the **separate-before-serializing-shared-state** principle skill.

If a runner is refused, inspect the cause and who controls the restriction before replacing it. Use only an available replacement allowed by native policy. Do not bypass a permission denial or silently switch models. Replace unavailable runners to keep at least two candidates, unless the user requested one. If policy or availability prevents replacement, continue with fewer candidates and disclose the count and reason. If no runner can execute, report the blocker rather than claim an arena result. Independent candidates may use the same model.

## Phase B: Fan out

Spawn all N subagents in one `task` call containing N independent entries in `tasks[]`, each with the task, the path to the shared grounding, its own output path, and instructions to produce the artifact and a short rationale naming the alternatives it considered and what it rejected.

If a candidate produces no output, proceed with N-1 and note the dropout.

## Phase C: Cross-judge

After all Phase B candidates complete, resolve the parent's model family and an available judge from another family through native settings. Dispatch that judge via `task` using `agent: "reviewer"` with an explicit read-only judging brief. An inherited model is not an independent family. If either family cannot be confirmed, or no allowed different-family judge can run, skip Phase C and disclose why. Do not bypass permissions or fallback policy to obtain a judge.

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
