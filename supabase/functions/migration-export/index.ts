import { createClient } from "npm:@supabase/supabase-js@2";
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";

const TABLES = [
  "activity_log", "activity_signals", "admin_notifications", "analytics_events",
  "announcements", "audit_log", "blog_clusters", "blog_internal_links",
  "blog_post_images", "blog_posts", "buyer_shortlists", "clients",
  "contact_submissions", "deal_consultant_shares", "deals", "due_diligence_checks",
  "fraud_reports", "leads", "material_request_items", "material_requests",
  "nurture_sends", "profiles", "properties", "property_documents", "property_media",
  "property_submissions", "roi_calculations", "saved_searches", "testimonials",
  "user_roles", "viewings",
];

const BUCKETS = ["property-media", "blog-images", "boq-files"];
const PAGE = 1000;
const SIGNED_URL_TTL = 60 * 60 * 24 * 7;

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  const expected = Deno.env.get("MIGRATION_EXPORT_KEY");
  const provided = req.headers.get("x-export-key");
  if (!expected || !provided || provided !== expected) {
    return json({ error: "Unauthorized" }, 401);
  }

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    { auth: { persistSession: false } },
  );

  const errors: Record<string, string> = {};

  // ---- tables ----
  const tables: Record<string, unknown[]> = {};
  for (const table of TABLES) {
    const rows: unknown[] = [];
    let from = 0;
    while (true) {
      const { data, error } = await supabase
        .from(table)
        .select("*")
        .range(from, from + PAGE - 1);
      if (error) {
        errors[`table:${table}`] = error.message;
        break;
      }
      rows.push(...(data ?? []));
      if (!data || data.length < PAGE) break;
      from += PAGE;
    }
    tables[table] = rows;
  }

  // ---- auth users ----
  const auth_users: unknown[] = [];
  for (let page = 1; ; page++) {
    const { data, error } = await supabase.auth.admin.listUsers({ page, perPage: PAGE });
    if (error) {
      errors["auth_users"] = error.message;
      break;
    }
    const users = data?.users ?? [];
    auth_users.push(
      ...users.map((u) => ({
        id: u.id,
        email: u.email,
        phone: u.phone,
        created_at: u.created_at,
        email_confirmed_at: u.email_confirmed_at,
        user_metadata: u.user_metadata,
        app_metadata: u.app_metadata,
      })),
    );
    if (users.length < PAGE) break;
  }

  // ---- storage ----
  const storage: Record<string, unknown[]> = {};
  for (const bucket of BUCKETS) {
    const paths: string[] = [];
    const walk = async (prefix: string) => {
      let offset = 0;
      while (true) {
        const { data, error } = await supabase.storage
          .from(bucket)
          .list(prefix, { limit: PAGE, offset });
        if (error) {
          errors[`storage:${bucket}:${prefix}`] = error.message;
          return;
        }
        const items = data ?? [];
        for (const item of items) {
          const full = prefix ? `${prefix}/${item.name}` : item.name;
          if (item.id === null) await walk(full);
          else paths.push(full);
        }
        if (items.length < PAGE) break;
        offset += PAGE;
      }
    };
    await walk("");

    const objects: unknown[] = [];
    for (let i = 0; i < paths.length; i += 100) {
      const chunk = paths.slice(i, i + 100);
      const { data, error } = await supabase.storage
        .from(bucket)
        .createSignedUrls(chunk, SIGNED_URL_TTL);
      if (error) {
        errors[`storage:${bucket}:sign`] = error.message;
        objects.push(...chunk.map((path) => ({ path, signedUrl: null })));
        continue;
      }
      objects.push(
        ...(data ?? []).map((d) => ({ path: d.path, signedUrl: d.signedUrl, error: d.error })),
      );
    }
    storage[bucket] = objects;
  }

  return json({
    exported_at: new Date().toISOString(),
    signed_url_expires_in_seconds: SIGNED_URL_TTL,
    tables,
    auth_users,
    storage,
    errors: Object.keys(errors).length ? errors : undefined,
  });
});
