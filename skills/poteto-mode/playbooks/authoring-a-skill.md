### Authoring or modifying a skill

**You own the skill's voice.**

1. Use native skill-authoring discipline and project discovery paths (e.g. skills under `skills/` or project `.omp/skills/`). Never edit an installed plugin or cache; show the intended source-checkout or project-local destination and obtain the approval the request requires before changing a skill's future behavior. User-wide paths and global settings need explicit authority.
2. Validate the skill: frontmatter has `name` and `description`, referenced files exist, cross-skill links resolve.
3. Test cases if structural. Skip if subjective.
4. Run **Opening a PR**.

When in doubt, delete. Keep only prose that changes a decision. Tell it to do the thing and skip the reason. Explain only when the rule is confusing without one. Match tone to scope. Point at structural sources (types, READMEs, config) per the **encode-lessons-in-structure** principle skill. Delegate to other skills by path. Don't restate. A workflow you keep hitting but isn't captured → propose a new skill.

**Reply:** summary of the skill, key design decisions, validation notes.
