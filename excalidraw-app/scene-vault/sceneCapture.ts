import {
  CANVAS_SEARCH_TAB,
  DEFAULT_SIDEBAR,
} from "@excalidraw/common";
import { clearAppStateForLocalStorage } from "@excalidraw/excalidraw/appState";
import { getNonDeletedElements } from "@excalidraw/element";

import type { AppState, ExcalidrawImperativeAPI } from "@excalidraw/excalidraw/types";

import { cloneVaultPayload } from "./clonePayload";
import type { VaultScenePayload } from "./types";
import { isSceneNonEmpty } from "./utils";

const prepareAppStateForVault = (appState: AppState): Partial<AppState> => {
  const _appState = clearAppStateForLocalStorage(appState);

  if (
    _appState.openSidebar?.name === DEFAULT_SIDEBAR.name &&
    _appState.openSidebar.tab === CANVAS_SEARCH_TAB
  ) {
    _appState.openSidebar = null;
  }

  return _appState;
};

export const captureSceneFromAPI = (
  api: ExcalidrawImperativeAPI,
): VaultScenePayload => {
  const elements = [
    ...getNonDeletedElements(api.getSceneElementsIncludingDeleted()),
  ];
  const appState = prepareAppStateForVault(api.getAppState());
  const files = { ...api.getFiles() };

  return { elements, appState, files };
};

export const captureSceneFromAPICloned = (
  api: ExcalidrawImperativeAPI,
): VaultScenePayload => cloneVaultPayload(captureSceneFromAPI(api));

export const isAPISceneNonEmpty = (api: ExcalidrawImperativeAPI): boolean =>
  isSceneNonEmpty(captureSceneFromAPI(api));
