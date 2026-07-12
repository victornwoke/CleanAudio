import type { AudioProject } from "@/types/audio";
import type { EnhancementAdapter } from "@/types/library";
import { localRepositories } from "@/services/repositories";

export interface EnhancedAudioResult {
  /** Local file URI of the genuine enhanced output. */
  uri: string;
  adapter: EnhancementAdapter;
  durationSeconds: number | null;
}

const results = new Map<string, EnhancedAudioResult>();

export function storeEnhancedAudioResult(projectId: string, result: EnhancedAudioResult): void {
  results.set(projectId, result);
}

/** In-process lookup for a genuine enhanced file produced by the cloud job. */
export async function getEnhancedAudioResult(
  project: AudioProject,
): Promise<EnhancedAudioResult | null> {
  const cached = results.get(project.id);
  if (cached) return cached;
  const media = await localRepositories.mediaFiles.listForProject(project.id);
  const generated = media
    .filter((item) => item.ownership === "generated")
    .sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt))[0];
  return generated
    ? { uri: generated.uri, adapter: "cloud", durationSeconds: project.durationSeconds }
    : null;
}
