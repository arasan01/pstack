import type { ExtensionAPI } from "@oh-my-pi/pi-coding-agent";
import { formatPstackReadiness, systemPromptForPstack } from "./prompt.mjs";

export default function pstackOmp(omp: ExtensionAPI): void {
  omp.setLabel("pstack");
  omp.registerCommand("pstack", {
    description: "Inspect native pstack model-role availability without changing settings",
    handler: async (_args, ctx) => {
      const roles = ["default", "smol", "slow", "plan", "task", "review"].map(role => ({ role, model: ctx.models.resolve(`@${role}`) }));
      ctx.ui.notify(formatPstackReadiness({ currentModel: ctx.models.current(), roles }), "info");
    },
  });
  omp.on("before_agent_start", event => ({ systemPrompt: systemPromptForPstack({ systemPrompt: event.systemPrompt }) }));
}
