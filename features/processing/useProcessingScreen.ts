import { useLocalSearchParams } from "expo-router";
import { useEffect, useMemo, useRef, useState } from "react";

import { goToPresetSelection } from "@/features/audio/audioProjectNavigation";
import { parseAudioProjectParams, type AudioProjectRouteParams } from "@/features/audio/parseAudioProjectParams";
import { useProcessingJob } from "@/features/processing/useProcessingJob";
import { track } from "@/lib/analytics/events";
import { getJobNotificationOptIn, setJobNotificationOptIn } from "@/lib/notifications/jobNotificationPreference";
import type { AudioProject } from "@/types/audio";

interface RouteParams extends AudioProjectRouteParams {
  jobId: string;
}

const reportedTerminalAttempts = new Set<string>();

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
  const project = useMemo(() => parseAudioProjectParams(params), [params]);
  const job = useProcessingJob(jobId);

  const [notifyOptedIn, setNotifyOptedIn] = useState(false);
  const notificationPreferenceMutatedRef = useRef(false);
  const notificationPreferenceMutationIdRef = useRef(0);
  useEffect(() => {
    let cancelled = false;
    void getJobNotificationOptIn()
      .then((value) => {
        if (!cancelled && !notificationPreferenceMutatedRef.current) setNotifyOptedIn(value);
      })
      .catch(() => {
        // Keep the safe default when persisted preferences cannot be read.
      });
    return () => {
      cancelled = true;
    };
  }, []);

  function toggleNotifyOptIn(): void {
    notificationPreferenceMutatedRef.current = true;
    const mutationId = ++notificationPreferenceMutationIdRef.current;
    const previous = notifyOptedIn;
    const next = !previous;
    setNotifyOptedIn(next);
    void setJobNotificationOptIn(next)
      .then(() => {
        track({ name: "processing_notify_opt_in_changed", properties: { optedIn: next } });
      })
      .catch(() => {
        if (notificationPreferenceMutationIdRef.current !== mutationId) return;
        setNotifyOptedIn(previous);
        notificationPreferenceMutatedRef.current = false;
      });
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
    const attemptKey = `${snapshot.jobId}:${snapshot.startedAt}:${snapshot.status}`;
    if (
      reportedStatusRef.current === attemptKey ||
      reportedTerminalAttempts.has(attemptKey)
    ) {
      return;
    }

    if (snapshot.status === "completed") {
      reportedStatusRef.current = attemptKey;
      reportedTerminalAttempts.add(attemptKey);
      track({
        name: "processing_completed",
        properties: { adapter: snapshot.adapter, elapsedSeconds: job.elapsedSeconds },
      });
    } else if (snapshot.status === "cancelled") {
      reportedStatusRef.current = attemptKey;
      reportedTerminalAttempts.add(attemptKey);
      track({
        name: "processing_cancelled",
        properties: { stage: snapshot.stage, elapsedSeconds: job.elapsedSeconds },
      });
    } else if (snapshot.status === "failed") {
      reportedStatusRef.current = attemptKey;
      reportedTerminalAttempts.add(attemptKey);
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
