"use client";
import {
  RealtimeItem,
  OutputGuardrailTripwireTriggered,
} from "@openai/agents/realtime";
import { History } from "@/components/History";
import { JarvisParticleCore } from "@/components/jarvis/JarvisParticleCore";
import { Button } from "@/components/ui/Button";
import { useEffect, useState } from "react";
import type { JarvisVoiceMode } from "@/features/jarvis/voice-mode";

export type AppProps = {
  title?: string;
  isConnected: boolean;
  isMuted: boolean;
  voiceMode: JarvisVoiceMode;
  voiceEnergy: number;
  toggleMute: () => void | Promise<void>;
  history?: RealtimeItem[];
  outputGuardrailResult?: OutputGuardrailTripwireTriggered<any> | null;
};

export function App({
  title = "J.A.R.V.I.S",
  isConnected,
  isMuted,
  voiceMode,
  voiceEnergy,
  toggleMute,
  history,
  outputGuardrailResult,
}: AppProps) {
  const [isHeaderElevated, setIsHeaderElevated] = useState(false);
  const [isDebugMode, setIsDebugMode] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsHeaderElevated(window.scrollY > 8);
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return (
    <div className="flex min-h-dvh justify-center px-3 sm:px-6">
      <div className="flex w-full max-w-6xl flex-1 flex-col gap-4 py-4 md:py-6">
        <header
          className={`sticky top-0 z-10 flex flex-col gap-2 pb-2 pt-2 transition-colors duration-200 sm:flex-row sm:items-center sm:justify-between ${
            isHeaderElevated
              ? "bg-background/90 shadow-sm backdrop-blur"
              : "bg-transparent"
          }`}
        >
          <h1 className="text-2xl font-bold sm:text-3xl">{title}</h1>
          <div className="flex flex-wrap gap-2">
            <Button
              onClick={() => {
                setIsDebugMode((previous) => !previous);
              }}
              variant={isDebugMode ? "primary" : "outline"}
            >
              {isDebugMode ? "Debug Off" : "Debug On"}
            </Button>
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
        <div className="flex flex-1 min-h-0 flex-col gap-4">
          <section className="relative flex min-h-[360px] flex-1 items-center justify-center rounded-2xl border border-cyan-400/30 bg-[#020204]/80 p-3 shadow-[0_0_50px_rgba(35,146,255,0.18)] sm:min-h-[440px] sm:p-6">
            <JarvisParticleCore
              className="h-full max-h-[680px] w-full max-w-[680px]"
              mode={voiceMode}
              speechEnergy={voiceEnergy}
            />
          </section>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <div className="rounded-lg border border-cyan-400/30 bg-cyan-500/10 p-3 text-xs uppercase tracking-[0.18em] text-cyan-100">
              {isConnected ? "Connection Online" : "Connection Offline"}
            </div>
            <div className="rounded-lg border border-cyan-400/30 bg-cyan-500/10 p-3 text-xs uppercase tracking-[0.18em] text-cyan-100">
              {voiceMode === "speaking" && "Voice State: Speaking"}
              {voiceMode === "listening" && "Voice State: Listening"}
              {voiceMode === "idle" && "Voice State: Standby"}
            </div>
            {outputGuardrailResult && (
              <div className="w-full rounded-md border border-cyan-300/50 bg-cyan-400/10 p-3 text-xs text-cyan-100 shadow-xs sm:col-span-2 lg:col-span-1">
                <span className="font-semibold">Guardrail:</span>{" "}
                {outputGuardrailResult?.message ||
                  JSON.stringify(outputGuardrailResult)}
              </div>
            )}
          </div>

          {isDebugMode && (
            <section className="flex min-h-[220px] max-h-[45vh] flex-col overflow-hidden rounded-2xl border border-cyan-400/30 bg-[#020914]/85 p-3 sm:p-4">
              <History history={history ?? []} />
            </section>
          )}

          {!isDebugMode && (
            <div className="rounded-xl border border-cyan-500/20 bg-cyan-500/5 px-4 py-3 text-xs uppercase tracking-[0.2em] text-cyan-100/80">
              Debug mode is off. Turn it on to inspect textual conversation
              history.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
