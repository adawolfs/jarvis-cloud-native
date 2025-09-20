'use client';
import {
  RealtimeItem,
  OutputGuardrailTripwireTriggered,
  TransportEvent,
} from '@openai/agents/realtime';
import { History } from '@/components/History';
import { Button } from '@/components/ui/Button';
import { useEffect, useState } from 'react';

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
  title = 'J.A.R.V.I.S',
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
    <div className="flex justify-center">
      <div className="p-4 md:max-h-screen overflow-hidden h-screen flex flex-col max-w-6xl w-full">
        <header className="flex-none flex justify-between items-center pb-4 w-full max-w-6xl">
          <h1 className="text-2xl font-bold">{title}</h1>
          <div className="flex gap-2" >
            {isConnected && (
              <Button
                onClick={toggleMute}
                variant={isMuted ? 'primary' : 'outline'}
              >
                {isMuted ? 'Unmute' : 'Mute'}
              </Button>
            )}
          </div>
        </header>
        <div className="flex gap-10 flex-col md:flex-row h-full max-h-full overflow-y-hidden">
          <div className="flex-2/3 flex-grow overflow-y-scroll pb-24">
            {history ? (
              <History history={history} />
            ) : (
              <div className="h-full flex items-center justify-center text-center text-gray-500">
                No history available
              </div>
            )}
          </div>
          <div className="flex-1/3 flex flex-col flex-grow gap-4">
            {outputGuardrailResult && (
              <div className="flex-0 w-full p-2 border border-blue-300 rounded-md bg-blue-50 text-blue-900 text-xs self-end shadow-sm">
                <span className="font-semibold">Guardrail:</span>{' '}
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
