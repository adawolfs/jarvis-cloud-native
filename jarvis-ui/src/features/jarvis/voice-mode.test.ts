import { describe, expect, it } from "vitest";
import { getBaseVoiceMode, getVoiceModeAfterAudioEvent } from "./voice-mode";

describe("voice mode", () => {
  it("returns idle when disconnected", () => {
    expect(getBaseVoiceMode(false, false)).toBe("idle");
  });

  it("returns idle when muted", () => {
    expect(getBaseVoiceMode(true, true)).toBe("idle");
  });

  it("returns listening when connected and unmuted", () => {
    expect(getBaseVoiceMode(true, false)).toBe("listening");
  });

  it("switches to speaking on audio start", () => {
    expect(getVoiceModeAfterAudioEvent("audio_start", true, false)).toBe(
      "speaking",
    );
  });

  it("returns to listening when audio stops", () => {
    expect(getVoiceModeAfterAudioEvent("audio_stopped", true, false)).toBe(
      "listening",
    );
  });
});
