# oh-my-pi native operations reference

This reference outlines native tool usage, subagent delegation, model policy, and driver execution on oh-my-pi (`omp`). Native instructions, tool schemas, agent selection, `modelRoles`, permissions, delegation gates, and session lifecycle are authoritative.

## Native tools

| Capability | Tool & usage |
| --- | --- |
| File operations | `read`, `write`, `edit` (surgical replacement). |
| Code search | `grep` (regex search), `glob` (file patterns). Use structural search (`xd://ast_grep`) or LSP where available. |
| Shell execution | `bash` for commands, builds, git, CLIs, and test runners. |
| Web access | `read` for URLs, `web_search` for search queries. |
| Code evaluation | `eval` for Python (`py`) or JavaScript (`js`) kernels. |
| Task delegation | `task` with one entry per child in `tasks[]`. Put shared contracts in `context` and each child's self-contained brief in `task`. Default to configured native model roles. |
| Agent coordination | `write` to `agent://<id>` to send steering messages to a running child. Read delivered output via `agent://<id>`. |
| Waiting | Results arrive automatically. Continue independent work; call `wait` only when completely blocked. Never poll or sleep. |
| Task tracking | Use the session's native task-tracking tool if exposed. Do not invent replacement tools or checklist files. |
| User interaction | Ask questions in plain text or through an exposed question tool. |

## Subagent and delegation policy

1. **Inline scoping:** Scope work inline using `grep`, `glob`, and `read` before delegating. Never open a task with a scout agent; delegate only when independent slices justify fan-out or when reading would flood context.
2. **Agent selection:**
   - Omit `agent` to use the default task worker for general tasks.
   - Use `scout` for read-only codebase discovery of genuine unmapped files.
   - Use `reviewer` with an explicit read-only, no-edits brief for code review and adversarial evaluation.
   - Use `sonic` for strictly mechanical, repetitive edits when justified.
   - Use user-configured specialist agents when appropriate.
   - Never require or invent `poteto-agent`, `architect`, or effort-wrapper agents (`pstack:effort-*`, `pstack:poteto-agent-*`).
3. **Dispatch parameters:** Ordinary entries use `task`, `solutionSpace`, and an optional `agent`. Native optional fields such as `model` remain available when the current schema and operator policy permit them; use them for an explicit named-model request or model comparison, not as a replacement role table. Foreign fields such as `run_in_background`, `subagent_type`, and `readonly` are not native dispatch parameters.
4. **Batching:** When parallel work is permitted, dispatch up to 32 independent workers in a single `task` call containing multiple entries in `tasks[]`.
5. **Filesystem isolation:** Concurrent writers require disjoint output paths or separate git worktrees created via `bash`. Never pass unsupported isolation flags to tools.
6. **Parent ownership:** The parent session owns the playbook, high-level plan, and synthesis. Subagents receive scoped, verifiable briefs with file pointers and explicit criteria.

## Model and reasoning policy

Model selection, reasoning effort, fallback chains, and service tiers are governed by native `modelRoles` and agent configuration.
- Do not read, write, or require override model sheets.
- Default to configured roles. An explicit named-model request or model comparison may use the current native schema's supported override fields; resolve selectors first and do not maintain a second routing table.
- For multi-candidate panels (`arena`, `architect`, `interrogate`), preserve independent candidates, reviews, and synthesis through available native or configured agents within delegation limits. Disclose when distinct model families cannot be confirmed.

## Installed paths

Read `skill://poteto-mode` to obtain the installed `SKILL.md` location. Resolve bundled references and `scripts/` from that skill directory. Examples beginning `skills/poteto-mode/` are package-relative paths, not paths in the target project's working directory. Execute the resolved absolute helper path while keeping the working directory on the target project. Project-local `.omp/skills/` and other explicitly named target-project paths remain project-relative.

## Drivers and verification

- Drive CLIs, TUIs, background services, and test suites with `bash`.
- Drive web or desktop applications with exposed session tools (`browser`, `computer`) when available, or invoke project verification skills (e.g. `.omp/skills/verify/SKILL.md`).
- Always observe real consumer artifacts and behavior; passing unit tests or compilation logs do not prove end-to-end functionality.
- Recurring PR watching or background monitoring runs via native background-process tools; do not invent recurring `/loop` commands or synthetic timers.
