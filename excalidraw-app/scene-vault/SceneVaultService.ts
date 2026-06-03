import { CaptureUpdateAction } from "@excalidraw/element";
import {
  restoreAppState,
  restoreElements,
} from "@excalidraw/excalidraw/data/restore";

import type { ExcalidrawImperativeAPI } from "@excalidraw/excalidraw/types";

import { LocalData } from "../data/LocalData";

import { cloneVaultPayload } from "./clonePayload";
import { captureSceneFromAPICloned } from "./sceneCapture";
import { downloadVaultSceneAsFile } from "./sceneExport";
import { sceneVaultStore, type SceneVaultStore } from "./SceneVaultStore";
import type { VaultScene } from "./types";
import { isSceneNonEmpty } from "./utils";
import { assertVaultEditingAllowed, isVaultEditingAllowed } from "./vaultGuards";
import { flushVaultSync } from "./vaultSync";

export class SceneVaultService {
  constructor(private readonly store: SceneVaultStore = sceneVaultStore) {}

  private async flushBeforeVaultIO(
    api: ExcalidrawImperativeAPI,
  ): Promise<void> {
    await flushVaultSync(api);
    LocalData.flushSave();
  }

  /** Persist the current canvas into the active vault entry (or create one). */
  private async persistActiveCanvas(
    api: ExcalidrawImperativeAPI,
  ): Promise<VaultScene | null> {
    const payload = captureSceneFromAPICloned(api);

    if (!isSceneNonEmpty(payload)) {
      return null;
    }

    const activeId = await this.store.getActiveSceneId();
    if (activeId) {
      return this.store.upsertScenePayload(payload, { id: activeId });
    }

    const scene = await this.store.createScene({ payload });
    await this.store.setActiveSceneId(scene.id);
    return scene;
  }

  async archiveCurrentScene(
    api: ExcalidrawImperativeAPI,
  ): Promise<VaultScene | null> {
    assertVaultEditingAllowed();
    await this.flushBeforeVaultIO(api);
    return this.persistActiveCanvas(api);
  }

  async openScene(
    api: ExcalidrawImperativeAPI,
    sceneId: string,
  ): Promise<boolean> {
    assertVaultEditingAllowed();
    if ((await this.store.getActiveSceneId()) === sceneId) {
      return true;
    }

    await this.flushBeforeVaultIO(api);

    const activeId = await this.store.getActiveSceneId();
    if (activeId) {
      await this.persistActiveCanvas(api);
    }

    const scene = await this.store.getScene(sceneId);
    if (!scene) {
      return false;
    }

    const payload = cloneVaultPayload(scene.payload);
    const currentAppState = api.getAppState();

    api.resetScene();
    api.updateScene({
      elements: restoreElements(payload.elements, null, {
        repairBindings: true,
        deleteInvisibleElements: true,
      }),
      appState: restoreAppState(
        {
          ...payload.appState,
          theme: currentAppState.theme,
          isLoading: false,
        },
        currentAppState,
      ),
      captureUpdate: CaptureUpdateAction.IMMEDIATELY,
    });

    if (Object.keys(payload.files).length > 0) {
      api.addFiles(Object.values(payload.files));
    }

    await this.store.setActiveSceneId(sceneId);
    LocalData.flushSave();
    return true;
  }

  async newCanvas(api: ExcalidrawImperativeAPI): Promise<void> {
    assertVaultEditingAllowed();
    await this.flushBeforeVaultIO(api);
    await this.persistActiveCanvas(api);
    api.resetScene();
    await this.store.setActiveSceneId(null);
    LocalData.flushSave();
  }

  async deleteScene(
    sceneId: string,
    api?: ExcalidrawImperativeAPI,
  ): Promise<void> {
    assertVaultEditingAllowed();
    const activeId = await this.store.getActiveSceneId();
    await this.store.deleteScene(sceneId);

    if (activeId === sceneId && api) {
      api.resetScene();
      await this.store.setActiveSceneId(null);
      LocalData.flushSave();
    }
  }

  async downloadScene(sceneId: string): Promise<void> {
    const scene = await this.store.getScene(sceneId);
    if (!scene) {
      throw new Error("Scene not found");
    }
    downloadVaultSceneAsFile(scene);
  }

  /**
   * Persists the active editor state into the vault entry for {@link activeSceneId}.
   * Creates a new vault entry when the canvas becomes non-empty and none is active.
   */
  async syncActiveScene(api: ExcalidrawImperativeAPI): Promise<void> {
    if (!isVaultEditingAllowed()) {
      return;
    }
    const payload = captureSceneFromAPICloned(api);

    if (!isSceneNonEmpty(payload)) {
      return;
    }

    const activeId = await this.store.getActiveSceneId();
    if (activeId) {
      await this.store.upsertScenePayload(payload, { id: activeId });
      return;
    }

    const scene = await this.store.createScene({ payload });
    await this.store.setActiveSceneId(scene.id);
  }
}

export const sceneVaultService = new SceneVaultService();
