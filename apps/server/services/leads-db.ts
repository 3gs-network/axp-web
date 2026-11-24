import type pg from "pg";
import type { ApplicationType } from "@repo/shared/homeready";
import { env } from "../_core/env";
import { getPool, pgErrorCode } from "./pg";

/**
 * The leads database's public.leads table -- the only thing the website
 * writes there. The HSG admin app reads new rows through
 * public.homeready_leads every 5 minutes and opens one case per row.
 *
 * Rules from that contract:
 *   - one INSERT per verified sign-up; never UPDATE or DELETE (the sync only
 *     sees new rows);
 *   - no RETURNING: the `leads_website` role can INSERT and nothing else, and
 *     RETURNING needs SELECT;
 *   - lead_id and created_at are the database's to set;
 *   - column names are camelCase and must be quoted.
 */

export type HomeReadyLeadRow = {
  legalName: string;
  preferredName: string | null;
  email: string;
  phone: string;
  applicationType: ApplicationType;
  leadSource: string;
  consentVersion: string;
  consentAt: Date;
  verificationMethod: "OTP" | "Secure link";
  verifiedAt: Date;
};

export const INSERT_LEAD_SQL = `insert into public.leads
  ("legalName", "preferredName", email, phone, "applicationType", "leadSource",
   "consentVersion", "consentAt", "verificationMethod", "verifiedAt")
values ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`;

export class LeadsDbError extends Error {
  /** Postgres error code only -- the message can quote the row's values. */
  readonly code: string;
  constructor(code: string) {
    super(`Leads database insert failed (${code}).`);
    this.name = "LeadsDbError";
    this.code = code;
  }
}

export function isLeadsDbConfigured() {
  return Boolean(env.LEADS_DB_URL);
}

type Queryable = Pick<pg.Pool, "query">;

export async function insertHomeReadyLead(row: HomeReadyLeadRow, db: Queryable = getPool(env.LEADS_DB_URL)) {
  try {
    await db.query(INSERT_LEAD_SQL, [
      row.legalName,
      row.preferredName,
      row.email,
      row.phone,
      row.applicationType,
      row.leadSource,
      row.consentVersion,
      row.consentAt,
      row.verificationMethod,
      row.verifiedAt
    ]);
  } catch (error) {
    throw new LeadsDbError(pgErrorCode(error));
  }
}
