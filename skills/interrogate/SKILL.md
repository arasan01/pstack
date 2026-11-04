---
name: interrogate
description: "Use for \"interrogate\", \"adversarial review\", \"multi-model review\", \"challenge this\", \"stress test this code\", \"find blind spots\", or \"tear this apart\". Multiple LLM reviewers challenge changes from independent angles."
---

# Interrogate

Use the shared guidance in `skill:poteto-mode` within the accepted brief. Reading it does not start another workflow or select an agent or model.

Independent adversaries try to break a change or design. Keep proven findings, report blocked risks separately, and do not apply fixes.

## Frame

Review what the user names. Otherwise, review the branch diff from its merge base with the base branch through the working tree, including relevant untracked files.

State the intent in one paragraph from the user's message, commits, and PR description. Resolve uncertainty from available context before asking the user. Preserve the requested scope and stopping boundary. A review does not authorize fixes or a PR.

The accepted brief and native policy determine responsibility, not invocation type. For an assigned review, reuse the parent's plan and valid grounding, review only the requested scope, and return the verdict without duplicating whole-task todos. A narrower brief does not grant permissions.

## Fan out

Use arena Phase A steps 3 and 4 and Phase B to choose native runners and isolated output locations. Copy the scoped uncommitted changes into each worktree so every adversary reviews the same state. Keep the source tree read-only. If worktrees are unavailable, use isolated temporary outputs without modifying the source tree.

Launch independent adversaries in one `task` call with entries in `tasks[]`, using `agent: "reviewer"` or user-configured review agents. Preserve native `modelRoles`, agent settings, `task.agentModelOverrides`, precedence, permissions, and fallback policy. Default to configured selection. Use a supported model override only for an explicit model comparison or named-model request after resolving available selectors. Disclose when distinct model families cannot be confirmed.

Give every adversary the scope, intent, relevant context paths, its isolated output path, and this brief:

> Break this change. Prove each finding against the real code with a failing test, repro, or command output. For a design or plan, run an isolated prototype or probe the current tree. Keep source files read-only and repros in your assigned worktree or temporary output. Do not apply fixes. Respect execution restrictions and do not touch unsafe or production environments.
>
> Report each finding with a title, code location, exact command and relevant setup, observed output, expected output required by the intent, and why the difference matters. Do not rerun an operator-reported failure just to confirm it. Cite the operator's execution evidence instead. Exclude preferences, speculative future failures, and claims without execution evidence. No findings is valid.
>
> If a concrete, serious risk cannot be tested safely or execution is prohibited, report it separately as Unverified. Include its code path, impact, missing evidence, and blocker. Do not present it as a proven finding.

## Verify

The root reviewer checks every finding's evidence and traces the failure to the intent. Do not accept a subagent's verdict or reviewer agreement as proof.

When safe and permitted, reproduce the failure in isolation with the reported command or an equivalent check that exercises the same behavior. Record the command actually run, observed output, and expected output. Treat operator-reported failures as ground truth. Inspect their evidence and code path without rerunning merely for confirmation.

Keep only findings whose execution evidence proves a failure that breaks the intent. Merge findings with the same root cause, preserving their evidence and adversary attribution. Drop incorrect, irrelevant, or unsupported claims with a reason. Keep concrete serious risks blocked by safety, permissions, or unavailable prerequisites under Unverified, never Findings.

Skip arena Phases C, D, and E. Keep every proven root cause rather than selecting one adversary's list. Stop after the report. Do not apply fixes.

## Output

- **Intent**: the stated goal and review scope.
- **Findings**: each proven root cause, code location, exact command and setup, observed and expected output, impact on the intent, evidence source, and adversaries that found it. Say "no verified findings" when none survive.
- **Dropped**: each adversary's count of dropped claims and the reasons.
- **Unverified**: concrete serious risks without execution proof, their evidence gaps, and why execution was blocked. Say "none" when there are no blocked risks.
