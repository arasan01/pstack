import { writeFileSync } from "node:fs";
import { join } from "node:path";

export function writeEvidence(directory, report) {
  const summary = { passed: 0, unavailable: 0, failed: 0 };
  for (const result of report.scenarios) {
    if (result.status === "PASSED") summary.passed++;
    else if (result.status === "UNAVAILABLE") summary.unavailable++;
    else if (result.status === "FAILED") summary.failed++;
    else throw new Error(`Unknown evidence status: ${result.status}`);
  }
  const evidence = { ...report, summary };
  writeFileSync(join(directory, "evidence.json"), JSON.stringify(evidence, null, 2) + "\n");
  return evidence;
}
