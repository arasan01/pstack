### Runtime forensics

**You own the diagnosis. Instrument the live process, don't theorize from source.** The deliverable is a cited diagnosis, not a fix.

1. Capture the live signal with tools for the target runtime and platform via the matching project driver: a CPU profile for a spinning process, a heap or allocation capture for a leak, or a platform trace for a visual glitch. Use CDP only for browser or compatible Electron processes; use native profilers, runtime diagnostics, or request traces for other targets. Record the process, build, workload, and capture tool. A real artifact, not a guess.
2. Reduce the artifact to the cause candidate: the function on the hot path, a GC retainer chain or unreleased native allocation, the loop firing without input. Parse large artifacts in a subagent (the **guard-the-context-window** principle skill), keep the reduced finding in the main thread.
3. Prove the mechanism before believing it. Use the runtime's supported profiler, debugger, instrumentation, or a controlled reproduction on an isolated instance. CDP eval or live code replacement is an option only when supported and safe, never a requirement. Do not modify a production or shared process without authorization. If instrumentation is unavailable, report the evidence gap and keep the diagnosis a hypothesis.
4. Map the finding back to source: file, symbol, the line that allocates or schedules.
5. Throughput checkpoint stays one line: `throughput checkpoint: n/a, read-only forensics`.

**Reply:** the signal captured, the reduced finding, how you proved the mechanism, the source location, artifact paths. No fix unless asked. Hand back to Bug fix or Perf once the cause is known.
