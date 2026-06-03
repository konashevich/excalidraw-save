import { beforeEach, describe, expect, it, vi } from "vitest";

import { rectangleFixture } from "@excalidraw/excalidraw/tests/fixtures/elementFixture";

import { parseExcalidrawFileForVault } from "./sceneImport";

vi.mock("@excalidraw/excalidraw/data/blob", () => ({
  loadFromBlob: vi.fn(),
}));

const { loadFromBlob } = await import("@excalidraw/excalidraw/data/blob");

describe("parseExcalidrawFileForVault", () => {
  beforeEach(() => {
    vi.mocked(loadFromBlob).mockReset();
  });

  it("returns cloned payload and title from filename", async () => {
    vi.mocked(loadFromBlob).mockResolvedValue({
      elements: [{ ...rectangleFixture, id: "imported" }],
      appState: { viewBackgroundColor: "#fff" },
      files: {},
    } as unknown as Awaited<ReturnType<typeof loadFromBlob>>);

    const file = new File([], "my-board.excalidraw", {
      type: "application/json",
    });

    const result = await parseExcalidrawFileForVault(file);

    expect(result.suggestedTitle).toBe("my-board");
    expect(result.payload.elements[0]?.id).toBe("imported");
    expect(result.payload.elements).toHaveLength(1);
  });

  it("rejects empty files", async () => {
    vi.mocked(loadFromBlob).mockResolvedValue({
      elements: [],
      appState: {},
      files: {},
    } as unknown as Awaited<ReturnType<typeof loadFromBlob>>);

    const file = new File([], "empty.excalidraw", { type: "application/json" });

    await expect(parseExcalidrawFileForVault(file)).rejects.toThrow(
      "File has no drawing content.",
    );
  });
});
