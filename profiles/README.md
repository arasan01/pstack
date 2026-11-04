# Native OMP overlay

[`arasan01.yml`](arasan01.yml) reflects `~/.omp/agent/config.yml`, excluding saved `modelPresets`. Run it from the checkout root, or pass an absolute path.

```sh
omp --config profiles/arasan01.yml
```

OMP applies this overlay to the process without persisting it. It includes model routing, task settings, fallback, display and feature preferences. It does not install agents or extensions, or copy credentials.

Confirm exact selectors with `omp models --json`. Listing a selector in a file does not prove it is available or has been exercised.

See [live qualification](../docs/verification.md). The harness uses temporary overlays and never switches a saved preset or writes your global configuration.
