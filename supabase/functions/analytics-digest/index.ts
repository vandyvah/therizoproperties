import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";
import { createClient } from "npm:@supabase/supabase-js@2";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const RESEND_KEY = Deno.env.get("RESEND_API_KEY");
const FROM = Deno.env.get("ANALYTICS_FROM_EMAIL") ?? "Therizo Analytics <hello@mail.therizoproperties.com>";
const DIGEST_TO = (Deno.env.get("ANALYTICS_DIGEST_TO") ?? "hello@therizoproperties.com")
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);

type EventRow = {
  event_name: string;
  path: string | null;
  referrer: string | null;
  utm_source: string | null;
  session_id: string | null;
  properties: any;
  created_at: string;
};

function fmt(n: number) {
  return n.toLocaleString("en-US");
}
function pct(a: number, b: number) {
  return b ? ((a / b) * 100).toFixed(1) + "%" : "0.0%";
}
function topN<T extends string>(map: Map<T, number>, n = 8) {
  return Array.from(map.entries()).sort((a, b) => b[1] - a[1]).slice(0, n);
}

function buildHtml(rows: EventRow[], sinceIso: string) {
  const sessions = new Set<string>();
  const paths = new Map<string, number>();
  const utms = new Map<string, number>();
  let pv = 0, wa = 0, call = 0, calc = 0, leads = 0, propView = 0, exitShown = 0, exitSub = 0;

  for (const r of rows) {
    if (r.session_id) sessions.add(r.session_id);
    if (r.event_name === "page_view") {
      pv++;
      if (r.path) paths.set(r.path, (paths.get(r.path) || 0) + 1);
    }
    if (r.event_name === "whatsapp_click") wa++;
    if (r.event_name === "call_click") call++;
    if (r.event_name === "calculator_complete") calc++;
    if (r.event_name === "lead_submit") leads++;
    if (r.event_name === "property_view") propView++;
    if (r.event_name === "exit_intent_shown") exitShown++;
    if (r.event_name === "exit_intent_submit") exitSub++;
    const u = r.utm_source || "(direct)";
    utms.set(u, (utms.get(u) || 0) + 1);
  }

  const topPages = topN(paths, 10);
  const topUtms = topN(utms, 6);

  const row = (label: string, v: number, base?: number) => `
    <tr>
      <td style="padding:8px 12px;border-bottom:1px solid #eee;color:#334155">${label}</td>
      <td style="padding:8px 12px;border-bottom:1px solid #eee;text-align:right;font-weight:600;color:#081A2F">
        ${fmt(v)}${base !== undefined ? ` <span style="color:#94a3b8;font-weight:400">(${pct(v, base)})</span>` : ""}
      </td>
    </tr>`;

  const list = (title: string, entries: [string, number][]) => `
    <h3 style="font-size:14px;color:#081A2F;margin:24px 0 8px">${title}</h3>
    <table style="width:100%;border-collapse:collapse;font-size:13px">
      ${entries.length ? entries.map(([k, v]) => `
        <tr>
          <td style="padding:6px 12px;border-bottom:1px solid #f1f5f9;color:#475569">${k.replace(/</g, "&lt;")}</td>
          <td style="padding:6px 12px;border-bottom:1px solid #f1f5f9;text-align:right;color:#081A2F;font-weight:600">${fmt(v)}</td>
        </tr>`).join("") : `<tr><td style="padding:6px 12px;color:#94a3b8">No data</td></tr>`}
    </table>`;

  const since = new Date(sinceIso).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
  const until = new Date().toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });

  return `<!doctype html><html><body style="margin:0;padding:24px;background:#f8fafc;font-family:-apple-system,Segoe UI,Roboto,sans-serif;color:#0f172a">
    <div style="max-width:640px;margin:0 auto;background:#fff;border-radius:12px;overflow:hidden;border:1px solid #e2e8f0">
      <div style="background:#081A2F;color:#fff;padding:20px 24px">
        <div style="color:#C9A961;font-size:12px;letter-spacing:0.12em;text-transform:uppercase">Therizo Properties</div>
        <div style="font-size:20px;font-weight:600;margin-top:4px">Weekly Analytics Digest</div>
        <div style="font-size:12px;color:#cbd5e1;margin-top:4px">${since} → ${until}</div>
      </div>
      <div style="padding:24px">
        <h3 style="font-size:14px;color:#081A2F;margin:0 0 8px">Conversion funnel</h3>
        <table style="width:100%;border-collapse:collapse;font-size:13px;border:1px solid #eee;border-radius:8px;overflow:hidden">
          ${row("Sessions", sessions.size)}
          ${row("Page views", pv)}
          ${row("Property views", propView, pv)}
          ${row("Calculator complete", calc, pv)}
          ${row("WhatsApp clicks", wa, pv)}
          ${row("Call clicks", call, pv)}
          ${row("Lead submissions", leads, pv)}
          ${row("Exit-intent shown → submitted", exitSub)}
        </table>
        ${list("Top pages", topPages)}
        ${list("Traffic source (UTM)", topUtms)}
        <p style="font-size:11px;color:#94a3b8;margin-top:24px;line-height:1.5">
          First-party analytics from analytics_events. No cookies, no third-party trackers. 
          Full dashboard: <a href="https://therizoproperties.com/dashboard/analytics" style="color:#081A2F">therizoproperties.com/dashboard/analytics</a>
        </p>
      </div>
    </div>
  </body></html>`;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const url = new URL(req.url);
    const days = Math.min(90, Math.max(1, Number(url.searchParams.get("days") ?? 7)));
    const since = new Date(Date.now() - days * 86400 * 1000).toISOString();
    const preview = url.searchParams.get("preview") === "1";

    const supabase = createClient(SUPABASE_URL, SERVICE_KEY);
    const { data, error } = await supabase
      .from("analytics_events")
      .select("event_name, path, referrer, utm_source, session_id, properties, created_at")
      .gte("created_at", since)
      .order("created_at", { ascending: false })
      .limit(50000);

    if (error) throw error;
    const html = buildHtml((data as EventRow[]) ?? [], since);

    if (preview) {
      return new Response(html, { headers: { ...corsHeaders, "Content-Type": "text/html" } });
    }

    if (!RESEND_KEY) {
      return new Response(JSON.stringify({ error: "RESEND_API_KEY not configured" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const subject = `Therizo weekly digest — ${(data ?? []).length.toLocaleString()} events (${days}d)`;
    const resp = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${RESEND_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ from: FROM, to: DIGEST_TO, subject, html }),
    });

    const body = await resp.text();
    if (!resp.ok) {
      console.error("Resend failed", resp.status, body);
      return new Response(JSON.stringify({ error: "resend_failed", status: resp.status, details: body }), {
        status: resp.status,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ ok: true, sent_to: DIGEST_TO, events: (data ?? []).length }), {
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
