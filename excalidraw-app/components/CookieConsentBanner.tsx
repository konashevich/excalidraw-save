import { useEffect, useState } from "react";

import { SITE_URL } from "../branding/constants";
import {
  acceptAnalyticsConsent,
  isProductionAnalyticsEnabled,
  rejectAnalyticsConsent,
  shouldPromptForAnalyticsConsent,
  syncStoredConsentToGtag,
} from "../analytics/cookieConsent";

import "./CookieConsentBanner.scss";

export const CookieConsentBanner = () => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!isProductionAnalyticsEnabled()) {
      return;
    }

    syncStoredConsentToGtag();

    let cancelled = false;
    void shouldPromptForAnalyticsConsent().then((prompt) => {
      if (!cancelled) {
        setVisible(prompt);
      }
    });

    return () => {
      cancelled = true;
    };
  }, []);

  if (!visible) {
    return null;
  }

  return (
    <div
      className="cookie-consent-banner"
      role="dialog"
      aria-labelledby="cookie-consent-title"
      aria-describedby="cookie-consent-desc"
    >
      <div className="cookie-consent-banner__inner">
        <p id="cookie-consent-desc" className="cookie-consent-banner__text">
          <strong id="cookie-consent-title">Cookies and analytics</strong>
          {" — "}
          We use Google Analytics to measure site usage. You can accept or reject
          analytics cookies. Your drawings stay on your device. See our{" "}
          <a href={`${SITE_URL}/privacy/`}>privacy policy</a>.
        </p>
        <div className="cookie-consent-banner__actions">
          <button
            type="button"
            className="cookie-consent-banner__button cookie-consent-banner__button--secondary"
            onClick={() => {
              rejectAnalyticsConsent();
              setVisible(false);
            }}
          >
            Reject
          </button>
          <button
            type="button"
            className="cookie-consent-banner__button cookie-consent-banner__button--primary"
            onClick={() => {
              acceptAnalyticsConsent();
              setVisible(false);
            }}
          >
            Accept analytics
          </button>
        </div>
      </div>
    </div>
  );
};
