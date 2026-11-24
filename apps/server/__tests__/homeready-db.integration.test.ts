// The real SQL, against a disposable Postgres.
//
// Builds the leads contract (fixtures/leads-contract.sql: table, migration,
// view, RLS, the INSERT-only `leads_website` role) and the website's own
// storage (docs/homeready-website-otp.sql) in a throwaway database, then runs
// a sign-up through the real Postgres store and insert.
//
// Needs a superuser URL in HOMEREADY_TEST_PG_URL, e.g.
//   docker run --rm -d -p 55432:5432 -e POSTGRES_HOST_AUTH_METHOD=trust postgres:16
//   HOMEREADY_TEST_PG_URL=postgres://postgres@127.0.0.1:55432/postgres pnpm test
// Skipped when it is not set, so `pnpm test` works without Docker.

import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { randomUUID } from "node:crypto";
import pg from "pg";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { insertHomeReadyLead, LeadsDbError, type HomeReadyLeadRow } from "../services/leads-db";
import { createPgSignupStore } from "../services/homeready-store";
import { createSignupFlow } from "../services/homeready-signup";
import { poolConfig } from "../services/pg";

const adminUrl = process.env.HOMEREADY_TEST_PG_URL ?? "";

const read = (relative: string) => readFileSync(fileURLToPath(new URL(relative, import.meta.url)), "utf8");

