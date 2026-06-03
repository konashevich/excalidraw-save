/**
 * Scene vault — local multi-canvas storage (see docs/scene-vault-design.md).
 * Gated by VITE_APP_SCENE_VAULT until later phases wire UI and persistence.
 */

/** Vite env flag: must be the string "true" to enable the scene vault feature. */
export const SCENE_VAULT_ENV_KEY = "VITE_APP_SCENE_VAULT";

export const isSceneVaultEnabled = (): boolean =>
  import.meta.env.VITE_APP_SCENE_VAULT === "true";

export const SCENE_VAULT_DB_NAME = "scene-vault-db";
export const SCENE_VAULT_STORE_NAME = "scene-vault-store";

export const VAULT_INDEX_KEY = "vault:index";
export const VAULT_ACTIVE_SCENE_ID_KEY = "vault:activeSceneId";
export const VAULT_LEGACY_MIGRATED_KEY = "vault:legacyMigrated";

export const sceneStorageKey = (id: string): string => `scene:${id}`;

/** Debounced sync of the active canvas into the vault (ms). */
export const VAULT_SYNC_DEBOUNCE_MS = 1500;

export const VAULT_BROADCAST_CHANNEL = "excalidraw-scene-vault";
