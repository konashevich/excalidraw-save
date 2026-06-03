import { describe, expect, it } from "vitest";

import { EXPORT_DATA_TYPES, VERSIONS } from "@excalidraw/common";
import { rectangleFixture } from "@excalidraw/excalidraw/tests/fixtures/elementFixture";

import { buildVaultScene } from "./SceneVaultStore";
import { serializeVaultSceneForDownload } from "./sceneExport";

describe("sceneExport", () => {
  it("serializes vault scene as excalidraw JSON", () => {
    const scene = buildVaultScene({
      title: "Test board",
      payload: {
        elements: [{ ...rectangleFixture, id: "export-rect" }],
        appState: { viewBackgroundColor: "#fff" },
        files: {},
      },
    });

    const json = serializeVaultSceneForDownload(scene);
    const parsed = JSON.parse(json);

    expect(parsed.type).toBe(EXPORT_DATA_TYPES.excalidraw);
    expect(parsed.version).toBe(VERSIONS.excalidraw);
    expect(parsed.elements).toHaveLength(1);
    expect(parsed.appState.viewBackgroundColor).toBe("#fff");
  });
});
