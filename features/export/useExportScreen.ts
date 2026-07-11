import { router } from "expo-router";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import * as Sharing from "expo-sharing";

import { getPresetDefinition } from "@/features/presets/presetCatalog";
import { estimateExportSizeBytes } from "@/features/export/estimateExportSize";
import {
  getDefaultQualityForFormat,
  getQualityOption,
  getQualityOptionsForFormat,
} from "@/features/export/exportQualityOptions";
import { loudnessTargetForLufs } from "@/features/fineTune/fineTuneDefaults";
import { getEnhancedAudioResult, type EnhancedAudioResult } from "@/features/review/enhancedAudioResult";
import { useEntitlementStatus } from "@/features/subscriptions/useEntitlementStatus";
import { track } from "@/lib/analytics/events";
import { developmentMockExportAdapter } from "@/services/audio/exportAdapter";
import type { AudioProject } from "@/types/audio";
import type {
  ExportFormat,
  ExportJobSnapshot,
  ExportQualityId,
  ExportSettings,
} from "@/types/export";
import type { LoudnessTargetId } from "@/types/fineTune";

const DEFAULT_PRESET_ID = "podcast" as const;

function getDefaultSettings(project: AudioProject): ExportSettings {
  const presetId = project.presetId ?? DEFAULT_PRESET_ID;
  const lufs = getPresetDefinition(presetId).defaultLoudnessTargetLufs;
  return {
    format: "mp3",
    qualityId: "mp3_128",
    loudnessTarget: loudnessTargetForLufs(lufs),
    removeWatermark: false,
  };
}

export interface UseExportScreenResult {
  settings: ExportSettings;
  isLoadingEnhancedResult: boolean;
  enhancedResult: EnhancedAudioResult | null;
  /** Non-null explanation for why the export form can't be shown — mirrors
   * the review screen's `exportDisabledReason` gate. */
  unavailableReason: string | null;
  isPro: boolean;
  qualityOptions: ReturnType<typeof getQualityOptionsForFormat>;
  selectedQuality: ReturnType<typeof getQualityOption>;
  estimatedSizeBytes: number | null;
  selectFormat: (format: ExportFormat) => void;
  selectQuality: (id: ExportQualityId) => void;
  selectLoudnessTarget: (id: LoudnessTargetId) => void;
  toggleRemoveWatermark: () => void;
  job: ExportJobSnapshot | null;
  startExport: () => void;
  cancelExport: () => void;
  retryExport: () => void;
  /** Returns to the configuration form after a failed/cancelled job —
   * settings are untouched, per this prompt's own acceptance criterion
   * ("Failed export keeps the enhanced version and settings"). */
  resetJob: () => void;
  share: () => void;
  goEnhanceAnother: () => void;
  goLibrary: () => void;
}

/**
 * Screen-level composition for the export screen
 * (`prompts/12-export-and-success.md`). No real enhancement adapter exists
 * yet (`prompts/15-audio-domain-and-adapters.md`), so `enhancedResult`
 * always resolves `null` today and the form stays in its honest
 * `unavailableReason` state — the same gate the review screen's own Export
 * button already applies (`features/review/useReviewScreen.ts`).
 */
