import { createHmac, randomInt, randomUUID, timingSafeEqual } from "node:crypto";
import {
  OTP_LENGTH,
  OTP_MAX_ATTEMPTS,
  OTP_RESEND_COOLDOWN_SECONDS,
  OTP_TTL_SECONDS,
  greetingName,
  resolveLeadSource,
  validateHomeReadyForm,
  type HomeReadyFieldErrors
} from "@repo/shared/homeready";
import type { HomeReadyLeadRow } from "./leads-db";
import type { EmailMessage } from "./sendbyte";
import type { PendingSignup, SignupStore } from "./homeready-store";

/**
 * HomeReady sign-up: register -> email a 6-digit code -> verify -> one row in
 * public.leads. Nothing reaches the leads table before the code is confirmed.
 *
 * Everything outside this file (storage, email, the leads insert, the clock)
 * is passed in, so the flow is tested without a network or a database.
 *
 * Privacy: no name, email, phone or code is ever logged. Rate-limit buckets
 * hold an HMAC of the IP / email / phone, not the value.
 */

export type SignupDeps = {
  store: SignupStore;
  sendEmail: (message: EmailMessage) => Promise<void>;
  insertLead: (row: HomeReadyLeadRow) => Promise<void>;
  /** From PRIVACY_NOTICE; null means registration is closed. */
  privacyNotice: { version: string; url: string } | null;
  secret: string;
  now?: () => Date;
  /** Overridable so tests can know the code. */
  generateCode?: () => string;
  log?: (message: string) => void;
};

export type Failure = {
  ok: false;
  status: 400 | 429 | 502 | 503;
  code: string;
  message: string;
  fields?: HomeReadyFieldErrors;
  retryAfterSeconds?: number;
};
export type Result<T> = { ok: true; data: T } | Failure;

/** Per-hour limits. A "send" is any email carrying a code. */
export const RATE_LIMITS = {
  registerPerIp: 10,
  sendsPerEmail: 5,
  registerPerPhone: 5,
  verifyPerIp: 30,
  resendPerIp: 10
} as const;
const HOUR = 60 * 60;

const fail = (
  status: Failure["status"],
  code: string,
  message: string,
  extra: Partial<Failure> = {}
): Failure => ({ ok: false, status, code, message, ...extra });

const RATE_LIMITED = () =>
  fail(429, "RATE_LIMITED", "You've tried that a few times. Please wait a little while and try again.");
const CODE_INVALID = (attemptsLeft?: number) =>
  fail(
    400,
    "CODE_INVALID",
    attemptsLeft === undefined
      ? "That code isn't right. Please check it and try again."
      : `That code isn't right. You have ${attemptsLeft} ${attemptsLeft === 1 ? "try" : "tries"} left.`
  );
const CODE_EXPIRED = () => fail(400, "CODE_EXPIRED", "That code has expired. Please ask for a new one.");
const CODE_LOCKED = () =>
  fail(400, "CODE_LOCKED", "Too many incorrect tries. Please ask for a new code.");
const SESSION_GONE = () =>
  fail(400, "SIGNUP_NOT_FOUND", "This sign-up has timed out. Please fill in the form again.");
const UNAVAILABLE = () =>
  fail(503, "REGISTRATION_UNAVAILABLE", "Registration isn't open just yet. Please check back soon.");
const SEND_FAILED = () =>
  fail(502, "CODE_SEND_FAILED", "We couldn't send your code just now. Please try again shortly.");
const SAVE_FAILED = () =>
  fail(502, "SIGNUP_SAVE_FAILED", "We couldn't save your details just now. Please try again in a moment.");

function codeEmail(code: string, to: string, idempotencyKey: string): EmailMessage {
  const minutes = OTP_TTL_SECONDS / 60;
  return {
    to,
    subject: `${code} is your HomeReady verification code`,
    text:
      `Your HomeReady verification code is ${code}.\n\n` +
      `It expires in ${minutes} minutes. If you didn't ask for this, you can ignore this email.\n\n` +
      `AXP Africa`,
    html:
      `<p>Your HomeReady verification code is:</p>` +
      `<p style="font-size:28px;font-weight:600;letter-spacing:6px;margin:16px 0">${code}</p>` +
      `<p>It expires in ${minutes} minutes. If you didn't ask for this, you can ignore this email.</p>` +
      `<p>AXP Africa</p>`,
    idempotencyKey,
    tags: ["homeready-otp"]
  };
}

