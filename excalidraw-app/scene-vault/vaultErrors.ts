export const isQuotaExceededError = (error: unknown): boolean =>
  error instanceof DOMException && error.name === "QuotaExceededError";

export class SceneVaultQuotaError extends Error {
  constructor() {
    super("Scene vault storage quota exceeded");
    this.name = "SceneVaultQuotaError";
  }
}

export type SceneVaultUnavailableReason = "collaboration" | "external_scene";

export class SceneVaultUnavailableError extends Error {
  readonly reason: SceneVaultUnavailableReason;

  constructor(reason: SceneVaultUnavailableReason) {
    super(
      reason === "collaboration"
        ? "Scene vault is unavailable while collaborating"
        : "Scene vault is unavailable for shared or imported link scenes",
    );
    this.name = "SceneVaultUnavailableError";
    this.reason = reason;
  }
}
