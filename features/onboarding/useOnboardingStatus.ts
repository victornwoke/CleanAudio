import { useEffect, useState } from "react";
import { useOnboardingStore } from "@/store/useOnboardingStore";

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
    Promise.resolve(useOnboardingStore.persist.rehydrate())
      .then(() => {
        if (!cancelled) setStatus(useOnboardingStore.getState().hasCompleted ? "complete" : "first-launch");
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
  useOnboardingStore.getState().setCompleted();
}
