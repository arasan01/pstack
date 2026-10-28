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

`task.agentModelOverrides` connects agents to these roles. The default task worker uses `@task`; scout and sonic use `@smol`; reviewer uses `@review`. A skill is a method, not an agent or a model. Read-only design and synthesis are not discovery-only scout work. Role assignment alone does not cause a skill or task to execute on that role: inspect the actual dispatched agent and its resolved model.

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

## Fallback and verification

The example overlays set `retry.modelFallback: false`, which disables error-recovery switching. This is not a blanket promise that every unresolved startup selection fails: resolve the exact selector first and inspect the actual executed model. Empty `fallbackChains` objects do not necessarily clear lower-layer mappings because settings objects merge.

The smoke harness requires an exact available model, disables retry substitution, checks completed assistant messages and child task results, and rejects observed fallbacks or identity changes. Missing DeepSeek produces `UNAVAILABLE`, never simulated success. No GPT-versus-DeepSeek quality, speed or cost advantage is claimed without measurements on the same tasks.
