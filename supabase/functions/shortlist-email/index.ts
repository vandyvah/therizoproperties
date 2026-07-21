import { createClient } from "npm:@supabase/supabase-js@2";
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";
import { z } from "npm:zod@3";

const BodySchema = z.object({
  email: z.string().email(),
  name: z.string().max(120).optional(),
  property_ids: z.array(z.string().uuid()).min(1).max(50),
  note: z.string().max(1000).optional(),
  utm: z.record(z.string()).optional(),
});

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const TEAM_INBOX = Deno.env.get("ANALYTICS_ALERT_TO") ?? "hello@therizoproperties.com";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const parsed = BodySchema.safeParse(await req.json());
    if (!parsed.success) {
      return new Response(JSON.stringify({ error: parsed.error.flatten().fieldErrors }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const { email, name, property_ids, note, utm } = parsed.data;

    const supabase = createClient(SUPABASE_URL, SERVICE_KEY);
    const { data: props, error } = await supabase
      .from("properties")
      .select("id, slug, title, city, area, asking_price_ngn, property_type")
      .in("id", property_ids)
      .eq("is_listed", true);
    if (error) throw error;

    const fmtNGN = (n: number) =>
      new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN", maximumFractionDigits: 0 }).format(n ?? 0);

    const rows = (props ?? [])
      .map(
        (p: any) => `
        <tr>
          <td style="padding:12px 8px;border-bottom:1px solid #eee;">
            <a href="https://therizoproperties.com/properties/${p.slug || p.id}" style="color:#081A2F;text-decoration:none;font-weight:600;">${p.title}</a><br/>
            <span style="color:#666;font-size:13px;">${p.area ? p.area + ", " : ""}${p.city} · ${p.property_type}</span>
          </td>
          <td style="padding:12px 8px;border-bottom:1px solid #eee;text-align:right;color:#081A2F;font-weight:600;">${fmtNGN(p.asking_price_ngn)}</td>
        </tr>`,
      )
      .join("");

    const buyerHtml = `
      <div style="font-family:Georgia,serif;max-width:640px;margin:auto;color:#081A2F;">
        <h1 style="font-size:22px;">Your Therizo shortlist</h1>
        <p style="color:#334;">Hello ${name || "there"}, here's the shortlist you saved on therizoproperties.com. A consultant will reach out shortly to arrange viewings and paperwork.</p>
        <table style="width:100%;border-collapse:collapse;margin:16px 0;">${rows}</table>
        ${note ? `<p style="background:#f6f4ee;padding:12px;border-left:3px solid #C9A961;">${note}</p>` : ""}
        <p><a href="https://wa.me/2348034830087" style="background:#C9A961;color:#081A2F;padding:12px 20px;text-decoration:none;font-weight:600;">Continue on WhatsApp</a></p>
        <p style="color:#888;font-size:12px;margin-top:24px;">Therizo Properties · Abuja, Nigeria</p>
      </div>`;

    const teamHtml = `
      <div style="font-family:Arial,sans-serif;max-width:640px;color:#081A2F;">
        <h2>New shortlist from ${name || email}</h2>
        <p><strong>Email:</strong> ${email}${name ? ` · <strong>Name:</strong> ${name}` : ""}</p>
        ${utm ? `<p><strong>UTM:</strong> ${Object.entries(utm).map(([k, v]) => `${k}=${v}`).join(" · ")}</p>` : ""}
        <table style="width:100%;border-collapse:collapse;">${rows}</table>
        ${note ? `<p><strong>Note:</strong> ${note}</p>` : ""}
      </div>`;

    if (!RESEND_API_KEY) throw new Error("RESEND_API_KEY missing");

    const send = (to: string[], subject: string, html: string) =>
      fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: { Authorization: `Bearer ${RESEND_API_KEY}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          from: "Therizo Properties <hello@mail.therizoproperties.com>",
          to,
          subject,
          html,
          reply_to: "hello@therizoproperties.com",
        }),
      });

    await Promise.all([
      send([email], `Your Therizo shortlist (${(props ?? []).length} properties)`, buyerHtml),
      send([TEAM_INBOX], `New shortlist: ${name || email} (${(props ?? []).length})`, teamHtml),
    ]);

    // Track as a lead-adjacent analytics event (best-effort)
    await supabase.from("analytics_events").insert({
      event_type: "shortlist_email",
      metadata: { email, count: (props ?? []).length, property_ids, utm: utm ?? null },
    });

    return new Response(JSON.stringify({ ok: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: String((e as Error).message ?? e) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
