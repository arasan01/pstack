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

同梱の[モデルガイド](../../docs/models.md)と[arasan01の設定](../../profiles/README.md)を参照する。パスはユーザーのプロジェクトではなく、このスキルのディレクトリを基準に解決する。単一の `arasan01.yml` は `omp --config <absolute-overlay-path>` 用の設定スナップショットであり、自動適用しない。

この設定はHOMEのモデルロールと `task.agentModelOverrides` を保持し、`architect` と `security-reviewer` にモデルを直接指定する。独自の `review` ロールや他のエージェントへの上書きは追加しない。パッケージの `architect` 自体は `@slow` を指定するが、ネイティブのモデル上書きとプロジェクト・ユーザーのエージェント優先順位に従う。設計や統合を読み取り専用という理由だけでscoutに割り当てず、スキル別・モデル別のエージェントを作らない。

GPT and DeepSeek can both be primary workers. Preserve independent authorship and report actual model diversity separately. Do not assert model strengths or copy effort levels across models without evidence.

同梱設定は `retry.modelFallback: true` を保持する。検証用の `retry.modelFallback: false` は再試行時のモデル代替を無効にするが、未解決の起動セレクターが要求どおり実行される保証ではない。[実OMP検証](../../docs/verification.md)でのモデル実行は、許可された場合だけ行う。

The model guide also describes the bundled Scope & Completion Guardian advisor. Its `WATCHDOG.yml` is an explicit opt-in example, not an automatically discovered package resource. Inspect existing project and user rosters before recommending a merge. Keep `scope: main`, explain native advisor-role resolution and additional model usage, and do not install or enable it as a setup side effect.

## Finish setup

Return the inspected sources, effective assignments, unavailable targets, and any unverified assumptions. Leave user settings and plugin registration unchanged.

If the target project lacks a way to exercise its real surface, offer [create-verification-skill](../create-verification-skill/SKILL.md) once. For high-risk state or concurrency invariants, offer [create-formal-verification-skill](../create-formal-verification-skill/SKILL.md) when relevant. Do not create either as a side effect of setup.
