import { Hono, type Context } from "hono";
import { apiFailure, apiSuccess } from "@repo/shared/http";
import { CrmUnconfiguredError, getProperty, isCrmConfigured, listProperties } from "../services/axp-crm";

/**
 * GET /api/properties         — published listings, edited in the AXP CRM.
 * GET /api/properties/:slug   — one listing.
 *
 * Public: these are marketing listings. The CRM decides what is published;
 * this only ever sees rows somebody deliberately published there, because the
 * CRM's row-level security refuses everything else to an unauthenticated
 * caller.
 */
export const propertiesRouter = new Hono();

propertiesRouter.get("", listHandler);
propertiesRouter.get("/", listHandler);
propertiesRouter.get("/:slug", detailHandler);

async function listHandler(c: Context) {
  // Not configured is not an error the visitor caused, and the page has its
  // own fallback content -- so say so plainly and let the client fall back
  // rather than showing a failure on a marketing page.
  if (!isCrmConfigured()) {
    return c.json(apiSuccess({ properties: [], source: "unconfigured" }));
  }

  try {
    const properties = await listProperties();
    return c.json(apiSuccess({ properties, source: "crm" }));
  } catch (error) {
    if (error instanceof CrmUnconfiguredError) {
      return c.json(apiSuccess({ properties: [], source: "unconfigured" }));
    }
    // The CRM's own words go to the server log, never to the visitor.
    console.error("[properties] could not reach the AXP CRM:", error);
    return c.json(
      apiFailure("LISTINGS_UNAVAILABLE", "Listings are temporarily unavailable."),
      502
    );
  }
}

async function detailHandler(c: Context) {
  const slug = c.req.param("slug");
  if (!slug) {
    return c.json(apiFailure("INVALID_SLUG", "No listing was specified."), 400);
  }

  if (!isCrmConfigured()) {
    return c.json(apiSuccess({ property: null, source: "unconfigured" }));
  }

  try {
    const property = await getProperty(slug);
    return c.json(apiSuccess({ property, source: "crm" }));
  } catch (error) {
    if (error instanceof CrmUnconfiguredError) {
      return c.json(apiSuccess({ property: null, source: "unconfigured" }));
    }
    console.error("[properties] could not reach the AXP CRM:", error);
    return c.json(
      apiFailure("LISTINGS_UNAVAILABLE", "Listings are temporarily unavailable."),
      502
    );
  }
}
