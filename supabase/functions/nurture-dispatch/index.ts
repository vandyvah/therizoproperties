// Nurture email dispatcher — sends the next scheduled email in a 4-step
// diaspora-focused sequence to leads captured in `contact_submissions`.
// Invoked hourly by pg_cron. Idempotent per row via `nurture_step`.
import { createClient } from "npm:@supabase/supabase-js@2";
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_ROLE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY")!;
const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY")!;

const FROM = "Therizo Properties <hello@therizoproperties.com>";
const SITE = "https://therizoproperties.com";
const WA = "https://wa.me/2348034830087";

type Row = {
  id: string;
  name: string | null;
  email: string;
  nurture_step: number;
  created_at: string;
  unsubscribe_token: string;
};

// Delays (hours) between steps. Step index = number already sent.
const DELAYS_HOURS = [0, 48, 120, 240]; // step1 immediate, +2d, +5d, +10d
const MAX_STEP = DELAYS_HOURS.length; // 4

function firstName(name: string | null) {
  return (name?.trim().split(/\s+/)[0] ?? "there").slice(0, 40);
}

function unsubUrl(token: string) {
  return `${SITE}/unsubscribe?token=${token}`;
}

function shell(inner: string, unsub: string) {
  return `<!doctype html><html><body style="margin:0;background:#f5f2ec;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Arial,sans-serif;color:#0f172a;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f5f2ec;padding:24px 0;">
    <tr><td align="center">
      <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border:1px solid #e6e0d4;max-width:600px;">
        <tr><td style="background:#081A2F;padding:24px 32px;">
          <div style="font-family:Georgia,serif;color:#D4AF37;font-size:22px;letter-spacing:2px;">THERIZO</div>
          <div style="color:#f5f2ec;font-size:12px;letter-spacing:3px;text-transform:uppercase;margin-top:4px;">Prime Property · The Right Amount</div>
        </td></tr>
        <tr><td style="padding:32px;line-height:1.6;font-size:15px;">${inner}</td></tr>
        <tr><td style="padding:16px 32px 28px;border-top:1px solid #e6e0d4;font-size:12px;color:#64748b;">
          Therizo Properties · Abuja · Lagos · Port Harcourt<br/>
          <a href="${SITE}" style="color:#64748b;">therizoproperties.com</a> ·
          <a href="${WA}" style="color:#64748b;">WhatsApp +234 803 483 0087</a><br/>
          <a href="${unsub}" style="color:#94a3b8;">Unsubscribe from these updates</a>
        </td></tr>
      </table>
    </td></tr>
  </table></body></html>`;
}

function template(step: number, row: Row): { subject: string; html: string } {
  const name = firstName(row.name);
  const unsub = unsubUrl(row.unsubscribe_token);
  const cta = (href: string, label: string) =>
    `<a href="${href}" style="display:inline-block;background:#081A2F;color:#D4AF37;padding:12px 22px;text-decoration:none;font-weight:600;letter-spacing:1px;text-transform:uppercase;font-size:13px;">${label}</a>`;

  if (step === 1) {
    return {
      subject: "Welcome to Therizo — verified Nigerian property, no surprises",
      html: shell(
        `<p>Hi ${name},</p>
         <p>Thanks for reaching out. You now have a senior consultant assigned to your enquiry, and we'll respond personally within one business day.</p>
         <p>While you wait, here's what makes Therizo different for diaspora buyers:</p>
         <ul>
           <li><b>Title-verified paperwork</b> — every listing screened before you see it.</li>
           <li><b>Realistic ROI</b>, not agent inflation. See our <a href="${SITE}/calculator" style="color:#081A2F;">yield calculator</a>.</li>
           <li><b>Boutique execution</b> — you speak to the same person from viewing to keys.</li>
         </ul>
         <p style="margin:24px 0;">${cta(WA, "Chat on WhatsApp")}</p>
         <p style="color:#64748b;font-size:13px;">Ugo Uzoukwu &amp; team</p>`,
        unsub,
      ),
    };
  }
  if (step === 2) {
    return {
      subject: "The 5 checks every diaspora buyer should demand",
      html: shell(
        `<p>Hi ${name},</p>
         <p>Most avoidable losses on Nigerian property come down to five checks that took us years to systemise:</p>
         <ol>
           <li>Land Registry search &amp; genuine Certificate of Occupancy / Governor's Consent</li>
           <li>Survey plan reconciliation with physical coordinates</li>
           <li>Family / community consent chain (where applicable)</li>
           <li>Developer track record &amp; delivery history</li>
           <li>Independent valuation vs. listed price</li>
         </ol>
         <p>Read the full walkthrough in our <a href="${SITE}/diaspora-guide" style="color:#081A2F;">Diaspora Buying Guide</a>, or browse <a href="${SITE}/properties" style="color:#081A2F;">verified listings</a>.</p>
         <p style="margin:24px 0;">${cta(`${SITE}/properties`, "See verified listings")}</p>`,
        unsub,
      ),
    };
  }
  if (step === 3) {
    return {
      subject: "Real numbers: what our diaspora clients actually earn",
      html: shell(
        `<p>Hi ${name},</p>
         <p>We don't publish inflated yields. Here's what recent diaspora transactions looked like:</p>
         <ul>
           <li><b>Ikoyi, Lagos</b> — 4.8% net rental yield, capital appreciation 11%/yr over 3 years</li>
           <li><b>Katampe Ext., Abuja</b> — 6.2% net rental, short-let overlay pushed to 9.4%</li>
           <li><b>GRA Phase II, Port Harcourt</b> — 5.5% net rental, corporate tenant covenant</li>
         </ul>
         <p>Model your own numbers with the <a href="${SITE}/calculator/advanced" style="color:#081A2F;">advanced ROI tool</a>.</p>
         <p style="margin:24px 0;">${cta(`${SITE}/calculator/advanced`, "Model my ROI")}</p>`,
        unsub,
      ),
    };
  }
  // step 4 — direct consultant intro
  return {
    subject: "Ready when you are — a 20-minute call with a senior consultant",
    html: shell(
      `<p>Hi ${name},</p>
       <p>Most of our diaspora clients close within 60–90 days of the first call. If you'd like, we can hold a 20-minute private session to:</p>
       <ul>
         <li>Map your budget to two or three genuinely verified options</li>
         <li>Walk through payment structures that protect you from abroad</li>
         <li>Answer anything you couldn't ask an agent</li>
       </ul>
       <p>Reply to this email or message us on WhatsApp — whichever suits.</p>
       <p style="margin:24px 0;">${cta(WA, "Book a private call")}</p>
       <p style="color:#64748b;font-size:13px;">— Ugo Uzoukwu, Therizo Properties</p>`,
      unsub,
    ),
  };
}

