"use client";

import { App } from "@/components/App";
import { Splash } from "@/components/Splash";
import { useJarvisSession } from "@/features/jarvis/useJarvisSession";

export default function Home() {
  const {
    isConnected,
    isMuted,
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
          toggleMute={toggleMute}
          history={history}
          outputGuardrailResult={outputGuardrailResult}
        />
      </div>
    </Splash>
  );
}
