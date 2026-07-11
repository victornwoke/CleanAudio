import { router } from "expo-router";
import { useEffect } from "react";

import { useAuthStatus, type AuthStatus } from "./useAuthStatus";

/**
 * Guards account-only routes (export, subscription management) per
 * AGENTS.md §7/§8. Preserves the origin route as `returnTo` so
 * prompts/05-authentication-clerk.md's real sign-in flow can resume it
 * after a successful sign-in.
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
