import { Hono, type Context } from "hono";
import { apiFailure, apiSuccess } from "@repo/shared/http";
import { PRIVACY_NOTICE } from "@repo/shared/homeready";
import { env } from "../_core/env";
import { insertHomeReadyLead, isLeadsDbConfigured } from "../services/leads-db";
import { isEmailConfigured, sendEmail } from "../services/sendbyte";
import { createPgSignupStore, isSignupStoreConfigured } from "../services/homeready-store";
import { createSignupFlow, type Failure, type SignupFlow } from "../services/homeready-signup";

/**
 * HomeReady "register your interest", used by the /register page.
 *
 * POST /api/homeready/register   form -> { pendingId }   (emails a 6-digit code)
 * POST /api/homeready/verify     { pendingId, code } -> { name }   (writes the lead)
 * POST /api/homeready/resend     { pendingId } -> new code, at most once a minute
 *
 * Every answer is the same whether or not the email or phone has registered
 * before: duplicates are inserted and flagged by the HSG admin app, never
 * revealed here.
 */

function clientIp(c: Context) {
  // Vercel sets x-vercel-forwarded-for / x-real-ip itself; x-forwarded-for's
  // first hop is the fallback for other hosts and local development.
  const forwarded =
    c.req.header("x-vercel-forwarded-for") ?? c.req.header("x-real-ip") ?? c.req.header("x-forwarded-for") ?? "";
  return forwarded.split(",")[0]?.trim() || "unknown";
}

async function readJson(c: Context): Promise<Record<string, unknown>> {
  const body = await c.req.json().catch(() => null);
  return typeof body === "object" && body !== null ? (body as Record<string, unknown>) : {};
}

function failure(c: Context, result: Failure) {
  const body = apiFailure(result.code, result.message);
  // Field messages ride inside the standard envelope's error object, for the
  // form to show under each field. The browser runs the same rules first, so
  // this only matters for a stale bundle or a hand-made request.
  const error = {
    ...body.error,
    ...(result.fields ? { fields: result.fields } : {}),
    ...(result.retryAfterSeconds !== undefined ? { retryAfterSeconds: result.retryAfterSeconds } : {})
  };
  if (result.retryAfterSeconds !== undefined) c.header("Retry-After", String(result.retryAfterSeconds));
  return c.json({ ...body, error }, result.status);
}

function unexpected(c: Context, what: string, error: unknown) {
  // Code only: never the message, which can quote personal data.
  console.error(`[homeready] ${what} failed:`, (error as { code?: unknown } | null)?.code ?? "unknown");
  return c.json(apiFailure("REGISTRATION_FAILED", "Something went wrong on our side. Please try again shortly."), 500);
}

/** Build the router around a flow. Tests pass their own; production uses env. */
export function createHomeReadyRouter(getFlow: () => SignupFlow | null) {
  const router = new Hono();

  router.use("*", async (c, next) => {
    if (!getFlow()) {
      return c.json(apiFailure("REGISTRATION_UNAVAILABLE", "Registration isn't open just yet. Please check back soon."), 503);
    }
    await next();
  });

  router.post("/register", async (c) => {
    try {
      const result = await getFlow()!.register({ body: await readJson(c), ip: clientIp(c) });
      return result.ok ? c.json(apiSuccess(result.data)) : failure(c, result);
    } catch (error) {
      return unexpected(c, "register", error);
    }
  });

  router.post("/verify", async (c) => {
    try {
      const body = await readJson(c);
      const result = await getFlow()!.verify({ pendingId: body.pendingId, code: body.code, ip: clientIp(c) });
      return result.ok ? c.json(apiSuccess(result.data)) : failure(c, result);
    } catch (error) {
      return unexpected(c, "verify", error);
    }
  });

  router.post("/resend", async (c) => {
    try {
      const body = await readJson(c);
      const result = await getFlow()!.resend({ pendingId: body.pendingId, ip: clientIp(c) });
      return result.ok ? c.json(apiSuccess(result.data)) : failure(c, result);
    } catch (error) {
      return unexpected(c, "resend", error);
    }
  });

  return router;
}

let flow: SignupFlow | null = null;

function envFlow(): SignupFlow | null {
  if (
    !isLeadsDbConfigured() ||
    !isSignupStoreConfigured() ||
    !isEmailConfigured() ||
    !env.HOMEREADY_OTP_SECRET
  ) {
    return null;
  }
  flow ??= createSignupFlow({
    store: createPgSignupStore(),
    sendEmail,
    insertLead: (row) => insertHomeReadyLead(row),
    privacyNotice: PRIVACY_NOTICE,
    secret: env.HOMEREADY_OTP_SECRET
  });
  return flow;
}

export const homeReadyRouter = createHomeReadyRouter(envFlow);
