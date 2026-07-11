import { useCallback, useEffect, useMemo, useState } from "react";

import { filterProjects, isActiveJob, sortByRecency } from "@/features/library/libraryFilters";
import { SAMPLE_LIBRARY_PROJECTS } from "@/features/library/sampleLibraryData";
import type { LibraryFilter, LibraryProject } from "@/types/library";

export type LibraryLoadStatus = "loading" | "loaded" | "error";

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
async function loadProjects(): Promise<LibraryProject[]> {
  await new Promise((resolve) => setTimeout(resolve, 350));
  return [...SAMPLE_LIBRARY_PROJECTS];
}

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
  retryLoad: () => void;
  cancelJob: (id: string) => void;
  retryFailed: (id: string) => void;
  renameProject: (id: string, displayName: string) => void;
  duplicateProject: (id: string) => void;
  deleteProject: (id: string) => void;
}

export function useLibraryScreen(): UseLibraryScreenResult {
  const [status, setStatus] = useState<LibraryLoadStatus>("loading");
  const [projects, setProjects] = useState<LibraryProject[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filter, setFilter] = useState<LibraryFilter>("all");
  const [loadToken, setLoadToken] = useState(0);

  useEffect(() => {
    let cancelled = false;
    setStatus("loading");

    loadProjects()
      .then((loaded) => {
        if (cancelled) return;
        setProjects(loaded);
        setStatus("loaded");
      })
      .catch(() => {
        if (cancelled) return;
        setStatus("error");
      });

    return () => {
      cancelled = true;
    };
  }, [loadToken]);

  const retryLoad = useCallback(() => setLoadToken((token) => token + 1), []);

  const activeJobs = useMemo(
    () => sortByRecency(projects.filter(isActiveJob)),
    [projects],
  );

  const visibleProjects = useMemo(
    () => filterProjects(projects, filter, searchQuery),
    [projects, filter, searchQuery],
  );

  const cancelJob = useCallback((id: string) => {
    setProjects((current) =>
      current.map((project) =>
        project.id === id && isActiveJob(project)
          ? { ...project, processingState: "cancelled", processingProgress: undefined }
          : project,
      ),
    );
  }, []);

  const retryFailed = useCallback((id: string) => {
    setProjects((current) =>
      current.map((project) =>
        project.id === id && project.processingState === "failed"
          ? { ...project, processingState: "queued" }
          : project,
      ),
    );
  }, []);

  const renameProject = useCallback((id: string, displayName: string) => {
    const trimmed = displayName.trim();
    if (!trimmed) return;
    setProjects((current) =>
      current.map((project) => (project.id === id ? { ...project, displayName: trimmed } : project)),
    );
  }, []);

  const duplicateProject = useCallback((id: string) => {
    setProjects((current) => {
      const source = current.find((project) => project.id === id);
      if (!source) return current;
      const duplicate: LibraryProject = {
        ...source,
        id: `${source.id}_copy_${Date.now()}`,
        displayName: `${source.displayName.replace(/(\.[^./]+)$/, "")} Copy${
          source.displayName.match(/(\.[^./]+)$/)?.[0] ?? ""
        }`,
        createdAt: new Date().toISOString(),
        exportStatus: "not_exported",
        syncState: "local_only",
      };
      return [duplicate, ...current];
    });
  }, []);

  const deleteProject = useCallback((id: string) => {
    setProjects((current) => current.filter((project) => project.id !== id));
  }, []);

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
    retryLoad,
    cancelJob,
    retryFailed,
    renameProject,
    duplicateProject,
    deleteProject,
  };
}
