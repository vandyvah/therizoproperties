import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Content-Type": "application/xml",
};

const SITE_URL = "https://therizoproperties.com";

// Static pages with their priorities and change frequencies
const staticPages = [
  { path: "/", priority: "1.0", changefreq: "weekly" },
  { path: "/properties", priority: "0.9", changefreq: "weekly" },
  { path: "/blog", priority: "0.8", changefreq: "weekly" },
  { path: "/calculator", priority: "0.8", changefreq: "monthly" },
  { path: "/our-standard", priority: "0.8", changefreq: "monthly" },
  { path: "/team", priority: "0.7", changefreq: "monthly" },
  { path: "/contact", priority: "0.8", changefreq: "monthly" },
  { path: "/vault", priority: "0.7", changefreq: "weekly" },
  { path: "/materials-supply", priority: "0.8", changefreq: "monthly" },
  { path: "/guides/title-verification", priority: "0.8", changefreq: "monthly" },
  { path: "/guides/buyer-guide", priority: "0.8", changefreq: "monthly" },
  { path: "/guides/roi-methodology", priority: "0.7", changefreq: "monthly" },
  { path: "/press", priority: "0.6", changefreq: "monthly" },
  { path: "/locations/lagos", priority: "0.9", changefreq: "monthly" },
  { path: "/locations/abuja", priority: "0.9", changefreq: "monthly" },
  { path: "/locations/port-harcourt", priority: "0.9", changefreq: "monthly" },
  { path: "/submit-property", priority: "0.7", changefreq: "monthly" },
  { path: "/abuja-starter-kit", priority: "0.9", changefreq: "monthly" },
];

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const today = new Date().toISOString().split("T")[0];

    // Build static pages XML
    let urlsXml = staticPages
      .map(
        (page) => `  <url>
    <loc>${SITE_URL}${page.path}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>`
      )
      .join("\n");

    // Fetch listed properties from database
    const { data: properties, error } = await supabase
      .from("properties")
      .select("id, updated_at, title")
      .eq("status", "listed")
      .order("updated_at", { ascending: false });

    if (!error && properties && properties.length > 0) {
      const propertyUrls = properties
        .map((property) => {
          const lastmod = property.updated_at
            ? new Date(property.updated_at).toISOString().split("T")[0]
            : today;
          return `  <url>
    <loc>${SITE_URL}/properties/${property.id}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`;
        })
        .join("\n");

      urlsXml += "\n" + propertyUrls;
    }

    // Fetch published blog posts
    const { data: blogPosts, error: blogError } = await supabase
      .from("blog_posts")
      .select("slug, updated_at")
      .eq("status", "published")
      .order("updated_at", { ascending: false });

    if (!blogError && blogPosts && blogPosts.length > 0) {
      const blogUrls = blogPosts
        .map((post) => {
          const lastmod = post.updated_at
            ? new Date(post.updated_at).toISOString().split("T")[0]
            : today;
          return `  <url>
    <loc>${SITE_URL}/blog/${post.slug}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>`;
        })
        .join("\n");

      urlsXml += "\n" + blogUrls;
    }

    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
        xsi:schemaLocation="http://www.sitemaps.org/schemas/sitemap/0.9
        http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd">
${urlsXml}
</urlset>`;

    return new Response(sitemap, {
      headers: corsHeaders,
      status: 200,
    });
  } catch (error) {
    console.error("Sitemap generation error:", error);
    return new Response("Error generating sitemap", {
      status: 500,
      headers: { "Content-Type": "text/plain" },
    });
  }
});
