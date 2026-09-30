import { env } from "../_core/env";

/**
 * The AXP mortgage CRM (Supabase), reached from the server only.
 *
 * WHY NOT supabase-js IN THE BROWSER. Two reasons, both from AGENTS.md:
 * frontend business code may only reach a backend through `apiFetch`, and
 * `@supabase/supabase-js` does its own `fetch`. Keeping this on the server also
 * means the CRM's key never ships to a visitor's browser.
 *
 * WHAT THE KEY CAN DO. It is the CRM's ANON key, and on its own it can do
 * exactly three things, because the CRM's row-level security says so:
 *
 *   - read published Knowledge Centre posts   (public_knowledge)
 *   - read published property listings         (properties, published = true)
 *   - file an enquiry                          (mortgage_loans insert policy)
 *   - register a sign-up as a contact          (register_website_customer)
 *
 * It also fronts the CRM's Supabase Auth for website accounts (sign-up,
 * sign-in, refresh, sign-out). Those calls act as the account holder only.
 *
 * It cannot read a client case, a staff record, another customer, or a draft
 * post. That is deliberate: a compromise of this deployment must not become a
 * compromise of the firm's client files. No service_role key is used here and
 * none should be added.
 *
 * No new dependency: PostgREST is HTTP, and `fetch` is enough.
 */

export type KnowledgePost = {
  slug: string;
  title: string;
  excerpt: string | null;
  body: string | null;
  cover_image_url: string | null;
  tags: string[];
  published_at: string | null;
  author_name: string | null;
  // Set when the post is an event; null for an ordinary article.
  event_starts_at: string | null;
  event_location: string | null;
  cta_url: string | null;
  cta_label: string | null;
};

export type CrmProperty = {
  slug: string;
  title: string;
  summary: string | null;
  description: string | null;
  location: string | null;
  city: string | null;
  state: string | null;
  price: number | null;
  currency: string;
  bedrooms: number | null;
  bathrooms: number | null;
  property_type: string | null;
  images: unknown;
  features: unknown;
};

const PROPERTY_COLUMNS =
  "slug,title,summary,description,location,city,state,price,currency,bedrooms,bathrooms,property_type,images,features";

export type LeadInput = {
  fullName: string;
  email: string;
  phone?: string;
  loanAmount?: number;
  /** Anything else the form collected. Shown to the advisor who picks it up. */
  details?: Record<string, unknown>;
};

export class CrmUnconfiguredError extends Error {
  constructor() {
    super("The AXP CRM connection is not configured.");
    this.name = "CrmUnconfiguredError";
  }
}

export class CrmRequestError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.name = "CrmRequestError";
    this.status = status;
  }
}

export function isCrmConfigured() {
  return Boolean(env.AXP_CRM_URL && env.AXP_CRM_ANON_KEY);
}

async function crmFetch(path: string, init: RequestInit = {}) {
  if (!isCrmConfigured()) {
    throw new CrmUnconfiguredError();
  }

  const response = await fetch(`${env.AXP_CRM_URL.replace(/\/+$/, "")}${path}`, {
    ...init,
    headers: {
      apikey: env.AXP_CRM_ANON_KEY,
      Authorization: `Bearer ${env.AXP_CRM_ANON_KEY}`,
      "Content-Type": "application/json",
      ...(init.headers ?? {})
    }
  });

  if (!response.ok) {
    // The CRM's message is the useful part -- it is usually row-level security
    // saying precisely what was refused -- but it is for the server log, not
    // for a visitor. The route decides what the visitor is told.
    const body = await response.text().catch(() => "");
    throw new CrmRequestError(body || response.statusText, response.status);
  }

  return response;
}

/** Published Knowledge Centre posts, newest first. */
export async function listKnowledge(): Promise<KnowledgePost[]> {
  const response = await crmFetch("/rest/v1/rpc/public_knowledge", {
    method: "POST",
    body: "{}"
  });
  const rows = (await response.json()) as KnowledgePost[];
  return Array.isArray(rows) ? rows : [];
}

