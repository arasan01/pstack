import { expect, test } from "bun:test";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { parse } from "yaml";

const root = fileURLToPath(new URL("..", import.meta.url));

for (const name of ["gpt", "deepseek", "mixed"]) {
  test(`${name} overlay routes agents through declared native roles and disables retry substitution`, () => {
    const config = parse(readFileSync(`${root}/profiles/${name}.yml`, "utf8"));
    expect(config.retry.modelFallback).toBe(false);
    for (const selector of Object.values(config.task.agentModelOverrides)) {
      expect(selector.startsWith("@")).toBe(true);
      expect(Object.hasOwn(config.modelRoles, selector.slice(1))).toBe(true);
    }
    expect(config.task.agentModelOverrides.task).toBe("@task");
    expect(config.modelRoles.task).toBe("@slow");
  });
}
