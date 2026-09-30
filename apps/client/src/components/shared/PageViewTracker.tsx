import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { trackPageView } from "@/lib/track";

/**
 * Reports a page view to the CRM on every route change. Deliberately its own
 * small component rather than folded into lib/react-router-dom-proxy.tsx's
 * RouterBridge, which already listens for route changes for the embed/iframe
 * messaging feature -- a different concern, and not one this should become
 * entangled with.
 */
export function PageViewTracker(): null {
  const location = useLocation();

  useEffect(() => {
    trackPageView(location.pathname);
  }, [location.pathname]);

  return null;
}
