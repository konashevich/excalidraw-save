/**
 * Replaces upstream Excalidraw branding in locale strings for any language.
 * Applied after locale load + per-language overrides (see applyBranding.ts).
 */

const EXCALIDRAW_EXT_PLACEHOLDER = "\u0000EXCALIDRAW_EXT\u0000";

/** Keys that need fixed values regardless of language (Plus upsell stripped in this fork). */
const KEY_PATH_OVERRIDES: Record<string, string> = {
  "chat.upsellBtnLabel": "",
};

/** Keys where English override copy is used for all locales (neutral legal/product phrasing). */
const KEY_PATH_EN_NEUTRAL: Record<string, string> = {
  "encrypted.link": "Learn more about encryption",
  "exportDialog.excalidrawplus_description":
    "Save the scene to your cloud workspace.",
  "exportDialog.excalidrawplus_exportError":
    "Couldn't export to cloud at this moment...",
  "overwriteConfirm.action.excalidrawPlus.title": "Cloud export",
  "overwriteConfirm.action.excalidrawPlus.button": "Export to cloud",
  "overwriteConfirm.action.excalidrawPlus.description":
    "Save the scene to your cloud workspace.",
  "errors.brave_measure_text_error.line4":
    "If disabling this setting doesn't fix the display of text elements, please open an <issueLink>issue</issueLink> on GitHub or email <supportLink>support@diagrams.free</supportLink>.",
};

export const sanitizeBrandString = (value: string): string => {
  if (!value) {
    return value;
  }

  let s = value.replace(/\.excalidraw/gi, EXCALIDRAW_EXT_PLACEHOLDER);

  s = s.replace(/Excalidraw\+/gi, "diagrams.free");
  s = s.replace(/Excalidraw['']s servers/gi, "the server");
  s = s.replace(/Excalidraw server/gi, "the server");
  s = s.replace(/Excalidraw JSON/gi, "diagram JSON");
  s = s.replace(/Excalidraw Library/gi, "Shape library");
  s = s.replace(/\bExcalidraw\b/gi, "diagrams.free");
  s = s.replace(/Excalidraw/g, "diagrams.free");

  s = s.replaceAll(EXCALIDRAW_EXT_PLACEHOLDER, ".excalidraw");
  s = s.replace(/  +/g, " ");

  return s;
};

const deepSanitize = (obj: unknown, path = ""): unknown => {
  if (typeof obj === "string") {
    if (path in KEY_PATH_OVERRIDES) {
      return KEY_PATH_OVERRIDES[path];
    }
    if (path in KEY_PATH_EN_NEUTRAL) {
      return KEY_PATH_EN_NEUTRAL[path];
    }
    return sanitizeBrandString(obj);
  }

  if (obj && typeof obj === "object" && !Array.isArray(obj)) {
    const out: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(obj)) {
      const childPath = path ? `${path}.${key}` : key;
      out[key] = deepSanitize(value, childPath);
    }
    return out;
  }

  return obj;
};

export const sanitizeLocaleBrandStrings = (
  data: Record<string, unknown>,
): Record<string, unknown> => deepSanitize(data) as Record<string, unknown>;

/** True if any string value still mentions Excalidraw branding (for tests). */
export const containsExcalidrawBrand = (data: unknown): boolean => {
  if (typeof data === "string") {
    const normalized = data.replace(/\.excalidraw/gi, "");
    return /excalidraw/i.test(normalized);
  }
  if (data && typeof data === "object" && !Array.isArray(data)) {
    return Object.values(data).some(containsExcalidrawBrand);
  }
  return false;
};
