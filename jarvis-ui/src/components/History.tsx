import { RealtimeItem } from "@openai/agents/realtime";
import { TextMessage } from "./messages/TextMessage";
import { FunctionCallMessage } from "./messages/FunctionCall";

export type HistoryProps = {
  history: RealtimeItem[];
};

export function History({ history }: HistoryProps) {
  return (
    <div
      className="h-full min-h-0 w-full overflow-y-auto rounded-lg bg-white p-3 sm:p-4 space-y-4"
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
