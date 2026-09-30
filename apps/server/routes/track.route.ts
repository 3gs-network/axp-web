import { Hono, type Context } from "hono";
import { z } from "zod";
import { apiSuccess } from "@repo/shared/http";
import { CrmUnconfiguredError, isCrmConfigured, trackEvent } from "../services/axp-crm";

/**
 * POST /api/track — one piece of website activity, into the AXP CRM.
 *
 * Public, and silent on failure by design (see the client side, lib/track.ts):
 * a lost analytics event is a rounding error, never something a visitor
 * should see a message about. If a signed-in visitor's own Authorization
 * header is present, it is forwarded so the event carries their real
 * identity; otherwise the CRM records it as anonymous.
 */
export const trackRouter = new Hono();

const TrackSchema = z.object({
  eventType: z.enum(["page_view", "click", "enquiry_submitted", "signup_completed"]),
  sessionId: z.string().trim().min(1).max(100),
  path: z.string().trim().max(300).optional(),
  label: z.string().trim().max(200).optional(),
  targetSlug: z.string().trim().max(200).optional(),
  referrer: z.string().trim().max(300).optional(),
  deviceType: z.enum(["mobile", "tablet", "desktop"]).optional()
});

function bearerToken(c: Context): string | undefined {
  const header = c.req.header("Authorization");
  return header?.startsWith("Bearer ") ? header.slice("Bearer ".length) : undefined;
}

trackRouter.post("", handler);
trackRouter.post("/", handler);

async function handler(c: Context) {
  const body = await c.req.json().catch(() => null);
  const parsed = TrackSchema.safeParse(body ?? {});

  // Malformed is still success from the visitor's side of things -- nothing
  // about tracking should ever surface as an error on a marketing page.
  if (!parsed.success || !isCrmConfigured()) {
    return c.json(apiSuccess({ recorded: false }));
  }

  try {
    await trackEvent(parsed.data, bearerToken(c));
  } catch (error) {
    if (!(error instanceof CrmUnconfiguredError)) {
      console.error("[track] could not reach the AXP CRM:", error);
    }
  }
  return c.json(apiSuccess({ recorded: true }));
}
