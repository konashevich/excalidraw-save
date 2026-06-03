import { MIME_TYPES } from "@excalidraw/common";
import { serializeAsJSON } from "@excalidraw/excalidraw/data/json";

import type { VaultScene, VaultScenePayload } from "./types";
import { sanitizeFilename } from "./utils";

export const serializeVaultSceneForDownload = (
  scene: VaultScene | VaultScenePayload & { title?: string },
): string => {
  const payload = "payload" in scene ? scene.payload : scene;
  return serializeAsJSON(
    payload.elements,
    payload.appState,
    payload.files,
    "local",
  );
};

export const downloadVaultSceneAsFile = (scene: VaultScene): void => {
  const json = serializeVaultSceneForDownload(scene);
  const blob = new Blob([json], { type: MIME_TYPES.excalidraw });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = `${sanitizeFilename(scene.title)}.excalidraw`;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
};
