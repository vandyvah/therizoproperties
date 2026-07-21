// One-click unsubscribe from nurture emails. Accepts ?token=<uuid>.
// Marks the row as paused and returns a small HTML confirmation page.
import { createClient } from "npm:@supabase/supabase-js@2";
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_ROLE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

function page(title: string, body: string) {
  return `<!doctype html><html><head><meta charset="utf-8"><title>${title}</title>
<meta name="viewport" content="width=device-width,initial-scale=1"/>
<meta name="robots" content="noindex,nofollow"/></head>
<body style="margin:0;background:#f5f2ec;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Arial,sans-serif;color:#0f172a;min-height:100vh;display:flex;align-items:center;justify-content:center;padding:24px;">
<div style="max-width:520px;background:#fff;border:1px solid #e6e0d4;padding:40px;text-align:center;">
<div style="font-family:Georgia,serif;color:#D4AF37;letter-spacing:2px;font-size:20px;margin-bottom:8px;">THERIZO</div>
<h1 style="font-size:22px;margin:16px 0;color:#081A2F;">${title}</h1>
<p style="line-height:1.6;color:#334155;">${body}</p>
<p style="margin-top:24px;"><a href="https://therizoproperties.com" style="color:#081A2F;">Return to Therizo</a></p>
</div></body></html>`;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  const url = new URL(req.url);
  const token = url.searchParams.get("token")?.trim();
  const htmlHeaders = { ...corsHeaders, "Content-Type": "text/html; charset=utf-8" };

  if (!token || !/^[0-9a-f-]{36}$/i.test(token)) {
    return new Response(page("Invalid link", "This unsubscribe link is not valid."), {
      status: 400,
      headers: htmlHeaders,
    });
  }

  const admin = createClient(SUPABASE_URL, SERVICE_ROLE, { auth: { persistSession: false } });
  const { data, error } = await admin
    .from("contact_submissions")
    .update({ nurture_paused: true })
    .eq("unsubscribe_token", token)
    .select("id")
    .maybeSingle();

  if (error) {
    return new Response(page("Something went wrong", "Please email hello@therizoproperties.com and we'll remove you manually."), {
      status: 500,
      headers: htmlHeaders,
    });
  }
  if (!data) {
    return new Response(page("Already unsubscribed", "This link has already been used or is no longer active."), {
      headers: htmlHeaders,
    });
  }

  return new Response(
    page(
      "You're unsubscribed",
      "You won't receive further nurture emails from Therizo. Direct replies to your consultant are unaffected.",
    ),
    { headers: htmlHeaders },
  );
});
