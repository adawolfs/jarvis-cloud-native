import { RealtimeItem } from "@openai/agents/realtime";
import { TextMessage } from "./messages/TextMessage";
import { FunctionCallMessage } from "./messages/FunctionCall";

export type HistoryProps = {
  history: RealtimeItem[];
};

export function History({ history }: HistoryProps) {
  if (history.length === 0) {
    return (
      <div
        className="flex h-full min-h-0 w-full items-center justify-center rounded-lg border border-cyan-400/20 bg-[#031122]/60 p-4 text-center text-cyan-100/70"
        id="chatHistory"
      >
        No debug history available
      </div>
    );
  }

  return (
    <div
      className="h-full min-h-0 w-full space-y-4 overflow-y-auto rounded-lg border border-cyan-400/20 bg-[#031122]/60 p-3 sm:p-4"
      id="chatHistory"
    >
      {history.map((item) => {
        if (item.type === "function_call") {
          return <FunctionCallMessage message={item} key={item.itemId} />;
        }

        if (item.type === "mcp_call" || item.type === "mcp_tool_call") {
          return <FunctionCallMessage message={item} key={item.itemId} />;
        }

        if (item.type === "message") {
          return (
            <TextMessage
              text={
                item.content.length > 0
                  ? item.content
                      .map((content) => {
                        if (
                          content.type === "output_text" ||
                          content.type === "input_text"
                        ) {
                          return content.text;
                        }
                        if (
                          content.type === "input_audio" ||
                          content.type === "output_audio"
                        ) {
                          return content.transcript ?? "⚫︎⚫︎⚫︎";
                        }
                        return "";
                      })
                      .join("\n")
                  : "⚫︎⚫︎⚫︎"
              }
              isUser={item.role === "user"}
              key={item.itemId}
            />
          );
        }

        return null;
      })}
    </div>
  );
}
