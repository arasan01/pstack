#!/usr/bin/env node

import { createHash } from "node:crypto";
import { readFileSync, realpathSync, statSync } from "node:fs";
import { isAbsolute, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { parseDocument, visit } from "yaml";
import { pathIsInside } from "./validate-package.mjs";

const CONTRACT = "skills/poteto-mode/SKILL.md";
const PACKAGE_ROOT = fileURLToPath(new URL("..", import.meta.url));
const HASH = /^[a-f0-9]{64}$/;
const SCOPE_HASH = /^sha256:[a-f0-9]{64}$/;
const own = (object, key) => Object.hasOwn(object, key);
const mapping = (value) => value !== null && typeof value === "object" && !Array.isArray(value);
const text = (value) => typeof value === "string" && value.trim().length > 0;
const sha256 = (bytes) => createHash("sha256").update(bytes).digest("hex");
const diagnostic = (code, file, message, criterion) => ({ code, file, ...(criterion === undefined ? {} : { criterion }), message });

class InvalidContract extends Error {
  constructor(code, file, message) {
    super(message);
    this.diagnostics = [diagnostic(code, file, message)];
  }
}

function requireValue(condition, file, message) {
  if (!condition) throw new InvalidContract("INVALID_SCHEMA", file, message);
}

function keys(value, allowed, file, label) {
  requireValue(mapping(value), file, `${label} must be a mapping`);
  requireValue(Object.keys(value).every((key) => allowed.includes(key)), file, `${label} contains an unknown key`);
}

function frontmatter(bytes, file) {
  const block = bytes.toString("utf8").match(/^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)/);
  if (!block) return null;
  const doc = parseDocument(block[1], { uniqueKeys: true });
  if (doc.errors.length) throw new InvalidContract("INVALID_YAML", file, doc.errors.map((error) => error.message).join("; "));
  let alias = false;
  visit(doc, { Alias() { alias = true; } });
  requireValue(!alias, file, "YAML aliases are not supported");
  return doc.toJS();
}

function pointerTokens(pointer, file) {
  requireValue(typeof pointer === "string" && (pointer === "" || pointer.startsWith("/")), file, "proof pointers must be RFC 6901 JSON Pointers");
  requireValue(!/~(?:[^01]|$)/.test(pointer), file, "invalid JSON Pointer escape");
  return pointer === "" ? [] : pointer.slice(1).split("/").map((part) => part.replace(/~1/g, "/").replace(/~0/g, "~"));
}

function loadPlan(planPath) {
  const front = frontmatter(readFileSync(planPath), planPath);
  requireValue(mapping(front), planPath, "plan frontmatter is required");
  const workflow = front.workflow;
  keys(workflow, ["version", "scope", "results"], planPath, "workflow");
  requireValue(workflow.version === 1, planPath, "workflow.version must be 1");
  const scope = workflow.scope;
  keys(scope, ["contract", "owner", "stop", "source", "criteria"], planPath, "scope");
  requireValue(scope.contract === "pstack-workflow/v1", planPath, "unsupported scope.contract");
  requireValue(text(scope.owner) && text(scope.stop), planPath, "scope owner and stop must be nonempty strings");
  keys(scope.source, ["uri", "speaker", "quote"], planPath, "scope.source");
  requireValue(text(scope.source.uri) && scope.source.speaker === "user" && text(scope.source.quote), planPath, "scope.source requires uri, speaker user and original quote");
  requireValue(mapping(scope.criteria) && Object.keys(scope.criteria).length > 0, planPath, "scope.criteria must be a nonempty mapping");
  for (const [id, criterion] of Object.entries(scope.criteria)) {
    requireValue(text(id), planPath, "criterion IDs must be nonempty");
    keys(criterion, ["text", "proof"], planPath, `criterion ${id}`);
    requireValue(text(criterion.text), planPath, `criterion ${id} requires text`);
    keys(criterion.proof, ["executed", "outcome", "equals"], planPath, `criterion ${id} proof`);
    pointerTokens(criterion.proof.executed, planPath);
    pointerTokens(criterion.proof.outcome, planPath);
    const expected = criterion.proof.equals;
    requireValue(own(criterion.proof, "equals") && (expected === null || ["string", "boolean"].includes(typeof expected) || (typeof expected === "number" && Number.isFinite(expected))), planPath, `criterion ${id} equals must be a JSON scalar`);
  }
  return workflow;
}

