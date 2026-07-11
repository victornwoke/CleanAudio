import { useLocalSearchParams } from "expo-router";
import { useEffect, useMemo, useRef, useState } from "react";

import { goToPresetSelection } from "@/features/audio/audioProjectNavigation";
import { useProcessingJob } from "@/features/processing/useProcessingJob";
import { track } from "@/lib/analytics/events";
import { getJobNotificationOptIn, setJobNotificationOptIn } from "@/lib/notifications/jobNotificationPreference";
import type { AudioProject, AudioProjectSource, MediaContainer } from "@/types/audio";
import type { MediaType } from "@/types/library";

const VALID_MEDIA_TYPES: readonly MediaType[] = ["audio", "video"];
const VALID_SOURCES: readonly AudioProjectSource[] = ["recorded", "imported"];
const VALID_CONTAINERS: readonly MediaContainer[] = [
  "mp3",
  "m4a",
  "wav",
  "flac",
  "aac",
  "aiff",
  "mp4",
  "mov",
];

interface RouteParams {
  [key: string]: string | string[];
  jobId: string;
  projectId: string;
  displayName: string;
  mediaType: string;
  source: string;
  sourceUri: string;
  container: string;
  durationSeconds: string;
  sizeBytes: string;
  createdAt: string;
  needsAudioExtraction: string;
}

/**
 * Reconstructs the `AudioProject` forwarded by
 * `audioProjectNavigation.ts#goToProcessing`, used only so a failed job can
 * hand the *same* original project back to preset selection ("Job
 * behaviour": "Failed job preserves source project and offers retry or
 * alternate processing mode"). Returns `null` on any missing/malformed
 * field — this screen still functions without it (a bare `jobId` deep link
 * can still show progress and elapsed time), it just can't offer the
 * "choose a different preset" alternate action.
 */
function parseAudioProject(params: RouteParams): AudioProject | null {
  const {
    projectId,
    displayName,
    mediaType,
    source,
    sourceUri,
    container,
    durationSeconds,
    sizeBytes,
    createdAt,
    needsAudioExtraction,
  } = params;

  if (!projectId || !displayName || !sourceUri || !createdAt) return null;
  if (!mediaType || !VALID_MEDIA_TYPES.includes(mediaType as MediaType)) return null;
  if (!source || !VALID_SOURCES.includes(source as AudioProjectSource)) return null;
  if (!container || !VALID_CONTAINERS.includes(container as MediaContainer)) return null;

  const sizeBytesNum = Number(sizeBytes);
  if (!Number.isFinite(sizeBytesNum) || sizeBytesNum < 0) return null;

  const durationSecondsNum =
    durationSeconds && durationSeconds.length > 0 ? Number(durationSeconds) : null;
  if (durationSecondsNum !== null && !Number.isFinite(durationSecondsNum)) return null;

  return {
    id: projectId,
    displayName,
    mediaType: mediaType as MediaType,
    source: source as AudioProjectSource,
    sourceUri,
    container: container as MediaContainer,
    durationSeconds: durationSecondsNum,
    sizeBytes: sizeBytesNum,
    createdAt,
    needsAudioExtraction: needsAudioExtraction === "1",
  };
}

export interface UseProcessingScreenResult {
  jobId: string;
  /** Real project name when known, else a generic safe label — never a
   * placeholder that implies a name exists when it doesn't. */
  displayLabel: string;
  project: AudioProject | null;
  job: ReturnType<typeof useProcessingJob>;
  notifyOptedIn: boolean;
  toggleNotifyOptIn: () => void;
  retryToSamePreset: () => void;
  goToDifferentPreset: () => void;
}

export function useProcessingScreen(jobId: string): UseProcessingScreenResult {
  const params = useLocalSearchParams<RouteParams>();
  const project = useMemo(() => parseAudioProject(params), [params]);
  const job = useProcessingJob(jobId);

  const [notifyOptedIn, setNotifyOptedIn] = useState(false);
  useEffect(() => {
    let cancelled = false;
    getJobNotificationOptIn().then((value) => {
      if (!cancelled) setNotifyOptedIn(value);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  function toggleNotifyOptIn(): void {
    const next = !notifyOptedIn;
    setNotifyOptedIn(next);
    void setJobNotificationOptIn(next);
    track({ name: "processing_notify_opt_in_changed", properties: { optedIn: next } });
  }

  function retryToSamePreset(): void {
    job.retry();
  }

  function goToDifferentPreset(): void {
    if (!project) return;
    goToPresetSelection(project);
  }

  // Guarded, one-time-per-terminal-status analytics so navigating away and
  // back (which re-reads the same in-progress/terminal snapshot) never
  // double-fires a completion/failure/cancellation event.
  const reportedStatusRef = useRef<string | null>(null);
  useEffect(() => {
    const snapshot = job.snapshot;
    if (!snapshot) return;
    if (reportedStatusRef.current === snapshot.status) return;

    if (snapshot.status === "completed") {
      reportedStatusRef.current = snapshot.status;
      track({
        name: "processing_completed",
        properties: { adapter: snapshot.adapter, elapsedSeconds: job.elapsedSeconds },
      });
    } else if (snapshot.status === "cancelled") {
      reportedStatusRef.current = snapshot.status;
      track({
        name: "processing_cancelled",
        properties: { stage: snapshot.stage, elapsedSeconds: job.elapsedSeconds },
      });
    } else if (snapshot.status === "failed") {
      reportedStatusRef.current = snapshot.status;
      track({
        name: "processing_failed",
        properties: {
          errorCode: snapshot.errorCode ?? "unexpected_error",
          elapsedSeconds: job.elapsedSeconds,
        },
      });
    }
    // `elapsedSeconds` intentionally excluded — it ticks every second and
    // must not re-trigger this guarded, fire-once effect.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [job.snapshot]);

  return {
    jobId,
    displayLabel: project?.displayName || "Your audio",
    project,
    job,
    notifyOptedIn,
    toggleNotifyOptIn,
    retryToSamePreset,
    goToDifferentPreset,
  };
}
