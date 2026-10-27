### Bug fix

**You own this task. Plan, review, verify.** Delegate investigation and fixes only under native delegation rules. Resolve model, effort, and supported speed through the runtime mapping and Subagents section.

Be scientific. Every shipped line traces to runtime evidence. Belt-and-suspenders that "might help" is a hypothesis, not a fix. It does not ship. When evidence refutes a hypothesis, revert what it motivated. The smallest change the evidence justifies ships, nothing more.

1. Treat the user's reported failure and observations as ground truth. Do not rerun a reported check merely to confirm it. Use the matching project driver to construct the reproduction or collect evidence needed to distinguish causes. Ask the user only after exhausting available controls and naming the specific unreachable target. If the trigger is intermittent, synthesize it, tighten conditions, or instrument an authorized instance.
2. Narrow the cause by testing candidate hypotheses. Use **how** for the subsystem and **why** for regression history. Choose observations that eliminate the most remaining candidates. When state is unclear, inspect runtime diagnostics or add targeted instrumentation to an authorized instance. Drive a long hunt through native watcher or scheduler capabilities, not an assumed Claude `loop` tool. Confirm the surviving mechanism with runtime evidence before design review.
3. Plan the fix. If it crosses a function boundary, `architect` first. Delegate implementation to a subagent using your configured bug-fix model (default in poteto-mode's Models section) with a specific scope.
4. Verify on the same surface. The original repro now passes. "Inconclusive" or wrong-surface is not a pass. Flag it. Unit tests show branch behavior, not bug absence.
5. Stage the commits so the failing repro lands before the fix in git history. See the **tdd** skill for the failing-test-first cadence when the bug has a cheap local test path. Skip it when the test would be expensive, integration-heavy, or unclear.
   This is the canonical **sequence-verifiable-units** principle skill, the failing test first and the fix on top.
6. Run **Opening a PR**.

**Reply:** what was broken, root cause, fix, how you verified. Quote the decisive failing and passing output, trimmed to the assertion and the counts.