export function createSignupFlow(deps: SignupDeps) {
  const now = deps.now ?? (() => new Date());
  const generateCode = deps.generateCode ?? (() => String(randomInt(0, 10 ** OTP_LENGTH)).padStart(OTP_LENGTH, "0"));
  const log = deps.log ?? ((message: string) => console.error(message));

  const hmac = (value: string) => createHmac("sha256", deps.secret).update(value).digest("hex");
  const hashCode = (pendingId: string, code: string) => hmac(`otp:${pendingId}:${code}`);
  const bucket = (kind: string, value: string) => `${kind}:${hmac(`rate:${kind}:${value}`)}`;

  function codeMatches(pending: PendingSignup, code: string) {
    const expected = Buffer.from(pending.codeHash, "hex");
    const actual = Buffer.from(hashCode(pending.id, code), "hex");
    return expected.length === actual.length && timingSafeEqual(expected, actual);
  }

  async function overLimit(checks: Array<[string, number]>, at: Date) {
    for (const [key, limit] of checks) {
      if ((await deps.store.hit(key, at, HOUR)) > limit) return true;
    }
    return false;
  }

  async function sendCode(pendingId: string, to: string, code: string, sentAt: Date) {
    try {
      // One key per code, so a retried request never sends the same code twice.
      await deps.sendEmail(codeEmail(code, to, `homeready:${pendingId}:${sentAt.getTime()}`));
      return true;
    } catch (error) {
      const detail = error as { code?: unknown; status?: unknown };
      log(`[homeready] code email failed: ${String(detail.code ?? "unknown")} ${String(detail.status ?? "")}`.trim());
      return false;
    }
  }

  /** Step 1: validate, hold the sign-up, email a code. */
  async function register(input: {
    body: unknown;
    ip: string;
  }): Promise<Result<{ pendingId: string; resendAfterSeconds: number; expiresInSeconds: number }>> {
    const body = (typeof input.body === "object" && input.body !== null ? input.body : {}) as Record<string, unknown>;
    const at = now();

    // Honeypot: look exactly like success, store and send nothing.
    if (typeof body.website === "string" && body.website.trim() !== "") {
      return {
        ok: true,
        data: { pendingId: randomUUID(), resendAfterSeconds: OTP_RESEND_COOLDOWN_SECONDS, expiresInSeconds: OTP_TTL_SECONDS }
      };
    }

    const parsed = validateHomeReadyForm(body);
    if (!parsed.ok) {
      const first = Object.values(parsed.errors)[0] ?? "Please check the form.";
      return fail(400, "INVALID_INPUT", first, { fields: parsed.errors });
    }
    if (!deps.privacyNotice) return UNAVAILABLE();

    const lead = parsed.value;
    if (
      await overLimit(
        [
          [bucket("register-ip", input.ip), RATE_LIMITS.registerPerIp],
          [bucket("send-email", lead.email), RATE_LIMITS.sendsPerEmail],
          [bucket("register-phone", lead.phone.replace(/\D/g, "")), RATE_LIMITS.registerPerPhone]
        ],
        at
      )
    ) {
      return RATE_LIMITED();
    }

    await deps.store.purge(at).catch(() => undefined);

    const pendingId = randomUUID();
    const code = generateCode();
    await deps.store.createPending({
      id: pendingId,
      lead: {
        ...lead,
        leadSource: resolveLeadSource({
          utmSource: typeof body.utmSource === "string" ? body.utmSource : null,
          utmCampaign: typeof body.utmCampaign === "string" ? body.utmCampaign : null
        }),
        consentVersion: deps.privacyNotice.version
      },
      codeHash: hashCode(pendingId, code),
      attempts: 0,
      // The consent box was ticked on this submission; this is its time.
      consentAt: at,
      codeSentAt: at,
      expiresAt: new Date(at.getTime() + OTP_TTL_SECONDS * 1000),
      claimedAt: null
    });

    if (!(await sendCode(pendingId, lead.email, code, at))) {
      await deps.store.deletePending(pendingId).catch(() => undefined);
      return SEND_FAILED();
    }

    return {
      ok: true,
      data: { pendingId, resendAfterSeconds: OTP_RESEND_COOLDOWN_SECONDS, expiresInSeconds: OTP_TTL_SECONDS }
    };
  }

  /** Step 2: check the code; on success write the one row to public.leads. */
  async function verify(input: { pendingId: unknown; code: unknown; ip: string }): Promise<Result<{ name: string }>> {
    const at = now();
    if (await overLimit([[bucket("verify-ip", input.ip), RATE_LIMITS.verifyPerIp]], at)) {
      return RATE_LIMITED();
    }

    const code = typeof input.code === "string" ? input.code.replace(/\s/g, "") : "";
    if (!new RegExp(`^\\d{${OTP_LENGTH}}$`).test(code)) {
      return fail(400, "CODE_FORMAT", `Please enter the ${OTP_LENGTH}-digit code from the email.`);
    }

    const pending = typeof input.pendingId === "string" ? await deps.store.getPending(input.pendingId) : null;
    if (!pending) return SESSION_GONE();
    if (pending.claimedAt) {
      // A double-submit of the right code: the first request is writing (or
      // wrote) the lead. Answer the same without writing a second row.
      return codeMatches(pending, code) ? { ok: true, data: { name: greetingName(pending.lead) } } : CODE_INVALID();
    }
    if (pending.attempts >= OTP_MAX_ATTEMPTS) return CODE_LOCKED();
    if (at.getTime() >= pending.expiresAt.getTime()) return CODE_EXPIRED();

    if (!codeMatches(pending, code)) {
      const attempts = await deps.store.recordWrongAttempt(pending.id);
      return attempts >= OTP_MAX_ATTEMPTS ? CODE_LOCKED() : CODE_INVALID(OTP_MAX_ATTEMPTS - attempts);
    }

    if (!(await deps.store.claim(pending.id, at))) {
      return { ok: true, data: { name: greetingName(pending.lead) } };
    }

    const { lead } = pending;
    try {
      await deps.insertLead({
        legalName: lead.legalName,
        preferredName: lead.preferredName,
        email: lead.email,
        phone: lead.phone,
        applicationType: lead.applicationType,
        leadSource: lead.leadSource,
        consentVersion: lead.consentVersion,
        consentAt: new Date(pending.consentAt),
        verificationMethod: "OTP",
        verifiedAt: at
      });
    } catch (error) {
      log(`[homeready] lead insert failed: ${String((error as { code?: unknown }).code ?? "unknown")}`);
      await deps.store.release(pending.id).catch(() => undefined);
      return SAVE_FAILED();
    }

    // The lead is written; the personal data has no reason to stay here.
    await deps.store.deletePending(pending.id).catch(() => undefined);
    return { ok: true, data: { name: greetingName(lead) } };
  }

  /** Send a fresh code (at most once a minute); resets the attempt count. */
  async function resend(input: {
    pendingId: unknown;
    ip: string;
  }): Promise<Result<{ resendAfterSeconds: number; expiresInSeconds: number }>> {
    const at = now();
    if (await overLimit([[bucket("resend-ip", input.ip), RATE_LIMITS.resendPerIp]], at)) {
      return RATE_LIMITED();
    }

    const pending = typeof input.pendingId === "string" ? await deps.store.getPending(input.pendingId) : null;
    if (!pending || pending.claimedAt) return SESSION_GONE();

    const readyAt = pending.codeSentAt.getTime() + OTP_RESEND_COOLDOWN_SECONDS * 1000;
    if (at.getTime() < readyAt) {
      const retryAfterSeconds = Math.ceil((readyAt - at.getTime()) / 1000);
      return fail(429, "RESEND_COOLDOWN", `Please wait ${retryAfterSeconds} seconds before asking for another code.`, {
        retryAfterSeconds
      });
    }

    if (await overLimit([[bucket("send-email", pending.lead.email), RATE_LIMITS.sendsPerEmail]], at)) {
      return RATE_LIMITED();
    }

    const code = generateCode();
    const replaced = await deps.store.replaceCode(
      pending.id,
      {
        codeHash: hashCode(pending.id, code),
        codeSentAt: at,
        expiresAt: new Date(at.getTime() + OTP_TTL_SECONDS * 1000)
      },
      // Only if nobody else has resent since we read it.
      pending.codeSentAt
    );
    if (!replaced) {
      return fail(429, "RESEND_COOLDOWN", "A new code is already on its way.", {
        retryAfterSeconds: OTP_RESEND_COOLDOWN_SECONDS
      });
    }

    if (!(await sendCode(pending.id, pending.lead.email, code, at))) return SEND_FAILED();
    return { ok: true, data: { resendAfterSeconds: OTP_RESEND_COOLDOWN_SECONDS, expiresInSeconds: OTP_TTL_SECONDS } };
  }

  return { register, verify, resend };
}

export type SignupFlow = ReturnType<typeof createSignupFlow>;