function canonical(value) {
  if (Array.isArray(value)) return `[${value.map(canonical).join(",")}]`;
  if (mapping(value)) return `{${Object.keys(value).sort().map((key) => `${JSON.stringify(key)}:${canonical(value[key])}`).join(",")}}`;
  return JSON.stringify(value);
}

function scopeFingerprint(scope, contractPath) {
  const bytes = readFileSync(contractPath);
  return `sha256:${sha256(canonical({ scope, contractSha256: sha256(bytes) }))}`;
}

export function fingerprintPlan({ planPath, contractPath = join(PACKAGE_ROOT, CONTRACT) }) {
  const workflow = loadPlan(planPath);
  return { scope: scopeFingerprint(workflow.scope, contractPath) };
}


function boundedFile(root, realRoot, name) {
  if (!text(name) || isAbsolute(name) || /^[a-z][a-z0-9+.-]*:/i.test(name)) throw new Error("file must be a relative local path");
  const path = resolve(root, name);
  if (!pathIsInside(root, path)) throw new Error("path escapes root");
  if (!pathIsInside(realRoot, realpathSync(path))) throw new Error("symlink escapes root");
  if (!statSync(path).isFile()) throw new Error("path is not a regular file");
  return path;
}

function select(json, pointer, file) {
  let value = json;
  for (const token of pointerTokens(pointer, file)) {
    if (value === null || typeof value !== "object" || !own(value, token) || (Array.isArray(value) && !/^(0|[1-9][0-9]*)$/.test(token))) {
      throw new Error(`missing JSON Pointer ${pointer}`);
    }
    value = value[token];
  }
  return value;
}

