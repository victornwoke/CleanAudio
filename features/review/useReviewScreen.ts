import { useEffect, useRef, useState } from "react";

import { goToExport, goToFineTune } from "@/features/audio/audioProjectNavigation";
import { track } from "@/lib/analytics/events";
import type { AudioProject } from "@/types/audio";
import type { ReviewFeedbackReason } from "@/types/review";

import { getEnhancedAudioResult, type EnhancedAudioResult } from "./enhancedAudioResult";
import { useReviewPlayback, type UseReviewPlaybackResult } from "./useReviewPlayback";

export interface UseReviewScreenResult {
  project: AudioProject;
  /** `true` only while the (currently near-instant) enhancement-result
   * lookup hasn't resolved yet — a genuine loading state, not a fabricated
   * delay. */
  isLoadingEnhancedResult: boolean;
  enhancedResult: EnhancedAudioResult | null;
  playback: UseReviewPlaybackResult;
  isFeedbackSheetVisible: boolean;
  openFeedbackSheet: () => void;
  closeFeedbackSheet: () => void;
  submitFeedback: (reason: ReviewFeedbackReason) => void;
  feedbackAcknowledged: boolean;
  goAdjust: () => void;
  goExport: () => void;
  /** Non-null explanation for why Export is disabled — acceptance
   * criterion: "Export is disabled with an explanation if the enhanced
   * file is unavailable." */
  exportDisabledReason: string | null;
}

/**
 * Screen-level composition for the before/after review screen
 * (`prompts/10-before-after-review.md`). Takes an already-validated
 * `AudioProject` (the caller renders a recoverable not-found state first,
 * same split as `processing/[jobId].tsx`'s `ResolvedProcessingScreen`) so
 * every hook below can run unconditionally.
 */
export function useReviewScreen(project: AudioProject): UseReviewScreenResult {
  const [resolvedEnhancedResult, setEnhancedResult] = useState<{
    projectId: string;
    result: EnhancedAudioResult | null;
  } | null>(null);
  const enhancedResult =
    resolvedEnhancedResult?.projectId === project.id ? resolvedEnhancedResult.result : null;
  const isLoadingEnhancedResult = resolvedEnhancedResult?.projectId !== project.id;

  useEffect(() => {
    let cancelled = false;
    getEnhancedAudioResult(project).then((result) => {
      if (cancelled) return;
      setEnhancedResult({ projectId: project.id, result });
    });
    return () => {
      cancelled = true;
    };
  }, [project]);

  const playback = useReviewPlayback(project, enhancedResult);

  const [isFeedbackSheetVisible, setFeedbackSheetVisible] = useState(false);
  const [feedbackAcknowledged, setFeedbackAcknowledged] = useState(false);
  const acknowledgementTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (acknowledgementTimeoutRef.current) clearTimeout(acknowledgementTimeoutRef.current);
    };
  }, []);

  function openFeedbackSheet(): void {
    setFeedbackSheetVisible(true);
  }

  function closeFeedbackSheet(): void {
    setFeedbackSheetVisible(false);
  }

  function submitFeedback(reason: ReviewFeedbackReason): void {
    // Structured reason only — never the source audio itself (prompt's own
    // "Do not upload source audio without explicit support consent").
    track({ name: "review_feedback_submitted", properties: { reason } });
    setFeedbackSheetVisible(false);
    setFeedbackAcknowledged(true);
    if (acknowledgementTimeoutRef.current) clearTimeout(acknowledgementTimeoutRef.current);
    acknowledgementTimeoutRef.current = setTimeout(() => setFeedbackAcknowledged(false), 4000);
  }

  function goAdjust(): void {
    goToFineTune(project);
  }

  function goExport(): void {
    if (!playback.enhancedAvailable) return;
    goToExport(project);
  }

  const exportDisabledReason = playback.enhancedAvailable
    ? null
    : "Export needs a completed enhanced version of this recording.";

  return {
    project,
    isLoadingEnhancedResult,
    enhancedResult,
    playback,
    isFeedbackSheetVisible,
    openFeedbackSheet,
    closeFeedbackSheet,
    submitFeedback,
    feedbackAcknowledged,
    goAdjust,
    goExport,
    exportDisabledReason,
  };
}
