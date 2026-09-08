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
 *   - file an enquiry                          (mortgage_loans insert policy)
 *   - register a sign-up as a contact          (register_website_customer)
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
};

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
 * Called with the email the SERVER has verified through Better Auth, never one
 * the browser supplied -- otherwise anybody could write anybody's name into the
 * firm's contact list.
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
