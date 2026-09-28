// Vercel Function serving every /api/* request (see the rewrite in vercel.json).
// ./_server is the bundled Hono backend from apps/server, generated at build
// time by `pnpm run build:api` — it is not checked in.
export { GET, POST, PUT, PATCH, DELETE, OPTIONS, HEAD } from "./_server/index.js";
