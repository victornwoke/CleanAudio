import type { LibraryFilter, LibraryProject } from "@/types/library";

/** Jobs still in flight — shown in the "active processing jobs" section. */
export function isActiveJob(project: LibraryProject): boolean {
  return project.processingState === "queued" || project.processingState === "processing";
}

export function sortByRecency(projects: readonly LibraryProject[]): LibraryProject[] {
  return [...projects].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );
}

function matchesFilter(project: LibraryProject, filter: LibraryFilter): boolean {
  switch (filter) {
    case "all":
      return true;
    case "audio":
      return project.mediaType === "audio";
    case "video":
      return project.mediaType === "video";
    case "processing":
      return isActiveJob(project);
    case "enhanced":
      return project.processingState === "processed";
  }
}

function matchesQuery(project: LibraryProject, query: string): boolean {
  if (!query.trim()) return true;
  return project.displayName.toLowerCase().includes(query.trim().toLowerCase());
}

export function filterProjects(
  projects: readonly LibraryProject[],
  filter: LibraryFilter,
  query: string,
): LibraryProject[] {
  return sortByRecency(projects).filter(
    (project) => matchesFilter(project, filter) && matchesQuery(project, query),
  );
}

/**
 * Deletion consequences differ by residency (acceptance criterion:
 * "Deleting a project explains local/cloud consequences", `prompts/06`).
 */
export function getDeleteConsequenceMessage(project: LibraryProject): string {
  switch (project.syncState) {
    case "local_only":
      return `"${project.displayName}" only exists on this device. Deleting it removes the file permanently — it has not been backed up to the cloud.`;
    case "syncing":
      return `"${project.displayName}" is still syncing to the cloud. Deleting it now removes the local copy and cancels the upload.`;
    case "cloud_placeholder":
      return `"${project.displayName}" is stored in your cloud library and hasn't been downloaded to this device. Deleting it removes it from the cloud library too.`;
    case "synced":
      return `"${project.displayName}" is backed up to your cloud library. Deleting it removes both the copy on this device and the cloud copy.`;
  }
}
