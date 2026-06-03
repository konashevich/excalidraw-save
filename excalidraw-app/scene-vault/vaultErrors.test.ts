import { describe, expect, it } from "vitest";

import { isQuotaExceededError, SceneVaultQuotaError } from "./vaultErrors";

describe("vaultErrors", () => {
  it("detects QuotaExceededError", () => {
    expect(
      isQuotaExceededError(new DOMException("x", "QuotaExceededError")),
    ).toBe(true);
    expect(isQuotaExceededError(new Error("other"))).toBe(false);
  });

  it("exposes SceneVaultQuotaError name", () => {
    expect(new SceneVaultQuotaError().name).toBe("SceneVaultQuotaError");
  });
});
