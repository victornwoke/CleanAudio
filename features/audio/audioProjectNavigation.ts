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

/**
 * Hand-off from the before/after review screen to manual fine-tune
 * (`prompts/11-manual-fine-tune.md`). Forwards the full `AudioProject`, not
 * just `projectId` — a bare id was enough for the `prompts/03` placeholder
 * this replaces, but left the real screen with no `sourceUri` to preview or
 * reconstruct a project from, the same class of hand-off bug already fixed
 * once for Processing → Review (see `docs/implementation-status.md`).
 */
export function goToFineTune(project: AudioProject): void {
  router.push({
    pathname: "/fine-tune/[projectId]",
    params: {
      projectId: project.id,
      ...getAudioProjectRouteParams(project),
    },
  });
}

/**
 * Hand-off from processing to the before/after review screen
 * (`prompts/10-before-after-review.md`). The review screen reconstructs
 * the full `AudioProject` the same way `presets.tsx`/the processing screen
 * do, so every field must be forwarded here too — not just `projectId` (a
 * bare id was enough for the `prompts/03` placeholder this replaces, but
 * left the real screen with no source audio to play).
 */
export function goToReview(project: AudioProject, options?: { replace?: boolean }): void {
  const target = {
    pathname: "/review/[projectId]" as const,
    params: {
      projectId: project.id,
      ...getAudioProjectRouteParams(project),
    },
  };
  if (options?.replace) {
    router.replace(target);
  } else {
    router.push(target);
  }
}

/**
 * Hand-off from the before/after review screen to export
 * (`prompts/12-export-and-success.md`). Forwards the full `AudioProject`,
 * not just `projectId` — the same bare-id hand-off bug already caught and
 * fixed once for every other screen transition in this app (see
 * `docs/implementation-status.md`); a bare id here would leave the export
 * screen with no `sourceUri` to reconstruct a project from.
 */
export function goToExport(project: AudioProject): void {
  router.push({
    pathname: "/export/[projectId]",
    params: {
      projectId: project.id,
      ...getAudioProjectRouteParams(project),
    },
  });
}
