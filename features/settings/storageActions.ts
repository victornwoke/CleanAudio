import { deleteHistoryProject } from "@/features/history/historyCatalog";
import { localRepositories } from "@/services/repositories";
import { usePreferencesStore } from "@/store/usePreferencesStore";
import type { ProjectHistory } from "@/types/history";

export type BulkStorageActionOutcome =
  | { ok: true; affectedCount: number }
  | { ok: false; reason: "nothing_to_clear" | "disabled_by_preference" };

/**
 * Removes only temporary/intermediate files across every local project —
 * never an original or a generated enhancement/export version
 * (`CLAUDE.md` §6 Storage rules: "never present cache clearing as deleting
 * originals unless it does" — this genuinely never does, regardless of the
 * "Keep Originals" preference). Reuses the same per-project
 * `mediaFiles.cleanupTemporary` repository method already built for the
 * processing pipeline rather than a new deletion path.
 */
export async function clearLocalCache(projectIds: readonly string[]): Promise<BulkStorageActionOutcome> {
  if (projectIds.length === 0) return { ok: false, reason: "nothing_to_clear" };
  await Promise.all(projectIds.map((id) => localRepositories.mediaFiles.cleanupTemporary(id)));
  return { ok: true, affectedCount: projectIds.length };
}

/**
 * Removes the local downloaded copy of every project that also has a
 * confirmed cloud copy, reusing the exact per-project
 * `deleteHistoryProject(id, "downloaded_copy")` path File Detail already
 * ships (`features/history/historyCatalog.ts`) instead of a second
 * deletion implementation — it already refuses to touch a project whose
 * only copy is local. Gated by `keepOriginalsInCleanup`: when the user has
 * asked Settings to keep local originals, this bulk action refuses to run
 * rather than silently doing nothing per project with no explanation
 * (`AGENTS.md` §20 — no placeholder buttons that appear functional but do
 * nothing).
 */
export async function removeDownloadedCopies(
  histories: readonly ProjectHistory[]
): Promise<BulkStorageActionOutcome> {
  if (usePreferencesStore.getState().keepOriginalsInCleanup) {
    return { ok: false, reason: "disabled_by_preference" };
  }
  const eligible = histories.filter((history) => history.original.storageLocation === "local_and_cloud");
  if (eligible.length === 0) return { ok: false, reason: "nothing_to_clear" };
  for (const history of eligible) {
    await deleteHistoryProject(history.project.id, "downloaded_copy");
  }
  return { ok: true, affectedCount: eligible.length };
}
