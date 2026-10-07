---
name: deslop
description: Remove AI-generated code slop and edit Japanese prose without changing facts or meaning. Use for deslop, code cleanup before commit, Japanese writing/editing/review, or stop ai slop jp.
---

# Remove code and prose slop

## Scope

Choose the requested scope before editing. A code-diff cleanup covers the diff against the PR base or requested revision, including related prose. A writing, PR-body, or prose-review request covers only that text; do not edit source code. For review-only requests, report findings without rewriting.

## Code

Remove these patterns from the scoped diff:

- Extra comments that are unnecessary or inconsistent with local style.
- Defensive checks or try/catch blocks that are abnormal for trusted code paths. Preserve validation at real external boundaries.
- Casts to `any` used only to bypass type issues.
- Deeply nested code that can be simplified with early returns.
- Other patterns inconsistent with the file and surrounding codebase.

## Prose

Apply [unslop](../unslop/SKILL.md) to the scoped prose. For Japanese, also read and apply the [Japanese prose rules](references/japanese-prose.md), adapted from `stop-ai-slop-jp`. Fix the actor and concrete claim before structure, vocabulary, and punctuation. Use those rules while drafting replies and PR text, not only after writing.

Do not invent an actor, opinion, experience, emotion, test result, or benefit. Preserve uncertainty where it exists; do not add hearsay to verified facts. Keep code, identifiers, commands, paths, logs, URLs, and direct quotations unchanged.

## Guardrails

- Keep code behavior unchanged unless fixing a clear bug within the requested scope.
- Keep prose facts, conditions, guarantees, warnings, and intended meaning unchanged.
- Prefer minimal, focused edits over broad rewrites.
- Return the revised prose alone for a prose-edit request unless an explanation was requested. For code cleanup, keep the final summary to one to three sentences.
