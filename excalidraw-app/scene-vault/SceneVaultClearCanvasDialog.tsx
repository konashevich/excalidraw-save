import { useEffect, useState } from "react";

import { activeConfirmDialogAtom } from "@excalidraw/excalidraw/components/ActiveConfirmDialog";
import ConfirmDialog from "@excalidraw/excalidraw/components/ConfirmDialog";
import { editorJotaiStore } from "@excalidraw/excalidraw/editor-jotai";

import type { ExcalidrawImperativeAPI } from "@excalidraw/excalidraw/types";

import { sceneVaultService } from "./SceneVaultService";

type Props = {
  enabled: boolean;
  excalidrawAPI: ExcalidrawImperativeAPI;
  onAfterClear: () => void;
};

/**
 * When scene vault is enabled, intercepts the package clear-canvas confirm
 * (e.g. command palette) and archives via newCanvas instead of destructive clear.
 */
export const SceneVaultClearCanvasDialog = ({
  enabled,
  excalidrawAPI,
  onAfterClear,
}: Props) => {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!enabled) {
      return;
    }

    const unsub = editorJotaiStore.sub(activeConfirmDialogAtom, () => {
      if (editorJotaiStore.get(activeConfirmDialogAtom) === "clearCanvas") {
        editorJotaiStore.set(activeConfirmDialogAtom, null);
        setOpen(true);
      }
    });

    return unsub;
  }, [enabled]);

  if (!enabled || !open) {
    return null;
  }

  return (
    <ConfirmDialog
      title="Save and start new canvas?"
      onConfirm={() => {
        void sceneVaultService.newCanvas(excalidrawAPI).then(() => {
          onAfterClear();
          setOpen(false);
        });
      }}
      onCancel={() => setOpen(false)}
    >
      <p>
        Your current drawing will be saved to My scenes before the canvas is
        cleared.
      </p>
    </ConfirmDialog>
  );
};
