import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { analytics } from "@/lib/analytics";

/**
 * Fires a first-party page_view on every route change.
 * Mounted once inside <BrowserRouter>.
 */
export const PageViewTracker = () => {
  const location = useLocation();

  useEffect(() => {
    analytics.pageView(location.pathname + location.search);
  }, [location.pathname, location.search]);

  return null;
};
