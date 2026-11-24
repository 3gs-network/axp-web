/**
 * Campaign attribution for the HomeReady sign-up.
 *
 * A visitor who lands from, say, an Instagram link arrives with
 * `?utm_source=instagram`. The value is kept in this tab's sessionStorage from
 * that first page until they submit /register, wherever they browse in
 * between, so the lead can be credited to the right source
 * (LEAD_SOURCE_MAP in @repo/shared/homeready). First touch wins: later
 * internal links without UTM values never overwrite it.
 *
 * Only ever called from effects and event handlers -- never during render --
 * so the prerendered home page stays SSR-safe.
 */

export type Utm = { utmSource: string | null; utmCampaign: string | null };

const STORAGE_KEY = "axp-utm";
const MAX_LENGTH = 100;

function clean(value: string | null) {
  const trimmed = value?.trim().slice(0, MAX_LENGTH);
  return trimmed ? trimmed : null;
}

/** Remember utm_source / utm_campaign from a URL query string, if present. */
export function captureUtm(search: string) {
  const params = new URLSearchParams(search);
  const utm: Utm = { utmSource: clean(params.get("utm_source")), utmCampaign: clean(params.get("utm_campaign")) };
  if (!utm.utmSource && !utm.utmCampaign) return;
  try {
    if (!window.sessionStorage.getItem(STORAGE_KEY)) {
      window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(utm));
    }
  } catch {
    // Storage blocked: attribution falls back to "Website".
  }
}

export function readUtm(): Utm {
  try {
    const raw = window.sessionStorage.getItem(STORAGE_KEY);
    const parsed = raw ? (JSON.parse(raw) as Partial<Utm>) : {};
    return {
      utmSource: typeof parsed.utmSource === "string" ? parsed.utmSource : null,
      utmCampaign: typeof parsed.utmCampaign === "string" ? parsed.utmCampaign : null
    };
  } catch {
    return { utmSource: null, utmCampaign: null };
  }
}
