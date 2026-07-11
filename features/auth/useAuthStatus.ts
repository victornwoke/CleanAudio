import { useAuth } from "@clerk/expo";

export type AuthStatus = "loading" | "guest" | "authenticated";

/**
 * Thin typed wrapper around Clerk's `useAuth()`. `"loading"` covers the
 * moment Clerk is restoring a session from the token cache on cold start —
 * callers must not treat that as `"guest"` or a sign-in redirect flashes on
 * every launch (see protected-routes guidance in the Clerk Expo skill).
 */
export function useAuthStatus(): AuthStatus {
  const { isLoaded, isSignedIn } = useAuth();

  if (!isLoaded) return "loading";
  return isSignedIn ? "authenticated" : "guest";
}
