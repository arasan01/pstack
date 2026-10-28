# CONTEXT — domain glossary

Domain glossary for pstack as an Oh My Pi (OMP) native package.

- **Agent Skill** — A directory under `skills/` containing a `SKILL.md` with YAML frontmatter specifying `name` and `description`. OMP discovers skills natively from the root package.
- **Principle** — A reference skill in `skills/principle-*/` embodying a single engineering rule. Native `hide: true` omits it from the model's skill listing without preventing direct skill reads.
- **Semantic Specialist Agent** — A markdown definition under `agents/` providing targeted prompts for specific sub-tasks (e.g. `comment-sicko.md` for comment auditing). Specialist agents do not introduce wrapper indirection or synthetic effort layers.
- **Native Extension** — The TypeScript module entry point at `omp/index.ts` declared in `package.json#omp.extensions`. It integrates with OMP's extension loader to surface readiness and context assistance.
- **Model Roles** — OMP's native model selections through `modelRoles` and `task.agentModelOverrides`. pstack uses them instead of maintaining a parallel model sheet.
- **Readonly Root Setup** — The principle that installation and setup guidance (`skills/setup-pstack`) must inspect and report model readiness without automatically modifying global or project configuration files unless explicitly instructed by the user.
- **Package Validator** — `tools/validate-package.mjs`, a lightweight script validating root manifest declarations, skill frontmatter, link integrity, and absence of deprecated foreign runtime constructs.
- **VERSION** — The root file recording the canonical package release version (e.g., `0.10.0`).
