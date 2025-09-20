"use client";
import React, { useEffect, useRef, useState } from "react";
import { Button } from "./ui/Button";

export type SplashProps = {
  connect: () => void;
  isConnected: boolean;
  children?: React.ReactNode;
};

export function Splash({ isConnected, connect, children }: SplashProps) {
  const [showSplash, setShowSplash] = useState(true);
  const [started, setStarted] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const handleStart = () => {
    if (started) return;
    setStarted(true);
    if (audioRef.current) {
      audioRef.current.play();
    }
    timerRef.current = setTimeout(() => {
      setShowSplash(false);
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }
      connect();
    }, 4000);
  };

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }
    };
  }, []);

  if (showSplash) {
    return (
      <div
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "100vw",
          height: "100vh",
          background: "#000",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 9999,
          cursor: !started ? "pointer" : "default",
        }}
      >
        <audio ref={audioRef} src="/jarvis-intro.mp3" autoPlay preload="auto" />
        {!started ? (
          <Button
              onClick={handleStart}
              variant='outline'
            >
              Start J.A.R.V.I.S
          </Button>
        ) : (
          <img
            src="/jarvis.gif"
            alt="Loading..."
            style={{
              display: "block",
              maxWidth: "100vw",
              maxHeight: "100vh",
              border: "none",
            }}
          />
        )}
      </div>
    );
  }

  return <>{children}</>;
}
