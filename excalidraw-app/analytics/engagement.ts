import { trackEvent } from "@excalidraw/excalidraw/analytics";

const CANVAS_USED_KEY = "diagrams-free-canvas-used";
const MEANINGFUL_SESSION_KEY = "diagrams-free-meaningful-session";
const SESSION_START_KEY = "diagrams-free-session-start";

/** Rule A: canvas_used + ≥30s since session start (see docs/ga4-analytics-plan.md). */
const MEANINGFUL_SESSION_MS = 30_000;

let meaningfulSessionTimer: ReturnType<typeof setTimeout> | undefined;

export type NewCanvasAnalyticsSource =
  | "menu"
  | "command_palette"
  | "clear_canvas_dialog"
  | "vault_dialog";

const trackEngagement = (action: string, label?: string) => {
  trackEvent("engagement", action, label);
};

const readSessionStartMs = (): number => {
  try {
    const raw = sessionStorage.getItem(SESSION_START_KEY);
    if (raw) {
      const parsed = Number(raw);
      if (!Number.isNaN(parsed)) {
        return parsed;
      }
    }
    const now = Date.now();
    sessionStorage.setItem(SESSION_START_KEY, String(now));
    return now;
  } catch {
    return Date.now();
  }
};

const scheduleMeaningfulSessionCheck = () => {
  try {
    if (sessionStorage.getItem(MEANINGFUL_SESSION_KEY)) {
      return;
    }
    if (!sessionStorage.getItem(CANVAS_USED_KEY)) {
      return;
    }
  } catch {
    return;
  }

  if (meaningfulSessionTimer) {
    clearTimeout(meaningfulSessionTimer);
  }

  const sessionStart = readSessionStartMs();
  const remaining = MEANINGFUL_SESSION_MS - (Date.now() - sessionStart);

  const fireMeaningfulSession = () => {
    try {
      if (sessionStorage.getItem(MEANINGFUL_SESSION_KEY)) {
        return;
      }
      if (!sessionStorage.getItem(CANVAS_USED_KEY)) {
        return;
      }
      sessionStorage.setItem(MEANINGFUL_SESSION_KEY, "1");
    } catch {
      return;
    }
    trackEngagement("meaningful_session", "A");
  };

  if (remaining <= 0) {
    fireMeaningfulSession();
  } else {
    meaningfulSessionTimer = setTimeout(fireMeaningfulSession, remaining);
  }
};

/** Call once when the app shell mounts (production analytics). */
export const initSessionEngagementTracking = () => {
  readSessionStartMs();
};

/** First real canvas use in this browser tab session. */
export const trackCanvasUsedOnce = (source: string) => {
  try {
    if (sessionStorage.getItem(CANVAS_USED_KEY)) {
      return;
    }
    sessionStorage.setItem(CANVAS_USED_KEY, "1");
  } catch {
    return;
  }

  trackEngagement("canvas_used", source);
  scheduleMeaningfulSessionCheck();
};

/** User archived a non-empty scene and started a new canvas. */
export const trackNewCanvas = (
  source: NewCanvasAnalyticsSource,
  hadContent: boolean,
) => {
  if (!hadContent) {
    return;
  }
  trackEngagement("new_canvas", source);
};

export const trackDonateModalOpen = (source: string) => {
  trackEngagement("donate_modal_open", source);
};

export const trackDonateCheckout = (
  kind: "once" | "monthly",
  tier: string,
) => {
  trackEngagement("donate_checkout", `${kind}_${tier}`);
};
