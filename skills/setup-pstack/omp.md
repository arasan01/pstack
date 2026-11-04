# Native OMP setup reference

Model selection and provider behavior belong to OMP. Use the [model guide](../../docs/models.md) for role resolution, overlays, effort and fallback boundaries. Use [verification](../../docs/verification.md) for real model qualification and evidence.

Configuration is layered. Environment/runtime overrides, CLI `--config` overlays, project settings and the active profile may differ. Inspect provenance before explaining an assignment. Named profiles and `PI_CODING_AGENT_DIR` mean that `~/.omp/agent/config.yml` is not always the active configuration file.

`--config` の値は永続化されません。ネイティブのプリセット切替は設定を書き込むため、調査やスモーク検証では使用しません。同梱の[arasan01の設定](../../profiles/README.md)は単一のオーバーレイであり、モデルの利用可能性を保証しません。

`omp models find` filters the same available roster that `omp models --json` lists. Qualification requires actual completed model requests and checked artifacts. Preserve the distinction between catalog support, current availability and successful execution.
