import React from "react";

import ClockIcon from "@/components/icons/ClockIcon";
import {
  RealtimeMcpCallItem,
  RealtimeToolCallItem,
} from "@openai/agents/realtime";
import FunctionsIcon from "@/components/icons/FunctionsIcon";
import McpIcon from "../icons/McpIcon";

type FunctionCallMessageProps = {
  message: RealtimeToolCallItem | RealtimeMcpCallItem;
};

export function FunctionCallMessage({ message }: FunctionCallMessageProps) {
  let output = message?.output;
  try {
    if (message.output) {
      output = JSON.stringify(JSON.parse(message.output), null, 2);
    }
  } catch {
    output = message.output;
  }
  let input = message.arguments;
  try {
    if (message.arguments) {
      input = JSON.stringify(JSON.parse(message.arguments), null, 2);
    }
  } catch {
    input = message.arguments;
  }
  return (
    <div className="flex flex-col w-[70%] relative mb-[8px]">
      <div>
        <div className="flex flex-col text-sm rounded-[16px]">
          <div className="rounded-b-none p-3 pl-0 font-semibold text-cyan-100 flex gap-2">
            <div className="ml-[-8px] flex items-center gap-2 fill-cyan-300 text-cyan-300">
              {message.type === "mcp_call" ||
              message.type === "mcp_tool_call" ? (
                <McpIcon width={16} height={16} />
              ) : (
                <FunctionsIcon width={16} height={16} />
              )}
              <div className="text-sm font-medium">
                {message.status === "completed"
                  ? `Called ${message.name}`
                  : `Calling ${message.name}...`}
              </div>
            </div>
          </div>

          <div className="mt-2 ml-4 rounded-xl border border-cyan-400/20 bg-[#031122] py-2">
            <div className="mx-6 max-h-96 overflow-y-scroll border-b border-cyan-500/30 p-2 text-xs text-cyan-100/80">
              <pre>{input}</pre>
            </div>
            <div className="mx-6 max-h-80 overflow-y-scroll p-2 text-xs text-cyan-100/85">
              {output ? (
                <pre>{output}</pre>
              ) : (
                <div className="flex items-center gap-2 py-2 text-cyan-200/70">
                  <ClockIcon width={16} height={16} /> Waiting for result...
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
