import { debounce } from "@excalidraw/common";

import type { ExcalidrawImperativeAPI } from "@excalidraw/excalidraw/types";

import { isSceneVaultEnabled, VAULT_SYNC_DEBOUNCE_MS } from "./constants";
import { sceneVaultService } from "./SceneVaultService";

const debouncedSync = debounce((api: ExcalidrawImperativeAPI) => {
  void sceneVaultService.syncActiveScene(api).catch((error) => {
    console.error("[scene-vault] sync failed:", error);
  });
}, VAULT_SYNC_DEBOUNCE_MS);

export const scheduleVaultSync = (api: ExcalidrawImperativeAPI): void => {
  if (!isSceneVaultEnabled()) {
    return;
  }
  debouncedSync(api);
};

export const flushVaultSync = (): void => {
  debouncedSync.flush();
};
