import { isInitializedImageElement } from "@excalidraw/element";

import type { FileId } from "@excalidraw/element/types";
import type { BinaryFiles } from "@excalidraw/excalidraw/types";

import { clearAppStateForLocalStorage } from "@excalidraw/excalidraw/appState";

import { LocalData } from "../data/LocalData";
import { importFromLocalStorage } from "../data/localStorage";

import { isSceneVaultEnabled } from "./constants";
import { sceneVaultStore, type SceneVaultStore } from "./SceneVaultStore";
import type { VaultScene, VaultScenePayload } from "./types";
import { isSceneNonEmpty } from "./utils";

const collectFileIds = (
  elements: VaultScenePayload["elements"],
): FileId[] => {
  const ids: FileId[] = [];
  for (const element of elements) {
    if (isInitializedImageElement(element) && element.fileId) {
      ids.push(element.fileId);
    }
  }
  return ids;
};

const loadFilesForElements = async (
  elements: VaultScenePayload["elements"],
): Promise<BinaryFiles> => {
  const fileIds = collectFileIds(elements);
  if (!fileIds.length) {
    return {};
  }

  const { loadedFiles } = await LocalData.fileStorage.getFiles(fileIds);
  const files: BinaryFiles = {};
  for (const file of loadedFiles) {
    files[file.id] = file;
  }
  return files;
};

/**
 * On first run with scene vault enabled, import the single localStorage scene
 * into the vault so existing drawings are not lost.
 */
export const migrateLegacySceneIfNeeded = async (
  store: SceneVaultStore = sceneVaultStore,
): Promise<VaultScene | null> => {
  if (!isSceneVaultEnabled()) {
    return null;
  }

  if (await store.isLegacyMigrated()) {
    return null;
  }

  try {
    const existing = await store.listScenes();
    if (existing.length > 0) {
      await store.setLegacyMigrated();
      return null;
    }

    const { elements, appState } = importFromLocalStorage();
    const payload: VaultScenePayload = {
      elements,
      appState: appState
        ? clearAppStateForLocalStorage(appState)
        : {},
      files: await loadFilesForElements(elements),
    };

    if (!isSceneNonEmpty(payload)) {
      await store.setLegacyMigrated();
      return null;
    }

    const scene = await store.createScene({ payload });
    await store.setActiveSceneId(scene.id);
    await store.setLegacyMigrated();
    return scene;
  } catch (error) {
    console.error("[scene-vault] legacy migration failed:", error);
    await store.setLegacyMigrated();
    return null;
  }
};
