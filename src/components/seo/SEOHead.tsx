import { useEffect } from "react";
import { useLocation } from "react-router-dom";

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

// Hreflang configuration for international SEO
const hreflangConfig = [
  { lang: "en-NG", region: "Nigeria (default)" },
  { lang: "en-GB", region: "United Kingdom" },
  { lang: "en-US", region: "United States" },
  { lang: "en-CA", region: "Canada" },
  { lang: "en-AE", region: "UAE/Middle East" },
  { lang: "en-DE", region: "Germany" },
  { lang: "en-NL", region: "Netherlands" },
  { lang: "x-default", region: "Default" },
];

export function SEOHead({
  title,
  description,
  canonical,
  canonicalUrl,
  ogImage = "https://therizoproperties.com/og/og-home.jpg",
  ogType = "website",
  publishedTime,
  modifiedTime,
  keywords = [],
  noindex = false,
}: SEOHeadProps) {
  const location = useLocation();
  const baseUrl = "https://therizoproperties.com";
  
  // Use provided canonical or derive from current route
  const canonicalPath = canonical || canonicalUrl || location.pathname;
  const fullCanonical = canonicalPath.startsWith("http") 
    ? canonicalPath 
    : `${baseUrl}${canonicalPath === "/" ? "" : canonicalPath}`;
  
  const fullTitle = title.includes("Therizo") ? title : `${title} | Therizo`;
  const keywordsArray = typeof keywords === "string" ? keywords.split(",").map(k => k.trim()) : keywords;
  
  // Truncate description for SEO (max 160 chars)
  const truncatedDescription = description.length > 160 
    ? description.substring(0, 157) + "..." 
    : description;

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

    // Core SEO meta tags
    updateMeta("description", truncatedDescription);
    if (keywordsArray.length > 0) {
      updateMeta("keywords", keywordsArray.join(", "));
    }
    
    // Robots meta - comprehensive directives for both Google and Bing
    if (noindex) {
      updateMeta("robots", "noindex, nofollow");
      updateMeta("googlebot", "noindex, nofollow");
      updateMeta("bingbot", "noindex, nofollow");
    } else {
      updateMeta("robots", "index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1");
      updateMeta("googlebot", "index, follow");
      updateMeta("bingbot", "index, follow");
    }

    // Canonical URL
    let link = document.querySelector('link[rel="canonical"]') as HTMLLinkElement;
    if (!link) {
      link = document.createElement("link");
      link.setAttribute("rel", "canonical");
      document.head.appendChild(link);
    }
    link.setAttribute("href", fullCanonical);

    // Hreflang tags for international SEO
    document.querySelectorAll('link[hreflang]').forEach(el => el.remove());
    
    if (!noindex) {
      hreflangConfig.forEach(({ lang }) => {
        const hreflangLink = document.createElement("link");
        hreflangLink.setAttribute("rel", "alternate");
        hreflangLink.setAttribute("hreflang", lang);
        hreflangLink.setAttribute("href", fullCanonical);
        document.head.appendChild(hreflangLink);
      });
    }

    // Open Graph tags
    updateMeta("og:title", fullTitle, true);
    updateMeta("og:description", truncatedDescription, true);
    updateMeta("og:type", ogType, true);
    updateMeta("og:url", fullCanonical, true);
    updateMeta("og:image", ogImage, true);
    updateMeta("og:image:width", "1200", true);
    updateMeta("og:image:height", "630", true);
    updateMeta("og:site_name", "Therizo Properties", true);
    updateMeta("og:locale", "en_NG", true);
    
    // Additional og:locale:alternate for international targeting
    const localeAlternates = ["en_GB", "en_US", "en_CA", "en_AE"];
    localeAlternates.forEach(locale => {
      updateMeta(`og:locale:alternate:${locale}`, locale, true);
    });

    if (publishedTime) {
      updateMeta("article:published_time", publishedTime, true);
    }
    if (modifiedTime) {
      updateMeta("article:modified_time", modifiedTime, true);
    }

    // Twitter Cards
    updateMeta("twitter:card", "summary_large_image");
    updateMeta("twitter:title", fullTitle);
    updateMeta("twitter:description", truncatedDescription);
    updateMeta("twitter:image", ogImage);
    updateMeta("twitter:site", "@TherizoNG");

    // Cleanup function
    return () => {
      document.title = "Therizo Properties | Premium Nigerian Real Estate";
      document.querySelectorAll('link[hreflang]').forEach(el => el.remove());
    };
  }, [fullTitle, truncatedDescription, fullCanonical, ogImage, ogType, publishedTime, modifiedTime, keywordsArray, noindex]);

  return null;
}
