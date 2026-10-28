#!/usr/bin/env bun
import { mkdirSync, readdirSync, readFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { writeEvidence } from "./smoke/evidence.mjs";
import { availableModels, InterruptedError, requireSuccess, run } from "./smoke/runner.mjs";
import { modelScenario, modelScenarioNames, packageDiscovery } from "./smoke/scenarios.mjs";

const repoRoot = fileURLToPath(new URL("..", import.meta.url));
const scenarios = ["all", "discovery", "deepseek", ...modelScenarioNames];

export function parseArgs(args) {
  const options = { scenario: "all", model: undefined, outputDir: undefined, timeoutMs: 180000, help: false };
  for (let index = 0; index < args.length; index++) {
    const flag = args[index];
    if (flag === "--help" || flag === "-h") { options.help = true; continue; }
    if (flag === "--discovery-only") { options.scenario = "discovery"; continue; }
    if (!["--scenario", "--model", "--output-dir", "--timeout"].includes(flag)) throw new Error(`Unknown option: ${flag}`);
    const value = args[++index];
    if (!value || value.startsWith("--")) throw new Error(`${flag} requires a value`);
    if (flag === "--scenario") options.scenario = value;
    if (flag === "--model") options.model = value;
    if (flag === "--output-dir") options.outputDir = value;
    if (flag === "--timeout") {
      if (!/^\d+$/.test(value) || !Number.isSafeInteger(Number(value)) || Number(value) < 1000) throw new Error("--timeout must be an integer of at least 1000 milliseconds");
      options.timeoutMs = Number(value);
    }
  }
  if (!scenarios.includes(options.scenario)) throw new Error(`Unknown scenario: ${options.scenario}`);
  if (!options.help && !["discovery", "deepseek"].includes(options.scenario) && !options.model) throw new Error("Provide --model provider/model-id from omp models --json; no implicit model substitution is allowed");
  if (options.scenario === "deepseek" && options.model && !/deepseek/i.test(options.model)) throw new Error("--scenario deepseek requires a DeepSeek model identity");
  return options;
}

export async function main(args = process.argv.slice(2)) {
  const options = parseArgs(args);
  if (options.help) {
    console.log("Usage: bun tools/omp-smoke.mjs --scenario <all|discovery|investigation|planning|implementation|delegation|deepseek> [--model provider/model-id] [--output-dir directory] [--timeout milliseconds]\n\nRuns real OMP. Discovery uses an isolated installation with no model requests. Other scenarios use current native credentials and temporary non-persistent overlays. Exit 0 = passed, 1 = failed, 2 = required model unavailable. No dry-run can produce passing evidence.");
    return 0;
  }
  const outputDir = resolve(options.outputDir ?? join(".omp-smoke-output", new Date().toISOString().replaceAll(":", "-")));
  mkdirSync(outputDir, { recursive: true });
  if (readdirSync(outputDir).length) throw new Error(`Evidence directory must be empty: ${outputDir}`);
  const ompBin = process.env.OMP_BIN ?? "omp";
  const ompVersion = requireSuccess(await run(ompBin, ["--version"], { timeoutMs: options.timeoutMs }), "OMP version").trim();
  const report = { timestamp: new Date().toISOString(), ompVersion, pstackVersion: JSON.parse(readFileSync(join(repoRoot, "package.json"))).version, scenarios: [] };
  const execute = async (name, operation) => {
    const start = Date.now();
    try {
      const details = await operation();
      report.scenarios.push({ name, status: "PASSED", durationMs: Date.now() - start, ...details });
    } catch (error) {
      if (error instanceof InterruptedError || error.cleanupFailed) throw error;
      report.scenarios.push({ name, status: "FAILED", durationMs: Date.now() - start, error: error.message });
    }
    console.log(`${report.scenarios.at(-1).status}: ${name}`);
  };
  const common = { repoRoot, ompBin, outputDir, timeoutMs: options.timeoutMs };
  if (["all", "discovery"].includes(options.scenario)) await execute("discovery", () => packageDiscovery(common));
  if (options.scenario !== "discovery") {
    let models;
    try { models = await availableModels(ompBin, { timeoutMs: options.timeoutMs }); }
    catch (error) {
      if (error instanceof InterruptedError || error.cleanupFailed) throw error;
      report.scenarios.push({ name: "model-catalog", status: "FAILED", error: error.message });
    }
    if (models) {
      const qualify = async (model, names, prefix = "") => {
        if (!models.some(entry => `${entry.provider}/${entry.id}` === model)) {
          report.scenarios.push({ name: prefix || "requested-model", status: "UNAVAILABLE", requestedModel: model, reason: "Exact requested model is absent from the current available-model catalog; no replacement was invoked" });
          return;
        }
        const directory = prefix ? join(outputDir, prefix) : outputDir;
        mkdirSync(directory, { recursive: true });
        for (const name of names) await execute(`${prefix ? `${prefix}/` : ""}${name}`, () => modelScenario({ ...common, outputDir: directory, model, name }));
      };
      if (options.scenario !== "deepseek") await qualify(options.model, options.scenario === "all" ? modelScenarioNames : [options.scenario]);
      if (["all", "deepseek"].includes(options.scenario)) {
        const selected = options.scenario === "deepseek" ? options.model : /deepseek/i.test(options.model ?? "") ? options.model : undefined;
        const deepseek = selected ? models.find(entry => `${entry.provider}/${entry.id}` === selected) : models.find(entry => /deepseek/i.test(`${entry.provider}/${entry.id}`));
        if (!deepseek) report.scenarios.push({ name: "deepseek", status: "UNAVAILABLE", requestedModel: selected, reason: "The requested DeepSeek target is unavailable in the current native catalog; DeepSeek execution is unverified" });
        else if (options.scenario === "deepseek" || !selected) await qualify(`${deepseek.provider}/${deepseek.id}`, modelScenarioNames, "deepseek");
      }
    }
  }
  const evidence = writeEvidence(outputDir, report);
  console.log(`Evidence: ${join(outputDir, "evidence.json")}`);
  console.log(JSON.stringify(evidence.summary));
  return evidence.summary.failed ? 1 : evidence.summary.unavailable ? 2 : 0;
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  main().then(code => { process.exitCode = code; }, error => {
    console.error(error.message);
    process.exitCode = error instanceof InterruptedError ? error.signal === "SIGINT" ? 130 : 143 : 1;
  });
}
