# Model roles and qualification

モデル選択、認証情報、推論effort、コンテキスト上限、サービスティア、フォールバックはOMPが管理します。pstackはワークフローと単一のネイティブ設定オーバーレイを提供し、独自のロール設定やプロバイダー実装は持ちません。

## Roles

同梱の `arasan01.yml` は、HOMEの現行設定から次のモデルロールを反映しています。

| ロール | セレクター |
| --- | --- |
| `default` | `openai-codex/gpt-6.1-sol:high` |
| `task` | `openai-codex/gpt-6.1-sol:medium` |
| `slow`, `plan`, `cyber` | `openai-codex/gpt-6.1-sol:max` |
| `designer` | `openai-codex/gpt-6.1-sol:xhigh` |
| `smol`, `advisor` | `openai-codex/gpt-6.1-terra:medium` |
| `tiny`, `vision`, `commit` | `openai-codex/gpt-6-luna:high` |
| `memory` | `openai-codex/gpt-6-luna:xhigh` |

`task.agentModelOverrides` は `architect` を `openai-codex/gpt-6-astra:xhigh`、`security-reviewer` を `ollama-cloud/deepseek-v4.1-flash:1017:max` に指定します。他のエージェントへの上書きや独自の `review` ロールは追加しません。スキルは作業方法であり、エージェントやモデルではありません。ロールの指定だけでは作業を実行しないため、実際に起動したエージェントと解決されたモデルを確認してください。

The packaged `architect` agent reads `skill://architect` and follows the scope, constraints, deliverable and stopping condition in its task brief. Project and user agents with the same name take native precedence over package agents. Native per-agent and per-dispatch model overrides remain authoritative.

## Native overlays

From the checkout root:

```sh
omp --config profiles/arasan01.yml
```

[arasan01の設定](../profiles/README.md)は利用可能性の保証ではありません。`--config` はそのプロセスにだけ適用され、設定を永続化しません。保存済みの `modelPresets` は同梱しません。`/modelpreset switch` は永続化の扱いが異なり、スモーク検証では使用しません。

Both GPT and DeepSeek are primary-workflow targets. Neither family has a fixed cheap-worker or exclusive-design assignment. An independent reviewer need not be a different family to be a different author, but a cross-family claim requires actual distinct resolved models. Agent names and effort levels alone do not establish model diversity.

Effort support differs by model and provider. For example, native DeepSeek compatibility currently uses `low`, `high` and `max` ladders for V4-family models; do not copy a GPT-specific effort suffix blindly. OMP owns clamping, tool dialects and reasoning-content replay. pstack must not duplicate those mechanisms.

## Check availability before execution

```sh
omp models --json
omp models find deepseek --json
```

Both commands list the current available-model roster; `find` filters it. They are not separate unauthenticated-catalog and successful-authentication tests. A model being listed still does not prove working network access, usable quota or successful inference.

The native `/pstack` command resolves the active selection and the roles above without changing settings. Its report is availability evidence only. Use the [real OMP scenarios](verification.md) to qualify execution and workflow behavior.

## Scope and completion advisor

The [Scope & Completion Guardian roster](../advisors/scope-completion/WATCHDOG.yml) comes from the working `meta-soenan-apps` configuration. It challenges unapproved scope growth, redundant investigation and delegation, and premature completion without functional evidence. Its instructions are preserved; its name is `pstack-scope-completion` instead of `default` to avoid replacing an existing default advisor.

OMP does not discover `WATCHDOG.yml` inside installed packages. Installing pstack does not register or enable this advisor. To use it:

1. Open `advisors/scope-completion/WATCHDOG.yml` in the pstack checkout or installed package. `skill://setup-pstack` identifies the installed package location.
2. Add its entry to the existing `advisors` list in your project's `WATCHDOG.yml`, or use `/advisor configure` for the intended project or user scope. If no roster exists, use the bundled file as that scope's `WATCHDOG.yml`. Do not overwrite an existing roster or create a second `advisors` key.
3. Restart the project session after editing the file externally, then run `/advisor on` and `/advisor status` to check the active model. Use `/advisor dump raw` to confirm the Scope & Completion Guardian instructions. A single-advisor status may omit its name.

Check all discovered user and project rosters before adding it. Advisors merge by slug, not by field; a more-specific entry replaces an entry with the same slug. A new roster replaces the implicit default advisor. Explicitly named advisors with other slugs remain and can increase review usage and cost.

The entry keeps `scope: main`; it does not enable advisors on subagents. It leaves model, tools, cadence and catch-up settings to OMP's native defaults and configuration. An omitted model resolves the native `advisor` role, using native `slow` resolution when that role is unset. The default investigative tools are `read`, `grep`, `glob`, and `recall` when available, plus `advise` for notes. pstack grants no mutating tools and changes no saved settings.

Advisor notes do not replace a workflow's required independent correctness review or grant permission to narrow acceptance criteria. [OMP's Advisor guide](https://github.com/can1357/oh-my-pi/blob/v18.16.0/docs/advisor-watchdog.md) defines discovery, model resolution, permissions and lifecycle.

## Fallback and verification

同梱設定はHOMEと同じ `retry.modelFallback: true`、`fallbackOn: any` を保持し、Web検索のフォールバックチェーンも含みます。要求したモデルの実行を保証する設定ではありません。検証時は正確なセレクターを解決し、実行されたモデルを確認してください。設定オブジェクトはマージされるため、空の `fallbackChains` でも下位設定のマッピングが消えるとは限りません。

The smoke harness requires an exact available model, disables retry substitution, checks completed assistant messages and child task results, and rejects observed fallbacks or identity changes. Missing DeepSeek produces `UNAVAILABLE`, never simulated success. No GPT-versus-DeepSeek quality, speed or cost advantage is claimed without measurements on the same tasks.
