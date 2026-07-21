import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";

const RESEND_KEY = Deno.env.get("RESEND_API_KEY");
const FROM = Deno.env.get("ANALYTICS_FROM_EMAIL") ?? "Therizo Alerts <hello@mail.therizoproperties.com>";
const ALERT_TO = (Deno.env.get("ANALYTICS_ALERT_TO") ?? "hello@therizoproperties.com")
  .split(",").map((s) => s.trim()).filter(Boolean);

const HIGH_INTENT = new Set(["lead_submit", "exit_intent_submit", "calculator_complete"]);

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "method_not_allowed" }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    const payload = await req.json().catch(() => ({}));
    const event = String(payload?.event ?? "").slice(0, 64);
    if (!HIGH_INTENT.has(event)) {
      return new Response(JSON.stringify({ ok: true, skipped: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (!RESEND_KEY) {
      return new Response(JSON.stringify({ error: "RESEND_API_KEY not configured" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const props = payload?.properties ?? {};
    const path = String(payload?.path ?? "");
    const utm = payload?.utm ?? {};
    const propRows = Object.entries(props)
      .slice(0, 20)
      .map(([k, v]) => `<tr><td style="padding:4px 8px;color:#64748b">${k}</td><td style="padding:4px 8px;color:#0f172a">${String(v).slice(0, 200).replace(/</g, "&lt;")}</td></tr>`)
      .join("");

    const html = `<!doctype html><html><body style="font-family:-apple-system,Segoe UI,Roboto,sans-serif;background:#f8fafc;padding:24px">
      <div style="max-width:560px;margin:0 auto;background:#fff;border-radius:12px;overflow:hidden;border:1px solid #e2e8f0">
        <div style="background:#081A2F;color:#fff;padding:16px 20px">
          <div style="color:#C9A961;font-size:11px;letter-spacing:0.12em;text-transform:uppercase">High-intent event</div>
          <div style="font-size:18px;font-weight:600;margin-top:2px">${event.replace(/_/g, " ")}</div>
        </div>
        <div style="padding:16px 20px">
          <table style="width:100%;font-size:13px;border-collapse:collapse">
            <tr><td style="padding:4px 8px;color:#64748b">page</td><td style="padding:4px 8px;color:#0f172a">${path.replace(/</g, "&lt;")}</td></tr>
            ${utm?.source ? `<tr><td style="padding:4px 8px;color:#64748b">utm_source</td><td style="padding:4px 8px">${String(utm.source).replace(/</g, "&lt;")}</td></tr>` : ""}
            ${utm?.campaign ? `<tr><td style="padding:4px 8px;color:#64748b">utm_campaign</td><td style="padding:4px 8px">${String(utm.campaign).replace(/</g, "&lt;")}</td></tr>` : ""}
            ${propRows}
          </table>
          <p style="font-size:11px;color:#94a3b8;margin-top:16px">
            Dashboard: <a href="https://therizoproperties.com/dashboard/analytics" style="color:#081A2F">/dashboard/analytics</a>
          </p>
        </div>
      </div>
    </body></html>`;

    const subject = `🔔 ${event.replace(/_/g, " ")}${props?.location ? ` — ${props.location}` : ""}${props?.source ? ` (${props.source})` : ""}`;

    const resp = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${RESEND_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({ from: FROM, to: ALERT_TO, subject, html }),
    });

    if (!resp.ok) {
      const body = await resp.text();
      console.error("alert failed", resp.status, body);
      return new Response(JSON.stringify({ error: "resend_failed", status: resp.status, details: body }), {
        status: resp.status,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ ok: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error(e);
    return new Response(JSON.stringify({ error: String(e) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
