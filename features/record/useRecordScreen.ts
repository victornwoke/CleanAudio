import {
  getRecordingPermissionsAsync,
  requestRecordingPermissionsAsync,
  RecordingPresets,
  setAudioModeAsync,
  useAudioRecorder,
  useAudioRecorderState,
} from "expo-audio";
import { useCallback, useEffect, useRef, useState } from "react";
import { AppState, Linking } from "react-native";

import { track } from "@/lib/analytics/events";
import { finalizeRecordedProject } from "@/services/media/mediaRecordingService";
import type { AudioProject } from "@/types/audio";
import type { PresetId } from "@/types/onboarding";

export type MicPermissionStatus = "unknown" | "granted" | "denied" | "blocked";
export type RecordPhase = "idle" | "recording" | "paused" | "interrupted" | "finalizing";

const METERING_POLL_INTERVAL_MS = 120;
const LEVEL_HISTORY_LENGTH = 40;
const CLIPPING_THRESHOLD_DB = -1;
/** Below this dBFS the meter reads effectively silent (0). Recorder metering
 * on both platforms bottoms out well before actual digital silence. */
const METER_FLOOR_DB = -60;

function meteringToAmplitude(db: number | undefined): number {
  if (db === undefined || Number.isNaN(db)) return 0;
  const clamped = Math.max(METER_FLOOR_DB, Math.min(0, db));
  return (clamped - METER_FLOOR_DB) / -METER_FLOOR_DB;
}

const RECORDING_OPTIONS = {
  ...RecordingPresets.HIGH_QUALITY,
  isMeteringEnabled: true,
  directory: "document" as const,
};

export interface UseRecordScreenResult {
  micPermissionStatus: MicPermissionStatus;
  requestMicPermission: () => Promise<void>;
  openAppSettings: () => void;

  phase: RecordPhase;
  elapsedSeconds: number;
  levelHistory: number[];
  isClipping: boolean;
  inputSourceLabel: string | null;

  presetId: PresetId | "auto";
  setPresetId: (id: PresetId | "auto") => void;

  start: () => void;
  pause: () => void;
  resume: () => void;
  stop: () => Promise<AudioProject | null>;
  discard: () => void;
  resumeAfterInterruption: () => void;

  hasMeaningfulRecording: boolean;
  errorMessage: string | null;
}

/**
 * Owns the Record screen's native recorder lifecycle, live level meter,
 * background/call interruption handling, and hand-off to the same
 * `AudioProject` model the Import flow produces.
 *
 * Requires a development build — `expo-audio` recording is a native module
 * and isn't validated in Expo Go (`AGENTS.md` §3).
 */
export function useRecordScreen(): UseRecordScreenResult {
  const recorder = useAudioRecorder(RECORDING_OPTIONS);
  const recorderState = useAudioRecorderState(recorder, METERING_POLL_INTERVAL_MS);

  const [micPermissionStatus, setMicPermissionStatus] = useState<MicPermissionStatus>("unknown");
  const [phase, setPhase] = useState<RecordPhase>("idle");
  const [levelHistory, setLevelHistory] = useState<number[]>([]);
  const [inputSourceLabel, setInputSourceLabel] = useState<string | null>(null);
  const [presetId, setPresetId] = useState<PresetId | "auto">("auto");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const phaseRef = useRef(phase);
  useEffect(() => {
    phaseRef.current = phase;
  }, [phase]);

  useEffect(() => {
    getRecordingPermissionsAsync().then((response) => {
      setMicPermissionStatus(response.granted ? "granted" : "unknown");
    });
  }, []);

  useEffect(() => {
    if (phase !== "recording") return;
    setLevelHistory((current) => {
      const next = [...current, meteringToAmplitude(recorderState.metering)];
      return next.length > LEVEL_HISTORY_LENGTH ? next.slice(-LEVEL_HISTORY_LENGTH) : next;
    });
  }, [recorderState.metering, phase]);

  useEffect(() => {
    if (recorderState.mediaServicesDidReset && phaseRef.current === "recording") {
      setPhase("interrupted");
    }
  }, [recorderState.mediaServicesDidReset]);

  useEffect(() => {
    const subscription = AppState.addEventListener("change", (nextState) => {
      if (nextState !== "active" && phaseRef.current === "recording") {
        recorder.pause();
        setPhase("interrupted");
      }
    });
    return () => subscription.remove();
  }, [recorder]);

  const requestMicPermission = useCallback(async () => {
    const response = await requestRecordingPermissionsAsync();
    setMicPermissionStatus(response.granted ? "granted" : response.canAskAgain ? "denied" : "blocked");
  }, []);

  const openAppSettings = useCallback(() => {
    Linking.openSettings();
  }, []);

  const start = useCallback(() => {
    if (micPermissionStatus !== "granted") return;
    setErrorMessage(null);
    setLevelHistory([]);
    (async () => {
      try {
        await setAudioModeAsync({
          allowsRecording: true,
          playsInSilentMode: true,
          interruptionMode: "doNotMix",
        });
        await recorder.prepareToRecordAsync();
        recorder.record();
        setPhase("recording");
        track({ name: "recording_started" });
        try {
          const input = await recorder.getCurrentInput();
          setInputSourceLabel(input.name);
        } catch {
          setInputSourceLabel(null);
        }
      } catch {
        setErrorMessage("We couldn't start recording. Please try again.");
      }
    })();
  }, [micPermissionStatus, recorder]);

  const pause = useCallback(() => {
    recorder.pause();
    setPhase("paused");
  }, [recorder]);

  const resume = useCallback(() => {
    recorder.record();
    setPhase("recording");
  }, [recorder]);

  const resumeAfterInterruption = useCallback(async () => {
    try {
      if (recorderState.mediaServicesDidReset) {
        await recorder.prepareToRecordAsync();
      }
      recorder.record();
      setErrorMessage(null);
      setPhase("recording");
    } catch {
      setErrorMessage("We couldn't resume recording. Please try again.");
      setPhase("interrupted");
    }
  }, [recorder, recorderState.mediaServicesDidReset]);

  const stop = useCallback(async (): Promise<AudioProject | null> => {
    setPhase("finalizing");
    const durationSeconds = recorderState.durationMillis / 1000;
    try {
      await recorder.stop();
      const uri = recorder.uri;
      if (!uri) {
        setErrorMessage("The recording couldn't be saved. Please try again.");
        setPhase("idle");
        return null;
      }
      const project = finalizeRecordedProject({ uri, durationSeconds });
      track({ name: "recording_completed", properties: { durationSeconds } });
      return project;
    } catch {
      setErrorMessage("The recording couldn't be saved. Please try again.");
      setPhase("idle");
      return null;
    }
  }, [recorder, recorderState.durationMillis]);

  const discard = useCallback(() => {
    if (recorder.isRecording) {
      recorder.stop().catch(() => {});
    }
    setPhase("idle");
    setLevelHistory([]);
    setErrorMessage(null);
  }, [recorder]);

  return {
    micPermissionStatus,
    requestMicPermission,
    openAppSettings,

    phase,
    elapsedSeconds: recorderState.durationMillis / 1000,
    levelHistory,
    isClipping: meteringToAmplitude(recorderState.metering) > meteringToAmplitude(CLIPPING_THRESHOLD_DB),
    inputSourceLabel,

    presetId,
    setPresetId,

    start,
    pause,
    resume,
    stop,
    discard,
    resumeAfterInterruption,

    hasMeaningfulRecording: recorderState.durationMillis / 1000 > 1,
    errorMessage,
  };
}
