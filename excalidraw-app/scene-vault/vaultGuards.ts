import { SceneVaultUnavailableError } from "./vaultErrors";

export type VaultOperationContext = {
  isCollaborating: boolean;
  isExternalScene: boolean;
};

let operationContext: VaultOperationContext = {
  isCollaborating: false,
  isExternalScene: false,
};

export const setVaultOperationContext = (context: VaultOperationContext): void => {
  operationContext = context;
};

export const getVaultOperationContext = (): VaultOperationContext =>
  operationContext;

export const isVaultEditingAllowed = (
  context: VaultOperationContext = operationContext,
): boolean => !context.isCollaborating && !context.isExternalScene;

export const assertVaultEditingAllowed = (): void => {
  if (operationContext.isCollaborating) {
    throw new SceneVaultUnavailableError("collaboration");
  }
  if (operationContext.isExternalScene) {
    throw new SceneVaultUnavailableError("external_scene");
  }
};
