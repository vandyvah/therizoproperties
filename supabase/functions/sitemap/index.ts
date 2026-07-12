import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Content-Type": "application/xml; charset=utf-8",
  "Cache-Control": "public, max-age=3600",
};

const SITE_URL = "https://therizoproperties.com";

// Static pages with their priorities and change frequencies
const staticPages = [
  { path: "/", priority: "1.0", changefreq: "weekly" },
  { path: "/properties", priority: "0.9", changefreq: "weekly" },
  { path: "/blog", priority: "0.8", changefreq: "weekly" },
  { path: "/calculator", priority: "0.8", changefreq: "monthly" },
  { path: "/calculator/advanced", priority: "0.7", changefreq: "monthly" },
  { path: "/our-standard", priority: "0.8", changefreq: "monthly" },
  { path: "/team", priority: "0.7", changefreq: "monthly" },
  { path: "/contact", priority: "0.8", changefreq: "monthly" },
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

function xmlEscape(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

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

    // Fetch published properties (slug-based routing)
    const { data: properties, error } = await supabase
      .from("properties")
      .select("id, slug, updated_at, title")
      .eq("status", "published")
      .not("slug", "is", null)
      .order("updated_at", { ascending: false });

    // Fetch all image media for those properties in one query
    let mediaByProperty: Record<string, { url: string; title: string }[]> = {};
    if (!error && properties && properties.length > 0) {
      const propIds = properties.map((p: any) => p.id);
      const { data: media } = await supabase
        .from("property_media")
        .select("property_id, file_url, file_name, file_type, sort_order")
        .in("property_id", propIds)
        .eq("file_type", "image")
        .order("sort_order", { ascending: true });

      if (media) {
        for (const m of media as any[]) {
          if (!mediaByProperty[m.property_id]) mediaByProperty[m.property_id] = [];
          mediaByProperty[m.property_id].push({
            url: m.file_url,
            title: m.file_name || "",
          });
        }
      }

      const propertyUrls = properties
        .map((property: any) => {
          const lastmod = property.updated_at
            ? new Date(property.updated_at).toISOString().split("T")[0]
            : today;
          const images = mediaByProperty[property.id] || [];
          const imageXml = images
            .slice(0, 1000) // sitemap protocol limit per URL
            .map(
              (img) => `    <image:image>
      <image:loc>${xmlEscape(img.url)}</image:loc>
      <image:title>${xmlEscape(property.title || img.title || "Property image")}</image:title>
    </image:image>`
            )
            .join("\n");
          return `  <url>
    <loc>${SITE_URL}/properties/${xmlEscape(property.slug)}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>${imageXml ? "\n" + imageXml : ""}
  </url>`;
        })
        .join("\n");

      urlsXml += "\n" + propertyUrls;
    }

    // Fetch published blog posts
    const { data: blogPosts, error: blogError } = await supabase
      .from("blog_posts")
      .select("slug, updated_at, featured_image_url, featured_image_alt, title")
      .eq("status", "published")
      .not("slug", "is", null)
      .order("updated_at", { ascending: false });

    if (!blogError && blogPosts && blogPosts.length > 0) {
      const blogUrls = blogPosts
        .map((post: any) => {
          const lastmod = post.updated_at
            ? new Date(post.updated_at).toISOString().split("T")[0]
            : today;
          const imageXml = post.featured_image_url
            ? `\n    <image:image>
      <image:loc>${xmlEscape(post.featured_image_url)}</image:loc>
      <image:title>${xmlEscape(post.title || "")}</image:title>
      <image:caption>${xmlEscape(post.featured_image_alt || post.title || "")}</image:caption>
    </image:image>`
            : "";
          return `  <url>
    <loc>${SITE_URL}/blog/${xmlEscape(post.slug)}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>${imageXml}
  </url>`;
        })
        .join("\n");

      urlsXml += "\n" + blogUrls;
    }

    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
${urlsXml}
</urlset>`;

    return new Response(sitemap, { headers: corsHeaders, status: 200 });
  } catch (error) {
    console.error("Sitemap generation error:", error);
    return new Response("Error generating sitemap", {
      status: 500,
      headers: { "Content-Type": "text/plain" },
    });
  }
});
