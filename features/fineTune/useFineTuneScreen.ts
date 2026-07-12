import { useNavigation } from "expo-router";
import { useEffect, useRef, useState } from "react";
import { Alert } from "react-native";

import { goToProcessing } from "@/features/audio/audioProjectNavigation";
import { areFineTuneSettingsEqual, getAutoFineTuneSettings } from "@/features/fineTune/fineTuneDefaults";
import { getEnhancedAudioResult, type EnhancedAudioResult } from "@/features/review/enhancedAudioResult";
import { useReviewPlayback, type UseReviewPlaybackResult } from "@/features/review/useReviewPlayback";
import { track } from "@/lib/analytics/events";
import type { AudioProject } from "@/types/audio";
import type { FineTuneControlId, FineTuneSettings, LoudnessTargetId } from "@/types/fineTune";
import type { PresetId } from "@/types/onboarding";

export interface UseFineTuneScreenResult {
  settings: FineTuneSettings;
  /** `true` once `settings` differs from the Auto Enhance baseline it was
   * loaded with — drives the "Reset to Auto" shortcut and the
   * leave-with-unapplied-changes prompt. */
  isDirty: boolean;
  updateControl: (id: FineTuneControlId, value: number) => void;
  setAiEnhancementEnabled: (enabled: boolean) => void;
  setLoudnessTarget: (id: LoudnessTargetId) => void;
  resetToAuto: () => void;
  playback: UseReviewPlaybackResult;
  isLoadingEnhancedResult: boolean;
  isApplying: boolean;
  apply: () => void;
}

/**
 * State/behaviour for `app/fine-tune/[projectId].tsx`
 * (`prompts/11-manual-fine-tune.md`). No enhancement adapter reads these
 * settings yet (`prompts/15-audio-domain-and-adapters.md` is not-started),
 * so "Apply" is an honest hand-off to a new processing job — a genuine,
 * non-destructive new version — rather than a fabricated instant re-render
 * of the audio (`CLAUDE.md` §8), the same structural hand-off pattern
 * `usePresetSelectionScreen.ts#confirm` already uses.
 */
export function useFineTuneScreen(project: AudioProject): UseFineTuneScreenResult {
  const autoSettingsRef = useRef(getAutoFineTuneSettings(project));
  const [settings, setSettings] = useState<FineTuneSettings>(autoSettingsRef.current);
  const isDirty = !areFineTuneSettingsEqual(settings, autoSettingsRef.current);

  useEffect(() => {
    track({ name: "fine_tune_opened", properties: { presetId: project.presetId ?? null } });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [project.id]);

  const [enhancedResult, setEnhancedResult] = useState<EnhancedAudioResult | null>(null);
  const [isLoadingEnhancedResult, setIsLoadingEnhancedResult] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setIsLoadingEnhancedResult(true);
    getEnhancedAudioResult(project).then((result) => {
      if (cancelled) return;
      setEnhancedResult(result);
      setIsLoadingEnhancedResult(false);
    });
    return () => {
      cancelled = true;
    };
  }, [project]);

  const playback = useReviewPlayback(project, enhancedResult);

  const [isApplying, setIsApplying] = useState(false);
  const isApplyingRef = useRef(false);

  const navigation = useNavigation();
  useEffect(() => {
    const unsubscribe = navigation.addListener("beforeRemove", (event) => {
      if (!isDirty || isApplyingRef.current) return;
      event.preventDefault();
      Alert.alert(
        "Discard changes?",
        "You have unapplied adjustments. Leaving now will discard them.",
        [
          { text: "Keep editing", style: "cancel" },
          {
            text: "Discard",
            style: "destructive",
            onPress: () => navigation.dispatch(event.data.action),
          },
        ],
      );
    });
    return unsubscribe;
  }, [navigation, isDirty]);

  function updateControl(id: FineTuneControlId, value: number): void {
    setSettings((prev) => (prev.aiEnhancementEnabled ? prev : { ...prev, [id]: value }));
  }

  function setAiEnhancementEnabled(enabled: boolean): void {
    setSettings((prev) =>
      enabled ? { ...autoSettingsRef.current, aiEnhancementEnabled: true } : { ...prev, aiEnhancementEnabled: false },
    );
  }

  function setLoudnessTarget(id: LoudnessTargetId): void {
    setSettings((prev) => ({ ...prev, loudnessTarget: id }));
  }

  function resetToAuto(): void {
    setSettings(autoSettingsRef.current);
    track({ name: "fine_tune_reset" });
  }

  function apply(): void {
    isApplyingRef.current = true;
    setIsApplying(true);
    track({
      name: "fine_tune_applied",
      properties: {
        aiEnhancementEnabled: settings.aiEnhancementEnabled,
        loudnessTarget: settings.loudnessTarget,
        adjusted: isDirty,
      },
    });
    const presetId: PresetId = project.presetId ?? "podcast";
    goToProcessing(project, presetId);
  }

  return {
    settings,
    isDirty,
    updateControl,
    setAiEnhancementEnabled,
    setLoudnessTarget,
    resetToAuto,
    playback,
    isLoadingEnhancedResult,
    isApplying,
    apply,
  };
}
