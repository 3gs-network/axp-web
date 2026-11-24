// The HomeReady code flow end to end through /api/homeready/*, with an
// in-memory store, a fake clock, a fake mailer and a fake leads insert -- so
// it runs without a network or a database. The real SQL is covered by
// homeready-db.integration.test.ts.

import { beforeEach, describe, expect, it, vi } from "vitest";
import { createHomeReadyRouter } from "../routes/homeready.route";
import { createSignupFlow, RATE_LIMITS } from "../services/homeready-signup";
import { createMemorySignupStore } from "../services/homeready-store";
import type { HomeReadyLeadRow } from "../services/leads-db";
import type { EmailMessage } from "../services/sendbyte";

const form = {
  legalName: "  Adaeze   Obi ",
  preferredName: "Ada",
  email: "Ada@Example.com",
  phone: "+234 803 123 4567",
  applicationType: "Joint",
  consent: true,
  website: "",
  utmSource: "instagram"
};

const NOTICE = { version: "PN-TEST-01", url: "https://example.test/privacy" };

let clock: Date;
let store: ReturnType<typeof createMemorySignupStore>;
let sent: EmailMessage[];
let inserted: HomeReadyLeadRow[];
let insertLead: ReturnType<typeof vi.fn>;
let sendEmail: ReturnType<typeof vi.fn>;
let logs: string[];
let codes: string[];
let app: ReturnType<typeof createHomeReadyRouter>;

function build(privacyNotice: typeof NOTICE | null = NOTICE) {
  const flow = createSignupFlow({
    store,
    sendEmail: sendEmail as unknown as (m: EmailMessage) => Promise<void>,
    insertLead: insertLead as unknown as (r: HomeReadyLeadRow) => Promise<void>,
    privacyNotice,
    secret: "test-secret",
    now: () => new Date(clock),
    generateCode: () => codes.shift() ?? "000000",
    log: (m) => logs.push(m)
  });
  app = createHomeReadyRouter(() => flow);
}

beforeEach(() => {
  clock = new Date("2026-11-24T10:00:00Z");
  store = createMemorySignupStore();
  sent = [];
  inserted = [];
  logs = [];
  codes = ["123456", "654321", "111111", "222222", "333333", "444444"];
  sendEmail = vi.fn(async (m: EmailMessage) => {
    sent.push(m);
  });
  insertLead = vi.fn(async (r: HomeReadyLeadRow) => {
    inserted.push(r);
  });
  build();
});

const tick = (seconds: number) => {
  clock = new Date(clock.getTime() + seconds * 1000);
};

async function post(path: string, body: unknown, ip = "203.0.113.7") {
  const response = await app.fetch(
    new Request(`https://www.axpafrica.com${path}`, {
      method: "POST",
      headers: { "content-type": "application/json", "x-forwarded-for": ip },
      body: JSON.stringify(body)
    })
  );
  return { status: response.status, body: (await response.json()) as any };
}

async function register(body: unknown = form, ip?: string) {
  const res = await post("/register", body, ip);
  return { ...res, pendingId: res.body?.data?.pendingId as string };
}

