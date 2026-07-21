/**
 * First-party analytics — privacy-respecting event tracking.
 * Writes to the `analytics_events` table via the anon key.
 * No cookies, no external network calls, no PII.
 */
import { supabase } from "@/integrations/supabase/client";

const SESSION_KEY = "trz_session_id";
const UTM_KEY = "trz_utm";

type UtmParams = {
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
};

function getSessionId(): string {
  if (typeof window === "undefined") return "ssr";
  try {
    let id = sessionStorage.getItem(SESSION_KEY);
    if (!id) {
      id =
        typeof crypto !== "undefined" && "randomUUID" in crypto
          ? crypto.randomUUID()
          : `s_${Date.now()}_${Math.random().toString(36).slice(2)}`;
      sessionStorage.setItem(SESSION_KEY, id);
    }
    return id;
  } catch {
    return "no-storage";
  }
}

function captureUtm(): UtmParams {
  if (typeof window === "undefined") return {};
  try {
    const params = new URLSearchParams(window.location.search);
    const fromUrl: UtmParams = {};
    (["utm_source", "utm_medium", "utm_campaign"] as const).forEach((k) => {
      const v = params.get(k);
      if (v) fromUrl[k] = v.slice(0, 120);
    });
    if (Object.keys(fromUrl).length) {
      sessionStorage.setItem(UTM_KEY, JSON.stringify(fromUrl));
      return fromUrl;
    }
    const cached = sessionStorage.getItem(UTM_KEY);
    return cached ? (JSON.parse(cached) as UtmParams) : {};
  } catch {
    return {};
  }
}

/**
 * Fire-and-forget event tracker. Never throws, never blocks the UI.
 */
export function track(
  eventName: string,
  properties: Record<string, unknown> = {},
): void {
  if (typeof window === "undefined") return;
  try {
    const utm = captureUtm();
    const payload = {
      event_name: eventName.slice(0, 80),
      path: window.location.pathname.slice(0, 300),
      referrer: (document.referrer || "").slice(0, 300) || null,
      session_id: getSessionId(),
      ...utm,
      properties: properties as never,
    };
    // Do not await — analytics must never delay user interactions.
    void supabase
      .from("analytics_events")
      .insert(payload)
      .then(() => undefined);
  } catch {
    /* swallow — analytics never breaks UX */
  }
}

/** Convenience helpers for the most-tracked events. */
export const analytics = {
  pageView: (path?: string) =>
    track("page_view", path ? { path } : {}),
  whatsappClick: (context: Record<string, unknown>) =>
    track("whatsapp_click", context),
  callClick: (context: Record<string, unknown>) =>
    track("call_click", context),
  exitIntentShown: () => track("exit_intent_shown"),
  exitIntentSubmit: (context: Record<string, unknown>) =>
    track("exit_intent_submit", context),
  calculatorComplete: (context: Record<string, unknown>) =>
    track("calculator_complete", context),
  propertyView: (context: Record<string, unknown>) =>
    track("property_view", context),
  leadSubmit: (context: Record<string, unknown>) =>
    track("lead_submit", context),
};
