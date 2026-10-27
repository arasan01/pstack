# oh-my-pi tool mapping for pstack

pstack skills use Claude Code tool names. On oh-my-pi (`omp`), use the native tools below, not the pstack Pi extension. Read this mapping when using a pstack skill, including its per-skill notes. pstack is an optional skill library. Native instructions, tool schemas, modelRoles, agent selection, permissions, delegation, and task lifecycle take precedence over every generic pstack rule.

## Tool actions

| pstack / Claude action | On oh-my-pi |
| --- | --- |
| `Read`, `Write`, `Edit`, `Bash` | `read`, `write`, `edit`, `bash`; follow their schemas, including anchored edits when enabled. |
| `Grep`, `Glob` | `grep`, `glob`. Use `lsp` for symbol references, definitions, and refactors when a server is available. |
| `WebFetch`, `WebSearch` | `read` for URLs, `web_search` for queries. |
| `Skill`, `/pstack:<name>` | Read the discovered skill's SKILL.md; request `poteto-mode` by name. Do not call a nonexistent Claude `Skill` tool. |
| `Agent`, `Task` | `task`, with one entry per child in `tasks[]`. Ordinary entries have no `model` parameter. Use `agent` only to select an available specialist or user-configured agent. There is no `run_in_background` field. |
| N parallel `Agent` calls | When native delegation rules permit the work, use one `task` call containing N independent entries. Put shared requirements in `context` and each child's full brief in `task`. |
| Wait for agents | Results arrive automatically. Continue independent work; use `wait` only when blocked with nothing else to do, if the session exposes it. Never poll or use a sleep loop for completion. |
| `SendMessage` | `write` to `agent://<id>` to steer a running agent. Read a delivered result through `agent://<id>` if needed. A message is not a new dispatch or a promised resume. |
| `TaskCreate`, `TaskUpdate`, `TodoWrite` | Use the session's native task-tracking tool if one is exposed. Do not invent a `todo` tool or create a checklist file merely to satisfy a generic playbook. |
| `AskUserQuestion` | Use the session's exposed question tool and its schema, or ask in plain text. Native permission and confirmation rules still apply. |
| Stop an agent or schedule a wake-up | Use only a control or scheduling tool actually exposed by this session. Do not invent `stop_agent`, `schedule_wakeup`, or a `/loop` command from the Pi extension. |

## Subagent policy

Choose the most specific available native agent for the work. Omit `agent` for the default task worker. Read-only codebase discovery uses `scout`, code review uses `reviewer` with an explicit no-edits brief, and strictly mechanical work can use `sonic`. Use user-configured agents when appropriate. Do not require `poteto-agent`, Claude's `pstack:` namespace, or effort-wrapper agents.

Scope work inline before delegating, and keep omp's delegation gates, concurrency limits, nesting limits, and tool restrictions. A pstack panel or playbook is not an exemption. Give children file pointers and full requirements, review their output, and keep the independent-review gate closed if no independent reviewer can run. Do not count the author or passing tests as an independent reviewer.

Writing workers need the runtime's supported isolation or disjoint output paths. When separate worktrees are necessary, use the supported worktree mechanism or create them with `bash` and give each child its absolute worktree path. Do not pass Pi's `isolation: "worktree"` to an omp tool that does not accept it. Keep worktrees containing changes or commits until they are integrated.

Use omp's native completion notifications, statuses, follow-up, and cancellation controls. Generic pstack rules about fresh agents, resumes, stop confirmation, deadlines, or polling cannot redefine native task lifecycle. Continue independent work while children run, and wait only when blocked. Never invent a control tool or treat a delivered completion as permission to bypass native lifecycle rules.

## Model names

On omp, model selection, reasoning effort, fallback chains, and service tiers belong to native `modelRoles` and agent settings. The model defaults and effort wrappers in pstack skills do not override those settings. Ordinary `task` entries have no `model` parameter; omit it and use the default task agent, a native specialist, or a user-configured agent appropriate to the work. Do not create per-model agents, translate pstack model names or effort suffixes, or use `eval` to bypass native dispatch policy.

For panels, preserve independent candidates, review, and synthesis through the available native or user-configured agents, within omp's delegation and concurrency limits. Different agent names or reasoning levels do not establish model diversity. Disclose when distinct models cannot be confirmed. The omp adapter ignores `pstack-models.md`; setup inspects native configuration without creating a sheet or changing settings. See [omp setup](../../setup-pstack/omp.md).

## Skill invocation

Invoke a pstack skill explicitly when you want its workflow. The omp adapter preserves existing prompt blocks and adds only this optional mapping pointer. It does not load a model sheet, inject the session-start routing mandate, register replacement tools, or launch a `pi` child process.

