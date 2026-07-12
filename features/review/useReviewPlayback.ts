import { useAudioPlayer, useAudioPlayerStatus } from "expo-audio";
import { useCallback, useEffect, useState } from "react";
import { AppState } from "react-native";

import { track } from "@/lib/analytics/events";
import type { AudioProject } from "@/types/audio";

import type { EnhancedAudioResult } from "./enhancedAudioResult";

export type ReviewTrack = "original" | "enhanced";

export interface UseReviewPlaybackResult {
  activeTrack: ReviewTrack;
  /** `false` until a real enhancement adapter has produced an output —
   * never true from a fabricated/copied file (`CLAUDE.md` §8). */
  enhancedAvailable: boolean;
  isPlaying: boolean;
  isLoaded: boolean;
  /** Real seconds into the active track's own timeline. */
  positionSeconds: number;
  durationSeconds: number;
  /** 0–1, clamped — drives the waveform's played/unplayed split. */
  progress: number;
  isMuted: boolean;
  selectTrack: (track: ReviewTrack) => void;
  togglePlayback: () => void;
  /** Seeks the active track to a 0–1 fraction of its own duration
   * (`draggable playhead`). No-op while the selected track has no real
   * audio to seek. */
  scrubToFraction: (fraction: number) => void;
  toggleMuted: () => void;
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

/**
 * Owns synchronized before/after playback (`prompts/10-before-after-review.md`
 * "Playback rules"): never plays both versions simultaneously, switches
 * sources at the same timestamp, clamps positions when lengths differ, and
 * pauses on backgrounding for audio-session cleanup. `enhanced` is `null`
 * until a real adapter exists (`prompts/15-audio-domain-and-adapters.md`) —
 * selecting the "enhanced" track then only flips `activeTrack` so the UI can
 * show an honest unavailable state; nothing plays or is fabricated.
 */
export function useReviewPlayback(
  project: AudioProject,
  enhanced: EnhancedAudioResult | null,
): UseReviewPlaybackResult {
  const originalPlayer = useAudioPlayer({ uri: project.sourceUri });
  const originalStatus = useAudioPlayerStatus(originalPlayer);
  const enhancedPlayer = useAudioPlayer(enhanced ? { uri: enhanced.uri } : null);
  const enhancedStatus = useAudioPlayerStatus(enhancedPlayer);

  const [activeTrack, setActiveTrack] = useState<ReviewTrack>("original");
  const [isMuted, setIsMuted] = useState(false);
  const enhancedAvailable = enhanced !== null;

  useEffect(() => {
    // eslint-disable-next-line react-hooks/immutability
    originalPlayer.muted = isMuted;
    // eslint-disable-next-line react-hooks/immutability
    enhancedPlayer.muted = isMuted;
  }, [isMuted, originalPlayer, enhancedPlayer]);

  // Backgrounding pauses playback and releases the active audio session
  // rather than continuing silently off-screen (`enableBackgroundPlayback`
  // is `false` in `app.json`, so this mirrors the platform's own behaviour
  // explicitly instead of relying on it implicitly).
  useEffect(() => {
    const subscription = AppState.addEventListener("change", (next) => {
      if (next !== "active") {
        originalPlayer.pause();
        enhancedPlayer.pause();
      }
    });
    return () => subscription.remove();
  }, [originalPlayer, enhancedPlayer]);

  const activeStatus = activeTrack === "enhanced" ? enhancedStatus : originalStatus;
  const durationSeconds =
    activeStatus.duration ||
    (activeTrack === "original" ? project.durationSeconds : enhanced?.durationSeconds) ||
    0;
  const positionSeconds = activeStatus.currentTime;
  const progress = durationSeconds > 0 ? clamp(positionSeconds / durationSeconds, 0, 1) : 0;

  const selectTrack = useCallback(
    (next: ReviewTrack) => {
      if (next === activeTrack) return;

      const leavingUnavailableEnhanced = activeTrack === "enhanced" && !enhancedAvailable;
      if (!leavingUnavailableEnhanced) {
        const fromPlayer = activeTrack === "original" ? originalPlayer : enhancedPlayer;
        const wasPlaying = activeStatus.playing;
        fromPlayer.pause();

        if (next === "enhanced" && enhancedAvailable) {
          const toDuration = enhancedStatus.duration || enhanced?.durationSeconds || 0;
          const seekTarget = toDuration > 0 ? clamp(activeStatus.currentTime, 0, toDuration) : 0;
          enhancedPlayer.seekTo(seekTarget).then(() => {
            if (wasPlaying) enhancedPlayer.play();
          });
        } else if (next === "original") {
          const toDuration = originalStatus.duration || project.durationSeconds || 0;
          const seekTarget = toDuration > 0 ? clamp(activeStatus.currentTime, 0, toDuration) : 0;
          originalPlayer.seekTo(seekTarget).then(() => {
            if (wasPlaying) originalPlayer.play();
          });
        }
      }
      // Switching into the unavailable "enhanced" state, or back out of it,
      // never touches the original player's own position — it was never
      // altered while parked on the unavailable view, so it resumes exactly
      // where the user left it.

      setActiveTrack(next);
      if (enhancedAvailable) track({ name: "comparison_used", properties: { variant: next } });
    },
    [
      activeTrack,
      activeStatus.playing,
      activeStatus.currentTime,
      enhancedAvailable,
      enhanced?.durationSeconds,
      enhancedStatus.duration,
      originalStatus.duration,
      originalPlayer,
      enhancedPlayer,
      project.durationSeconds,
    ],
  );

  const togglePlayback = useCallback(() => {
    if (activeTrack === "enhanced" && !enhancedAvailable) return;
    const player = activeTrack === "original" ? originalPlayer : enhancedPlayer;
    const otherPlayer = activeTrack === "original" ? enhancedPlayer : originalPlayer;
    otherPlayer.pause();
    if (activeStatus.playing) {
      player.pause();
    } else {
      player.play();
    }
  }, [activeTrack, enhancedAvailable, originalPlayer, enhancedPlayer, activeStatus.playing]);

  const scrubToFraction = useCallback(
    (fraction: number) => {
      if (activeTrack === "enhanced" && !enhancedAvailable) return;
      const player = activeTrack === "original" ? originalPlayer : enhancedPlayer;
      if (durationSeconds <= 0) return;
      player.seekTo(clamp(fraction, 0, 1) * durationSeconds);
    },
    [activeTrack, enhancedAvailable, originalPlayer, enhancedPlayer, durationSeconds],
  );

  const toggleMuted = useCallback(() => setIsMuted((value) => !value), []);

  return {
    activeTrack,
    enhancedAvailable,
    isPlaying: activeStatus.playing,
    isLoaded: activeTrack === "enhanced" && !enhancedAvailable ? false : activeStatus.isLoaded,
    positionSeconds,
    durationSeconds,
    progress,
    isMuted,
    selectTrack,
    togglePlayback,
    scrubToFraction,
    toggleMuted,
  };
}
