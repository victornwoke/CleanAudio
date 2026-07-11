import AsyncStorage from "@react-native-async-storage/async-storage";

import type { AudioProject } from "@/types/audio";
import type { MediaType } from "@/types/library";
import type { PresetId } from "@/types/onboarding";

/**
 * Lightweight "recent local imports" list (Import UI's own requirement,
 * `prompts/07-record-and-import.md`). AsyncStorage is approved for this —
 * it's a local file URI plus safe metadata, not raw media, a signed URL, or
 * a token (`AGENTS.md` §13/§14). The real cross-device library/history list
 * is `prompts/14`'s local repository; this is scoped to the Import screen's
 * own "recent" shortcut only.
 */
const RECENT_IMPORTS_KEY = "cleanaudio.import.recent";
const MAX_RECENT_IMPORTS = 5;

const MEDIA_TYPES: readonly MediaType[] = ["audio", "video"];
const SOURCES = ["recorded", "imported"] as const;
const CONTAINERS = ["mp3", "m4a", "wav", "flac", "aac", "aiff", "mp4", "mov"] as const;
const PRESET_IDS: readonly PresetId[] = [
  "podcast",
  "social_clip",
  "field_interview",
  "classroom_lecture",
  "call_meeting",
];

export function isAudioProject(value: unknown): value is AudioProject {
  if (!value || typeof value !== "object") return false;
  const project = value as Record<string, unknown>;
  return (
    typeof project.id === "string" &&
    project.id.length > 0 &&
    typeof project.displayName === "string" &&
    project.displayName.length > 0 &&
    typeof project.mediaType === "string" &&
    MEDIA_TYPES.includes(project.mediaType as MediaType) &&
    typeof project.source === "string" &&
    SOURCES.includes(project.source as (typeof SOURCES)[number]) &&
    typeof project.sourceUri === "string" &&
    project.sourceUri.length > 0 &&
    typeof project.container === "string" &&
    CONTAINERS.includes(project.container as (typeof CONTAINERS)[number]) &&
    (project.durationSeconds === null ||
      (typeof project.durationSeconds === "number" &&
        Number.isFinite(project.durationSeconds) &&
        project.durationSeconds >= 0)) &&
    typeof project.sizeBytes === "number" &&
    Number.isFinite(project.sizeBytes) &&
    project.sizeBytes >= 0 &&
    typeof project.createdAt === "string" &&
    project.createdAt.length > 0 &&
    !Number.isNaN(Date.parse(project.createdAt)) &&
    typeof project.needsAudioExtraction === "boolean" &&
    (project.presetId === undefined ||
      (typeof project.presetId === "string" && PRESET_IDS.includes(project.presetId as PresetId)))
  );
}

export async function getRecentImports(): Promise<AudioProject[]> {
  try {
    const raw = await AsyncStorage.getItem(RECENT_IMPORTS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter(isAudioProject) : [];
  } catch {
    return [];
  }
}

export async function addRecentImport(project: AudioProject): Promise<void> {
  const current = await getRecentImports();
  const next = [project, ...current.filter((entry) => entry.id !== project.id)].slice(
    0,
    MAX_RECENT_IMPORTS,
  );
  await AsyncStorage.setItem(RECENT_IMPORTS_KEY, JSON.stringify(next));
}
