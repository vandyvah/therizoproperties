/**
 * First-party analytics — privacy-respecting event tracking.
 * Writes to the `analytics_events` table via the anon key.
 * No cookies, no external network calls, no PII.
 */
import { supabase } from "@/integrations/supabase/client";
import { getCookieConsent } from "@/components/compliance/CookieConsent";

// Events that record user-initiated business actions (leads, conversions).
// These fire regardless of cookie consent because they capture the user's
// own submission, not passive browsing behaviour.
const ESSENTIAL_EVENTS = new Set([
  "lead_submit",
  "exit_intent_submit",
  "calculator_complete",
  "whatsapp_click",
  "call_click",
  "client_error",
]);

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
 * Returns the current session's UTM attribution (from URL or session cache).
 * Safe to call from any component; never throws.
 */
export function getUtm(): UtmParams & { referrer?: string } {
  const utm = captureUtm();
  const referrer =
    typeof document !== "undefined" && document.referrer
      ? document.referrer.slice(0, 300)
      : undefined;
  return { ...utm, referrer };
}

const HIGH_INTENT_EVENTS = new Set([
  "lead_submit",
  "exit_intent_submit",
  "calculator_complete",
]);

function fireAlert(eventName: string, path: string, utm: UtmParams, properties: Record<string, unknown>) {
  if (!HIGH_INTENT_EVENTS.has(eventName)) return;
  try {
    void supabase.functions.invoke("analytics-alert", {
      body: {
        event: eventName,
        path,
        utm: {
          source: utm.utm_source,
          medium: utm.utm_medium,
          campaign: utm.utm_campaign,
        },
        properties,
      },
    });
  } catch {
    /* silent */
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
    const path = window.location.pathname.slice(0, 300);
    const evt = eventName.slice(0, 80);

    // Consent gate: passive analytics only fire when the visitor accepted all
    // cookies. Essential business events (form submits, WhatsApp/call taps)
    // always fire — they record the user's own action, not tracking.
    if (!ESSENTIAL_EVENTS.has(evt)) {
      const consent = getCookieConsent();
      if (consent !== "accepted") return;
    }

    const payload = {
      event_name: evt,
      path,
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

    // Real-time founder alert on high-intent conversions.
    fireAlert(evt, path, utm, properties);
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
