import { useLocalSearchParams } from "expo-router";
import { useEffect, useMemo, useState } from "react";

import { goToProcessing } from "@/features/audio/audioProjectNavigation";
import { getPresetRecommendation } from "@/features/presets/presetRecommendation";
import type { AudioProject, AudioProjectSource, MediaContainer } from "@/types/audio";
import type { MediaType } from "@/types/library";
import type { PresetId } from "@/types/onboarding";
import type { PresetRecommendation } from "@/types/presets";

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
const VALID_PRESET_IDS: readonly PresetId[] = [
  "podcast",
  "social_clip",
  "field_interview",
  "classroom_lecture",
  "call_meeting",
];

interface RouteParams {
  [key: string]: string | string[];
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
  presetId: string;
}

/**
 * Reconstructs the `AudioProject` handed off by
 * `features/audio/audioProjectNavigation.ts#goToPresetSelection`. Returns
 * `null` on any missing/malformed required field rather than guessing, so
 * the screen can render a recoverable not-found state instead of crashing
 * on a bad deep link (`AGENTS.md` §15).
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
    presetId,
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

  const resolvedPresetId = VALID_PRESET_IDS.find((id) => id === presetId);

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
    presetId: resolvedPresetId,
  };
}

export type PresetSelectionStatus = "loading" | "ready" | "invalid";

/**
 * State/behaviour for `app/presets.tsx` (`prompts/08-preset-selection.md`).
 * Runs the (currently persona-default-only, see `presetRecommendation.ts`)
 * recommendation lookup on entry, tracks the user's selection, and hands
 * off to processing once confirmed.
 */
export function usePresetSelectionScreen() {
  const params = useLocalSearchParams<RouteParams>();
  const project = useMemo(() => parseAudioProject(params), [params]);

  const [recommendation, setRecommendation] = useState<PresetRecommendation | null>(null);
  const [selectedId, setSelectedId] = useState<PresetId | "auto">("auto");
  const [completedRecommendationKey, setCompletedRecommendationKey] = useState<string | null>(null);
  const recommendationRequestKey = project
    ? JSON.stringify([project.id, project.presetId ?? null])
    : null;

  useEffect(() => {
    if (!project) return;
    let cancelled = false;
    const requestKey = JSON.stringify([project.id, project.presetId ?? null]);

    getPresetRecommendation(project).then((result) => {
      if (cancelled) return;
      setRecommendation(result);
      setSelectedId(result.source === "carried_over" ? result.presetId : "auto");
      setCompletedRecommendationKey(requestKey);
    });

    return () => {
      cancelled = true;
    };
    // Only the identifying fields matter for re-running the lookup; the
    // reconstructed `project` object is recreated every render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [project?.id, project?.presetId]);

  const effectivePresetId: PresetId | null = useMemo(() => {
    if (selectedId !== "auto") return selectedId;
    return recommendation?.presetId ?? null;
  }, [selectedId, recommendation]);

  const status: PresetSelectionStatus = !project
    ? "invalid"
    : completedRecommendationKey === recommendationRequestKey
      ? "ready"
      : "loading";

  function selectPreset(id: PresetId): void {
    setSelectedId(id);
  }

  function useAutoRecommendation(): void {
    setSelectedId("auto");
  }

  function confirm(): void {
    if (!project || !effectivePresetId) return;
    goToProcessing(project, effectivePresetId);
  }

  return {
    status,
    recommendation,
    selectedId,
    effectivePresetId,
    selectPreset,
    useAutoRecommendation,
    confirm,
    showUseAutoShortcut: selectedId !== "auto",
  };
}
