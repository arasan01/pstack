---
name: principle-attack-the-premise
description: "Apply when two or more fixes that share one premise have failed the same gate. Write the premise down and test it directly before another fix depends on it."
user-invocable: false
---

# Attack the premise

When two or more fixes sharing an assumption fail the same gate, write down what they assumed. Before another fix depends on it, choose an observation or experiment that can challenge it.

Each failed fix is evidence about the premise, not proof that it is false. The fixes may have treated a consequence instead of the cause.

1. Write the shared premise as one sentence.
2. Choose an observation that would differ if it were false. Match the experiment to the hypothesis. Two timeout increases may assume requests reach the intended destination; check that destination before increasing the timeout again. Keep the experiment rerunnable when useful, per [Build the Lever](../principle-build-the-lever/SKILL.md).
3. Follow the evidence per [Fix Root Causes](../principle-fix-root-causes/SKILL.md). For an allocation, ownership, or assignment hypothesis, measure work per actor and trace the assignment. Recommend redistribution only when that evidence connects it to the failure. An even distribution weakens an imbalance hypothesis but does not rule out a shared defect. Every worker can leak at the same rate.
4. Remove a proven cause rather than adding work to compensate for it, per [Laziness Protocol](../principle-laziness-protocol/SKILL.md).

Do not start the next assumption-dependent fix before testing the premise. Do not require a distribution census for an unrelated hypothesis.

This principle questions an assumption about the existing system. [Redesign from First Principles](../principle-redesign-from-first-principles/SKILL.md) rebuilds a design around a new requirement.
