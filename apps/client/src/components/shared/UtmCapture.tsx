import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { captureUtm } from "@/lib/utm";

/** Keeps the landing page's utm_source / utm_campaign for the sign-up form. */
export function UtmCapture(): null {
  const location = useLocation();

  useEffect(() => {
    captureUtm(location.search);
  }, [location.search]);

  return null;
}