/**
 * Published property listings, in the order the CRM's website admin set.
 *
 * A direct table read, not an RPC -- unlike Knowledge Centre posts, the CRM's
 * row-level security already restricts this table to published=true for
 * anyone without a staff session, so there is nothing an RPC would add here.
 */
export async function listProperties(): Promise<CrmProperty[]> {
  const response = await crmFetch(
    `/rest/v1/properties?select=${PROPERTY_COLUMNS}&published=eq.true&order=sort_order.asc,created_at.desc`
  );
  const rows = (await response.json()) as CrmProperty[];
  return Array.isArray(rows) ? rows : [];
}

/**
 * One published listing by slug, or null if it does not exist or is not
 * published. Never falls back to a different listing -- an old or mistyped
 * slug must read as "not found", not as whichever property happens to load
 * first.
 */
export async function getProperty(slug: string): Promise<CrmProperty | null> {
  const response = await crmFetch(
    `/rest/v1/properties?select=${PROPERTY_COLUMNS}&slug=eq.${encodeURIComponent(slug)}&published=eq.true&limit=1`
  );
  const rows = (await response.json()) as CrmProperty[];
  return rows[0] ?? null;
}

/**
 * File an enquiry into the CRM's lead queue.
 *
 * The three pinned fields are not decoration: the CRM's insert policy refuses
 * anything else. `customer_id` must be null -- an anonymous submission may not
 * attribute itself to somebody's account.
 *
 * Note there is deliberately no `select` on this insert: asking PostgREST to
 * return the row turns it into INSERT .. RETURNING, which needs read rights the
 * public does not have, and the whole call fails with the row never written.
 */
export type TrackEventInput = {
  eventType: "page_view" | "click" | "enquiry_submitted" | "signup_completed";
  sessionId: string;
  path?: string;
  label?: string;
  targetSlug?: string;
  referrer?: string;
  deviceType?: "mobile" | "tablet" | "desktop";
};

/**
 * Record one piece of website activity. `callerAccessToken`, when present, is
 * the signed-in visitor's own token -- forwarded so the CRM's
 * track_website_event() sees their real auth.uid() and can attribute the
 * event to their account. Without it, the call carries only the anon key, and
 * the CRM records no identity at all. Never send a customer_id or user id
 * here directly: the CRM derives identity itself from the token, exactly
 * like every other authenticated call this service makes.
 */
export async function trackEvent(input: TrackEventInput, callerAccessToken?: string): Promise<void> {
  await crmFetch("/rest/v1/rpc/track_website_event", {
    method: "POST",
    headers: callerAccessToken ? { Authorization: `Bearer ${callerAccessToken}` } : {},
    body: JSON.stringify({
      p_event_type: input.eventType,
      p_session_id: input.sessionId,
      p_path: input.path ?? null,
      p_label: input.label ?? null,
      p_target_slug: input.targetSlug ?? null,
      p_referrer: input.referrer ?? null,
      p_device_type: input.deviceType ?? null
    })
  });
}

export async function createLead(input: LeadInput): Promise<void> {
  await crmFetch("/rest/v1/mortgage_loans", {
    method: "POST",
    body: JSON.stringify([
      {
        client_name: input.fullName,
        client_email: input.email,
        client_phone: input.phone ?? null,
        loan_amount: Number.isFinite(input.loanAmount) ? input.loanAmount : 0,
        status: "Pipeline",
        source: "website",
        customer_id: null,
        payload: input.details ?? {}
      }
    ])
  });
}

/**
 * Record a website sign-up as a CRM contact.
 *
 * Takes the same unverified name and email any enquiry does -- the RPC only
 * ever creates or updates a contact card, it grants nothing.
 */
