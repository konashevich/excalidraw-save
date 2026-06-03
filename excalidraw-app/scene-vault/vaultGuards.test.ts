import { beforeEach, describe, expect, it } from "vitest";

import {
  assertVaultEditingAllowed,
  isVaultEditingAllowed,
  setVaultOperationContext,
} from "./vaultGuards";
import { SceneVaultUnavailableError } from "./vaultErrors";

describe("vaultGuards", () => {
  beforeEach(() => {
    setVaultOperationContext({
      isCollaborating: false,
      isExternalScene: false,
    });
  });

  it("allows editing in default context", () => {
    expect(isVaultEditingAllowed()).toBe(true);
    expect(() => assertVaultEditingAllowed()).not.toThrow();
  });

  it("blocks during collaboration", () => {
    setVaultOperationContext({
      isCollaborating: true,
      isExternalScene: false,
    });
    expect(isVaultEditingAllowed()).toBe(false);
    expect(() => assertVaultEditingAllowed()).toThrow(SceneVaultUnavailableError);
  });

  it("blocks for external scenes", () => {
    setVaultOperationContext({
      isCollaborating: false,
      isExternalScene: true,
    });
    expect(isVaultEditingAllowed()).toBe(false);
  });
});
