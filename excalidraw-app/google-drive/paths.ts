import { getDriveRootFolderName } from "./constants";

export const driveRootFolderName = (): string => getDriveRootFolderName();

/** Legacy nested layout — only used when reading older backups. */
export const DRIVE_VAULT_FOLDER = "vault";
export const DRIVE_SCENES_FOLDER = "scenes";
export const DRIVE_MANIFEST_FILENAME = "manifest.json";

export const driveSceneFilename = (sceneId: string): string =>
  `${sceneId}.excalidraw`;

export const driveSharedFilename = (shareId: string): string =>
  `${shareId}.excalidraw`;
