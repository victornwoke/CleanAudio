import AsyncStorage from "@react-native-async-storage/async-storage";
import { Platform } from "react-native";
import { createJSONStorage, type StateStorage } from "zustand/middleware";

export { migratePersistedState } from "./migratePersistedState";

const serverStorage: StateStorage = {
  getItem: () => null,
  setItem: () => undefined,
  removeItem: () => undefined,
};

export const zustandStorage = createJSONStorage(
  (): StateStorage =>
    Platform.OS === "web" && typeof window === "undefined"
      ? serverStorage
      : AsyncStorage,
);

export const destructiveTestActionsEnabled = process.env.NODE_ENV === "test";
