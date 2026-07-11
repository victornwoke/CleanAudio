import { useAudioPlayer, useAudioPlayerStatus } from "expo-audio";
import { useCallback, useEffect, useRef, useState } from "react";

import { track } from "@/lib/analytics/events";

import { markDemoHeard } from "./onboardingPreferences";

export type DemoTrack = "original" | "enhanced";

// See `assets/audio/README.md` — these are placeholder demo samples, not
// the final production before/after marketing sample.
const originalSource = require("../../assets/audio/demo-original.mp3");
const enhancedSource = require("../../assets/audio/demo-enhanced.mp3");

export interface DemoPlaybackState {
  activeTrack: DemoTrack;
  isPlaying: boolean;
  isLoaded: boolean;
  currentTime: number;
  duration: number;
  selectTrack: (track: DemoTrack) => void;
  togglePlayback: () => void;
}

/**
 * Owns the two bundled demo-sample players (Original / Enhanced) for the
 * "Hear the difference" screen. Scoped to this one onboarding feature — the
 * general typed audio service interfaces/adapters for real recording and
 * enhancement are built in `prompts/15-audio-domain-and-adapters.md`.
 *
 * Requires a development build; `expo-audio` is a native module and is not
 * validated in Expo Go (AGENTS.md §3).
 */
export function useDemoPlayback(): DemoPlaybackState {
  const originalPlayer = useAudioPlayer(originalSource);
  const enhancedPlayer = useAudioPlayer(enhancedSource);
  const originalStatus = useAudioPlayerStatus(originalPlayer);
  const enhancedStatus = useAudioPlayerStatus(enhancedPlayer);

  const [selectedTrack, setSelectedTrack] = useState<DemoTrack>("original");
  const hasPlayedRef = useRef<Record<DemoTrack, boolean>>({
    original: false,
    enhanced: false,
  });

  const activeTrack: DemoTrack = enhancedStatus.playing
    ? "enhanced"
    : originalStatus.playing
      ? "original"
      : selectedTrack;

  const activeStatus = activeTrack === "enhanced" ? enhancedStatus : originalStatus;
  const activePlayer = activeTrack === "enhanced" ? enhancedPlayer : originalPlayer;
  const otherPlayer = activeTrack === "enhanced" ? originalPlayer : enhancedPlayer;

  // Reset each track to the start once it finishes so replay works.
  useEffect(() => {
    if (originalStatus.didJustFinish) {
      originalPlayer.seekTo(0).catch(() => {});
    }
  }, [originalStatus.didJustFinish, originalPlayer]);

  useEffect(() => {
    if (enhancedStatus.didJustFinish) {
      enhancedPlayer.seekTo(0).catch(() => {});
    }
  }, [enhancedStatus.didJustFinish, enhancedPlayer]);

  const selectTrack = useCallback(
    (next: DemoTrack) => {
      if (next === activeTrack) return;
      originalPlayer.pause();
      enhancedPlayer.pause();
      setSelectedTrack(next);
    },
    [activeTrack, originalPlayer, enhancedPlayer],
  );

  const togglePlayback = useCallback(() => {
    otherPlayer.pause();
    if (activeStatus.playing) {
      activePlayer.pause();
      return;
    }
    activePlayer.play();
    if (!hasPlayedRef.current[activeTrack]) {
      hasPlayedRef.current[activeTrack] = true;
      track({
        name: activeTrack === "original" ? "demo_original_played" : "demo_enhanced_played",
      });
      markDemoHeard().catch(() => {});
    }
  }, [activePlayer, otherPlayer, activeStatus.playing, activeTrack]);

  return {
    activeTrack,
    isPlaying: activeStatus.playing,
    isLoaded: activeStatus.isLoaded,
    currentTime: activeStatus.currentTime,
    duration: activeStatus.duration,
    selectTrack,
    togglePlayback,
  };
}
