// Nurture email dispatcher — segment-aware, A/B subject testing.
// Tracks: diaspora | local | hnw | starter. Variant A/B assigned deterministically.
// Invoked hourly by pg_cron. Idempotent per row via `nurture_step`.
import { createClient } from "npm:@supabase/supabase-js@2";
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_ROLE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY")!;

const FROM = "Therizo Properties <hello@therizoproperties.com>";
const SITE = "https://therizoproperties.com";
const WA = "https://wa.me/2348034830087";

type Track = "diaspora" | "local" | "hnw" | "starter";
type Variant = "A" | "B";

type Row = {
  id: string;
  name: string | null;
  email: string;
  nurture_step: number;
  created_at: string;
  unsubscribe_token: string;
  client_type: string | null;
  budget: string | null;
  preferred_location: string | null;
  nurture_track: Track | null;
  nurture_variant: Variant | null;
};

const DELAYS_HOURS = [0, 48, 120, 240]; // step1 immediate, +2d, +5d, +10d
const MAX_STEP = DELAYS_HOURS.length;

function firstName(name: string | null) {
  return (name?.trim().split(/\s+/)[0] ?? "there").slice(0, 40);
}

function unsubUrl(token: string) {
  return `${SITE}/unsubscribe?token=${token}`;
}

// Deterministic hash → variant. Same lead always gets the same variant.
function pickVariant(id: string): Variant {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) | 0;
  return (h & 1) === 0 ? "A" : "B";
}

