import { describe, expect, test } from "bun:test";
import {
  existsSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  symlinkSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

import {
  agentSkills,
  parseFrontmatter,
  publicSkills,
  validateProsePaths,
  validateSkillsTree,
} from "../tools/validate-package.mjs";

const repoRoot = fileURLToPath(new URL("..", import.meta.url));
const skillsDir = join(repoRoot, "skills");

describe("shared Agent Skills tree", () => {
  test("public skills include poteto-mode and exclude every principle leaf", () => {
    const skills = agentSkills(skillsDir);
    const pub = publicSkills(skillsDir);
    expect(pub).toContain("poteto-mode");
    for (const name of pub) {
      expect(name.startsWith("principle-")).toBe(false);
    }
    const principles = skills.filter((s) => s.name.startsWith("principle-"));
    expect(principles.length).toBeGreaterThan(0);
    for (const p of principles) {
      expect(p.hidden).toBe(true);
    }
  });


  test("a bare missing markdown target fails the boundary check", () => {
    const root = mkdtempSync(join(tmpdir(), "pstack-skills-links-"));
    const skill = join(root, "example");
    mkdirSync(skill);
    writeFileSync(
      join(skill, "SKILL.md"),
      "[missing](missing.md)\n[external](https://example.com/reference)\n",
    );

    try {
      expect(() => validateSkillsTree(root)).toThrow("example/SKILL.md -> missing.md (missing)");
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });

  test("bare, dotted, and reference-style local links resolve inside the boundary", () => {
    const root = mkdtempSync(join(tmpdir(), "pstack-skills-links-"));
    const skill = join(root, "example");
    const references = join(skill, "references");
    mkdirSync(references, { recursive: true });
    writeFileSync(join(references, "guide.md"), "# Guide\n");
    writeFileSync(
      join(skill, "SKILL.md"),
      [
        "[bare](references/guide.md)",
        "[dotted](./references/guide.md#section)",
        "[reference][guide]",
        "[external](https://example.com/reference)",
        "[guide]: references/guide.md",
        "[^note]: explanatory footnote text is not a link target",
      ].join("\n"),
    );

    try {
      expect(() => validateSkillsTree(root)).not.toThrow();
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });

  test("an escaping markdown target fails the boundary check", () => {
    const root = mkdtempSync(join(tmpdir(), "pstack-skills-links-"));
    const skill = join(root, "example");
    mkdirSync(skill);
    writeFileSync(join(skill, "SKILL.md"), "[escape](../../outside.md)\n");

    try {
      expect(() => validateSkillsTree(root)).toThrow(
        "example/SKILL.md -> ../../outside.md (escapes package boundary)",
      );
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });

  test("a markdown symlink target cannot escape the boundary", () => {
    const parent = mkdtempSync(join(tmpdir(), "pstack-skills-links-"));
    const root = join(parent, "skills");
    const skill = join(root, "example");
    const outside = join(parent, "outside.md");
    mkdirSync(skill, { recursive: true });
    writeFileSync(outside, "outside\n");
    symlinkSync(outside, join(skill, "linked.md"));
    writeFileSync(join(skill, "SKILL.md"), "[escape](linked.md)\n");

    try {
      expect(() => validateSkillsTree(root)).toThrow(
        "example/SKILL.md -> linked.md (escapes package boundary through symlink)",
      );
    } finally {
      rmSync(parent, { recursive: true, force: true });
    }
  });
});

describe("agentSkills reads frontmatter as YAML", () => {
  function readSkill(name, text) {
    const root = mkdtempSync(join(tmpdir(), "pstack-frontmatter-"));
    try {
      mkdirSync(join(root, name));
      writeFileSync(join(root, name, "SKILL.md"), text);
      return agentSkills(root)[0];
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  }

  test("a folded block scalar description is read as its folded value", () => {
    const skill = readSkill("folded", "---\nname: folded\ndescription: >-\n  Use when\n  folding.\n---\n\nbody\n");
    expect(skill.description).toBe("Use when folding.");
  });

  test("malformed YAML is not accepted through a permissive fallback parser", () => {
    expect(() => readSkill("broken", "---\nname: broken\ndescription: [not closed\n---\n")).toThrow();
  });

  test("string visibility is rejected instead of exposing a supposedly hidden skill", () => {
    expect(() => readSkill("hidden", '---\nname: hidden\ndescription: d\nhide: "true"\n---\n')).toThrow(/YAML boolean/);
  });

  test("foreign visibility metadata cannot silently expose a skill", () => {
    expect(() => readSkill("hidden", "---\nname: hidden\ndescription: d\nuser-invocable: false\n---\n")).toThrow(/legacy user-invocable/);
  });

  test("a CRLF file yields its name", () => {
    expect(readSkill("crlf", "---\r\nname: crlf\r\ndescription: d\r\n---\r\n\r\nbody\r\n").name).toBe("crlf");
  });

});
