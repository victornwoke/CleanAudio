import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect, useState } from "react";

const STORAGE_KEY = "cleanaudio.onboarding.completed";

export type OnboardingStatus = "loading" | "first-launch" | "complete";

/**
 * Lightweight persisted onboarding flag (AGENTS.md §3/§13: AsyncStorage is
 * approved for non-sensitive preferences, not domain/project data). Real
 * project/job state lands with the Zustand store in
 * prompts/14-zustand-and-local-data.md — this hook only decides whether the
 * root route sends a cold start through the demo/persona flow or straight
 * to the library.
 */
export function useOnboardingStatus(): OnboardingStatus {
  const [status, setStatus] = useState<OnboardingStatus>("loading");

  useEffect(() => {
    let cancelled = false;
    AsyncStorage.getItem(STORAGE_KEY)
      .then((value) => {
        if (!cancelled) setStatus(value === "true" ? "complete" : "first-launch");
      })
      .catch(() => {
        if (!cancelled) setStatus("first-launch");
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return status;
}

export async function markOnboardingComplete(): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEY, "true");
}