export async function registerCustomer(input: {
  email: string;
  fullName?: string;
  phone?: string;
}): Promise<void> {
  await crmFetch("/rest/v1/rpc/register_website_customer", {
    method: "POST",
    body: JSON.stringify({
      p_email: input.email,
      p_full_name: input.fullName ?? "",
      p_phone: input.phone ?? null
    })
  });
}

/* ------------------------------------------------------------------------ */
/* Website accounts: the CRM's Supabase Auth (GoTrue), proxied so the key    */
/* never reaches the browser.                                                */
/* ------------------------------------------------------------------------ */

export type AccountUser = {
  id: string;
  email: string;
  name: string;
};

export type AccountSession = {
  accessToken: string;
  refreshToken: string;
  /** Unix seconds. */
  expiresAt: number;
  user: AccountUser;
};

type GoTrueUser = {
  id: string;
  email?: string;
  user_metadata?: { full_name?: string };
};

type GoTrueSession = {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  expires_at?: number;
  user: GoTrueUser;
};

function toAccountUser(user: GoTrueUser): AccountUser {
  return { id: user.id, email: user.email ?? "", name: user.user_metadata?.full_name ?? "" };
}

function toAccountSession(session: GoTrueSession): AccountSession {
  return {
    accessToken: session.access_token,
    refreshToken: session.refresh_token,
    expiresAt: session.expires_at ?? Math.floor(Date.now() / 1000) + session.expires_in,
    user: toAccountUser(session.user)
  };
}

/**
 * GoTrue's machine-readable reason for a refusal, e.g. "invalid_credentials"
 * or "email_not_confirmed". Older GoTrue versions put it in `error`.
 */
export function authErrorCode(error: unknown): string | null {
  if (!(error instanceof CrmRequestError)) return null;
  try {
    const body = JSON.parse(error.message) as { error_code?: string; error?: string };
    return body.error_code ?? body.error ?? null;
  } catch {
    return null;
  }
}

/**
 * Create an account. The CRM requires email confirmation, so this normally
 * returns `null` and the person signs in after clicking the emailed link, which
 * lands on `redirectTo`. Returns a session only if confirmation is switched off.
 */
export async function signUpAccount(input: {
  email: string;
  password: string;
  fullName: string;
  redirectTo: string;
}): Promise<AccountSession | null> {
  const response = await crmFetch(`/auth/v1/signup?redirect_to=${encodeURIComponent(input.redirectTo)}`, {
    method: "POST",
    body: JSON.stringify({
      email: input.email,
      password: input.password,
      data: { full_name: input.fullName }
    })
  });
  const body = (await response.json()) as Partial<GoTrueSession>;
  return body.access_token ? toAccountSession(body as GoTrueSession) : null;
}

export async function signInAccount(email: string, password: string): Promise<AccountSession> {
  const response = await crmFetch("/auth/v1/token?grant_type=password", {
    method: "POST",
    body: JSON.stringify({ email, password })
  });
  return toAccountSession((await response.json()) as GoTrueSession);
}

export async function refreshAccountSession(refreshToken: string): Promise<AccountSession> {
  const response = await crmFetch("/auth/v1/token?grant_type=refresh_token", {
    method: "POST",
    body: JSON.stringify({ refresh_token: refreshToken })
  });
  return toAccountSession((await response.json()) as GoTrueSession);
}

export async function getAccountUser(accessToken: string): Promise<AccountUser> {
  const response = await crmFetch("/auth/v1/user", {
    headers: { Authorization: `Bearer ${accessToken}` }
  });
  return toAccountUser((await response.json()) as GoTrueUser);
}

export async function signOutAccount(accessToken: string): Promise<void> {
  await crmFetch("/auth/v1/logout", {
    method: "POST",
    headers: { Authorization: `Bearer ${accessToken}` }
  });
}

export async function resendConfirmation(email: string, redirectTo: string): Promise<void> {
  await crmFetch(`/auth/v1/resend?redirect_to=${encodeURIComponent(redirectTo)}`, {
    method: "POST",
    body: JSON.stringify({ type: "signup", email })
  });
}
