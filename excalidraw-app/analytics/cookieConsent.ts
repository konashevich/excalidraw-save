import { isEeaOrUkCountry } from "./consentRegions";

export const ANALYTICS_CONSENT_STORAGE_KEY = "diagrams-free-analytics-consent";

/** Rough geo lookup for consent banner (no API key). */
const GEO_LOOKUP_URL = "https://api.country.is/";

const GEO_TIMEOUT_MS = 4000;

export type AnalyticsConsentChoice = "granted" | "denied";

export const isProductionAnalyticsEnabled = (): boolean =>
  import.meta.env.PROD &&
  import.meta.env.VITE_APP_ENABLE_TRACKING === "true" &&
  !!import.meta.env.VITE_APP_GA_MEASUREMENT_ID?.trim();

export const getStoredAnalyticsConsent =
  (): AnalyticsConsentChoice | null => {
    try {
      const value = localStorage.getItem(ANALYTICS_CONSENT_STORAGE_KEY);
      if (value === "granted" || value === "denied") {
        return value;
      }
    } catch {
      // private mode / blocked storage
    }
    return null;
  };

export const setStoredAnalyticsConsent = (
  choice: AnalyticsConsentChoice,
): void => {
  try {
    localStorage.setItem(ANALYTICS_CONSENT_STORAGE_KEY, choice);
  } catch {
    // ignore
  }
};

/** Push Consent Mode v2 update to gtag (no-op if tag not loaded). */
export const applyGtagAnalyticsConsent = (granted: boolean): void => {
  if (typeof window === "undefined" || typeof window.gtag !== "function") {
    return;
  }
  window.gtag("consent", "update", {
    analytics_storage: granted ? "granted" : "denied",
    ad_storage: "denied",
    ad_user_data: "denied",
    ad_personalization: "denied",
  });
};

export const syncStoredConsentToGtag = (): void => {
  const stored = getStoredAnalyticsConsent();
  if (stored) {
    applyGtagAnalyticsConsent(stored === "granted");
  }
};

const fetchUserCountryCode = async (): Promise<string | null> => {
  const controller = new AbortController();
  const timeoutId = window.setTimeout(() => controller.abort(), GEO_TIMEOUT_MS);
  try {
    const response = await fetch(GEO_LOOKUP_URL, {
      signal: controller.signal,
    });
    if (!response.ok) {
      return null;
    }
    const data: { country?: string } = await response.json();
    return typeof data.country === "string" ? data.country : null;
  } catch {
    return null;
  } finally {
    window.clearTimeout(timeoutId);
  }
};

/**
 * Whether to show the EU/UK cookie banner.
 * Applies stored consent to gtag when present; auto-grants outside EEA/UK when geo succeeds.
 */
export const shouldPromptForAnalyticsConsent = async (): Promise<boolean> => {
  const stored = getStoredAnalyticsConsent();
  if (stored) {
    applyGtagAnalyticsConsent(stored === "granted");
    return false;
  }

  try {
    const country = await fetchUserCountryCode();
    if (country && !isEeaOrUkCountry(country)) {
      applyGtagAnalyticsConsent(true);
      return false;
    }
  } catch {
    // fail-safe: prompt when geo lookup fails
  }

  return true;
};

export const acceptAnalyticsConsent = (): void => {
  setStoredAnalyticsConsent("granted");
  applyGtagAnalyticsConsent(true);
};

export const rejectAnalyticsConsent = (): void => {
  setStoredAnalyticsConsent("denied");
  applyGtagAnalyticsConsent(false);
};
