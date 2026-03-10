"use client";

import {
  OutputGuardrailTripwireTriggered,
  RealtimeItem,
  RealtimeSession,
} from "@openai/agents/realtime";
import { useCallback, useEffect, useRef, useState } from "react";
import { getToken } from "@/app/server/token.action";
import { createJarvisAgent, JARVIS_OUTPUT_VOICE } from "./agent";
import { getJarvisGuardrails } from "./guardrails";
import { getBaseVoiceMode, type JarvisVoiceMode } from "./voice-mode";

export type UseJarvisSessionResult = {
  isConnected: boolean;
  isMuted: boolean;
  voiceMode: JarvisVoiceMode;
  voiceEnergy: number;
  history: RealtimeItem[];
  outputGuardrailResult: OutputGuardrailTripwireTriggered<any> | null;
  connect: () => Promise<void>;
  toggleMute: () => Promise<void>;
};

export function useJarvisSession(): UseJarvisSessionResult {
  const sessionRef = useRef<RealtimeSession<any> | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [voiceMode, setVoiceMode] = useState<JarvisVoiceMode>("idle");
  const [voiceEnergy, setVoiceEnergy] = useState(0);
  const [outputGuardrailResult, setOutputGuardrailResult] =
    useState<OutputGuardrailTripwireTriggered<any> | null>(null);
  const [history, setHistory] = useState<RealtimeItem[]>([]);
  const isConnectedRef = useRef(false);
  const isMutedRef = useRef(false);
  const speakingHoldTimeoutRef = useRef<number | null>(null);
  const voiceEnergyBucketRef = useRef(-1);

  const debugLog = useCallback((message: string, details?: unknown) => {
    if (process.env.NODE_ENV === "production") {
      return;
    }

    if (details === undefined) {
      console.log(`[jarvis:state] ${message}`);
      return;
    }

    console.log(`[jarvis:state] ${message}`, details);
  }, []);

  const clearSpeakingHold = useCallback(() => {
    const timeout = speakingHoldTimeoutRef.current;
    if (timeout !== null) {
      window.clearTimeout(timeout);
      speakingHoldTimeoutRef.current = null;
    }
  }, []);

  const queueBaseVoiceMode = useCallback(
    (delayMs = 1800) => {
      debugLog("queueBaseVoiceMode", { delayMs });
      clearSpeakingHold();
      speakingHoldTimeoutRef.current = window.setTimeout(() => {
        const nextMode = getBaseVoiceMode(
          isConnectedRef.current,
          isMutedRef.current,
        );

        setVoiceMode(nextMode);
        setVoiceEnergy(0);
        debugLog("base mode applied", {
          nextMode,
          isConnected: isConnectedRef.current,
          isMuted: isMutedRef.current,
        });
        speakingHoldTimeoutRef.current = null;
      }, delayMs);
    },
    [clearSpeakingHold, debugLog],
  );

  const promoteSpeakingMode = useCallback(
    (seedEnergy = 0.55) => {
      if (!isConnectedRef.current || isMutedRef.current) {
        return;
      }

      clearSpeakingHold();
      setVoiceMode("speaking");
      setVoiceEnergy((previous) => Math.max(previous, seedEnergy));
      debugLog("promoteSpeakingMode", {
        seedEnergy,
        isConnected: isConnectedRef.current,
        isMuted: isMutedRef.current,
      });
    },
    [clearSpeakingHold, debugLog],
  );

  useEffect(() => {
    isConnectedRef.current = isConnected;
    isMutedRef.current = isMuted;

    setVoiceMode(getBaseVoiceMode(isConnected, isMuted));
    debugLog("connection or mute changed", {
      isConnected,
      isMuted,
      baseMode: getBaseVoiceMode(isConnected, isMuted),
    });
  }, [isConnected, isMuted, debugLog]);

  useEffect(() => {
    debugLog("voiceMode changed", { voiceMode });
  }, [voiceMode, debugLog]);

  useEffect(() => {
    const bucket = Math.round(voiceEnergy * 10);
    if (bucket !== voiceEnergyBucketRef.current) {
      voiceEnergyBucketRef.current = bucket;
      debugLog("voiceEnergy bucket", { value: bucket / 10 });
    }
  }, [voiceEnergy, debugLog]);

  useEffect(() => {
    const session = new RealtimeSession(createJarvisAgent(), {
      model: "gpt-realtime",
      outputGuardrails: getJarvisGuardrails(),
      outputGuardrailSettings: {
        debounceTextLength: 200,
      },
      config: {
        audio: {
          output: {
            voice: JARVIS_OUTPUT_VOICE,
          },
        },
      },
    });

    sessionRef.current = session;

    session.on("guardrail_tripped", (_context, _agent, guardrailError) => {
      setOutputGuardrailResult(guardrailError);
    });

    session.on("audio_start", () => {
      debugLog("event: audio_start");
      promoteSpeakingMode(0.62);
    });

    session.on("transport_event", (event) => {
      if (
        event.type === "audio" ||
        event.type === "audio_transcript_delta" ||
        event.type === "turn_started"
      ) {
        debugLog("event: transport_event speech signal", { type: event.type });
        promoteSpeakingMode(0.56);
        return;
      }

      if (event.type === "audio_done" || event.type === "turn_done") {
        debugLog("event: transport_event speech done", { type: event.type });
        queueBaseVoiceMode(2400);
      }
    });

    session.on("audio", (audioEvent) => {
      promoteSpeakingMode(0.58);

      const buffer = audioEvent.data;
      if (!buffer || buffer.byteLength === 0) {
        return;
      }

      const samples = new Int16Array(buffer);
      if (samples.length === 0) {
        return;
      }

      let sumSquares = 0;
      for (let index = 0; index < samples.length; index += 1) {
        const normalized = samples[index] / 32768;
        sumSquares += normalized * normalized;
      }

      const rms = Math.sqrt(sumSquares / samples.length);
      const nextEnergy = Math.min(1, rms * 2.4);
      setVoiceEnergy((previous) => previous + (nextEnergy - previous) * 0.35);
    });

    session.on("audio_stopped", () => {
      debugLog("event: audio_stopped");
      queueBaseVoiceMode(1200);
    });

    session.on("audio_interrupted", () => {
      debugLog("event: audio_interrupted");
      queueBaseVoiceMode(1400);
    });

    session.on("agent_start", () => {
      debugLog("event: agent_start");
      promoteSpeakingMode(0.65);
    });

    session.on("history_updated", (nextHistory) => {
      setHistory(nextHistory);

      const isAssistantResponding = nextHistory.some((item) => {
        return (
          item.type === "message" &&
          item.role === "assistant" &&
          item.status === "in_progress"
        );
      });

      if (isAssistantResponding) {
        debugLog("history_updated: assistant in_progress");
        promoteSpeakingMode(0.68);
        return;
      }

      if (!isConnectedRef.current || isMutedRef.current) {
        debugLog("history_updated: queue base mode due disconnected/muted");
        queueBaseVoiceMode(200);
      }
    });

    session.on(
      "tool_approval_requested",
      (_context, _agent, approvalRequest) => {
        const rawItem = approvalRequest.approvalItem.rawItem as Record<
          string,
          unknown
        >;
        const toolName =
          typeof rawItem.name === "string"
            ? rawItem.name
            : typeof rawItem.type === "string"
              ? rawItem.type
              : "unknown_tool";
        const toolArguments =
          "arguments" in rawItem ? rawItem.arguments : rawItem;

        const approved = confirm(
          `Approve tool call to ${toolName} with parameters:\n ${JSON.stringify(toolArguments, null, 2)}?`,
        );
        if (approved) {
          session.approve(approvalRequest.approvalItem);
        } else {
          session.reject(approvalRequest.approvalItem);
        }
      },
    );

    return () => {
      debugLog("session cleanup");
      clearSpeakingHold();
      try {
        session.close();
      } catch {
        // Ignore cleanup errors
      }
      sessionRef.current = null;
    };
  }, [promoteSpeakingMode, clearSpeakingHold, queueBaseVoiceMode, debugLog]);

  const connect = useCallback(async () => {
    const session = sessionRef.current;
    if (!session) return;

    if (isConnected) {
      await session.close();
      setIsConnected(false);
      setVoiceEnergy(0);
      debugLog("connect(): closed existing connection");
      return;
    }

    const token = await getToken();
    try {
      await session.connect({
        apiKey: token,
      });
      setIsConnected(true);
      debugLog("connect(): connected");
    } catch (error) {
      console.error("Error connecting to session", error);
    }
  }, [isConnected, debugLog]);

  const toggleMute = useCallback(async () => {
    const session = sessionRef.current;
    if (!session) return;

    if (isMuted) {
      await session.mute(false);
      setIsMuted(false);
      debugLog("toggleMute(): unmuted");
    } else {
      await session.mute(true);
      setIsMuted(true);
      debugLog("toggleMute(): muted");
    }
  }, [isMuted, debugLog]);

  return {
    isConnected,
    isMuted,
    voiceMode,
    voiceEnergy,
    history,
    outputGuardrailResult,
    connect,
    toggleMute,
  };
}
