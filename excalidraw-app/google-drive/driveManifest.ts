import type {
  DriveManifest,
  DriveManifestSceneEntry,
} from "./types";

/** Merge scene entries from multiple manifests; newer updatedAt wins per id. */
const mergeTwoManifests = (
  base: DriveManifest,
  incoming: DriveManifest,
): DriveManifest => {
  const byId = new Map<string, DriveManifestSceneEntry>();
  for (const entry of base.scenes) {
    byId.set(entry.id, entry);
  }
  for (const entry of incoming.scenes) {
    const existing = byId.get(entry.id);
    if (!existing || entry.updatedAt > existing.updatedAt) {
      byId.set(entry.id, entry);
    }
  }
  return {
    version: Math.max(base.version, incoming.version),
    updatedAt: Math.max(base.updatedAt, incoming.updatedAt),
    scenes: [...byId.values()],
  };
};

export const mergeDriveManifests = (
  ...manifests: (DriveManifest | null | undefined)[]
): DriveManifest | null => {
  let merged: DriveManifest | null = null;

  for (const manifest of manifests) {
    if (!manifest) {
      continue;
    }
    if (!merged) {
      merged = {
        version: manifest.version,
        updatedAt: manifest.updatedAt,
        scenes: [...manifest.scenes],
      };
      continue;
    }

    merged = mergeTwoManifests(merged, manifest);
  }

  return merged;
};

export const manifestScenesEqual = (
  left: DriveManifestSceneEntry[],
  right: DriveManifestSceneEntry[],
): boolean => {
  if (left.length !== right.length) {
    return false;
  }

  const rightById = new Map(right.map((entry) => [entry.id, entry]));
  for (const entry of left) {
    const other = rightById.get(entry.id);
    if (!other) {
      return false;
    }
    if (
      entry.updatedAt !== other.updatedAt ||
      entry.title !== other.title ||
      entry.driveFileId !== other.driveFileId
    ) {
      return false;
    }
  }

  return true;
};
