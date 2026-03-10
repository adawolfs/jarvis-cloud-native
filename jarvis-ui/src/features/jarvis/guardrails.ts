import type { RealtimeOutputGuardrail } from "@openai/agents/realtime";

export function getJarvisGuardrails(): RealtimeOutputGuardrail[] {
  return [
    {
      name: "No mention of Dom",
      execute: async ({ agentOutput }) => {
        const domInOutput = agentOutput.includes("Dom");
        return {
          tripwireTriggered: domInOutput,
          outputInfo: {
            domInOutput,
          },
        };
      },
    },
  ];
}
