import { useCallback, useEffect, useRef, useState } from "react";

import { Dialog } from "@excalidraw/excalidraw/components/Dialog";
import DialogActionButton from "@excalidraw/excalidraw/components/DialogActionButton";
import ConfirmDialog from "@excalidraw/excalidraw/components/ConfirmDialog";
import { TextField } from "@excalidraw/excalidraw/components/TextField";

import type { ExcalidrawImperativeAPI } from "@excalidraw/excalidraw/types";

import { useAtomValue } from "../app-jotai";

import { sceneVaultService } from "./SceneVaultService";
import { sceneVaultStore } from "./SceneVaultStore";
import type { VaultSceneMeta } from "./types";
import {
  SceneVaultQuotaError,
  SceneVaultUnavailableError,
} from "./vaultErrors";
import {
  sceneVaultListRevisionAtom,
  sceneVaultQuotaExceededAtom,
} from "./vaultState";
import { subscribeVaultChanges } from "./vaultTabSync";

import "./SceneVaultDialog.scss";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  excalidrawAPI: ExcalidrawImperativeAPI;
  activeSceneId: string | null;
  onScenesChange: () => void;
};

const formatUpdatedAt = (timestamp: number): string => {
  try {
    return new Date(timestamp).toLocaleString();
  } catch {
    return "";
  }
};

export const SceneVaultDialog = ({
  isOpen,
  onClose,
  excalidrawAPI,
  activeSceneId,
  onScenesChange,
}: Props) => {
  const [scenes, setScenes] = useState<VaultSceneMeta[]>([]);
  const [deleteTarget, setDeleteTarget] = useState<VaultSceneMeta | null>(null);
  const [renameTarget, setRenameTarget] = useState<VaultSceneMeta | null>(null);
  const [renameTitle, setRenameTitle] = useState("");
  const [busy, setBusy] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const vaultQuotaExceeded = useAtomValue(sceneVaultQuotaExceededAtom);
  const listRevision = useAtomValue(sceneVaultListRevisionAtom);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const refreshList = useCallback(async () => {
    const list = await sceneVaultStore.listScenes();
    setScenes(list);
  }, []);

  useEffect(() => {
    if (isOpen) {
      setActionError(null);
      void sceneVaultStore.repairVaultIndex().then(() => refreshList());
    }
  }, [isOpen, refreshList, activeSceneId, listRevision]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }
    return subscribeVaultChanges(() => {
      void refreshList();
      onScenesChange();
    });
  }, [isOpen, refreshList, onScenesChange]);

  useEffect(() => {
    if (renameTarget) {
      setRenameTitle(renameTarget.title);
    }
  }, [renameTarget]);

  const runAction = async (action: () => Promise<void>) => {
    setBusy(true);
    setActionError(null);
    try {
      await action();
      await refreshList();
      onScenesChange();
    } catch (error) {
      console.error("[scene-vault]", error);
      if (error instanceof SceneVaultQuotaError) {
        setActionError(
          "Storage is full. Delete or download scenes to free space.",
        );
      } else if (error instanceof SceneVaultUnavailableError) {
        setActionError(error.message);
      } else if (error instanceof Error) {
        setActionError(error.message);
      }
    } finally {
      setBusy(false);
    }
  };

  const openImportPicker = () => {
    fileInputRef.current?.click();
  };

  const handleImportFile = (file: File) => {
    void runAction(async () => {
      await sceneVaultService.importSceneFromFile(file);
    });
  };

  if (!isOpen) {
    return null;
  }

  return (
    <>
      <input
        ref={fileInputRef}
        type="file"
        className="scene-vault-dialog__file-input"
        accept=".excalidraw,.json,application/json"
        onChange={(event) => {
          const file = event.target.files?.[0];
          event.target.value = "";
          if (file) {
            handleImportFile(file);
          }
        }}
      />

      <Dialog
        className="scene-vault-dialog"
        onCloseRequest={onClose}
        title="My scenes"
        size="small"
      >
        {(vaultQuotaExceeded || actionError) && (
          <p className="scene-vault-dialog__error" role="alert">
            {actionError ??
              "Storage is full. Delete or download scenes to free space."}
          </p>
        )}

        <div className="scene-vault-dialog__header-actions">
          <DialogActionButton
            label="New canvas"
            onClick={() =>
              runAction(async () => {
                await sceneVaultService.newCanvas(excalidrawAPI);
                onClose();
              })
            }
            disabled={busy}
          />
          <DialogActionButton
            label="Import file"
            onClick={openImportPicker}
            disabled={busy}
          />
        </div>

        {scenes.length === 0 ? (
          <p className="scene-vault-dialog__empty">
            No saved scenes yet. Use &quot;New canvas&quot; to archive your
            current drawing, or &quot;Import file&quot; to add a .excalidraw
            file to My scenes.
          </p>
        ) : (
          <ul className="scene-vault-dialog__list">
            {scenes.map((scene) => (
              <li key={scene.id} className="scene-vault-dialog__item">
                <div className="scene-vault-dialog__meta">
                  <div className="scene-vault-dialog__title">
                    {scene.title}
                    {activeSceneId === scene.id ? " (editing)" : ""}
                  </div>
                  <div className="scene-vault-dialog__subtitle">
                    {formatUpdatedAt(scene.updatedAt)} · {scene.elementCount}{" "}
                    elements
                  </div>
                </div>
                <div className="scene-vault-dialog__actions">
                  <DialogActionButton
                    label="Open"
                    onClick={() =>
                      runAction(async () => {
                        const ok = await sceneVaultService.openScene(
                          excalidrawAPI,
                          scene.id,
                        );
                        if (ok) {
                          onClose();
                        }
                      })
                    }
                    disabled={busy}
                  />
                  <DialogActionButton
                    label="Rename"
                    onClick={() => setRenameTarget(scene)}
                    disabled={busy}
                  />
                  <DialogActionButton
                    label="Duplicate"
                    onClick={() =>
                      runAction(async () => {
                        await sceneVaultService.duplicateScene(scene.id);
                      })
                    }
                    disabled={busy}
                  />
                  <DialogActionButton
                    label="Download"
                    onClick={() =>
                      runAction(async () => {
                        await sceneVaultService.downloadScene(scene.id);
                      })
                    }
                    disabled={busy}
                  />
                  <DialogActionButton
                    label="Delete"
                    onClick={() => setDeleteTarget(scene)}
                    disabled={busy}
                  />
                </div>
              </li>
            ))}
          </ul>
        )}
      </Dialog>

      {deleteTarget && (
        <ConfirmDialog
          title="Delete scene?"
          onConfirm={() =>
            runAction(async () => {
              await sceneVaultService.deleteScene(deleteTarget.id, excalidrawAPI);
              setDeleteTarget(null);
            })
          }
          onCancel={() => setDeleteTarget(null)}
        >
          <p>
            Delete &quot;{deleteTarget.title}&quot;? This cannot be undone.
          </p>
        </ConfirmDialog>
      )}

      {renameTarget && (
        <ConfirmDialog
          title="Rename scene"
          onConfirm={() =>
            runAction(async () => {
              await sceneVaultService.renameScene(renameTarget.id, renameTitle);
              setRenameTarget(null);
            })
          }
          onCancel={() => setRenameTarget(null)}
        >
          <TextField
            label="Title"
            value={renameTitle}
            onChange={setRenameTitle}
            fullWidth
            selectOnRender
          />
        </ConfirmDialog>
      )}
    </>
  );
};
