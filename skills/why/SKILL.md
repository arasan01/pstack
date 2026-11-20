---
name: why
description: "Use for 'why does X work this way', 'why we picked Y', design rationale, regressions, postmortems, and data-backed thresholds. Cite the decision history and tradeoffs. Use how for runtime behavior."
---

# Why

Use the shared guidance in `skill:poteto-mode` within the accepted brief. Reading it does not start another workflow or select an agent or model.

Use the code to locate the decision. Do not treat behavior alone as evidence of intent. Read the commits and PR discussions that introduced the behavior and materially changed it later. Follow renames and linked decisions as needed. Reuse valid evidence from the parent and investigate only the missing rationale for an assigned slice. Keep the work read-only.

When that trail is thin, search the relevant sources through the tools actually available. Check tickets, design docs, or team discussions for the decision. Check incident records, telemetry, error reports, or analytics when they can explain a guard, regression, or threshold. Search independent sources in parallel when useful and allowed by native policy. Name any evidence gap that matters to the answer.

Cite what the authors wrote. Keep direct evidence, inference, and unanswered questions separate. Cite conflicting accounts instead of smoothing them into one story. If the answer informs a change, state which constraints to preserve and which past decisions no longer apply, with the evidence for each.

## Claims about human decisions

Identify which owner or stage controls the action in question. When the scope of a human ruling matters, cite the speaker and original source, and quote enough of their words to show what the ruling covers. Label agent summaries as interpretations. Copies of one summary are one evidence chain, not independent rulings. If the original is unavailable, leave the scope uncertain. Do not convert a paraphrase into a permission or restriction.
