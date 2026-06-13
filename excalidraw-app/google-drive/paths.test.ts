import { describe, expect, it } from "vitest";

import { driveSceneFilename, driveSharedFilename, sceneIdFromDriveSceneFilename } from "./paths";

describe("google-drive paths", () => {
  it("builds vault scene filenames", () => {
    expect(driveSceneFilename("abc-123")).toBe("abc-123.excalidraw");
  });

  it("parses scene ids from vault scene filenames", () => {
    expect(sceneIdFromDriveSceneFilename("abc-123.excalidraw")).toBe("abc-123");
    expect(sceneIdFromDriveSceneFilename("manifest.json")).toBeNull();
  });

  it("builds shared scene filenames", () => {
    expect(driveSharedFilename("share-1")).toBe("share-1.excalidraw");
  });
});
