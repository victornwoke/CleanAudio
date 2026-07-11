import AsyncStorage from "@react-native-async-storage/async-storage";

import type { AudioProject } from "@/types/audio";

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

export async function getRecentImports(): Promise<AudioProject[]> {
  const raw = await AsyncStorage.getItem(RECENT_IMPORTS_KEY);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
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
