import { afterEach, describe, expect, test } from "bun:test";
import { createHash } from "node:crypto";
import { mkdirSync, mkdtempSync, readFileSync, rmSync, symlinkSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { stringify } from "yaml";
import { checkPlan, fingerprintPlan, validateWorkflowReferences } from "../tools/check-contract.mjs";

const cli = fileURLToPath(new URL("../tools/check-contract.mjs", import.meta.url));
const contractRelative = "skills/poteto-mode/references/workflow-contract.md";
const roots = [];
const hash = (bytes) => createHash("sha256").update(bytes).digest("hex");
const document = (front, body = "A consumer's retained plan.\n") => `---\n${stringify(front)}---\n${body}`;

afterEach(() => {
  for (const root of roots.splice(0)) rmSync(root, { recursive: true, force: true });
});

function temporaryRoot() {
  const root = mkdtempSync(join(tmpdir(), "pstack-contract-"));
  roots.push(root);
  return root;
}

function fixture() {
  const root = temporaryRoot();
  const planPath = join(root, "PLAN.md");
  const evidenceRoot = join(root, "evidence");
  mkdirSync(evidenceRoot);
  const artifactPath = join(evidenceRoot, "journeys.json");
  const artifact = { run: { executed: true }, checks: { combinedSeconds: 179, relogin: true } };
  const scope = {
    contract: "pstack-workflow/v1",
    owner: "Main",
    stop: "implementation-without-pr",
    source: { uri: "conversation:human-17", speaker: "user", quote: "全Journeyを合計180秒以内で完了し、再ログインも確認する" },
    criteria: {
      combined: { text: "全Journeyの合計が180秒以内", proof: { executed: "/run/executed", outcome: "/checks/combinedSeconds", equals: 179 } },
      relogin: { text: "再ログインが成功する", proof: { executed: "/run/executed", outcome: "/checks/relogin", equals: true } },
    },
  };
  const front = { title: "Consumer plan", workflow: { version: 1, scope, results: {} } };
  const save = (body) => writeFileSync(planPath, document(front, body));
  const saveArtifact = () => writeFileSync(artifactPath, JSON.stringify(artifact));
  save();
  saveArtifact();
  const expectedScope = fingerprintPlan({ planPath }).scope;
  const retainEvidence = () => {
    for (const id of Object.keys(scope.criteria)) {
      front.workflow.results[id] = { state: "pass", against: expectedScope, evidence: { file: "journeys.json", sha256: hash(readFileSync(artifactPath)) } };
    }
  };
  retainEvidence();
  save();
  return { root, planPath, evidenceRoot, artifactPath, artifact, front, scope, save, saveArtifact, retainEvidence, expectedScope,
    check: (options = {}) => checkPlan({ planPath, evidenceRoot, expectedScope, ...options }) };
}

function codes(report) {
  return report.diagnostics.map(({ code }) => code);
}

function runCli(...args) {
  const process = spawnSync("node", [cli, ...args], { encoding: "utf8" });
  if (process.error) throw process.error;
  return { exit: process.status, report: JSON.parse(process.stdout), stderr: process.stderr };
}

function packageFixture() {
  const root = temporaryRoot();
  const contractPath = join(root, contractRelative);
  const file = "skills/example/SKILL.md";
  mkdirSync(dirname(contractPath), { recursive: true });
  mkdirSync(dirname(join(root, file)), { recursive: true });
  const contract = { version: 1, roles: { owner: "Own integration", contributor: "Return assigned output" }, bindings: { example: { file, modes: { direct: "owner", delegated: "contributor" } } } };
  const save = () => writeFileSync(contractPath, document(contract, "Shared responsibilities.\n"));
  const reference = (value = "../poteto-mode/references/workflow-contract.md#example", path = join(root, file)) => writeFileSync(path, document({ "workflow-contract": value }));
  save();
  reference();
  return { root, contractPath, contract, file, save, reference, check: () => validateWorkflowReferences({ repoRoot: root }) };
}

describe("retained scope and actual artifact evidence", () => {
  test("complete actual JSON artifacts agree with the retained fingerprint", () => {
    const f = fixture();
    expect(f.check()).toEqual({ status: "consistent", scope: f.expectedScope, diagnostics: [] });
  });

  test("results, other metadata, body and mapping order do not change scope", () => {
    const f = fixture();
    f.front.workflow.results = {};
    f.front.title = "Edited heading";
    f.front.workflow.scope = Object.fromEntries(Object.entries(f.scope).reverse());
    f.save("Entirely different explanatory prose.\n");
    expect(fingerprintPlan({ planPath: f.planPath }).scope).toBe(f.expectedScope);
  });

  test("removing the required re-login criterion invalidates existing approval", () => {
    const f = fixture();
    delete f.scope.criteria.relogin;
    delete f.front.workflow.results.relogin;
    f.save();
    expect(codes(f.check())).toContain("SCOPE_CHANGED");
    expect(f.check().status).toBe("invalid");
  });

  test("relaxing the whole-run limit to individual journey limits changes scope", () => {
    const f = fixture();
    f.scope.criteria.combined.text = "各Journeyが180秒以内";
    f.scope.criteria.combined.proof.outcome = "/checks/eachJourneySeconds";
    f.artifact.checks.eachJourneySeconds = 179;
    f.saveArtifact();
    f.retainEvidence();
    f.save();
    expect(codes(f.check())).toContain("SCOPE_CHANGED");
  });

  for (const [name, mutate] of [
    ["owner", (scope) => { scope.owner = "Other"; }],
    ["stop", (scope) => { scope.stop = "open-pr"; }],
    ["source uri", (scope) => { scope.source.uri = "conversation:other"; }],
    ["source quote", (scope) => { scope.source.quote = "緩和した別の依頼"; }],
    ["proof execution pointer", (scope) => { scope.criteria.combined.proof.executed = "/other"; }],
    ["expected scalar", (scope) => { scope.criteria.combined.proof.equals = 180; }],
  ]) test(`${name} is part of the retained fingerprint`, () => {
    const f = fixture();
    mutate(f.scope);
    f.save();
    expect(codes(f.check())).toContain("SCOPE_CHANGED");
  });

  test("actual contract bytes are fingerprinted, not just frontmatter", () => {
    const f = fixture();
    const contractPath = join(f.root, "contract.md");
    writeFileSync(contractPath, "one shared rule\n");
    const first = fingerprintPlan({ planPath: f.planPath, contractPath }).scope;
    writeFileSync(contractPath, "one changed shared rule\n");
    expect(fingerprintPlan({ planPath: f.planPath, contractPath }).scope).not.toBe(first);
  });

  test("extra results and missing results cannot pass", () => {
    const f = fixture();
    f.front.workflow.results.extra = structuredClone(f.front.workflow.results.combined);
    f.save();
    expect(codes(f.check())).toContain("UNKNOWN_CRITERION");
    delete f.front.workflow.results.extra;
    delete f.front.workflow.results.relogin;
    f.save();
    expect(f.check().status).toBe("incomplete");
    expect(codes(f.check())).toEqual(["MISSING_CRITERION"]);
  });

  for (const state of ["unknown", "blocked", "not-run", "fail"]) test(`${state} remains incomplete despite a valid artifact`, () => {
    const f = fixture();
    f.front.workflow.results.relogin.state = state;
    f.front.workflow.results.relogin.reason = "実行結果は未確定";
    f.save();
    expect(f.check().status).toBe("incomplete");
    expect(codes(f.check())).toEqual(["INCOMPLETE_RESULT"]);
  });

  test("every result requires the retained against fingerprint", () => {
    const f = fixture();
    delete f.front.workflow.results.relogin.against;
    f.save();
    expect(codes(f.check())).toContain("RESULT_SCOPE_MISMATCH");
  });

  test("changed and missing artifact bytes do not pass", () => {
    const f = fixture();
    writeFileSync(f.artifactPath, "{}");
    expect(codes(f.check())).toContain("EVIDENCE_CHANGED");
    rmSync(f.artifactPath);
    expect(codes(f.check())).toContain("EVIDENCE_MISSING");
  });

  for (const executed of [false, "true", 1, null]) test(`execution must be boolean true, not ${JSON.stringify(executed)}`, () => {
    const f = fixture();
    f.artifact.run.executed = executed;
    f.saveArtifact();
    f.retainEvidence();
    f.save();
    expect(codes(f.check())).toContain("UNVERIFIED_PASS");
    expect(f.check().status).toBe("invalid");
  });

  for (const wrongValue of ["179", 178, null, true]) test(`expected scalar preserves type and value: ${JSON.stringify(wrongValue)}`, () => {
    const f = fixture();
    f.artifact.checks.combinedSeconds = wrongValue;
    f.saveArtifact();
    f.retainEvidence();
    f.save();
    expect(codes(f.check())).toContain("EVIDENCE_MISMATCH");
  });

  test("JSON Pointer decodes slash and tilde and rejects missing properties", () => {
    const f = fixture();
    f.scope.criteria.relogin.proof.outcome = "/checks/a~1b~0c";
    f.artifact.checks["a/b~c"] = true;
    f.saveArtifact();
    f.save();
    const expectedScope = fingerprintPlan({ planPath: f.planPath }).scope;
    for (const result of Object.values(f.front.workflow.results)) {
      result.against = expectedScope;
      result.evidence.sha256 = hash(readFileSync(f.artifactPath));
    }
    f.save();
    expect(f.check({ expectedScope }).status).toBe("consistent");
    delete f.artifact.checks["a/b~c"];
    f.saveArtifact();
    for (const result of Object.values(f.front.workflow.results)) result.evidence.sha256 = hash(readFileSync(f.artifactPath));
    f.save();
    expect(codes(f.check({ expectedScope }))).toContain("EVIDENCE_MISMATCH");
  });

  for (const pointer of ["/bad~2escape", "/trailing~", "not/a/pointer"]) test(`invalid pointer is rejected: ${pointer}`, () => {
    const f = fixture();
    f.scope.criteria.relogin.proof.outcome = pointer;
    f.save();
    expect(f.check().status).toBe("invalid");
    expect(codes(f.check())).toContain("INVALID_SCHEMA");
  });

  test("absolute, parent and external symlink evidence paths are rejected", () => {
    const f = fixture();
    const outside = join(f.root, "outside.json");
    writeFileSync(outside, readFileSync(f.artifactPath));
    symlinkSync(outside, join(f.evidenceRoot, "external.json"));
    for (const file of [outside, "../outside.json", "external.json"]) {
      f.front.workflow.results.relogin.evidence.file = file;
      f.save();
      expect(codes(f.check())).toContain("EVIDENCE_PATH");
    }
  });

  test("duplicate YAML keys, aliases, unknown keys and unknown versions fail closed", () => {
    const f = fixture();
    f.front.workflow.scope.extra = "unrecognized requirement";
    f.save();
    expect(f.check().status).toBe("invalid");
    delete f.front.workflow.scope.extra;
    f.front.workflow.version = 2;
    f.save();
    expect(f.check().status).toBe("invalid");
    writeFileSync(f.planPath, "---\nworkflow: {}\nworkflow: {}\n---\n");
    expect(codes(f.check())).toContain("INVALID_YAML");
    writeFileSync(f.planPath, "---\nfirst: &first {}\nworkflow: *first\n---\n");
    expect(codes(f.check())).toContain("INVALID_SCHEMA");
  });
});

describe("bidirectional package bindings", () => {
  test("registered references agree and unregistered third-party Markdown needs no metadata", () => {
    const f = packageFixture();
    writeFileSync(join(f.root, "third-party.md"), "# Unregistered vendor instructions\n");
    expect(f.check()).toEqual([]);
  });

  test("quoted YAML contract keys cannot hide an unregistered binding", () => {
    const f = packageFixture();
    const extra = join(f.root, "extra.md");
    writeFileSync(extra, '---\n"workflow-contract": missing.md#absent\n---\n');
    expect(f.check()).toContainEqual(expect.objectContaining({ code: "INVALID_REFERENCE", file: extra }));
  });

  test("aliased YAML contract keys cannot hide an unregistered binding", () => {
    const f = packageFixture();
    const extra = join(f.root, "extra.md");
    writeFileSync(extra, "---\ndeclaration-key: &key workflow-contract\n*key : missing.md#absent\n---\n");
    expect(f.check()).toContainEqual(expect.objectContaining({ code: "INVALID_REFERENCE", file: extra }));
  });

  test("YAML merged contract metadata cannot hide an unregistered binding", () => {
    const f = packageFixture();
    const extra = join(f.root, "extra.md");
    writeFileSync(extra, "---\n!!merge <<: {workflow-contract: missing.md#absent}\n---\n");
    expect(f.check()).toContainEqual(expect.objectContaining({ code: "INVALID_REFERENCE", file: extra }));
  });

  test("unrelated YAML aliases remain outside contract validation", () => {
    const f = packageFixture();
    writeFileSync(join(f.root, "vendor.md"), "---\nfirst: &first vendor\n*first : kept\n---\nVendor notes.\n");
    expect(f.check()).toEqual([]);
  });

  test("unknown roles and invalid mode names are rejected", () => {
    const f = packageFixture();
    f.contract.bindings.example.modes.delegated = "not-defined";
    f.contract.bindings.example.modes.automatic = "owner";
    f.save();
    expect(f.check().filter(({ code }) => code === "INVALID_ROLE")).toHaveLength(2);
  });

  test("missing metadata and unknown bindings fail", () => {
    const f = packageFixture();
    writeFileSync(join(f.root, f.file), document({ name: "example" }));
    expect(f.check().map(({ code }) => code)).toContain("INVALID_REFERENCE");
    f.reference("../poteto-mode/references/workflow-contract.md#absent");
    expect(f.check().map(({ code }) => code)).toContain("INVALID_REFERENCE");
  });

  test("metadata cannot claim a binding assigned to another file", () => {
    const f = packageFixture();
    const other = join(f.root, "skills/example/other.md");
    f.reference(undefined, other);
    expect(f.check().filter(({ code }) => code === "INVALID_REFERENCE").map(({ file }) => file)).toContain(other);
  });

  test("a different contract document is not accepted", () => {
    const f = packageFixture();
    writeFileSync(join(f.root, "skills/example/other.md"), document(f.contract));
    f.reference("other.md#example");
    expect(f.check().map(({ code }) => code)).toContain("INVALID_REFERENCE");
  });

  test("duplicate binding files, including symlink aliases, fail", () => {
    const f = packageFixture();
    const alias = "skills/example/alias.md";
    symlinkSync(join(f.root, f.file), join(f.root, alias));
    f.contract.bindings.second = { file: alias, modes: { delegated: "contributor" } };
    f.save();
    expect(f.check().map(({ code }) => code)).toContain("DUPLICATE_FILE");
  });

  test("binding and metadata paths cannot escape the package", () => {
    const f = packageFixture();
    const outside = temporaryRoot();
    const external = join(outside, "external.md");
    writeFileSync(external, "# External\n");
    symlinkSync(external, join(f.root, "escape.md"));
    for (const file of [external, "../escape.md", "escape.md"]) {
      f.contract.bindings.example.file = file;
      f.save();
      expect(f.check().map(({ code }) => code)).toContain("INVALID_BINDING_PATH");
    }
    f.contract.bindings.example.file = f.file;
    f.save();
    f.reference(`${external}#example`);
    expect(f.check().map(({ code }) => code)).toContain("INVALID_REFERENCE");
  });

  test("unsupported contract versions are invalid", () => {
    const f = packageFixture();
    f.contract.version = 99;
    f.save();
    expect(f.check().map(({ code }) => code)).toContain("INVALID_SCHEMA");
  });
});

describe("real CLI consumers", () => {
  test("fingerprint then check succeeds with retained actual artifacts", () => {
    const f = fixture();
    const fingerprint = runCli("fingerprint", f.planPath);
    expect(fingerprint.exit).toBe(0);
    expect(fingerprint.report.scope).toBe(f.expectedScope);
    const checked = runCli("check", f.planPath, "--expected-scope", fingerprint.report.scope, "--evidence-root", f.evidenceRoot);
    expect(checked.exit).toBe(0);
    expect(checked.report.status).toBe("consistent");
  });

  test("scope modification and evidence inconsistency each exit 1", () => {
    const f = fixture();
    const args = ["check", f.planPath, "--expected-scope", f.expectedScope, "--evidence-root", f.evidenceRoot];
    f.scope.criteria.combined.text = "各Journeyだけが制限内";
    f.save();
    const changed = runCli(...args);
    expect(changed.exit).toBe(1);
    expect(codes(changed.report)).toContain("SCOPE_CHANGED");
    f.scope.criteria.combined.text = "全Journeyの合計が180秒以内";
    f.save();
    writeFileSync(f.artifactPath, "{}");
    const evidence = runCli(...args);
    expect(evidence.exit).toBe(1);
    expect(codes(evidence.report)).toContain("EVIDENCE_CHANGED");
  });

  test("package command validates real references", () => {
    const f = packageFixture();
    expect(runCli("package", f.root).exit).toBe(0);
    f.reference("../poteto-mode/references/workflow-contract.md#missing");
    const result = runCli("package", f.root);
    expect(result.exit).toBe(1);
    expect(result.report.status).toBe("invalid");
  });

  test("symlinked file and directory entrypoints return contract JSON", () => {
    const f = packageFixture();
    const aliases = temporaryRoot();
    const fileAlias = join(aliases, "check-contract.mjs");
    const directoryAlias = join(aliases, "tools");
    symlinkSync(cli, fileAlias);
    symlinkSync(dirname(cli), directoryAlias, "dir");
    for (const entry of [fileAlias, join(directoryAlias, "check-contract.mjs")]) {
      const result = spawnSync("node", [entry, "package", f.root], { encoding: "utf8" });
      if (result.error) throw result.error;
      expect(result.status).toBe(0);
      const report = result.stdout.trim() ? JSON.parse(result.stdout) : null;
      expect(report).toEqual({ status: "consistent", diagnostics: [] });
    }
  });

  test("malformed CLI arguments and unreadable input exit 2 with JSON", () => {
    expect(runCli("check", "PLAN.md").exit).toBe(2);
    const root = temporaryRoot();
    const missing = runCli("fingerprint", join(root, "missing.md"));
    expect(missing.exit).toBe(2);
    expect(codes(missing.report)).toEqual(["CLI_OR_IO"]);
  });
});
