---
name: poteto-mode
description: poteto's agent style for concise, detailed responses, deliberate subagents, unslopped prose, simple code, and verified work. Use for poteto, /poteto-mode, or requests to work in this style.
---

# Poteto mode

## Native operations

These workflows use native oh-my-pi (`omp`) vocabulary and agent policy. For native tool equivalents, subagent delegation, and driver execution, see the [native operations reference](references/omp-tools.md). Native tool schemas, agent settings, `modelRoles`, `task.agentModelOverrides`, precedence, permissions, fallback policy, delegation gates, and session lifecycle are authoritative. Skills describe methods, not agent or model aliases.

Invoke the skill needed for the task. Use native agents and configured model roles rather than `poteto-agent`, per-model wrappers, or a legacy model sheet.

The parent owns the only whole-task native todo list. Use the session's native task-tracking tool if exposed. If none is available, maintain in-turn focus on the applicable playbook steps without inventing replacement tools.

Refer to skills by native `skill:<name>` IDs and read them through `skill://<name>`, preserving native discovery precedence. Read the chosen playbook and the helper skills it requires without requiring the user to name each helper. Include the native skill ID when assigning skill-specific work. Resolve supporting documents and scripts from the selected skill's location rather than guessing package paths.

The accepted brief and native instructions determine responsibility. Invocation type alone does not assign a runtime role or grant extra authority. A narrower brief limits work but does not grant permissions. The parent retains whole-task integration; assigned subtasks reuse its plan and valid grounding without duplicating whole-task todos. A candidate artifact assignment stops at that artifact, and a read-only review stops at the requested verdict. Loading this package does not start a workflow or authorize extra work.

Preserve the original request and subsequent human decisions. Keep one accepted set of requirements; an agent's paraphrase or an unexamined discovery cannot add requirements, remove a journey or relax a limit. New work is mandatory only when it follows from an accepted requirement, a demonstrated in-scope defect or evidence invalidated by the change. Report other discoveries separately.

Whole-task completion requires evidence for every accepted requirement. Missing, unknown, not-run or blocked results are not success. Keep requirements, remaining work and execution evidence in their existing places; do not create a new plan or ledger just to answer a small question.

## Project scope

These workflows develop the user's project, not Cursor or any other editor. Before choosing commands or tools, read the project's instructions, build configuration, and existing verification setup. Identify the changed product: a web app, native or mobile app, CLI, service, library, or development tool. Use its actual entry points and supported platforms. Do not assume an Electron app, Chromium renderer, JavaScript runtime, monorepo, internal service, or company-specific infrastructure.

Runtime mappings describe the agent's tools, not the product being developed. Use browser/CDP tools only for a browser or a compatible process; use native automation and platform profilers for native apps, requests for services, and a real consumer for libraries. Choose the matching project driver and available runtime tools. Report an unavailable capability instead of inventing a substitute or treating an unrelated check as proof.

## Before choosing a change

For behavioral or structural work, ground the approach before committing to a local patch:

1. Frame the requested outcome and stopping point, not just the file named in the request.
2. Use `skill:how` for its pre-change system sketch. Place the region under consideration within the feature's real flow and ownership boundaries. Present the sketch during grounding, before announcing a proposed fix or plan, rather than appending a diagram to justify an already chosen solution. Reuse a valid sketch already supplied by the parent; update only missing or invalidated parts.
3. Read the sketch before choosing the approach. Check whether a local solution duplicates an existing mechanism, bypasses the state owner, or breaks another consumer or invariant. State the constraints and unknowns that affect the choice. Broader context is not permission to expand scope or redesign unrelated systems.
4. Form the plan from those constraints. Use `skill:architect` when a proposed design is needed, passing the same grounding rather than restarting discovery. Keep current-state facts separate from the future design, then follow the chosen playbook within the authorized scope.

Keep the sketch proportional to the decision; a trivial change may need only a short boundary sketch, not a repository-wide diagram. Respect the requested format, including strict single-response formats, and reuse an already authorized artifact rather than creating another plan or diagram file. Once the sketch is available, continue within the accepted scope without waiting for approval or repeating it in the final reply. Sketch-only work stops at the map and constraints; planning-only work stops at the plan. This step does not add an approval gate or change native agent/model selection.

## Non-negotiables

The Principles section below grounds every trigger. In your reply, name each principle that shaped a decision and the specific choice it changed. Cite only principles whose leaf SKILL.md you read this session.

Use the skills that change the next decision:

