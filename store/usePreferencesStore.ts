import { create } from "zustand";
import { persist } from "zustand/middleware";

import { destructiveTestActionsEnabled, migratePersistedState, zustandStorage } from "./persistence";
import type { ExportFormat } from "@/types/export";
import type { LoudnessTargetId } from "@/types/fineTune";
import type { AppearanceMode } from "@/types/settings";

/**
 * `prompts/21-settings-privacy-help.md` added the fields below
 * `notifyWhenJobCompletes`/`reduceDataUsage`/`autoDeleteTemporaryFiles`.
 * "Default preset" is deliberately not one of them — that preference
 * already exists as `useOnboardingStore#defaultPresetId`
 * (`features/onboarding/onboardingPreferences.ts#saveDefaultPresetOnly`),
 * and duplicating it here would create the two-sources-of-truth problem
 * `AGENTS.md` §5 forbids. `appearanceMode` is a real, persisted preference,
 * but this app's screens render `constants/colors.ts#colors` directly
 * rather than through `constants/theme.ts#useTheme()` — changing it does
 * not yet retheme the app; wiring that up is a separate, cross-cutting
 * change beyond this prompt's scope (flagged in
 * `docs/implementation-status.md`, same class of honest partial-wiring as
 * `types/export.ts#ExportSettings.removeWatermark`).
 */
export interface Preferences {
  notifyWhenJobCompletes: boolean;
  reduceDataUsage: boolean;
  autoDeleteTemporaryFiles: boolean;
  notifyOnExportComplete: boolean;
  notifyProductUpdates: boolean;
  appearanceMode: AppearanceMode;
  defaultExportFormat: ExportFormat;
  defaultLoudnessTarget: LoudnessTargetId;
  /** Whether Settings' bulk "Clear Cache"/"Remove Downloaded Copies" actions
   * (`features/settings/storageActions.ts`) are allowed to remove
   * original-owned local files, or only generated/temporary ones. Never
   * bypasses the non-negotiable original-immutability rule on its own —
   * it only widens what the user's own explicit cleanup action is allowed
   * to touch (`CLAUDE.md` §8). */
  keepOriginalsInCleanup: boolean;
  analyticsEnabled: boolean;
  diagnosticSharingEnabled: boolean;
}

interface PreferencesState extends Preferences {
  hasHydrated: boolean;
  hydrationError: boolean;
  updatePreference: <K extends keyof Preferences>(key: K, value: Preferences[K]) => void;
  resetForTests: () => void;
}

const defaults: Preferences = {
  notifyWhenJobCompletes: false,
  reduceDataUsage: false,
  autoDeleteTemporaryFiles: true,
  notifyOnExportComplete: false,
  notifyProductUpdates: false,
  appearanceMode: "system",
  defaultExportFormat: "mp3",
  defaultLoudnessTarget: "podcast",
  keepOriginalsInCleanup: true,
  analyticsEnabled: true,
  diagnosticSharingEnabled: true,
};

export const usePreferencesStore = create<PreferencesState>()(persist((set) => ({
  ...defaults, hasHydrated: false as boolean, hydrationError: false as boolean,
  updatePreference: (key, value) => { set({ [key]: value }); },
  resetForTests: () => { if (destructiveTestActionsEnabled) set({ ...defaults }); },
}), {
  name: "cleanaudio.store.preferences", version: 1, storage: zustandStorage,
  partialize: ({
    notifyWhenJobCompletes, reduceDataUsage, autoDeleteTemporaryFiles, notifyOnExportComplete,
    notifyProductUpdates, appearanceMode, defaultExportFormat, defaultLoudnessTarget,
    keepOriginalsInCleanup, analyticsEnabled, diagnosticSharingEnabled,
  }) => ({
    notifyWhenJobCompletes, reduceDataUsage, autoDeleteTemporaryFiles, notifyOnExportComplete,
    notifyProductUpdates, appearanceMode, defaultExportFormat, defaultLoudnessTarget,
    keepOriginalsInCleanup, analyticsEnabled, diagnosticSharingEnabled,
  }),
  migrate: (state, version) => migratePersistedState(state, version, defaults),
  onRehydrateStorage: () => (_state, error) => usePreferencesStore.setState({ hasHydrated: true, hydrationError: Boolean(error) }),
}));
