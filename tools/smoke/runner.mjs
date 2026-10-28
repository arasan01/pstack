import { spawn } from "node:child_process";
import { createHash } from "node:crypto";
import { mkdirSync, mkdtempSync, readFileSync, readdirSync, readlinkSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, isAbsolute, join, relative, resolve } from "node:path";
import { Process } from "@oh-my-pi/pi-natives";

export class InterruptedError extends Error {
  constructor(signal) {
    super(`Interrupted by ${signal}`);
    this.name = "InterruptedError";
    this.signal = signal;
  }
}

export function run(command, args, { cwd, env = process.env, timeoutMs = 180000, gracefulMs = 15000, input, waitForOutput } = {}) {
  return new Promise((resolveRun, reject) => {
    const child = spawn(command, args, { cwd, env, detached: process.platform !== "win32", stdio: ["pipe", "pipe", "pipe"] });
    const processRef = child.pid ? Process.fromPid(child.pid) : null;
    let stdout = "";
    let stderr = "";
    let failure;
    let inputClosed = !waitForOutput;
    let termination;
    const terminate = () => {
      if (termination || !processRef) return;
      const owned = [];
      const remember = process => {
        for (const child of process.children()) remember(child);
        owned.push(process);
      };
      remember(processRef);
      termination = processRef.terminate({ gracefulMs, timeoutMs: 1000, group: process.platform !== "win32" })
        .then(stopped => {
          if (!stopped) throw new Error("Native termination did not confirm process exit");
        })
        .finally(() => { for (const process of owned) process.killTree(9); })
        .catch(error => {
          failure ??= error;
          failure.cleanupFailed = true;
          failure.message += `; native process-tree cleanup: ${error.message}`;
        });
    };
    const interrupted = signal => { clearTimeout(timer); failure = new InterruptedError(signal); terminate(); };
    const onInterrupt = () => interrupted("SIGINT");
    const onTerminate = () => interrupted("SIGTERM");
    process.once("SIGINT", onInterrupt);
    process.once("SIGTERM", onTerminate);
    const timer = setTimeout(() => { failure ??= new Error(`${command} exceeded ${timeoutMs}ms`); terminate(); }, timeoutMs);
    const receive = (which, chunk) => {
      if (stdout.length + stderr.length > 32 * 1024 * 1024) return;
      if (which === "stdout") stdout += chunk.toString(); else stderr += chunk.toString();
      if (stdout.length + stderr.length > 32 * 1024 * 1024 && !failure) {
        failure = new Error("Process output exceeded 32 MiB");
        terminate();
      }
      if (!inputClosed) {
        try {
          if (waitForOutput(stdout)) {
            inputClosed = true;
            child.stdin.end();
          }
        } catch (error) {
          failure ??= error;
          terminate();
        }
      }
    };
    child.stdout.on("data", chunk => receive("stdout", chunk));
    child.stderr.on("data", chunk => receive("stderr", chunk));
    child.on("error", error => { failure ??= error; });
    child.on("close", async (code, signal) => {
      clearTimeout(timer);
      process.off("SIGINT", onInterrupt);
      process.off("SIGTERM", onTerminate);
      await termination;
      if (failure) reject(Object.assign(failure, { stdout, stderr }));
      else resolveRun({ code, signal, stdout, stderr });
    });
    child.stdin.on("error", error => { if (error.code !== "EPIPE") failure ??= error; });
    if (waitForOutput) child.stdin.write(input ?? "");
    else child.stdin.end(input);
  });
}

export function requireSuccess(result, label) {
  if (result.code !== 0) throw new Error(`${label} exited ${result.code ?? result.signal}: ${result.stderr.slice(-3000)}`);
  return result.stdout;
}

export function parseModelCatalog(text) {
  const value = JSON.parse(text);
  if (!value || !Array.isArray(value.models) || !value.models.every(model => typeof model.provider === "string" && typeof model.id === "string")) {
    throw new Error("OMP model catalog must contain models with provider and id");
  }
  return value.models;
}

export async function availableModels(ompBin, options = {}) {
  return parseModelCatalog(requireSuccess(await run(ompBin, ["models", "--json"], options), "OMP model catalog"));
}

export function parseEvents(text) {
  return text.split(/\r?\n/).filter(line => line.trim()).map((line, index) => {
    try { return JSON.parse(line); }
    catch { throw new Error(`Invalid OMP JSON event at line ${index + 1}`); }
  });
}

