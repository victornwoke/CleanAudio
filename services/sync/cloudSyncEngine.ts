import { CloudApiError, type CloudProject, type SyncMutation } from "../../types/cloud";

export interface SyncMutationRepository {
  listReady(now: number): Promise<SyncMutation[]>;
  save(item: SyncMutation): Promise<void>;
  remove(id: string): Promise<void>;
}

export interface ProjectSyncRemote {
  patchProject(id: string, displayName: string, baseRevision: number, key: string): Promise<CloudProject>;
  deleteProject(id: string, baseRevision: number, key: string): Promise<CloudProject>;
}

export type ConflictStrategy = "server_wins_metadata_preserve_local_media";
export const CLOUD_CONFLICT_STRATEGY: ConflictStrategy = "server_wins_metadata_preserve_local_media";

export function retryDelayMs(attempts: number): number {
  return Math.min(60_000, 1_000 * 2 ** Math.min(attempts, 6));
}

/** Local operations stay queued while offline; entitlement gates only remote execution. */
export async function flushSyncQueue(
  queue: SyncMutationRepository,
  remote: ProjectSyncRemote,
  now: number,
  cloudEntitled: boolean,
): Promise<{ synced: number; conflicts: string[] }> {
  if (!cloudEntitled) return { synced: 0, conflicts: [] };
  let synced = 0; const conflicts: string[] = [];
  for (const item of await queue.listReady(now)) {
    try {
      if (item.operation === "delete") await remote.deleteProject(item.projectId, item.baseRevision, item.id);
      else await remote.patchProject(item.projectId, item.displayName ?? "Untitled", item.baseRevision, item.id);
      await queue.remove(item.id); synced += 1;
    } catch (error) {
      if (error instanceof CloudApiError && error.code === "conflict") { conflicts.push(item.projectId); await queue.remove(item.id); continue; }
      const attempts = item.attempts + 1;
      await queue.save({ ...item, attempts, nextAttemptAt: now + retryDelayMs(attempts) });
    }
  }
  return { synced, conflicts };
}
