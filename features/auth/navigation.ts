import { router } from "expo-router";

/**
 * Expo Router's typed routes only accept literal path strings; `returnTo`
 * is a runtime string carried through query params, so it needs this one
 * contained cast rather than `any` scattered across every auth screen.
 */
type AppHref = Parameters<typeof router.replace>[0];

const DEFAULT_AUTHENTICATED_ROUTE = "/(tabs)/library";

function resolveReturnToPath(returnTo: string | null | undefined): string {
  return returnTo && returnTo.length > 0 ? returnTo : DEFAULT_AUTHENTICATED_ROUTE;
}

export function resolveReturnToHref(returnTo: string | null | undefined): AppHref {
  return resolveReturnToPath(returnTo) as AppHref;
}

/**
 * Shared `finalize({ navigate })` callback for sign-in/sign-up/verify.
 * Session tasks (forced MFA enrollment, org selection) aren't built in this
 * pass — if the instance has one configured, this still resumes `returnTo`
 * rather than stranding the user, which is safe for the common case
 * (no forced tasks) and revisited if a later prompt needs task UI.
 */
export function createAuthNavigate(returnTo: string | null) {
  return ({ decorateUrl }: { decorateUrl: (url: string) => string }) => {
    const target = decorateUrl(resolveReturnToPath(returnTo));
    router.replace(target as AppHref);
  };
}
