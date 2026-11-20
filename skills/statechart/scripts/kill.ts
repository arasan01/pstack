import { spawn } from "node:child_process";
import { once } from "node:events";

export async function killGroup(pid: number) {
  if (!Number.isSafeInteger(pid) || pid <= 0) throw new RangeError(`Invalid worker PID: ${pid}`);
  try {
    if (process.platform === "win32") {
      const killer = spawn("taskkill", ["/pid", String(pid), "/t", "/f"], {
        stdio: "ignore",
        windowsHide: true,
      });
      await once(killer, "exit");
    } else {
      process.kill(-pid, "SIGKILL");
    }
  } catch {
    // The worker may already have exited.
  }
}
