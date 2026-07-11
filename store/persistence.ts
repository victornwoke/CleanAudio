import AsyncStorage from "@react-native-async-storage/async-storage";
import { createJSONStorage, type StateStorage } from "zustand/middleware";

export const zustandStorage = createJSONStorage((): StateStorage => AsyncStorage);

export function migratePersistedState<T extends object>(persisted: unknown, version: number, defaults: T): T {
  if (!persisted || typeof persisted !== "object" || version < 1) return defaults;
  return { ...defaults, ...persisted };
}

export const destructiveTestActionsEnabled = process.env.NODE_ENV === "test";
