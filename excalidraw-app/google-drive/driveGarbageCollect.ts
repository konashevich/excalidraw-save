import {
  findManifestFileId,
  listFilesInParent,
  readDriveManifest,
  trashDriveFiles,
} from "./api";
import { sceneIdFromDriveSceneFilename } from "./paths";

import type {
  DriveFolderIds,
  DriveManifest,
  DriveManifestSceneEntry,
  DriveSyncLocation,
} from "./types";

export const collectRetainedDriveFileIds = (
  scenes: DriveManifestSceneEntry[],
  manifestFileId?: string | null,
): Set<string> => {
  const retained = new Set<string>();
  for (const entry of scenes) {
    if (entry.driveFileId) {
      retained.add(entry.driveFileId);
    }
  }
  if (manifestFileId) {
    retained.add(manifestFileId);
  }
  return retained;
};

export const findOrphanSceneFileIds = (
  files: { id: string; name: string }[],
  retainedFileIds: Set<string>,
): string[] =>
  files
    .filter((file) => {
      if (!sceneIdFromDriveSceneFilename(file.name)) {
        return false;
      }
      return !retainedFileIds.has(file.id);
    })
    .map((file) => file.id);

export const shouldPruneFlatLegacy = (
  flatManifest: DriveManifest | null,
  nestedScenes: DriveManifestSceneEntry[],
): boolean => {
  if (!flatManifest?.scenes.length) {
    return false;
  }
  const nestedIds = new Set(nestedScenes.map((entry) => entry.id));
  return flatManifest.scenes.every((entry) => nestedIds.has(entry.id));
};

export const collectLegacyFlatSceneFileIds = (
  files: { id: string; name: string }[],
  nestedSceneIds: Set<string>,
): string[] =>
  files
    .filter((file) => {
      const sceneId = sceneIdFromDriveSceneFilename(file.name);
      return sceneId != null && nestedSceneIds.has(sceneId);
    })
    .map((file) => file.id);

export type DriveGarbageCollectResult = {
  trashedSceneFiles: number;
  trashedLegacyFiles: number;
};

/** Remove unreferenced scene files and superseded flat-root copies after nested backup. */
export const cleanupDriveVaultOrphans = async (options: {
  folders: DriveFolderIds;
  writeLocation: DriveSyncLocation;
  scenes: DriveManifestSceneEntry[];
  manifestFileId: string | null;
}): Promise<DriveGarbageCollectResult> => {
  const { folders, writeLocation, scenes, manifestFileId } = options;
  const retainedFileIds = collectRetainedDriveFileIds(scenes, manifestFileId);
  const nestedSceneIds = new Set(scenes.map((entry) => entry.id));

  const nestedSceneFiles = await listFilesInParent(writeLocation.scenesFolderId);
  const nestedOrphans = findOrphanSceneFileIds(nestedSceneFiles, retainedFileIds);
  let trashedSceneFiles = await trashDriveFiles(nestedOrphans);

  let trashedLegacyFiles = 0;
  const flatManifest = await readDriveManifest(folders.rootId);

  if (
    writeLocation.manifestFolderId === folders.vaultId &&
    shouldPruneFlatLegacy(flatManifest, scenes)
  ) {
    const legacyFileIds: string[] = [];

    const flatManifestFileId = await findManifestFileId(folders.rootId);
    if (flatManifestFileId) {
      legacyFileIds.push(flatManifestFileId);
    }

    const rootFiles = await listFilesInParent(folders.rootId);
    legacyFileIds.push(
      ...collectLegacyFlatSceneFileIds(rootFiles, nestedSceneIds),
    );

    if (writeLocation.scenesFolderId !== folders.vaultId) {
      const vaultRootFiles = await listFilesInParent(folders.vaultId);
      legacyFileIds.push(
        ...collectLegacyFlatSceneFileIds(vaultRootFiles, nestedSceneIds).filter(
          (fileId) => !retainedFileIds.has(fileId) && fileId !== manifestFileId,
        ),
      );
    }

    trashedLegacyFiles = await trashDriveFiles(
      legacyFileIds.filter((fileId) => fileId !== manifestFileId),
    );
  }

  return { trashedSceneFiles, trashedLegacyFiles };
};
