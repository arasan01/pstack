### Trace forensics

**You own the diagnosis from the artifact. Load it, shape it, narrow to the cause, attribute to source.**

Distinct from **Runtime forensics**, which instruments the live process. Here the capture already exists. The artifact is a fixed dataset, read it, don't re-run it. Choose a parser or profiler for its format and runtime: DevTools for browser profiles, platform tooling for native captures, runtime heap tooling for managed heaps, or the service's trace viewer for request spans. Do not assume a Chromium JSON format or a garbage-collected runtime.

1. Identify the format and load it with the right tool. Parse large artifacts in a subagent (the **principle-guard-the-context-window** skill) and keep the reduced finding in the main thread.
2. Transform the raw artifact into a form you can query with its native analysis tool or an exported dataset. Use sqlite when a structured export fits; keep timestamps, units, process/thread identifiers, and symbol mappings. Do not discard format-specific evidence just to force every capture into the same schema.
3. Narrow to the cause. Query the frames or spans that hold the most time and walk the call tree or request path. For a managed-heap leak, follow the retainer chain to a GC root; for native memory, inspect allocation lifetimes and ownership. For a thread capture, find the thread on-CPU or blocked and its wait reason.
4. Attribute to source. Map the hot frame to file, symbol, and line via the artifact's own symbols. A frame with no source mapping is not yet a diagnosis. Resolve the symbols, or say plainly the artifact does not carry them.
5. Confirm against a paired capture when you have one. Diff a before and after artifact. Without one, mark the finding as the strongest hypothesis the artifact supports, not a confirmed cause.
6. Hand back a cited diagnosis, no fix unless asked. Route to Bug fix or Perf issue once the cause is known. Throughput checkpoint stays one line: `throughput checkpoint: n/a, read-only forensics`.

**Reply:** the artifact and format, the reduced finding, the source location, the artifact paths, and whether a paired capture confirmed it.
