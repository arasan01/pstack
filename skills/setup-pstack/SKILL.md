---
name: setup-pstack
description: Inspect OMP model roles, agent routing, availability and process-local overlays for GPT and DeepSeek without changing user settings. Use for setup-pstack, model configuration, or readiness questions.
---

# Set up pstack on OMP

Inspect native configuration and explain the effective setup. Do not create a model sheet, change global settings, switch a preset or send a model probe merely to finish setup. A request to inspect settings is not permission to change them.

## Inspect the current session

Read the available tools, agents and native configuration provenance. Locate the active profile rather than assuming the default global path. Inspect only model-related settings, never authentication secrets.

Report `modelRoles`, `task.agentModelOverrides`, effort, service tiers and `retry.fallbackChains` when observable. An unset or unknown value is not evidence that a role uses the parent's model. Skill selection and agent/model selection are different decisions.

Use `omp models --json` and `omp models find deepseek --json` when model availability matters. Both operate on the available-model roster; `find` filters it. Neither proves inference, quota, network reachability or correct task completion. Report missing models without substituting another family.

The native `/pstack` command resolves current roles without writing settings. Its output is a readiness aid, not a qualification result.

## Explain the native choices

Use the installed package's [model guide](../../docs/models.md) and [overlays](../../profiles/README.md). Resolve their paths from this skill directory, not the user's project directory. The overlays are editable examples for `omp --config <absolute-overlay-path>`; do not apply them automatically.

The examples separate `default`, `smol`, `slow`, `plan`, `task` and custom `review` roles. Default workers use `@task`; discovery and mechanical agents may use `@smol`; reviewers use `@review`. Do not route design or synthesis through scout merely because it is read-only. Do not create one agent per skill or per model.

GPT and DeepSeek can both be primary workers. Preserve independent authorship and report actual model diversity separately. Do not assert model strengths or copy effort levels across models without evidence.

`retry.modelFallback: false` disables retry substitution; it does not prove an unresolved startup selector will run as requested. Qualify exact models through the [real OMP harness](../../docs/verification.md) only when model execution is authorized.

## Finish setup

Return the inspected sources, effective assignments, unavailable targets, and any unverified assumptions. Leave user settings and plugin registration unchanged.

If the target project lacks a way to exercise its real surface, offer [create-verification-skill](../create-verification-skill/SKILL.md) once. For high-risk state or concurrency invariants, offer [create-formal-verification-skill](../create-formal-verification-skill/SKILL.md) when relevant. Do not create either as a side effect of setup.
