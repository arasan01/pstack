// models.json is the model policy every stamped Models section, the override
// sheet, and the Codex mapping derive from. parseModels checks its shape when
// the generator loads it, and a role label is the runtime join key between the
// override sheet the user writes and the prose that tells the agent which role
// to look up.
import { describe, expect, test } from "bun:test";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

import { parseModels } from "../tools/generate.mjs";

const repoRoot = fileURLToPath(new URL("..", import.meta.url));
const raw = JSON.parse(readFileSync(join(repoRoot, "plugins/pstack/models.json"), "utf8"));


describe("parseModels", () => {
  const anySkill = () => true;
  const parse = (mutate, skillExists = anySkill) => {
    const policy = structuredClone(raw);
    mutate(policy);
    return () => parseModels(policy, skillExists);
  };
  const role = (policy, label) => policy.roles.find((r) => r.role === label);

  test("resolves a tier by reference and keeps its name on the role", () => {
    const resolved = parseModels(structuredClone(raw), anySkill);
    const arena = role(resolved, "arena runners");
    expect(arena.tier).toBe("panel");
    expect(arena.models).toEqual(raw.tiers.panel);
    expect(role(resolved, "bug-fix").models).toEqual([raw.tiers.strongest]);
  });

  test("a missing top-level key throws naming it", () => {
    expect(parse((p) => delete p.efforts)).toThrow('models.json: "efforts" must be a list');
    expect(parse((p) => delete p.codex)).toThrow('models.json: "codex" must be an object');
  });

  test.each(["default", "strongest", "panel"])("a missing %s tier throws naming it, since a stamped region renders from it", (tier) => {
    expect(
      parse((p) => {
        delete p.tiers[tier];
        delete p.codex[tier];
        p.roles = p.roles.filter((r) => r.models !== tier);
      }),
    ).toThrow(`models.json: tiers has no "${tier}"`);
  });

  test("a role naming an undefined tier throws naming the role and the tier", () => {
    expect(parse((p) => (role(p, "bug-fix").models = "strongset"))).toThrow(
      'models.json: role "bug-fix" names tier "strongset", which tiers does not define',
    );
  });

  test("a slug outside available throws naming it, in a role or a tier", () => {
    expect(parse((p) => (role(p, "swarm workers").models = ["opsu"]))).toThrow(
      'models.json: role "swarm workers" names "opsu", which is not in available',
    );
    expect(parse((p) => (p.tiers.panel = [p.available[0], "gpt"]))).toThrow(
      'models.json: tier "panel" names "gpt", which is not in available',
    );
  });

  test("a role with no models throws naming the role", () => {
    expect(parse((p) => (role(p, "swarm workers").models = []))).toThrow(
      'models.json: role "swarm workers" needs a tier name or a non-empty list of models',
    );
  });

  test("a role list that repeats a tier throws, so the tier is written once", () => {
    expect(parse((p) => (role(p, "arena runners").models = [...raw.tiers.panel]))).toThrow(
      'models.json: role "arena runners" lists tier "panel" literally; name the tier',
    );
  });

  test("a duplicate role label throws naming it", () => {
    expect(parse((p) => p.roles.push({ ...role(p, "how explorer") }))).toThrow(
      'models.json: role "how explorer" appears twice',
    );
  });

  test("a role whose skill directory does not exist throws naming both", () => {
    expect(parse(() => {}, (skill) => skill !== "why")).toThrow(
      'models.json: role "why investigators" names skill "why", which has no SKILL.md',
    );
  });

  test("a duplicate slug in available or in a panel throws naming it", () => {
    expect(parse((p) => p.available.push(p.available[0]))).toThrow(`models.json: available lists "${raw.available[0]}" twice`);
    expect(parse((p) => (p.tiers.panel = [p.available[0], p.available[0]]))).toThrow(`models.json: tier "panel" lists "${raw.available[0]}" twice`);
    expect(parse((p) => (p.codex.panel = ["a", "a"]))).toThrow('models.json: codex "panel" lists "a" twice');
  });

  test("an effort level Claude Code does not accept, or a repeated one, throws naming it", () => {
    expect(parse((p) => p.efforts.push("extreme"))).toThrow(
      'models.json: effort "extreme" is not one of low, medium, high, xhigh, max',
    );
    expect(parse((p) => p.efforts.push("low"))).toThrow('models.json: efforts lists "low" twice');
  });

  test("a defaultEffort that is neither a level nor session throws naming it", () => {
    expect(parse((p) => (p.defaultEffort = "hgih"))).toThrow(
      'models.json: defaultEffort "hgih" is not an effort level or "session"',
    );
  });

  test("each pi provider table must map exactly the available aliases to that provider's models", () => {
    expect(parse((p) => delete p.pi)).toThrow('models.json: "pi" must be an object');
    expect(parse((p) => delete p.pi.models)).toThrow('models.json: pi needs a "models" object');
    expect(parse((p) => (p.pi.extra = 1))).toThrow('models.json: pi names "extra"; its keys are "fallback" and "models"');
    expect(parse((p) => (p.pi.fallback = "google"))).toThrow('models.json: pi.fallback "google" is not a provider in pi.models');
    expect(parse((p) => (p.pi.models.openai = "openai/gpt"))).toThrow("models.json: pi.models.openai must be an object");
    expect(parse((p) => delete p.pi.models["openai-codex"][p.available[0]])).toThrow(
      `models.json: pi.models.openai-codex has no Pi model for "${raw.available[0]}"`,
    );
    expect(parse((p) => (p.pi.models.openai.gpt = "openai/gpt"))).toThrow(
      'models.json: pi.models.openai names "gpt", which is not in available',
    );
    expect(parse((p) => (p.pi.models.openai[p.available[0]] = "unqualified"))).toThrow(
      `models.json: pi.models.openai "${raw.available[0]}" is "unqualified", not a openai/<id>`,
    );
    expect(parse((p) => (p.pi.models.openai[p.available[0]] = "openai-codex/gpt-6.1-sol"))).toThrow(
      `models.json: pi.models.openai "${raw.available[0]}" is "openai-codex/gpt-6.1-sol", not a openai/<id>`,
    );
  });

  test("a codex block that misses or adds a tier throws naming the tier", () => {
    expect(parse((p) => delete p.codex.strongest)).toThrow('models.json: codex has no example for tier "strongest"');
    expect(parse((p) => (p.codex.fastest = "gpt"))).toThrow('models.json: codex names "fastest", which is not a tier');
  });
});

