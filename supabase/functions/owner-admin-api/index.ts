import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-admin-password, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const adminPassword = req.headers.get("x-admin-password");
  const expectedPassword = Deno.env.get("OWNER_ADMIN_PASSWORD");

  if (!adminPassword || adminPassword !== expectedPassword) {
    return new Response(
      JSON.stringify({ error: "Unauthorized" }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 401 }
    );
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const supabase = createClient(supabaseUrl, supabaseKey);

  const url = new URL(req.url);

  try {
    if (req.method === "GET") {
      const format = url.searchParams.get("format");

      const { data, error } = await supabase
        .from("property_submissions")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;

      if (format === "csv") {
        const headers = [
          "id", "created_at", "owner_name", "phone", "email", "city", "area",
          "property_type", "bedrooms", "plot_size", "asking_price", "currency",
          "title_status", "is_tenanted", "can_inspect_this_week", "notes",
          "status", "admin_notes",
        ];
        const csv = [
          headers.join(","),
          ...(data || []).map((row: Record<string, unknown>) =>
            headers
              .map((h) => `"${String(row[h] ?? "").replace(/"/g, '""')}"`)
              .join(",")
          ),
        ].join("\n");

        return new Response(csv, {
          headers: {
            ...corsHeaders,
            "Content-Type": "text/csv",
            "Content-Disposition": "attachment; filename=property_submissions.csv",
          },
        });
      }

      return new Response(JSON.stringify(data), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (req.method === "PATCH") {
      const { id, status, admin_notes } = await req.json();
      const updates: Record<string, unknown> = {};
      if (status !== undefined) updates.status = status;
      if (admin_notes !== undefined) updates.admin_notes = admin_notes;

      const { data, error } = await supabase
        .from("property_submissions")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;

      return new Response(JSON.stringify(data), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 405,
    });
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Server error" }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
});
