import { afterEach, describe, expect, test } from "bun:test";
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

import { agentSkills, validateOmpPackage } from "../tools/validate-package.mjs";

const fixtures = [];
afterEach(() => {
  for (const root of fixtures.splice(0)) rmSync(root, { recursive: true, force: true });
});

function skill(root, name, front, body = "body\n") {
  mkdirSync(join(root, "skills", name), { recursive: true });
  writeFileSync(
    join(root, "skills", name, "SKILL.md"),
    `---\nname: ${name}\ndescription: fixture\n${front}---\n\n${body}`,
  );
}

function fixture(mutate = () => {}) {
  const root = mkdtempSync(join(tmpdir(), "omp-invariants-"));
  fixtures.push(root);
  skill(root, "good", "");
  skill(root, "principle-good", "hide: true\n");
  mutate(root);
  return root;
}

describe("static skill and package invariants", () => {
  test("a clean skills tree passes", () => {
    const root = fixture();
    expect(() => agentSkills(join(root, "skills"))).not.toThrow();
  });

  test("disable-model-invocation on a skill fails and names the file", () => {
    const root = fixture((r) => skill(r, "flagged", "disable-model-invocation: true\n"));
    expect(() => agentSkills(join(root, "skills"))).toThrow(/contains legacy disable-model-invocation key/);
  });

  test("a principle leaf missing native visibility metadata fails", () => {
    const root = fixture((r) => skill(r, "principle-visible", ""));
    expect(() => agentSkills(join(root, "skills"))).toThrow(/hide: true/);
  });

  test("a principle leaf carrying disable-model-invocation fails", () => {
    const root = fixture((r) => skill(r, "principle-dead", "hide: true\ndisable-model-invocation: true\n"));
    expect(() => agentSkills(join(root, "skills"))).toThrow(/contains legacy disable-model-invocation key/);
  });

  test("the body of a skill may mention the flag in prose", () => {
    const root = fixture();
    writeFileSync(
      join(root, "skills/good/SKILL.md"),
      "---\nname: good\ndescription: fixture\n---\n\nNever set disable-model-invocation: true on a skill.\n",
    );
    expect(() => agentSkills(join(root, "skills"))).not.toThrow();
  });
});
