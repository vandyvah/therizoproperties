import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";

/**
 * Normalizes URLs client-side to prevent duplicate content:
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

    if (normalized !== pathname) {
      navigate(normalized + search + hash, { replace: true });
    }
  }, [location, navigate]);

  return null;
}
