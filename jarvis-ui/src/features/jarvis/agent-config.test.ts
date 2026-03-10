import { describe, expect, it } from "vitest";
import { JARVIS_MCP_SERVER_LABELS } from "./agent";

describe("jarvis agent config", () => {
  it("only exposes k8s mcp", () => {
    expect(JARVIS_MCP_SERVER_LABELS).toEqual(["k8s"]);
  });
});
