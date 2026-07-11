import { create } from "zustand";

import { localRepositories } from "@/services/repositories";
import type { LibraryProject } from "@/types/library";

export type RepositoryLoadState = "idle" | "loading" | "ready" | "error";

interface ProjectState {
  projects: LibraryProject[];
  activeProjectId: string | null;
  loadState: RepositoryLoadState;
  load: () => Promise<void>;
  setActiveProjectId: (id: string | null) => void;
  upsert: (project: LibraryProject) => Promise<void>;
  remove: (id: string) => Promise<void>;
}

export const useProjectStore = create<ProjectState>((set) => ({
  projects: [], activeProjectId: null, loadState: "idle",
  load: async () => {
    set({ loadState: "loading" });
    try { set({ projects: await localRepositories.projects.list(), loadState: "ready" }); }
    catch { set({ loadState: "error" }); }
  },
  setActiveProjectId: (activeProjectId) => set({ activeProjectId }),
  upsert: async (project) => {
    await localRepositories.projects.upsert(project);
    set((state) => ({ projects: [project, ...state.projects.filter((item) => item.id !== project.id)] }));
  },
  remove: async (id) => {
    await localRepositories.mediaFiles.deleteOwnedFiles(id);
    await localRepositories.projects.remove(id);
    set((state) => ({ projects: state.projects.filter((item) => item.id !== id), activeProjectId: state.activeProjectId === id ? null : state.activeProjectId }));
  },
}));

export const selectProjects = (state: ProjectState) => state.projects;
export const selectProjectLoadState = (state: ProjectState) => state.loadState;
export const selectActiveProjectId = (state: ProjectState) => state.activeProjectId;
