"use client";

import { App } from "@/components/App";
import { Splash } from "@/components/Splash";
import { useJarvisSession } from "@/features/jarvis/useJarvisSession";

export default function Home() {
  const {
    isConnected,
    isMuted,
    voiceMode,
    voiceEnergy,
    history,
    outputGuardrailResult,
    connect,
    toggleMute,
  } = useJarvisSession();

  return (
    <Splash connect={connect}>
      <div className="relative">
        <App
          isConnected={isConnected}
          isMuted={isMuted}
          voiceMode={voiceMode}
          voiceEnergy={voiceEnergy}
          toggleMute={toggleMute}
          history={history}
          outputGuardrailResult={outputGuardrailResult}
        />
      </div>
    </Splash>
  );
}
