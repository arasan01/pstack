#!/usr/bin/env node

import { existsSync, readFileSync, readdirSync, realpathSync, statSync, writeFileSync } from "node:fs";
import { dirname, isAbsolute, join, relative, resolve, sep } from "node:path";
import { pathToFileURL } from "node:url";
import { parse as parseYaml } from "yaml";

export const SKIPPED_DIRS = new Set([".git", "node_modules"]);

export function walk(dir) {
  if (!existsSync(dir)) return [];
  const entries = readdirSync(dir, { withFileTypes: true }).sort((a, b) => a.name.localeCompare(b.name));
  return entries.flatMap((entry) => {
    if (SKIPPED_DIRS.has(entry.name)) return [];
    const full = join(dir, entry.name);
    if (entry.isDirectory()) return walk(full);
    return [full];
  });
}

export function markdownFiles(dir) {
  return walk(dir).filter((path) => path.endsWith(".md"));
}

export function pathIsInside(root, path) {
  const rel = relative(root, path);
  return rel === "" || (rel !== ".." && !rel.startsWith(`..${sep}`) && !isAbsolute(rel));
}

export function parseFrontmatter(text) {
  const block = text.match(/^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)/);
  if (!block) return { data: null, body: text };
  return { data: parseYaml(block[1]) ?? {}, body: text.slice(block[0].length) };
}

export function agentSkills(skillsDir) {
  const root = resolve(skillsDir);
  if (!existsSync(root)) throw new Error(`skills directory does not exist: ${root}`);
  const skills = [];

  for (const entry of readdirSync(root).sort()) {
    const skillPath = join(root, entry, "SKILL.md");
    const entryPath = join(root, entry);
    if (!statSync(entryPath).isDirectory() || !existsSync(skillPath)) continue;

    const { data: front } = parseFrontmatter(readFileSync(skillPath, "utf8"));
    if (!front || typeof front !== "object") {
      throw new Error(`${skillPath}: missing or invalid YAML frontmatter`);
    }

    const name = front.name;
    if (name !== entry) {
      throw new Error(`${skillPath}: frontmatter name "${name}" != directory "${entry}"`);
    }
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(name) || name.length > 64) {
      throw new Error(`${skillPath}: frontmatter name "${name}" is not a valid skill name`);
    }

    const description = front.description;
    if (typeof description !== "string" || !description.trim()) {
      throw new Error(`${skillPath}: frontmatter description is missing or empty`);
    }

    for (const key of ["disable-model-invocation", "user-invocable"]) {
      if (key in front) throw new Error(`${skillPath}: contains legacy ${key} key`);
    }
    if ("hide" in front && typeof front.hide !== "boolean") {
      throw new Error(`${skillPath}: hide must be a YAML boolean`);
    }

    const hidden = front.hide === true;
    if (name.startsWith("principle-") && !hidden) {
      throw new Error(`${skillPath}: principle leaves must specify hide: true`);
    }

    skills.push({ name, description, hidden, filePath: skillPath });
  }

  return skills;
}

export function publicSkills(skillsDir) {
  return agentSkills(skillsDir)
    .filter((skill) => !skill.hidden)
    .map(({ name }) => name);
}

function destination(raw) {
  const value = raw.trim();
  if (value.startsWith("<")) {
    const close = value.indexOf(">");
    return close === -1 ? value : value.slice(1, close);
  }

  let out = "";
  for (let i = 0; i < value.length; i += 1) {
    const char = value[i];
    if (/\s/.test(char)) break;
    if (char === "\\" && i + 1 < value.length) {
      out += value[i + 1];
      i += 1;
    } else {
      out += char;
    }
  }
  return out;
}

function markdownTargets(text) {
  const targets = [];
  for (const [, raw] of text.matchAll(/\]\(([^)\n]*)\)/g)) targets.push(destination(raw));
  for (const [, raw] of text.matchAll(/^\s{0,3}\[(?!\^)[^\]\n]+\]:\s*(.+)$/gm)) {
    targets.push(destination(raw));
  }
  return targets.filter(Boolean);
}

