/**
 * ISO 3166-1 alpha-2 codes for EEA countries + United Kingdom.
 * Used for GA4 Consent Mode regional defaults and the cookie banner.
 */
export const EEA_UK_GA_CONSENT_REGIONS = [
  "AT",
  "BE",
  "BG",
  "HR",
  "CY",
  "CZ",
  "DK",
  "EE",
  "FI",
  "FR",
  "DE",
  "GR",
  "HU",
  "IE",
  "IS",
  "IT",
  "LI",
  "LV",
  "LT",
  "LU",
  "MT",
  "NL",
  "NO",
  "PL",
  "PT",
  "RO",
  "SK",
  "SI",
  "ES",
  "SE",
  "GB",
] as const;

const EEA_UK_SET = new Set<string>(EEA_UK_GA_CONSENT_REGIONS);

/** Whether the visitor is in a jurisdiction that requires analytics consent. */
export const isEeaOrUkCountry = (
  countryCode: string | null | undefined,
): boolean => {
  if (!countryCode?.trim()) {
    return true;
  }
  return EEA_UK_SET.has(countryCode.trim().toUpperCase());
};
