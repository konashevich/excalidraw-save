import { clear, createStore, set } from "idb-keyval";
import { beforeEach, describe, expect, it } from "vitest";

import { rectangleFixture } from "@excalidraw/excalidraw/tests/fixtures/elementFixture";

import { SceneVaultStore, buildVaultScene } from "./SceneVaultStore";
import { VAULT_INDEX_KEY, sceneStorageKey } from "./constants";

const testStore = createStore("scene-vault-repair-test-db", "scene-vault-repair-test-store");

describe("SceneVaultStore.repairVaultIndex", () => {
  let store: SceneVaultStore;

  beforeEach(async () => {
    await clear(testStore);
    store = new SceneVaultStore({ store: testStore });
  });

  it("rebuilds index from scene blobs when index is stale", async () => {
    const scene = buildVaultScene({
      title: "Recovered",
      payload: {
        elements: [{ ...rectangleFixture, id: "r1" }],
        appState: {},
        files: {},
      },
    });

    await set(sceneStorageKey(scene.id), scene, testStore);
    await set(VAULT_INDEX_KEY, [], testStore);

    expect(await store.listScenes()).toHaveLength(0);

    await store.repairVaultIndex();

    const list = await store.listScenes();
    expect(list).toHaveLength(1);
    expect(list[0].title).toBe("Recovered");
  });
});
