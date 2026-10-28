# Native OMP overlays

These are editable examples for `omp --config`, not a separate model configuration system. Run them from the checkout root, or pass an absolute path.

| Overlay | Main and default worker | Reviewer |
| --- | --- | --- |
| [gpt.yml](gpt.yml) | GPT | GPT |
| [deepseek.yml](deepseek.yml) | DeepSeek | DeepSeek |
| [mixed.yml](mixed.yml) | GPT | DeepSeek |

Confirm exact selectors with `omp models --json`. The GPT examples use the Codex provider; use your own provider-qualified selectors when appropriate. The DeepSeek examples require authorized DeepSeek access. Listing a selector in a file does not prove it is available or has been exercised.

```sh
omp --config profiles/gpt.yml
```

OMP applies this overlay to the process without persisting it. The profiles explicitly connect agents to native roles and disable retry-model substitution. They do not override permissions or install a task runtime. Unresolved startup selectors still require a readiness check; `retry.modelFallback: false` is an error-recovery policy, not a universal availability guarantee.

Both families can act as primary workers. Change native role assignments to reverse a mixed setup; do not create per-model wrapper agents. Verify actual model identities before claiming cross-family review.

See [model roles](../docs/models.md) and [live qualification](../docs/verification.md). The harness uses temporary overlays and never switches a saved preset or writes your global configuration.