export function validateSkillsTree(skillsDir, allowedRoot = null) {
  const root = resolve(skillsDir);
  const boundary = allowedRoot ? resolve(allowedRoot) : root;
  const realBoundary = realpathSync(boundary);
  const problems = [];

  for (const file of markdownFiles(root)) {
    for (const target of markdownTargets(readFileSync(file, "utf8"))) {
      if (target.startsWith("#") || target.startsWith("//")) continue;
      const scheme = target.match(/^([a-z][a-z0-9+.-]*):/i)?.[1]?.toLowerCase();
      if (scheme && scheme !== "file") continue;

      const encodedPath = target.split(/[?#]/, 1)[0];
      if (!encodedPath) continue;
      let path;
      try {
        path = decodeURIComponent(encodedPath);
      } catch {
        problems.push(`${relative(boundary, file)} -> ${target} (invalid URI encoding)`);
        continue;
      }

      const resolved = resolve(dirname(file), path);
      if (scheme === "file" || isAbsolute(path) || !pathIsInside(boundary, resolved)) {
        problems.push(`${relative(boundary, file)} -> ${target} (escapes package boundary)`);
      } else if (!existsSync(resolved)) {
        problems.push(`${relative(boundary, file)} -> ${target} (missing)`);
      } else if (!pathIsInside(realBoundary, realpathSync(resolved))) {
        problems.push(`${relative(boundary, file)} -> ${target} (escapes package boundary through symlink)`);
      }
    }
  }
  if (problems.length) throw new Error(`invalid local markdown links:\n${problems.join("\n")}`);
}

const OBSOLETE_PATH_PATTERNS = [
  /plugins\/pstack/,
  /\.claude-plugin/,
  /\.codex-plugin/,
  /effort-agents/,
  /pstack-models\.md/,
  /copilot-hooks/,
  /codex-hooks/,
];

export function validateProsePaths(skillsDir, repoRoot) {
  const root = resolve(skillsDir);
  const rootDir = repoRoot ? resolve(repoRoot) : dirname(root);
  const problems = [];

  for (const file of markdownFiles(root)) {
    const text = readFileSync(file, "utf8");
    for (const match of text.matchAll(/`([^`\n]+)`/g)) {
      const token = match[1];
      for (const pattern of OBSOLETE_PATH_PATTERNS) {
        if (pattern.test(token)) {
          problems.push(`${relative(rootDir, file)} -> \`${token}\` (references obsolete path or manifest)`);
        }
      }
    }
  }

  if (problems.length) {
    throw new Error(`obsolete path references found:\n${problems.join("\n")}`);
  }
}

