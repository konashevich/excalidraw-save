import { debounce } from "@excalidraw/common";

import type { ExcalidrawImperativeAPI } from "@excalidraw/excalidraw/types";

import { isSceneVaultEnabled, VAULT_SYNC_DEBOUNCE_MS } from "./constants";
import { sceneVaultService } from "./SceneVaultService";
import { isVaultEditingAllowed } from "./vaultGuards";
import { SceneVaultQuotaError } from "./vaultErrors";

const debouncedSync = debounce((api: ExcalidrawImperativeAPI) => {
  void sceneVaultService.syncActiveScene(api).catch((error) => {
    if (error instanceof SceneVaultQuotaError) {
      return;
    }
    console.error("[scene-vault] sync failed:", error);
  });
}, VAULT_SYNC_DEBOUNCE_MS);

export const scheduleVaultSync = (api: ExcalidrawImperativeAPI): void => {
  if (!isSceneVaultEnabled() || !isVaultEditingAllowed()) {
    return;
  }
  debouncedSync(api);
};

/** Flush pending debounced sync; run an immediate sync if none was pending. */
export const flushVaultSync = async (
  api?: ExcalidrawImperativeAPI,
): Promise<void> => {
  debouncedSync.flush();
  if (api && isSceneVaultEnabled() && isVaultEditingAllowed()) {
    await sceneVaultService.syncActiveScene(api);
  }
};
