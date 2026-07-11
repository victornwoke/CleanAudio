import { usePreferencesStore } from "@/store/usePreferencesStore";

/**
 * Typed seam for the "notify me when my audio is ready" opt-in
 * (`prompts/09-processing-screen.md`; `AGENTS.md` §10 / `CLAUDE.md` §11:
 * never request OS push permission at launch, only after a contextual
 * accept). OneSignal itself isn't installed yet
 * (`prompts/18-onesignal-notifications.md`), so accepting here persists the
 * user's real, durable intent via AsyncStorage — a genuine state change the
 * user can see reflected back, not a dead button — without fabricating a
 * granted system permission that was never actually requested. The real OS
 * permission prompt and push delivery are wired once OneSignal lands; this
 * preference is what that future integration reads to decide whether to
 * prime the user for the system permission dialog.
 */
export async function getJobNotificationOptIn(): Promise<boolean> {
  if (!usePreferencesStore.persist.hasHydrated()) await usePreferencesStore.persist.rehydrate();
  return usePreferencesStore.getState().notifyWhenJobCompletes;
}

export async function setJobNotificationOptIn(optedIn: boolean): Promise<void> {
  usePreferencesStore.getState().updatePreference("notifyWhenJobCompletes", optedIn);
}
