import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";
import { toOpportunity, type Opportunity } from "./opportunities";

/**
 * Property listings, edited in the AXP CRM.
 *
 * Unlike the Knowledge Centre, this has no built-in placeholder to fall back
 * to. A listing card states a specific price and leads straight into the
 * enquiry form -- showing a fictional property as if it were live risks a
 * real visitor asking about a home that does not exist. "Nothing published
 * yet" and "temporarily unavailable" are both shown honestly instead.
 *
 * Goes through `apiFetch`, and therefore through the site's own server, which
 * holds the CRM credentials -- frontend code never talks to the CRM directly
 * (AGENTS.md).
 */

type CrmProperty = Parameters<typeof toOpportunity>[0];
type Status = "loading" | "empty" | "unavailable" | "ready";

export function useOpportunities() {
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [status, setStatus] = useState<Status>("loading");

  useEffect(() => {
    let cancelled = false;

    apiFetch("/properties", { notify: false })
      .then(async (response) => {
        if (cancelled) return;
        if (!response.ok) {
          setStatus("unavailable");
          return;
        }
        const payload = (await response.json()) as
          | { ok: true; data: { properties: CrmProperty[]; source: "crm" | "unconfigured" } }
          | { ok: false };
        if (cancelled || !payload.ok) {
          setStatus("unavailable");
          return;
        }
        const list = payload.data.properties.map(toOpportunity);
        setOpportunities(list);
        setStatus(list.length > 0 ? "ready" : "empty");
      })
      .catch(() => {
        if (!cancelled) setStatus("unavailable");
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return { opportunities, status };
}

export function useOpportunity(slug: string | undefined) {
  const [opportunity, setOpportunity] = useState<Opportunity | null>(null);
  const [status, setStatus] = useState<Status>("loading");

  useEffect(() => {
    if (!slug) {
      setStatus("empty");
      return;
    }
    let cancelled = false;
    setStatus("loading");

    apiFetch(`/properties/${encodeURIComponent(slug)}`, { notify: false })
      .then(async (response) => {
        if (cancelled) return;
        if (!response.ok) {
          setStatus("unavailable");
          return;
        }
        const payload = (await response.json()) as
          | { ok: true; data: { property: CrmProperty | null; source: "crm" | "unconfigured" } }
          | { ok: false };
        if (cancelled || !payload.ok || !payload.data.property) {
          setStatus("empty");
          return;
        }
        setOpportunity(toOpportunity(payload.data.property));
        setStatus("ready");
      })
      .catch(() => {
        if (!cancelled) setStatus("unavailable");
      });

    return () => {
      cancelled = true;
    };
  }, [slug]);

  return { opportunity, status };
}
