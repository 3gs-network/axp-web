import { Hono, type Context } from "hono";
import { z } from "zod";
import { apiFailure, apiSuccess } from "@repo/shared/http";
import {
  CrmRequestError,
  CrmUnconfiguredError,
  authErrorCode,
  getAccountUser,
  isCrmConfigured,
  refreshAccountSession,
  registerCustomer,
  resendConfirmation,
  signInAccount,
  signOutAccount,
  signUpAccount
} from "../services/axp-crm";

/**
 * Website accounts, backed by the AXP CRM's Supabase Auth.
 *
 * POST /api/account/sign-up               create an account + CRM contact
 * POST /api/account/sign-in               email + password -> session
 * POST /api/account/refresh               refresh token -> new session
 * GET  /api/account/me                    Bearer access token -> user
 * POST /api/account/sign-out              Bearer access token -> revoked
 * POST /api/account/resend-confirmation   re-send the sign-up email
 *
 * The browser holds the session tokens; the CRM key stays here.
 */
export const accountRouter = new Hono();

const SignUpSchema = z.object({
  name: z.string().trim().min(1, "Please enter your name.").max(120),
  email: z.string().trim().email("That does not look like an email address.").max(200),
  password: z.string().min(8, "Use at least 8 characters for your password.").max(200),
  phone: z.string().trim().max(40).optional()
});

const SignInSchema = z.object({
  email: z.string().trim().email("That does not look like an email address.").max(200),
  password: z.string().min(1, "Please enter your password.").max(200)
});

const RefreshSchema = z.object({ refreshToken: z.string().min(1) });
const ResendSchema = z.object({ email: z.string().trim().email().max(200) });

// Where the confirmation email's link lands. The CRM's Supabase Auth must list
// this URL under Redirect URLs, or the link falls back to the CRM's Site URL.
function confirmationRedirect(c: Context) {
  return `${new URL(c.req.url).origin}/auth`;
}

function bearerToken(c: Context) {
  const header = c.req.header("Authorization");
  return header?.startsWith("Bearer ") ? header.slice("Bearer ".length) : null;
}

async function readJson(c: Context): Promise<unknown> {
  return (await c.req.json().catch(() => null)) ?? {};
}

function invalid(c: Context, parsed: { error: z.ZodError }) {
  return c.json(apiFailure("INVALID_INPUT", parsed.error.issues[0]?.message ?? "Please check the form."), 400);
}

// The CRM refused the token or credentials themselves (as opposed to being
// down or rate-limiting us).
function isAuthRefusal(error: unknown) {
  return error instanceof CrmRequestError && [400, 401, 403].includes(error.status);
}

function unavailable(c: Context, error: unknown, what: string) {
  if (!(error instanceof CrmUnconfiguredError)) {
    console.error(`[account] ${what} failed:`, error);
  }
  return c.json(apiFailure("ACCOUNTS_UNAVAILABLE", "Accounts are unavailable just now. Please try again shortly."), 503);
}

accountRouter.use("*", async (c, next) => {
  if (!isCrmConfigured()) {
    return unavailable(c, new CrmUnconfiguredError(), "request");
  }
  await next();
});

accountRouter.post("/sign-up", async (c) => {
  const parsed = SignUpSchema.safeParse(await readJson(c));
  if (!parsed.success) return invalid(c, parsed);
  const { name, email, password, phone } = parsed.data;

  let session;
  try {
    session = await signUpAccount({ email, password, fullName: name, redirectTo: confirmationRedirect(c) });
  } catch (error) {
    const code = authErrorCode(error);
    if (code === "weak_password") {
      return c.json(apiFailure("WEAK_PASSWORD", "Please choose a stronger password."), 400);
    }
    if (code === "user_already_exists") {
      return c.json(apiFailure("ACCOUNT_EXISTS", "An account with that email already exists. Try signing in."), 409);
    }
    return unavailable(c, error, "sign-up");
  }

  // Every sign-up is also a contact an advisor can follow up. A CRM hiccup here
  // must not make a successful sign-up look broken, so it is logged, not raised.
  await registerCustomer({ email, fullName: name, phone }).catch((error) => {
    console.error("[account] could not record the sign-up as a CRM contact:", error);
  });

  return c.json(apiSuccess(session ? { status: "signed_in", session } : { status: "confirm_email" }));
});

accountRouter.post("/sign-in", async (c) => {
  const parsed = SignInSchema.safeParse(await readJson(c));
  if (!parsed.success) return invalid(c, parsed);

  try {
    return c.json(apiSuccess({ session: await signInAccount(parsed.data.email, parsed.data.password) }));
  } catch (error) {
    const code = authErrorCode(error);
    if (code === "invalid_credentials" || code === "invalid_grant") {
      return c.json(apiFailure("INVALID_CREDENTIALS", "That email and password don't match."), 401);
    }
    if (code === "email_not_confirmed") {
      return c.json(
        apiFailure("EMAIL_NOT_CONFIRMED", "Please confirm your email first. Check your inbox for the link."),
        403
      );
    }
    return unavailable(c, error, "sign-in");
  }
});

accountRouter.post("/refresh", async (c) => {
  const parsed = RefreshSchema.safeParse(await readJson(c));
  if (!parsed.success) return invalid(c, parsed);

  try {
    return c.json(apiSuccess({ session: await refreshAccountSession(parsed.data.refreshToken) }));
  } catch (error) {
    if (isAuthRefusal(error)) {
      return c.json(apiFailure("SESSION_EXPIRED", "Please sign in again."), 401);
    }
    return unavailable(c, error, "refresh");
  }
});

accountRouter.get("/me", async (c) => {
  const token = bearerToken(c);
  if (!token) return c.json(apiFailure("UNAUTHORIZED", "Please sign in."), 401);

  try {
    return c.json(apiSuccess({ user: await getAccountUser(token) }));
  } catch (error) {
    if (isAuthRefusal(error)) {
      return c.json(apiFailure("UNAUTHORIZED", "Please sign in."), 401);
    }
    return unavailable(c, error, "session check");
  }
});

accountRouter.post("/sign-out", async (c) => {
  const token = bearerToken(c);
  // Signing out always succeeds for the visitor: the browser forgets the
  // session either way, and a token the CRM no longer knows is already dead.
  if (token) {
    await signOutAccount(token).catch(() => undefined);
  }
  return c.json(apiSuccess({ signedOut: true }));
});

accountRouter.post("/resend-confirmation", async (c) => {
  const parsed = ResendSchema.safeParse(await readJson(c));
  if (!parsed.success) return invalid(c, parsed);

  // Same answer whether or not the address has an account, so this cannot be
  // used to find out who has signed up.
  await resendConfirmation(parsed.data.email, confirmationRedirect(c)).catch((error) => {
    console.error("[account] resend confirmation failed:", error);
  });
  return c.json(apiSuccess({ sent: true }));
});
