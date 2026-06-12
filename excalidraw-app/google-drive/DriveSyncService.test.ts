import { afterEach, describe, expect, it, vi } from "vitest";

import { DriveSyncService } from "./DriveSyncService";
import { DriveAuthError } from "./errors";

import type { DriveSyncResult } from "./types";

const syncResult = (syncedAt = Date.now()): DriveSyncResult => ({
  uploadedScenes: 1,
  restoredScenes: 0,
  syncedAt,
});

describe("DriveSyncService.backupVaultToDrive", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("serializes overlapping backups instead of running them concurrently", async () => {
    let inFlight = 0;
    let maxInFlight = 0;
    const service = new DriveSyncService();

    vi.spyOn(service as never, "assertReady").mockImplementation(() => {});
    vi.spyOn(
      service as never,
      "backupVaultToDriveInner",
    ).mockImplementation(async () => {
      inFlight += 1;
      maxInFlight = Math.max(maxInFlight, inFlight);
      await new Promise((resolve) => setTimeout(resolve, 20));
      inFlight -= 1;
      return syncResult();
    });

    const results = await Promise.all([
      service.backupVaultToDrive(),
      service.backupVaultToDrive(),
      service.backupVaultToDrive(),
    ]);

    expect(results).toHaveLength(3);
    expect(maxInFlight).toBe(1);
    expect(
      (service as never as { backupVaultToDriveInner: { mock: { calls: unknown[] } } })
        .backupVaultToDriveInner.mock.calls,
    ).toHaveLength(3);
  });

  it("still rejects when not signed in", async () => {
    const service = new DriveSyncService();
    await expect(service.backupVaultToDrive()).rejects.toBeInstanceOf(
      DriveAuthError,
    );
  });
});
