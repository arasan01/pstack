# Contributing

Thanks for contributing to pstack for Oh My Pi (OMP). This repository is a canonical OMP package providing agent workflows, skills, and principles.

The old multi-runtime porting rules (generated cross-harness copies, multi-runtime fork registry, parallel model sheets) are superseded by this native OMP package.

[CONTEXT.md](CONTEXT.md) provides definitions of terms used across development and reviews.

## Repository structure

- `skills/` — The canonical Agent Skills tree. Each skill lives in its own directory with a `SKILL.md` containing portable frontmatter (`name`, `description`).
- `omp/` — Native OMP extension module (`omp/index.ts`) providing readiness and contextual guidance.
- `agents/` — Semantic specialist agent definitions (e.g., `comment-sicko.md`).
- `tools/` — Rerunnable tools including package validator (`tools/validate-package.mjs`) and smoke tests (`tools/omp-smoke.mjs`).
- `tests/` — Repository test suite covering package validation, link boundaries, worktree auditing, transcripts, and model smoke.

## Development and checks

### Package and skill validation

Before opening a pull request, run the package and skill validator:

```shell
bun run validate
```

This verifies:
1. Root `package.json`, `VERSION`, and declared `omp.extensions` are aligned and valid.
2. Every skill in `skills/*/SKILL.md` has valid frontmatter (`name` matching its directory, non-empty `description`, and native `hide: true` on principle leaves).
3. Local Markdown links resolve within the installed package boundary, including its bundled model guides and profiles.
4. No obsolete multi-runtime paths or foreign execution instructions (`subagent_type: "pstack:...`, `run_in_background: true`) are present.
5. Specialist agent definitions in `agents/` are valid.

### Running tests

Run the unit and invariant test suite:

```shell
bun test tests/
```

To run smoke verification for OMP:

```shell
bun run test:smoke --discovery-only
```

See [live model qualification](docs/verification.md) for explicit GPT or DeepSeek runs and their required credentials.

### Vendored scripts

If you edit `skills/poteto-mode/scripts/`:

```shell
cd skills/poteto-mode/scripts
bun install --frozen-lockfile
bun run typecheck
bun run test
bunx prettier@3.6.2 --check .
```

### Statechart compiler

If you edit `skills/statechart/scripts/`:

```shell
cd skills/statechart/scripts
bun install --frozen-lockfile
bun run test
```

Set `TLA2TOOLS` to a downloaded `tla2tools.jar` (TLC 1.7.4) and ensure Java is on `PATH` to include live model-checker integration.

### Pre-commit hook

Run `prek install` (or `pre-commit install`) in your clone to run the package validator automatically before each commit.

## Releasing

Releases bump the version number across the package:
1. Update the canonical version in `VERSION`.
2. Update `"version"` in `package.json`.
3. Add a matching `## <version> - <title>` section in `CHANGES.md`.
4. Run `bun run validate` and `bun test tests/`.

## Commit and PR style

- Explain what changed and why.
- One concern per pull request.
- Claim only what you verified, and name the executed checks.

## Reporting bugs

Include the pstack version, the OMP version (`omp --version`), and reproduction steps.
