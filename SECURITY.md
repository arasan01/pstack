# Security

Report vulnerabilities to the owner of [arasan01/pstack](https://github.com/arasan01/pstack) through an agreed private channel, not a public issue. Do not include credentials or sensitive data in an issue. Coordinate disclosure with the owner before publishing details.

The skill tree under `skills/`, the extension at `omp/`, the specialist agents under `agents/`, the vendored bun scripts under `skills/poteto-mode/scripts`, the tools under `tools/`, and the CI workflows are all in scope. Anything that causes an agent to run an unintended command, exfiltrate a secret, or reach outside the repository it was pointed at counts, as does a supply-chain weakness in how this repository pins and installs its own dependencies. Findings in Oh My Pi (OMP) itself belong to OMP maintainers, and findings in upstream pstack belong upstream.

Only the latest release receives fixes. Package updates install by version number, so a fix ships as a new release rather than as a patch to an older one.
