### Feature

**You own the design. Plan, review, verify.** Delegate implementation. Stay in the lead.

1. `how` over the affected subsystem.
2. `architect` for parallel design exploration.
3. Write the throughput checkpoint as four todo items. A dimension that genuinely does not apply (single file, no fan-out) keeps its item with `n/a: <reason>` rather than being dropped:
   - **Blocking first steps.** Gates run before fan-out.
   - **Independent workstreams.** Disjoint files, services, or layers parallelize. Shared writes serialize.
   - **Shared mutable state.** Default to splitting the target (the **separate-before-serializing-shared-state** principle skill). Serialize only for real invariants.
   - **Smallest safe decomposition.** If one worker is best, name why.
4. Delegate a scoped implementation when the native runtime's delegation rules permit. Name file paths, the data shape and organizing structure per **principle-model-the-domain**, and success criteria before logic. Use a state machine instead of scattered flags, a table instead of repeated branching, or a typed model instead of repeated shape assumptions when those fit the domain. Resolve the configured feature model, effort, and supported speed through the runtime mapping and Subagents section; do not force unsupported dispatch fields. Compare genuinely different designs through **arena** when appropriate. Give writers separate worktrees or disjoint output paths before dispatch. Never edit or run a suite against a worktree another writer still holds. If nesting is unavailable, the assigned owner implements and the parent arranges independent review. Comments follow **Comments**. Use surgical edits and re-ground upstream-derived code against its source. Port shared-primitive changes to all consumers.
5. Verify on the matching surface. "Inconclusive" or wrong-surface is not a pass. Flag it.
6. Rebase into small, ordered commits. Stack follow-ups.
   Use the **sequence-verifiable-units** principle skill, building, verifying, and committing each small unit before the next.
7. Obtain independent correctness review from an agent that did not author the implementation. Use **interrogate** when the design is contested. If no independent reviewer can run, report the unmet gate instead of shipping.
8. Run **Opening a PR**.

Code-coupled work (one feature, one migration) goes to a single owner with the checkpoint inline. That owner fans out internally after the blocking phase. Parent-level fan-out is for slices that produce independent artifacts (audits, cross-subsystem investigations, competing experiments). Rewrite the checkpoint at phase boundaries. Spawn a fresh owner rather than chaining interrupts.

**Reply:** what you built, what you chose and why, the throughput checkpoint, open decisions. Tables for design alternatives.
