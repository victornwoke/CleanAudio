import AsyncStorage from "@react-native-async-storage/async-storage";
import { createJSONStorage, type StateStorage } from "zustand/middleware";

export { migratePersistedState } from "./migratePersistedState";

export const zustandStorage = createJSONStorage((): StateStorage => AsyncStorage);

export const destructiveTestActionsEnabled = process.env.NODE_ENV === "test";
