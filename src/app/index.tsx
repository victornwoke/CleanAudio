import { Redirect } from "expo-router";

import { AppScreen } from "@/components/common/AppScreen";
import { SplashMark } from "@/components/onboarding/SplashMark";
import { useOnboardingStatus } from "@/features/onboarding/useOnboardingStatus";

/**
 * Entry route (PRD §11/§16): first launch goes through the demo/persona
 * flow, returning guests and authenticated users land on the library.
 * There is no authenticated-vs-guest branch yet — Clerk isn't installed
 * until prompts/05-authentication-clerk.md, so every non-first-launch
 * session currently resolves to the guest library path.
 *
 * `SplashMark` renders only for however long `useOnboardingStatus` takes to
 * read AsyncStorage (near-instant) — no artificial delay is added, per
 * `prompts/04-demo-onboarding-persona.md`'s Splash requirement.
 */
export default function Index() {
  const status = useOnboardingStatus();

  if (status === "loading") {
    return (
      <AppScreen padded={false}>
        <SplashMark />
      </AppScreen>
    );
  }

  if (status === "first-launch") {
    return <Redirect href="/(onboarding)/demo" />;
  }

  return <Redirect href="/(tabs)/library" />;
}
