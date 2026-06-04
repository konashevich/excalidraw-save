import { SITE_URL } from "../branding/constants";

const SHARE_HASH_PREFIX = "#share=";

export const buildShareUrl = (driveFileId: string): string =>
  `${SITE_URL.replace(/\/$/, "")}${SHARE_HASH_PREFIX}${encodeURIComponent(driveFileId)}`;

export const parseShareFileIdFromLocation = (
  href: string = typeof window !== "undefined" ? window.location.href : "",
): string | null => {
  const hash = new URL(href).hash;
  if (!hash.startsWith(SHARE_HASH_PREFIX)) {
    return null;
  }
  const raw = hash.slice(SHARE_HASH_PREFIX.length).split("&")[0];
  if (!raw) {
    return null;
  }
  try {
    return decodeURIComponent(raw);
  } catch {
    return raw;
  }
};

export const isDriveShareLink = (href: string): boolean =>
  parseShareFileIdFromLocation(href) != null;
