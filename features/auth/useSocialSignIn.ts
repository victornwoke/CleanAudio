import { useSSO } from "@clerk/expo";
import { router } from "expo-router";
import { useCallback, useState } from "react";

import { mapUnexpectedAuthError } from "@/lib/auth/mapClerkError";

import type { SocialProvider } from "@/types/auth";

import { resolveReturnToHref } from "./navigation";

const strategyByProvider: Record<SocialProvider, "oauth_apple" | "oauth_google"> = {
  apple: "oauth_apple",
  google: "oauth_google",
};

/**
 * Browser-based SSO (`useSSO`, never the deprecated `useOAuth`) for both
 * Apple and Google. Shared by sign-in and sign-up — Clerk resolves the
 * sign-in-vs-sign-up transfer internally, so one flow covers both entry
 * points (see the Clerk Expo skill's sso-and-native-auth reference).
 */
export function useSocialSignIn(returnTo: string | null) {
  const { startSSOFlow } = useSSO();
  const [pendingProvider, setPendingProvider] = useState<SocialProvider | null>(null);
  const [error, setError] = useState<string | null>(null);

  const signInWithProvider = useCallback(
    async (provider: SocialProvider) => {
      setError(null);
      setPendingProvider(provider);
      try {
        const { createdSessionId, setActive } = await startSSOFlow({
          strategy: strategyByProvider[provider],
        });
        if (createdSessionId && setActive) {
          await setActive({ session: createdSessionId });
          router.replace(resolveReturnToHref(returnTo));
        }
        // No createdSessionId and no thrown error means the user cancelled
        // the browser flow — not an error state, nothing to show.
      } catch {
        setError(mapUnexpectedAuthError());
      } finally {
        setPendingProvider(null);
      }
    },
    [startSSOFlow, returnTo]
  );

  return { signInWithProvider, pendingProvider, error };
}
