import { router } from "expo-router";
import { useEffect } from "react";

import { useAuthStatus, type AuthStatus } from "./useAuthStatus";

/**
 * Guards account-only routes (export, subscription management) per
 * AGENTS.md §7/§8. Preserves the origin route as `returnTo` so the real
 * sign-in flow (prompts/05-authentication-clerk.md) resumes it after a
 * successful sign-in. Waits for `"loading"` to resolve before redirecting
 * so a cold start with a valid cached session never flashes sign-in.
 */
export function useRequireAuth(returnTo: string | null): AuthStatus {
  const status = useAuthStatus();

  useEffect(() => {
    if (status === "guest" && returnTo) {
      router.replace({ pathname: "/(auth)/sign-in", params: { returnTo } });
    }
  }, [status, returnTo]);

  return status;
}