describe.skipIf(!adminUrl)("leads database (Postgres)", () => {
  const suffix = randomUUID().replace(/-/g, "").slice(0, 10);
  const dbName = `homeready_it_${suffix}`;
  const leadsRole = `leads_website_${suffix}`;
  const storeRole = `leads_website_otp_${suffix}`;
  const password = `pw_${suffix}`;

  let admin: pg.Pool; // superuser, in the throwaway database
  let asWebsite: pg.Pool; // leads_website: INSERT on public.leads only
  let asStore: pg.Pool; // leads_website_otp: website_otp schema only

  const urlFor = (user: string | null, database: string) => {
    const url = new URL(adminUrl);
    if (user) {
      url.username = user;
      url.password = password;
    }
    url.pathname = `/${database}`;
    return url.toString();
  };
  const pool = (url: string) => new pg.Pool(poolConfig(url, ""));

  beforeAll(async () => {
    const server = pool(adminUrl);
    await server.query(`create database ${dbName}`);
    await server.end();

    admin = pool(urlFor(null, dbName));
    // Longer name first: "leads_website" is a prefix of "leads_website_otp".
    const otpSql = read("../../../docs/homeready-website-otp.sql")
      .replaceAll("leads_website_otp", storeRole)
      .replaceAll("<secret>", password);
    const contractSql = read("./fixtures/leads-contract.sql")
      .replaceAll("leads_website", leadsRole)
      .replaceAll("<secret>", password);
    await admin.query(contractSql);
    await admin.query(otpSql);

    asWebsite = pool(urlFor(leadsRole, dbName));
    asStore = pool(urlFor(storeRole, dbName));
  });

  afterAll(async () => {
    await asWebsite?.end();
    await asStore?.end();
    await admin?.end();
    const server = pool(adminUrl);
    await server.query(`drop database if exists ${dbName} with (force)`);
    await server.query(`drop role if exists ${leadsRole}`);
    await server.query(`drop role if exists ${storeRole}`);
    await server.end();
  });

  const row = (patch: Partial<HomeReadyLeadRow> = {}): HomeReadyLeadRow => ({
    legalName: "Adaeze Obi",
    preferredName: "Ada",
    email: "ada@example.com",
    phone: "+234 803 123 4567",
    applicationType: "Joint",
    leadSource: "Instagram",
    consentVersion: "PN-TEST-01",
    consentAt: new Date("2026-11-24T10:00:00Z"),
    verificationMethod: "OTP",
    verifiedAt: new Date("2026-11-24T10:01:30Z"),
    ...patch
  });

  const count = async () => Number((await admin.query("select count(*) as n from public.leads")).rows[0].n);
  const errorCode = async (promise: Promise<unknown>) => {
    try {
      await promise;
      return "no error";
    } catch (error) {
      return (error as { code?: string }).code;
    }
  };

  it("a verified sign-up through the real store writes exactly one row, visible in homeready_leads", async () => {
    await admin.query("truncate public.leads");
    let code = "";
    let clock = new Date("2026-11-24T10:00:00Z");
    const flow = createSignupFlow({
      store: createPgSignupStore(asStore),
      sendEmail: async (message) => {
        code = /\b(\d{6})\b/.exec(message.text)![1];
      },
      insertLead: (r) => insertHomeReadyLead(r, asWebsite),
      privacyNotice: { version: "PN-TEST-01", url: "https://example.test/privacy" },
      secret: "integration-secret",
      now: () => new Date(clock)
    });

    const registered = await flow.register({
      body: {
        legalName: "  Adaeze   Obi ",
        preferredName: "",
        email: "ADA@example.com",
        phone: " 0803 123 4567 ",
        applicationType: "Business",
        consent: true,
        utmSource: "instagram"
      },
      ip: "203.0.113.7"
    });
    expect(registered.ok).toBe(true);
    const pendingId = registered.ok ? registered.data.pendingId : "";
    expect(await count()).toBe(0); // nothing before verification

    clock = new Date("2026-11-24T10:02:00Z");
    expect((await flow.verify({ pendingId, code: code === "000000" ? "000001" : "000000", ip: "203.0.113.7" })).ok).toBe(false);
    expect(await count()).toBe(0);

    const verified = await flow.verify({ pendingId, code, ip: "203.0.113.7" });
    expect(verified).toEqual({ ok: true, data: { name: "Adaeze" } });
    // A repeat of the same request does not write again.
    await flow.verify({ pendingId, code, ip: "203.0.113.7" });

    const { rows } = await admin.query("select * from public.homeready_leads");
    expect(rows).toHaveLength(1);
    expect(rows[0]).toMatchObject({
      legal_name: "Adaeze Obi",
      preferred_name: null,
      email: "ada@example.com",
      phone: "0803 123 4567",
      application_type: "Business",
      lead_source: "Instagram",
      consent_version: "PN-TEST-01",
      consent_at: new Date("2026-11-24T10:00:00Z"),
      verification_method: "OTP",
      verified_at: new Date("2026-11-24T10:02:00Z")
    });
    expect(rows[0].lead_id).toMatch(/^\d+$/);
    expect(rows[0].created_at).toBeInstanceOf(Date);

    // The pending sign-up (and its personal data) is gone.
    expect((await admin.query("select count(*) as n from website_otp.pending_signups")).rows[0].n).toBe("0");
  });

  it("the insert sends no RETURNING and works as the INSERT-only role", async () => {
    await admin.query("truncate public.leads");
    await insertHomeReadyLead(row(), asWebsite);
    expect(await count()).toBe(1);
  });

  it("the website role cannot SELECT, UPDATE or DELETE leads, or read the view", async () => {
    await admin.query("truncate public.leads");
    await insertHomeReadyLead(row(), asWebsite);
    expect(await errorCode(asWebsite.query("select * from public.leads"))).toBe("42501");
    expect(await errorCode(asWebsite.query("select * from public.homeready_leads"))).toBe("42501");
    expect(await errorCode(asWebsite.query(`update public.leads set "legalName" = 'x'`))).toBe("42501");
    expect(await errorCode(asWebsite.query("delete from public.leads"))).toBe("42501");
    expect(
      await errorCode(asWebsite.query(`insert into public.leads ("legalName", email) values ('a', 'b') returning lead_id`))
    ).toBe("42501");
    expect(await count()).toBe(1);
  });

  it("rejects an applicationType outside Individual / Joint / Business", async () => {
    for (const applicationType of ["individual", "Company", "JOINT"]) {
      const error = await insertHomeReadyLead(row({ applicationType: applicationType as never }), asWebsite).catch(
        (e: unknown) => e
      );
      expect(error).toBeInstanceOf(LeadsDbError);
      expect((error as LeadsDbError).code).toBe("23514");
      // Only the code travels: no value from the row is in the error.
      expect((error as Error).message).not.toContain(applicationType);
    }
  });

  it("rejects a verificationMethod other than OTP / Secure link", async () => {
    const error = await insertHomeReadyLead(row({ verificationMethod: "SMS" as never }), asWebsite).catch((e: unknown) => e);
    expect((error as LeadsDbError).code).toBe("23514");
  });

  it("the store role cannot touch public.leads", async () => {
    expect(await errorCode(asStore.query("select * from public.leads"))).toBe("42501");
    expect(await errorCode(asStore.query(`insert into public.leads ("legalName", email) values ('a', 'b')`))).toBe("42501");
  });
});
