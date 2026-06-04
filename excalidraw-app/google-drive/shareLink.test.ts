import { describe, expect, it } from "vitest";

import {
  buildShareUrl,
  parseShareFileIdFromLocation,
} from "./shareLink";

describe("shareLink", () => {
  it("builds diagrams.free share URL with hash fragment", () => {
    expect(buildShareUrl("abc123")).toBe(
      "https://diagrams.free#share=abc123",
    );
  });

  it("parses file id from location hash", () => {
    expect(
      parseShareFileIdFromLocation("https://diagrams.free/#share=file-id-1"),
    ).toBe("file-id-1");
  });

  it("returns null when hash is missing", () => {
    expect(parseShareFileIdFromLocation("https://diagrams.free/")).toBeNull();
  });
});
