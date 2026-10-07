# pstack

Lauren Tan's [pstack](https://github.com/cursor/plugins/tree/main/pstack) is an opinionated Cursor skill stack that improves agent outcomes. [arasan01/pstack](https://github.com/arasan01/pstack) is a private hard fork of Michael Denyer's Claude Code port, with support for Codex, oh-my-pi, Pi, GitHub Copilot and other agent harnesses. It tracks Cursor's upstream skills and also carries named policy forks, each declared in [`tools/forks.json`](tools/forks.json).

Tell `poteto-mode` your goal and it will invoke the correct workflow for the task. This fork is for developing your own projects, not Cursor itself. Skills select commands, verification drivers, and diagnostic tools from the target repository and platform, whether you are working on a web app, native/mobile app, CLI, service, library, or development tool. Cursor attribution describes provenance, not a required product or toolchain.

For concurrency bugs and invariants that tests cannot reach, see the separate [agent-formal-verify](https://github.com/michael-denyer/agent-formal-verify) plugin, which adds TLA+ model checking and Lean proofs.

## Install

This repository is private. Installations need GitHub access to `arasan01/pstack` and authentication in the relevant runtime or Git client. For a local installation, run `gh repo clone arasan01/pstack` after `gh auth login`, then use the checkout's package or shared-skills instructions below.

### Claude Code

Run in Claude Code:

```text
/plugin marketplace add arasan01/pstack
/plugin install pstack@pstack
```

### Codex

Run in your terminal:

```shell
codex plugin marketplace add arasan01/pstack
codex plugin add pstack@pstack
```

### oh-my-pi (omp)

From this checkout's root, run:

```shell
omp install ./plugins/pstack
```

Start a new omp session, then request `poteto-mode` or `setup-pstack` by name. The separate [omp package](plugins/pstack/package.json) loads the shared skills and an omp routing adapter, not the Pi extension. Delegation, questions, and task tracking use omp's native `task`, `ask`, and `todo`. Without model overrides, workers use the session's model; `setup-pstack` can choose available provider/model IDs for each role and panel.

This links the checkout. Keep it at this path, and update it to update the installed skills. See [omp runtime details](docs/reference.md#oh-my-pi-omp) for profiles, routing, and differences from Pi.

### Pi

Run in your terminal:

```shell
pi install git:github.com/arasan01/pstack
```

The package loads the skills and the pstack Pi extension, which adds the subagent, question, and wake-up tools the skills use, plus `/loop` and the routing instruction. Invoke a skill with `/skill:<name>`.

### GitHub Copilot

Run in your terminal:

```shell
copilot plugin marketplace add arasan01/pstack
copilot plugin install pstack@pstack
```

This installs pstack for the Copilot CLI and the GitHub Copilot app, which share `~/.copilot`. Start a new session afterwards. Copilot ships no default pstack models, so the first skill that needs one runs `setup-pstack` to pick from the models your account lists, and later sessions reuse that choice.

The Copilot build is tested on Copilot CLI 1.0.87 through 1.0.92. On those versions the routing hook's context reaches the session alongside other plugins' session-start context. If a later version keeps only one plugin's context, `setup-pstack` offers a [standing instruction](plugins/pstack/skills/setup-pstack/copilot.md#wire-it-in) for `~/.copilot/copilot-instructions.md` instead. On 1.0.92, once the CLI caches its computer-use experiment assignment, `copilot -p` sessions list no plugin skills and a `skill` call returns "Skill not found". Interactive sessions, the hooks, and the agents are unaffected.

The shared skills default to OpenAI GPT models. Former Opus roles use `gpt-6.1-sol @medium`, former Fable roles use `gpt-6.1-sol @xhigh`, and former Sonnet panel entries use `gpt-6-luna @xhigh`. Panels retain three workers on two distinct models, with different reasoning effort on Sol. On omp, these become provider-qualified selectors with `:medium` or `:xhigh`; on Codex, pass the model and `reasoning_effort` separately. Claude Code cannot run these GPT defaults and requires an explicit model override; pstack must not silently substitute Claude.

Run `setup-pstack` to override model defaults or reasoning effort, or turn automatic routing off. A saved role row takes precedence over the skill default. The plugin installs the routing hook on Claude Code, Codex, and GitHub Copilot; Codex asks you to trust it through `/hooks` before it runs. On Pi and omp, their separate adapters inject the routing instruction. In Claude Code and the Copilot CLI, use `/pstack:setup-pstack`.

For Prime Agent, OpenCode, Gemini CLI, or skills-only installs for any harness, see [shared installation](docs/reference.md#shared-skills-installation).

## Getting started

```text
Use poteto-mode to fix the search filter resetting when I change pages.
```

For a bug, it reproduces the failure, uses `how` and `why` to investigate, delegates the fix, then reruns the failing case. If the fix crosses a function boundary, it brings in `architect` before implementation. You receive the fix and the failing and passing evidence.

[Other playbooks](plugins/pstack/skills/poteto-mode/SKILL.md#playbooks) cover planning, features, refactoring, performance issues, investigations, prototypes, PR maintenance, shipping, and longer projects.

![poteto-mode on Claude Code, Codex, and Pi turns a request into verified work. Choose a playbook, plan and delegate with architect, arena, or swarm, then review and verify with interrogate, tests, and measurements. Project playbooks customize the workflow, and setup-pstack configures the model and reasoning effort per role. Supporting skills include how, why, and unslop.](assets/pstack-overview.png)

## Details

- [Skills and slash commands](docs/reference.md#slash-commands)
- [Runtime setup](docs/reference.md#runtime-support)
- [Models and dependencies](docs/reference.md#configuration-and-dependencies)
- [Maintenance and port scope](docs/reference.md#maintenance)

## Data handling

pstack has no server or telemetry. Anything its skills ask your agent to read, including session transcripts, goes to your model provider. Scripts run locally, and PR tools use your GitHub CLI login.

## Contributing

Thanks for helping make this port better. Bug reports, documentation fixes, and runtime improvements are welcome. See [CONTRIBUTING.md](CONTRIBUTING.md) for the checks and where your change belongs. Report vulnerabilities privately as described in [SECURITY.md](SECURITY.md).

## License

This port, including its modifications and additions, is also [MIT-licensed](LICENSE), © 2026 Michael Denyer. Original pstack © 2026 Lauren Tan; imported cursor-team-kit skills © 2026 Cursor. Japanese prose rules from stop-ai-slop-jp are © 2026 Daichi Nagashima under [MIT](LICENSE-stop-ai-slop-jp). See [LICENSE-cursor-team-kit](LICENSE-cursor-team-kit) and [NOTICE.md](NOTICE.md).
