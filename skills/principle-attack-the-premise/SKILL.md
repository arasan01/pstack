---
name: principle-attack-the-premise
description: "Apply when two or more fixes that share one premise have failed the same gate. Write the premise down and test it directly before another fix depends on it."
hide: true
---

# Attack the premise

When two or more fixes that share one premise have failed the same gate, suspect the premise, not the fixes.

- Write the premise down: the one sentence every failed fix assumed.
- Test it before the next fix. Choose an observation that would differ if the premise were false.
- If the evidence contradicts the premise, look for what the failures share that it did not predict. If the evidence points to the cause, remove it instead of compensating for it.

Do not start the next fix before the premise is written down and tested.

Match the check to the premise. Measure per-actor work and trace its assignment only when testing imbalance. An even distribution weakens that hypothesis but does not rule out a shared defect.
