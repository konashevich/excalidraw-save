import { describe, expect, it } from "vitest";

import {
  containsExcalidrawBrand,
  sanitizeBrandString,
  sanitizeLocaleBrandStrings,
} from "./sanitizeLocale";

describe("sanitizeBrandString", () => {
  it("replaces Excalidraw with diagrams.free in English", () => {
    expect(sanitizeBrandString("Made with Excalidraw")).toBe(
      "Made with diagrams.free",
    );
  });

  it("replaces Excalidraw in French strings", () => {
    expect(sanitizeBrandString("Fait avec Excalidraw")).toBe(
      "Fait avec diagrams.free",
    );
  });

  it("preserves .excalidraw file extension", () => {
    expect(sanitizeBrandString("valid Excalidraw JSON in .excalidraw file")).toBe(
      "valid diagram JSON in .excalidraw file",
    );
  });

  it("neutralizes Excalidraw+ references", () => {
    expect(sanitizeBrandString("Export to Excalidraw+")).toBe(
      "Export to diagrams.free",
    );
  });
});

describe("sanitizeLocaleBrandStrings", () => {
  it("clears upsell label on any locale", () => {
    const result = sanitizeLocaleBrandStrings({
      chat: { upsellBtnLabel: "Upgrade to Plus" },
    });
    expect(result).toEqual({ chat: { upsellBtnLabel: "" } });
  });

  it("sanitizes nested locale tree", () => {
    const fr = {
      labels: { madeWithExcalidraw: "Fait avec Excalidraw" },
      mermaid: { title: "De Mermaid à Excalidraw" },
    };
    const sanitized = sanitizeLocaleBrandStrings(fr);
    expect(containsExcalidrawBrand(sanitized)).toBe(false);
    expect(sanitized).toEqual({
      labels: { madeWithExcalidraw: "Fait avec diagrams.free" },
      mermaid: { title: "De Mermaid à diagrams.free" },
    });
  });
});

describe("all upstream locales", () => {
  it("have no Excalidraw branding after sanitization", async () => {
    const { readdir, readFile } = await import("node:fs/promises");
    const { join } = await import("node:path");
    const localesDir = join(
      import.meta.dirname,
      "../../packages/excalidraw/locales",
    );
    const files = (await readdir(localesDir)).filter(
      (name) => name.endsWith(".json") && name !== "percentages.json",
    );

    for (const file of files) {
      const raw = await readFile(join(localesDir, file), "utf8");
      const data = JSON.parse(raw) as Record<string, unknown>;
      const sanitized = sanitizeLocaleBrandStrings(data);
      expect(
        containsExcalidrawBrand(sanitized),
        `still contains Excalidraw brand in ${file}`,
      ).toBe(false);
    }
  });
});
