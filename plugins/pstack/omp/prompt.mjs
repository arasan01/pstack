import { readFileSync } from "node:fs";
import { join } from "node:path";

export function systemPromptForPstack({ systemPrompt, pluginRoot, agentDir, isMain }) {
  const mapping = join(pluginRoot, "skills/poteto-mode/references/omp-tools.md");
  const sections = [
    ...systemPrompt,
    `pstack skills use Claude Code vocabulary. Before following any pstack skill, read ${mapping} for oh-my-pi's native tool, model, and per-skill equivalents. Runtime tool schemas and user instructions take precedence. The active pstack model sheet is ${join(agentDir, "pstack-models.md")}.`,
  ];
  let sheet;
  try {
    const bytes = readFileSync(join(agentDir, "pstack-models.md"));
    sheet = bytes.toString(bytes[0] === 0xff && bytes[1] === 0xfe ? "utf16le" : "utf8").replace(/^\uFEFF/, "");
  } catch (error) {
    if (error.code !== "ENOENT") throw error;
  }
  if (sheet !== undefined) sections.push(`pstack model configuration for this runtime:\n${sheet}`);
  const hookOff = sheet?.split(/\r?\n/).some((line) => line.trim() === "session hook: off");
  if (isMain && !hookOff) {
    sections.push(readFileSync(join(pluginRoot, "hooks/session-start-context.md"), "utf8"));
  }
  return sections;
}
