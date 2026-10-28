export function systemPromptForPstack({ systemPrompt }) {
  return [...systemPrompt, "pstack supplies OMP-native workflows. When poteto-mode is requested, read its chosen playbook and the helper skills that playbook needs; the user does not have to name every helper. Preserve the request's scope and stopping boundary. Skills describe methods, not agent or model aliases. Use native task/ask/todo, modelRoles and agent settings, permissions, fallback policy and session lifecycle. Loading this package does not start a workflow or authorize extra work."];
}

export function formatPstackReadiness({ currentModel, roles }) {
  const identity = model => model ? `${model.provider}/${model.id}` : "unavailable";
  return [
    `Active selection: ${identity(currentModel)}`,
    ...roles.map(({ role, model }) => `${role}: ${identity(model)}`),
    "These are native model resolutions, not proof of successful inference. Run the real OMP smoke scenarios to qualify a model; a fallback is not success for the requested model.",
  ].join("\n");
}
