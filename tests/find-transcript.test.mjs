import { afterEach, describe, expect, test } from "bun:test";
import { spawnSync } from "node:child_process";
import { mkdirSync, mkdtempSync, rmSync, symlinkSync, utimesSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { basename, dirname, join } from "node:path";

import { candidates, findTranscript, openingPrompt } from "../skills/reflect/scripts/find-transcript.mjs";
import { removeDuring } from "./remove-during.mjs";

const script = join(import.meta.dir, "../skills/reflect/scripts/find-transcript.mjs");
const noNode = spawnSync("node", ["--version"]).status !== 0;

const ompHeader = (cwd = process.cwd(), id = "s-1") =>
  JSON.stringify({ type: "session", version: 3, id, timestamp: "2026-10-01T00:00:00.000Z", cwd });
const ompEntry = (id, parentId, type, fields = {}) =>
  JSON.stringify({ type, id, parentId, timestamp: "2026-10-01T00:00:01.000Z", ...fields });
const ompMessage = (id, parentId, role, text) =>
  ompEntry(id, parentId, "message", { message: { role, content: [{ type: "text", text }], timestamp: 1 } });
const ompMessageString = (id, parentId, role, text) =>
  ompEntry(id, parentId, "message", { message: { role, content: text, timestamp: 1 } });

const fixtures = [];
afterEach(() => {
  for (const root of fixtures.splice(0)) rmSync(root, { recursive: true, force: true });
});

function tempDir() {
  const dir = mkdtempSync(join(tmpdir(), "reflect-"));
  fixtures.push(dir);
  return dir;
}

function transcript(dir, rel, lines, mtimeSeconds) {
  const path = join(dir, rel);
  mkdirSync(join(path, ".."), { recursive: true });
  writeFileSync(path, `${lines.join("\n")}\n`);
  utimesSync(path, mtimeSeconds, mtimeSeconds);
  return path;
}

describe("find-transcript", () => {
  test("the opening prompt is the first user record on the active branch, not the first line", async () => {
    const dir = tempDir();
    const path = transcript(
      dir,
      "a.jsonl",
      [
        ompHeader(),
        ompMessage("sys", null, "system", "system prompt"),
        ompMessage("u1", "sys", "user", "fix the flaky login test"),
        ompMessage("a1", "u1", "assistant", "ok"),
      ],
      100,
    );
    expect(await openingPrompt(path)).toBe("fix the flaky login test");
  });

  test("string content and multi-block content both yield the prompt text", async () => {
    const dir = tempDir();
    const plain = transcript(dir, "plain.jsonl", [ompHeader(), ompMessageString("u1", null, "user", "plain prompt")], 100);
    const blocks = transcript(
      dir,
      "blocks.jsonl",
      [
        ompHeader(),
        ompEntry("u1", null, "message", {
          message: {
            role: "user",
            content: [{ type: "text", text: "<reminder/>" }, { type: "text", text: "real prompt" }],
          },
        }),
      ],
      100,
    );
    expect(await openingPrompt(plain)).toBe("plain prompt");
    expect(await openingPrompt(blocks)).toContain("real prompt");
  });

  test("a transcript with no user record has no opening prompt", async () => {
    const dir = tempDir();
    const path = transcript(dir, "meta-only.jsonl", [ompHeader(), ompEntry("m1", null, "model_change", {})], 100);
    expect(await openingPrompt(path)).toBeNull();
  });

  test("candidates cover flat, nested, and subagent layouts, newest first", () => {
    const dir = tempDir();
    const flat = transcript(dir, "flat.jsonl", [ompHeader()], 100);
    const nested = transcript(dir, "n1/n1.jsonl", [ompHeader()], 300);
    const sub = transcript(dir, "n1/subagents/child.jsonl", [ompHeader()], 200);
    writeFileSync(join(dir, "notes.txt"), "not a transcript");
    expect(candidates(dir).map(({ path }) => path)).toEqual([nested, sub, flat]);
  });

  test("findTranscript returns the newest transcript whose opening prompt carries the fragment", async () => {
    const dir = tempDir();
    transcript(dir, "old.jsonl", [ompHeader(), ompMessage("u1", null, "user", "review issue 59")], 100);
    const newer = transcript(
      dir,
      "new/new.jsonl",
      [ompHeader(), ompMessage("u2", null, "user", "review issue 59 and related points")],
      200,
    );
    transcript(dir, "other.jsonl", [ompHeader(), ompMessage("u3", null, "user", "unrelated")], 300);
    expect(await findTranscript(dir, "issue 59")).toBe(newer);
    expect(await findTranscript(dir, "nothing matches this")).toBeNull();
  });

  test("a transcript deleted after enumeration does not abort the scan", async () => {
    const dir = tempDir();
    transcript(dir, "newest.jsonl", [ompHeader(), ompMessage("u1", null, "user", "unrelated prompt")], 300);
    const removed = transcript(dir, "removed.jsonl", [ompHeader(), ompMessage("u2", null, "user", "another prompt")], 200);
    const older = transcript(dir, "older.jsonl", [ompHeader(), ompMessage("u3", null, "user", "resume the audit")], 100);
    const search = findTranscript(dir, "resume the audit");
    rmSync(removed);
    expect(await search).toBe(older);
  });

  test.skipIf(noNode)(
    "a session directory or transcript removed while the tree is listed is skipped (skipped without node)",
    () => {
      const dir = tempDir();
      const kept = transcript(dir, "kept.jsonl", [ompHeader()], 100);
      const flat = transcript(dir, "flat.jsonl", [ompHeader()], 200);
      transcript(dir, "s1/s1.jsonl", [ompHeader()], 300);
      const body = `const { candidates } = await import(${JSON.stringify(script)});
        console.log(JSON.stringify(candidates(${JSON.stringify(dir)}).map(({ path }) => path)));`;
      const run = removeDuring("readdirSync", dir, [join(dir, "s1"), flat], body);
      expect(run.stderr).toBe("");
      expect(JSON.parse(run.stdout)).toEqual([kept]);
    },
  );

  test("other candidate read errors still propagate", async () => {
    const dir = tempDir();
    transcript(dir, "newest.jsonl", [ompHeader(), ompMessage("u1", null, "user", "unrelated prompt")], 300);
    const changed = transcript(dir, "changed.jsonl", [ompHeader()], 200);
    const search = findTranscript(dir, "audit");
    rmSync(changed);
    mkdirSync(changed);
    await expect(search).rejects.toMatchObject({ code: "EISDIR" });
  });

  test("a missing project directory still reports the filesystem error", async () => {
    await expect(findTranscript(join(tempDir(), "missing"), "audit")).rejects.toMatchObject({ code: "ENOENT" });
  });

  test("a truncated trailing line does not abort the scan", async () => {
    const dir = tempDir();
    const live = join(dir, "live.jsonl");
    writeFileSync(live, `${ompHeader()}\n{"type":"us`);
    utimesSync(live, 200, 200);
    const older = transcript(dir, "older.jsonl", [ompHeader(), ompMessage("u1", null, "user", "resume the audit")], 100);
    expect(await openingPrompt(live)).toBeNull();
    expect(await findTranscript(dir, "resume the audit")).toBe(older);
  });

  test("an OMP session's opening prompt is the first user message on the branch that ends at the last entry", async () => {
    const dir = tempDir();
    const path = transcript(
      dir,
      "-work-repo/2026-10-01T00-00-00-000Z_s-1.jsonl",
      [
        ompHeader(),
        ompMessage("sys", null, "system", "You are an agent."),
        ompMessage("u1", "sys", "user", "abandoned opening"),
        ompMessage("a1", "u1", "assistant", "ok"),
        ompEntry("sum", "sys", "branch_summary", { fromId: "a1", summary: "tried A" }),
        ompMessage("u2", "sum", "user", "ship the release lanes"),
        ompMessage("a2", "u2", "assistant", "on it"),
        ompMessage("t2", "a2", "toolResult", "done"),
        ompMessage("u3", "t2", "user", "a later prompt"),
      ],
      100,
    );
    expect(await openingPrompt(path)).toBe("ship the release lanes");
  });

  test("an OMP session whose leaf is on the first branch keeps that branch's opening", async () => {
    const dir = tempDir();
    const path = transcript(
      dir,
      "-work-repo/s.jsonl",
      [
        ompHeader(),
        ompMessage("u1", null, "user", "first branch opening"),
        ompMessage("a1", "u1", "assistant", "ok"),
        ompMessage("u2", null, "user", "second root opening"),
        ompEntry("c1", "a1", "custom", { customType: "pstack-agents", data: {} }),
      ],
      100,
    );
    expect(await openingPrompt(path)).toBe("first branch opening");
  });

  test("a raw U+2028 or U+2029 inside a record does not split it", async () => {
    const dir = tempDir();
    const p1 = transcript(
      dir,
      "-work-repo/s1.jsonl",
      [ompHeader(), ompMessage("u1", null, "user", "fix the parser\u2028please"), ompMessage("u2", "u1", "user", "a later prompt")],
      100,
    );
    const p2 = transcript(
      dir,
      "-work-repo/s2.jsonl",
      [ompHeader(), ompMessage("u1", null, "user", "ship the release"), ompMessage("a1", "u1", "assistant", "line\u2029break"), ompMessage("u2", "a1", "user", "a later prompt")],
      100,
    );
    expect(await openingPrompt(p1)).toBe("fix the parser\u2028please");
    expect(await openingPrompt(p2)).toBe("ship the release");
  });

  test("an OMP session with no user message on its active branch has no opening prompt", async () => {
    const dir = tempDir();
    const path = transcript(
      dir,
      "-work-repo/s.jsonl",
      [ompHeader(), ompMessage("u1", null, "user", "dead"), ompEntry("m", null, "model_change", { provider: "p", modelId: "m" })],
      100,
    );
    expect(await openingPrompt(path)).toBeNull();
  });

  test.each([true, false])("OMP selects the active branch with a title slot present: %s", async (withTitle) => {
    const dir = tempDir();
    const workspace = join(dir, "work");
    const unrelated = join(dir, "private");
    mkdirSync(workspace);
    mkdirSync(unrelated);
    const header = (cwd) => JSON.stringify({ type: "session", version: 3, id: "omp-session", cwd });
    const title = withTitle ? [JSON.stringify({ type: "title", v: 1, title: "Cached title", source: "auto", pad: " " })] : [];
    const sessions = join(dir, ".omp", "agent", "sessions");
    const current = transcript(sessions, "-work/current.jsonl", [
      ...title,
      header(workspace),
      ompMessage("u1", null, "user", "abandoned opening"),
      ompMessage("a1", "u1", "assistant", "ok"),
      ompEntry("summary", null, "branch_summary", { fromId: "a1", summary: "tried A" }),
      ompMessage("u2", "summary", "user", "ship the OMP release"),
      ompMessage("a2", "u2", "assistant", "on it"),
      ompEntry("title", "a2", "title_change", { title: "New title" }),
    ], 100);
    transcript(sessions, "-private/newer.jsonl", [
      ...title, header(unrelated), ompMessage("private", null, "user", "ship the OMP release"),
    ], 200);
    expect(await findTranscript(sessions, "OMP release", workspace)).toBe(current);
    expect(await findTranscript(sessions, "abandoned opening", workspace)).toBeNull();
    expect(await openingPrompt(current, join(dir, "deleted"))).toBeNull();
  });

  test("OMP session selection respects the workspace header", async () => {
    const dir = tempDir();
    const workspace = join(dir, "work");
    mkdirSync(workspace);
    const current = transcript(dir, "-work/current.jsonl", [
      JSON.stringify({ type: "session", version: 3, cwd: workspace }),
      ompMessage("u1", null, "user", "review on OMP"),
    ], 100);
    transcript(dir, "-other/newer.jsonl", [ompHeader(), ompMessage("u2", null, "user", "review on OMP")], 200);
    expect(await findTranscript(dir, "review on OMP", workspace)).toBe(current);
  });

  test.skipIf(noNode)("the CLI scopes OMP sessions to its current or explicit workspace", () => {
    const dir = tempDir();
    const workspace = join(dir, "work");
    const unrelated = join(dir, "private");
    mkdirSync(workspace);
    mkdirSync(unrelated);
    const sessions = join(dir, ".omp", "agent", "sessions");
    const records = (cwd) => [
      JSON.stringify({ type: "title", v: 1, title: "OMP release", pad: " " }),
      JSON.stringify({ type: "session", version: 3, cwd }),
      ompMessage("u1", null, "user", "ship the OMP release"),
    ];
    const current = transcript(sessions, "-work/current.jsonl", records(workspace), 100);
    transcript(sessions, "-private/newer.jsonl", records(unrelated), 200);
    for (const [cwd, args] of [[workspace, []], [unrelated, [workspace]]]) {
      const run = spawnSync("node", [script, sessions, "OMP release", ...args], { cwd, encoding: "utf8" });
      expect(run.status).toBe(0);
      expect(run.stdout.trim()).toBe(current);
    }
  });

  test("the CLI prints the path and exits 1 when nothing matches", () => {
    const dir = tempDir();
    const path = transcript(dir, "-work/s.jsonl", [ompHeader(), ompMessage("u1", null, "user", "ship the release")], 100);
    const hit = spawnSync("node", [script, dir, "ship the"], { encoding: "utf8" });
    expect(hit.status).toBe(0);
    expect(hit.stdout.trim()).toBe(path);
    const miss = spawnSync("node", [script, dir, "absent"], { encoding: "utf8" });
    expect(miss.status).toBe(1);
    expect(miss.stderr).toContain("no transcript");
  });

  test.skipIf(noNode)(
    "the CLI runs under node through a symlinked path (skipped without node)",
    () => {
      const dir = tempDir();
      const path = transcript(dir, "-work/s.jsonl", [ompHeader(), ompMessage("u1", null, "user", "ship the release")], 100);
      symlinkSync(dirname(script), join(dir, "link"));
      const linked = join(dir, "link", basename(script));
      const hit = spawnSync("node", [linked, dir, "ship the"], { encoding: "utf8" });
      expect(hit.status).toBe(0);
      expect(hit.stdout.trim()).toBe(path);
      const miss = spawnSync("node", [linked, dir, "absent"], { encoding: "utf8" });
      expect(miss.status).toBe(1);
      expect(miss.stderr).toContain("no transcript");
    },
  );

  test.skipIf(noNode)(
    "imports under node when argv[1] is not a file (skipped without node)",
    () => {
      const run = spawnSync(
        "node",
        ["-e", `import(${JSON.stringify(script)}).then((m) => console.log(typeof m.findTranscript))`, "not-a-file"],
        { encoding: "utf8" },
      );
      expect(run.stderr).toBe("");
      expect(run.stdout.trim()).toBe("function");
    },
  );
});