export function checkPlan({ planPath, expectedScope, evidenceRoot, contractPath = join(PACKAGE_ROOT, CONTRACT) }) {
  const diagnostics = [];
  let scope;
  try {
    const workflow = loadPlan(planPath);
    scope = scopeFingerprint(workflow.scope, contractPath);
    const add = (code, message, criterion) => diagnostics.push(diagnostic(code, planPath, message, criterion));
    requireValue(typeof expectedScope === "string" && SCOPE_HASH.test(expectedScope), planPath, "expectedScope must be a sha256 fingerprint");
    if (scope !== expectedScope) add("SCOPE_CHANGED", "scope or shared contract differs from retained fingerprint");
    const results = workflow.results;
    requireValue(mapping(results), planPath, "workflow.results must be a mapping");
    const root = resolve(evidenceRoot);
    const realRoot = realpathSync(root);
    requireValue(statSync(root).isDirectory(), planPath, "evidenceRoot must be a directory");
    for (const id of Object.keys(results)) {
      if (!own(workflow.scope.criteria, id)) add("UNKNOWN_CRITERION", "result does not name an original criterion", id);
    }
    let incomplete = false;
    const evidenceCache = new Map();
    for (const [id, criterion] of Object.entries(workflow.scope.criteria)) {
      if (!own(results, id)) {
        add("MISSING_CRITERION", "criterion has no result", id);
        incomplete = true;
        continue;
      }
      const result = results[id];
      keys(result, ["state", "against", "reason", "evidence"], planPath, `result ${id}`);
      requireValue(["pass", "fail", "unknown", "not-run", "blocked"].includes(result.state), planPath, `invalid state for ${id}`);
      if (result.against !== expectedScope) add("RESULT_SCOPE_MISMATCH", "result.against differs from retained fingerprint", id);
      if (result.state !== "pass") {
        requireValue(text(result.reason), planPath, `non-pass result ${id} requires reason`);
        add("INCOMPLETE_RESULT", `${result.state}: ${result.reason}`, id);
        incomplete = true;
        continue;
      }
      keys(result.evidence, ["file", "sha256"], planPath, `result ${id} evidence`);
      requireValue(typeof result.evidence.sha256 === "string" && HASH.test(result.evidence.sha256), planPath, `result ${id} requires lowercase evidence sha256`);
      let path;
      try {
        path = boundedFile(root, realRoot, result.evidence.file);
      } catch (error) {
        add(error.code === "ENOENT" ? "EVIDENCE_MISSING" : "EVIDENCE_PATH", error.message, id);
        continue;
      }
      let artifact;
      try {
        if (!evidenceCache.has(path)) {
          const bytes = readFileSync(path);
          evidenceCache.set(path, { hash: sha256(bytes), bytes });
        }
        artifact = evidenceCache.get(path);
      } catch (error) {
        if (error.code !== "ENOENT") throw error;
        add("EVIDENCE_MISSING", error.message, id);
        continue;
      }
      if (artifact.hash !== result.evidence.sha256) {
        add("EVIDENCE_CHANGED", "evidence bytes do not match declared hash", id);
        continue;
      }
      try {
        const json = JSON.parse(artifact.bytes.toString("utf8"));
        if (select(json, criterion.proof.executed, planPath) !== true) add("UNVERIFIED_PASS", "execution pointer must select boolean true", id);
        if (select(json, criterion.proof.outcome, planPath) !== criterion.proof.equals) add("EVIDENCE_MISMATCH", "outcome does not match the expected scalar and type", id);
      } catch (error) {
        add("EVIDENCE_MISMATCH", error.message, id);
      }
    }
    const invalid = diagnostics.some(({ code }) => !["INCOMPLETE_RESULT", "MISSING_CRITERION"].includes(code));
    return { status: invalid ? "invalid" : incomplete ? "incomplete" : "consistent", scope, diagnostics };
  } catch (error) {
    if (!(error instanceof InvalidContract)) throw error;
    return { status: "invalid", ...(scope ? { scope } : {}), diagnostics: [...diagnostics, ...error.diagnostics] };
  }
}



function cli(args) {
  const [command, ...rest] = args;
  if (command === "fingerprint" && rest.length === 1 && !rest[0].startsWith("-")) return fingerprintPlan({ planPath: rest[0] });
  if (command === "check" && rest.length === 5 && !rest[0].startsWith("-")) {
    const options = new Map();
    for (let index = 1; index < rest.length; index += 2) {
      if (!["--expected-scope", "--evidence-root"].includes(rest[index]) || options.has(rest[index]) || rest[index + 1].startsWith("--")) throw new Error("invalid check options");
      options.set(rest[index], rest[index + 1]);
    }
    if (!SCOPE_HASH.test(options.get("--expected-scope") ?? "")) throw new Error("--expected-scope must be sha256:<64 lowercase hex digits>");
    return checkPlan({ planPath: rest[0], expectedScope: options.get("--expected-scope"), evidenceRoot: options.get("--evidence-root") });
  }
  throw new Error("usage: check-contract.mjs fingerprint PLAN.md | check PLAN.md --expected-scope sha256:... --evidence-root DIR");
}

function invokedDirectly() {
  if (!process.argv[1]) return false;
  try {
    return realpathSync(fileURLToPath(import.meta.url)) === realpathSync(process.argv[1]);
  } catch {
    return false;
  }
}

if (invokedDirectly()) {
  try {
    const result = cli(process.argv.slice(2));
    console.log(JSON.stringify(result));
    process.exitCode = !result.status || result.status === "consistent" ? 0 : 1;
  } catch (error) {
    console.log(JSON.stringify({ status: "invalid", diagnostics: error instanceof InvalidContract ? error.diagnostics : [diagnostic("CLI_OR_IO", process.argv[1], error.message)] }));
    process.exitCode = error instanceof InvalidContract ? 1 : 2;
  }
}
