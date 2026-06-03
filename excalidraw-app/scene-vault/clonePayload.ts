import type { FileId } from "@excalidraw/element/types";
import type { BinaryFileData } from "@excalidraw/excalidraw/types";

import type { VaultScenePayload } from "./types";

const cloneFilesRecord = (
  files: VaultScenePayload["files"],
): VaultScenePayload["files"] => {
  const next: VaultScenePayload["files"] = {};
  for (const id of Object.keys(files) as FileId[]) {
    next[id] = { ...files[id] };
  }
  return next;
};

/** Deep-enough copy so vault snapshots are not mutated by the live editor. */
export const cloneVaultPayload = (
  payload: VaultScenePayload,
): VaultScenePayload => ({
  elements: structuredClone(payload.elements),
  appState: structuredClone(payload.appState),
  files: cloneFilesRecord(payload.files),
});
