import { create } from "zustand";
import { persist } from "zustand/middleware";

import { localRepositories } from "@/services/repositories";
import { migratePersistedState, zustandStorage } from "./persistence";
import type { ProcessingJobSnapshot } from "@/types/processing";

type LightweightJob = Pick<ProcessingJobSnapshot, "jobId" | "status" | "stage" | "startedAt" | "adapter" | "errorCode">;
interface JobState { jobs: Record<string, LightweightJob>; hasHydrated: boolean; upsert: (job: ProcessingJobSnapshot) => Promise<void>; remove: (id: string) => Promise<void>; }
const defaults = { jobs: {} as Record<string, LightweightJob> };

export const useJobStore = create<JobState>()(persist((set) => ({
  ...defaults, hasHydrated: false,
  upsert: async (job) => { await localRepositories.jobs.upsertReference(job); set((state) => ({ jobs: { ...state.jobs, [job.jobId]: job } })); },
  remove: async (id) => { await localRepositories.jobs.removeReference(id); set((state) => { const jobs = { ...state.jobs }; delete jobs[id]; return { jobs }; }); },
}), { name: "cleanaudio.store.jobs", version: 1, storage: zustandStorage, partialize: ({ jobs }) => ({ jobs }), migrate: (state, version) => migratePersistedState(state, version, defaults), onRehydrateStorage: () => () => useJobStore.setState({ hasHydrated: true }) }));

export const selectJob = (id: string) => (state: JobState) => state.jobs[id];
