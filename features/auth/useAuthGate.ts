import { router } from "expo-router";
import { useCallback } from "react";

import { useAuthStatus } from "./useAuthStatus";

/**
 * Callable guard for a single guest-conversion action (export, cloud sync)
 * rather than an entire route — use `useRequireAuth` to gate a whole
 * screen. `returnTo` should be the full destination path *with any query
 * string the caller needs preserved* (e.g. `/export/abc?quality=hd`), since
 * that path/query is itself where project id, export settings, and
 * destination naturally live once that screen exists — no separate copy of
 * that state needs to round-trip through the auth flow.
 *
 * Returns `true` immediately if already signed in (caller proceeds).
 * Returns `false` and opens sign-in if not — the caller must abort/no-op;
 * nothing local is touched, so guest work is never lost on cancel/failure.
 */
export function useAuthGate() {
  const status = useAuthStatus();

  const requireAuth = useCallback(
    (returnTo: string): boolean => {
      if (status === "authenticated") return true;
      if (status === "loading") return false;
      router.push({ pathname: "/(auth)/sign-in", params: { returnTo } });
      return false;
    },
    [status]
  );

  return { requireAuth, status, isAuthenticated: status === "authenticated" };
}
