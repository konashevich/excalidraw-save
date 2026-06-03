import type { ExcalidrawElement, FileId } from "@excalidraw/element/types";
import type {
  AppState,
  BinaryFileData,
} from "@excalidraw/excalidraw/types";

export type VaultSceneMeta = {
  id: string;
  title: string;
  createdAt: number;
  updatedAt: number;
  elementCount: number;
};

export type VaultScenePayload = {
  elements: ExcalidrawElement[];
  appState: Partial<AppState>;
  files: Record<FileId, BinaryFileData>;
};

export type VaultScene = VaultSceneMeta & {
  payload: VaultScenePayload;
};

export type VaultSceneInput = {
  payload: VaultScenePayload;
  id?: string;
  title?: string;
  createdAt?: number;
  updatedAt?: number;
};
