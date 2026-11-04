# pstack reference

Start with the [README](../README.md) for installation and your first task.

## Slash commands

The package includes 65 skill directories: 41 public skills and 24 `principle-*` references. Refer to a skill by its native `skill:name` ID. When skill commands are enabled, invoke it with `/skill:name`; native agent and model configuration remains in control.

Find each skill's instructions in the [skills tree](../skills/).

| command | use it when |
| --- | --- |
| `/skill:poteto-mode` | default entry point; map the current system and check the change boundary before choosing an approach |
| `/skill:in-your-own-words` | restate the user's goal and the problem before starting |
| `/skill:sharpen` | rewrite a prompt with deeper source material, methods, and checks without expanding its scope |
| `/skill:ketchup` | catch up on this chat's changes and every decision waiting on the user |
| `/skill:ketchup-video` | explain this chat's changes in a short silent subtitled video with decisions in text |
| `/skill:how` | explain the current system or draw a source-grounded pre-change sketch of the feature, state owners and target region |
| `/skill:why` | investigate why something was built this way (parallel multi-MCP evidence) |
| `/skill:architect` | use the current-system grounding to design proposed types and module structure before implementation |
| `/skill:arena` | run independent candidates, synthesize the best parts, and use a cross-judge only when a different model family is confirmed |
| `/skill:interrogate` | challenge a change with execution-backed findings and report blocked serious risks separately |
| `/skill:automate-me` | draft your own personal -mode skill from recent transcripts |
| `/skill:reflect` | capture a long task's lessons as a skill edit |
| `/skill:correct` | find the mistakes agents keep repeating in a repo and make each one impossible, enforced at the highest level that works |
| `/skill:tdd` | fix a bug by writing the failing test first, then the fix |
| `/skill:benchmark-checklist` | vet a measured speedup or regression (limiter, tuning, errors, repeat runs, end-to-end relevance) before you report or act on it |
| `/skill:typescript-best-practices` | ground type-system discipline in TypeScript syntax |
| `/skill:teach` | explain a subsystem plainly by composing how + why |
| `/skill:swarm` | fan out N parallel workers across slices or races, then return one aggregated report |
| `/skill:technical-writing` | write docs, RFCs, readmes, PR descriptions, and commit messages to one layered standard |
| `/skill:bro` | restate the last message in plain human language, no jargon |
| `/skill:figure-it-out` | design a rigorous, auditable playbook for a task no bundled playbook fits |
| `/skill:show-me-your-work` | log decisions to a reviewable tsv decision trail |
| `/skill:blast-radius` | find what a change could break beyond the diff and prove safety by running code |
| `/skill:recall` | catch up on recent working context from chat history, live state, and the shared record |
| `/skill:setup-pstack` | diagnose and explain native model roles and verification readiness |
| `/skill:poteto-help` | answer a question about pstack with the prompt to send and the file the answer came from |
| `/skill:unslop` | clean up writing by removing AI tells |
| `/skill:no-comments` | strip comments before review, fix the accepted findings, encode claimed constraints |
| `/skill:create-verification-skill` | generate a project-local verification skill and feature map |
| `/skill:maintain-verification-skill` | re-sync a drifted verification skill and its feature map |
| `/skill:create-formal-verification-skill` | generate a project-local check for a high-risk property beyond the cases tests reach |
| `/skill:maintain-formal-verification-skill` | re-sync formal verification with changed code and distinguish drift from bugs |
| `/skill:statechart` | check a TLA+ model and show state transitions and shortest invariant-violation paths |
| `/skill:deslop` | clean a code diff or edit Japanese prose, PR text, and reports without changing facts |
| `/skill:babysit` | monitor an open PR, fix CI/comments, keep it merge-ready |
| `/skill:nuclear-code-quality-review` | extremely strict maintainability audit |
| `/skill:make-pr-easy-to-review` | clean noisy history and improve PR description before review |
| `/skill:fix-ci` | find failing PR checks, inspect logs, apply focused fixes |
| `/skill:fix-merge-conflicts` | non-interactively resolve merge conflicts, validate, finalize |
| `/skill:get-pr-comments` | fetch and summarize review comments from the active PR |
| `/skill:what-did-i-get-done` | summarize authored commits over a user-chosen period |

## Native Oh My Pi (OMP) architecture

pstack installs as a canonical OMP package at the repository root:
- **Skills (`skills/`)**: Discovered natively by OMP. Skills contain procedural guidance and playbooks.
- **Extension (`omp/index.ts`)**: Declared via `package.json#omp.extensions`. Integrates with OMP extension loading to provide context and readiness guidance.
- **Specialist agents (`agents/`)**: `architect.md` delegates source-grounded design through the architecture skill with native `@slow` selection; `comment-sicko.md` supplies the comment-audit specialist. Project and user agent definitions take native precedence.
- **Model roles and execution**: Native `modelRoles`, `task.agentModelOverrides`, permissions, delegation, reasoning, fallback, and session lifecycle remain authoritative. pstack does not maintain a second runtime or parallel model sheet.
- **Readonly root setup**: `setup-pstack` explains and diagnoses native configuration without mutating global or user settings unless explicitly requested.
- **Advisor example (`advisors/scope-completion/WATCHDOG.yml`)**: The opt-in Scope & Completion Guardian roster watches accepted scope and completion evidence. OMP discovers rosters from user and project locations, not installed packages. See [advisor setup](models.md#scope-and-completion-advisor).
- **Shared workflow guidance**: `skill:poteto-mode` owns scope, stopping and evidence instructions. Native settings and the accepted brief determine agents, models and permissions.

## Configuration and dependencies

See [models.md](models.md) for OMP model role configuration and [verification.md](verification.md) for verification procedures.

Install dependencies for the workflows you use:

| Dependency | When you need it |
| --- | --- |
| GitHub CLI, `gh` | PR monitoring and shipping. Authenticate with `gh auth login`. |
| Bun | Bundled `watch-pr` scripts under `skills/poteto-mode/scripts`. |
| TypeScript, Java and TLC | `statechart` model checking. TLC 1.7.4 is required for formal checking. |

## Maintenance

### Repository layout

```text
package.json                 Canonical OMP package manifest
VERSION                      Canonical version file
omp/index.ts                 Native OMP extension entry point
skills/                      Shared skills, principles, playbooks, and scripts
agents/                      Semantic specialist agent definitions
advisors/                    Opt-in native WATCHDOG roster examples
tools/                       Package validator and verification smoke runners
tests/                       Unit, invariant, and validation test suites
docs/                        Documentation and model guidance
assets/                      Diagrams and package icons
```

### Checks and verification

Run the package validator and unit tests:

```shell
bun run validate
bun test tests/
```

To run the OMP smoke suite in an isolated environment:

```shell
bun run test:smoke --discovery-only
```

See [CONTRIBUTING.md](../CONTRIBUTING.md) for detailed guidelines.