async function sendEmail(to: string, subject: string, html: string) {
  const res = await fetch("https://connector-gateway.lovable.dev/resend/emails", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${LOVABLE_API_KEY}`,
      "X-Connection-Api-Key": RESEND_API_KEY,
    },
    body: JSON.stringify({ from: FROM, to: [to], subject, html }),
  });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`resend ${res.status}: ${body}`);
  }
  return res.json();
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  const url = new URL(req.url);
  const dryRun = url.searchParams.get("dry") === "1";
  const limit = Math.min(Number(url.searchParams.get("limit") ?? 25), 100);

  const admin = createClient(SUPABASE_URL, SERVICE_ROLE, { auth: { persistSession: false } });

  // Pull candidates: unpaused, valid email, step < MAX_STEP, not sent in last hour.
  const { data: rows, error } = await admin
    .from("contact_submissions")
    .select("id,name,email,nurture_step,created_at,nurture_last_sent_at,unsubscribe_token,nurture_paused")
    .eq("nurture_paused", false)
    .lt("nurture_step", MAX_STEP)
    .not("email", "is", null)
    .order("created_at", { ascending: true })
    .limit(limit * 4);

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const now = Date.now();
  const results: Array<{ id: string; step: number; status: string; error?: string }> = [];

  for (const raw of rows ?? []) {
    if (results.length >= limit) break;
    const row = raw as Row & { nurture_last_sent_at: string | null };
    const nextStep = row.nurture_step + 1;
    const delayMs = DELAYS_HOURS[row.nurture_step] * 3_600_000;
    const readyAt = new Date(row.created_at).getTime() + delayMs;
    if (readyAt > now) continue;
    // Ignore malformed emails silently.
    if (!/^\S+@\S+\.\S+$/.test(row.email)) {
      await admin
        .from("contact_submissions")
        .update({ nurture_paused: true })
        .eq("id", row.id);
      results.push({ id: row.id, step: nextStep, status: "invalid_email_paused" });
      continue;
    }

    const { subject, html } = template(nextStep, row);
    try {
      if (!dryRun) await sendEmail(row.email, subject, html);
      const { error: upErr } = await admin
        .from("contact_submissions")
        .update({
          nurture_step: nextStep,
          nurture_last_sent_at: new Date().toISOString(),
        })
        .eq("id", row.id)
        .eq("nurture_step", row.nurture_step); // optimistic guard
      if (upErr) throw upErr;
      results.push({ id: row.id, step: nextStep, status: dryRun ? "dry" : "sent" });
    } catch (e) {
      results.push({ id: row.id, step: nextStep, status: "error", error: String(e).slice(0, 300) });
    }
  }

  return new Response(JSON.stringify({ processed: results.length, results }), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
});
