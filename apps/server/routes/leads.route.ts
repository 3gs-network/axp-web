import { Hono, type Context } from "hono";
import { z } from "zod";
import { apiFailure, apiSuccess } from "@repo/shared/http";
import { CrmUnconfiguredError, createLead, isCrmConfigured, trackEvent } from "../services/axp-crm";

/**
 * POST /api/leads — an enquiry from the public site, into the CRM queue.
 */
export const leadsRouter = new Hono();

const LeadSchema = z.object({
  fullName: z.string().trim().min(1, "A name is required.").max(120),
  email: z.string().trim().email("That does not look like an email address.").max(200),
  phone: z.string().trim().max(40).optional(),
  loanAmount: z.coerce.number().min(0).max(100_000_000_000).optional(),
  message: z.string().trim().max(4000).optional(),
  interest: z.string().trim().max(200).optional(),
  // From lib/track.ts's getSessionId(), so this enquiry can be tied back to
  // the visit that led to it. Optional: an older cached bundle without this
  // field must not fail the enquiry over an analytics detail.
  sessionId: z.string().trim().max(100).optional(),
  // A field a person cannot see and a bot fills in. Empty means human.
  website: z.string().max(500).optional()
});

async function createHandler(c: Context) {
  const body = await c.req.json().catch(() => null);
  const parsed = LeadSchema.safeParse(body ?? {});

  if (!parsed.success) {
    const first = parsed.error.issues[0];
    return c.json(apiFailure("INVALID_ENQUIRY", first?.message ?? "Please check the form."), 400);
  }

  // Silently accepted, never stored. Telling a bot it was caught only teaches
  // it to try again differently.
  if (parsed.data.website) {
    return c.json(apiSuccess({ received: true }));
  }

  if (!isCrmConfigured()) {
    console.error("[leads] an enquiry arrived but the AXP CRM is not configured");
    return c.json(
      apiFailure("ENQUIRY_UNAVAILABLE", "We could not send that just now. Please try again shortly."),
      503
    );
  }

  try {
    await createLead({
      fullName: parsed.data.fullName,
      email: parsed.data.email,
      phone: parsed.data.phone,
      loanAmount: parsed.data.loanAmount,
      details: {
        message: parsed.data.message ?? "",
        interest: parsed.data.interest ?? "",
        submittedFrom: "axplimited.com"
      }
    });

    // Best-effort: the enquiry itself already succeeded and must be returned
    // to the visitor regardless of whether this side-note about it does.
    trackEvent({
      eventType: "enquiry_submitted",
      sessionId: parsed.data.sessionId || crypto.randomUUID(),
      label: parsed.data.interest
    }).catch(() => undefined);

    return c.json(apiSuccess({ received: true }));
  } catch (error) {
    if (error instanceof CrmUnconfiguredError) {
      return c.json(apiFailure("ENQUIRY_UNAVAILABLE", "We could not send that just now."), 503);
    }

    // An enquiry that fails silently is a client the firm never hears from, so
    // this is logged loudly on the server and reported honestly to the visitor.
    console.error("[leads] could not file the enquiry with the AXP CRM:", error);
    return c.json(
      apiFailure("ENQUIRY_FAILED", "We could not send that just now. Please try again shortly."),
      502
    );
  }
}

leadsRouter.post("", createHandler);
leadsRouter.post("/", createHandler);
