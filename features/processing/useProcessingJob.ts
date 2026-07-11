import { useEffect, useState } from "react";
import { AppState } from "react-native";

import { developmentMockProcessingAdapter } from "@/services/audio/processingJobAdapter";
import type { ProcessingJobSnapshot } from "@/types/processing";

const adapter = developmentMockProcessingAdapter;

export interface UseProcessingJobResult {
  snapshot: ProcessingJobSnapshot | null;
  /** Real wall-clock seconds since the job started, derived from the
   * adapter's own `startedAt` — stays correct across remounts instead of
   * resetting a local timer every time the screen is (re)opened. */
  elapsedSeconds: number;
  cancel: () => void;
  retry: () => void;
}

/**
 * Subscribes to a processing job's progress (`prompts/09-processing-screen.md`
 * Job behaviour: resolve by ID, subscribe to bounded status updates, handle
 * background/foreground, idempotent retry). Only one adapter exists today
 * (`developmentMockProcessingAdapter`) — swapping in the real native/cloud
 * adapters from `prompts/15-audio-domain-and-adapters.md` only changes the
 * import above.
 */
export function useProcessingJob(jobId: string): UseProcessingJobResult {
  const [snapshot, setSnapshot] = useState<ProcessingJobSnapshot | null>(null);
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const unsubscribe = adapter.subscribe(jobId, setSnapshot);
    return unsubscribe;
  }, [jobId]);

  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    // Backgrounding can throttle JS timers; resync the displayed elapsed
    // time from real wall-clock as soon as the app is foregrounded again
    // rather than trusting a stale interval tick (Job behaviour: "handle
    // app background/foreground").
    const subscription = AppState.addEventListener("change", (nextState) => {
      if (nextState === "active") setNow(Date.now());
    });
    return () => subscription.remove();
  }, []);

  return {
    snapshot,
    elapsedSeconds: snapshot ? Math.max(0, Math.floor((now - snapshot.startedAt) / 1000)) : 0,
    cancel: () => adapter.cancel(jobId),
    retry: () => adapter.retry(jobId),
  };
}
