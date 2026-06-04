export {
  DEFAULT_DRIVE_ROOT_FOLDER,
  DRIVE_FILE_SCOPE,
  getDriveRootFolderName,
  getGoogleClientId,
  isGoogleDriveEnabled,
} from "./constants";

export type {
  DriveAuthSession,
  DriveFolderIds,
  DriveManifest,
  DriveManifestSceneEntry,
  DriveSyncResult,
} from "./types";

export {
  DriveApiError,
  DriveAuthError,
  DriveNotConfiguredError,
} from "./errors";

export {
  driveRootFolderName,
  DRIVE_MANIFEST_FILENAME,
  driveSceneFilename,
} from "./paths";

export {
  getAccessToken,
  getGoogleAccountEmail,
  isSignedInToGoogle,
  signInWithGoogle,
  signOutFromGoogle,
} from "./auth";

export {
  ensureDriveFolderStructure,
  readDriveManifest,
  writeDriveManifest,
} from "./api";

export {
  DriveSyncService,
  driveSyncService,
  isDriveSyncAvailable,
} from "./DriveSyncService";
