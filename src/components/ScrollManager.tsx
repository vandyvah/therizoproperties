import { useEffect } from "react";
import { useLocation } from "react-router-dom";

/**
 * ScrollManager: Global scroll management for route changes
 * - Scrolls to top on route changes (no hash)
 * - Scrolls to anchor element when hash is present
 * - Disables browser's automatic scroll restoration
 */
export function ScrollManager() {
  const { pathname, hash } = useLocation();

  useEffect(() => {
    // Disable browser's scroll restoration
    if ("scrollRestoration" in window.history) {
      window.history.scrollRestoration = "manual";
    }
  }, []);

  useEffect(() => {
    // Small delay to ensure DOM is ready after route change
    const scrollTimeout = setTimeout(() => {
      if (hash) {
        // If there's a hash, scroll to that element
        const element = document.getElementById(hash.substring(1));
        if (element) {
          element.scrollIntoView({ behavior: "smooth", block: "start" });
        } else {
          // Hash element not found, scroll to top
          window.scrollTo({ top: 0, left: 0, behavior: "auto" });
        }
      } else {
        // No hash, scroll to top
        window.scrollTo({ top: 0, left: 0, behavior: "auto" });
      }
    }, 0);

    return () => clearTimeout(scrollTimeout);
  }, [pathname, hash]);

  return null;
}
