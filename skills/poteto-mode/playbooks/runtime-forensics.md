### Runtime forensics

**You own the diagnosis. Instrument the live process, don't theorize from source.** The deliverable is a cited diagnosis, not a fix.

1. Capture the live signal with the target platform's tools through the matching project driver: a CPU profile, a heap or allocation capture, a native trace, or request spans. Use CDP only for compatible browser or Electron processes. Record the process, build, workload, and capture tool.
2. Reduce it to a cause candidate: a hot function, a managed-heap retainer chain, an unreleased native allocation, or a loop firing without input. Delegate bulk parsing when native policy permits and keep the reduced finding in the main thread.
3. Prove the mechanism with a supported profiler, debugger, instrumentation, or controlled reproduction on an isolated instance. Live replacement or CDP evaluation is optional and needs a safe, supported target. Never modify a production or shared process without authorization. If instrumentation is unavailable, name the gap and retain the diagnosis as a hypothesis.
4. Map the finding back to source: file, symbol, the line that allocates or schedules.
5. Throughput checkpoint stays one line: `throughput checkpoint: n/a, read-only forensics`.

**Reply:** the signal captured, the reduced finding, how you proved the mechanism, the source location, artifact paths. No fix unless asked. Hand back to Bug fix or Perf once the cause is known.
