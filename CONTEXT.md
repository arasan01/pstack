# CONTEXT — domain glossary

Domain glossary for pstack as an Oh My Pi (OMP) native package.

- **Agent Skill** — A directory under `skills/` containing a `SKILL.md` with YAML frontmatter specifying `name` and `description`. OMP discovers skills natively from the root package.
- **Principle** — A reference skill in `skills/principle-*/` embodying a single engineering rule. Native `hide: true` omits it from the model's skill listing without preventing direct skill reads.
- **Semantic Specialist Agent** — A markdown definition under `agents/` providing a targeted prompt for a sub-task. `architect.md` reads the architecture skill and follows the caller's scope; `comment-sicko.md` audits comments. Native model roles and agent overrides control execution, not per-model wrappers.
- **Native Extension** — The TypeScript module entry point at `omp/index.ts` declared in `package.json#omp.extensions`. It integrates with OMP's extension loader to surface readiness and context assistance.
- **Model Roles** — OMP's native model selections through `modelRoles` and `task.agentModelOverrides`. pstack uses them instead of maintaining a parallel model sheet.
- **Readonly Root Setup** — The principle that installation and setup guidance (`skills/setup-pstack`) must inspect and report model readiness without automatically modifying global or project configuration files unless explicitly instructed by the user.
- **Advisor Roster Example** — `advisors/scope-completion/WATCHDOG.yml`, an opt-in native configuration derived from `meta-soenan-apps`. It watches main-session scope and completion. Installing the package does not add it to OMP's user or project roster discovery.
- **Package Validator** — `tools/validate-package.mjs`, a lightweight script validating root manifest declarations, skill frontmatter, link integrity, and absence of deprecated foreign runtime constructs.
- **VERSION** — The root file recording the canonical package release version (e.g., `0.10.0`).

## Native boundaries and verification

OMP capabilities come from the current native tool schema, `omp://` documentation and effective settings, not from pstack's terminology. `skill:poteto-mode` owns shared workflow instructions; there is no additional contract skill or OMP contract engine.

| Boundary | Verification |
| --- | --- |
| Native skill identity and discovery remain authoritative. | Real OMP skill reads and a same-name project override, following `omp://skills.md`. |
| Model and agent selection remain native. | `ctx.models.resolve`, native effective settings, and task result model metadata, following `omp://tools/task.md` and `omp://task-agent-discovery.md`. |
| Legacy workflow binding metadata cannot return. | `agentSkills` rejects `workflow-contract:` with the native replacement; package-validation regression covers the rejected input. |
| Scope/evidence checking does not become runtime enforcement. | The optional checker only reads supplied plans and artifacts; its limits are documented in `docs/verification.md`. |
