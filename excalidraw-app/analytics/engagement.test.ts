import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { trackEvent } from "@excalidraw/excalidraw/analytics";

import {
  initSessionEngagementTracking,
  trackCanvasUsedOnce,
  trackNewCanvas,
} from "./engagement";

vi.mock("@excalidraw/excalidraw/analytics", () => ({
  trackEvent: vi.fn(),
}));

describe("engagement analytics", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    sessionStorage.clear();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("tracks canvas_used only once per session", () => {
    trackCanvasUsedOnce("pointer");
    trackCanvasUsedOnce("pointer");

    expect(trackEvent).toHaveBeenCalledTimes(1);
    expect(trackEvent).toHaveBeenCalledWith(
      "engagement",
      "canvas_used",
      "pointer",
    );
  });

  it("fires meaningful_session after 30s when canvas was used", () => {
    initSessionEngagementTracking();
    trackCanvasUsedOnce("pointer");

    vi.advanceTimersByTime(30_000);

    expect(trackEvent).toHaveBeenCalledWith(
      "engagement",
      "meaningful_session",
      "A",
    );
  });

  it("tracks new_canvas only when scene had content", () => {
    trackNewCanvas("menu", false);
    trackNewCanvas("menu", true);

    expect(trackEvent).toHaveBeenCalledTimes(1);
    expect(trackEvent).toHaveBeenCalledWith(
      "engagement",
      "new_canvas",
      "menu",
    );
  });
});
