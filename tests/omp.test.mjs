import { afterEach, expect, test } from "bun:test";
import { mkdtempSync, mkdirSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { systemPromptForPstack } from "../plugins/pstack/omp/prompt.mjs";
import { validateOmpPackage } from "../tools/runtimes.mjs";

const roots = [];
afterEach(() => { for (const root of roots.splice(0)) rmSync(root, { recursive: true, force: true }); });
function fixture() {
  const root = mkdtempSync(join(tmpdir(), "pstack-omp-"));
  roots.push(root);
  const pluginRoot = join(root, "plugin");
  const agentDir = join(root, "profile-agent");
  mkdirSync(join(pluginRoot, "hooks"), { recursive: true });
  mkdirSync(agentDir);
  writeFileSync(join(pluginRoot, "hooks/session-start-context.md"), "ROUTE_TASKS");
  return { pluginRoot, agentDir, systemPrompt: ["EXISTING_POLICY"], isMain: true };
}

test("root routing preserves existing policy, and children get model choices without the root mandate", () => {
  const input = fixture();
  const sheet = "arena runners: provider/one, provider/two\nsession hook: on\n";
  writeFileSync(join(input.agentDir, "pstack-models.md"), sheet);
  const main = systemPromptForPstack(input);
  const child = systemPromptForPstack({ ...input, isMain: false });
  expect(main[0]).toBe("EXISTING_POLICY");
  expect(main).toContain("ROUTE_TASKS");
  expect(child).not.toContain("ROUTE_TASKS");
  expect(child).toContain(`pstack model configuration for this runtime:\n${sheet}`);
  expect(input.systemPrompt).toEqual(["EXISTING_POLICY"]);
});

test("routing and model changes take effect on the next turn, including UTF-16 and CRLF sheets", () => {
  const input = fixture();
  expect(systemPromptForPstack(input)).toContain("ROUTE_TASKS");
  const sheet = "feature, refactoring: provider/model\r\nsession hook: off\r\n";
  writeFileSync(join(input.agentDir, "pstack-models.md"), Buffer.from(`\uFEFF${sheet}`, "utf16le"));
  const off = systemPromptForPstack(input);
  expect(off).not.toContain("ROUTE_TASKS");
  expect(off).toContain(`pstack model configuration for this runtime:\n${sheet}`);
  writeFileSync(join(input.agentDir, "pstack-models.md"), "session hook: on\n");
  expect(systemPromptForPstack(input)).toContain("ROUTE_TASKS");
});

test("an inaccessible or invalid sheet path is not treated as an absent preference", () => {
  const input = fixture();
  mkdirSync(join(input.agentDir, "pstack-models.md"));
  expect(() => systemPromptForPstack(input)).toThrow();
});

test("omp packaging rejects missing entrypoints and cross-loading the Pi adapter", () => {
  const omp = { extensions: ["./omp/index.ts"] };
  const validate = (value, pathExists = () => true) => validateOmpPackage(JSON.stringify({ omp: value }), { pathExists });
  expect(() => validate(omp, (path) => path !== "plugins/pstack/omp/index.ts")).toThrow("does not exist");
  expect(() => validate(omp, (path) => path !== "plugins/pstack/skills")).toThrow("skills directory is missing");
  expect(() => validate({ extensions: [] })).toThrow("omp.extensions must list");
  expect(() => validate({ extensions: [...omp.extensions, "./pi/index.ts"] })).toThrow("must not load the Pi adapter");
});
