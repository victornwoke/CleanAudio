import { create } from "zustand";
import { persist } from "zustand/middleware";

import { migratePersistedState, zustandStorage } from "./persistence";
import type { ExportSettings } from "@/types/export";

interface ExportState { drafts: Record<string, ExportSettings>; hasHydrated: boolean; saveDraft: (projectId: string, settings: ExportSettings) => void; clearDraft: (projectId: string) => void; }
const defaults = { drafts: {} as Record<string, ExportSettings> };
export const useExportStore = create<ExportState>()(persist((set) => ({
  ...defaults, hasHydrated: false,
  saveDraft: (projectId, settings) => set((state) => ({ drafts: { ...state.drafts, [projectId]: settings } })),
  clearDraft: (projectId) => set((state) => { const drafts = { ...state.drafts }; delete drafts[projectId]; return { drafts }; }),
}), { name: "cleanaudio.store.exports", version: 1, storage: zustandStorage, partialize: ({ drafts }) => ({ drafts }), migrate: (state, version) => migratePersistedState(state, version, defaults), onRehydrateStorage: () => () => useExportStore.setState({ hasHydrated: true }) }));
export const selectExportDraft = (projectId: string) => (state: ExportState) => state.drafts[projectId];
