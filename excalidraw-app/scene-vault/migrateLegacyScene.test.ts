import { clear, createStore } from "idb-keyval";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { rectangleFixture } from "@excalidraw/excalidraw/tests/fixtures/elementFixture";

import { STORAGE_KEYS } from "../app_constants";

import { SceneVaultStore } from "./SceneVaultStore";
import { migrateLegacySceneIfNeeded } from "./migrateLegacyScene";

vi.mock("./constants", async (importOriginal) => {
  const mod = await importOriginal<typeof import("./constants")>();
  return { ...mod, isSceneVaultEnabled: () => true };
});

const testStore = createStore(
  "scene-vault-migrate-test-db",
  "scene-vault-migrate-test-store",
);

describe("migrateLegacySceneIfNeeded", () => {
  let store: SceneVaultStore;

  beforeEach(async () => {
    await clear(testStore);
    localStorage.clear();
    store = new SceneVaultStore({ store: testStore });
  });

  afterEach(() => {
    localStorage.clear();
  });

  it("imports non-empty localStorage scene into vault once", async () => {
    localStorage.setItem(
      STORAGE_KEYS.LOCAL_STORAGE_ELEMENTS,
      JSON.stringify([{ ...rectangleFixture, id: "legacy-rect" }]),
    );
    localStorage.setItem(
      STORAGE_KEYS.LOCAL_STORAGE_APP_STATE,
      JSON.stringify({ viewBackgroundColor: "#eee" }),
    );

    const migrated = await migrateLegacySceneIfNeeded(store);
    expect(migrated).not.toBeNull();
    expect(migrated?.elementCount).toBe(1);

    expect(await store.listScenes()).toHaveLength(1);
    expect(await store.getActiveSceneId()).toBe(migrated?.id);
    expect(await store.isLegacyMigrated()).toBe(true);

    const secondRun = await migrateLegacySceneIfNeeded(store);
    expect(secondRun).toBeNull();
    expect(await store.listScenes()).toHaveLength(1);
  });

  it("does not mark migrated when persistence fails", async () => {
    localStorage.setItem(
      STORAGE_KEYS.LOCAL_STORAGE_ELEMENTS,
      JSON.stringify([{ ...rectangleFixture, id: "legacy-rect" }]),
    );

    const createSpy = vi
      .spyOn(store, "createScene")
      .mockRejectedValueOnce(new Error("idb error"));

    const result = await migrateLegacySceneIfNeeded(store);
    expect(result).toBeNull();
    expect(await store.isLegacyMigrated()).toBe(false);
    createSpy.mockRestore();
  });

  it("marks migrated when localStorage scene is empty", async () => {
    const result = await migrateLegacySceneIfNeeded(store);
    expect(result).toBeNull();
    expect(await store.isLegacyMigrated()).toBe(true);
    expect(await store.listScenes()).toHaveLength(0);
  });
});
