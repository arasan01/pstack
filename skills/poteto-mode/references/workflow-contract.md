---
version: 1
roles:
  owner: Own the accepted scope, native todo list and integration.
  contributor: Return the assigned output within the parent's scope.
  candidate: Submit one independent candidate and stop.
  reviewer: Return a verdict without implementing changes.
bindings:
  poteto-mode:
    file: skills/poteto-mode/SKILL.md
    modes: { direct: owner }
  architect:
    file: skills/architect/SKILL.md
    modes: { direct: owner, delegated: contributor }
  arena:
    file: skills/arena/SKILL.md
    modes: { direct: owner, delegated: contributor }
  how:
    file: skills/how/SKILL.md
    modes: { direct: owner, delegated: contributor }
  why:
    file: skills/why/SKILL.md
    modes: { direct: owner, delegated: contributor }
  swarm:
    file: skills/swarm/SKILL.md
    modes: { direct: owner, delegated: contributor }
  interrogate:
    file: skills/interrogate/SKILL.md
    modes: { direct: owner, delegated: reviewer }
  figure-it-out:
    file: skills/figure-it-out/SKILL.md
    modes: { direct: owner, delegated: contributor }
  architect-candidate:
    file: skills/architect/references/runner-prompt.md
    modes: { delegated: candidate }
---

# Workflow invocation contract

This document owns shared workflow responsibilities. Its frontmatter is package validation data, not an OMP setting, agent selector or execution engine. Each registered document's `workflow-contract` frontmatter points back to its binding here. Package validation checks both directions and the declared roles. It cannot determine whether prose or a model's actions obey those roles.

## Choose the invocation's role

A direct request uses the binding's `direct` role. Work assigned by another session uses its `delegated` role. Reading a skill applies its method; it does not start another whole workflow. An assignment's narrower scope and stopping condition take precedence over a skill's default phase sequence. The parent includes the role, assigned output, relevant acceptance criteria, allowed writes and stopping condition in native `task` briefs. These are brief contents, not additional tool parameters.

The owner keeps the only whole-task native todo list and integrates results. A contributor uses the method inside the existing parent plan, not a second copy of all its phases. A candidate submits its assigned candidate without restarting architect, arena or spawning more candidates. A reviewer reports findings and unverified risks without applying fixes. A larger delegated workstream may arrange its own scoped work when its brief explicitly permits it, but does not acquire the parent's whole-task scope or completion authority.

Reuse source-grounded explanations and decisions already supplied by the parent. Repeat only the part invalidated by changed source, missing evidence or an explicit request. Do not restart Ground because another skill was opened. A request to stop investigating or to deliver only a plan overrides a method's default next phase.

## Preserve the accepted request

The owner's accepted scope is the reference for every assignment and completion claim. Keep the original request and subsequent human decisions attributable. An agent's paraphrase, a reviewer's unexamined path, or an unrelated discovery does not add a requirement. A child cannot remove a required journey, relax a limit, or turn a partial result into whole-task completion.

New work is mandatory only when it follows from an accepted requirement, a demonstrated in-scope defect, or evidence invalidated by the change. Report other discoveries separately. When the user changes scope, update the existing scope and its original-source reference before delegating against it. Do not create competing copies of the acceptance list.

Planning ends at the plan, investigation at the answer, candidates at their assigned artifact, and review at its verdict. Implementation and PR operations require the applicable authorization. Optional cross-family judging and required independent correctness review remain distinct. OMP owns execution, permissions, models, fallback, task lifecycle and scheduling.

## Check an existing plan and its evidence

Use the checker for a durable plan with acceptance evidence. Do not create a plan or log just to answer a small question. Keep reusable instructions in skills, product requirements in the existing specification, remaining work in the task, and observations in evidence artifacts. Do not turn this contract into a second todo store.

The `workflow.scope` mapping in an existing plan's YAML frontmatter is the single checked acceptance list. Other frontmatter and the Markdown body remain available for the plan. Write actual request text and source references, not the illustrative request below. Result rows are the owner's integration of observations, not new requirements.

```yaml
workflow:
  version: 1
  scope:
    contract: pstack-workflow/v1
    owner: Main
    stop: implementation-without-pr
    source:
      uri: conversation:request-17
      speaker: user
      quote: "Run all journeys together within 180 seconds, including re-login."
    criteria:
      journeys:
        text: "All journeys, including re-login, finish within the combined limit."
        proof:
          executed: /run/executed
          outcome: /checks/all-journeys-with-relogin
          equals: true
  results: {}
```

Resolve the installed package from `skill://poteto-mode`. `<pstack-root>` below is that package's root, not the target project's root. The checker needs Node and the package dependency `yaml`; install the checkout's dependencies before using it.

```sh
node <pstack-root>/tools/check-contract.mjs fingerprint PLAN.md
node <pstack-root>/tools/check-contract.mjs check PLAN.md --expected-scope <fingerprint> --evidence-root <evidence-directory>
```

The owner retains the returned `sha256:` fingerprint outside the editable plan, for example in its native task brief. Supply that retained value to `check`; recomputing it from a changed scope defeats the comparison. Fingerprinting is not approval. Change the retained fingerprint only after an accepted scope change. The fingerprint includes the scope and this contract's bytes, but excludes results, other frontmatter and the plan body. Changes to this shared contract require a fresh scope review too.

Each result key must name an original criterion. A result has `state` equal to `pass`, `fail`, `unknown`, `not-run` or `blocked`, and `against` equal to the retained fingerprint. Non-pass rows give a `reason`. A pass row supplies `evidence.file`, relative to the evidence directory, and `evidence.sha256`, the lowercase SHA-256 of that file's bytes. Use hashes computed from the actual retained artifacts. The checker never writes a success artifact or runs its producing command.

A proof uses RFC 6901 JSON Pointers. `executed` must select boolean `true`; `outcome` must select the exact scalar value declared by `equals`, including its type. For the illustrative criterion above, an actual consumer would need to produce both `/run/executed: true` and `/checks/all-journeys-with-relogin: true`. A planned run, a false outcome, a missing pointer or the wrong scalar type cannot satisfy it. Use existing consumer JSON artifacts where possible. A screenshot or free-form log alone is not a structured result; the owner must still inspect it and use an actual consumer observation rather than fabricating a JSON wrapper that claims success.

The CLI returns JSON with `status: consistent`, `incomplete` or `invalid`. Exit 0 means the fixed declarations and supplied evidence agree. Exit 1 means a scope, reference or evidence violation, or an incomplete result. Exit 2 means invalid CLI arguments or an input/output failure. Missing result rows, extra result IDs, changed criteria, mismatched fingerprints, missing evidence and evidence outside the supplied directory are not success. Unknown or blocked results remain incomplete even when every other criterion passes.

The checker validates declarations and artifact bytes, not the truth of the original scope translation, human authorization, execution provenance, consumer assertions or product correctness. A matching file hash does not prove the artifact came from the current build. The owner reviews native execution records and the actual consumer inputs before accepting or reusing evidence. Never present `consistent` as a product-verification verdict.
