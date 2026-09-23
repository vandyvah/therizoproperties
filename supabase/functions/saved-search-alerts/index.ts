import { createClient } from "npm:@supabase/supabase-js@2";
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";

// Scheduled function: sends alerts to saved_searches subscribers when new
// matching properties have been listed since the last dispatch.

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

type Filters = {
  city?: string;
  property_type?: string;
  min_price?: number;
  max_price?: number;
  risk_rating?: string;
};

function matchQuery(client: any, filters: Filters, since: string) {
  let q = client
    .from("properties")
    .select("id, slug, title, city, area, asking_price_ngn, property_type, created_at")
    .eq("is_listed", true)
    .gte("created_at", since)
    .order("created_at", { ascending: false })
    .limit(20);
  if (filters.city) q = q.ilike("city", `%${filters.city}%`);
  if (filters.property_type) q = q.eq("property_type", filters.property_type);
  if (typeof filters.min_price === "number") q = q.gte("asking_price_ngn", filters.min_price);
  if (typeof filters.max_price === "number") q = q.lte("asking_price_ngn", filters.max_price);
  if (filters.risk_rating) q = q.eq("risk_rating", filters.risk_rating);
  return q;
}

function jwtRole(req: Request): string | null {
  const token = req.headers.get("Authorization")?.replace(/^Bearer\s+/i, "") ?? "";
  try {
    const b64 = token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/");
    return JSON.parse(atob(b64)).role ?? null;
  } catch {
    return null;
  }
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  // Scheduler-only. The gateway (verify_jwt) has already checked the signature;
  // require the service role so the public anon key cannot trigger sends.
  if (jwtRole(req) !== "service_role") {
    return new Response("Unauthorized", { status: 401, headers: corsHeaders });
  }

  try {
    const supabase = createClient(SUPABASE_URL, SERVICE_KEY);
    const url = new URL(req.url);
    const freq = url.searchParams.get("frequency"); // optional filter

    let q = supabase.from("saved_searches").select("*").eq("active", true);
    if (freq) q = q.eq("frequency", freq);
    const { data: searches, error } = await q;
    if (error) throw error;

    const fmtNGN = (n: number) =>
      new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN", maximumFractionDigits: 0 }).format(n ?? 0);

    let sent = 0;

    for (const s of searches ?? []) {
      const windowStart =
        s.last_sent_at ??
        new Date(Date.now() - (s.frequency === "daily" ? 1 : 7) * 24 * 60 * 60 * 1000).toISOString();
      const { data: matches } = await matchQuery(supabase, (s.filters as Filters) ?? {}, windowStart);
      if (!matches || matches.length === 0) continue;

      const rows = matches
        .map(
          (p: any) => `
          <tr>
            <td style="padding:10px 8px;border-bottom:1px solid #eee;">
              <a href="https://therizoproperties.com/properties/${p.slug || p.id}" style="color:#081A2F;font-weight:600;text-decoration:none;">${p.title}</a><br/>
              <span style="color:#666;font-size:13px;">${p.area ? p.area + ", " : ""}${p.city} · ${p.property_type}</span>
            </td>
            <td style="padding:10px 8px;border-bottom:1px solid #eee;text-align:right;color:#081A2F;font-weight:600;">${fmtNGN(p.asking_price_ngn)}</td>
          </tr>`,
        )
        .join("");

      const unsubUrl = `https://therizoproperties.com/unsubscribe?token=${s.unsubscribe_token}&type=saved_search`;
      const html = `
        <div style="font-family:Georgia,serif;max-width:640px;margin:auto;color:#081A2F;">
          <h1 style="font-size:22px;">${matches.length} new match${matches.length === 1 ? "" : "es"} for your saved search</h1>
          <p style="color:#334;">Fresh Therizo-verified listings that match ${s.name || "your criteria"}.</p>
          <table style="width:100%;border-collapse:collapse;margin:16px 0;">${rows}</table>
          <p><a href="https://therizoproperties.com/properties" style="background:#C9A961;color:#081A2F;padding:12px 20px;text-decoration:none;font-weight:600;">Browse all listings</a></p>
          <p style="color:#888;font-size:12px;margin-top:24px;">You are receiving this because you subscribed to saved-search alerts on therizoproperties.com. <a href="${unsubUrl}" style="color:#888;">Unsubscribe</a>.</p>
        </div>`;

      if (RESEND_API_KEY) {
        await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: { Authorization: `Bearer ${RESEND_API_KEY}`, "Content-Type": "application/json" },
          body: JSON.stringify({
            from: "Therizo Properties <hello@mail.therizoproperties.com>",
            to: [s.email],
            subject: `New Therizo listings matching your saved search`,
            html,
            reply_to: "hello@therizoproperties.com",
          }),
        });
        sent++;
      }

      await supabase.from("saved_searches").update({ last_sent_at: new Date().toISOString() }).eq("id", s.id);
    }

    return new Response(JSON.stringify({ ok: true, sent }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: String((e as Error).message ?? e) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
