import { clear, createStore } from "idb-keyval";
import { beforeEach, describe, expect, it, vi } from "vitest";

import type { FileId } from "@excalidraw/element/types";
import type { DataURL } from "@excalidraw/excalidraw/types";

import { rectangleFixture } from "@excalidraw/excalidraw/tests/fixtures/elementFixture";

import { STORAGE_KEYS } from "../app_constants";

import { SceneVaultStore } from "./SceneVaultStore";
import { migrateLegacySceneIfNeeded } from "./migrateLegacyScene";

vi.mock("./constants", async (importOriginal) => {
  const mod = await importOriginal<typeof import("./constants")>();
  return { ...mod, isSceneVaultEnabled: () => true };
});

const fileId = "test-file-id" as FileId;
const imageElement = {
  ...rectangleFixture,
  id: "img-el",
  type: "image" as const,
  fileId,
  status: "saved" as const,
};

vi.mock("../data/LocalData", () => ({
  LocalData: {
    fileStorage: {
      getFiles: vi.fn(async () => ({
        loadedFiles: [
          {
            id: fileId,
            dataURL: "data:image/png;base64,abc" as DataURL,
            mimeType: "image/png",
            created: 1,
          },
        ],
        erroredFiles: new Map(),
      })),
    },
  },
}));

const testStore = createStore(
  "scene-vault-migrate-images-db",
  "scene-vault-migrate-images-store",
);

describe("migrateLegacySceneIfNeeded with images", () => {
  beforeEach(async () => {
    await clear(testStore);
    localStorage.clear();
  });

  it("includes image files from LocalData in migrated payload", async () => {
    localStorage.setItem(
      STORAGE_KEYS.LOCAL_STORAGE_ELEMENTS,
      JSON.stringify([imageElement]),
    );

    const migrated = await migrateLegacySceneIfNeeded(
      new SceneVaultStore({ store: testStore }),
    );

    expect(migrated).not.toBeNull();
    const scene = await new SceneVaultStore({ store: testStore }).getScene(
      migrated!.id,
    );
    expect(scene?.payload.files[fileId]).toBeDefined();
    expect(scene?.payload.files[fileId]?.mimeType).toBe("image/png");
  });
});
