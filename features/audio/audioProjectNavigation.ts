import { router } from "expo-router";

import type { AudioProject } from "@/types/audio";
import type { PresetId } from "@/types/onboarding";

function getAudioProjectRouteParams(project: AudioProject) {
  return {
    displayName: project.displayName,
    mediaType: project.mediaType,
    source: project.source,
    sourceUri: project.sourceUri,
    container: project.container,
    durationSeconds: project.durationSeconds === null ? "" : String(project.durationSeconds),
    sizeBytes: String(project.sizeBytes),
    createdAt: project.createdAt,
    needsAudioExtraction: project.needsAudioExtraction ? "1" : "0",
  };
}

/**
 * Single hand-off point used by both the Record and Import flows so a
 * project created either way feeds the same next step
 * (`prompts/07-record-and-import.md` acceptance criteria: "Imported and
 * recorded media produce the same `AudioProject` model"). `presets.tsx`
 * (`prompts/08-preset-selection.md`) reconstructs the full `AudioProject`
 * from these flattened params, so every field the type requires — including
 * `createdAt` and an already-chosen `presetId` from Record's preset
 * shortcut — is forwarded, not just the subset a placeholder screen needed.
 */
export function goToPresetSelection(project: AudioProject): void {
  router.push({
    pathname: "/presets",
    params: {
      projectId: project.id,
      ...getAudioProjectRouteParams(project),
      presetId: project.presetId ?? "",
    },
  });
}

/**
 * Hand-off from preset selection to the processing screen. No enhancement
 * job exists yet — job creation is a typed adapter concern
 * (`prompts/09-processing-screen.md` / `prompts/15-audio-domain-and-adapters.md`),
 * not built here. The project's own id is reused as the route's `jobId`
 * segment purely so the existing `processing/[jobId]` placeholder
 * (`prompts/03`) has a non-empty id to render against — this is a
 * structural hand-off, not a claim that processing has started
 * (`CLAUDE.md` §8).
 */
export function goToProcessing(project: AudioProject, presetId: PresetId): void {
  router.push({
    pathname: "/processing/[jobId]",
    params: {
      jobId: project.id,
      projectId: project.id,
      presetId,
      ...getAudioProjectRouteParams(project),
    },
  });
}
