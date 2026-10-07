# Setup pstack on oh-my-pi

Use the common setup steps' role list, but use these omp rules for model detection, validation, effort, routing, and sheet loading. Do not rewrite provider/model IDs into Claude family aliases.

## Detect and choose models

Run `omp models --json` through `bash` to inspect the available catalog. The session's `task` schema determines how to dispatch a selector. Use exact `provider/model` IDs from the catalog or a runtime-supported role selector. Catalog presence alone does not prove that credentials or quota allow a request; do not silently substitute another model when a chosen model fails.

Without a saved sheet, run roles on the current session's model by omitting the child's `model`. Offer `inherit-parent` and `auto`, which both omit `model`. Do not send the Claude aliases printed in the shared skills to omp and assume that they select the user's configured provider. For panels, offer distinct available provider/model IDs. If the user chooses only one model, keep the requested reviewer count and disclose reduced model diversity.

Read the existing sheet before asking for changes. Show the common role list with its saved choices, or `inherit-parent` for each role when no sheet exists. Ask with native `ask`, offering only supported selectors and effort levels. A sheet is pstack configuration, not permission to change omp's global model roles or fallback chains.

## Reasoning effort

Use the levels supported by the chosen model and omp's dispatch schema. In a role row, write the common `<selector> @<level>` form. Before dispatch, remove that sheet suffix and translate the level to omp's `provider/model:level` selector when supported. For `inherit-parent` or `auto` with an explicit level, use the runtime's current-model selector with that level, rather than dropping the requested effort. `default effort: session` makes no effort override. Never pass Claude's `pstack:effort-*` or `pstack:poteto-agent-*` names to select thinking on omp.

If the session cannot express a requested per-child level, explain that constraint and get a supported choice before writing the sheet; do not store a choice that dispatch will ignore.

## Write and load the sheet

Resolve the active omp agent directory, respecting `PI_CODING_AGENT_DIR` and the selected profile, before writing `pstack-models.md` there. Use the same role names and header shape as the common Write the override sheet step, but substitute the user's omp selectors. With no selected model changes, write `inherit-parent` for every single role and one `inherit-parent` entry per requested panel reviewer.

Ask whether automatic routing should stay enabled. Write `session hook: on` or `session hook: off`. The omp routing adapter reads both the sheet and this switch on every agent start, so no `@` include and no pasted model rows in AGENTS.md are needed for a native install. A skills-only install must read the sheet explicitly or keep the role rows in its instruction file; it has no adapter.

Confirm the resolved path, selected models, any reduced panel diversity, and routing state. Do not edit the user's omp config, auth files, or Codex sheet as part of setup.
