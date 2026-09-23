// Edge function: roi-lead-email
// Sends an automatic ROI summary email to the lead after they unlock the calculator.
// Hardened: HTML-escapes user-supplied content and validates submissionId against the
// database before sending, preventing spam relay and HTML injection.

import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const FROM_EMAIL = Deno.env.get("ROI_FROM_EMAIL") ?? "Therizo Properties <hello@mail.therizoproperties.com>";
const BCC = Deno.env.get("ROI_BCC_EMAIL") ?? "hello@therizoproperties.com";
const REPLY_TO = Deno.env.get("ROI_REPLY_TO") ?? "hello@therizoproperties.com";

const fmt = (n: number) =>
  new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN", maximumFractionDigits: 0 }).format(n);

const escapeHtml = (input: unknown): string => {
  const s = input == null ? "" : String(input);
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
};

const safeNum = (n: unknown, fallback = 0): number => {
  const v = typeof n === "number" ? n : Number(n);
  return Number.isFinite(v) ? v : fallback;
};

function buildHtml(payload: any) {
  const name = escapeHtml(payload.name);
  const strategy = escapeHtml(payload.strategy);
  const location = escapeHtml(payload.location);
  const budget = escapeHtml(payload.budget);
  const first = (typeof payload.name === "string" ? payload.name : "Investor").split(" ")[0];
  const safeFirst = escapeHtml(first || "Investor");
  const r = payload.results || {};
  const investment = safeNum(r.investment);
  const net = safeNum(r.net);
  const roi = safeNum(r.roi);
  const payback = safeNum(r.payback);
  const tenYr = safeNum(r.tenYr);
  return `<!doctype html>
<html><body style="margin:0;padding:0;background:#f4ede1;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;color:#1a1a1a;">
  <div style="max-width:600px;margin:0 auto;background:#ffffff;">
    <div style="background:#081A2F;padding:32px 28px;color:#ffffff;">
      <div style="color:#C9A84C;font-size:11px;letter-spacing:2px;font-weight:700;">THERIZO PROPERTIES</div>
      <h1 style="margin:10px 0 0;font-size:24px;font-weight:600;color:#ffffff;">Your ROI Report, ${safeFirst}.</h1>
      <p style="margin:8px 0 0;color:#cfd8e3;font-size:14px;">Prime property for the right amount.</p>
    </div>
    <div style="padding:28px;">
      <p style="font-size:15px;line-height:1.6;color:#333;">Thanks for using the Therizo ROI calculator. Here's a snapshot of your scenario:</p>
      <table style="width:100%;border-collapse:collapse;margin:18px 0;font-size:14px;">
        <tr><td style="padding:8px 0;color:#666;">Strategy</td><td style="padding:8px 0;text-align:right;font-weight:600;">${strategy || "—"}</td></tr>
        <tr><td style="padding:8px 0;color:#666;">Location</td><td style="padding:8px 0;text-align:right;font-weight:600;">${location || "—"}</td></tr>
        <tr><td style="padding:8px 0;color:#666;">Budget</td><td style="padding:8px 0;text-align:right;font-weight:600;">${budget || "—"}</td></tr>
        <tr><td style="padding:8px 0;color:#666;">Total Investment</td><td style="padding:8px 0;text-align:right;font-weight:600;">${fmt(investment)}</td></tr>
        <tr><td style="padding:8px 0;color:#666;">Net Annual Income</td><td style="padding:8px 0;text-align:right;font-weight:600;color:#081A2F;">${fmt(net)}</td></tr>
        <tr><td style="padding:8px 0;color:#666;">Annual ROI</td><td style="padding:8px 0;text-align:right;font-weight:700;color:#C9A84C;">${roi.toFixed(1)}%</td></tr>
        <tr><td style="padding:8px 0;color:#666;">Payback</td><td style="padding:8px 0;text-align:right;font-weight:600;">${payback.toFixed(1)} years</td></tr>
        <tr><td style="padding:8px 0;color:#666;">10-Year Wealth Est.</td><td style="padding:8px 0;text-align:right;font-weight:600;">${fmt(tenYr)}</td></tr>
      </table>
      <a href="https://therizoproperties.com/calculator" style="display:inline-block;background:#C9A84C;color:#081A2F;text-decoration:none;padding:14px 24px;border-radius:6px;font-weight:700;margin:10px 0;">Open My Calculator Again →</a>
      <p style="font-size:13px;color:#666;line-height:1.6;margin-top:20px;">A senior consultant will reach out within 12 business hours with 3–5 hand-matched verified properties for your budget. Reply to this email any time.</p>
      <p style="font-size:13px;color:#666;line-height:1.6;">WhatsApp: <a href="https://wa.me/2348034830087" style="color:#081A2F;">+234 803 483 0087</a></p>
    </div>
    <div style="background:#081A2F;padding:18px 28px;color:#7a8c9e;font-size:11px;text-align:center;">
      Therizo Properties · therizoproperties.com · Confidential to recipient
    </div>
  </div>
</body></html>`;
}

const isEmail = (v: unknown): v is string =>
  typeof v === "string" && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) && v.length <= 254;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const payload = await req.json();
    if (!isEmail(payload?.email) || !payload?.results || !payload?.submissionId) {
      return new Response(JSON.stringify({ ok: false, error: "missing or invalid fields" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Validate the submission exists in roi_calculations and the email matches.
    const supaUrl = Deno.env.get("SUPABASE_URL");
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    if (!supaUrl || !serviceKey) {
      console.error("[roi-lead-email] missing supabase env");
      return new Response(JSON.stringify({ ok: false, error: "server misconfigured" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const admin = createClient(supaUrl, serviceKey);
    const { data: row, error: rowErr } = await admin
      .from("roi_calculations")
      .select("id, lead_email")
      .eq("id", payload.submissionId)
      .maybeSingle();

    if (rowErr || !row) {
      console.warn("[roi-lead-email] submission not found", payload.submissionId, rowErr);
      return new Response(JSON.stringify({ ok: false, error: "invalid submission" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (
      typeof row.lead_email !== "string" ||
      row.lead_email.toLowerCase() !== payload.email.toLowerCase()
    ) {
      console.warn("[roi-lead-email] email mismatch", { stored: row.lead_email });
      return new Response(JSON.stringify({ ok: false, error: "email mismatch" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const resendKey = Deno.env.get("RESEND_API_KEY");
    if (!resendKey) {
      console.log("[roi-lead-email] RESEND_API_KEY not set; skipping send");
      return new Response(JSON.stringify({ ok: true, skipped: "no_api_key" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const html = buildHtml(payload);
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${resendKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: FROM_EMAIL,
        to: [payload.email],
        bcc: BCC ? [BCC] : undefined,
        reply_to: REPLY_TO,
        subject: `Your Therizo ROI report — ${safeNum(payload.results.roi).toFixed(1)}% projected return`,
        html,
      }),
    });

    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      console.error("[roi-lead-email] gateway error", res.status, data);
      return new Response(JSON.stringify({ ok: false, error: data }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    console.log("[roi-lead-email] sent", { to: payload.email, id: data.id });
    return new Response(JSON.stringify({ ok: true, id: data.id }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("[roi-lead-email] fatal", err);
    return new Response(JSON.stringify({ ok: false, error: String(err) }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
