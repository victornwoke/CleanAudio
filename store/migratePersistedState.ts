export function migratePersistedState<T extends object>(persisted: unknown, version: number, defaults: T): T {
  if (!persisted || typeof persisted !== "object" || version < 1) return defaults;
  return { ...defaults, ...persisted };
}
