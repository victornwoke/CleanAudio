import { create } from "zustand";
import { persist } from "zustand/middleware";

import { destructiveTestActionsEnabled, migratePersistedState, zustandStorage } from "./persistence";
import type { PersonaId, PresetId } from "@/types/onboarding";

interface OnboardingState {
  hasCompleted: boolean;
  hasHeardDemo: boolean;
  personaId: PersonaId | null;
  defaultPresetId: PresetId;
  hasHydrated: boolean;
  hydrationError: boolean;
  setCompleted: () => void;
  setDemoHeard: () => void;
  setPersona: (personaId: PersonaId, presetId: PresetId) => void;
  setDefaultPreset: (presetId: PresetId) => void;
  resetForTests: () => void;
}

interface PersistedOnboardingState {
  hasCompleted: boolean;
  hasHeardDemo: boolean;
  personaId: PersonaId | null;
  defaultPresetId: PresetId;
}

const defaults: PersistedOnboardingState = {
  hasCompleted: false,
  hasHeardDemo: false,
  personaId: null,
  defaultPresetId: "podcast",
};

export const useOnboardingStore = create<OnboardingState>()(persist((set) => ({
  ...defaults, hasHydrated: false as boolean, hydrationError: false as boolean,
  setCompleted: () => { set({ hasCompleted: true }); },
  setDemoHeard: () => { set({ hasHeardDemo: true }); },
  setPersona: (personaId, defaultPresetId) => { set({ personaId, defaultPresetId }); },
  setDefaultPreset: (defaultPresetId) => { set({ defaultPresetId }); },
  resetForTests: () => { if (destructiveTestActionsEnabled) set({ ...defaults }); },
}), {
  name: "cleanaudio.store.onboarding", version: 1, storage: zustandStorage,
  partialize: ({ hasCompleted, hasHeardDemo, personaId, defaultPresetId }) => ({ hasCompleted, hasHeardDemo, personaId, defaultPresetId }),
  migrate: (state, version) => migratePersistedState(state, version, defaults),
  onRehydrateStorage: () => (state, error) => useOnboardingStore.setState({ hasHydrated: true, hydrationError: Boolean(error) }),
}));

export const selectOnboardingHasHydrated = (state: OnboardingState) => state.hasHydrated;
export const selectOnboardingHydrationError = (state: OnboardingState) => state.hydrationError;
