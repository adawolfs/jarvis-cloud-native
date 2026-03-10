"use client";
import {
  RealtimeItem,
  OutputGuardrailTripwireTriggered,
  TransportEvent,
} from "@openai/agents/realtime";
import { History } from "@/components/History";
import { Button } from "@/components/ui/Button";
import { useEffect, useState } from "react";

export type AppProps = {
  title?: string;
  isConnected: boolean;
  isMuted: boolean;
  toggleMute: () => void;
  history?: RealtimeItem[];
  outputGuardrailResult?: OutputGuardrailTripwireTriggered<any> | null;
  events: TransportEvent[];
  mcpTools?: string[];
};

export function App({
  title = "J.A.R.V.I.S",
  isConnected,
  isMuted,
  toggleMute,
  history,
  outputGuardrailResult,
}: AppProps) {
  // Avoid hydration mismatches when layout changes between server and client
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  return (
    <div className="flex min-h-dvh justify-center px-3 sm:px-6">
      <div className="flex w-full max-w-6xl flex-1 flex-col gap-4 py-4 md:py-6">
        <header className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <h1 className="text-2xl font-bold sm:text-3xl">{title}</h1>
          <div className="flex flex-wrap gap-2">
            {isConnected && (
              <Button
                onClick={toggleMute}
                variant={isMuted ? "primary" : "outline"}
              >
                {isMuted ? "Unmute" : "Mute"}
              </Button>
            )}
          </div>
        </header>
        <div className="flex flex-1 min-h-0 flex-col gap-6 md:flex-row">
          <div className="flex min-h-0 flex-1 overflow-hidden">
            {history ? (
              <History history={history} />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-center text-gray-500">
                No history available
              </div>
            )}
          </div>
          <div className="flex w-full flex-none flex-col gap-4 md:w-72 lg:w-80">
            {outputGuardrailResult && (
              <div className="w-full rounded-md border border-blue-300 bg-blue-50 p-3 text-xs text-blue-900 shadow-xs">
                <span className="font-semibold">Guardrail:</span>{" "}
                {outputGuardrailResult?.message ||
                  JSON.stringify(outputGuardrailResult)}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
