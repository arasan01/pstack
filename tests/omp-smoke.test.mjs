import { afterEach, expect, test } from "bun:test";
import { existsSync, unlinkSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { parseArgs } from "../tools/omp-smoke.mjs";
import { inspectTrace, isolatedEnvironment, makeWorkspace, parseEvents, parseModelCatalog, requireSuccess, run, snapshot } from "../tools/smoke/runner.mjs";

const cleanups = [];
afterEach(() => { for (const cleanup of cleanups.splice(0)) cleanup(); });

function assistant(model = "wanted", stopReason = "stop") {
  return { type: "message_end", message: { role: "assistant", provider: "provider", model, stopReason, content: [{ type: "text", text: "finished" }] } };
}

test("native model catalogs use an object envelope, not a top-level array", () => {
  const models = parseModelCatalog('{"models":[{"provider":"deepseek","id":"deepseek-v4-pro"}]}');
  expect(models.map(model => `${model.provider}/${model.id}`)).toEqual(["deepseek/deepseek-v4-pro"]);
  expect(() => parseModelCatalog("[]")).toThrow("model catalog");
  expect(() => parseModelCatalog('{"models":[{"id":"missing-provider"}]}')).toThrow("model catalog");
});

test("wrong models, fallback events and incomplete turns cannot qualify", () => {
  expect(() => inspectTrace([assistant("replacement")], "provider/wanted")).toThrow("Model mismatch");
  expect(() => inspectTrace([assistant(), { type: "retry_fallback_applied" }], "provider/wanted")).toThrow("fallback");
  expect(() => inspectTrace([assistant("wanted", "error")], "provider/wanted")).toThrow("error");
  expect(() => inspectTrace([{ type: "agent_end" }], "provider/wanted")).toThrow("no completed assistant");
  expect(() => parseEvents('{"type":"session"}\ntruncated-record')).toThrow("line 2");
});

test("unknown CLI options and absent models fail rather than create empty passing evidence", () => {
  expect(() => parseArgs(["--scenario", "typo"])).toThrow("Unknown scenario");
  expect(() => parseArgs(["--dry-run"])).toThrow("Unknown option");
  expect(() => parseArgs(["--scenario", "investigation"])).toThrow("--model");
  expect(() => parseArgs(["--scenario", "discovery", "--timeout", "-1"])).toThrow("--timeout");
  expect(() => parseArgs(["--model"])).toThrow("requires a value");
});

test("workspace observation detects edits, deletion and hidden untracked files without git", () => {
  const fixture = makeWorkspace({ "src/item.txt": "before", "delete.txt": "remove" });
  cleanups.push(fixture.dispose);
  const before = snapshot(fixture.workspace);
  writeFileSync(join(fixture.workspace, "src/item.txt"), "after");
  unlinkSync(join(fixture.workspace, "delete.txt"));
  writeFileSync(join(fixture.workspace, ".ignored-result"), "new");
  writeFileSync(join(fixture.workspace, ".git"), "gitdir: elsewhere\n");
  const after = snapshot(fixture.workspace);
  expect(after["src/item.txt"]).not.toBe(before["src/item.txt"]);
  expect(after["delete.txt"]).toBeUndefined();
  expect(Object.hasOwn(after, ".ignored-result")).toBe(true);
  expect(after[".git"]).toBeDefined();
});

test("real subprocess failure cannot be accepted as successful discovery", async () => {
  const result = await run(process.execPath, ["-e", 'process.stdout.write("some output"); process.exit(7)']);
  expect(() => requireSuccess(result, "discovery")).toThrow("exited 7");
});

test("deadline stops detached verification descendants before fixture cleanup", async () => {
  const fixture = makeWorkspace();
  cleanups.push(fixture.dispose);
  const marker = join(fixture.workspace, "late.txt");
  const worker = `process.on('SIGTERM',()=>{}); process.stdout.write('CHILD_READY'); setTimeout(() => require('node:fs').writeFileSync(${JSON.stringify(marker)}, 'late'), 2200);`;
  const parent = `const {spawn}=require('node:child_process'); spawn(process.execPath, ['-e', ${JSON.stringify(worker)}], {detached:true,stdio:['ignore','inherit','inherit']}); setInterval(()=>{},1000);`;
  let failure;
  try { await run(process.execPath, ["-e", parent], { timeoutMs: 1000, gracefulMs: 100 }); }
  catch (error) { failure = error; }
  expect(failure?.message).toContain("exceeded");
  expect(failure?.stdout).toContain("CHILD_READY");
  await new Promise(resolve => setTimeout(resolve, 2300));
  expect(existsSync(marker)).toBe(false);
});

test("isolated native discovery uses a temporary operating-system home", async () => {
  const fixture = makeWorkspace();
  cleanups.push(fixture.dispose);
  const result = await run(process.execPath, ["-e", "process.stdout.write(require('node:os').homedir())"], {
    env: isolatedEnvironment(fixture.root),
  });
  expect(requireSuccess(result, "native home resolution")).toBe(join(fixture.root, "home"));
});
