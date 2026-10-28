# Verify pstack on OMP

Run the package checks before live model scenarios:

```sh
bun install --frozen-lockfile
bun run validate
bun test tests/
bun tools/omp-smoke.mjs --discovery-only
```

Discovery installs this checkout into a temporary OMP agent directory, reads the installed `poteto-mode` skill, checks native extension command registration over RPC, and runs `/pstack` to completion. RPC session initialization selects the bundled GPT profile's model metadata without authenticating or requesting inference. The readiness command must complete locally without invoking an agent turn. Discovery does not change the active user's plugin registration and does not qualify GPT inference.

The smoke runner requires Bun 1.3.14 or newer and the installed development dependencies. It uses OMP's native stable-process API for graceful termination and descendant cleanup, including detached verification commands. A deadline starts cancellation; teardown may take up to 16 additional seconds. Interrupting the suite stops subsequent scenarios. The implementation scenario also requires Node on `PATH` for its exported-API consumer.

## Qualify an available model

Use an exact `provider/model-id` from `omp models --json`:

```sh
bun tools/omp-smoke.mjs --scenario all \
  --model openai-codex/gpt-6.1-sol \
  --output-dir /tmp/pstack-qualification
```

The output directory must be empty. Without `--output-dir`, each run creates a timestamped directory under `.omp-smoke-output/`. `--timeout` sets the per-scenario process deadline in milliseconds; the default is 180000. Set `OMP_BIN` to select a different OMP executable.

Model scenarios use current native credentials, a temporary workspace, and a temporary `--config` overlay. They do not switch presets, persist role assignments, or install the checkout into the active profile. They disable retry-model substitution and compare completed messages' actual provider/model identity with the exact requested model. This is not a filesystem sandbox: the agent still runs with the process's OS permissions. Use only authorized credentials and inspect the retained traces.

| Scenario | Observed acceptance |
| --- | --- |
| `discovery` | Native installation, installed skill read, command registration, and local `/pstack` completion succeed without inference. |
| `investigation` | The answer computes region precedence from fixture inputs correctly, and workspace file contents remain unchanged. |
| `planning` | The answer identifies the affected entry point and its verification; the workspace remains unchanged. |
| `implementation` | A real Node consumer imports the edited API and checks whitespace normalization, Unicode preservation, and an empty result. |
| `delegation` | Two native task assignments finish successfully on the requested model; their evidence produces the correct aggregate without file mutations. |
| `deepseek` | Run all four model scenarios on an available DeepSeek model. If none is available, report `UNAVAILABLE` without invoking a replacement. |
| `all` | Run discovery and the four scenarios for the requested model, then qualify DeepSeek separately when available. |

Use `--scenario <name>` to run one scenario. Model scenarios require `--model`; `deepseek` selects an exact model from the current available roster. There is no dry-run path that reports passing evidence.

## Read the evidence

`evidence.json` records the versions, actual results, checks, requested and observed model identities, final answers, failures and unavailable targets. Raw JSONL event streams and stderr are retained beside it. Modified fixture artifacts are copied into a scenario subdirectory before temporary workspaces are removed.

Exit codes are:

- `0`: all requested checks passed.
- `1`: a process or acceptance check failed.
- `2`: no check failed, but a required model was unavailable. This is incomplete qualification, not a pass.

Catalog presence, authenticated discovery, successful inference and correct task completion are different claims. A catalog listing is not model execution proof. A fallback is not proof for the model originally requested. Review the outputs as well as the automatic predicates; the planning boundary check does not establish that a plan is optimal.

## Preserve workflow-specific boundaries

Investigation answers the question without implementation. Planning delivers the requested plan without starting implementation. Prototype produces an isolated experiment, not production code. Implementation follows the applicable verification and independent-review requirements of its selected playbook. Review reports findings without automatically applying fixes. Do not turn these distinct contracts into one universal design, review or PR gate.
