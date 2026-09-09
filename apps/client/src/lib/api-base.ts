type RuntimeAppConfig = { apiBaseUrl?: string };

// Resolution order: build-time VITE_API_BASE_URL > runtime app-config.js
// (written by the publish pipeline after backend deploy) > same-origin.
// The static client and the FC backend live on different domains, so the
// runtime config is what wires production FE -> BE without a rebuild.
const runtimeConfig: RuntimeAppConfig =
  (window as Window & { __SKYBASE_APP_CONFIG__?: RuntimeAppConfig }).__SKYBASE_APP_CONFIG__ ?? {};

const RAW_API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? runtimeConfig.apiBaseUrl ?? "";

export const API_BASE_URL = (RAW_API_BASE_URL || window.location.origin).replace(/\/+$/, "");

export function apiUrl(path: string) {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  const apiPath = normalizedPath === "/api" || normalizedPath.startsWith("/api/") ? normalizedPath : `/api${normalizedPath}`;
  return `${API_BASE_URL}${apiPath}`;
}

// The public home-ownership listings feed is served by the AXP platform API,
// which lives on its own origin (not this marketing site's backend).
// VITE_LISTINGS_API_BASE_URL wires the two per environment; it defaults to the
// local platform port so `pnpm dev` works out of the box.
const RAW_LISTINGS_API_BASE_URL = import.meta.env.VITE_LISTINGS_API_BASE_URL ?? "http://localhost:3000";

export const LISTINGS_API_BASE_URL = (RAW_LISTINGS_API_BASE_URL || API_BASE_URL).replace(/\/+$/, "");

export function listingsUrl(path: string) {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${LISTINGS_API_BASE_URL}${normalizedPath}`;
}

export function authUrl(path = "") {
  const normalizedPath = path ? (path.startsWith("/") ? path : `/${path}`) : "";
  return apiUrl(`/auth${normalizedPath}`);
}
