import { describe, expect, it } from "vitest";

import {
  collectLegacyFlatSceneFileIds,
  collectRetainedDriveFileIds,
  findOrphanSceneFileIds,
  shouldPruneFlatLegacy,
} from "./driveGarbageCollect";

import type { DriveManifest } from "./types";

const entry = (id: string, driveFileId: string) => ({
  id,
  title: id,
  updatedAt: 100,
  driveFileId,
});

describe("driveGarbageCollect helpers", () => {
  it("collects retained manifest and scene file ids", () => {
    const retained = collectRetainedDriveFileIds(
      [entry("a", "file-a")],
      "manifest-1",
    );
    expect(retained).toEqual(new Set(["file-a", "manifest-1"]));
  });

  it("finds orphan scene files not referenced by the manifest", () => {
    const retained = new Set(["keep"]);
    const orphans = findOrphanSceneFileIds(
      [
        { id: "keep", name: "scene-a.excalidraw" },
        { id: "drop", name: "scene-b.excalidraw" },
        { id: "note", name: "readme.txt" },
      ],
      retained,
    );
    expect(orphans).toEqual(["drop"]);
  });

  it("allows flat legacy prune when nested contains all flat scene ids", () => {
    const flat: DriveManifest = {
      version: 1,
      updatedAt: 50,
      scenes: [entry("a", "flat-a"), entry("b", "flat-b")],
    };
    const nested = [entry("a", "nested-a"), entry("b", "nested-b"), entry("c", "nested-c")];
    expect(shouldPruneFlatLegacy(flat, nested)).toBe(true);
    expect(shouldPruneFlatLegacy(flat, [entry("a", "nested-a")])).toBe(false);
  });

  it("collects legacy flat scene files for nested scene ids", () => {
    const ids = collectLegacyFlatSceneFileIds(
      [
        { id: "flat-a", name: "a.excalidraw" },
        { id: "flat-x", name: "x.excalidraw" },
        { id: "manifest", name: "manifest.json" },
      ],
      new Set(["a", "b"]),
    );
    expect(ids).toEqual(["flat-a"]);
  });
});
