import { describe, expect, it, vi } from "vitest";

import {
  SCENE_VAULT_MIGRATION_TOAST_MESSAGE,
  notifySceneVaultMigrationToast,
} from "./migrationToast";
import type { VaultScene } from "./types";

describe("notifySceneVaultMigrationToast", () => {
  it("shows a closable toast when migration created a scene", () => {
    const setToast = vi.fn();
    const api = { setToast } as unknown as import("@excalidraw/excalidraw/types").ExcalidrawImperativeAPI;

    notifySceneVaultMigrationToast(api, { id: "scene-1" } as VaultScene);

    expect(setToast).toHaveBeenCalledWith({
      message: SCENE_VAULT_MIGRATION_TOAST_MESSAGE,
      closable: true,
      duration: 5000,
    });
  });

  it("does nothing when migration did not create a scene", () => {
    const setToast = vi.fn();
    const api = { setToast } as unknown as import("@excalidraw/excalidraw/types").ExcalidrawImperativeAPI;

    notifySceneVaultMigrationToast(api, null);
    notifySceneVaultMigrationToast(null, { id: "scene-1" } as VaultScene);

    expect(setToast).not.toHaveBeenCalled();
  });
});
