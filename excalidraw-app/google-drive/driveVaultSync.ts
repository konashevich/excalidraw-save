import { debounce } from "@excalidraw/common";

import {
  isDriveAutoSyncEnabled,
  isGoogleDriveEnabled,
} from "./constants";
import { driveSyncService } from "./DriveSyncService";
import { isSignedInToGoogle } from "./auth";

const DRIVE_SYNC_DEBOUNCE_MS = 2500;

const debouncedDriveBackup = debounce(() => {
  if (
    !isGoogleDriveEnabled() ||
    !isSignedInToGoogle() ||
    !isDriveAutoSyncEnabled()
  ) {
    return;
  }
  void driveSyncService.backupVaultToDrive().catch((error) => {
    console.error("[google-drive] auto-sync failed:", error);
  });
}, DRIVE_SYNC_DEBOUNCE_MS);

export const scheduleDriveVaultSync = (): void => {
  debouncedDriveBackup();
};

export const flushDriveVaultSync = (): void => {
  debouncedDriveBackup.flush();
};
