import { describe, expect, it } from "vitest";

import { pickBestDriveSyncLocation } from "./api";

import type { DriveManifest, DriveSyncLocation } from "./types";

const location = (
  manifestFolderId: string,
  scenesFolderId: string,
): DriveSyncLocation => ({
  manifestFolderId,
  scenesFolderId,
});

const manifest = (
  scenes: number,
  updatedAt: number,
): DriveManifest => ({
  version: 1,
  updatedAt,
  scenes: Array.from({ length: scenes }, (_, index) => ({
    id: `scene-${index}`,
    title: `Scene ${index}`,
    updatedAt,
    driveFileId: `file-${index}`,
  })),
});

describe("pickBestDriveSyncLocation", () => {
  it("prefers manifest with more scenes", () => {
    const nested = location("vault", "vault/scenes");
    const flat = location("root", "root");
    const picked = pickBestDriveSyncLocation([
      { location: nested, manifest: manifest(0, 500) },
      { location: flat, manifest: manifest(3, 100) },
    ]);
    expect(picked).toEqual(flat);
  });

  it("tie-breaks equal scene count by newer updatedAt", () => {
    const older = location("vault", "vault/scenes");
    const newer = location("root", "root");
    const picked = pickBestDriveSyncLocation([
      { location: older, manifest: manifest(2, 100) },
      { location: newer, manifest: manifest(2, 200) },
    ]);
    expect(picked).toEqual(newer);
  });

  it("returns null for empty candidates", () => {
    expect(pickBestDriveSyncLocation([])).toBeNull();
  });
});