const UNSUPPORTED_DISPATCH_PATTERNS = [
  /subagent_type:\s*["']pstack:/,
  /subagent_type:\s*["']general-purpose["']/,
  /run_in_background:\s*true/,
  /pstack-models\.md/,
];

export function validateRuntimeInstructions(skillsDir) {
  const root = resolve(skillsDir);
  const problems = [];

  for (const file of markdownFiles(root)) {
    const text = readFileSync(file, "utf8");
    for (const pattern of UNSUPPORTED_DISPATCH_PATTERNS) {
      if (pattern.test(text)) {
        problems.push(`${relative(root, file)} contains unsupported runtime instruction matching ${pattern}`);
      }
    }
  }

  if (problems.length) {
    throw new Error(`unsupported runtime instructions found in skills:\n${problems.join("\n")}`);
  }
}

export function validateAgentDefinitions(agentsDir) {
  const root = resolve(agentsDir);
  if (!existsSync(root)) return [];

  const agents = [];
  const entries = readdirSync(root).filter((f) => f.endsWith(".md")).sort();
  for (const entry of entries) {
    const agentPath = join(root, entry);
    const { data: front } = parseFrontmatter(readFileSync(agentPath, "utf8"));
    if (!front || typeof front !== "object") {
      throw new Error(`${agentPath}: missing or invalid YAML frontmatter`);
    }

    const expectedName = entry.slice(0, -3);
    if (front.name !== expectedName) {
      throw new Error(`${agentPath}: frontmatter name "${front.name}" != filename "${expectedName}"`);
    }
    if (typeof front.description !== "string" || !front.description.trim()) {
      throw new Error(`${agentPath}: frontmatter description missing or empty`);
    }
    agents.push({ name: front.name, description: front.description, filePath: agentPath });
  }

  return agents;
}

export function validateOmpPackage(repoRoot) {
  const root = resolve(repoRoot);
  const pkgPath = join(root, "package.json");
  if (!existsSync(pkgPath)) {
    throw new Error(`missing package.json at root: ${pkgPath}`);
  }

  let pkg;
  try {
    pkg = JSON.parse(readFileSync(pkgPath, "utf8"));
  } catch (err) {
    throw new Error(`invalid package.json at ${pkgPath}: ${err.message}`);
  }

  if (pkg.name !== "pstack") {
    throw new Error(`package.json name must be "pstack", got "${pkg.name}"`);
  }

  if (!pkg.version || !/^\d+\.\d+\.\d+/.test(pkg.version)) {
    throw new Error(`package.json version "${pkg.version}" is not valid semver`);
  }

  const versionFilePath = join(root, "VERSION");
  if (!existsSync(versionFilePath)) {
    throw new Error(`missing VERSION file at ${versionFilePath}`);
  }

  const versionFile = readFileSync(versionFilePath, "utf8").trim();
  if (versionFile !== pkg.version) {
    throw new Error(`VERSION file ("${versionFile}") does not match package.json version ("${pkg.version}")`);
  }

  if (!pkg.omp || typeof pkg.omp !== "object") {
    throw new Error(`package.json is missing required "omp" manifest field`);
  }

  if (!Array.isArray(pkg.omp.extensions) || pkg.omp.extensions.length === 0) {
    throw new Error(`package.json omp.extensions must list at least one extension entry point`);
  }

  for (const ext of pkg.omp.extensions) {
    const resolved = resolve(root, ext);
    if (!existsSync(resolved)) {
      throw new Error(`declared extension "${ext}" does not exist at ${resolved}`);
    }
    if (!pathIsInside(root, resolved)) {
      throw new Error(`declared extension "${ext}" escapes package root`);
    }
  }

  const skillsDir = join(root, "skills");
  if (!existsSync(skillsDir) || !statSync(skillsDir).isDirectory()) {
    throw new Error(`skills directory does not exist at ${skillsDir}`);
  }

  const forbiddenDirs = ["plugins", ".claude-plugin", ".agents"];
  for (const forbidden of forbiddenDirs) {
    if (existsSync(join(root, forbidden))) {
      throw new Error(`legacy directory ${forbidden} must not exist in canonical OMP package`);
    }
  }

  return pkg;
}

export function validateAll(repoRoot) {
  const root = resolve(repoRoot);
  validateOmpPackage(root);
  const skillsDir = join(root, "skills");
  const skills = agentSkills(skillsDir);
  validateSkillsTree(skillsDir, root);
  validateProsePaths(skillsDir, root);
  validateRuntimeInstructions(skillsDir);
  const agentsDir = join(root, "agents");
  const agents = validateAgentDefinitions(agentsDir);

  return {
    packageRoot: root,
    skillsCount: skills.length,
    publicSkillsCount: skills.filter((skill) => !skill.hidden).length,
    agentsCount: agents.length,
  };
}

export function syncVersion(repoRoot, targetVersion) {
  const root = resolve(repoRoot);
  const pkgPath = join(root, "package.json");
  const versionPath = join(root, "VERSION");

  const v = targetVersion ? targetVersion.trim() : readFileSync(versionPath, "utf8").trim();
  if (!/^\d+\.\d+\.\d+/.test(v)) {
    throw new Error(`invalid semver version: ${v}`);
  }

  writeFileSync(versionPath, `${v}\n`, "utf8");
  const pkg = JSON.parse(readFileSync(pkgPath, "utf8"));
  pkg.version = v;
  writeFileSync(pkgPath, `${JSON.stringify(pkg, null, 2)}\n`, "utf8");
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const args = process.argv.slice(2);
  const targetDir = args[0] && !args[0].startsWith("-") ? args[0] : process.cwd();

  if (args.includes("--sync-version")) {
    const vArg = args.find((a, i) => i > 0 && args[i - 1] === "--sync-version" && !a.startsWith("-"));
    try {
      syncVersion(targetDir, vArg);
      console.log(`ok: version synchronized to ${vArg || readFileSync(join(targetDir, "VERSION"), "utf8").trim()}`);
    } catch (err) {
      console.error(`FAIL: ${err.message}`);
      process.exit(1);
    }
    process.exit(0);
  }

  try {
    const result = validateAll(targetDir);
    console.log(
      `ok: OMP package valid (${result.skillsCount} skills, ${result.publicSkillsCount} public, ${result.agentsCount} agents)`,
    );
  } catch (error) {
    console.error(`FAIL: ${error.message}`);
    process.exit(1);
  }
}
