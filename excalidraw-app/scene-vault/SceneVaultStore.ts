import { createStore, del, get, set } from "idb-keyval";

import type { UseStore } from "idb-keyval";

import {
  SCENE_VAULT_DB_NAME,
  SCENE_VAULT_STORE_NAME,
  VAULT_ACTIVE_SCENE_ID_KEY,
  VAULT_INDEX_KEY,
  VAULT_LEGACY_MIGRATED_KEY,
  sceneStorageKey,
} from "./constants";
import type {
  VaultScene,
  VaultSceneInput,
  VaultSceneMeta,
  VaultScenePayload,
} from "./types";
import {
  countNonDeletedElements,
  defaultSceneTitle,
  sortMetaByUpdatedAtDesc,
} from "./utils";

const defaultStore = createStore(
  SCENE_VAULT_DB_NAME,
  SCENE_VAULT_STORE_NAME,
);

export const buildVaultScene = (input: VaultSceneInput): VaultScene => {
  const now = Date.now();
  const id = input.id ?? crypto.randomUUID();
  const createdAt = input.createdAt ?? now;
  const updatedAt = input.updatedAt ?? now;
  const elementCount = countNonDeletedElements(input.payload.elements);

  return {
    id,
    title: input.title ?? defaultSceneTitle(new Date(createdAt)),
    createdAt,
    updatedAt,
    elementCount,
    payload: input.payload,
  };
};

const metaFromScene = (scene: VaultScene): VaultSceneMeta => ({
  id: scene.id,
  title: scene.title,
  createdAt: scene.createdAt,
  updatedAt: scene.updatedAt,
  elementCount: scene.elementCount,
});

export class SceneVaultStore {
  private readonly store: UseStore;

  constructor(options?: { store?: UseStore }) {
    this.store = options?.store ?? defaultStore;
  }

  async listScenes(): Promise<VaultSceneMeta[]> {
    const index = await get<VaultSceneMeta[]>(VAULT_INDEX_KEY, this.store);
    return sortMetaByUpdatedAtDesc(index ?? []);
  }

  async getScene(id: string): Promise<VaultScene | null> {
    const scene = await get<VaultScene>(sceneStorageKey(id), this.store);
    return scene ?? null;
  }

  async upsertScene(scene: VaultScene): Promise<void> {
    const normalized: VaultScene = {
      ...scene,
      elementCount: countNonDeletedElements(scene.payload.elements),
    };

    await set(sceneStorageKey(normalized.id), normalized, this.store);

    const index = await get<VaultSceneMeta[]>(VAULT_INDEX_KEY, this.store);
    const nextIndex = sortMetaByUpdatedAtDesc([
      ...(index ?? []).filter((entry) => entry.id !== normalized.id),
      metaFromScene(normalized),
    ]);
    await set(VAULT_INDEX_KEY, nextIndex, this.store);
  }

  async createScene(input: VaultSceneInput): Promise<VaultScene> {
    const scene = buildVaultScene(input);
    await this.upsertScene(scene);
    return scene;
  }

  async deleteScene(id: string): Promise<void> {
    await del(sceneStorageKey(id), this.store);

    const index = await get<VaultSceneMeta[]>(VAULT_INDEX_KEY, this.store);
    if (index?.length) {
      await set(
        VAULT_INDEX_KEY,
        index.filter((entry) => entry.id !== id),
        this.store,
      );
    }

    const activeId = await this.getActiveSceneId();
    if (activeId === id) {
      await this.setActiveSceneId(null);
    }
  }

  async getActiveSceneId(): Promise<string | null> {
    const id = await get<string | null>(VAULT_ACTIVE_SCENE_ID_KEY, this.store);
    return id ?? null;
  }

  async setActiveSceneId(id: string | null): Promise<void> {
    await set(VAULT_ACTIVE_SCENE_ID_KEY, id, this.store);
  }

  async isLegacyMigrated(): Promise<boolean> {
    return (await get<boolean>(VAULT_LEGACY_MIGRATED_KEY, this.store)) === true;
  }

  async setLegacyMigrated(): Promise<void> {
    await set(VAULT_LEGACY_MIGRATED_KEY, true, this.store);
  }

  async upsertScenePayload(
    payload: VaultScenePayload,
    options?: Omit<VaultSceneInput, "payload">,
  ): Promise<VaultScene> {
    const existing = options?.id ? await this.getScene(options.id) : null;
    const scene = buildVaultScene({
      ...options,
      id: options?.id ?? existing?.id,
      title: options?.title ?? existing?.title,
      createdAt: options?.createdAt ?? existing?.createdAt,
      updatedAt: Date.now(),
      payload,
    });
    await this.upsertScene(scene);
    return scene;
  }
}

export const sceneVaultStore = new SceneVaultStore();