describe("register", () => {
  it("validates, holds the sign-up and emails a 6-digit code, writing nothing to leads", async () => {
    const res = await register();
    expect(res.status).toBe(200);
    expect(res.body).toEqual({
      ok: true,
      data: { pendingId: expect.any(String), resendAfterSeconds: 60, expiresInSeconds: 600 }
    });
    expect(sent).toHaveLength(1);
    expect(sent[0].to).toBe("ada@example.com");
    expect(sent[0].text).toContain("123456");
    expect(insertLead).not.toHaveBeenCalled();

    const pending = store.pending.get(res.pendingId)!;
    expect(pending.codeHash).not.toContain("123456");
    expect(JSON.stringify(pending)).not.toContain("123456");
  });

  it("returns field errors and sends nothing for an invalid form", async () => {
    const res = await register({ ...form, phone: "0803", applicationType: "joint", consent: false });
    expect(res.status).toBe(400);
    expect(res.body.ok).toBe(false);
    expect(res.body.error.code).toBe("INVALID_INPUT");
    expect(Object.keys(res.body.error.fields).sort()).toEqual(["applicationType", "consent", "phone"]);
    expect(sendEmail).not.toHaveBeenCalled();
    expect(store.pending.size).toBe(0);
  });

  it("looks successful to a bot that fills the honeypot, but stores and sends nothing", async () => {
    const res = await register({ ...form, website: "http://spam.example" });
    expect(res.status).toBe(200);
    expect(res.body.ok).toBe(true);
    expect(sendEmail).not.toHaveBeenCalled();
    expect(store.pending.size).toBe(0);

    const verify = await post("/verify", { pendingId: res.pendingId, code: "123456" });
    expect(verify.body.ok).toBe(false);
    expect(insertLead).not.toHaveBeenCalled();
  });

  it("refuses while the privacy notice is not set", async () => {
    build(null);
    const res = await register();
    expect(res.status).toBe(503);
    expect(res.body.error.code).toBe("REGISTRATION_UNAVAILABLE");
    expect(sendEmail).not.toHaveBeenCalled();
  });

  it("drops the pending sign-up and says so if the email cannot be sent", async () => {
    sendEmail.mockRejectedValueOnce(Object.assign(new Error("Mailbox ada@example.com refused"), { code: "invalid_to", status: 422 }));
    const res = await register();
    expect(res.status).toBe(502);
    expect(res.body.error.code).toBe("CODE_SEND_FAILED");
    expect(store.pending.size).toBe(0);
    expect(logs.join("\n")).not.toContain("ada@example.com");
  });

  it("rate-limits by IP", async () => {
    for (let i = 0; i < RATE_LIMITS.registerPerIp; i += 1) {
      const res = await register({ ...form, email: `person${i}@example.com`, phone: `0803 123 45${String(i).padStart(2, "0")}` });
      expect(res.status).toBe(200);
    }
    const res = await register({ ...form, email: "another@example.com", phone: "0803 999 0000" });
    expect(res.status).toBe(429);
    expect(res.body.error.code).toBe("RATE_LIMITED");
  });

  it("rate-limits by email, across IPs", async () => {
    for (let i = 0; i < RATE_LIMITS.sendsPerEmail; i += 1) {
      expect((await register({ ...form, phone: `0803 123 45${i}0` }, `198.51.100.${i}`)).status).toBe(200);
    }
    expect((await register({ ...form, phone: "0803 999 0000" }, "198.51.100.99")).status).toBe(429);
  });

  it("rate-limits by phone, across IPs and emails", async () => {
    for (let i = 0; i < RATE_LIMITS.registerPerPhone; i += 1) {
      expect((await register({ ...form, email: `p${i}@example.com` }, `198.51.100.${i}`)).status).toBe(200);
    }
    expect((await register({ ...form, email: "p99@example.com" }, "198.51.100.99")).status).toBe(429);
  });

  it("lets the limit lapse after an hour", async () => {
    for (let i = 0; i < RATE_LIMITS.sendsPerEmail; i += 1) await register(form, `198.51.100.${i}`);
    expect((await register(form, "198.51.100.50")).status).toBe(429);
    tick(60 * 60 + 1);
    expect((await register(form, "198.51.100.51")).status).toBe(200);
  });
});

