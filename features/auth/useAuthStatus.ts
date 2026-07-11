export type AuthStatus = "guest" | "authenticated";

/**
 * Placeholder until prompts/05-authentication-clerk.md wires real Clerk
 * session state. Every session is a guest session until then, so
 * `useRequireAuth` always redirects account-only routes to sign-in — an
 * honest default-deny rather than a faked authenticated state.
 */
export function useAuthStatus(): AuthStatus {
  return "guest";
}
