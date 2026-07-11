import { create } from "zustand";
import { persist } from "zustand/middleware";
import { migratePersistedState, zustandStorage } from "./persistence";

interface AppState { activeProjectId: string | null; intendedRoute: string | null; hasHydrated: boolean; setActiveProject: (id: string | null) => void; setIntendedRoute: (route: string | null) => void; }
const defaults = { activeProjectId: null as string | null, intendedRoute: null as string | null };
export const useAppStore = create<AppState>()(persist((set) => ({
  ...defaults, hasHydrated: false,
  setActiveProject: (activeProjectId) => set({ activeProjectId }),
  setIntendedRoute: (intendedRoute) => set({ intendedRoute }),
}), { name: "cleanaudio.store.app", version: 1, storage: zustandStorage, partialize: ({ activeProjectId, intendedRoute }) => ({ activeProjectId, intendedRoute }), migrate: (state, version) => migratePersistedState(state, version, defaults), onRehydrateStorage: () => () => useAppStore.setState({ hasHydrated: true }) }));
