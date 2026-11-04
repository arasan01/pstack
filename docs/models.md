# Model roles and qualification

OMP owns model selection, credentials, reasoning effort, context limits, service tiers and fallback. pstack supplies workflow guidance and example native overlays; it does not keep a second role sheet or implement provider protocols.

## Roles

| Role | Use in the example overlays |
| --- | --- |
| `default` | Main session. |
| `smol` | Discovery and mechanical work when that delegation is appropriate. |
| `slow` | Strong reasoning selection. |
| `plan` | Native plan-mode model. Assigning this role does not enter plan mode. |
| `task` | Default worker, referring to `@slow` in these examples. |
| `review` | Custom role for independent reviewers. |

`task.agentModelOverrides` connects agents to these roles. The default task worker uses `@task`; the packaged `architect` uses `@slow`; scout and sonic use `@smol`; reviewer uses `@review`. A skill is a method, not an agent or a model. Read-only design and synthesis are not discovery-only scout work. Role assignment alone does not cause a skill or task to execute on that role: inspect the actual dispatched agent and its resolved model.

The packaged `architect` agent reads `skill://architect` and follows the scope, constraints, deliverable and stopping condition in its task brief. Project and user agents with the same name take native precedence over package agents. Native per-agent and per-dispatch model overrides remain authoritative.

## Native overlays

From the checkout root:

```sh
omp --config profiles/gpt.yml
omp --config profiles/deepseek.yml
omp --config profiles/mixed.yml
```

The [profiles](../profiles/README.md) are examples, not availability promises. Adapt selectors to the provider and models available to you. `--config` applies to that invocation without persisting the overlay. `/modelpreset switch` has different persistence semantics and is not used by the smoke harness.

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

The example overlays set `retry.modelFallback: false`, which disables error-recovery switching. This is not a blanket promise that every unresolved startup selection fails: resolve the exact selector first and inspect the actual executed model. Empty `fallbackChains` objects do not necessarily clear lower-layer mappings because settings objects merge.

The smoke harness requires an exact available model, disables retry substitution, checks completed assistant messages and child task results, and rejects observed fallbacks or identity changes. Missing DeepSeek produces `UNAVAILABLE`, never simulated success. No GPT-versus-DeepSeek quality, speed or cost advantage is claimed without measurements on the same tasks.
