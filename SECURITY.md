# Security

Report vulnerabilities to the owner of [arasan01/pstack](https://github.com/arasan01/pstack) through an agreed private channel. This repository is private; do not use the original port's advisory form to report defects in this fork. Do not include credentials or sensitive data in an issue. Coordinate disclosure with the owner before publishing details.

The skill tree, the hooks, the vendored bun scripts under `plugins/pstack/skills/poteto-mode/scripts`, and the CI workflows are all in scope. Anything that makes an agent run a command the user did not intend, exfiltrate a secret, or reach outside the repository it was pointed at counts, as does a supply-chain weakness in how this repository pins and installs its own dependencies. Findings in Claude Code itself belong to Anthropic, and findings in the upstream project this repository syncs from belong upstream.

Only the latest release on `main` receives fixes. Plugin auto-update installs by version number, so a fix ships as a new release rather than as a patch to an older one, and there are no maintained release branches to back-port to.
