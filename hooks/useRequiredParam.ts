/**
 * Normalizes an Expo Router local-search-param into a single required
 * string, or `null` when missing/empty — the signal screens with a dynamic
 * segment (`[jobId]`, `[projectId]`) use to render a recoverable
 * not-found state instead of guessing at malformed input.
 */
export function useRequiredParam(
  value: string | string[] | undefined,
): string | null {
  if (typeof value !== "string" || value.length === 0) return null;
  return value;
}
