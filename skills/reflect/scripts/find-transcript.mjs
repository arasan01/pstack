#!/usr/bin/env node
// Locate the transcript whose opening user prompt carries a fragment.
//
//   node find-transcript.mjs <transcripts-dir> <opening-prompt-fragment> [workspace]
//
// Prints the newest matching path, or exits 1 with "no transcript". Covers
// OMP's <timestamp>_<id>.jsonl under per-cwd sessions directories.
// OMP sessions open with a session header, optionally preceded by a title slot.
// Each candidate is streamed line by line. Searches compare the session header's
// cwd with the workspace (the current directory by default) before reading
// user messages. OMP sessions branch in place; entries are read to their last
// entry to find the active branch, and the opening prompt is the first user
// message on the path from that leaf to its root.
import { createReadStream, readdirSync, realpathSync, statSync } from "node:fs";
import { isAbsolute, join } from "node:path";
import { fileURLToPath } from "node:url";

// readline also breaks on U+2028 and U+2029, which JSON leaves unescaped.
async function* jsonlLines(stream) {
  let carry = "";
  for await (const chunk of stream) {
    carry += chunk;
    let newline;
    while ((newline = carry.indexOf("\n")) !== -1) {
      const line = carry.slice(0, newline);
      carry = carry.slice(newline + 1);
      yield line.endsWith("\r") ? line.slice(0, -1) : line;
    }
  }
  if (carry) yield carry;
}

// Session cleanup can delete a transcript or its session directory while a
// search runs. Anything under the root that vanishes after it was listed is
// skipped; a missing root still throws.
export function rethrowUnlessRemoved(error) {
  if (error.code !== "ENOENT") throw error;
}

export function candidates(projectsDir, maxDepth = 2) {
  const files = [];
  const walk = (dir, depth) => {
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      const full = join(dir, entry.name);
      if (entry.isFile() && entry.name.endsWith(".jsonl")) files.push(full);
      else if (entry.isDirectory() && depth < maxDepth) {
        try {
          walk(full, depth + 1);
        } catch (error) {
          rethrowUnlessRemoved(error);
        }
      }
    }
  };
  walk(projectsDir, 0);
  return files
    .flatMap((path) => {
      const stat = statSync(path, { throwIfNoEntry: false });
      return stat ? [{ path, mtime: stat.mtimeMs }] : [];
    })
    .sort((a, b) => b.mtime - a.mtime);
}

function text(content) {
  if (typeof content === "string") return content;
  if (Array.isArray(content)) {
    return content
      .filter((block) => typeof block?.text === "string")
      .map((block) => block.text)
      .join("\n");
  }
  return "";
}

const isOmpHeader = (record) =>
  record?.type === "session" && typeof record.cwd === "string";

function matchesWorkspace(cwd, workspace) {
  if (workspace === undefined) return true;
  if (typeof cwd !== "string" || !isAbsolute(cwd)) return false;
  try {
    return realpathSync(cwd) === realpathSync(workspace);
  } catch {
    // A removed or inaccessible workspace cannot identify this session.
    return false;
  }
}

async function* parsed(lines) {
  for await (const line of lines) {
    try {
      yield JSON.parse(line);
    } catch {}
  }
}

async function ompOpening(records) {
  const entries = new Map();
  let leaf = null;
  for await (const record of records) {
    if (typeof record?.id !== "string") continue;
    const isUser = record.type === "message" && record.message?.role === "user";
    entries.set(record.id, { parentId: record.parentId ?? null, prompt: isUser ? text(record.message.content) || null : null });
    leaf = record.id;
  }
  let prompt = null;
  const seen = new Set();
  for (let id = leaf; entries.has(id) && !seen.has(id); id = entries.get(id).parentId) {
    seen.add(id);
    prompt = entries.get(id).prompt ?? prompt;
  }
  return prompt;
}

export async function openingPrompt(path, workspace) {
  const stream = createReadStream(path, { encoding: "utf8" });
  try {
    const records = parsed(jsonlLines(stream));
    let { value: head, done } = await records.next();
    while (head && (head.type === "title" || head.type === "current_title")) {
      ({ value: head, done } = await records.next());
    }
    if (done || !isOmpHeader(head)) return null;
    if (!matchesWorkspace(head.cwd, workspace)) return null;
    return await ompOpening(records);
  } finally {
    stream.destroy();
  }
}

export async function findTranscript(projectsDir, fragment, workspace = process.cwd()) {
  for (const { path } of candidates(projectsDir)) {
    try {
      const prompt = await openingPrompt(path, workspace);
      if (prompt?.includes(fragment)) return path;
    } catch (error) {
      rethrowUnlessRemoved(error);
    }
  }
  return null;
}

async function main(argv) {
  const [projectsDir, fragment, workspace] = argv;
  if (!projectsDir || !fragment || argv.length > 3) {
    console.error("usage: find-transcript.mjs <transcripts-dir> <opening-prompt-fragment> [workspace]");
    return 2;
  }
  const path = await findTranscript(projectsDir, fragment, workspace);
  if (!path) {
    console.error(`no transcript under ${projectsDir} opens with ${JSON.stringify(fragment)}`);
    return 1;
  }
  console.log(path);
  return 0;
}

// node leaves argv[1] unresolved and may set it to a non-file (`node -e ... arg`).
function invokedDirectly() {
  if (!process.argv[1]) return false;
  try {
    return fileURLToPath(import.meta.url) === realpathSync(process.argv[1]);
  } catch {
    return false;
  }
}

if (invokedDirectly()) {
  process.exitCode = await main(process.argv.slice(2));
}
