/**
 * Maps Clerk error codes to user-safe copy. Never surface `error.message`/
 * `error.longMessage` directly (AGENTS.md §15/CLAUDE.md §17: no raw
 * provider strings shown to users).
 */

interface ClerkLikeError {
  code: string;
}

const messagesByCode: Record<string, string> = {
  form_identifier_not_found:
    "We couldn't find an account with that email.",
  form_identifier_exists:
    "An account with that email already exists. Try signing in instead.",
  form_password_incorrect:
    "That password doesn't look right. Try again or reset it.",
  form_password_pwned:
    "That password has appeared in a data breach. Choose a different one.",
  form_password_length_too_short: "Choose a longer password.",
  form_password_validation_failed: "Choose a stronger password.",
  form_code_incorrect: "That code isn't right. Check and try again.",
  form_code_expired: "That code has expired. Request a new one.",
  verification_expired: "That code has expired. Request a new one.",
  too_many_requests: "Too many attempts. Please wait a moment and try again.",
  session_exists: "You're already signed in.",
  identifier_already_signed_in: "You're already signed in.",
  captcha_invalid: "We couldn't verify you're human. Please try again.",
  captcha_unavailable: "We couldn't verify you're human. Please try again.",
  form_param_format_invalid: "That doesn't look like a valid email address.",
};

const FALLBACK_MESSAGE = "Something went wrong. Please try again.";

export function mapClerkError(error: ClerkLikeError | null | undefined): string {
  if (!error) return FALLBACK_MESSAGE;
  return messagesByCode[error.code] ?? FALLBACK_MESSAGE;
}

/** For errors caught from a thrown exception rather than a Clerk `{ error }` result. */
export function mapUnexpectedAuthError(): string {
  return "Something went wrong. Check your connection and try again.";
}
