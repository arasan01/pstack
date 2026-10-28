import { randomUUID } from "node:crypto";
import { mkdirSync, readFileSync, realpathSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { pathToFileURL } from "node:url";
import { parse as parseYaml } from "yaml";
import { inspectTrace, isolatedEnvironment, makeWorkspace, parseEvents, requireSuccess, run, smokeConfig, snapshot } from "./runner.mjs";

function requireCondition(condition, message) {
  if (!condition) throw new Error(message);
}

function answerJSON(text) {
  const value = text.match(/```(?:json)?\s*([\s\S]*?)```/)?.[1] ?? text;
  return JSON.parse(value.trim());
}

export async function packageDiscovery({ repoRoot, ompBin, outputDir, timeoutMs }) {
  const fixture = makeWorkspace();
  const env = isolatedEnvironment(fixture.root);
  try {
    const installed = await run(ompBin, ["install", repoRoot, "--json"], { cwd: fixture.workspace, env, timeoutMs });
    requireSuccess(installed, "Isolated OMP package installation");
    const discovered = await run(ompBin, ["read", "skill://poteto-mode"], { cwd: fixture.workspace, env, timeoutMs });
    writeFileSync(join(outputDir, "package-discovery.json"), JSON.stringify({ install: installed, skill: discovered }, null, 2));
    requireSuccess(discovered, "Installed poteto-mode discovery");
    const skillPath = discovered.stdout.match(/^\[Skill file: (.+)\]/)?.[1];
    requireCondition(skillPath && realpathSync(skillPath) === realpathSync(join(repoRoot, "skills/poteto-mode/SKILL.md")), "Native reader did not resolve the installed checkout's skill");
    const profile = parseYaml(readFileSync(join(repoRoot, "profiles/gpt.yml"), "utf8"));
    const bootstrapModel = profile.modelRoles.default;
    const commands = await run(ompBin, ["--model", bootstrapModel, "--no-session", "--no-title", "--no-ui", "--mode", "rpc"], {
      cwd: fixture.workspace, env, timeoutMs,
      input: [
        { type: "get_available_commands", id: "pstack-discovery" },
        { type: "prompt", id: "pstack-readiness", message: "/pstack" },
      ].map(command => JSON.stringify(command)).join("\n") + "\n",
      waitForOutput: text => parseEvents(text.slice(0, text.lastIndexOf("\n") + 1)).some(event => event.type === "prompt_result" && event.id === "pstack-readiness"),
    });
    writeFileSync(join(outputDir, "package-discovery.json"), JSON.stringify({ install: installed, skill: discovered, commands }, null, 2));
    requireSuccess(commands, "Native extension command discovery");
    const events = parseEvents(commands.stdout);
    const response = events.find(event => event.type === "response" && event.id === "pstack-discovery");
    requireCondition(response?.success === true && response.data?.commands?.some(command => command.name === "pstack"), "Native OMP did not register the pstack command");
    requireCondition(events.some(event => event.type === "prompt_result" && event.id === "pstack-readiness" && event.agentInvoked === false && event.status === "completed"), "Native pstack command did not complete without invoking a model");
    return { checks: ["isolated native install", "installed skill read", "native extension command registration", "read-only readiness command without inference"] };
  } finally { fixture.dispose(); }
}

const definitions = {
  investigation: {
    files: {
      "src/region.mjs": "export function regionFor(account, config) { return account.region ?? config.teams[account.team] ?? config.default; }\n",
      "config.json": JSON.stringify({ default: "eu", teams: { alpha: "us" } }),
      "accounts.json": JSON.stringify([{ id: "a", team: "alpha" }, { id: "b", team: "alpha", region: "ap" }, { id: "c", team: "beta" }]),
    },
    prompt: "Use poteto-mode to investigate region selection in this project. Read the implementation, configuration and account data. Do not modify files or run implementation work. Return only JSON with a regions object mapping each account id to its effective region, and an explanation of the precedence.",
    check: ({ trace, before, after }) => {
      requireCondition(JSON.stringify(before) === JSON.stringify(after), "Investigation changed workspace files");
      const answer = answerJSON(trace.finalText);
      requireCondition(answer.regions && Object.entries({ a: "us", b: "ap", c: "eu" }).every(([id, region]) => answer.regions[id] === region), "Investigation reported incorrect region precedence");
      return ["region precedence from project inputs", "workspace unchanged"];
    },
  },
  planning: {
    files: { "src/service.mjs": "export function handle(request) { return { status: 200, body: request.body }; }\n" },
    prompt: "Use poteto-mode to plan adding request validation to src/service.mjs while preserving valid requests. This request is planning only. Do not implement, create files, execute builds, commit or open a PR. Return only JSON with steps (each containing a goal, files and verification) and risks. Explain missing-input and invalid-input behavior in the plan.",
    check: ({ trace, before, after }) => {
      requireCondition(JSON.stringify(before) === JSON.stringify(after), "Planning started implementation or created artifacts despite the requested boundary");
      const plan = answerJSON(trace.finalText);
      requireCondition(Array.isArray(plan.steps) && plan.steps.some(step => {
        const checks = Array.isArray(step.verification) ? step.verification : [step.verification];
        return Array.isArray(step.files) && step.files.includes("src/service.mjs") && checks.length > 0 && checks.every(check => typeof check === "string" && check.trim());
      }), "Plan omitted the affected public entry point or its verification");
      requireCondition(Array.isArray(plan.risks), "Plan did not report risks");
      return ["plan names affected entry point and verification", "workspace unchanged"];
    },
  },
  implementation: {
    files: { "src/tag.mjs": "export function normalizeTag(value) { return value; }\n" },
    prompt: "Use poteto-mode to fix normalizeTag in src/tag.mjs. String inputs must be trimmed, lowercased, and have each whitespace run replaced with one hyphen. Preserve non-ASCII letters. Whitespace-only input returns an empty string. Keep the scope to this function and verify the actual exported behavior. Do not commit or open a PR.",
    check: async ({ fixture, before, after }) => {
      requireCondition(before["src/tag.mjs"] !== after["src/tag.mjs"], "Implementation did not change the requested behavior");
      const consumer = `import { normalizeTag } from ${JSON.stringify(pathToFileURL(join(fixture.workspace, "src/tag.mjs")).href)}; console.log(JSON.stringify([normalizeTag(" Blue  Sky "), normalizeTag("  Café\\tDéjà "), normalizeTag(" \\t ")]));`;
      const observed = requireSuccess(await run("node", ["--input-type=module", "-e", consumer], { cwd: fixture.workspace }), "Public API consumer").trim();
      requireCondition(observed === JSON.stringify(["blue-sky", "café-déjà", ""]), `Public API returned wrong results: ${observed}`);
      return ["actual exported API: whitespace, Unicode, empty result"];
    },
  },
  delegation: {
    files: {},
    prompt: "Use poteto-mode and the native task tool to run two independent read-only investigations in one batch: inspect west/ for available stock and east/ for pending orders. Keep these as separate assignments and synthesize their evidence. Do not modify files. Return only JSON with stockTotal and pendingOrders.",
    check: ({ trace, before, after, expectedModel }) => {
      requireCondition(JSON.stringify(before) === JSON.stringify(after), "Delegated investigation changed workspace files");
      requireCondition(trace.taskResults.length >= 2, "Native task returned fewer than two completed assignments");
      for (const result of trace.taskResults) {
        const actual = result.resolvedModelIdentity;
        requireCondition(result.exitCode === 0 && !result.resolvedModelIsFallback && actual === expectedModel, `Delegated assignment failed or used an unverified model: ${actual}`);
      }
      const answer = answerJSON(trace.finalText);
      requireCondition(answer.stockTotal === 70 && answer.pendingOrders === 5, "Delegation returned wrong aggregate values");
      return ["two successful native task assignments", "actual child model identities", "correct stock/order aggregation", "workspace unchanged"];
    },
  },
};

export async function modelScenario({ name, repoRoot, ompBin, model, outputDir, timeoutMs }) {
  const definition = definitions[name];
  if (!definition) throw new Error(`Unknown model scenario: ${name}`);
  const files = { ...definition.files };
  if (name === "delegation") {
    files[`west/${randomUUID()}.json`] = JSON.stringify({ stock: [27, 43] });
    files[`east/${randomUUID()}.json`] = JSON.stringify({ pending: [2, 3] });
  }
  const fixture = makeWorkspace(files);
  const tracePath = join(outputDir, `${name}.jsonl`);
  try {
    const overlay = join(fixture.root, "config.yml");
    writeFileSync(overlay, JSON.stringify(smokeConfig(model, repoRoot)));
    const before = snapshot(fixture.workspace);
    const result = await run(ompBin, ["--config", overlay, "--model", model, "--no-extensions", "-e", repoRoot, "--no-context-files", "--no-rules", "--no-session", "--no-title", "--no-prewalk", "--no-lsp", "--no-pty", "--mode", "json", "--print", "--auto-approve", "--max-time", String(Math.max(1, Math.floor(timeoutMs / 1000) - 10)), "--tools", "read,write,edit,bash,grep,glob,task,todo", definition.prompt], { cwd: fixture.workspace, timeoutMs });
    writeFileSync(tracePath, result.stdout);
    writeFileSync(join(outputDir, `${name}.stderr.txt`), result.stderr);
    const trace = inspectTrace(parseEvents(result.stdout), model);
    requireSuccess(result, `OMP ${name}`);
    requireCondition(trace.calls.some(call => call.name === "read" && /^skill:\/\/poteto-mode(?:\/SKILL\.md)?(?::|$)/.test(call.arguments?.path ?? "")), "Scenario did not read this checkout's poteto-mode skill");
    const after = snapshot(fixture.workspace);
    const checks = await definition.check({ trace, before, after, fixture, expectedModel: model });
    checks.unshift("observed poteto-mode skill read");
    mkdirSync(join(outputDir, name), { recursive: true });
    for (const path of Object.keys(after)) {
      if (before[path] !== after[path]) {
        const destination = join(outputDir, name, path);
        mkdirSync(join(destination, ".."), { recursive: true });
        writeFileSync(destination, readFileSync(join(fixture.workspace, path)));
      }
    }
    return { requestedModel: model, observedModels: trace.models, checks, trace: `${name}.jsonl`, finalText: trace.finalText };
  } catch (error) {
    if (error.stdout) writeFileSync(tracePath, error.stdout);
    if (error.stderr) writeFileSync(join(outputDir, `${name}.stderr.txt`), error.stderr);
    throw error;
  } finally { fixture.dispose(); }
}

export const modelScenarioNames = Object.keys(definitions);
