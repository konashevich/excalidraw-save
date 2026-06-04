import { describe, expect, it } from "vitest";

import { driveSceneFilename, driveSharedFilename } from "./paths";

describe("google-drive paths", () => {
  it("builds vault scene filenames", () => {
    expect(driveSceneFilename("abc-123")).toBe("abc-123.excalidraw");
  });

  it("builds shared scene filenames", () => {
    expect(driveSharedFilename("share-1")).toBe("share-1.excalidraw");
  });
});
