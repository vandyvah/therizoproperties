import { createClient } from "npm:@supabase/supabase-js@2";
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  try {
    const url = new URL(req.url);
    const token = url.searchParams.get("token")?.trim() ?? "";
    if (!/^[0-9a-f-]{36}$/i.test(token)) {
      return new Response("Invalid token", { status: 400, headers: corsHeaders });
    }
    const supabase = createClient(SUPABASE_URL, SERVICE_KEY);
    const { data: existing } = await supabase
      .from("saved_searches")
      .select("id, active")
      .eq("unsubscribe_token", token)
      .maybeSingle();
    if (!existing) return new Response("Invalid token", { status: 400, headers: corsHeaders });
    if (!existing.active) return new Response("Already unsubscribed", { status: 200, headers: corsHeaders });
    await supabase.from("saved_searches").update({ active: false }).eq("id", existing.id);
    return new Response("Unsubscribed", { status: 200, headers: corsHeaders });
  } catch (e) {
    return new Response(String((e as Error).message ?? e), { status: 500, headers: corsHeaders });
  }
});
