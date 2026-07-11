import { useClerk } from "@clerk/expo";
import { router } from "expo-router";
import { useCallback, useState } from "react";

import { mapUnexpectedAuthError } from "@/lib/auth/mapClerkError";

/**
 * Sign-out action for future Settings UI (prompts/21) to wire up. Identity
 * detach (RevenueCat/OneSignal/PostHog/Sentry, `identitySync.ts`) happens
 * reactively via `useIdentitySync` when `isSignedIn` flips to false, so
 * this only owns the Clerk sign-out call and returning to a guest-safe
 * screen — never deletes local projects (AGENTS.md §8).
 */
export function useSignOutFlow() {
  const { signOut } = useClerk();
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const signOutFlow = useCallback(async () => {
    setError(null);
    setIsSigningOut(true);
    try {
      await signOut();
      router.replace("/(tabs)/library");
    } catch {
      setError(mapUnexpectedAuthError());
    } finally {
      setIsSigningOut(false);
    }
  }, [signOut]);

  return { signOutFlow, isSigningOut, error };
}
