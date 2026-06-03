import { describe, expect, it } from "vitest";

import type { FileId } from "@excalidraw/element/types";
import type { DataURL } from "@excalidraw/excalidraw/types";

import { rectangleFixture } from "@excalidraw/excalidraw/tests/fixtures/elementFixture";

import {
  duplicateSceneTitle,
  isSceneNonEmpty,
  titleFromFilename,
} from "./utils";

describe("isSceneNonEmpty", () => {
  it("returns false for empty canvas", () => {
    expect(
      isSceneNonEmpty({
        elements: [],
        appState: {},
        files: {},
      }),
    ).toBe(false);
  });

  it("returns true when elements exist", () => {
    expect(
      isSceneNonEmpty({
        elements: [{ ...rectangleFixture }],
        appState: {},
        files: {},
      }),
    ).toBe(true);
  });

  it("returns true when only files exist", () => {
    const fileId = "file-1" as FileId;
    expect(
      isSceneNonEmpty({
        elements: [],
        appState: {},
        files: {
          [fileId]: {
            id: fileId,
            dataURL: "data:image/png;base64,abc" as DataURL,
            mimeType: "image/png",
            created: 1,
            lastRetrieved: 1,
          },
        },
      }),
    ).toBe(true);
  });
});

describe("duplicateSceneTitle", () => {
  it("appends (copy) to the scene title", () => {
    expect(duplicateSceneTitle("Architecture v1")).toBe("Architecture v1 (copy)");
  });
});

describe("titleFromFilename", () => {
  it("strips path and extension", () => {
    expect(titleFromFilename("/path/my-diagram.excalidraw")).toBe("my-diagram");
    expect(titleFromFilename("sketch.json")).toBe("sketch");
  });
});
