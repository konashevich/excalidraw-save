import { describe, expect, it } from "vitest";

import { isEeaOrUkCountry } from "./consentRegions";

describe("isEeaOrUkCountry", () => {
  it("returns true for EU and UK codes", () => {
    expect(isEeaOrUkCountry("de")).toBe(true);
    expect(isEeaOrUkCountry("GB")).toBe(true);
    expect(isEeaOrUkCountry("NO")).toBe(true);
  });

  it("returns false for other countries", () => {
    expect(isEeaOrUkCountry("US")).toBe(false);
    expect(isEeaOrUkCountry("JP")).toBe(false);
  });

  it("treats missing country as requiring consent", () => {
    expect(isEeaOrUkCountry(null)).toBe(true);
    expect(isEeaOrUkCountry("")).toBe(true);
  });
});
