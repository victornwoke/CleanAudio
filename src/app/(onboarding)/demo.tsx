import { router } from "expo-router";
import { useEffect } from "react";
import { View } from "react-native";

import { AppButton } from "@/components/common/AppButton";
import { AppScreen } from "@/components/common/AppScreen";
import { AppText } from "@/components/common/AppText";
import { DemoPlaybackCard } from "@/components/audio/DemoPlaybackCard";
import { StepDots } from "@/components/onboarding/StepDots";
import { spacing } from "@/constants/spacing";
import { markOnboardingComplete } from "@/features/onboarding/useOnboardingStatus";
import { DEFAULT_PRESET_ID } from "@/features/onboarding/personas";
import {
  getDemoHeard,
  saveDefaultPresetOnly,
} from "@/features/onboarding/onboardingPreferences";
import { useDemoPlayback } from "@/features/onboarding/useDemoPlayback";
import { track } from "@/lib/analytics/events";

/**
 * "Hear the difference" demo (`prompts/04-demo-onboarding-persona.md`,
 * `01-splash.png` / `02-onboarding.png` visual chrome). No account is
 * required — the user experiences value before signup (PRD §11.1).
 */
export default function DemoScreen() {
  const playback = useDemoPlayback();

  useEffect(() => {
    track({ name: "demo_started" });
  }, []);

  function handleTryOwnAudio() {
    track({ name: "onboarding_cta_tapped", properties: { cta: "try_own_audio" } });
    router.push("/(onboarding)/persona");
  }

  async function handleExploreFirst() {
    track({ name: "onboarding_cta_tapped", properties: { cta: "explore_first" } });
    try {
      const demoHeard = await getDemoHeard().catch(() => null);
      await Promise.allSettled([
        saveDefaultPresetOnly(DEFAULT_PRESET_ID),
        markOnboardingComplete(),
      ]);
      if (demoHeard !== null) {
        track({
          name: "onboarding_completed",
          properties: { personaId: null, demoHeard },
        });
      }
    } finally {
      router.replace("/(tabs)/library");
    }
  }

  return (
    <AppScreen scroll contentContainerStyle={{ flexGrow: 1 }}>
      <View style={{ gap: spacing.xl, flex: 1 }}>
        <StepDots total={2} activeIndex={0} />

        <View style={{ gap: spacing.xs }}>
          <AppText variant="display">Hear the difference.</AppText>
          <AppText variant="body" color="secondary">
            One tap removes background noise, evens out levels, and masters
            your audio to studio-ready quality.
          </AppText>
        </View>

        <DemoPlaybackCard
          activeTrack={playback.activeTrack}
          isPlaying={playback.isPlaying}
          isLoaded={playback.isLoaded}
          currentTime={playback.currentTime}
          duration={playback.duration}
          onSelectTrack={playback.selectTrack}
          onTogglePlayback={playback.togglePlayback}
        />

        <View style={{ flex: 1 }} />

        <View style={{ gap: spacing.sm }}>
          <AppButton label="Try it with my audio" onPress={handleTryOwnAudio} />
          <AppButton
            label="Explore first"
            variant="ghost"
            onPress={handleExploreFirst}
          />
        </View>
      </View>
    </AppScreen>
  );
}
