import AsyncStorage from "@react-native-async-storage/async-storage";

import { PERSONA_OPTIONS } from "./personas";
import type { PersonaId, PresetId } from "@/types/onboarding";

/**
 * Lightweight persisted onboarding preferences (AGENTS.md §3/§13:
 * AsyncStorage is approved for non-sensitive preferences, not domain/project
 * data). Sibling to `useOnboardingStatus.ts`'s `cleanaudio.onboarding.completed`
 * key — same namespace convention. Real project/job state lands with the
 * Zustand store in `prompts/14-zustand-and-local-data.md`.
 */
const DEMO_HEARD_KEY = "cleanaudio.onboarding.demoHeard";
const PERSONA_KEY = "cleanaudio.onboarding.personaId";
const DEFAULT_PRESET_KEY = "cleanaudio.onboarding.defaultPresetId";

export async function markDemoHeard(): Promise<void> {
  await AsyncStorage.setItem(DEMO_HEARD_KEY, "true");
}

export async function getDemoHeard(): Promise<boolean> {
  return (await AsyncStorage.getItem(DEMO_HEARD_KEY)) === "true";
}

export async function savePersonaSelection(
  personaId: PersonaId,
  presetId: PresetId,
): Promise<void> {
  await AsyncStorage.multiSet([
    [PERSONA_KEY, personaId],
    [DEFAULT_PRESET_KEY, presetId],
  ]);
}

export async function saveDefaultPresetOnly(presetId: PresetId): Promise<void> {
  await AsyncStorage.setItem(DEFAULT_PRESET_KEY, presetId);
}

export async function getSelectedPersonaId(): Promise<PersonaId | null> {
  const value = await AsyncStorage.getItem(PERSONA_KEY);
  return PERSONA_OPTIONS.some((persona) => persona.id === value)
    ? (value as PersonaId)
    : null;
}

export async function getDefaultPresetId(): Promise<PresetId | null> {
  const value = await AsyncStorage.getItem(DEFAULT_PRESET_KEY);
  return PERSONA_OPTIONS.some((persona) => persona.defaultPresetId === value)
    ? (value as PresetId)
    : null;
}
