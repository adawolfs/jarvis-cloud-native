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

export type UseJarvisSessionResult = {
  isConnected: boolean;
  isMuted: boolean;
  history: RealtimeItem[];
  outputGuardrailResult: OutputGuardrailTripwireTriggered<any> | null;
  connect: () => Promise<void>;
  toggleMute: () => Promise<void>;
};

export function useJarvisSession(): UseJarvisSessionResult {
  const sessionRef = useRef<RealtimeSession<any> | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [outputGuardrailResult, setOutputGuardrailResult] =
    useState<OutputGuardrailTripwireTriggered<any> | null>(null);
  const [history, setHistory] = useState<RealtimeItem[]>([]);

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

    session.on("history_updated", (nextHistory) => {
      setHistory(nextHistory);
    });

    session.on(
      "tool_approval_requested",
      (_context, _agent, approvalRequest) => {
        const approved = confirm(
          `Approve tool call to ${approvalRequest.approvalItem.rawItem.name} with parameters:\n ${JSON.stringify(approvalRequest.approvalItem.rawItem.arguments, null, 2)}?`,
        );
        if (approved) {
          session.approve(approvalRequest.approvalItem);
        } else {
          session.reject(approvalRequest.approvalItem);
        }
      },
    );

    return () => {
      try {
        session.close();
      } catch {
        // Ignore cleanup errors
      }
      sessionRef.current = null;
    };
  }, []);

  const connect = useCallback(async () => {
    const session = sessionRef.current;
    if (!session) return;

    if (isConnected) {
      await session.close();
      setIsConnected(false);
      return;
    }

    const token = await getToken();
    try {
      await session.connect({
        apiKey: token,
      });
      setIsConnected(true);
    } catch (error) {
      console.error("Error connecting to session", error);
    }
  }, [isConnected]);

  const toggleMute = useCallback(async () => {
    const session = sessionRef.current;
    if (!session) return;

    if (isMuted) {
      await session.mute(false);
      setIsMuted(false);
    } else {
      await session.mute(true);
      setIsMuted(true);
    }
  }, [isMuted]);

  return {
    isConnected,
    isMuted,
    history,
    outputGuardrailResult,
    connect,
    toggleMute,
  };
}
