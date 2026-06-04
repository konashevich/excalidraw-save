import {
  setLocaleOverrides,
  setLocalePostProcessor,
} from "@excalidraw/excalidraw/i18n";

import enOverrides from "./locale-overrides/en.json";
import { sanitizeLocaleBrandStrings } from "./sanitizeLocale";

export const applyBranding = (): void => {
  setLocaleOverrides({ en: enOverrides });
  setLocalePostProcessor((data, _langCode) => sanitizeLocaleBrandStrings(data));
};
