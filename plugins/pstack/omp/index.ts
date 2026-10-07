import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import type { ExtensionAPI } from "@oh-my-pi/pi-coding-agent";

import { systemPromptForPstack } from "./prompt.mjs";

export default function pstackOmp(omp: ExtensionAPI): void {
  const pluginRoot = join(dirname(fileURLToPath(import.meta.url)), "..");
  omp.on("before_agent_start", (event, ctx) => ({
    systemPrompt: systemPromptForPstack({
      systemPrompt: event.systemPrompt,
      pluginRoot,
      agentDir: omp.pi.getAgentDir(),
      isMain: ctx.agent.kind === "main",
    }),
  }));
}
