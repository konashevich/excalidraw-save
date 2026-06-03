import { clear, createStore } from "idb-keyval";
import { beforeEach, describe, expect, it } from "vitest";

import { rectangleFixture } from "@excalidraw/excalidraw/tests/fixtures/elementFixture";

import { SceneVaultStore, buildVaultScene } from "./SceneVaultStore";
import type { VaultScenePayload } from "./types";

const testStore = createStore("scene-vault-test-db", "scene-vault-test-store");

const samplePayload = (): VaultScenePayload => ({
  elements: [{ ...rectangleFixture, id: "rect-1" }],
  appState: { viewBackgroundColor: "#ffffff" },
  files: {},
});

describe("SceneVaultStore", () => {
  let store: SceneVaultStore;

  beforeEach(async () => {
    await clear(testStore);
    store = new SceneVaultStore({ store: testStore });
  });

  it("creates and lists scenes sorted by updatedAt desc", async () => {
    const older = await store.createScene({
      payload: samplePayload(),
      title: "Older",
      createdAt: 1000,
      updatedAt: 1000,
    });
    const newer = await store.createScene({
      payload: samplePayload(),
      title: "Newer",
      createdAt: 2000,
      updatedAt: 2000,
    });

    const list = await store.listScenes();
    expect(list.map((s) => s.id)).toEqual([newer.id, older.id]);
  });

  it("upserts scene and refreshes index metadata", async () => {
    const scene = await store.createScene({
      payload: samplePayload(),
      title: "Draft",
    });

    const updated = buildVaultScene({
      ...scene,
      title: "Final",
      updatedAt: scene.updatedAt + 1000,
      payload: {
        ...scene.payload,
        elements: [
          ...scene.payload.elements,
          { ...rectangleFixture, id: "rect-2" },
        ],
      },
    });

    await store.upsertScene(updated);

    const loaded = await store.getScene(scene.id);
    expect(loaded?.title).toBe("Final");
    expect(loaded?.elementCount).toBe(2);

    const list = await store.listScenes();
    expect(list[0].id).toBe(scene.id);
    expect(list[0].elementCount).toBe(2);
  });

  it("deletes scene and clears active pointer when needed", async () => {
    const scene = await store.createScene({ payload: samplePayload() });
    await store.setActiveSceneId(scene.id);

    await store.deleteScene(scene.id);

    expect(await store.getScene(scene.id)).toBeNull();
    expect(await store.listScenes()).toHaveLength(0);
    expect(await store.getActiveSceneId()).toBeNull();
  });

  it("tracks active scene id and legacy migration flag", async () => {
    expect(await store.getActiveSceneId()).toBeNull();
    await store.setActiveSceneId("scene-a");
    expect(await store.getActiveSceneId()).toBe("scene-a");

    expect(await store.isLegacyMigrated()).toBe(false);
    await store.setLegacyMigrated();
    expect(await store.isLegacyMigrated()).toBe(true);
  });
});
