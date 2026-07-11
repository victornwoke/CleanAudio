import { create } from "zustand";
import { persist } from "zustand/middleware";

import { destructiveTestActionsEnabled, migratePersistedState, zustandStorage } from "./persistence";

export interface Preferences {
  notifyWhenJobCompletes: boolean;
  reduceDataUsage: boolean;
  autoDeleteTemporaryFiles: boolean;
}

interface PreferencesState extends Preferences {
  hasHydrated: boolean;
  hydrationError: boolean;
  updatePreference: <K extends keyof Preferences>(key: K, value: Preferences[K]) => void;
  resetForTests: () => void;
}

const defaults: Preferences = { notifyWhenJobCompletes: false, reduceDataUsage: false, autoDeleteTemporaryFiles: true };

export const usePreferencesStore = create<PreferencesState>()(persist((set) => ({
  ...defaults, hasHydrated: false as boolean, hydrationError: false as boolean,
  updatePreference: (key, value) => { set({ [key]: value }); },
  resetForTests: () => { if (destructiveTestActionsEnabled) set({ ...defaults }); },
}), {
  name: "cleanaudio.store.preferences", version: 1, storage: zustandStorage,
  partialize: ({ notifyWhenJobCompletes, reduceDataUsage, autoDeleteTemporaryFiles }) => ({ notifyWhenJobCompletes, reduceDataUsage, autoDeleteTemporaryFiles }),
  migrate: (state, version) => migratePersistedState(state, version, defaults),
  onRehydrateStorage: () => (_state, error) => usePreferencesStore.setState({ hasHydrated: true, hydrationError: Boolean(error) }),
}));
