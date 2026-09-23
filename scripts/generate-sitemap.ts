// Runs before `vite dev` and `vite build` (predev/prebuild hooks); writes public/sitemap.xml.
// Includes all static routes plus every published property (with gallery images) and blog post.

import { writeFileSync } from "fs";
import { resolve } from "path";
import { createClient } from "@supabase/supabase-js";

// Local runs read .env; on Vercel the variables are already in process.env.
try {
  process.loadEnvFile();
} catch {
  // no .env file
}

const BASE_URL = "https://therizoproperties.com";
const SUPABASE_URL = process.env.VITE_SUPABASE_URL || "";
const SUPABASE_ANON =
  process.env.VITE_SUPABASE_PUBLISHABLE_KEY ||
  process.env.VITE_SUPABASE_ANON_KEY ||
  "";

const staticEntries: {
  path: string;
  priority: string;
  changefreq: string;
}[] = [
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
  return String(s ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function dateOnly(d: string | null | undefined, fallback: string): string {
  if (!d) return fallback;
  try {
    return new Date(d).toISOString().split("T")[0];
  } catch {
    return fallback;
  }
}

async function main() {
  const today = new Date().toISOString().split("T")[0];
  const urls: string[] = [];

  for (const e of staticEntries) {
    urls.push(
      `  <url>\n    <loc>${BASE_URL}${e.path}</loc>\n    <lastmod>${today}</lastmod>\n    <changefreq>${e.changefreq}</changefreq>\n    <priority>${e.priority}</priority>\n  </url>`
    );
  }

  if (SUPABASE_URL && SUPABASE_ANON) {
    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON);

    // Published properties (slug-routed) with image gallery
    const { data: properties } = await supabase
      .from("properties")
      .select("id, slug, title, updated_at, status")
      .eq("status", "listed")
      .not("slug", "is", null)
      .order("updated_at", { ascending: false });

    let mediaByProperty: Record<
      string,
      { url: string; name: string }[]
    > = {};

    if (properties && properties.length > 0) {
      const ids = properties.map((p: any) => p.id);
      const { data: media } = await supabase
        .from("property_media")
        .select("property_id, file_url, file_name, file_type, sort_order")
        .in("property_id", ids)
        .eq("file_type", "image")
        .order("sort_order", { ascending: true });
      for (const m of (media || []) as any[]) {
        mediaByProperty[m.property_id] ||= [];
        mediaByProperty[m.property_id].push({
          url: m.file_url,
          name: m.file_name || "",
        });
      }

      for (const p of properties as any[]) {
        const lastmod = dateOnly(p.updated_at, today);
        const imgs = mediaByProperty[p.id] || [];
        const imageXml = imgs
          .slice(0, 1000)
          .map(
            (img) =>
              `    <image:image>\n      <image:loc>${xmlEscape(img.url)}</image:loc>\n      <image:title>${xmlEscape(p.title || img.name || "Property image")}</image:title>\n    </image:image>`
          )
          .join("\n");
        urls.push(
          `  <url>\n    <loc>${BASE_URL}/properties/${xmlEscape(p.slug)}</loc>\n    <lastmod>${lastmod}</lastmod>\n    <changefreq>weekly</changefreq>\n    <priority>0.8</priority>${imageXml ? "\n" + imageXml : ""}\n  </url>`
        );
      }
    }

    // Published blog posts with featured image
    const { data: blogPosts } = await supabase
      .from("blog_posts")
      .select("slug, updated_at, title, featured_image_url, featured_image_alt")
      .eq("status", "published")
      .not("slug", "is", null)
      .order("updated_at", { ascending: false });

    for (const post of (blogPosts || []) as any[]) {
      const lastmod = dateOnly(post.updated_at, today);
      const imageXml = post.featured_image_url
        ? `\n    <image:image>\n      <image:loc>${xmlEscape(post.featured_image_url)}</image:loc>\n      <image:title>${xmlEscape(post.title || "")}</image:title>\n      <image:caption>${xmlEscape(post.featured_image_alt || post.title || "")}</image:caption>\n    </image:image>`
        : "";
      urls.push(
        `  <url>\n    <loc>${BASE_URL}/blog/${xmlEscape(post.slug)}</loc>\n    <lastmod>${lastmod}</lastmod>\n    <changefreq>monthly</changefreq>\n    <priority>0.7</priority>${imageXml}\n  </url>`
      );
    }
  } else {
    console.warn(
      "[generate-sitemap] Supabase env vars not found — writing static-only sitemap."
    );
  }

  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"\n        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">\n${urls.join("\n")}\n</urlset>\n`;

  writeFileSync(resolve("public/sitemap.xml"), xml);
  console.log(`sitemap.xml written (${urls.length} URLs)`);
}

main().catch((err) => {
  console.error("[generate-sitemap] failed:", err);
  // Do not fail the build; keep existing sitemap.xml.
  process.exit(0);
});
