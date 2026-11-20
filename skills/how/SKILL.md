---
name: how
description: "Use for understanding existing code, source-grounded system or feature sketches before planning a change, and placement or ownership questions. Map the current flow, state owners and change boundary. Use architect for the proposed design and why for motivation."
---

# How

Use the shared guidance in `skill:poteto-mode` within the accepted brief. Reading it does not start another workflow or select an agent or model.

Trace existing code to give a senior engineer a usable mental model. If the scope is ambiguous, state your interpretation and proceed. Start inline and keep the investigation read-only. Use native delegation for genuinely independent missing slices only when native policy permits. Give each explorer a bounded question and the existing grounding. Synthesize the cited findings into one explanation.

For an assigned slice, reuse the parent's plan and valid grounding. Investigate only missing or invalidated relationships. A walkthrough should explain the entry point, flow, ownership, and surprising behavior relevant to the question. Skip a repository tour and details the reader can get from one source file.

## Pre-change system sketch

When grounding a behavioral or structural change, present the current-system sketch and its constraints during grounding, before recommending or choosing the implementation approach. A diagram appended after a recommendation does not serve this purpose. This is part of the existing investigation, not a second workflow. A one-file change can affect a shared boundary; choose the scope from the behavior, not the file count.

1. Bound the feature by the user's goal. Identify the entry point, observable outcome and region under consideration. Include enough surrounding context to place that region in the feature; do not inventory the whole repository.
2. Trace the real path through callers, responsibilities, dependencies and data or state owners. Check other consumers of shared state or interfaces. Ground nodes and edges in actual calls, data access, configuration or documented external boundaries, not filenames alone.
3. Draw one coarse current-state diagram. Use Mermaid for branching flows, shared owners or multiple consumers. Show the feature context and the region under consideration in the same view with labels or a subgraph. Mark neighboring responsibilities that must remain unchanged. Add a focused view only when one diagram cannot explain the relevant relationships. A trivial single-boundary relationship can use a short textual sketch instead.
4. Attach the source anchors needed to verify the relationships. Separate confirmed facts, inferred links and unknowns. Keep proposed components out of the current-state diagram. In greenfield work, show only confirmed requirements or external boundaries and label the missing implementation; do not invent an existing system.
5. State what the sketch constrains: where the change belongs, which existing mechanism could be reused, which consumers or invariants it must preserve, and what still needs investigation. Flag a local approach that duplicates an owner, bypasses an interface or moves responsibility across a boundary. This is input to the parent's decision or `skill:architect`, not authorization to redesign adjacent systems.

Reuse the parent's valid sketch and grounding. Refresh only missing or invalidated relationships; an assigned slice does not redraw the whole system. Keep source access read-only. When the response format permits, show the sketch and constraints in a grounding update before the approach. The parent can then continue authorized planning or implementation without waiting for approval, referencing that sketch later instead of redrawing it in the final reply. Otherwise keep the relationships and constraints in the requested response or an explicitly authorized artifact. Do not create a diagram file, plan, log or separate todo list by default.

Preserve the requested output format. If it cannot carry a diagram, express the relationships and constraints in its permitted fields; do not add unrequested keys, files or a second response. A sketch-only request stops at the sketch and constraints. A planning request may continue to a plan, but not implementation.
