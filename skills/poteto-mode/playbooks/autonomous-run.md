### Autonomous run

**You own the exit condition. Define done, then drive to it without stopping.**

1. State the exit condition as a checkable predicate before the first iteration (tests green, repro fixed, all N PRs merged, pixel-diff zero).
2. Use native background-process tools, event watchers, and any exposed scheduler. Do not invent `/loop`, a wakeup tool, or a timer that takes agent turns. An event watcher can deliver CI, merge, or ref changes; recurring autonomous turns require actual scheduler support. State that limitation when unavailable. Subagent delegation follows native agent policy.
3. Each iteration makes the smallest change the evidence justifies, verifies it against the predicate, commits if it advanced, discards changes that didn't help. Belt-and-suspenders that "might help" gets reverted, not left to ride.
   Sequence the work via the **sequence-verifiable-units** principle skill, verifying each unit before the next instead of batching checks at the end.
4. Fix discovered blockers within the authorized task, such as a broken verifier or tooling failure. Keep unrelated bugs and skill changes out of the diff and report them separately. Do not expand scope because a fix is reversible. Escalate irreversible actions, product or preference calls no experiment can settle, and genuine dead ends through the native interaction mechanism. Return to the predicate after each in-scope repair.
5. Log each iteration through **show-me-your-work**, including what changed and whether the predicate moved. If interrupted or explicitly paused, publish the note and required artifacts through [Resume storage](../references/resume-storage.md), not a session-only scratchpad.
6. Stop when the predicate is met. A plateau is not a stop, so keep going and pivot your approach to push past it. Surface a genuine dead end rather than spinning, and never relax the predicate to declare victory.

**Reply:** the exit condition, iterations run, what landed, what was discarded, final predicate state.