// Segment by client_type + budget signals.
function pickTrack(row: Row): Track {
  const ct = (row.client_type ?? "").toLowerCase();
  const bg = (row.budget ?? "").toLowerCase();
  const hnwBudget = /(\b|₦|n)(\s*)(500\s*m|1\s*b|billion|500m\+|>?\s*500)/i.test(bg) ||
    /luxury|ultra|premium|hnw|high\s*net/i.test(bg + " " + ct);
  if (hnwBudget) return "hnw";
  if (/diaspora|abroad|overseas|expat|foreign/.test(ct)) return "diaspora";
  const starterBudget = /(\b|₦|n)(\s*)(<\s*50|under\s*50|20\s*m|30\s*m|40\s*m|50\s*m)/i.test(bg) ||
    /first\s*time|starter|entry/.test(ct);
  if (starterBudget) return "starter";
  if (/local|nigeria|resident/.test(ct)) return "local";
  // Default: diaspora (largest audience).
  return "diaspora";
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

const cta = (href: string, label: string) =>
  `<a href="${href}" style="display:inline-block;background:#081A2F;color:#D4AF37;padding:12px 22px;text-decoration:none;font-weight:600;letter-spacing:1px;text-transform:uppercase;font-size:13px;">${label}</a>`;

// Subject lines: per (track, step, variant). A = benefit-led, B = curiosity/question-led.
const SUBJECTS: Record<Track, Record<number, Record<Variant, string>>> = {
  diaspora: {
    1: { A: "Welcome to Therizo — verified Nigerian property, no surprises",
         B: `${"{name}"}, buying Nigerian property from abroad? Read this first` },
    2: { A: "The 5 checks every diaspora buyer should demand",
         B: "How to avoid the 3 costliest diaspora property mistakes" },
    3: { A: "Real numbers: what our diaspora clients actually earn",
         B: "Ikoyi vs Katampe vs GRA — where diaspora money actually wins" },
    4: { A: "Ready when you are — a 20-minute call with a senior consultant",
         B: "One private call, three verified options, zero pressure" },
  },
  hnw: {
    1: { A: "Welcome — Therizo private client desk",
         B: "Off-market opportunities the public listings won't show you" },
    2: { A: "Discreet acquisition: how our private clients close in 30 days",
         B: "What ₦500M+ actually buys in Ikoyi, Maitama, and Old GRA today" },
    3: { A: "Private client case notes: three recent trophy transactions",
         B: "The paperwork red flags that stop 80% of trophy deals" },
    4: { A: "A confidential 30-minute session with the founder",
         B: "Ready to see the private vault?" },
  },
  local: {
    1: { A: "Welcome to Therizo — verified property, straight talk",
         B: `${"{name}"}, tired of agents wasting your time?` },
    2: { A: "The 5 title checks we run before we'll list a property",
         B: "Why most Lagos and Abuja listings fail our verification" },
    3: { A: "Real rental yields from Lagos, Abuja & PH last quarter",
         B: "Where your money actually earns 6%+ net right now" },
    4: { A: "Let's talk — 20 minutes with a senior consultant",
         B: "Your shortlist, verified and ready in one call" },
  },
  starter: {
    1: { A: "Welcome — your first Nigerian property, done properly",
         B: `${"{name}"}, first property? Start here` },
    2: { A: "First-time buyer's checklist: 5 things to demand upfront",
         B: "The mistake 9 out of 10 first-time Nigerian buyers make" },
    3: { A: "Entry-level yields: what ₦25M–₦80M actually earns",
         B: "Smallest budget, safest paperwork — our starter picks" },
    4: { A: "20 minutes with a consultant — no pressure, no upsell",
         B: "Ready to see two or three genuine starter options?" },
  },
};

function subjectFor(track: Track, step: number, variant: Variant, name: string) {
  const raw = SUBJECTS[track][step][variant];
  return raw.replace(/\{name\}/g, name);
}

function bodyFor(track: Track, step: number, row: Row): string {
  const name = firstName(row.name);
  const unsub = unsubUrl(row.unsubscribe_token);

  // Track-aware body content. Variant only affects subject line.
  const intros: Record<Track, string> = {
    diaspora: `<p>Hi ${name},</p><p>Thanks for reaching out from abroad. You now have a senior consultant assigned to your enquiry — we'll respond personally within one business day (WAT).</p>`,
    hnw: `<p>Dear ${name},</p><p>Welcome to the Therizo private client desk. Your enquiry has been routed to our founder-led team; expect a personal response within one business day.</p>`,
    local: `<p>Hi ${name},</p><p>Thanks for reaching out. A senior consultant has been assigned to your enquiry and will call or WhatsApp you within one business day.</p>`,
    starter: `<p>Hi ${name},</p><p>Welcome — first property is a big step, and we take it seriously. A consultant will personally reach out within one business day.</p>`,
  };

  if (step === 1) {
    const differentiators: Record<Track, string> = {
      diaspora: `<ul>
        <li><b>Title-verified paperwork</b> — every listing screened before you see it.</li>
        <li><b>Realistic ROI</b>, not agent inflation. See our <a href="${SITE}/calculator" style="color:#081A2F;">yield calculator</a>.</li>
        <li><b>Boutique execution from abroad</b> — you speak to the same person from viewing to keys.</li>
      </ul>`,
      hnw: `<ul>
        <li><b>Off-market inventory</b> in Ikoyi, Maitama, Banana Island, Old GRA.</li>
        <li><b>Discretion</b> — no public advertising of client transactions.</li>
        <li><b>Direct founder access</b> for acquisitions above ₦500M.</li>
      </ul>`,
      local: `<ul>
        <li><b>Verified titles only</b> — no dubious paperwork, no time-wasters.</li>
        <li><b>Straight pricing</b> — you see the same numbers we do.</li>
        <li><b>One consultant, end-to-end</b> — no hand-offs.</li>
      </ul>`,
      starter: `<ul>
        <li><b>Entry-level, safe paperwork</b> — starter doesn't mean risky.</li>
        <li><b>Payment structures</b> that fit first-time buyers.</li>
        <li><b>Honest guidance</b> — we'll tell you when to wait.</li>
      </ul>`,
    };
    return shell(
      `${intros[track]}
       <p>While you wait, here's what makes Therizo different:</p>
       ${differentiators[track]}
       <p style="margin:24px 0;">${cta(WA, "Chat on WhatsApp")}</p>
       <p style="color:#64748b;font-size:13px;">Ugo Uzoukwu &amp; team</p>`,
      unsub,
    );
  }

  if (step === 2) {
    const bodies: Record<Track, string> = {
      diaspora: `<p>Hi ${name},</p>
        <p>Most avoidable losses on Nigerian property come down to five checks:</p>
        <ol><li>Land Registry search &amp; genuine C of O / Governor's Consent</li><li>Survey plan reconciliation with coordinates</li><li>Family / community consent chain</li><li>Developer delivery history</li><li>Independent valuation vs. listed price</li></ol>
        <p>Full walkthrough in our <a href="${SITE}/diaspora-guide" style="color:#081A2F;">Diaspora Buying Guide</a>.</p>
        <p style="margin:24px 0;">${cta(`${SITE}/properties`, "See verified listings")}</p>`,
      hnw: `<p>Dear ${name},</p>
        <p>Trophy transactions rarely fail on price — they fail on paperwork and discretion. Our private-client process:</p>
        <ol><li>Off-market sourcing via a curated seller network</li><li>Independent legal due diligence, dual-firm sign-off</li><li>Escrowed payment structuring</li><li>Confidential handover</li></ol>
        <p>Typical timeline: 30–45 days from brief to keys.</p>
        <p style="margin:24px 0;">${cta(WA, "Request the private brief")}</p>`,
      local: `<p>Hi ${name},</p>
        <p>Before we list any property, we run five title checks — most listings on the market fail at least one:</p>
        <ol><li>Registry search &amp; C of O / Governor's Consent</li><li>Survey plan match</li><li>Family / community consent</li><li>Developer track record</li><li>Independent valuation</li></ol>
        <p style="margin:24px 0;">${cta(`${SITE}/properties`, "Browse verified listings")}</p>`,
      starter: `<p>Hi ${name},</p>
        <p>First-time buyers get burned on the same five checks — none of them are hard, but skipping any is expensive:</p>
        <ol><li>Registry search</li><li>Genuine C of O or Governor's Consent</li><li>Survey plan match</li><li>Developer history</li><li>Independent valuation</li></ol>
        <p>Our <a href="${SITE}/diaspora-guide" style="color:#081A2F;">buyer's guide</a> walks through each one.</p>
        <p style="margin:24px 0;">${cta(`${SITE}/properties`, "See starter listings")}</p>`,
    };
    return shell(bodies[track], unsub);
  }

  if (step === 3) {
    const bodies: Record<Track, string> = {
      diaspora: `<p>Hi ${name},</p>
        <p>Recent diaspora transactions:</p>
        <ul><li><b>Ikoyi, Lagos</b> — 4.8% net rental, 11%/yr appreciation over 3 years</li><li><b>Katampe Ext., Abuja</b> — 6.2% net, short-let overlay to 9.4%</li><li><b>GRA Phase II, PH</b> — 5.5% net, corporate tenant covenant</li></ul>
        <p style="margin:24px 0;">${cta(`${SITE}/calculator/advanced`, "Model my ROI")}</p>`,
      hnw: `<p>Dear ${name},</p>
        <p>Three anonymised private-client acquisitions in the last 12 months:</p>
        <ul><li><b>Banana Island</b> — ₦1.85B, off-market, closed in 34 days</li><li><b>Maitama</b> — ₦920M, dual-firm legal, escrowed</li><li><b>Old GRA, PH</b> — ₦640M, discreet transfer</li></ul>
        <p>All titles independently verified; all sellers vetted.</p>
        <p style="margin:24px 0;">${cta(WA, "Request the private vault")}</p>`,
      local: `<p>Hi ${name},</p>
        <p>Last quarter's verified rental yields:</p>
        <ul><li><b>Lekki Phase 1</b> — 5.1% net</li><li><b>Wuse II, Abuja</b> — 6.8% net</li><li><b>GRA Phase II, PH</b> — 5.5% net</li></ul>
        <p style="margin:24px 0;">${cta(`${SITE}/calculator/advanced`, "Model your numbers")}</p>`,
      starter: `<p>Hi ${name},</p>
        <p>Entry-level, verified picks (₦25M–₦80M) earning real returns:</p>
        <ul><li><b>Lugbe / Kuje, Abuja</b> — 7.2% gross rental</li><li><b>Sangotedo, Lagos</b> — 6.5% gross, developer track-recorded</li></ul>
        <p style="margin:24px 0;">${cta(`${SITE}/properties`, "See starter listings")}</p>`,
    };
    return shell(bodies[track], unsub);
  }

  // step 4 — consultant call intro
  const bodies: Record<Track, string> = {
    diaspora: `<p>Hi ${name},</p>
      <p>Most diaspora clients close within 60–90 days of the first call. A 20-minute private session covers:</p>
      <ul><li>Two or three verified options matched to your budget</li><li>Payment structures that protect you from abroad</li><li>Anything an agent couldn't answer honestly</li></ul>
      <p style="margin:24px 0;">${cta(WA, "Book a private call")}</p>
      <p style="color:#64748b;font-size:13px;">— Ugo Uzoukwu, Therizo Properties</p>`,
    hnw: `<p>Dear ${name},</p>
      <p>A confidential 30-minute session with the founder covers:</p>
      <ul><li>Off-market inventory matched to your brief</li><li>Structuring, discretion, and legal cover</li><li>Timeline to close</li></ul>
      <p style="margin:24px 0;">${cta(WA, "Request the founder call")}</p>
      <p style="color:#64748b;font-size:13px;">— Ugo Uzoukwu, Founder</p>`,
    local: `<p>Hi ${name},</p>
      <p>20 minutes with a senior consultant — verified shortlist, straight numbers, no filler.</p>
      <p style="margin:24px 0;">${cta(WA, "Book my call")}</p>`,
    starter: `<p>Hi ${name},</p>
      <p>20 minutes, no pressure, no upsell. Two or three verified starter options and a plan you can act on.</p>
      <p style="margin:24px 0;">${cta(WA, "Book my starter call")}</p>`,
  };
  return shell(bodies[track], unsub);
}

async function sendEmail(to: string, subject: string, html: string) {
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${RESEND_API_KEY}`,
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

  const { data: rows, error } = await admin
    .from("contact_submissions")
    .select("id,name,email,nurture_step,created_at,unsubscribe_token,client_type,budget,preferred_location,nurture_track,nurture_variant,nurture_paused")
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
  const results: Array<{ id: string; step: number; track: Track; variant: Variant; status: string; error?: string }> = [];

  for (const raw of rows ?? []) {
    if (results.length >= limit) break;
    const row = raw as Row;
    const nextStep = row.nurture_step + 1;
    const delayMs = DELAYS_HOURS[row.nurture_step] * 3_600_000;
    const readyAt = new Date(row.created_at).getTime() + delayMs;
    if (readyAt > now) continue;

    if (!/^\S+@\S+\.\S+$/.test(row.email)) {
      await admin.from("contact_submissions").update({ nurture_paused: true }).eq("id", row.id);
      results.push({ id: row.id, step: nextStep, track: "diaspora", variant: "A", status: "invalid_email_paused" });
      continue;
    }

    // Assign track + variant on first send; lock for the whole sequence.
    const track: Track = row.nurture_track ?? pickTrack(row);
    const variant: Variant = row.nurture_variant ?? pickVariant(row.id);

    const subject = subjectFor(track, nextStep, variant, firstName(row.name));
    const html = bodyFor(track, nextStep, row);

    try {
      if (!dryRun) await sendEmail(row.email, subject, html);

      const patch: Record<string, unknown> = {
        nurture_step: nextStep,
        nurture_last_sent_at: new Date().toISOString(),
      };
      if (!row.nurture_track) patch.nurture_track = track;
      if (!row.nurture_variant) patch.nurture_variant = variant;

      const { error: upErr } = await admin
        .from("contact_submissions")
        .update(patch)
        .eq("id", row.id)
        .eq("nurture_step", row.nurture_step); // optimistic guard
      if (upErr) throw upErr;

      if (!dryRun) {
        await admin.from("nurture_sends").insert({
          submission_id: row.id,
          step: nextStep,
          track,
          variant,
          subject,
        });
      }

      results.push({ id: row.id, step: nextStep, track, variant, status: dryRun ? "dry" : "sent" });
    } catch (e) {
      results.push({ id: row.id, step: nextStep, track, variant, status: "error", error: String(e).slice(0, 300) });
    }
  }

  return new Response(JSON.stringify({ processed: results.length, results }), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
});
