// The API is served from the same origin as the site (a Vercel Function behind
// /api/*). VITE_API_BASE_URL overrides that, e.g. to point a local build at a
// deployed backend.
const RAW_API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "";

export const API_BASE_URL = (RAW_API_BASE_URL || window.location.origin).replace(/\/+$/, "");

export function apiUrl(path: string) {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  const apiPath = normalizedPath === "/api" || normalizedPath.startsWith("/api/") ? normalizedPath : `/api${normalizedPath}`;
  return `${API_BASE_URL}${apiPath}`;
}
