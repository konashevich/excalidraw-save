export {
  SCENE_VAULT_ENV_KEY,
  isSceneVaultEnabled,
  SCENE_VAULT_DB_NAME,
  SCENE_VAULT_STORE_NAME,
} from "./constants";

export type {
  VaultScene,
  VaultSceneMeta,
  VaultScenePayload,
  VaultSceneInput,
} from "./types";

export {
  defaultSceneTitle,
  countNonDeletedElements,
  isSceneNonEmpty,
  sanitizeFilename,
  sortMetaByUpdatedAtDesc,
} from "./utils";

export {
  SceneVaultStore,
  sceneVaultStore,
  buildVaultScene,
} from "./SceneVaultStore";

export {
  captureSceneFromAPI,
  captureSceneFromAPICloned,
  isAPISceneNonEmpty,
} from "./sceneCapture";

export { cloneVaultPayload } from "./clonePayload";

export {
  serializeVaultSceneForDownload,
  downloadVaultSceneAsFile,
} from "./sceneExport";

export {
  migrateLegacySceneIfNeeded,
  migrateLegacySceneAfterImagesLoaded,
} from "./migrateLegacyScene";

export {
  SCENE_VAULT_MIGRATION_TOAST_MESSAGE,
  notifySceneVaultMigrationToast,
} from "./migrationToast";

export { SceneVaultService, sceneVaultService } from "./SceneVaultService";

export { scheduleVaultSync, flushVaultSync } from "./vaultSync";

export { SceneVaultDialog } from "./SceneVaultDialog";
export { SceneVaultClearCanvasDialog } from "./SceneVaultClearCanvasDialog";

export {
  VAULT_SYNC_DEBOUNCE_MS,
  VAULT_BROADCAST_CHANNEL,
} from "./constants";

export {
  SceneVaultQuotaError,
  SceneVaultUnavailableError,
  isQuotaExceededError,
} from "./vaultErrors";

export {
  sceneVaultQuotaExceededAtom,
  sceneVaultListRevisionAtom,
} from "./vaultState";

export {
  setVaultOperationContext,
  getVaultOperationContext,
  isVaultEditingAllowed,
  assertVaultEditingAllowed,
} from "./vaultGuards";

export { notifyVaultChanged, subscribeVaultChanges } from "./vaultTabSync";
