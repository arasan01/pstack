import { join } from "node:path";

export function systemPromptForPstack({ systemPrompt, pluginRoot }) {
  const mapping = join(pluginRoot, "skills/poteto-mode/references/omp-tools.md");
  return [
    ...systemPrompt,
    `pstack is an optional skill library. When using a pstack skill, read ${mapping} for oh-my-pi's native tool and per-skill equivalents. Native instructions, tool schemas, agent selection, modelRoles, permissions, delegation, and task lifecycle take precedence. Loading this mapping does not invoke a skill or enable automatic routing.`,
  ];
}
