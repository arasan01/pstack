# Verify pstack on OMP

Run the package checks before live model scenarios:

```sh
bun install --frozen-lockfile
bun run validate
bun test tests/
bun tools/omp-smoke.mjs --discovery-only
```

Discovery installs this checkout into a temporary OMP agent directory, reads the installed `poteto-mode` skill, checks native extension command registration over RPC, and runs `/pstack` to completion. RPC session initialization selects the bundled profile's model metadata without authenticating or requesting inference. The readiness command must complete locally without invoking an agent turn. Discovery does not change the active user's plugin registration and does not qualify GPT inference.

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

## Check changed skill behavior

Use disposable fixtures for skill changes and retain the OMP traces and artifacts outside the repository. Load the source checkout with `-e <checkout>` and a temporary native model overlay, as above. These manual acceptance cases are not additional `--scenario` values.

| Workflow | Exercise | Required evidence |
| --- | --- | --- |
| `interrogate` | Review a small module with a boundary mismatch against a real consumer and an explicit contract. Run two independent adversaries without editing the source. | Exact commands, observed and expected outputs, root verification, deduplicated Findings, Dropped counts and reasons, Unverified risks or none, and unchanged project files. |
| `arena` | Run two candidates with every allowed native model selection on the parent's model family. | Actual child model identities, two candidate artifacts, a synthesized result, and an explicit cross-judge skip without changing native settings or waiving another workflow's required review. |
| Eval playbook | Compare two instruction variants with sanitized paths and organic requests while all allowed native model selections use the parent's model family. | Actual outputs, transcript coverage or an explicit gap, a judge-skip reason, and coordinator-only scores that are not presented as a blinded independent verdict. |
| `ketchup-video` | Render a recap from actual command results into a silent subtitled video outside the fixture. | A decoded frame from each slide showing a readable separate subtitle strip, no audio stream, and fully visible holds measured from the encoded frames. Count subtitle words and exclude fades. |
| Packaged `architect` agent | Load the checkout in an isolated agent directory and inspect the native task tool's available agents. Add a same-name project agent in the disposable fixture, then repeat. Delegate a bounded source explanation to `architect`. | The package agent is available without a user definition, the project definition takes precedence, and the delegated answer respects its scope and stopping boundary. Inspect actual model identity before making a model-specific qualification claim. |
| Scope & Completion Guardian | Explicitly add the bundled roster to a disposable project's `WATCHDOG.yml`. Enable the native advisor for that process, then run `/advisor status` and `/advisor dump raw`. | The native prompt contains the Guardian instructions and the commands preserve project files. This proves loading, not advisor judgment quality. Package installation alone must not install a user or project roster. |
| Architect candidate boundary | Give a fresh OMP session an existing parent's grounding and the architect candidate prompt, with a source-explanation-only assignment. | The candidate reads shared poteto-mode guidance, identifies the actual exported boundary, starts no task or todo workflow, creates no files, and stops at its assigned answer. Audit native tool calls and the workspace, not its self-report. |
| Native configuration and scoped briefs | In a disposable fixture, use custom native `modelRoles` and `task.agentModelOverrides`, plus same-name native agent definitions at the precedence levels supported by the installed OMP. Load pstack and assign bounded explanation, candidate-artifact, and read-only review tasks. Do not edit the operator's settings. | Retained effective configuration, actual agent definitions and model identities, and traces showing native precedence and permissions remain in force. The accepted brief limits each task without assigning a new runtime role, duplicating the parent plan, starting a whole workflow, or authorizing edits. Explicit-model qualification remains a separate check. |
| Pre-change system sketch | Ask poteto-mode for a plan in a disposable feature with two consumers of one state owner and an existing canonical operation. Do not explicitly supply the intended fix. Also exercise a strict-output or scoped-grounding-reuse request. | The actual answer places a source-grounded current-state sketch before its approach, identifies the relevant shared owner and consumers, and derives the change location from those relationships rather than duplicating state in the nearest file. Unknowns and future design are not presented as observed facts. Source files remain unchanged for planning-only work; strict output fields and valid parent grounding are preserved. |

Audit all visible assistant messages in order, not only the final reply or process exit code. A sketch appended after the first recommendation fails the pre-change check; strict single-response cases must not add an earlier prose or diagram update.

Reject fallback execution as proof for the requested model. Inspect outputs as well as process exit codes; a successful render command does not establish subtitle readability or sufficient hold time.

## Read the evidence

`evidence.json` records the versions, actual results, checks, requested and observed model identities, final answers, failures and unavailable targets. Raw JSONL event streams and stderr are retained beside it. Modified fixture artifacts are copied into a scenario subdirectory before temporary workspaces are removed.

Exit codes are:

- `0`: all requested checks passed.
- `1`: a process or acceptance check failed.
- `2`: no check failed, but a required model was unavailable. This is incomplete qualification, not a pass.

Catalog presence, authenticated discovery, successful inference and correct task completion are different claims. A catalog listing is not model execution proof. A fallback is not proof for the model originally requested. Review the outputs as well as the automatic predicates; the planning boundary check does not establish that a plan is optimal.

## Preserve workflow-specific boundaries

Investigation answers the question without implementation. Planning delivers the requested plan without starting implementation. Prototype produces an isolated experiment, not production code. Implementation follows the applicable verification and independent-review requirements of its selected playbook. Review reports findings without automatically applying fixes. Do not turn these distinct contracts into one universal design, review or PR gate.
