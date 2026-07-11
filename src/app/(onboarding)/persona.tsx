import { router } from "expo-router";
import { useState } from "react";
import { View } from "react-native";

import { AppButton } from "@/components/common/AppButton";
import { AppScreen } from "@/components/common/AppScreen";
import { AppText } from "@/components/common/AppText";
import { PersonaOptionCard } from "@/components/onboarding/PersonaOptionCard";
import { StepDots } from "@/components/onboarding/StepDots";
import { spacing } from "@/constants/spacing";
import {
  DEFAULT_PRESET_ID,
  PERSONA_OPTIONS,
} from "@/features/onboarding/personas";
import {
  getDemoHeard,
  saveDefaultPresetOnly,
  savePersonaSelection,
} from "@/features/onboarding/onboardingPreferences";
import { markOnboardingComplete } from "@/features/onboarding/useOnboardingStatus";
import { track } from "@/lib/analytics/events";
import type { PersonaId } from "@/types/onboarding";

/**
 * Persona selection (`prompts/04-demo-onboarding-persona.md`,
 * `02-onboarding.png` visual chrome). Selection sets the default preset but
 * remains editable later — skipping never leaves the default preset unset
 * (acceptance criterion).
 */
export default function PersonaScreen() {
  const [selectedId, setSelectedId] = useState<PersonaId | null>(null);

  function handleSelect(personaId: PersonaId) {
    setSelectedId(personaId);
    track({ name: "persona_selected", properties: { personaId } });
  }

  async function completeOnboarding(
    personaId: PersonaId | null,
    presetId: (typeof PERSONA_OPTIONS)[number]["defaultPresetId"],
  ) {
    try {
      const demoHeard = await getDemoHeard().catch(() => null);
      const saveSelection = personaId
        ? savePersonaSelection(personaId, presetId)
        : saveDefaultPresetOnly(presetId);
      await Promise.allSettled([saveSelection, markOnboardingComplete()]);
      if (demoHeard !== null) {
        track({
          name: "onboarding_completed",
          properties: { personaId, demoHeard },
        });
      }
    } finally {
      router.replace("/(tabs)/library");
    }
  }

  function handleContinue() {
    const selected = PERSONA_OPTIONS.find((option) => option.id === selectedId);
    if (!selected) return;
    completeOnboarding(selected.id, selected.defaultPresetId);
  }

  function handleSkip() {
    completeOnboarding(null, DEFAULT_PRESET_ID);
  }

  return (
    <AppScreen scroll contentContainerStyle={{ flexGrow: 1 }}>
      <View style={{ gap: spacing.xl, flex: 1 }}>
        <StepDots total={2} activeIndex={1} />

        <AppText variant="display">What do you create most often?</AppText>

        <View
          accessibilityRole="radiogroup"
          style={{ gap: spacing.sm }}
        >
          {PERSONA_OPTIONS.map((option) => (
            <PersonaOptionCard
              key={option.id}
              label={option.label}
              icon={option.icon}
              selected={option.id === selectedId}
              onPress={() => handleSelect(option.id)}
            />
          ))}
        </View>

        <View style={{ flex: 1 }} />

        <View style={{ gap: spacing.sm }}>
          <AppButton
            label="Continue"
            onPress={handleContinue}
            disabled={selectedId === null}
          />
          <AppButton label="Skip for now" variant="ghost" onPress={handleSkip} />
        </View>
      </View>
    </AppScreen>
  );
}
