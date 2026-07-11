import { parsePublishableKey } from "@clerk/shared/keys";

/**
 * Single source of truth for the Clerk publishable key. Read once here
 * (never inside a screen, per AGENTS.md §20) so `ClerkProvider` and the
 * social-strategy check below share the same value.
 */
export function getClerkPublishableKey(): string {
  const publishableKey = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY;
  if (!publishableKey) {
    throw new Error(
      "Add EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY to your .env file (Clerk Dashboard -> API keys)."
    );
  }
  return publishableKey;
}

export interface SocialStrategyAvailability {
  apple: boolean;
  google: boolean;
}

const UNAVAILABLE: SocialStrategyAvailability = { apple: false, google: false };
const SOCIAL_STRATEGY_CACHE_TTL_MS = 30_000;

let socialStrategyCache:
  | { value: SocialStrategyAvailability; expiresAt: number }
  | undefined;
let socialStrategyRequest: Promise<SocialStrategyAvailability> | undefined;

function cacheSocialStrategies(value: SocialStrategyAvailability): SocialStrategyAvailability {
  socialStrategyCache = { value, expiresAt: Date.now() + SOCIAL_STRATEGY_CACHE_TTL_MS };
  return value;
}

export function getCachedSocialStrategies(): SocialStrategyAvailability | undefined {
  if (!socialStrategyCache || socialStrategyCache.expiresAt <= Date.now()) return undefined;
  return socialStrategyCache.value;
}

/**
 * Clerk's own JS SDK reads this same public, unauthenticated endpoint on
 * startup to discover which auth strategies an instance has enabled. We
 * reuse it so `AuthSheet` only ever renders a social button the Clerk
 * Dashboard has actually configured (CLAUDE.md §6/§10: never advertise an
 * unavailable feature) instead of guessing from a hardcoded flag.
 *
 * Fails closed: any network/parse error hides both buttons rather than
 * risking a button that looks tappable but errors when pressed.
 */
export async function fetchEnabledSocialStrategies(): Promise<SocialStrategyAvailability> {
  const cached = getCachedSocialStrategies();
  if (cached) return cached;
  if (socialStrategyRequest) return socialStrategyRequest;

  let publishableKey: string;
  try {
    publishableKey = getClerkPublishableKey();
  } catch {
    return cacheSocialStrategies(UNAVAILABLE);
  }

  const parsed = parsePublishableKey(publishableKey);
  if (!parsed) return cacheSocialStrategies(UNAVAILABLE);

  socialStrategyRequest = (async () => {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);
    try {
      const response = await fetch(
        `https://${parsed.frontendApi}/v1/environment?_is_native=true`,
        { signal: controller.signal }
      );
      if (!response.ok) return cacheSocialStrategies(UNAVAILABLE);

      const environment = (await response.json()) as {
        user_settings?: {
          social?: Record<string, { enabled?: boolean }>;
        };
      };
      const social = environment.user_settings?.social;
      if (!social?.oauth_apple || !social.oauth_google) {
        if (__DEV__) {
          console.warn(
            "[auth] Clerk environment response omitted expected social OAuth settings; social sign-in is unavailable."
          );
        }
        return cacheSocialStrategies(UNAVAILABLE);
      }
      const result = {
        apple: social.oauth_apple.enabled === true,
        google: social.oauth_google.enabled === true,
      };
      return cacheSocialStrategies(result);
    } catch {
      return cacheSocialStrategies(UNAVAILABLE);
    } finally {
      clearTimeout(timeout);
    }
  })();

  try {
    return await socialStrategyRequest;
  } finally {
    socialStrategyRequest = undefined;
  }
}