An old `pstack-models.md` may remain on disk, but the omp adapter ignores its model rows and `session hook` setting. Do not read that sheet as an omp override, add an include to load it, or migrate its rows into native configuration. A skills-only install follows the same explicit-invocation policy. No pstack opt-in setting or automatic routing hook is required.

## Drivers and recurring work

Use `bash` to launch and exercise CLIs/TUIs. For web and native desktop apps use the session's `browser` and `computer` helpers, subject to its permissions and confirmation rules. Read a project verification skill by path if it was not discovered. Do not substitute passing tests for observation of the changed surface.

omp's native tools remain authoritative. The pstack omp adapter does not supply Pi's `/loop` or `schedule_wakeup`. For a babysit or autonomous playbook, use an exposed scheduler if one exists, or keep the actual PR watcher running with the session's background-process tools and work from its delivered output. A timer that merely runs a shell command is not an agent wake-up. If recurring agent turns are required and unavailable, report that limitation rather than promising unattended execution.

## Per-skill notes

| Skill | On oh-my-pi |
| --- | --- |
| `poteto-mode` | Use native task tracking when available and the subagent policy above. Explicit invocation selects the workflow, not a replacement runtime. |
| `setup-pstack` | Follow [omp setup](../../setup-pstack/omp.md) to inspect native configuration. Do not create a model sheet, configure effort wrappers, or enable a routing hook. |
| `poteto-help` | Use this mapping and the local installation's runtime documentation for omp commands, not Pi instructions or generic model-sheet defaults. |
| `how` | Dispatch read-only explorers with `scout`; give the explainer the delivered evidence. |
| `why` | Put permitted independent investigators in one `tasks[]` batch; start synthesis after their results arrive. Discover MCP capabilities from this session, not `claude mcp list`. |
| `interrogate` | Use independent native reviewers or configured review agents. Omit per-child model overrides and disclose unconfirmed model diversity. |
| `architect` | Use native or configured agents for separate sketches, then preserve the design comparison and verdict. |
| `arena` | Keep independent candidates, cross-review, and synthesis within native delegation limits. Agent labels do not prove model diversity. |
| `swarm` | Batch permitted independent workers in `tasks[]`; isolate writers before dispatch. Native lifecycle and concurrency rules override generic swarm instructions. |
| `no-comments` | Use an available comment-review specialist or a native reviewer with the [portable instructions](agents/comment-sicko.md). Review the current dirty worktree, not a clean worktree missing the changes. |
| `teach` | Batch independent how/why work only when native delegation rules permit it. Use Mermaid or text when image generation is unavailable. |
| `reflect` | Use this workspace's omp JSONL sessions and active branch. The transcript finder also accepts an explicit sessions directory. |
| `recall` | Read only this workspace's sessions under the active omp agent directory, not Claude's projects directory or another project's messages. |
| `show-me-your-work` | Check claims against this run's actual omp transcript and observed commands. |
| `automate-me` | Write project skills under `.omp/skills/` or `.agents/skills/`, not Claude-only discovery paths. |
| `create-verification-skill` | Write the project driver skill where omp discovers it, such as `.omp/skills/verify/SKILL.md`. |
| `maintain-verification-skill` | Use native read-only agents for investigation and the discovered project skill path. |
| `create-formal-verification-skill` | Put the generated skill in a discovered project skill directory and run the actual verifier through `bash`. Preserve the stated bounds, assumptions, and failing-variant proof. |
| `maintain-formal-verification-skill` | Inspect the project's actual formal verification skill and covered code. Keep edits limited to verification unless the user also requested a product fix. |
| `statechart` | Run the bundled CLI through `bash` in an external scratch directory. Follow its declared runtime, Java, and TLC requirements and native network permissions. Render with its documented Pele workflow; no Pi runtime or model dispatch is needed. |
| `in-your-own-words` | Restate the requested goal and problem without starting the underlying task. |
| `sharpen` | Rewrite the requested prompt without starting its task or bypassing native delegation rules. |
| `ketchup` | Use the current chat and delivered agent results. Keep the turn read-only and distinguish user messages from runtime notifications. |
| `ketchup-video` | Follow `ketchup`; render only the requested video outside the repo with available tools. If rendering is unavailable or fails, report it rather than inventing media. |
| `babysit` | Use an exposed question tool when needed; recurring work follows Drivers and recurring work above. |

## Vendored scripts

The bundled Bun/Node scripts work through `bash`. PR operations use `gh` by default or the supported Origin CLI; Graphite is not required. Transcript lookup and worktree auditing recognize omp sessions alongside the other runtimes. An explicit `PI_CODING_AGENT_DIR` selects the session root for that agent directory.
