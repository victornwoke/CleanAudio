import { useCallback, useEffect, useMemo, useState } from "react";

import { filterProjects, isActiveJob, sortByRecency } from "@/features/library/libraryFilters";
import { useProjectStore } from "@/store/useProjectStore";
import type { LibraryFilter, LibraryProject } from "@/types/library";

export type LibraryLoadStatus = "loading" | "loaded" | "error";

let duplicateSequence = 0;

export interface LibraryUsage {
  planLabel: string;
  usedMinutes: number;
  quotaMinutes: number;
}

/**
 * Fetches the local project list. Backed by an in-memory placeholder fixture
 * today; the shape (async, throwable) matches what
 * `prompts/14-zustand-and-local-data.md`'s real local repository will
 * expose, so this hook's body won't need to change when that lands — only
 * this one function does.
 */
export interface UseLibraryScreenResult {
  status: LibraryLoadStatus;
  isEmpty: boolean;
  activeJobs: LibraryProject[];
  visibleProjects: LibraryProject[];
  totalProjectCount: number;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  filter: LibraryFilter;
  setFilter: (filter: LibraryFilter) => void;
  /** No live connectivity signal is wired yet (would need `expo-network` /
   * `@react-native-community/netinfo` — not installed; flagged rather than
   * added speculatively). Always `false` until a future prompt wires it. */
  isOffline: boolean;
  /** No real storage-quota signal exists yet (`prompts/16`); always `false`. */
  storageWarning: boolean;
  /** `undefined` until RevenueCat (`prompts/17`) supplies real usage — the
   * indicator only renders "when available" per the prompt's own wording. */
  usage: LibraryUsage | undefined;
  cancelJob: (id: string) => void;
  retryFailed: (id: string) => void;
  renameProject: (id: string, displayName: string) => void;
  duplicateProject: (id: string) => void;
  deleteProject: (id: string) => void;
  mutationError: string | null;
}

export function useLibraryScreen(): UseLibraryScreenResult {
  const projects = useProjectStore((state) => state.projects);
  const repositoryStatus = useProjectStore((state) => state.loadState);
  const load = useProjectStore((state) => state.load);
  const upsert = useProjectStore((state) => state.upsert);
  const remove = useProjectStore((state) => state.remove);
  const status: LibraryLoadStatus = repositoryStatus === "ready" ? "loaded" : repositoryStatus === "error" ? "error" : "loading";
  const [searchQuery, setSearchQuery] = useState("");
  const [mutationError, setMutationError] = useState<string | null>(null);
  const [filter, setFilter] = useState<LibraryFilter>("all");
  const mutate = useCallback(async (operation: () => Promise<void>) => {
    setMutationError(null);
    try { await operation(); } catch { setMutationError("Your change couldn’t be saved. Please try again."); }
  }, []);
  useEffect(() => {
    if (repositoryStatus === "idle") void load();
  }, [load, repositoryStatus]);

  const activeJobs = useMemo(
    () => sortByRecency(projects.filter(isActiveJob)),
    [projects],
  );

  const visibleProjects = useMemo(
    () => filterProjects(projects, filter, searchQuery),
    [projects, filter, searchQuery],
  );

  const cancelJob = useCallback((id: string) => {
    const project = projects.find((item) => item.id === id);
    if (project && isActiveJob(project)) void mutate(() => upsert({ ...project, processingState: "cancelled", processingProgress: undefined }));
  }, [mutate, projects, upsert]);

  const retryFailed = useCallback((id: string) => {
    const project = projects.find((item) => item.id === id);
    if (project?.processingState === "failed") void mutate(() => upsert({ ...project, processingState: "queued" }));
  }, [mutate, projects, upsert]);

  const renameProject = useCallback((id: string, displayName: string) => {
    const trimmed = displayName.trim();
    if (!trimmed) return;
    const project = projects.find((item) => item.id === id);
    if (project) void mutate(() => upsert({ ...project, displayName: trimmed }));
  }, [mutate, projects, upsert]);

  const duplicateProject = useCallback((id: string) => {
      const source = projects.find((project) => project.id === id);
      if (!source) return;
      const duplicate: LibraryProject = {
        ...source,
        id: `${source.id}_copy_${Date.now()}_${duplicateSequence++}`,
        displayName: `${source.displayName.replace(/(\.[^./]+)$/, "")} Copy${
          source.displayName.match(/(\.[^./]+)$/)?.[0] ?? ""
        }`,
        createdAt: new Date().toISOString(),
        exportStatus: "not_exported",
        syncState: "local_only",
        processingState: "not_processed",
        processingProgress: undefined,
        adapterUsed: undefined,
      };
      void mutate(async () => {
        const { localRepositories } = await import("@/services/repositories");
        await localRepositories.mediaFiles.cloneOwnedFiles(source.id, duplicate.id);
        try {
          await useProjectStore.getState().upsert(duplicate);
        } catch (error) {
          try { await localRepositories.mediaFiles.deleteOwnedFiles(duplicate.id); } catch { /* best-effort rollback */ }
          throw error;
        }
      });
  }, [mutate, projects]);

  const deleteProject = useCallback((id: string) => {
    void mutate(() => remove(id));
  }, [mutate, remove]);

  return {
    status,
    isEmpty: status === "loaded" && projects.length === 0,
    activeJobs,
    visibleProjects,
    totalProjectCount: projects.length,
    searchQuery,
    setSearchQuery,
    filter,
    setFilter,
    isOffline: false,
    storageWarning: false,
    usage: undefined,
    cancelJob,
    retryFailed,
    renameProject,
    duplicateProject,
    deleteProject,
    mutationError,
  };
}
