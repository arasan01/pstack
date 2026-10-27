---
name: reflect
description: Spawn three parallel review subagents over the active transcript, surface learnings, and route each to a concrete edit on an existing skill. Use when the user says reflect.
---

# Reflect

On Codex, read the [platform mapping](../poteto-mode/references/codex-tools.md), including its per-skill notes, before following this skill.

On GitHub Copilot, read the [platform mapping](../poteto-mode/references/copilot-tools.md), including its per-skill notes, before following this skill.

On oh-my-pi, read the [omp mapping](../poteto-mode/references/omp-tools.md) first. Native agent selection, model roles, effort, permissions, lifecycle, concurrency, and delegation rules win over generic dispatch guidance. Do not install a replacement runtime.

Mine the current conversation for durable learnings, then route them into skill edits.

Invoke when the user says "reflect" or "/reflect". Skip when the conversation is trivial, off-topic, or already covered by an existing skill the parent followed correctly. One-offs are not learnings.

## 1. Locate the active transcript

Find this conversation in the current runtime's workspace-scoped transcript directory. Never search other workspaces' private chats.

Run the streaming finder under the installed plugin with the sessions directory, an opening-prompt fragment, and the workspace:

```bash
node <plugin>/skills/reflect/scripts/find-transcript.mjs <workspace-transcripts-dir> "<opening prompt fragment>" "<workspace>"
```

Use the active omp profile's sessions path from the mapping, not a Claude-only path. The helper supports Claude's flat, nested, and subagent layouts, Pi and omp session JSONL, and Copilot event logs. It orders candidates newest first, validates the workspace where the format records it, and streams the records. It skips metadata and command wrappers before the opening typed prompt; for branched Pi and omp sessions it reads through the active branch. Do not replace it with a first-line parser or hand-written scan. If it exits 1, pass a tight session digest instead.

## 2. Spawn three reviewers in parallel

Dispatch three independent reviewers in one native batch, using the runtime mapping and **poteto-mode**'s Subagents section. Give them read-only briefs. They may need MCP access to cited tickets, chat threads, or traces; choose an available reviewer with that access without disabling native permission controls. The parent applies edits. If an evidence source is unavailable, report the gap.

Each reviewer and the synthesizer name a role in `pstack-models.md` and a default in [Models](#models). Resolve model, effort, and supported speed through the runtime mapping. Omit model fields the native schema does not support. Do not guess replacement model slugs or switch families after an error.

| Lens | Role line | Prompt template |
|---|---|---|
| Judgment | `reflect judgment, divergent, synthesizer` | `references/judgment-reviewer.md` |
| Tooling | `reflect tooling` | `references/tooling-reviewer.md` |
| Divergent | `reflect judgment, divergent, synthesizer` | `references/divergent-reviewer.md` |

Pass each template verbatim, substituting the transcript path or digest where marked. Reviewers return findings through native result delivery.

## 3. Synthesize

After all three results arrive, dispatch a separate read-only synthesizer with the `reflect judgment, divergent, synthesizer` role under the same runtime policy. It needs source access to spot-check citations. Use `references/synthesizer.md` verbatim with the reviewers' full outputs inlined. It returns an Accepted / Rejected / Backlog list.

## 4. Structural enforcement check

Move any Accepted item that a lint rule, script, metadata flag, or runtime check would enforce more reliably to Backlog. See the **encode-lessons-in-structure** principle skill.

## 5. Apply

Present the synthesizer's full Accepted / Rejected / Backlog output and wait for explicit approval before applying any Accepted edit. Show each intended editable destination and whether it is project-local or user-wide before approval. The user picks the subset and may redirect routings. Do not auto-apply.

File Backlog items only through an authorized team tracker. If access or authority is missing, report them without claiming they were filed.

Never edit an installed plugin or any `plugins/cache/` copy. Edit its source checkout when that is the approved destination. Otherwise copy the needed skill into an approved project-local discovery directory, such as `.omp/skills/<skill>/` or `.agents/skills/<skill>/` on omp, and edit that copy. A user-wide destination requires explicit approval for that exact path. Do not change global settings or other installed skills implicitly. Never open a PR or push.

Follow each approved row's Routing exactly:

- Trivial existing-skill edit (a one-line bullet, a tightened sentence, a stale fact corrected): the parent does it directly.
- Substantive existing-skill edit, description tuning, or an approved new skill: use the runtime's available skill-authoring guidance and its draft / test / iterate process. Use **plugin-dev:skill-development** only when installed. Do not invent an unavailable tool or bypass approval.

If your environment ships a SKILL.md validator, run it on every touched skill before declaring done.

## 6. Summarize for the user

Short list, no preamble:

- Edits applied: `<skill path>`. What changed, one line each.
- New skills created: `<skill path>`. One line each (rare).
- Backlog filed to the devex tracker: `<issue title>` (`<tags>`). One line each.
- Dropped: one line per rejected finding + reason from the synthesizer.

## Models

Role defaults, stamped from `plugins/pstack/models.json` (edit there, rerun `tools/generate.mjs`). Where the runtime supports pstack model configuration, a matching line in `pstack-models.md` overrides these defaults. On omp, use native model roles and agent settings instead; do not load this sheet or pass a worker `model`. `/setup-pstack` follows the current runtime's configuration.

- reflect tooling: `gpt-6.1-sol @medium`
- reflect judgment, divergent, synthesizer: `gpt-6.1-sol @medium`

## Reasoning effort

On omp, reasoning effort, model selection, fallback chains, and service tiers belong to native agent policy. Do not apply the pstack override-sheet or effort-agent instructions below on omp.

A role value in the override sheet may name a reasoning effort after its model, as in `gpt-6.1-sol @xhigh`. Levels on Claude Code: `low`, `medium`, `high`, `xhigh`, `max`. Which ones apply depends on the model. A value without `@` takes the sheet's `default effort` line, a level or `session`, and `session` when the sheet has no such line. `session` sets no effort, so the dispatch is the usual one. Strip the suffix before reading the model: `inherit-parent` or `auto` still omits `model` at every level, and a model name is passed as `model`. On Claude Code, a level picks the effort agent from the `subagent_type` you would otherwise use. `pstack:poteto-agent` becomes `subagent_type: "pstack:poteto-agent-<level>"`. `general-purpose`, or no `subagent_type`, becomes `subagent_type: "pstack:effort-<level>"`. The effort agents set only `effort`, so the model you pass still decides the model. On Codex, pass the level as `spawn_agent`'s `reasoning_effort` and keep the usual instructions.