describe("verify", () => {
  it("writes exactly one correct row once the code is confirmed", async () => {
    const { pendingId } = await register();
    const consentAt = new Date(clock);
    tick(90);

    const res = await post("/verify", { pendingId, code: "123456" });
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ ok: true, data: { name: "Ada" } });

    expect(inserted).toEqual([
      {
        legalName: "Adaeze Obi",
        preferredName: "Ada",
        email: "ada@example.com",
        phone: "+234 803 123 4567",
        applicationType: "Joint",
        leadSource: "Instagram",
        consentVersion: "PN-TEST-01",
        consentAt,
        verificationMethod: "OTP",
        verifiedAt: new Date(clock)
      }
    ]);
    // The personal data is gone from the website's store once written.
    expect(store.pending.size).toBe(0);
  });

  it("greets by first name when no preferred name was given", async () => {
    const { pendingId } = await register({ ...form, preferredName: "" });
    const res = await post("/verify", { pendingId, code: "123456" });
    expect(res.body.data.name).toBe("Adaeze");
    expect(inserted[0].preferredName).toBeNull();
  });

  it("defaults the lead source to Website without a known UTM value", async () => {
    const { pendingId } = await register({ ...form, utmSource: "tiktok" });
    await post("/verify", { pendingId, code: "123456" });
    expect(inserted[0].leadSource).toBe("Website");
  });

  it("writes nothing for a wrong code, and counts down the tries", async () => {
    const { pendingId } = await register();
    const res = await post("/verify", { pendingId, code: "000001" });
    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe("CODE_INVALID");
    expect(res.body.error.message).toContain("4 tries left");
    expect(insertLead).not.toHaveBeenCalled();
  });

  it("locks the code after 5 wrong tries, even if the right one follows", async () => {
    const { pendingId } = await register();
    for (let i = 0; i < 4; i += 1) {
      expect((await post("/verify", { pendingId, code: "999999" })).body.error.code).toBe("CODE_INVALID");
    }
    expect((await post("/verify", { pendingId, code: "999999" })).body.error.code).toBe("CODE_LOCKED");
    expect((await post("/verify", { pendingId, code: "123456" })).body.error.code).toBe("CODE_LOCKED");
    expect(insertLead).not.toHaveBeenCalled();
  });

  it("a new code after a lockout works and resets the count", async () => {
    const { pendingId } = await register();
    for (let i = 0; i < 5; i += 1) await post("/verify", { pendingId, code: "999999" });
    tick(61);
    expect((await post("/resend", { pendingId })).status).toBe(200);
    const res = await post("/verify", { pendingId, code: "654321" });
    expect(res.status).toBe(200);
    expect(inserted).toHaveLength(1);
  });

  it("rejects a code after 10 minutes", async () => {
    const { pendingId } = await register();
    tick(10 * 60);
    const res = await post("/verify", { pendingId, code: "123456" });
    expect(res.body.error.code).toBe("CODE_EXPIRED");
    expect(insertLead).not.toHaveBeenCalled();
  });

  it("accepts a code just inside 10 minutes", async () => {
    const { pendingId } = await register();
    tick(10 * 60 - 1);
    expect((await post("/verify", { pendingId, code: "123456" })).status).toBe(200);
  });

  it("does not insert twice when the right code is submitted twice", async () => {
    const { pendingId } = await register();
    const [a, b] = await Promise.all([
      post("/verify", { pendingId, code: "123456" }),
      post("/verify", { pendingId, code: "123456" })
    ]);
    expect(a.body.ok).toBe(true);
    expect(b.body.ok).toBe(true);
    expect(inserted).toHaveLength(1);
  });

  it("keeps the sign-up for a retry when the leads insert fails, logging only the code", async () => {
    insertLead.mockRejectedValueOnce(Object.assign(new Error("Key (email)=(ada@example.com)"), { code: "57P01" }));
    const { pendingId } = await register();

    const failed = await post("/verify", { pendingId, code: "123456" });
    expect(failed.status).toBe(502);
    expect(failed.body.error.code).toBe("SIGNUP_SAVE_FAILED");
    expect(logs).toEqual(["[homeready] lead insert failed: 57P01"]);

    const retried = await post("/verify", { pendingId, code: "123456" });
    expect(retried.status).toBe(200);
    expect(inserted).toHaveLength(1);
  });

  it("rejects a malformed code or unknown sign-up without touching the store", async () => {
    const { pendingId } = await register();
    expect((await post("/verify", { pendingId, code: "12345" })).body.error.code).toBe("CODE_FORMAT");
    expect((await post("/verify", { pendingId, code: "abcdef" })).body.error.code).toBe("CODE_FORMAT");
    expect((await post("/verify", { pendingId: "nope", code: "123456" })).body.error.code).toBe("SIGNUP_NOT_FOUND");
    expect(store.pending.get(pendingId)!.attempts).toBe(0);
  });

  it("rate-limits verification by IP", async () => {
    const { pendingId } = await register();
    for (let i = 0; i < RATE_LIMITS.verifyPerIp; i += 1) {
      await post("/verify", { pendingId: "unknown", code: "123456" }, "192.0.2.1");
    }
    expect((await post("/verify", { pendingId, code: "123456" }, "192.0.2.1")).body.error.code).toBe("RATE_LIMITED");
    expect(insertLead).not.toHaveBeenCalled();
  });
});

