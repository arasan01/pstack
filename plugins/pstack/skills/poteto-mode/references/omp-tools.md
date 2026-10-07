# oh-my-pi tool mapping for pstack

pstack skills use Claude Code tool names. On oh-my-pi (`omp`), use the native tools below, not the pstack Pi extension. Read this mapping before following a pstack skill, including the skill's notes. Runtime tool schemas and user instructions take precedence over the Claude-specific spelling and defaults.

## Tool actions

| pstack / Claude action | On oh-my-pi |
| --- | --- |
| `Read`, `Write`, `Edit`, `Bash` | `read`, `write`, `edit`, `bash`; follow their schemas, including anchored edits when enabled. |
| `Grep`, `Glob` | `grep`, `glob`. Use `lsp` for symbol references, definitions, and refactors when a server is available. |
| `WebFetch`, `WebSearch` | `read` for URLs, `web_search` for queries. |
| `Skill`, `/pstack:<name>` | Read the discovered skill's SKILL.md; request `poteto-mode` by name. Do not call a nonexistent Claude `Skill` tool. |
| `Agent`, `Task` | `task`, with one entry per child in `tasks[]`. It returns background handles; there is no `run_in_background` field. |
| N parallel `Agent` calls | One `task` call containing N independent entries. Put shared requirements in `context` and each child's full brief in `task`. |
| Wait for agents | Results arrive automatically. Continue independent work; use `wait` only when blocked with nothing else to do, if the session exposes it. Never poll or use a sleep loop for completion. |
| `SendMessage` | `write` to `agent://<id>` to steer a running agent. Read a delivered result through `agent://<id>` if needed. A message is not a new dispatch or a promised resume. |
| `TaskCreate`, `TaskUpdate`, `TodoWrite` | `todo`; copy the playbook steps into its phase/items structure and address mutations by the verbatim task text. |
| `AskUserQuestion` | `ask`, using its questions/options schema. Without an interactive UI, ask in plain text instead. |
| Stop an agent or schedule a wake-up | Use only a control or scheduling tool actually exposed by this session. Do not invent `stop_agent`, `schedule_wakeup`, or a `/loop` command from the Pi extension. |

## Subagent policy

Map the Claude `subagent_type` to an omp agent selector, not a `subagent_type` property. For a pstack playbook worker, use the installed `poteto-agent` when it is listed among the session's available agents; otherwise use the default task agent and include the [worker policy](../SKILL.md#subagents) in the brief, along with the chosen playbook step. Use the installed `comment-sicko` for that review when available, or give its [portable instructions](agents/comment-sicko.md) to a review agent. Never assume that Claude's `pstack:` namespace or effort agents are registered on omp.

Read-only codebase discovery uses omp's `scout`. A code review uses a read-only reviewer and an explicit no-edits brief. Do not send a writing task to a scout. Keep the runtime's delegation gates, nesting limits, and tool restrictions. Give children file pointers and full requirements, review their output, and keep the independent-review gate closed if no independent reviewer can run.

Writing workers need isolated worktrees or disjoint output paths. Use the session's supported isolation mechanism; when it has no worktree dispatch field, create separate git worktrees through `bash` and give each child its absolute worktree path and the instruction to work only there. Do not pass Pi's `isolation: "worktree"` to an omp tool that does not accept it. Keep worktrees containing changes or commits until they are integrated.

## Model names

Skills print Claude defaults, but omp must not inherit those provider choices. Without an omp model sheet, omit each child's `model` so it uses the current session model. `inherit-parent` and `auto` also omit `model`. A saved role row overrides this with an exact `provider/model` selector or an omp-supported role alias. List the catalog with `omp models --json` and validate the chosen selector against the session's task schema. Never silently fall back to a different model when dispatch fails.

Translate a sheet's `@<level>` suffix to omp's `provider/model:level` selector where supported; `default effort: session` leaves thinking unchanged. Explicit effort with an inherited model uses the current-model selector `@default:<level>` if the runtime supports it. Do not dispatch Claude effort agents.

