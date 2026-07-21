import { createClient } from "npm:@supabase/supabase-js@2";
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";
import { z } from "npm:zod@3";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
const SITE_URL = "https://therizoproperties.com";

const RequestSchema = z.discriminatedUnion("action", [
  z.object({
    action: z.literal("request"),
    email: z.string().email(),
    property_ids: z.array(z.string().uuid()).max(200).default([]),
  }),
  z.object({ action: z.literal("load"), token: z.string().min(16).max(128) }),
  z.object({
    action: z.literal("save"),
    token: z.string().min(16).max(128),
    property_ids: z.array(z.string().uuid()).max(200),
  }),
]);

function randomToken() {
  const bytes = new Uint8Array(24);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
}

async function sendMagicEmail(email: string, token: string, count: number) {
  if (!RESEND_API_KEY) return;
  const link = `${SITE_URL}/saved?sync=${token}`;
  const html = `<!doctype html><html><body style="font-family:Georgia,serif;background:#f6f4ef;padding:32px;color:#0b1220">
    <table role="presentation" width="100%" style="max-width:560px;margin:auto;background:#fff;border:1px solid #e6dfd0;border-radius:6px;overflow:hidden">
      <tr><td style="background:#081A2F;padding:24px;color:#f6f4ef;text-align:center">
        <div style="letter-spacing:.25em;color:#c9a24a;font-size:11px">THERIZO PROPERTIES</div>
        <h1 style="margin:8px 0 0;font-size:22px;font-weight:500">Your shortlist, on any device</h1>
      </td></tr>
      <tr><td style="padding:24px">
        <p>You asked us to sync your shortlist${count ? ` of ${count} propert${count === 1 ? "y" : "ies"}` : ""}. Open this link on any device to load and continue curating:</p>
        <p style="text-align:center;margin:24px 0">
          <a href="${link}" style="background:#c9a24a;color:#081A2F;text-decoration:none;padding:12px 24px;border-radius:4px;font-weight:600;display:inline-block">Open my shortlist</a>
        </p>
        <p style="font-size:13px;color:#5a6472">Or paste this into your browser:<br><span style="word-break:break-all">${link}</span></p>
        <p style="font-size:12px;color:#8a8f99;margin-top:24px">Keep this link private — anyone with the link can edit your shortlist. If you didn't request this, ignore this email.</p>
      </td></tr>
    </table></body></html>`;

  await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${RESEND_API_KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      from: "Therizo Properties <shortlist@therizoproperties.com>",
      to: [email],
      subject: "Your Therizo shortlist — sync link",
      html,
    }),
  }).catch((e) => console.error("[shortlist-sync] resend", e));
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  try {
    const parsed = RequestSchema.safeParse(await req.json());
    if (!parsed.success) {
      return new Response(
        JSON.stringify({ error: parsed.error.flatten() }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }
    const supabase = createClient(SUPABASE_URL, SERVICE_KEY);
    const body = parsed.data;

    if (body.action === "request") {
      const email = body.email.toLowerCase().trim();
      const { data: existing } = await supabase
        .from("buyer_shortlists")
        .select("sync_token, property_ids, last_sent_at")
        .eq("email", email)
        .maybeSingle();

      // 60s rate limit on magic sends
      if (existing?.last_sent_at) {
        const diff = Date.now() - new Date(existing.last_sent_at).getTime();
        if (diff < 60_000) {
          return new Response(JSON.stringify({ ok: true, throttled: true }), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }
      }

      let token = existing?.sync_token;
      const merged = Array.from(new Set([...(existing?.property_ids ?? []), ...body.property_ids]));

      if (!token) {
        token = randomToken();
        await supabase.from("buyer_shortlists").insert({
          email,
          sync_token: token,
          property_ids: merged,
          last_sent_at: new Date().toISOString(),
        });
      } else {
        await supabase
          .from("buyer_shortlists")
          .update({ property_ids: merged, last_sent_at: new Date().toISOString() })
          .eq("email", email);
      }

      await sendMagicEmail(email, token!, merged.length);
      return new Response(JSON.stringify({ ok: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (body.action === "load") {
      const { data } = await supabase
        .from("buyer_shortlists")
        .select("property_ids, email")
        .eq("sync_token", body.token)
        .maybeSingle();
      if (!data) {
        return new Response(JSON.stringify({ error: "invalid_token" }), {
          status: 404,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      return new Response(
        JSON.stringify({ property_ids: data.property_ids, email: data.email }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    // save
    const { data: row } = await supabase
      .from("buyer_shortlists")
      .select("id")
      .eq("sync_token", body.token)
      .maybeSingle();
    if (!row) {
      return new Response(JSON.stringify({ error: "invalid_token" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    await supabase
      .from("buyer_shortlists")
      .update({ property_ids: body.property_ids })
      .eq("id", row.id);
    return new Response(JSON.stringify({ ok: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("[shortlist-sync]", e);
    return new Response(JSON.stringify({ error: "server_error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
