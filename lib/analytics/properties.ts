/**
 * Safe-property helpers for PostHog analytics (`prompts/20-posthog-analytics.md`
 * "Event rules" / "Identity"). Deliberately has no `posthog-react-native`
 * import so it stays a pure, dependency-free module that can run under plain
 * Node (`node:test`), mirroring `lib/monitoring/scrubEvent.ts`'s pattern —
 * privacy-relevant redaction logic is verifiable without a React Native
 * runtime.
 */

/**
 * Safe PostHog person properties (`prompts/20`'s "Identity" list: signup
 * date, persona, locale, plan, preferred preset). Snake_case keys match the
 * convention already used for OneSignal's approved tag set
 * (`lib/notifications/onesignal.ts`).
 */
export interface SafePersonProperties {
  signup_date: string | null;
  persona: string;
  locale: string;
  plan: "free" | "pro";
  preferred_preset: string;
  /** Widens to PostHog's `JsonType`-indexed properties at the `posthog.identify()` call site,
   * without importing `posthog-react-native` here (keeps this module dependency-free/pure). */
  [key: string]: string | boolean | null;
}

export interface SafePersonPropertiesInput {
  /** Clerk `user.createdAt`, already a `Date` or ISO string — never re-derived from anything more sensitive. */
  signupDate: Date | string | null;
  personaId: string | null;
  defaultPresetId: string;
  isPro: boolean;
  locale: string;
}

/** Builds the typed, safe person-property payload sent with `posthog.identify()`. */
export function buildSafePersonProperties(input: SafePersonPropertiesInput): SafePersonProperties {
  const signupDate =
    input.signupDate instanceof Date
      ? input.signupDate.toISOString()
      : input.signupDate ?? null;

  return {
    signup_date: signupDate,
    persona: input.personaId ?? "unset",
    locale: input.locale,
    plan: input.isPro ? "pro" : "free",
    preferred_preset: input.defaultPresetId,
  };
}

/**
 * Property key names that must never appear in an analytics payload
 * (`CLAUDE.md` §13 / `AGENTS.md` §12 / this prompt's "Event rules" —
 * filenames, project titles, raw media, transcripts, email, signed URLs,
 * exact local paths). Matches on key name only: this is a dev-time
 * allowlist guard for typed event properties, not a string-content scrubber
 * like `scrubEvent.ts` (analytics properties are always small, IDs/enums/
 * numbers by construction — see `AnalyticsEvent` in `events.ts`).
 */
const FORBIDDEN_PROPERTY_KEY_PATTERN =
  /file[_-]?name|project[_-]?title|raw[_-]?media|transcript|e[-]?mail|signed[_-]?url|local[_-]?path|^uri$|^path$/i;

/** Returns the first forbidden key found in `properties`, or `null` if none. */
export function findForbiddenPropertyKey(properties: Record<string, unknown> | undefined): string | null {
  if (!properties) return null;
  for (const key of Object.keys(properties)) {
    if (FORBIDDEN_PROPERTY_KEY_PATTERN.test(key)) return key;
  }
  return null;
}
