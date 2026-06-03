import type { ExcalidrawImperativeAPI } from "@excalidraw/excalidraw/types";

import type { VaultScene } from "./types";

/** One-time toast after legacy localStorage scene is imported into the vault (§6.2). */
export const SCENE_VAULT_MIGRATION_TOAST_MESSAGE =
  "Your previous drawing was saved to My scenes.";

export const notifySceneVaultMigrationToast = (
  api: ExcalidrawImperativeAPI | null,
  migrated: VaultScene | null,
): void => {
  if (!migrated || !api) {
    return;
  }

  api.setToast({
    message: SCENE_VAULT_MIGRATION_TOAST_MESSAGE,
    closable: true,
    duration: 5000,
  });
};
