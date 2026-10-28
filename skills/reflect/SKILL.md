---
name: reflect
description: Spawn three parallel review subagents over the active transcript, surface learnings, and route each to a concrete edit on an existing skill. Use when the user says reflect.
---

# Reflect

Mine the current conversation for durable learnings, then route them into skill edits.

Invoke when the user says "reflect" or "/reflect". Skip when the conversation is trivial, off-topic, or already covered by an existing skill the parent followed correctly. One-offs are not learnings.

## 1. Locate the active transcript

Find this conversation in the current workspace's session directory. Never search other workspaces' private chats.

Run the streaming finder with the sessions directory, an opening-prompt fragment, and the workspace:

```bash
node skills/reflect/scripts/find-transcript.mjs <workspace-transcripts-dir> "<opening prompt fragment>" "<workspace>"
```

Use the active OMP profile's sessions path (`~/.omp/agent/sessions/<encoded-cwd>/` or the configured profile/XDG path). The helper reads OMP session JSONL, orders candidates newest first, validates the workspace cwd, and follows the active branch. Do not replace it with a first-line parser or hand-written scan. If it exits 1, pass a tight session digest instead.

## 2. Spawn three reviewers in parallel

Dispatch three independent read-only reviewers in one native batch. They may need MCP access to cited tickets, chat threads, or traces; choose an available reviewer with that access without disabling native permission controls. The parent applies edits. If an evidence source is unavailable, report the gap.

| Lens | Prompt template |
|---|---|
| Judgment | `references/judgment-reviewer.md` |
| Tooling | `references/tooling-reviewer.md` |
| Divergent | `references/divergent-reviewer.md` |

Pass each template verbatim, substituting the transcript path or digest where marked. Reviewers return findings through native result delivery.

## 3. Synthesize

After all three results arrive, dispatch a separate read-only synthesizer under native policy. It needs source access to spot-check citations. Use `references/synthesizer.md` verbatim with the reviewers' full outputs inlined. It returns an Accepted / Rejected / Backlog list.

## 4. Structural enforcement check

Move any Accepted item that a lint rule, script, metadata flag, or runtime check would enforce more reliably to Backlog. See the **principle-encode-lessons-in-structure** principle skill.

## 5. Apply

Present the synthesizer's full Accepted / Rejected / Backlog output and wait for explicit approval before applying any Accepted edit. Show each intended editable destination and whether it is project-local or user-wide before approval. The user picks the subset and may redirect routings. Do not auto-apply.

File Backlog items only through an authorized team tracker. If access or authority is missing, report them without claiming they were filed.

Never edit an installed package or any cache copy. Edit its source checkout when that is the approved destination. Otherwise copy the needed skill into an approved project-local discovery directory, such as `.omp/skills/<skill>/` or `skills/<skill>/`, and edit that copy. A user-wide destination requires explicit approval for that exact path. Do not change global settings or other installed skills implicitly. Never open a PR or push.

Follow each approved row's Routing exactly:

- Trivial existing-skill edit (a one-line bullet, a tightened sentence, a stale fact corrected): the parent does it directly.
- Substantive existing-skill edit, description tuning, or an approved new skill: follow [authoring-a-skill](../poteto-mode/playbooks/authoring-a-skill.md).

## 6. Summarize for the user

Short list, no preamble:

- Edits applied: `<skill path>`. What changed, one line each.
- New skills created: `<skill path>`. One line each (rare).
- Backlog filed to the devex tracker: `<issue title>` (`<tags>`). One line each.
- Dropped: one line per rejected finding + reason from the synthesizer.
