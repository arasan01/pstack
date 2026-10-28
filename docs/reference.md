# pstack reference

Start with the [README](../README.md) for installation and your first task.

## Slash commands

The package includes 65 skill directories: 41 public skills and 24 `principle-*` references. In Oh My Pi (OMP), request the skill you need by name; native agent and model configuration remains in control.

Find each skill's instructions in the [skills tree](../skills/).

| command | use it when |
| --- | --- |
| `/poteto-mode` | default entry point for any non-trivial task |
| `/in-your-own-words` | restate the user's goal and the problem before starting |
| `/sharpen` | rewrite a prompt with deeper source material, methods, and checks without expanding its scope |
| `/ketchup` | catch up on this chat's changes and every decision waiting on the user |
| `/ketchup-video` | explain this chat's changes in a short silent video with decisions in text |
| `/how` | walk through how a subsystem works |
| `/why` | investigate why something was built this way (parallel multi-MCP evidence) |
| `/architect` | settle types and module shape before writing code that crosses a function boundary |
| `/arena` | run N parallel attempts at the same task and pick the best parts |
| `/interrogate` | have three different models try to break a diff |
| `/automate-me` | draft your own personal -mode skill from recent transcripts |
| `/reflect` | capture a long task's lessons as a skill edit |
| `/correct` | find the mistakes agents keep repeating in a repo and make each one impossible, enforced at the highest level that works |
| `/tdd` | fix a bug by writing the failing test first, then the fix |
| `/benchmark-checklist` | vet a measured speedup or regression (limiter, tuning, errors, repeat runs, end-to-end relevance) before you report or act on it |
| `/typescript-best-practices` | ground type-system discipline in TypeScript syntax |
| `/teach` | explain a subsystem plainly by composing how + why |
| `/swarm` | fan out N parallel workers across slices or races, then return one aggregated report |
| `/technical-writing` | write docs, RFCs, readmes, PR descriptions, and commit messages to one layered standard |
| `/bro` | restate the last message in plain human language, no jargon |
| `/figure-it-out` | design a rigorous, auditable playbook for a task no bundled playbook fits |
| `/show-me-your-work` | log decisions to a reviewable tsv decision trail |
| `/blast-radius` | find what a change could break beyond the diff and prove safety by running code |
| `/recall` | catch up on recent working context from chat history, live state, and the shared record |
| `/setup-pstack` | diagnose and explain native model roles and verification readiness |
| `/poteto-help` | answer a question about pstack with the prompt to send and the file the answer came from |
| `/unslop` | clean up writing by removing AI tells |
| `/no-comments` | strip comments before review, fix the accepted findings, encode claimed constraints |
| `/create-verification-skill` | generate a project-local verification skill and feature map |
| `/maintain-verification-skill` | re-sync a drifted verification skill and its feature map |
| `/create-formal-verification-skill` | generate a project-local check for a high-risk property beyond the cases tests reach |
| `/maintain-formal-verification-skill` | re-sync formal verification with changed code and distinguish drift from bugs |
| `/statechart` | check a TLA+ model and show state transitions and shortest invariant-violation paths |
| `/deslop` | clean a code diff or edit Japanese prose, PR text, and reports without changing facts |
| `/babysit` | monitor an open PR, fix CI/comments, keep it merge-ready |
| `/nuclear-code-quality-review` | extremely strict maintainability audit |
| `/make-pr-easy-to-review` | clean noisy history and improve PR description before review |
| `/fix-ci` | find failing PR checks, inspect logs, apply focused fixes |
| `/fix-merge-conflicts` | non-interactively resolve merge conflicts, validate, finalize |
| `/get-pr-comments` | fetch and summarize review comments from the active PR |
| `/what-did-i-get-done` | summarize authored commits over a user-chosen period |

## Native Oh My Pi (OMP) architecture

pstack installs as a canonical OMP package at the repository root:
- **Skills (`skills/`)**: Discovered natively by OMP. Skills contain procedural guidance and playbooks.
- **Extension (`omp/index.ts`)**: Declared via `package.json#omp.extensions`. Integrates with OMP extension loading to provide context and readiness guidance.
- **Specialist agents (`agents/`)**: Provides targeted specialist prompts, such as `agents/comment-sicko.md` for comment elimination in `/no-comments`.
- **Model roles and execution**: Native `modelRoles`, `agentModelOverrides`, permissions, delegation, reasoning, fallback, and session lifecycle remain authoritative. pstack does not maintain a second runtime or parallel model sheet.
- **Readonly root setup**: `setup-pstack` explains and diagnoses native configuration without mutating global or user settings unless explicitly requested.

## Configuration and dependencies

See [models.md](models.md) for OMP model role configuration and [verification.md](verification.md) for verification procedures.

Install dependencies for the workflows you use:

| Dependency | When you need it |
| --- | --- |
| GitHub CLI, `gh` | PR monitoring and shipping. Authenticate with `gh auth login`. |
| Bun | Bundled `watch-pr` and `orch` scripts under `skills/poteto-mode/scripts`. |
| TypeScript, Java and TLC | `statechart` model checking. TLC 1.7.4 is required for formal checking. |

## Maintenance

### Repository layout

```text
package.json                 Canonical OMP package manifest
VERSION                      Canonical version file
omp/index.ts                 Native OMP extension entry point
skills/                      Shared skills, principles, playbooks, and scripts
agents/                      Semantic specialist agent definitions
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
