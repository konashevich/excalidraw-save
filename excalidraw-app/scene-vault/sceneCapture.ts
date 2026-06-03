import { clearAppStateForLocalStorage } from "@excalidraw/excalidraw/appState";
import { getNonDeletedElements } from "@excalidraw/element";

import type { ExcalidrawImperativeAPI } from "@excalidraw/excalidraw/types";

import type { VaultScenePayload } from "./types";
import { isSceneNonEmpty } from "./utils";

export const captureSceneFromAPI = (
  api: ExcalidrawImperativeAPI,
): VaultScenePayload => {
  const elements = [
    ...getNonDeletedElements(api.getSceneElementsIncludingDeleted()),
  ];
  const appState = clearAppStateForLocalStorage(api.getAppState());
  const files = { ...api.getFiles() };

  return { elements, appState, files };
};

export const isAPISceneNonEmpty = (api: ExcalidrawImperativeAPI): boolean =>
  isSceneNonEmpty(captureSceneFromAPI(api));
