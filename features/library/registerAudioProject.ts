import { iconNames } from "@/constants/images";
import { localRepositories } from "@/services/repositories";
import { useProjectStore } from "@/store/useProjectStore";
import type { AudioProject } from "@/types/audio";
import type { LibraryProject } from "@/types/library";

/** Registers genuine imported/recorded media in durable Library + History. */
export async function registerAudioProject(project: AudioProject): Promise<void> {
  const libraryProject: LibraryProject = {
    id: project.id,
    displayName: project.displayName,
    mediaType: project.mediaType,
    durationSeconds: project.durationSeconds,
    createdAt: project.createdAt,
    processingState: "not_processed",
    syncState: "local_only",
    exportStatus: "not_exported",
    thumbnailIcon: project.mediaType === "video" ? iconNames.personaSocialVideos : iconNames.podcastMode,
    presetId: project.presetId,
    sizeBytes: project.sizeBytes,
  };
  await useProjectStore.getState().upsert(libraryProject);
  await localRepositories.mediaFiles.registerOriginal(project);
  await localRepositories.versions.putOriginal(project.id, {
    id: `${project.id}_original`,
    kind: "original",
    createdAt: project.createdAt,
    container: project.container.toUpperCase(),
    sizeBytes: project.sizeBytes,
    storageLocation: "local",
  });
}
