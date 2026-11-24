import type pg from "pg";
import type { HomeReadyLeadInput } from "@repo/shared/homeready";
import { env } from "../_core/env";
import { getPool } from "./pg";

/**
 * The website's own storage for HomeReady sign-ups that are waiting for their
 * one-time code, plus the rate-limit counters. It lives in the `website_otp`
 * schema of the leads database, reached as the `leads_website_otp` role -- never in
 * public.leads, which only ever receives finished, verified sign-ups.
 *
 * The SQL that creates it is in docs/homeready-website-otp.sql.
 *
 * Every time comes from the caller's clock, not the database's, so the flow
 * behaves identically against Postgres and the in-memory store used in tests.
 */

export type PendingLead = HomeReadyLeadInput & { leadSource: string; consentVersion: string };

export type PendingSignup = {
  id: string;
  lead: PendingLead;
  /** HMAC of the code; the code itself is never stored. */
  codeHash: string;
  attempts: number;
  consentAt: Date;
  codeSentAt: Date;
  expiresAt: Date;
  /** Set while (and after) the verified lead is written, so it is written once. */
  claimedAt: Date | null;
};

export interface SignupStore {
  createPending(pending: PendingSignup): Promise<void>;
  getPending(id: string): Promise<PendingSignup | null>;
  /** Atomically count one wrong code; returns the new total. */
  recordWrongAttempt(id: string): Promise<number>;
  /**
   * Swap in a new code and reset the attempt count, but only if the last code
   * went out at or before `sentBefore` and the sign-up is not claimed. False
   * when another request got there first.
   */
  replaceCode(
    id: string,
    next: { codeHash: string; codeSentAt: Date; expiresAt: Date },
    sentBefore: Date
  ): Promise<boolean>;
  /** Atomically take the sign-up for writing. False if already taken. */
  claim(id: string, now: Date): Promise<boolean>;
  /** Undo a claim after the lead could not be written, so a retry can. */
  release(id: string): Promise<void>;
  deletePending(id: string): Promise<void>;
  /** Record one event in `bucket`; returns how many fall inside the window. */
  hit(bucket: string, now: Date, windowSeconds: number): Promise<number>;
  /** Drop sign-ups long expired and counters past any window. */
  purge(now: Date): Promise<void>;
}

const KEEP_EXPIRED_MS = 60 * 60 * 1000;
const KEEP_RATE_EVENTS_MS = 24 * 60 * 60 * 1000;

/* ------------------------------------------------------------------------ */
/* Postgres                                                                  */
/* ------------------------------------------------------------------------ */

type Row = {
  id: string;
  lead: PendingLead;
  code_hash: string;
  attempts: number;
  consent_at: Date;
  code_sent_at: Date;
  expires_at: Date;
  claimed_at: Date | null;
};

function fromRow(row: Row): PendingSignup {
  return {
    id: row.id,
    lead: row.lead,
    codeHash: row.code_hash,
    attempts: row.attempts,
    consentAt: row.consent_at,
    codeSentAt: row.code_sent_at,
    expiresAt: row.expires_at,
    claimedAt: row.claimed_at
  };
}

type Queryable = Pick<pg.Pool, "query">;

export function isSignupStoreConfigured() {
  return Boolean(env.HOMEREADY_STORE_DB_URL);
}

