// The two routes the public site depends on, with the AXP CRM unconfigured
// (see _test/setup.ts): the Knowledge Centre degrades to its fallback content,
// and an enquiry is refused honestly rather than silently dropped.

import { describe, expect, it } from "vitest";
import app from "../_core/create-app";

function postLead(body: unknown) {
  return app.fetch(
    new Request("http://localhost/api/leads", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(body)
    })
  );
}

describe("GET /api/knowledge", () => {
  it("answers 200 with no posts when the CRM is unconfigured", async () => {
    const res = await app.fetch(new Request("http://localhost/api/knowledge"));
    expect(res.status).toBe(200);
    expect(await res.json()).toMatchObject({ ok: true, data: { posts: [], source: "unconfigured" } });
  });
});

describe("POST /api/leads", () => {
  it("rejects an enquiry without a valid email", async () => {
    const res = await postLead({ fullName: "Ada", email: "not-an-email" });
    expect(res.status).toBe(400);
    expect(await res.json()).toMatchObject({ ok: false, error: { code: "INVALID_ENQUIRY" } });
  });

  it("quietly accepts a honeypot submission", async () => {
    const res = await postLead({ fullName: "Bot", email: "bot@example.com", website: "x" });
    expect(res.status).toBe(200);
  });

  it("reports 503 when the CRM is unconfigured", async () => {
    const res = await postLead({ fullName: "Ada", email: "ada@example.com" });
    expect(res.status).toBe(503);
    expect(await res.json()).toMatchObject({ ok: false, error: { code: "ENQUIRY_UNAVAILABLE" } });
  });
});

describe("removed scaffold endpoints", () => {
  it.each(["/api/auth/get-session", "/api/me/profile", "/api/todos"])("%s is gone", async (path) => {
    const res = await app.fetch(new Request(`http://localhost${path}`));
    expect(res.status).toBe(404);
  });
});

describe("account routes with the CRM unconfigured", () => {
  it("answers 503 rather than failing obscurely", async () => {
    const res = await app.fetch(
      new Request("http://localhost/api/account/sign-in", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ email: "ada@example.com", password: "password1234" })
      })
    );
    expect(res.status).toBe(503);
    expect(await res.json()).toMatchObject({ error: { code: "ACCOUNTS_UNAVAILABLE" } });
  });
});
