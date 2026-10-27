### Trace forensics

**You own the diagnosis from the artifact.**

Distinct from **Runtime forensics**, which instruments a live process. Here the capture is a fixed dataset. Read it; do not rerun it. Choose tooling for its format and runtime: DevTools for browser profiles, platform tools for native captures, managed-heap tooling, or a service trace viewer. Do not assume Chromium JSON or garbage collection.

1. Identify the format and load it with the matching tool. Delegate bulk parsing when native policy permits, resolving model, effort, and supported speed through the runtime mapping and Subagents section. Keep the reduced finding in the main thread.
2. Query the artifact with its native analysis tool or an exported dataset. Use sqlite when a structured export fits. Preserve timestamps, units, process and thread identifiers, and symbols rather than forcing every capture into one schema.
3. Narrow to the cause. Follow hot frames or request spans. For a managed leak, follow retainers to a GC root; for native memory, inspect allocation lifetimes and ownership. For a thread capture, find the on-CPU or blocked thread and its wait reason.
4. Attribute to source. Map the hot frame to file, symbol, and line via the artifact's own symbols. A frame with no source mapping is not yet a diagnosis. Resolve the symbols, or say plainly the artifact does not carry them.
5. If you have a paired capture, diff the before and after artifacts to confirm. Otherwise, mark the finding as the strongest hypothesis the artifact supports, not a confirmed cause.
6. Hand back a cited diagnosis, no fix unless asked. Route to Bug fix or Perf issue once the cause is known. Throughput checkpoint stays one line: `throughput checkpoint: n/a, read-only forensics`.

**Reply:** the artifact and format, the reduced finding, the source location, the artifact paths, and whether a paired capture confirmed it.