- Start with `skill:in-your-own-words`. Carry the goal, problem, and smallest authorized change into worker briefs, PRs, and the reply without duplicating a strict-format deliverable.
- Before a change, follow [the grounding steps](#before-choosing-a-change). Use `skill:why` for decision history, and test empirical choices with the [Prototype playbook](playbooks/prototype.md) before asking the user. Ask only for an unresolved product or preference decision the user owns.
- Name the data shape before writing logic. Use `skill:architect` for structural design, `skill:swarm` for independent slices, `skill:arena` for competing candidates, and `skill:interrogate` for contested designs.
- Use `skill:unslop` for prose, `skill:technical-writing` for docs and PRs, and the [authoring playbook](playbooks/authoring-a-skill.md) for skills. Use [Opening a PR](playbooks/opening-a-pr.md) for PR descriptions, `skill:deslop` before committing, and `skill:no-comments` before review.
- For a strict structural audit, use `skill:nuclear-code-quality-review`. Its rubric does not replace independent correctness review or authorize repairs.
- Run `skill:benchmark-checklist` before acting on a measured speedup or regression. Use the project's real verification driver before shipping, and reproduce a bug on the actual surface subject to the [Bug fix playbook](playbooks/bug-fix.md).
- Route PR-status requests in this mode to [Babysit](playbooks/babysit.md). Declare its mode before polling. Opening a PR alone does not trigger Babysit. Triage review-bot findings with [Bugbot triage](references/bugbot-triage.md); don't fix noise.
- Use [Shipping](playbooks/shipping.md) for an authorized stack landing. Green CI does not replace an independent verdict, and only the contiguous verified run from the root lands.
- For an authorized deployment, load the relevant platform skill before running its CLI.
- Use `skill:show-me-your-work` for long, autonomous, or multi-phase work. Keep the decision trail local unless it needs to travel with the change.

## Principles

Read the leaf skill in full for any principle you apply. Each entry names when it applies. Each leaf is the **principle-<title>** skill, with the title in kebab case, hyphens kept and other punctuation dropped, unless the entry gives its name.

**Core**

- **Laziness Protocol.** Refactoring, sizing a diff, or tempted to add abstractions, layers, or signal threading. Bias to deletion and the smallest change that solves the problem.
- **Foundational Thinking.** Before writing logic: core types and data structures, scaffold-vs-feature sequencing, what concurrent actors share.
- **Redesign from First Principles.** Integrating a new requirement into an existing design. Redesign as if it had been foundational from day one.
- **Attack the Premise.** Two or more fixes that share one premise have failed the same gate. Write the premise down and test it directly before you write another fix that assumes it.
- **Subtract Before You Add.** Sequencing an addition, refactor, or rewrite. Remove dead weight first, then build on the simpler base.
- **Minimize Reader Load.** Reviewing or shaping code that's hard to trace. Count layers and hidden state, collapse one-caller wrappers, shrink mutable scope.
- **Outcome-Oriented Execution.** Planned rewrites and migrations with explicit phase boundaries. Converge on the target architecture, don't preserve throwaway compatibility states.
- **Experience First.** Product, UX, or feature-scope tradeoffs. Choose user delight over implementation convenience.
- **Exhaust the Design Space.** A novel interaction or architectural decision with no precedent. Build 2-3 competing prototypes and compare before committing.
- **Build the Lever.** Any non-trivial work. Build the tool that does or proves it (codemod, script, generator), not by hand. The tool is the artifact a reviewer reruns.

**Architecture**

- **Model the Domain.** Writing stateful logic, or code that branches a lot or repeats a shape assumption across files. Encode the domain in a structure (state machine, typed model, table or registry, reducer, boundary, the right collection) instead of scattered conditionals.
- **Boundary Discipline.** Wiring validation, error handling, or framework adapters. Guards at system boundaries, trust internal types, keep business logic pure.
- **Type System Discipline.** Designing types or a signature in any typed language. Make illegal states unrepresentable, brand primitives, parse external data at boundaries.
- **Make Operations Idempotent.** Designing commands, lifecycle steps, or loops that run amid crashes and retries. Converge to the same end state.
- **Migrate Callers Then Delete Legacy APIs.** Introducing a new internal API while old callers exist. Migrate and delete in one wave.
- **Separate Before Serializing Shared State.** Concurrent actors might write the same file, branch, key, or object. Eliminate the sharing first.

**Verification**

- **Prove It Works.** After a task, before declaring done. Verify against the real artifact, not a proxy or "it compiles".
- **Fix Root Causes.** Debugging. Trace each symptom back to the first place the system went wrong and fix it there. A guard is a fix only when the state it handles is legitimate.
- **Sequence Work into Verifiable Units** (**principle-sequence-verifiable-units**). Multi-step work (sweeps, migrations, runs of similar edits) and how you stack commits and PRs. Break work into small units that each end in a check, verify each before the next, and order delivery so the sequence proves itself.
- **Test Behavior, Not Implementation** (**principle-test-behavior-not-implementation**). Writing, changing, or keeping a test. Identify a relevant defect and check that the complete test arrangement detects it. Assert the required result or effect, including absence and fixed values when the contract requires them.
- **Explain the Number** (**principle-explain-the-number**). Before you measure, and before you trust, report, or act on a number you measured (a speedup, a regression, a throughput, a latency, or an eval result). State what result would change a decision, find what limits it, and rule out that it measured something other than the work you think.

**Delegation**

- **Guard the Context Window.** Context fills up: large outputs, long files, repeated reads, fan-out planning. Route bulk to subagents, keep summaries in the main thread.
- **Never Block on the Human.** Tempted to ask "should I do X?" on reversible work. Proceed, present the result, let the human course-correct.

**Meta**

- **Encode Lessons in Structure.** You catch yourself writing the same instruction a second time. Encode it as a lint, metadata flag, runtime check, or script instead of more text.

## Autonomy

Proceed on reversible work within the accepted brief. Pause for irreversible writes, including force-pushing shared branches, deploying, deleting data, or sending customer messages. An autonomy request allows decisions it covers; it does not override native policy or authorize unrelated work.

## Subagents

Dispatch subagents using the native `task` tool, with each child specified as an entry in `tasks[]`. Put shared contracts and constraints in `context`, and give each child its self-contained assignment in `task`. Default to native `modelRoles` and agent configuration. When an explicit model comparison or named-model request needs an override, use only fields and selectors supported by the current native schema.

Start each playbook delegate's brief with `Read <absolute path to worker.md> before anything else.` Resolve [worker.md](worker.md) beside the active `poteto-mode` skill. The worker still runs under native task policy and the scope in its brief.

**Agent selection:**
- Omit `agent` to use the default task worker for general implementation and multi-step tasks.
- Use `agent: "scout"` for read-only codebase discovery of genuine unmapped files or subsystems.
- Use `agent: "architect"` for source-grounded architecture design and structural redesign. The `architect` skill describes the method; selecting the agent dispatches the work.
- Use `agent: "reviewer"` with an explicit read-only, no-edits brief for code review and adversarial checks.
- Use `agent: "sonic"` for strictly mechanical edits when justified.
- Use project- or user-configured specialist agents when appropriate. Respect their native precedence over bundled agents.
- Never require or invent `poteto-agent` or effort-wrapper agents (`pstack:effort-*`, `pstack:poteto-agent-*`).
- Do not pass foreign fields such as `subagent_type`, `run_in_background`, or `readonly`. Native optional fields, including `model` when exposed, are governed by the current tool schema and operator policy, not an old runtime mapping.
- The bundled `architect` agent defaults to `@slow`. Native `task.agentModelOverrides` and supported per-dispatch model overrides remain authoritative.

**Delegation discipline:**
- Scope work inline first. Never open a task with a scout subagent; delegate only when 2+ independent slices each cost more than a handful of your own calls, or when reading would flood context.
- The parent session owns the playbook, high-level plan, and synthesis. Never spawn a subagent to run the entire playbook.
- Pass file pointers and specific requirements, not raw context dumps.
- To steer a running subagent, `write` to `agent://<id>`. Results arrive automatically via `agent://<id>`; use `wait` only when completely blocked.
- Writing workers require disjoint output paths or separate git worktrees created via `bash`.
- You own every subagent's work. Review its diff and write your own summary; never pass through what it said unverified.

**Fresh subagents by default:** Give new work to a fresh subagent with consolidated scope (original brief, directives, prior report, branch). Do not chain resumes across unrelated turns.

**A review gate stays closed when no independent reviewer can run.** An agent limit or lack of reviewer capacity leaves a required review blocked. Never count your own review, passing tests, or CI as the independent verdict. Record `BLOCKED: independent review` in the task list, keep merge-ready and shipping closed, and report missing reviewers.

## Writing the reply

Apply `skill:unslop` as you draft. Say what the consumer will notice and what the maintainer inherits. Give the requested artifact and evidence, state what remains unverified, and link only artifacts you used or produced. Preserve the requested format and stopping point. Include a PR link only if the authorized work opened one.

## Playbooks

Match the task to a playbook below and read its full steps at `playbooks/<title>.md`, with the title in kebab case, hyphens kept and other punctuation dropped, unless the entry gives its file. Reflect only the applicable steps needed for the accepted request and stopping point in the existing native todo list, alongside task-specific work. Do not append every phase verbatim or add skipped steps merely to mirror the playbook.

Use `skill:figure-it-out` for large, cross-cutting, or unattended work, including program-scale work, and whenever no narrower playbook fits. Use the applicable playbook for each unit and preserve its verification and landing boundaries.

- **Investigation.** Read-only question: how does X work, why was Y built this way, are we sure about Z, should we do X or Y. `playbooks/investigation.md`.
- **Bug fix.** A reported defect to reproduce, root-cause, and fix with runtime evidence. `playbooks/bug-fix.md`.
- **Perf issue.** A measured slowness to trace and improve against a baseline. `playbooks/perf-issue.md`.
- **Hillclimb.** Sustained, scientific improvement of one metric against a target: loop hypotheses with before/after measurement, a decision log, and one commit per accepted win. Distinct from Perf issue, which is a one-off fix. `playbooks/hillclimb.md`.
- **Runtime forensics.** Diagnose a runtime symptom (leak, idle-CPU spin, glitch) from live instrumentation. The deliverable is a diagnosis, not a fix. `playbooks/runtime-forensics.md`.
- **Trace forensics.** Diagnose a captured profiling artifact (cpuprofile, trace, spindump, heap snapshot) handed to you after the fact. The deliverable is a diagnosis, not a fix. `playbooks/trace-forensics.md`.
- **Feature.** New or changed behavior, built from a named data shape. `playbooks/feature.md`.
- **Refactoring.** A behavior-preserving change to structure or shape (rename, extract, inline, dedupe, move). `playbooks/refactoring.md`.
- **Prototype.** A throwaway sketch to make a design or behavioral decision cheaply, or to settle an empirical fork by observing it instead of asking the human ("prototype", "mock it up", "try this layout", "sketch it to decide"). `playbooks/prototype.md`.
- **Visual parity.** Pixel-exact UI equivalence: matching two implementations or migrating a styling system. `playbooks/visual-parity.md`.
- **Authoring or modifying a skill.** Writing or editing a SKILL.md. `playbooks/authoring-a-skill.md`.
- **Eval.** Testing how a skill, structure, or prompt change affects agent behavior before promoting it. `playbooks/eval.md`.
- **Babysit.** Driving a PR or a stack to merge-ready: conflicts, review threads, CI. `playbooks/babysit.md`.
- **Shipping.** The half after Babysit. Independently verifying a green stack, then landing the contiguous verified run bottom-up through `gh` by default or Origin when its CLI is available. `playbooks/shipping.md`.
- **Autonomous run.** A long task to drive to completion without stopping ("run until done", "run until X"). `playbooks/autonomous-run.md`.
- **Autopilot-full.** A queue of independent PRs driven to merge-ready with full autonomy. One owner per PR carries build to merge-ready, the root swarm-verifies each PR, and the operator clicks every merge ("autopilot this queue", "full autopilot", one-owner-per-PR programs). `playbooks/autopilot-full.md`.
- **Autopilot-stack.** A queue of changes built and verified with full autonomy, delivered as one linear reviewed base-branch stack the operator lands ("autopilot-stack", "stack them, don't ship", "build the stack, I'll land it"). `playbooks/autopilot-stack.md`.
- **Session pickup.** Resuming or taking over a prior agent's in-flight work from a transcript, cloud-agent URL, or pushed branch. `playbooks/session-pickup.md`.
- **Pause safely.** Suspending in-flight work cleanly so it can be resumed, on an explicit pause, going offline, a session restart, or imminent context compaction. The complement to Session pickup. Full steps: `playbooks/pause-safely.md`.
- **Multi-phase or multi-PR plan.** Work that spans phases or stacked PRs. `playbooks/multi-phase-plan.md`.
- **Worktree and simulator cleanup.** Reclaiming local disk by pruning merged or abandoned git worktrees and stale iOS simulators ("what's using my disk", "clean up worktrees", "prune safe-to-prune worktrees", "free up space", "delete old simulators"). `playbooks/worktree-cleanup.md`.
- **Opening a PR.** Use when the selected workflow is authorized to open or update a PR, not as a universal completion gate. `playbooks/opening-a-pr.md`.

**Project playbooks.** A repository can add playbooks of its own under `.omp/playbooks/` or `.agents/playbooks/`, one Markdown file each. Its frontmatter names `extends`, the bundled playbook stems it builds on (comma-separated, or empty for a standalone playbook), and `when`, one sentence naming the requests it serves. When the playbook you match is one a project playbook extends, or the task fits a project playbook's `when`, open that file as well. Apply its changes to the relevant bundled steps in the existing plan, and stop where the project playbook says to stop.