export function createPgSignupStore(db: Queryable = getPool(env.HOMEREADY_STORE_DB_URL)): SignupStore {
  return {
    async createPending(p) {
      await db.query(
        `insert into website_otp.pending_signups
           (id, lead, code_hash, attempts, consent_at, code_sent_at, expires_at, claimed_at)
         values ($1, $2, $3, $4, $5, $6, $7, $8)`,
        [p.id, JSON.stringify(p.lead), p.codeHash, p.attempts, p.consentAt, p.codeSentAt, p.expiresAt, p.claimedAt]
      );
    },
    async getPending(id) {
      const result = await db.query<Row>(
        `select id, lead, code_hash, attempts, consent_at, code_sent_at, expires_at, claimed_at
           from website_otp.pending_signups where id = $1`,
        [id]
      );
      return result.rows[0] ? fromRow(result.rows[0]) : null;
    },
    async recordWrongAttempt(id) {
      const result = await db.query<{ attempts: number }>(
        `update website_otp.pending_signups set attempts = attempts + 1 where id = $1 returning attempts`,
        [id]
      );
      return result.rows[0]?.attempts ?? Number.POSITIVE_INFINITY;
    },
    async replaceCode(id, next, sentBefore) {
      const result = await db.query(
        `update website_otp.pending_signups
            set code_hash = $2, code_sent_at = $3, expires_at = $4, attempts = 0
          where id = $1 and claimed_at is null and code_sent_at <= $5`,
        [id, next.codeHash, next.codeSentAt, next.expiresAt, sentBefore]
      );
      return result.rowCount === 1;
    },
    async claim(id, now) {
      const result = await db.query(
        `update website_otp.pending_signups set claimed_at = $2 where id = $1 and claimed_at is null`,
        [id, now]
      );
      return result.rowCount === 1;
    },
    async release(id) {
      await db.query(`update website_otp.pending_signups set claimed_at = null where id = $1`, [id]);
    },
    async deletePending(id) {
      await db.query(`delete from website_otp.pending_signups where id = $1`, [id]);
    },
    async hit(bucket, now, windowSeconds) {
      await db.query(`insert into website_otp.rate_events (bucket, at) values ($1, $2)`, [bucket, now]);
      const result = await db.query<{ n: string }>(
        `select count(*) as n from website_otp.rate_events where bucket = $1 and at > $2`,
        [bucket, new Date(now.getTime() - windowSeconds * 1000)]
      );
      return Number(result.rows[0]?.n ?? 0);
    },
    async purge(now) {
      await db.query(`delete from website_otp.pending_signups where expires_at < $1`, [
        new Date(now.getTime() - KEEP_EXPIRED_MS)
      ]);
      await db.query(`delete from website_otp.rate_events where at < $1`, [
        new Date(now.getTime() - KEEP_RATE_EVENTS_MS)
      ]);
    }
  };
}

/* ------------------------------------------------------------------------ */
/* In memory (tests)                                                         */
/* ------------------------------------------------------------------------ */

export function createMemorySignupStore(): SignupStore & { pending: Map<string, PendingSignup> } {
  const pending = new Map<string, PendingSignup>();
  const events: Array<{ bucket: string; at: number }> = [];

  return {
    pending,
    async createPending(p) {
      pending.set(p.id, structuredClone(p));
    },
    async getPending(id) {
      const p = pending.get(id);
      return p ? structuredClone(p) : null;
    },
    async recordWrongAttempt(id) {
      const p = pending.get(id);
      if (!p) return Number.POSITIVE_INFINITY;
      p.attempts += 1;
      return p.attempts;
    },
    async replaceCode(id, next, sentBefore) {
      const p = pending.get(id);
      if (!p || p.claimedAt || p.codeSentAt.getTime() > sentBefore.getTime()) return false;
      Object.assign(p, next, { attempts: 0 });
      return true;
    },
    async claim(id, now) {
      const p = pending.get(id);
      if (!p || p.claimedAt) return false;
      p.claimedAt = now;
      return true;
    },
    async release(id) {
      const p = pending.get(id);
      if (p) p.claimedAt = null;
    },
    async deletePending(id) {
      pending.delete(id);
    },
    async hit(bucket, now, windowSeconds) {
      events.push({ bucket, at: now.getTime() });
      const since = now.getTime() - windowSeconds * 1000;
      return events.filter((e) => e.bucket === bucket && e.at > since).length;
    },
    async purge(now) {
      for (const [id, p] of pending) {
        if (p.expiresAt.getTime() < now.getTime() - KEEP_EXPIRED_MS) pending.delete(id);
      }
      const cutoff = now.getTime() - KEEP_RATE_EVENTS_MS;
      for (let i = events.length - 1; i >= 0; i -= 1) {
        if (events[i].at < cutoff) events.splice(i, 1);
      }
    }
  };
}
