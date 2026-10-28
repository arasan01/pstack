import { afterEach, describe, expect, test } from "bun:test";
import { mkdirSync, mkdtempSync, readFileSync, rmSync, symlinkSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import {
  agentSkills,
  parseFrontmatter,
  publicSkills,
  validateAgentDefinitions,
  validateAll,
  validateOmpPackage,
  validateProsePaths,
  validateRuntimeInstructions,
  validateSkillsTree,
} from "../tools/validate-package.mjs";

const repoRoot = fileURLToPath(new URL("..", import.meta.url));

const fixtures = [];
afterEach(() => {
  for (const root of fixtures.splice(0)) {
    rmSync(root, { recursive: true, force: true });
  }
});

function createPackageFixture(mutate = () => {}) {
  const root = mkdtempSync(join(tmpdir(), "pstack-pkg-fixture-"));
  fixtures.push(root);

  writeFileSync(
    join(root, "package.json"),
    JSON.stringify(
      {
        name: "pstack",
        version: "0.10.0",
        type: "module",
        omp: {
          extensions: ["./omp/index.ts"],
        },
      },
      null,
      2,
    ),
  );
  writeFileSync(join(root, "VERSION"), "0.10.0\n");

  mkdirSync(join(root, "omp"), { recursive: true });
  writeFileSync(join(root, "omp", "index.ts"), "export default function() {}\n");

  mkdirSync(join(root, "skills", "good-skill"), { recursive: true });
  writeFileSync(
    join(root, "skills", "good-skill", "SKILL.md"),
    "---\nname: good-skill\ndescription: A valid skill for testing.\n---\n\n# Good skill\n",
  );

  mkdirSync(join(root, "skills", "principle-good"), { recursive: true });
  writeFileSync(
    join(root, "skills", "principle-good", "SKILL.md"),
    "---\nname: principle-good\ndescription: A valid principle for testing.\nhide: true\n---\n\n# Principle\n",
  );

  mkdirSync(join(root, "agents"), { recursive: true });
  writeFileSync(
    join(root, "agents", "comment-sicko.md"),
    "---\nname: comment-sicko\ndescription: Semantic specialist agent.\n---\n\n# Specialist\n",
  );

  mutate(root);
  return root;
}

describe("OMP package validation and boundary checks", () => {
  test("current repository passes full OMP package validation", () => {
    const result = validateAll(repoRoot);
    expect(result.skillsCount).toBeGreaterThan(50);
    expect(result.publicSkillsCount).toBeGreaterThan(30);
    expect(result.agentsCount).toBeGreaterThanOrEqual(1);
  });

  test("a valid fixture passes validation", () => {
    const root = createPackageFixture();
    const result = validateAll(root);
    expect(result.skillsCount).toBe(2);
    expect(result.publicSkillsCount).toBe(1);
    expect(result.agentsCount).toBe(1);
  });

  test("missing package.json fails with clear error", () => {
    const root = createPackageFixture((r) => rmSync(join(r, "package.json")));
    expect(() => validateOmpPackage(root)).toThrow(/missing package\.json/);
  });

  test("package name other than pstack fails", () => {
    const root = createPackageFixture((r) => {
      const pkg = JSON.parse(readFileSync(join(r, "package.json"), "utf8"));
      pkg.name = "wrong-name";
      writeFileSync(join(r, "package.json"), JSON.stringify(pkg));
    });
    expect(() => validateOmpPackage(root)).toThrow(/package\.json name must be "pstack"/);
  });

  test("VERSION mismatch with package.json fails", () => {
    const root = createPackageFixture((r) => {
      writeFileSync(join(r, "VERSION"), "0.9.99\n");
    });
    expect(() => validateOmpPackage(root)).toThrow(/VERSION file .* does not match package\.json/);
  });

  test("missing omp manifest field fails", () => {
    const root = createPackageFixture((r) => {
      const pkg = { name: "pstack", version: "0.10.0" };
      writeFileSync(join(r, "package.json"), JSON.stringify(pkg));
    });
    expect(() => validateOmpPackage(root)).toThrow(/missing required "omp" manifest field/);
  });

  test("empty omp.extensions fails", () => {
    const root = createPackageFixture((r) => {
      const pkg = { name: "pstack", version: "0.10.0", omp: { extensions: [] } };
      writeFileSync(join(r, "package.json"), JSON.stringify(pkg));
    });
    expect(() => validateOmpPackage(root)).toThrow(/must list at least one extension/);
  });

  test("missing declared extension file fails", () => {
    const root = createPackageFixture((r) => {
      rmSync(join(r, "omp", "index.ts"));
    });
    expect(() => validateOmpPackage(root)).toThrow(/declared extension .* does not exist/);
  });

  test("extension escaping root fails", () => {
    const root = createPackageFixture((r) => {
      const pkg = {
        name: "pstack",
        version: "0.10.0",
        omp: { extensions: ["../../outside.ts"] },
      };
      writeFileSync(join(r, "package.json"), JSON.stringify(pkg));
    });
    expect(() => validateOmpPackage(root)).toThrow(/escapes package root|does not exist/);
  });

  test("presence of legacy plugins directory fails", () => {
    const root = createPackageFixture((r) => {
      mkdirSync(join(r, "plugins"));
    });
    expect(() => validateOmpPackage(root)).toThrow(/legacy directory plugins must not exist/);
  });

  test("presence of legacy .claude-plugin directory fails", () => {
    const root = createPackageFixture((r) => {
      mkdirSync(join(r, ".claude-plugin"));
    });
    expect(() => validateOmpPackage(root)).toThrow(/legacy directory \.claude-plugin must not exist/);
  });

  test("skill frontmatter name mismatching directory fails", () => {
    const root = createPackageFixture((r) => {
      writeFileSync(
        join(r, "skills", "good-skill", "SKILL.md"),
        "---\nname: different-name\ndescription: test\n---\n",
      );
    });
    expect(() => agentSkills(join(root, "skills"))).toThrow(/frontmatter name "different-name" != directory/);
  });

  test("a principle leaf cannot become visible in the native skill listing", () => {
    const root = createPackageFixture((r) => {
      writeFileSync(
        join(r, "skills", "principle-good", "SKILL.md"),
        "---\nname: principle-good\ndescription: test\n---\n",
      );
    });
    expect(() => agentSkills(join(root, "skills"))).toThrow(/hide: true/);
  });

  test("skill with legacy disable-model-invocation fails", () => {
    const root = createPackageFixture((r) => {
      writeFileSync(
        join(r, "skills", "good-skill", "SKILL.md"),
        "---\nname: good-skill\ndescription: test\ndisable-model-invocation: true\n---\n",
      );
    });
    expect(() => agentSkills(join(root, "skills"))).toThrow(/contains legacy disable-model-invocation key/);
  });

  test("agent with mismatched filename fails", () => {
    const root = createPackageFixture((r) => {
      writeFileSync(
        join(r, "agents", "comment-sicko.md"),
        "---\nname: other-agent\ndescription: test\n---\n",
      );
    });
    expect(() => validateAgentDefinitions(join(root, "agents"))).toThrow(/frontmatter name "other-agent" != filename/);
  });

  test("agent with missing description fails", () => {
    const root = createPackageFixture((r) => {
      writeFileSync(
        join(r, "agents", "comment-sicko.md"),
        "---\nname: comment-sicko\ndescription: \"\"\n---\n",
      );
    });
    expect(() => validateAgentDefinitions(join(root, "agents"))).toThrow(/description missing or empty/);
  });

  test("escaping markdown link in skill fails", () => {
    const root = createPackageFixture((r) => {
      writeFileSync(
        join(r, "skills", "good-skill", "SKILL.md"),
        "---\nname: good-skill\ndescription: test\n---\n\n[escapes](../../outside.md)\n",
      );
    });
    expect(() => validateSkillsTree(join(root, "skills"))).toThrow(/escapes package boundary/);
  });

  test("obsolete path references in skill prose fail", () => {
    const root = createPackageFixture((r) => {
      writeFileSync(
        join(r, "skills", "good-skill", "SKILL.md"),
        "---\nname: good-skill\ndescription: test\n---\n\nSee `plugins/pstack/models.json` for info.\n",
      );
    });
    expect(() => validateProsePaths(join(root, "skills"), root)).toThrow(/obsolete path references found/);
  });

  test("unsupported runtime dispatch instruction fails", () => {
    const root = createPackageFixture((r) => {
      writeFileSync(
        join(r, "skills", "good-skill", "SKILL.md"),
        '---\nname: good-skill\ndescription: test\n---\n\nSpawn with `subagent_type: "pstack:poteto-agent"`.\n',
      );
    });
    expect(() => validateRuntimeInstructions(join(root, "skills"))).toThrow(/unsupported runtime instructions/);
  });
});
