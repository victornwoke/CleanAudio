import { PERSONA_OPTIONS } from "./personas";
import { useOnboardingStore } from "@/store/useOnboardingStore";
import type { PersonaId, PresetId } from "@/types/onboarding";

/**
 * Lightweight persisted onboarding preferences (AGENTS.md §3/§13:
 * AsyncStorage is approved for non-sensitive preferences, not domain/project
 * data). Sibling to `useOnboardingStatus.ts`'s `cleanaudio.onboarding.completed`
 * key — same namespace convention. Real project/job state lands with the
 * Zustand store in `prompts/14-zustand-and-local-data.md`.
 */
export async function markDemoHeard(): Promise<void> {
  useOnboardingStore.getState().setDemoHeard();
}

export async function getDemoHeard(): Promise<boolean> {
  await useOnboardingStore.persist.rehydrate();
  return useOnboardingStore.getState().hasHeardDemo;
}

export async function savePersonaSelection(
  personaId: PersonaId,
  presetId: PresetId,
): Promise<void> {
  useOnboardingStore.getState().setPersona(personaId, presetId);
}

export async function saveDefaultPresetOnly(presetId: PresetId): Promise<void> {
  useOnboardingStore.getState().setDefaultPreset(presetId);
}

export async function getSelectedPersonaId(): Promise<PersonaId | null> {
  await useOnboardingStore.persist.rehydrate();
  const value = useOnboardingStore.getState().personaId;
  return PERSONA_OPTIONS.some((persona) => persona.id === value)
    ? (value as PersonaId)
    : null;
}

export async function getDefaultPresetId(): Promise<PresetId | null> {
  await useOnboardingStore.persist.rehydrate();
  const value = useOnboardingStore.getState().defaultPresetId;
  return PERSONA_OPTIONS.some((persona) => persona.defaultPresetId === value)
    ? (value as PresetId)
    : null;
}
