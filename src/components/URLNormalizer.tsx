import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";

/**
 * Legacy path -> canonical path map. Client-side 301-equivalent.
 * Keep keys lowercase, no trailing slash. Values are the current canonical route.
 */
const LEGACY_REDIRECTS: Record<string, string> = {
  "/home": "/",
  "/index": "/",
  "/about": "/our-standard",
  "/about-us": "/our-standard",
  "/standard": "/our-standard",
  "/our-team": "/team",
  "/team-members": "/team",
  "/founders": "/team",
  "/contact-us": "/contact",
  "/get-in-touch": "/contact",
  "/listings": "/properties",
  "/property": "/properties",
  "/for-sale": "/properties",
  "/roi": "/calculator",
  "/roi-calculator": "/calculator",
  "/investment-calculator": "/calculator",
  "/mortgage": "/calculator",
  "/private-vault": "/vault",
  "/off-market": "/vault",
  "/materials": "/materials-supply",
  "/supply": "/materials-supply",
  "/news": "/press",
  "/media": "/press",
  "/articles": "/blog",
  "/insights": "/blog",
  "/guides/title": "/guides/title-verification",
  "/guides/buyer": "/guides/buyer-guide",
  "/guides/roi": "/guides/roi-methodology",
  "/lagos": "/locations/lagos",
  "/abuja": "/locations/abuja",
  "/port-harcourt": "/locations/port-harcourt",
  "/portharcourt": "/locations/port-harcourt",
  "/fraud": "/report-fraud",
  "/report": "/report-fraud",
};

/**
 * Normalizes URLs client-side to prevent duplicate content:
 * - Legacy paths -> canonical routes (via history replace)
 * - Uppercase path segments -> lowercase (e.g. /Blog -> /blog)
 * - Trailing slash -> removed (except root)
 * Preserves search string and hash. Uses replace() so browser history stays clean.
 * Skips assets (paths with a file extension).
 */
export function URLNormalizer() {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const { pathname, search, hash } = location;
    if (pathname === "/") return;
    // Skip asset-like paths
    if (/\.[a-zA-Z0-9]{2,5}$/.test(pathname)) return;

    let normalized = pathname;
    // Lowercase
    if (normalized !== normalized.toLowerCase()) {
      normalized = normalized.toLowerCase();
    }
    // Strip trailing slash
    if (normalized.length > 1 && normalized.endsWith("/")) {
      normalized = normalized.replace(/\/+$/, "");
    }
    // Legacy redirect map
    if (LEGACY_REDIRECTS[normalized]) {
      normalized = LEGACY_REDIRECTS[normalized];
    }

    if (normalized !== pathname) {
      navigate(normalized + search + hash, { replace: true });
    }
  }, [location, navigate]);

  return null;
}
