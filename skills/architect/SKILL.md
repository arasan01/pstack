---
name: architect
description: "Sketch types, signatures, and module structure before code, then stay in the loop while implementation fills in. Use for /architect, 'architect this', 'design this', or non-trivial work where jumping to code would lock in the wrong shape."
---

# Architect

Use the shared guidance in `skill:poteto-mode` within the accepted brief. Reading it does not start another workflow or select an agent or model.

## Ground and sketch

Before writing code, trace the systems the change touches with `skill:how`. Reuse valid current-system grounding from the parent. Refresh only missing or invalidated relationships. Keep observed behavior and constraints separate from the design. If ownership or layering changes, use `skill:why` to recover the rationale when it is missing.

Start from what real callers need to do. Show representative usage, including what comes back, then sketch two structurally different ways to realize it. Compare the data structures, types, signatures, and module boundaries. Variations inside one structure do not count. For a large or contested design, use `skill:arena` with the same grounding instead of sketching alone. If its candidates converge, still compare a genuinely different shape before choosing.

Prune any design that splits state ownership, makes callers coordinate internal steps, or gives them two ways to do one task. Prefer one owner per piece of state, one way to perform each operation, and the smallest interface that keeps policy and representation private. Derive duplicate state instead of syncing it. Delete pass-through layers without a responsibility.

## Return the requested design

Keep the sketch as small as the change allows. Show caller usage, the chosen types and boundaries, behavior contracts, and a short rationale for what won and what was rejected. Use a module map for a design that crosses modules. Use an existing design artifact if one is already authorized.

When delegating, use native `task` policy. Give each candidate the accepted brief, valid grounding, and its own artifact destination when files are requested. A candidate stops at its assigned artifact. An explanation-only assignment returns the explanation without creating a design file. Do not start another architect workflow, arena, or todo list inside an assigned slice.

## Follow the stopping boundary

Design-only and planning-only requests stop at the requested artifact or plan, without implementing or opening a PR. When implementation is authorized, proceed without an extra approval gate unless the caller explicitly asks for a checkpoint. At that checkpoint present the synthesized sketch and wait for sign-off. A design comparison does not replace an independent correctness review required by the enclosing workflow.

Implement against the chosen sketch. Before handing off or closing a unit, reconcile accepted deviations in the existing sketch and rationale. Update the affected caller usage, outcome, or ownership and cite who or what accepted the change. Keep unresolved disagreements visible. If workarounds recur or callers must repeatedly reach around the interface, refresh the affected grounding and redesign rather than patching the same flaw again.
