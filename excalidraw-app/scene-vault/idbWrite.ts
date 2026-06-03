import { set } from "idb-keyval";

import type { UseStore } from "idb-keyval";

import { appJotaiStore } from "../app-jotai";

import { sceneVaultQuotaExceededAtom } from "./vaultState";
import { isQuotaExceededError, SceneVaultQuotaError } from "./vaultErrors";

export const idbSet = async <T>(
  key: string,
  value: T,
  store: UseStore,
): Promise<void> => {
  try {
    await set(key, value, store);
    if (appJotaiStore.get(sceneVaultQuotaExceededAtom)) {
      appJotaiStore.set(sceneVaultQuotaExceededAtom, false);
    }
  } catch (error) {
    if (isQuotaExceededError(error)) {
      appJotaiStore.set(sceneVaultQuotaExceededAtom, true);
      throw new SceneVaultQuotaError();
    }
    throw error;
  }
};
