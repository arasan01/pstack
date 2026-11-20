---
name: no-comments
description: "Spawn the comment-sicko subagent, fix accepted findings, and offer encodings for claimed constraints."
---

# No comments

Spawn comment-sicko. Act on accepted findings.

Defer to comment-sicko's fresh perspective.

## Scope

Use the caller's files or diff. Otherwise use the current diff against the base branch, default `main`, including the working tree.

## Steps

1. Spawn native `task` with `agent: "comment-sicko"` when that specialist is exposed. Otherwise use `agent: "reviewer"` with the portable instructions at `skill://poteto-mode/references/agents/comment-sicko.md`. Resolve that URI through native `read`, not a path relative to the target project's working directory. Pass the scope and an explicit report-only, no-edits brief. Do not restate its rules.
2. Inspect the report and reject edits outside the assigned scope or deletions without evidence. A keep survives only when its constraint is current and outside our control. Trace the named symbol or call; use `skill:why` when keeping it depends on the decision history. Check missed lint and TypeScript suppressions and retain actionable `MUST KILL` flags for code that hides correctness or safety issues. Restore only exact exceptions proven in scope, then rerun one rejected report on a narrower brief if needed.
3. Fix trivial accepted flags directly by deleting a dead path, dropping a parameter, or using the real API. If any fix needs a shape, run `/architect` once for the accepted set and surrounding code. Stop at the sketch. Architect shapes. Step 4 implements.
4. Implement the smallest root-cause fix in scope. Remove every named workaround. If the root cause is out of scope, land the smallest in-scope fix and report the rest open. The **principle-fix-root-causes** and **principle-redesign-from-first-principles** skills guide intent only. Neither authorizes widening the fence nor fixing instances outside it. Never bolt on symptom guards.
5. Constraint comments say `do not remove`, `do not change wording`, or `talk to X before changing`. Leave keeps about things we cannot change. Offer the cheapest in-scope type, runtime, test, or CI lint. Wait for interactive approval. Unattended and eval require caller pre-approval. If approved, encode then delete. Otherwise delete, report the constraint open, and sketch out-of-scope work.
6. Report the deletion count, restored comments, reruns, architect sketch, fixes, encoding offers, encodings, unenforced constraints, and other open work.
