# Setup pstack on oh-my-pi

Use the common setup steps' role list, but use these omp rules for model detection, validation, effort, routing, and sheet loading. Do not rewrite provider/model IDs into Claude family aliases.

## Detect and choose models

Run `omp models --json` through `bash` to inspect the available catalog. The session's `task` schema determines how to dispatch a selector. Use exact `provider/model` IDs from the catalog or a runtime-supported role selector. Catalog presence alone does not prove that credentials or quota allow a request; do not silently substitute another model when a chosen model fails.

Without a saved sheet, start from the GPT model and effort defaults in the common setup skill's [Models](SKILL.md#models) section. Resolve bare GPT names to available OpenAI `provider/model` IDs and translate the effort suffix to `provider/model:level`. Never implicitly substitute Claude. If a default is unavailable, ask for an explicit supported choice. Offer `inherit-parent` and `auto`, which omit `model` and leave selection to native agent policy. Keep all three panel entries, but disclose that the defaults contain only two distinct models.

Read the existing sheet before asking for changes. Show the common role list with its saved choices, or the GPT defaults when no sheet exists. Ask with native `ask`, offering only supported selectors and effort levels. Native role selectors such as `@task`, `@slow`, and `@plan` are valid explicit overrides. Pass them unchanged so omp resolves the configured model, effort, and fallback chain; do not copy resolved IDs or implement a second fallback policy in pstack. An explicit task `model` selector takes precedence over named-agent model overrides. Different native roles do not guarantee model diversity. A sheet is pstack configuration, not permission to change omp's global model roles or fallback chains.

## Reasoning effort

Use the levels supported by the chosen model and omp's dispatch schema. In a role row, write the common `<selector> @<level>` form. Before dispatch, remove that sheet suffix and translate the level to omp's `provider/model:level` selector when supported. Preserve native role selectors without an explicit effort suffix unchanged. When omp configuration should own effort, leave suffixes off the role rows. For `inherit-parent` or `auto` with an explicit level, use the runtime's current-model selector with that level, rather than dropping the requested effort. `default effort: session` makes no pstack effort override; a native role's configured effort still applies. Never pass Claude's `pstack:effort-*` or `pstack:poteto-agent-*` names to select thinking on omp.

If the session cannot express a requested per-child level, explain that constraint and get a supported choice before writing the sheet; do not store a choice that dispatch will ignore.

## Write and load the sheet

Resolve the active omp agent directory, respecting `PI_CODING_AGENT_DIR` and the selected profile, before writing `pstack-models.md` there. Use the same role names and header shape as the common Write the override sheet step, with the confirmed GPT selectors or the user's explicit omp overrides. Do not replace the GPT defaults with inherited selection unless the user chooses that override. Preserve one entry per requested panel reviewer.

Ask whether automatic routing should stay enabled. Write `session hook: on` or `session hook: off`. The omp routing adapter reads both the sheet and this switch on every agent start, so no `@` include and no pasted model rows in AGENTS.md are needed for a native install. A skills-only install must read the sheet explicitly or keep the role rows in its instruction file; it has no adapter.

Confirm the resolved path, selected models, any reduced panel diversity, and routing state. Do not edit the user's omp config, auth files, or Codex sheet as part of setup.
