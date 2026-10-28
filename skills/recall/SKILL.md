---
name: recall
description: "Reconstruct your recent working context from your own chat history, live state, and the shared record (user reports, prior fixes, incidents), then hand back a tight current-state brief. Use for 'recall my work on X', 'catch me up', 'what have I been working on', 'where did I leave off', before starting or resuming work, and before telling the user that something was never recorded."
---

# Recall

**Before you start or resume work, you rebuild the user's recent working context and hand back a tight capsule of where things stand now and what to do next.**

Keep it tight and on-topic. Read only what the in-scope threads need, then stop.

Your context lives in two records. Your own chat history holds what you did and decided. The shared record holds everything that happened around the same code under other names: the symptoms users keep reporting, the fixes that shipped and got reverted, the errors still firing in prod. That second record is what the **why** skill searches, across source control, the issue tracker, chat and issue channels, long-form docs, and error tracking. A feature with a long bug tail keeps most of its story there, so don't reconstruct it from your transcripts alone.

Find transcripts through OMP's workspace-scoped session store (`~/.omp/agent/sessions/<encoded-cwd>/*.jsonl` or the active profile/XDG path). JSONL headers and tool events are not necessarily chat messages. Never scan unrelated workspaces.

1. Classify, then route. One specific prior chat to resume is the `session-pickup` playbook, not this. Turning habits into a durable skill is `automate-me`. A human-readable summary of your work is a different task. Recall loads working context across recent chats before you act. If the user already gave you a full state capsule (paths, branch, the change), use it and skip the mining.
2. Lock the scope before searching. Pin the window ("recent" is a real range, default the last 7 days), the topic if named, and the workspace (default the active one. Never read another project's transcripts without being asked). State the scope back. Never quietly turn "all" into "recent N".
3. Split a large corpus among independent read-only investigators when native delegation rules permit. Order candidates by real modification time, not UUID name. Search the topic before reading only matching chats and relevant regions. Skip the current chat and obvious subagent, eval, and test noise. Return one block per chat with its topic, user goal, decisions, open threads, struggles and corrections, and artifacts, citing its session ID. For one or two chats, search directly. Keep raw transcripts out of the main thread.
4. Sweep the shared record whenever the topic names a feature, file, subsystem, area, or bug. "My work on X" does not exempt it. Use **why**'s source investigators to ask what the current state is, what was tried and did not hold, and what users still report. Run source searches alongside transcript mining when independent. Null results are findings; name unavailable sources. Also search every location the project's standing rules name for queued or recorded items, such as a memory directory, decisions log, planning tree, or project-instructions pointer, before saying anything was never recorded. Skip this sweep only for activity recall with no named target, such as "what did I do this week".
5. For human rulings, apply [Claims about human decisions](../why/references/epistemics.md#claims-about-human-decisions). Preserve the attributable original wording and source when exact scope matters, separate agent interpretations, and treat copied summaries as one evidence chain.
6. Check surfaced PRs, branches, and tickets against live state through the available repository and forge tools. When the answer hinges on tools an agent ran, files it read, or errors it hit, inspect the relevant full transcript records, not only a trimmed summary.
7. Write the brief to the contract below. Group by thread and stay on the named topic.

## Output contract

Lead with the capsule, then the thread status, then the problems, then the next move. Deeper detail goes below or gets cut.

- **Capsule.** At most 5 bullets. What this work is and where it stands overall.
- **Threads.** One line each, prefixed with exactly one status tag: `[merged #N]`, `[open PR #N]`, `[in flight <branch>]`, `[verified, uncommitted]`, `[reverted #N]`, or `[planned, not started]`. A thread with no tag is not done yet, so tag it.
- **Problems.** At most 5, the recurring ones. Include the symptoms users keep reporting and any fix that shipped and was reverted, so the next attempt starts where the last one failed.
- **Next move.** The single most useful next action, concrete.

An adjacent feature or ticket stays out unless it blocks this one. When the capsule and thread lines outgrow a screen, cut detail before you cut threads. Write the brief through the **unslop** skill, cite chat findings by UUID and shared-record findings by their source (PR #, ticket ID, chat permalink, error-tracker issue), and sanitize private context before any public output.

**Reply:** the brief, to the contract above.
