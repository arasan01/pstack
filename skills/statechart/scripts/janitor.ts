import fs from "node:fs";
import { finished } from "node:stream/promises";
import { killGroup } from "./kill.ts";

const [worker, stage, tmp] = process.argv.slice(2);
const pid = Number(worker);
if (!Number.isSafeInteger(pid) || pid <= 0 || !stage || !tmp)
  throw new Error("The janitor needs the worker PID and both temporary directories.");

let input = "";
process.stdin.setEncoding("utf8").on("data", (chunk: string) => (input += chunk));
await finished(process.stdin).catch(() => {});
const running = !input.includes("exited");
const groupOutlivesWorker = process.platform !== "win32";
if (running || groupOutlivesWorker) await killGroup(pid);
for (const dir of [stage, tmp])
  fs.rmSync(dir, { recursive: true, force: true, maxRetries: 5 });