describe("resend", () => {
  it("waits 60 seconds between codes", async () => {
    const { pendingId } = await register();
    tick(30);
    const early = await post("/resend", { pendingId });
    expect(early.status).toBe(429);
    expect(early.body.error.code).toBe("RESEND_COOLDOWN");
    expect(early.body.error.retryAfterSeconds).toBe(30);
    expect(sent).toHaveLength(1);

    tick(30);
    const ok = await post("/resend", { pendingId });
    expect(ok.status).toBe(200);
    expect(sent).toHaveLength(2);
    expect(sent[1].text).toContain("654321");

    tick(10);
    expect((await post("/resend", { pendingId })).status).toBe(429);
  });

  it("invalidates the old code and restarts the 10 minutes", async () => {
    const { pendingId } = await register();
    tick(9 * 60);
    await post("/resend", { pendingId });
    expect((await post("/verify", { pendingId, code: "123456" })).body.error.code).toBe("CODE_INVALID");
    tick(9 * 60);
    expect((await post("/verify", { pendingId, code: "654321" })).status).toBe(200);
  });

  it("counts resends towards the per-email limit", async () => {
    const { pendingId } = await register();
    for (let i = 1; i < RATE_LIMITS.sendsPerEmail; i += 1) {
      tick(61);
      expect((await post("/resend", { pendingId }, `198.51.100.${i}`)).status).toBe(200);
    }
    tick(61);
    expect((await post("/resend", { pendingId }, "198.51.100.77")).body.error.code).toBe("RATE_LIMITED");
  });

  it("refuses once the sign-up is finished", async () => {
    const { pendingId } = await register();
    await post("/verify", { pendingId, code: "123456" });
    tick(61);
    expect((await post("/resend", { pendingId })).body.error.code).toBe("SIGNUP_NOT_FOUND");
  });
});

describe("duplicates", () => {
  it("registers the same person twice as two rows, with identical answers", async () => {
    const first = await register();
    const second = await register(form, "198.51.100.200");
    expect(second.status).toBe(first.status);
    expect(Object.keys(second.body.data)).toEqual(Object.keys(first.body.data));

    await post("/verify", { pendingId: first.pendingId, code: "123456" });
    await post("/verify", { pendingId: second.pendingId, code: "654321" });
    expect(inserted).toHaveLength(2);
    expect(inserted[0].email).toBe(inserted[1].email);
  });
});

describe("unconfigured", () => {
  it("answers 503 on every endpoint", async () => {
    const off = createHomeReadyRouter(() => null);
    for (const path of ["/register", "/verify", "/resend"]) {
      const res = await off.fetch(new Request(`https://x.test${path}`, { method: "POST", body: "{}" }));
      expect(res.status).toBe(503);
      expect(((await res.json()) as any).error.code).toBe("REGISTRATION_UNAVAILABLE");
    }
  });

  it("is mounted at /api/homeready and degrades to 503 without env", async () => {
    const appModule = await import("../_core/create-app");
    const res = await appModule.default.fetch(
      new Request("https://www.axpafrica.com/api/homeready/register", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(form)
      })
    );
    expect(res.status).toBe(503);
  });
});
