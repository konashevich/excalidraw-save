import { clearAppStateForLocalStorage } from "@excalidraw/excalidraw/appState";
import { loadFromBlob } from "@excalidraw/excalidraw/data/blob";

import { cloneVaultPayload } from "./clonePayload";
import type { VaultScenePayload } from "./types";
import { isSceneNonEmpty, titleFromFilename } from "./utils";

export type ParsedVaultImport = {
  payload: VaultScenePayload;
  suggestedTitle: string;
};

/**
 * Parse a `.excalidraw` file into a vault payload without loading the editor.
 */
export const parseExcalidrawFileForVault = async (
  file: File,
): Promise<ParsedVaultImport> => {
  const data = await loadFromBlob(file, null, null, file.handle ?? null);

  const payload = cloneVaultPayload({
    elements: data.elements,
    appState: clearAppStateForLocalStorage(data.appState),
    files: data.files ?? {},
  });

  if (!isSceneNonEmpty(payload)) {
    throw new Error("File has no drawing content.");
  }

  return {
    payload,
    suggestedTitle: titleFromFilename(file.name),
  };
};
