import { router } from "expo-router";

import type { AudioProject } from "@/types/audio";

/**
 * Single hand-off point used by both the Record and Import flows so a
 * project created either way feeds the same next step
 * (`prompts/07-record-and-import.md` acceptance criteria: "Imported and
 * recorded media produce the same `AudioProject` model"). Preset selection
 * (`prompts/08-preset-selection.md`) isn't built yet — `presets.tsx` is
 * still the `prompts/03` route placeholder — so this only hands off the
 * project's identifying fields as route params; nothing reads them yet.
 */
export function goToPresetSelection(project: AudioProject): void {
  router.push({
    pathname: "/presets",
    params: {
      projectId: project.id,
      displayName: project.displayName,
      mediaType: project.mediaType,
      source: project.source,
      sourceUri: project.sourceUri,
      container: project.container,
      durationSeconds: project.durationSeconds === null ? "" : String(project.durationSeconds),
      sizeBytes: String(project.sizeBytes),
      needsAudioExtraction: project.needsAudioExtraction ? "1" : "0",
    },
  });
}
