import { apiFetch } from "@/lib/api";
import { getAccessToken } from "@/lib/session";

/**
 * Website activity, reported to the AXP CRM.
 *
 * A signed-in visitor's events carry their own access token, so the CRM can
 * attribute them to a real account -- the same way any signed-in request
 * already does. Everyone else is anonymous: sessionId below is scoped to this
 * tab's sessionStorage, not a cookie. It is generated once per tab, dies when
 * the tab closes, and never leaves this browser except as an opaque id with
 * no meaning beyond "these events happened in one visit". Nothing else about
 * the visitor -- no IP address, no device fingerprint -- is collected or
 * sent.
 *
 * Fire-and-forget: a tracking call never blocks, throws to the caller, or
 * shows an error toast (`notify: false`). Losing an analytics event is a
 * rounding error; interrupting someone's visit to report one would not be.
 */

const SESSION_KEY = "axp-visit-id";

export function getSessionId(): string {
  try {
    let id = window.sessionStorage.getItem(SESSION_KEY);
    if (!id) {
      id = crypto.randomUUID();
      window.sessionStorage.setItem(SESSION_KEY, id);
    }
    return id;
  } catch {
    // sessionStorage blocked (private mode, embedded iframe): fall back to an
    // id that lives only for this call, rather than not tracking at all.
    return crypto.randomUUID();
  }
}

function deviceType(): "mobile" | "tablet" | "desktop" {
  const w = window.innerWidth;
  if (w < 768) return "mobile";
  if (w < 1024) return "tablet";
  return "desktop";
}

type EventType = "page_view" | "click";

function send(eventType: EventType, fields: { path?: string; label?: string; targetSlug?: string }) {
  const token = getAccessToken();
  void apiFetch("/track", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    },
    body: JSON.stringify({
      eventType,
      sessionId: getSessionId(),
      path: fields.path,
      label: fields.label,
      targetSlug: fields.targetSlug,
      referrer: document.referrer || undefined,
      deviceType: deviceType()
    }),
    notify: false
  }).catch(() => {
    // The visit itself matters; a lost analytics event does not.
  });
}

export function trackPageView(path: string) {
  send("page_view", { path });
}

export function trackClick(label: string, targetSlug?: string) {
  send("click", { path: window.location.pathname, label, targetSlug });
}
