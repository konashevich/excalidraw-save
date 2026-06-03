import { useCallback, useEffect, useState } from "react";

import { Dialog } from "@excalidraw/excalidraw/components/Dialog";
import DialogActionButton from "@excalidraw/excalidraw/components/DialogActionButton";
import ConfirmDialog from "@excalidraw/excalidraw/components/ConfirmDialog";

import type { ExcalidrawImperativeAPI } from "@excalidraw/excalidraw/types";

import { sceneVaultService } from "./SceneVaultService";
import { sceneVaultStore } from "./SceneVaultStore";
import type { VaultSceneMeta } from "./types";

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
  const [busy, setBusy] = useState(false);

  const refreshList = useCallback(async () => {
    const list = await sceneVaultStore.listScenes();
    setScenes(list);
  }, []);

  useEffect(() => {
    if (isOpen) {
      void refreshList();
    }
  }, [isOpen, refreshList, activeSceneId]);

  const runAction = async (action: () => Promise<void>) => {
    setBusy(true);
    try {
      await action();
      await refreshList();
      onScenesChange();
    } catch (error) {
      console.error("[scene-vault]", error);
    } finally {
      setBusy(false);
    }
  };

  if (!isOpen) {
    return null;
  }

  return (
    <>
      <Dialog
        className="scene-vault-dialog"
        onCloseRequest={onClose}
        title="My scenes"
        size="small"
      >
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
        </div>

        {scenes.length === 0 ? (
          <p className="scene-vault-dialog__empty">
            No saved scenes yet. Use &quot;New canvas&quot; to archive your
            current drawing and start fresh.
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
    </>
  );
};
