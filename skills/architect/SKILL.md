---
name: architect
description: "Sketch types, signatures, and module structure before code, then stay in the loop while implementation fills in. Use for /architect, 'architect this', 'design this', or non-trivial work where jumping to code would lock in the wrong shape."
---

# Architect

Use the shared guidance in `skill:poteto-mode` within the accepted brief. Reading it does not start another workflow or select an agent or model.

Sketch types, function signatures, class shapes, and module boundaries with `not implemented` bodies and pseudocode. Synthesize across multiple design perspectives, then fill in code against the chosen sketch.

Respect the caller's stopping boundary. A design-only or planning-only request returns the synthesized design without starting implementation or opening a PR. When used inside an authorized implementation workflow, continue through its applicable phases rather than treating design judgment as the whole task.

## Start

Apply the phases within the accepted task brief and native policy. Use the existing plan for work you are responsible for coordinating. For an assigned subtask, reuse the parent plan and grounding without duplicating whole-task todos. Invocation type does not change runtime responsibility or permissions.

1. Ground
2. Sketch
3. Agree
4. Implement
5. Scrap

## Phase A: Ground the problem

Ground the assigned design with the current-system sketch and constraints from `skill:how` before proposing types or module structure. Keep that observed view separate from the future design. Reuse the parent's sketch and source-grounded explanation when valid; investigate only missing evidence or relationships invalidated by changed source or constraints. Naming a file isn't grounding.

If the design redefines ownership or layering, reuse the existing `skill:why` rationale or investigate the missing rationale so it becomes a constraint, not a guess. For greenfield work, use `skill:how`'s bounded view of confirmed requirements and external boundaries rather than inventing an existing implementation.

## Phase B: Sketch

Run the **arena** skill with the design-sketch task and the Phase A grounding artifacts. Pass `references/runner-prompt.md` as each runner's prompt.

Run parallel candidate runners using native `task` delegation per the **arena** skill. Preserve independent perspectives across candidates.

Design it twice. Require at least two structurally distinct candidates before synthesis, even when the first looks sufficient. This is the **exhaust-the-design-space** principle skill made concrete. Whole-shape alternatives, not point fixes inside one shape.

Screen every candidate against [`references/design-red-flags.md`](references/design-red-flags.md) before synthesis. Assume the next contributor is an agent that sees only the files it opened, copies the nearest example, and takes the shortest path that compiles. Prefer the design where a change that looks right from one file is right for the whole repo.

Compare viable candidates on interface depth. Prefer the design that hides more complexity behind a smaller, simpler public surface. A rich interface can keep call chains short by concentrating capability instead of scattering it across layers.

Arena returns one synthesized design package. Its synthesis decision fills the rationale's "Synthesis decision" section.

## Phase C: Agree (opt-in)

When the caller authorized implementation, proceed with the synthesized design without an extra human checkpoint. Otherwise return the requested design artifact and stop.

Opt in to a checkpoint when the invoker explicitly asks: "/architect with checkpoint," "stop and show me before implementing," or similar. Then surface the synthesized design and pause for sign-off.

The synthesis can ship as its own commit either way, as the "scaffold first" mode of the **foundational-thinking** principle skill. Planned and scoped breakage during fill-in is fine, per the **outcome-oriented-execution** principle skill. For adversarial pressure on the design before implementing, run the **interrogate** skill on the synthesized sketch.

If the human pushes back on the shape, identify which constraints changed. Refresh only the affected grounding and re-run Phase B for the affected design before writing more code.

## Phase D: Implement against the sketch

Replace `not implemented` bodies with code, pseudocode with logic. The synthesized sketch is the contract. Deviations from it are signal to surface, not friction to absorb silently. If a function needs a parameter the sketch didn't anticipate, ask whether the sketch was wrong, the requirement was missed, or the implementation is overreaching.

Before closing each implementation unit or handing its contract to the next worker, compare accepted deviations with the saved behavior contracts, interfaces, and responsibility assignments. Once the appropriate owner or review process accepts a change, update the affected parts of the existing sketch and rationale. Record the acceptance source there. A change from raising an error to returning a refusal must update the outcome contract before the next unit begins.

For a local deviation that leaves the shared contract intact, record the decision and why the design still holds; a local variable rename need not rewrite the architecture. Keep unaccepted changes and unresolved disagreements visible. Do not call the unit reconciled while the next worker would receive contradictory instructions, or edit the specification merely to justify what was implemented. Use the existing design artifact rather than a parallel record per unit. Repeated structural deviations still trigger Phase E.

## Phase E: Scrap when the architecture is wrong

If implementation keeps producing friction the sketch can't absorb, throw the sketch out. Don't bolt fixes onto a wrong design, per the **redesign-from-first-principles** and **fix-root-causes** principle skills.

The signal is a *pattern*, not single instances. Tells:

- The same shape of workaround appearing repeatedly across unrelated code.
- Multiple unrelated edge cases that all need special-case branches.
- Types that need escape hatches (`any`, casts, optional fields always set in practice) to compile.
- The "we need a lock" reflex when the sketch said the state wasn't shared.
- Callers having to know the abstraction's internal rules to use it.
- Two or more independent Phase D deviations of the same shape across the implementation.

Use judgment. A few edge cases don't condemn an architecture. Some problems are legitimately complex. Complexity in the data is not complexity in the design.

When you scrap:

1. Reuse valid grounding and run **how** only over missing or invalidated parts of what's been built.
2. Redesign as if the new constraints had been day-one assumptions, per redesign-from-first-principles.
3. Subtract before adding, per the **subtract-before-you-add** principle skill. The new sketch should be smaller than the old one before it grows.
4. Return to Phase B and re-run arena.

## Outputs

The caller's usage is written first and the type sketch derived from it. One file with new types and signatures for small changes. Module map plus type definitions for larger work. The rationale ships alongside, shaped per `references/rationale-template.md`, including the usage sketch and the synthesis decision.
