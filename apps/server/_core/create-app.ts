import { Hono } from "hono";
import { cors } from "hono/cors";
import { routeEntries } from "./route-registry";
import { notFound } from "../middlewares/not-found";
import { onError } from "../middlewares/on-error";

const app = new Hono();

// In production the site and this API share an origin (a Vercel Function behind
// /api/*), so CORS only matters when a local build points VITE_API_BASE_URL at
// a deployed backend. Every endpoint is public and nothing rides on cookies, so
// any origin may call it.
app.use(
  "/api/*",
  cors({
    origin: "*",
    allowMethods: ["GET", "POST", "OPTIONS"]
  })
);

// Routes are auto-discovered from apps/server/routes/*.route.ts and mounted at
// /api/<name>. To add an endpoint, add a route file — no edits needed here.
for (const { path, router } of routeEntries) {
  app.route(path, router);
}

app.onError(onError);
app.notFound(notFound);

export default app;
