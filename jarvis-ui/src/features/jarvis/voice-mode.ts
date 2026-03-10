export type JarvisVoiceMode = "idle" | "listening" | "speaking";

export type JarvisAudioEvent =
  | "audio_start"
  | "audio_stopped"
  | "audio_interrupted";

export function getBaseVoiceMode(
  isConnected: boolean,
  isMuted: boolean,
): JarvisVoiceMode {
  if (!isConnected || isMuted) {
    return "idle";
  }

  return "listening";
}

export function getVoiceModeAfterAudioEvent(
  event: JarvisAudioEvent,
  isConnected: boolean,
  isMuted: boolean,
): JarvisVoiceMode {
  if (event === "audio_start" && isConnected && !isMuted) {
    return "speaking";
  }

  return getBaseVoiceMode(isConnected, isMuted);
}
