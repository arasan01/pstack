# Setup pstack on oh-my-pi

On omp, setup inspects and explains native configuration. It does not write pstack configuration. Follow this page instead of the common setup skill's model-sheet, effort-wrapper, include, and session-hook steps.

## Inspect the active runtime

Read the current session's tool schemas, available agents, and runtime documentation. Locate the active profile's `config.yml` and agent definitions through that documentation rather than assuming a global path. Inspect only the relevant settings, not auth files or unrelated profiles.

Explain the effective native `modelRoles` and agent settings that apply to the requested work. Include reasoning effort, fallback chains, service tiers, and `task.agentModelOverrides` where the runtime exposes them. Do not infer a model from an agent's name or copy resolved model IDs into a second routing table. If an effective choice cannot be inspected, say that it is unknown.

When the user needs to inspect model availability, run `omp models --json` through `bash`. A catalog entry does not prove credentials, quota, the selected agent's effective model, or successful execution. Do not send a model probe or change a setting merely to complete setup.

## Use native agent selection

Ordinary `task` entries have no `model` parameter. Omit it. Use the default task worker for general work, `scout` for read-only codebase discovery, `reviewer` for independent review with a no-edits brief, and `sonic` for strictly mechanical work. A user-configured agent can be used when appropriate to the task and permitted by native policy.

Native `modelRoles` and agent settings choose models, effort, fallbacks, and service tiers. Do not translate pstack's model names or effort suffixes into task arguments. Do not require `poteto-agent` or effort-wrapper agents, synthesize per-model agents, or use `eval` to bypass dispatch policy.

Native permissions, delegation gates, concurrency limits, and task lifecycle remain authoritative. Choosing a pstack workflow does not change them.

## Preserve useful panels

When native delegation rules permit a panel, keep its independent candidates, review, and synthesis. Select available native or user-configured agents appropriate to those jobs, and batch independent work with the native `task` schema.

Different agent names or reasoning levels do not establish different models. Report whether model diversity is confirmed, reduced, or unknown. Do not claim a diverse-model panel from role names alone or create new agents to manufacture that claim. If native constraints prevent a required independent review, report the missing review rather than counting the author or tests as a substitute.

## Invoke skills explicitly

Invoke `poteto-mode` or another pstack skill when its workflow is wanted. Explicit skill invocation is the opt-in. No pstack settings file, model sheet, include, or mandatory session-start hook is needed.

The omp adapter preserves the existing system prompt blocks and adds only a pointer to the [omp mapping](../poteto-mode/references/omp-tools.md). It does not inject the routing mandate or load `pstack-models.md` for either parent or child agents.

An old sheet may remain on disk, but its role rows, effort defaults, and `session hook` setting have no effect on the omp adapter. Do not treat it as an override, add an instruction-file include, delete it, or migrate its contents into native configuration as part of setup. A skills-only installation also uses explicit invocation.

## Report without changing settings

Summarize the native configuration sources inspected, available agents relevant to the work, effective model settings that were actually observable, and any unconfirmed panel diversity. Explain how to invoke the desired skill.

Leave user and project settings, agent definitions, auth files, instruction files, and existing model sheets unchanged. If the user wants different models, effort, fallbacks, service tiers, or agents, explain the native configuration mechanism. Configuration changes require a separate explicit request and the runtime's own configuration workflow.

