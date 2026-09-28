import { Hono, type Context } from "hono";
import { apiFailure, apiSuccess } from "@repo/shared/http";
import { publicRoute } from "../_core/route-helpers";
import { CrmUnconfiguredError, isCrmConfigured, listKnowledge } from "../services/axp-crm";

/**
 * GET /api/knowledge — the Knowledge Centre, edited in the AXP CRM.
 *
 * Public: these are marketing articles. The CRM decides what is published; this
 * only ever sees posts somebody deliberately published there, because the
 * function it calls returns nothing else.
 */
export const knowledgeRouter = new Hono();

knowledgeRouter.get("", publicRoute, handler);
knowledgeRouter.get("/", publicRoute, handler);

async function handler(c: Context) {
  // Not configured is not an error the visitor caused, and the page has its own
  // fallback content -- so say so plainly and let the client fall back rather
  // than showing a failure on a marketing page.
  if (!isCrmConfigured()) {
    return c.json(apiSuccess({ posts: [], source: "unconfigured" }));
  }

  try {
    const posts = await listKnowledge();
    return c.json(apiSuccess({ posts, source: "crm" }));
  } catch (error) {
    if (error instanceof CrmUnconfiguredError) {
      return c.json(apiSuccess({ posts: [], source: "unconfigured" }));
    }

    // The CRM's own words go to the server log, never to the visitor.
    console.error("[knowledge] could not reach the AXP CRM:", error);
    return c.json(
      apiFailure("KNOWLEDGE_UNAVAILABLE", "The Knowledge Centre is temporarily unavailable."),
      502
    );
  }
}
