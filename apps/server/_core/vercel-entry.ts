import { handle } from "hono/vercel";
import app from "./create-app";

// Vercel Function entry. Built by `SERVER_BUILD_TARGET=vercel vite build` into
// apps/client/api/_server/, then re-exported by apps/client/api/index.js so the
// API ships in the same Vercel project (and on the same origin) as the site.
const handler = handle(app);

export const GET = handler;
export const POST = handler;
export const PUT = handler;
export const PATCH = handler;
export const DELETE = handler;
export const OPTIONS = handler;
export const HEAD = handler;
