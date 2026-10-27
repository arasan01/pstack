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
  return {
    root,
    input: {
      pluginRoot: join(root, "plugin"),
      systemPrompt: Object.freeze(["NATIVE_POLICY", "NATIVE_MODEL_ROLES"]),
    },
  };
}

test("mapping context preserves native prompt blocks without mutating them", () => {
  const { input } = fixture();
  const result = systemPromptForPstack(input);
  expect(result.slice(0, input.systemPrompt.length)).toEqual(input.systemPrompt);
  expect(result).not.toBe(input.systemPrompt);
  expect(result).toHaveLength(input.systemPrompt.length + 1);
  expect(input.systemPrompt).toEqual(["NATIVE_POLICY", "NATIVE_MODEL_ROLES"]);
});

test("legacy model sheets and routing hooks cannot alter the native prompt", () => {
  const { root, input } = fixture();
  const profileDir = join(root, "profile-agent");
  const previousAgentDir = process.env.PI_CODING_AGENT_DIR;
  process.env.PI_CODING_AGENT_DIR = profileDir;
  try {
    const baseline = systemPromptForPstack(input);
    mkdirSync(profileDir);
    mkdirSync(join(input.pluginRoot, "hooks"), { recursive: true });
    const sheet = join(profileDir, "pstack-models.md");
    writeFileSync(sheet, "feature, refactoring: provider/legacy\nsession hook: on\n");
    writeFileSync(join(input.pluginRoot, "hooks/session-start-context.md"), "LEGACY_ROUTING_MANDATE");
    expect(systemPromptForPstack(input)).toEqual(baseline);

    rmSync(sheet);
    mkdirSync(sheet);
    expect(systemPromptForPstack(input)).toEqual(baseline);
  } finally {
    if (previousAgentDir === undefined) delete process.env.PI_CODING_AGENT_DIR;
    else process.env.PI_CODING_AGENT_DIR = previousAgentDir;
  }
});

test("omp packaging rejects missing entrypoints and cross-loading the Pi adapter", () => {
  const omp = { extensions: ["./omp/index.ts"] };
  const validate = (value, pathExists = () => true) => validateOmpPackage(JSON.stringify({ omp: value }), { pathExists });
  expect(() => validate(omp, (path) => path !== "plugins/pstack/omp/index.ts")).toThrow("does not exist");
  expect(() => validate(omp, (path) => path !== "plugins/pstack/skills")).toThrow("skills directory is missing");
  expect(() => validate({ extensions: [] })).toThrow("omp.extensions must list");
  expect(() => validate({ extensions: [...omp.extensions, "./pi/index.ts"] })).toThrow("must not load the Pi adapter");
});
