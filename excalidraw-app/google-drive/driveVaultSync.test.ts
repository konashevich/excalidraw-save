import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import {
  DRIVE_AUTO_SYNC_STORAGE_KEY,
  DRIVE_LINKED_STORAGE_KEY,
} from "./constants";

const backupVaultToDrive = vi.fn();

vi.mock("./DriveSyncService", () => ({
  driveSyncService: {
    backupVaultToDrive,
  },
}));

vi.mock("./auth", () => ({
  getAccessToken: vi.fn(() => "token"),
  isGoogleDriveLinked: vi.fn(() => true),
  tryRefreshAccessToken: vi.fn(async () => true),
}));

describe("driveVaultSync", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.stubEnv("VITE_APP_GOOGLE_DRIVE", "true");
    vi.stubEnv("VITE_APP_GOOGLE_CLIENT_ID", "client-id");
    localStorage.setItem(DRIVE_LINKED_STORAGE_KEY, "true");
    localStorage.setItem(DRIVE_AUTO_SYNC_STORAGE_KEY, "true");
    backupVaultToDrive.mockReset();
    backupVaultToDrive.mockResolvedValue({
      uploadedScenes: 1,
      restoredScenes: 0,
      syncedAt: 1,
    });
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    localStorage.clear();
    vi.restoreAllMocks();
  });

  it("flushDriveVaultSync runs exactly one backup", async () => {
    const { scheduleDriveVaultSync, flushDriveVaultSync } = await import(
      "./driveVaultSync"
    );

    scheduleDriveVaultSync();
    await flushDriveVaultSync();

    expect(backupVaultToDrive).toHaveBeenCalledTimes(1);
  });
});
