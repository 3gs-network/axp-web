// /api/account/* against a mocked CRM (Supabase Auth + PostgREST). The CRM is
// stubbed at the global-fetch boundary, so the route, the service and the error
// mapping all run for real.

import { afterEach, beforeAll, describe, expect, it, vi } from "vitest";

process.env.AXP_CRM_URL = "https://crm.test";
process.env.AXP_CRM_ANON_KEY = "anon-key";

let app: { fetch: (req: Request) => Promise<Response> };

beforeAll(async () => {
  app = (await import("../_core/create-app")).default;
});

afterEach(() => {
  vi.unstubAllGlobals();
});

type Reply = { status: number; body?: unknown };

/** Route each CRM call by path to a canned reply and record what was sent. */
function stubCrm(replies: Record<string, Reply>) {
  const calls: Array<{ path: string; init?: RequestInit }> = [];
  vi.stubGlobal(
    "fetch",
    vi.fn(async (input: string, init?: RequestInit) => {
      const url = new URL(input);
      const path = url.pathname;
      calls.push({ path: `${path}${url.search}`, init });
      const reply = replies[path] ?? { status: 404, body: { message: "unmocked" } };
      return new Response(reply.body === undefined ? null : JSON.stringify(reply.body), { status: reply.status });
    })
  );
  return calls;
}

function call(path: string, init: { body?: unknown; token?: string; method?: string } = {}) {
  const headers = new Headers({ "content-type": "application/json" });
  if (init.token) headers.set("Authorization", `Bearer ${init.token}`);
  return app.fetch(
    new Request(`https://www.axpafrica.com/api/account${path}`, {
      method: init.method ?? (init.body ? "POST" : "GET"),
      headers,
      body: init.body ? JSON.stringify(init.body) : undefined
    })
  );
}

const goTrueSession = {
  access_token: "access-1",
  refresh_token: "refresh-1",
  expires_in: 3600,
  expires_at: 2_000_000_000,
  user: { id: "u1", email: "ada@example.com", user_metadata: { full_name: "Ada Obi" } }
};

describe("POST /api/account/sign-up", () => {
  it("creates the account, records a CRM contact and asks for email confirmation", async () => {
    const calls = stubCrm({
      "/auth/v1/signup": { status: 200, body: { id: "u1", email: "ada@example.com" } },
      "/rest/v1/rpc/register_website_customer": { status: 200, body: null }
    });

    const res = await call("/sign-up", {
      body: { name: "Ada Obi", email: "ada@example.com", password: "password1234", phone: "+234" }
    });

    expect(res.status).toBe(200);
    expect(await res.json()).toMatchObject({ ok: true, data: { status: "confirm_email" } });

    const signup = calls.find((c) => c.path.startsWith("/auth/v1/signup"));
    expect(signup?.path).toContain(`redirect_to=${encodeURIComponent("https://www.axpafrica.com/auth")}`);
    expect(JSON.parse(String(signup?.init?.body))).toEqual({
      email: "ada@example.com",
      password: "password1234",
      data: { full_name: "Ada Obi" }
    });

    const contact = calls.find((c) => c.path === "/rest/v1/rpc/register_website_customer");
    expect(JSON.parse(String(contact?.init?.body))).toEqual({
      p_email: "ada@example.com",
      p_full_name: "Ada Obi",
      p_phone: "+234"
    });
  });

  it("still succeeds when recording the CRM contact fails", async () => {
    vi.spyOn(console, "error").mockImplementation(() => undefined);
    stubCrm({
      "/auth/v1/signup": { status: 200, body: { id: "u1" } },
      "/rest/v1/rpc/register_website_customer": { status: 500, body: { message: "boom" } }
    });

    const res = await call("/sign-up", { body: { name: "Ada", email: "ada@example.com", password: "password1234" } });
    expect(res.status).toBe(200);
  });

  it("rejects a short password before calling the CRM", async () => {
    const calls = stubCrm({});
    const res = await call("/sign-up", { body: { name: "Ada", email: "ada@example.com", password: "short" } });
    expect(res.status).toBe(400);
    expect(calls).toHaveLength(0);
  });
});

describe("POST /api/account/sign-in", () => {
  it("returns the session in the site's shape", async () => {
    stubCrm({ "/auth/v1/token": { status: 200, body: goTrueSession } });

    const res = await call("/sign-in", { body: { email: "ada@example.com", password: "password1234" } });
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({
      ok: true,
      data: {
        session: {
          accessToken: "access-1",
          refreshToken: "refresh-1",
          expiresAt: 2_000_000_000,
          user: { id: "u1", email: "ada@example.com", name: "Ada Obi" }
        }
      }
    });
  });

  it("maps wrong credentials to 401 INVALID_CREDENTIALS", async () => {
    stubCrm({ "/auth/v1/token": { status: 400, body: { error_code: "invalid_credentials", msg: "Invalid login credentials" } } });
    const res = await call("/sign-in", { body: { email: "ada@example.com", password: "nope" } });
    expect(res.status).toBe(401);
    expect(await res.json()).toMatchObject({ error: { code: "INVALID_CREDENTIALS" } });
  });

  it("maps an unconfirmed email to 403 EMAIL_NOT_CONFIRMED", async () => {
    stubCrm({ "/auth/v1/token": { status: 400, body: { error_code: "email_not_confirmed" } } });
    const res = await call("/sign-in", { body: { email: "ada@example.com", password: "password1234" } });
    expect(res.status).toBe(403);
    expect(await res.json()).toMatchObject({ error: { code: "EMAIL_NOT_CONFIRMED" } });
  });
});

describe("GET /api/account/me", () => {
  it("returns 401 without a token", async () => {
    stubCrm({});
    expect((await call("/me")).status).toBe(401);
  });

  it("returns 401 when the CRM rejects the token", async () => {
    stubCrm({ "/auth/v1/user": { status: 403, body: { error_code: "bad_jwt" } } });
    expect((await call("/me", { token: "stale" })).status).toBe(401);
  });

  it("passes the visitor's token, not the anon key, to the CRM", async () => {
    const calls = stubCrm({ "/auth/v1/user": { status: 200, body: goTrueSession.user } });
    const res = await call("/me", { token: "access-1" });
    expect(res.status).toBe(200);
    expect(new Headers(calls[0].init?.headers).get("Authorization")).toBe("Bearer access-1");
  });

  it("answers 503, not 401, when the CRM is down", async () => {
    vi.spyOn(console, "error").mockImplementation(() => undefined);
    stubCrm({ "/auth/v1/user": { status: 502, body: {} } });
    expect((await call("/me", { token: "access-1" })).status).toBe(503);
  });
});

describe("POST /api/account/refresh", () => {
  it("maps a refused refresh token to 401 SESSION_EXPIRED", async () => {
    stubCrm({ "/auth/v1/token": { status: 400, body: { error_code: "refresh_token_not_found" } } });
    const res = await call("/refresh", { body: { refreshToken: "old" } });
    expect(res.status).toBe(401);
    expect(await res.json()).toMatchObject({ error: { code: "SESSION_EXPIRED" } });
  });
});

describe("POST /api/account/resend-confirmation", () => {
  it("answers the same whether or not the CRM accepted it", async () => {
    vi.spyOn(console, "error").mockImplementation(() => undefined);
    stubCrm({ "/auth/v1/resend": { status: 400, body: { error_code: "user_not_found" } } });
    const res = await call("/resend-confirmation", { body: { email: "nobody@example.com" } });
    expect(res.status).toBe(200);
  });
});
