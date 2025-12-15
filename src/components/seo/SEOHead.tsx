import { useEffect } from "react";

interface SEOHeadProps {
  title: string;
  description: string;
  canonical?: string;
  canonicalUrl?: string; // alias for canonical
  ogImage?: string;
  ogType?: "website" | "article" | "product";
  publishedTime?: string;
  modifiedTime?: string;
  keywords?: string | string[];
  noindex?: boolean;
}

export function SEOHead({
  title,
  description,
  canonical,
  canonicalUrl,
  ogImage = "https://lovable.dev/opengraph-image-p98pqg.png",
  ogType = "website",
  publishedTime,
  modifiedTime,
  keywords = [],
  noindex = false,
}: SEOHeadProps) {
  const baseUrl = "https://therizo.com";
  const canonicalPath = canonical || canonicalUrl || "";
  const fullCanonical = canonicalPath.startsWith("http") ? canonicalPath : `${baseUrl}${canonicalPath}`;
  const fullTitle = title.includes("Therizo") ? title : `${title} | Therizo`;
  const keywordsArray = typeof keywords === "string" ? keywords.split(",").map(k => k.trim()) : keywords;

  useEffect(() => {
    // Update document title
    document.title = fullTitle;

    // Update or create meta tags
    const updateMeta = (name: string, content: string, isProperty = false) => {
      const attr = isProperty ? "property" : "name";
      let meta = document.querySelector(`meta[${attr}="${name}"]`);
      if (!meta) {
        meta = document.createElement("meta");
        meta.setAttribute(attr, name);
        document.head.appendChild(meta);
      }
      meta.setAttribute("content", content);
    };

    // Core SEO
    updateMeta("description", description);
    if (keywordsArray.length > 0) {
      updateMeta("keywords", keywordsArray.join(", "));
    }
    if (noindex) {
      updateMeta("robots", "noindex, nofollow");
    } else {
      updateMeta("robots", "index, follow");
    }

    // Canonical
    let link = document.querySelector('link[rel="canonical"]') as HTMLLinkElement;
    if (!link) {
      link = document.createElement("link");
      link.setAttribute("rel", "canonical");
      document.head.appendChild(link);
    }
    link.setAttribute("href", fullCanonical);

    // Open Graph
    updateMeta("og:title", fullTitle, true);
    updateMeta("og:description", description, true);
    updateMeta("og:type", ogType, true);
    updateMeta("og:url", fullCanonical, true);
    updateMeta("og:image", ogImage, true);
    updateMeta("og:site_name", "Therizo Property and Development Corporation", true);
    updateMeta("og:locale", "en_NG", true);

    if (publishedTime) {
      updateMeta("article:published_time", publishedTime, true);
    }
    if (modifiedTime) {
      updateMeta("article:modified_time", modifiedTime, true);
    }

    // Twitter Cards
    updateMeta("twitter:card", "summary_large_image");
    updateMeta("twitter:title", fullTitle);
    updateMeta("twitter:description", description);
    updateMeta("twitter:image", ogImage);
    updateMeta("twitter:site", "@TherizoNG");

    // Cleanup function
    return () => {
      // Reset to default on unmount
      document.title = "Therizo Property and Development Corporation | Nigerian Real Estate";
    };
  }, [fullTitle, description, fullCanonical, ogImage, ogType, publishedTime, modifiedTime, keywordsArray, noindex]);

  return null;
}
