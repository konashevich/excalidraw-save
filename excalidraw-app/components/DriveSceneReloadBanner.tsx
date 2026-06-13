import { useState } from "react";

import { FilledButton } from "@excalidraw/excalidraw/components/FilledButton";
import DialogActionButton from "@excalidraw/excalidraw/components/DialogActionButton";

import type { ExcalidrawImperativeAPI } from "@excalidraw/excalidraw/types";

import { sceneVaultService } from "../scene-vault";

import "./DriveSceneReloadBanner.scss";

type Props = {
  excalidrawAPI: ExcalidrawImperativeAPI;
  sceneId: string;
  onReloaded: () => void;
  onDismiss: () => void;
};

export const DriveSceneReloadBanner = ({
  excalidrawAPI,
  sceneId,
  onReloaded,
  onDismiss,
}: Props) => {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleReload = () => {
    setBusy(true);
    setError(null);
    void sceneVaultService
      .openScene(excalidrawAPI, sceneId)
      .then(() => {
        onReloaded();
      })
      .catch((err) => {
        console.error("[google-drive] reload scene from Drive", err);
        setError(
          err instanceof Error
            ? err.message
            : "Could not reload this scene from Google Drive.",
        );
      })
      .finally(() => {
        setBusy(false);
      });
  };

  return (
    <div className="drive-scene-reload-banner" role="status">
      <p className="drive-scene-reload-banner__text">
        <strong>Newer version on Google Drive.</strong> The open scene was
        updated on another device. Reload to replace what you see on the canvas.
      </p>
      {error ? (
        <p className="drive-scene-reload-banner__error" role="alert">
          {error}
        </p>
      ) : null}
      <div className="drive-scene-reload-banner__actions">
        <FilledButton
          size="medium"
          label="Reload from Drive"
          disabled={busy}
          onClick={handleReload}
        />
        <DialogActionButton
          label="Keep current canvas"
          onClick={onDismiss}
          disabled={busy}
        />
      </div>
    </div>
  );
};
