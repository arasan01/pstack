---
name: how
description: "Use for understanding existing code, source-grounded system or feature sketches before planning a change, and placement or ownership questions. Map the current flow, state owners and change boundary. Use architect for the proposed design and why for motivation."
---

# How

Use the shared guidance in `skill:poteto-mode` within the accepted brief. Reading it does not start another workflow or select an agent or model.

Explore the codebase to answer "how does X work?" questions. Produce architectural explanations at the level of a senior engineer onboarding onto a subsystem, enough to build a working mental model, not so much that it reads like annotated source code.

This is a read-only investigation workflow. It produces a clear mental model and cited explanation; it does not implement changes or impose an implementation review gate.

The accepted brief and native policy determine responsibility, not whether the request is direct or delegated. For a scoped subtask, reuse the parent's plan and valid grounding, investigate only the missing evidence, and return the assigned explanation. Do not duplicate whole-task todos. A narrower brief does not grant permissions.

## 1. Assess complexity

If the scope is ambiguous, state your interpretation and explore. The user can redirect.

- **Simple** (a single module, a small utility, a narrow question such as "how does function X work"): no explorers. Investigate inline or dispatch one explainer that explores and explains in one pass, built from `references/explainer-prompt.md` without the explorer-findings section. Go to step 4.
- **Complex** (a subsystem spanning multiple files or services, a cross-cutting feature, a full architectural overview): go to step 2.

When in doubt, take the simple path.

## Pre-change system sketch

When grounding a behavioral or structural change, present the current-system sketch and its constraints during grounding, before recommending or choosing the implementation approach. A diagram appended after a recommendation does not serve this purpose. This is part of the existing investigation, not a second workflow. A one-file change can affect a shared boundary; choose the scope from the behavior, not the file count.

1. Bound the feature by the user's goal. Identify the entry point, observable outcome and region under consideration. Include enough surrounding context to place that region in the feature; do not inventory the whole repository.
2. Trace the real path through callers, responsibilities, dependencies and data or state owners. Check other consumers of shared state or interfaces. Ground nodes and edges in actual calls, data access, configuration or documented external boundaries, not filenames alone.
3. Draw one coarse current-state diagram. Use Mermaid for branching flows, shared owners or multiple consumers. Show the feature context and the region under consideration in the same view with labels or a subgraph. Mark neighboring responsibilities that must remain unchanged. Add a focused view only when one diagram cannot explain the relevant relationships. A trivial single-boundary relationship can use a short textual sketch instead.
4. Attach the source anchors needed to verify the relationships. Separate confirmed facts, inferred links and unknowns. Keep proposed components out of the current-state diagram. In greenfield work, show only confirmed requirements or external boundaries and label the missing implementation; do not invent an existing system.
5. State what the sketch constrains: where the change belongs, which existing mechanism could be reused, which consumers or invariants it must preserve, and what still needs investigation. Flag a local approach that duplicates an owner, bypasses an interface or moves responsibility across a boundary. This is input to the parent's decision or `skill:architect`, not authorization to redesign adjacent systems.

Reuse the parent's valid sketch and grounding. Refresh only missing or invalidated relationships; an assigned slice does not redraw the whole system. Keep source access read-only. When the response format permits, show the sketch and constraints in a grounding update before the approach. The parent can then continue authorized planning or implementation without waiting for approval, referencing that sketch later instead of redrawing it in the final reply. Otherwise keep the relationships and constraints in the requested response or an explicitly authorized artifact. Do not create a diagram file, plan, log or separate todo list by default.

Preserve the requested output format. If it cannot carry a diagram, express the relationships and constraints in its permitted fields; do not add unrequested keys, files or a second response. A sketch-only request stops at the sketch and constraints. A planning request may continue to a plan, but not implementation.

## 2. Explore (complex only)

Decompose the question into 2 to 4 angles, each a distinct slice of the subsystem. When genuine unmapped codebase exploration is required, dispatch read-only explorers using native `task` with `agent: "scout"` in a single call, each with `references/explorer-prompt.md` and its angle filled in.

## 3. Synthesize (complex only)

Once all explorers have returned, synthesize their findings using `references/explainer-prompt.md` with every explorer's findings filled in. Synthesis can run inline or via a default task worker.

## 4. Present

Present the explainer's output. Light edits for clarity or context from the conversation are fine. Do not substantially rewrite it.

## Output format

The explanation uses the sections defined in `references/explainer-prompt.md`, dropping any that do not apply: Overview, Key Concepts, How It Works, Where Things Live, Gotchas.

For pre-change grounding, put the current-system sketch and its change-boundary constraints before any proposed approach. Reuse or omit overlapping explanation sections rather than repeating the same map in prose.
