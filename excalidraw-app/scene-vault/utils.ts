import { getNonDeletedElements } from "@excalidraw/element";

import type { VaultScenePayload } from "./types";

export const defaultSceneTitle = (date = new Date()): string => {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `Scene ${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}`;
};

export const countNonDeletedElements = (
  elements: VaultScenePayload["elements"],
): number => getNonDeletedElements(elements).length;

export const isSceneNonEmpty = (payload: VaultScenePayload): boolean =>
  countNonDeletedElements(payload.elements) > 0 ||
  Object.keys(payload.files).length > 0;

export const sanitizeFilename = (title: string): string => {
  const sanitized = title.replace(/[/\\?%*:|"<>]/g, "-").trim();
  return sanitized || "scene";
};

export const sortMetaByUpdatedAtDesc = <T extends { updatedAt: number }>(
  items: T[],
): T[] => [...items].sort((a, b) => b.updatedAt - a.updatedAt);
