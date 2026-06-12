import { debounce } from "@excalidraw/common";

import {
  isDriveAutoSyncEnabled,
  isGoogleDriveEnabled,
  setDriveLastSyncAt,
} from "./constants";
import { notifyDriveAutoSyncFailed } from "./driveAutoSyncNotify";
import { driveSyncService } from "./DriveSyncService";
import { getAccessToken, isGoogleDriveLinked, tryRefreshAccessToken } from "./auth";
import { DriveApiError } from "./errors";

import type { DriveSyncResult } from "./types";

const DRIVE_SYNC_DEBOUNCE_MS = 2500;

const isDriveAutoSyncAuthError = (error: unknown): boolean =>
  error instanceof DriveApiError &&
  (error.status === 401 || error.status === 403);

const runDriveVaultBackup = async (): Promise<DriveSyncResult | undefined> => {
  if (
    !isGoogleDriveEnabled() ||
    !isGoogleDriveLinked() ||
    !isDriveAutoSyncEnabled()
  ) {
    return;
  }
  if (!(await tryRefreshAccessToken()) || !getAccessToken()) {
    return;
  }
  try {
    const result = await driveSyncService.backupVaultToDrive();
    setDriveLastSyncAt(result.syncedAt);
    return result;
  } catch (error) {
    console.error("[google-drive] auto-sync failed:", error);
    if (isDriveAutoSyncAuthError(error)) {
      notifyDriveAutoSyncFailed();
    }
    throw error;
  }
};

const debouncedDriveBackup = debounce(() => {
  void runDriveVaultBackup();
}, DRIVE_SYNC_DEBOUNCE_MS);

export const scheduleDriveVaultSync = (): void => {
  debouncedDriveBackup();
};

/** Flush debounced backup and run a single immediate backup when Drive auto-sync is on. */
export const flushDriveVaultSync = async (): Promise<void> => {
  debouncedDriveBackup.cancel();
  try {
    await runDriveVaultBackup();
  } catch {
    // runDriveVaultBackup already logs and notifies on auth errors
  }
};