export function useExportScreen(project: AudioProject): UseExportScreenResult {
  const [resolved, setResolved] = useState<{ projectId: string; result: EnhancedAudioResult | null } | null>(
    null,
  );
  const enhancedResult = resolved?.projectId === project.id ? resolved.result : null;
  const isLoadingEnhancedResult = resolved?.projectId !== project.id;

  useEffect(() => {
    let cancelled = false;
    getEnhancedAudioResult(project).then((result) => {
      if (cancelled) return;
      setResolved({ projectId: project.id, result });
    });
    return () => {
      cancelled = true;
    };
  }, [project]);

  const [settings, setSettings] = useState<ExportSettings>(() => getDefaultSettings(project));
  const { isPro } = useEntitlementStatus();

  const [job, setJob] = useState<ExportJobSnapshot | null>(null);
  const unsubscribeRef = useRef<(() => void) | null>(null);
  const hasTrackedCompletionRef = useRef<string | null>(null);

  useEffect(() => {
    return () => unsubscribeRef.current?.();
  }, []);

  const qualityOptions = useMemo(() => getQualityOptionsForFormat(settings.format), [settings.format]);
  const selectedQuality = useMemo(() => getQualityOption(settings.qualityId), [settings.qualityId]);

  const estimatedSizeBytes = useMemo(
    () => estimateExportSizeBytes(project.durationSeconds, settings.qualityId),
    [project.durationSeconds, settings.qualityId],
  );

  const unavailableReason = enhancedResult
    ? null
    : "Export needs a completed enhanced version of this recording.";

  const handleSnapshot = useCallback((snapshot: ExportJobSnapshot) => {
    setJob(snapshot);
    if (snapshot.status === "completed" && hasTrackedCompletionRef.current !== project.id) {
      hasTrackedCompletionRef.current = project.id;
      track({ name: "export_completed", properties: { format: settings.format } });
      if (snapshot.result) {
        void Sharing.isAvailableAsync()
          .then((available) => available ? Sharing.shareAsync(snapshot.result!.uri) : undefined)
          .catch(() => undefined);
      }
    }
    if (snapshot.status === "failed" && snapshot.errorCode) {
      track({ name: "export_failed", properties: { errorCode: snapshot.errorCode } });
    }
  }, [project.id, settings.format]);

  function selectFormat(format: ExportFormat): void {
    setSettings((current) => ({
      ...current,
      format,
      qualityId: getDefaultQualityForFormat(format),
    }));
  }

  function selectQuality(id: ExportQualityId): void {
    const option = getQualityOption(id);
    if (option.requiresPro && !isPro) {
      router.push("/paywall");
      return;
    }
    setSettings((current) => ({ ...current, qualityId: id }));
  }

  function selectLoudnessTarget(id: LoudnessTargetId): void {
    setSettings((current) => ({ ...current, loudnessTarget: id }));
  }

  function toggleRemoveWatermark(): void {
    if (!isPro) {
      router.push("/paywall");
      return;
    }
    setSettings((current) => ({ ...current, removeWatermark: !current.removeWatermark }));
  }

  function startExport(): void {
    if (!enhancedResult || job?.status === "exporting") return;
    unsubscribeRef.current?.();
    unsubscribeRef.current = developmentMockExportAdapter.start(
      {
        jobId: project.id,
        sourceUri: enhancedResult.uri,
        sourceAdapter: enhancedResult.adapter,
        settings,
        displayName: project.displayName,
      },
      handleSnapshot,
    );
  }

  function cancelExport(): void {
    developmentMockExportAdapter.cancel(project.id);
  }

  function resetJob(): void {
    unsubscribeRef.current?.();
    unsubscribeRef.current = null;
    setJob(null);
  }

  function retryExport(): void {
    if (!enhancedResult) return;
    unsubscribeRef.current?.();
    unsubscribeRef.current = developmentMockExportAdapter.retry(
      project.id,
      {
        jobId: project.id,
        sourceUri: enhancedResult.uri,
        sourceAdapter: enhancedResult.adapter,
        settings,
        displayName: project.displayName,
      },
      handleSnapshot,
    );
  }

  const share = useCallback(() => {
    if (!job?.result) return;
    Sharing.isAvailableAsync().then((available) => {
      if (!available) return;
      return Sharing.shareAsync(job.result!.uri);
    }).catch(() => undefined);
  }, [job]);

  function goEnhanceAnother(): void {
    router.push("/import");
  }

  function goLibrary(): void {
    router.replace("/(tabs)/library");
  }

  return {
    settings,
    isLoadingEnhancedResult,
    enhancedResult,
    unavailableReason,
    isPro,
    qualityOptions,
    selectedQuality,
    estimatedSizeBytes,
    selectFormat,
    selectQuality,
    selectLoudnessTarget,
    toggleRemoveWatermark,
    job,
    startExport,
    cancelExport,
    retryExport,
    resetJob,
    share,
    goEnhanceAnother,
    goLibrary,
  };
}