For diverse-model panels, dispatch one child per configured entry on distinct reachable models. Until setup chooses a diverse panel, keep the workflow's reviewer count on the session model and state that model diversity is reduced. See [omp setup](../../setup-pstack/omp.md).

## Session routing

The omp build loads its own routing adapter and this mapping. It does not register replacement `task`, `ask`, or `todo` tools and never launches a `pi` child process. Its model sheet is `pstack-models.md` in the active omp agent directory. `session hook: off` disables automatic routing but keeps the mapping and model sheet available.

A skills-only installation has no routing adapter. Request `poteto-mode` explicitly, or add a standing instruction to the runtime's `AGENTS.md`. Do not claim that a disabled or missing adapter routes new tasks.

## Drivers and recurring work

Use `bash` to launch and exercise CLIs/TUIs. For web and native desktop apps use the session's `browser` and `computer` helpers, subject to its permissions and confirmation rules. Read a project verification skill by path if it was not discovered. Do not substitute passing tests for observation of the changed surface.

omp's native tools remain authoritative. The pstack omp adapter does not supply Pi's `/loop` or `schedule_wakeup`. For a babysit or autonomous playbook, use an exposed scheduler if one exists, or keep the actual PR watcher running with the session's background-process tools and work from its delivered output. A timer that merely runs a shell command is not an agent wake-up. If recurring agent turns are required and unavailable, report that limitation rather than promising unattended execution.

## Per-skill notes

| Skill | On oh-my-pi |
| --- | --- |
| `poteto-mode` | Use native `todo` and the subagent policy above. Runtime/user instructions override the skill's autonomy policy. |
| `setup-pstack` | Follow [omp setup](../../setup-pstack/omp.md) instead of Claude model detection, family-name rewriting, effort-agent dispatch, and include wiring. |
| `poteto-help` | Use this mapping and the local installation's runtime documentation for omp commands, not Pi instructions. |
| `how` | Dispatch read-only explorers with `scout`; give the explainer the delivered evidence. |
| `why` | Put independent investigators in one `tasks[]` batch; start synthesis after their results arrive. Discover MCP capabilities from this session, not `claude mcp list`. |
| `interrogate` | Use independent reviewers with the configured provider/model selectors. Do not count the author or passing tests as a reviewer. |
| `architect` | Arena's candidates use native `task`; preserve the separate sketches and design verdict. |
| `arena` | Each panel entry becomes one child with its own model; preserve model diversity or disclose its absence. |
| `swarm` | Batch independent workers in `tasks[]`; isolate writers before dispatch. |
| `no-comments` | Use the comment-sicko instructions and the current dirty worktree, not a clean worktree missing the changes under review. |
| `teach` | Batch independent how/why work; use Mermaid or text when image generation is unavailable. |
| `reflect` | Use this workspace's omp JSONL sessions and active branch. The transcript finder also accepts an explicit sessions directory. |
| `recall` | Read only this workspace's sessions under the active omp agent directory, not Claude's projects directory or another project's messages. |
| `show-me-your-work` | Check claims against this run's actual omp transcript and observed commands. |
| `automate-me` | Write project skills under `.omp/skills/` or `.agents/skills/`, not Claude-only discovery paths. |
| `create-verification-skill` | Write the project driver skill where omp discovers it, such as `.omp/skills/verify/SKILL.md`. |
| `maintain-verification-skill` | Use native read-only task agents and the discovered project skill path. |
| `babysit` | Questions use `ask`; recurring work follows Drivers and recurring work above. |

## Vendored scripts

The bundled Bun/Node scripts work through `bash`; PR operations still need `gh`, and stack operations may need `gt`. Transcript lookup and worktree auditing recognize omp sessions alongside the other runtimes. An explicit `PI_CODING_AGENT_DIR` selects the session root for that agent directory.