export function inspectTrace(events, expectedModel) {
  const messages = events.filter(event => event.type === "message_end" && event.message?.role === "assistant").map(event => event.message);
  if (!messages.length) throw new Error("OMP produced no completed assistant message");
  const models = [...new Set(messages.map(message => {
    if (typeof message.provider !== "string" || typeof message.model !== "string") throw new Error("Assistant message is missing actual model identity");
    if (["error", "aborted", "length"].includes(message.stopReason)) throw new Error(`Assistant stopped with ${message.stopReason}${message.errorMessage ? `: ${message.errorMessage}` : ""}`);
    return `${message.provider}/${message.model}`;
  }))];
  if (models.some(model => model !== expectedModel)) throw new Error(`Model mismatch: requested ${expectedModel}, observed ${models.join(", ")}`);
  if (events.some(event => /^retry_fallback_/.test(event.type))) throw new Error("OMP applied a fallback during model qualification");
  const calls = messages.flatMap(message => message.content ?? []).filter(block => block.type === "toolCall");
  const taskResults = events.filter(event => event.type === "tool_execution_end" && event.toolName === "task")
    .flatMap(event => event.result?.details?.results ?? []);
  const finalText = [...messages].reverse().find(message => message.stopReason !== "toolUse")?.content
    ?.filter(block => block.type === "text").map(block => block.text).join("\n") ?? "";
  return { models, calls, taskResults, finalText };
}

export function snapshot(root) {
  const files = {};
  const visit = dir => {
    for (const entry of readdirSync(dir, { withFileTypes: true }).sort((a, b) => a.name.localeCompare(b.name))) {
      const path = join(dir, entry.name);
      if (entry.isDirectory()) visit(path);
      else files[relative(root, path)] = entry.isSymbolicLink() ? `symlink:${readlinkSync(path)}` : createHash("sha256").update(readFileSync(path)).digest("hex");
    }
  };
  visit(root);
  return files;
}

export function makeWorkspace(files = {}) {
  const root = mkdtempSync(join(tmpdir(), "pstack-workspace-"));
  const workspace = join(root, "project");
  try {
    mkdirSync(workspace);
    for (const [name, content] of Object.entries(files)) {
      const path = resolve(workspace, name);
      const local = relative(workspace, path);
      if (!local || isAbsolute(local) || local.split(/[\\/]/).includes("..")) throw new Error(`Fixture path escapes workspace: ${name}`);
      mkdirSync(dirname(path), { recursive: true });
      writeFileSync(path, content);
    }
    return { root, workspace, dispose: () => rmSync(root, { recursive: true, force: true }) };
  } catch (error) {
    rmSync(root, { recursive: true, force: true });
    throw error;
  }
}

export function smokeConfig(model, repoRoot) {
  return {
    extensions: [],
    skills: {
      customDirectories: [join(repoRoot, "skills")],
      includeSkills: readdirSync(join(repoRoot, "skills"), { withFileTypes: true }).filter(entry => entry.isDirectory()).map(entry => entry.name),
    },
    modelRoles: Object.fromEntries(["default", "smol", "slow", "plan", "task", "review", "advisor"].map(role => [role, model])),
    defaultThinkingLevel: "high",
    task: { agentModelOverrides: Object.fromEntries(["task", "scout", "sonic", "reviewer", "security-reviewer"].map(agent => [agent, model])), maxRecursionDepth: 2, speculativeLaunch: false },
    retry: { modelFallback: false, maxRetries: 1 },
    async: { enabled: false },
    advisor: { enabled: false },
    memory: { backend: "off" },
    autolearn: { enabled: false },
    startup: { checkUpdate: false, quiet: true },
    git: { enabled: false },
    dev: { autoqa: false },
  };
}

export function isolatedEnvironment(root) {
  return { ...process.env, HOME: join(root, "home"), USERPROFILE: join(root, "home"), PI_CONFIG_DIR: ".omp", PI_CONFIG_FILES: "", PI_PROFILE: "default", PI_CODING_AGENT_DIR: join(root, "agent"), PI_CODING_AGENT_SESSION_DIR: join(root, "sessions"), OMP_PROFILE: "default", XDG_CONFIG_HOME: join(root, "config"), XDG_DATA_HOME: join(root, "data"), XDG_STATE_HOME: join(root, "state"), XDG_CACHE_HOME: join(root, "cache") };
}
