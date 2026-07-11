import { SAMPLE_LIBRARY_PROJECTS } from "@/features/library/sampleLibraryData";
import type { DeleteResult, DeleteScope, ProjectHistory } from "@/types/history";

const histories = new Map<string, ProjectHistory>();

function buildHistory(projectId: string): ProjectHistory | null {
  const project = SAMPLE_LIBRARY_PROJECTS.find((item) => item.id === projectId);
  if (!project) return null;

  const originalId = `${project.id}_original`;
  const hasSuccessfulEnhancement = project.processingState === "processed";
  const terminalAttempt = project.processingState === "failed" || project.processingState === "cancelled";
  const enhancementStatus = hasSuccessfulEnhancement
    ? "completed" as const
    : project.processingState === "failed"
      ? "failed" as const
      : "cancelled" as const;
  const enhancementId = `${project.id}_enhancement_1`;

  return {
    project: { ...project },
    original: {
      id: originalId,
      kind: "original",
      createdAt: project.createdAt,
      container: project.displayName.split(".").pop()?.toUpperCase() ?? project.mediaType.toUpperCase(),
      sizeBytes: project.sizeBytes,
      storageLocation:
        project.syncState === "synced"
          ? "local_and_cloud"
          : project.syncState === "cloud_placeholder"
            ? "cloud"
            : "local",
    },
    enhancements: hasSuccessfulEnhancement || terminalAttempt
      ? [{
          id: enhancementId,
          kind: "enhancement",
          sourceVersionId: originalId,
          createdAt: project.createdAt,
          status: enhancementStatus,
          presetId: project.presetId ?? "podcast",
          presetLabel: project.presetLabel ?? "Podcast",
          adapter: project.adapterUsed ?? "development-mock",
          modelVersion: project.adapterUsed === "development-mock" ? "Development sample" : "Unavailable",
          loudness: hasSuccessfulEnhancement
            ? { integratedLufs: -16.1, truePeakDbtp: -1.2, targetLufs: -16 }
            : undefined,
          failureMessage: project.processingState === "failed" ? "The enhancement did not complete." : undefined,
        }]
      : [],
    exports: project.exportStatus === "exported" && hasSuccessfulEnhancement
      ? [{
          id: `${project.id}_export_1`,
          kind: "export",
          sourceVersionId: enhancementId,
          createdAt: project.createdAt,
          status: "completed",
          format: "mp3",
          destination: "Files",
        }]
      : [],
  };
}

export async function listProjectHistories(): Promise<ProjectHistory[]> {
  for (const project of SAMPLE_LIBRARY_PROJECTS) {
    if (!histories.has(project.id)) {
      const history = buildHistory(project.id);
      if (history) histories.set(project.id, history);
    }
  }
  return [...histories.values()];
}

export async function getProjectHistory(projectId: string): Promise<ProjectHistory | null> {
  if (!histories.has(projectId)) {
    const history = buildHistory(projectId);
    if (history) histories.set(projectId, history);
  }
  return histories.get(projectId) ?? null;
}

export async function renameHistoryProject(projectId: string, displayName: string): Promise<ProjectHistory | null> {
  const history = await getProjectHistory(projectId);
  const trimmed = displayName.trim();
  if (!history || !trimmed) return history;
  const updated = { ...history, project: { ...history.project, displayName: trimmed } };
  histories.set(projectId, updated);
  return updated;
}

export async function deleteHistoryProject(projectId: string, scope: DeleteScope): Promise<DeleteResult> {
  const history = await getProjectHistory(projectId);
  if (!history) return { status: "unavailable", message: "This project has already been removed." };
  if (scope === "downloaded_copy" && history.original.storageLocation === "cloud") {
    return { status: "unavailable", message: "There is no downloaded copy on this device." };
  }
  if (scope === "downloaded_copy") {
    if (history.original.storageLocation !== "local_and_cloud") {
      return { status: "unavailable", message: "This is the only local copy. Delete the local project instead." };
    }
    histories.set(projectId, {
      ...history,
      project: { ...history.project, syncState: "cloud_placeholder" },
      original: { ...history.original, storageLocation: "cloud" },
    });
    return { status: "deleted" };
  }
  if (scope === "local_and_cloud" && history.original.storageLocation !== "local") {
    histories.set(projectId, {
      ...history,
      project: { ...history.project, syncState: "cloud_placeholder" },
      original: { ...history.original, storageLocation: "cloud" },
    });
    return {
      status: "partial",
      message: "Local copies were removed, but cloud deletion needs the sync service and could not be confirmed.",
    };
  }
  histories.delete(projectId);
  return { status: "deleted" };
}
