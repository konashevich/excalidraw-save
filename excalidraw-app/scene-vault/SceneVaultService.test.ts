import { clear, createStore } from "idb-keyval";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { CaptureUpdateAction } from "@excalidraw/element";
import { rectangleFixture } from "@excalidraw/excalidraw/tests/fixtures/elementFixture";

import { SceneVaultService } from "./SceneVaultService";
import { SceneVaultStore } from "./SceneVaultStore";
import type { VaultScenePayload } from "./types";

vi.mock("../data/LocalData", () => ({
  LocalData: {
    flushSave: vi.fn(),
  },
}));

const testStore = createStore(
  "scene-vault-service-test-db",
  "scene-vault-service-test-store",
);

const makeAPI = (payload: VaultScenePayload) => {
  const files = payload.files;
  return {
    getSceneElementsIncludingDeleted: () => payload.elements,
    getAppState: () => ({
      ...payload.appState,
      theme: "light",
      openSidebar: null,
    }),
    getFiles: () => files,
    resetScene: vi.fn(),
    updateScene: vi.fn(),
    addFiles: vi.fn(),
  } as unknown as import("@excalidraw/excalidraw/types").ExcalidrawImperativeAPI;
};

describe("SceneVaultService", () => {
  let store: SceneVaultStore;
  let service: SceneVaultService;

  beforeEach(async () => {
    await clear(testStore);
    store = new SceneVaultStore({ store: testStore });
    service = new SceneVaultService(store);
  });

  it("archives current scene and opens another", async () => {
    const payloadA: VaultScenePayload = {
      elements: [{ ...rectangleFixture, id: "a" }],
      appState: { viewBackgroundColor: "#fff" },
      files: {},
    };
    const payloadB: VaultScenePayload = {
      elements: [{ ...rectangleFixture, id: "b" }],
      appState: { viewBackgroundColor: "#000" },
      files: {},
    };

    const apiA = makeAPI(payloadA);
    const archived = await service.archiveCurrentScene(apiA);
    expect(archived).not.toBeNull();

    const apiB = makeAPI(payloadB);
    const sceneB = await store.createScene({ payload: payloadB, title: "B" });

    const opened = await service.openScene(apiB, sceneB.id);
    expect(opened).toBe(true);
    expect(apiB.updateScene).toHaveBeenCalledWith(
      expect.objectContaining({
        captureUpdate: CaptureUpdateAction.IMMEDIATELY,
      }),
    );
    expect(await store.getActiveSceneId()).toBe(sceneB.id);
  });

  it("newCanvas archives then clears active id", async () => {
    const api = makeAPI({
      elements: [{ ...rectangleFixture }],
      appState: {},
      files: {},
    });

    await service.archiveCurrentScene(api);
    const activeBefore = await store.getActiveSceneId();
    expect(activeBefore).not.toBeNull();

    await service.newCanvas(api);
    expect(api.resetScene).toHaveBeenCalled();
    expect(await store.getActiveSceneId()).toBeNull();
    expect(await store.listScenes()).toHaveLength(1);
  });
});
