import { track } from "@/lib/analytics/events";
import { localRepositories } from "@/services/repositories";
import type { DeleteResult, DeleteScope, ProjectHistory } from "@/types/history";

export async function listProjectHistories(): Promise<ProjectHistory[]> {
  return localRepositories.versions.listHistories();
}

export async function getProjectHistory(projectId: string): Promise<ProjectHistory | null> {
  return localRepositories.versions.getHistory(projectId);
}

export async function renameHistoryProject(projectId: string, displayName: string): Promise<ProjectHistory | null> {
  const project = await localRepositories.projects.get(projectId);
  const trimmed = displayName.trim();
  if (!project || !trimmed) return getProjectHistory(projectId);
  await localRepositories.projects.upsert({ ...project, displayName: trimmed });
  return getProjectHistory(projectId);
}

export async function deleteHistoryProject(projectId: string, scope: DeleteScope): Promise<DeleteResult> {
  const history = await getProjectHistory(projectId);
  if (!history) return { status: "unavailable", message: "This project has already been removed." };
  if (scope === "downloaded_copy" && history.original.storageLocation === "cloud") {
    return { status: "unavailable", message: "There is no downloaded copy on this device." };
  }
  if (scope === "downloaded_copy" && history.original.storageLocation !== "local_and_cloud") {
    return { status: "unavailable", message: "This is the only local copy. Delete the local project instead." };
  }
  if (scope === "downloaded_copy" || (scope === "local_and_cloud" && history.original.storageLocation !== "local")) {
    try {
      await localRepositories.projects.upsert({ ...history.project, syncState: "cloud_placeholder" });
      await localRepositories.versions.putOriginal(projectId, { ...history.original, storageLocation: "cloud" });
    } catch {
      await Promise.allSettled([
        localRepositories.projects.upsert(history.project),
        localRepositories.versions.putOriginal(projectId, history.original),
      ]);
      return { status: "unavailable", message: "The local deletion could not be saved. Please try again." };
    }
    if (scope !== "local_and_cloud") track({ name: "project_deleted", properties: { scope } });
    return scope === "local_and_cloud"
      ? { status: "partial", message: "Local copies were removed, but cloud deletion needs the sync service and could not be confirmed." }
      : { status: "deleted" };
  }
  await localRepositories.projects.remove(projectId);
  try { await localRepositories.mediaFiles.deleteOwnedFiles(projectId); } catch { /* best effort */ }
  track({ name: "project_deleted", properties: { scope } });
  return { status: "deleted" };
}
