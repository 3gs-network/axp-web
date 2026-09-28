import { Hono, type Context } from "hono";
import { apiSuccess } from "@repo/shared/http";

export const healthRouter = new Hono();

const healthHandler = (c: Context) => {
  return c.json(apiSuccess({ service: "server", runtime: "hono" }));
};

healthRouter.get("/", healthHandler);
healthRouter.get("", healthHandler);
healthRouter.get("/*", healthHandler);
