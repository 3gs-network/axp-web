import pg from "pg";
import { env } from "../_core/env";

/**
 * Postgres pools for the leads database, one per connection string.
 *
 * Serverless-sized: each Vercel Function instance keeps at most one
 * connection per pool, and idle ones close quickly. Point the URLs at
 * Supabase's SESSION pooler (port 5432) -- the transaction pooler (6543) does
 * not keep the session state node-postgres expects.
 *
 * TLS is set here, not from the URL: node-postgres reads `sslmode=require` as
 * "verify the certificate", which fails against Supabase's own CA unless that
 * CA is supplied. With SUPABASE_DB_CA_CERT set the certificate is verified;
 * without it the connection is encrypted but the server is not authenticated.
 * Local hosts (tests, development) connect without TLS.
 */

const pools = new Map<string, pg.Pool>();

function isLocalHost(host: string) {
  return host === "localhost" || host === "127.0.0.1" || host === "::1" || host === "[::1]" || host === "";
}

export function poolConfig(connectionString: string, caCert = env.SUPABASE_DB_CA_CERT): pg.PoolConfig {
  const url = new URL(connectionString);
  for (const key of ["sslmode", "sslrootcert", "sslcert", "sslkey", "uselibpqcompat"]) {
    url.searchParams.delete(key);
  }
  const ssl = isLocalHost(url.hostname)
    ? false
    : caCert
      ? { ca: caCert.replace(/\\n/g, "\n"), rejectUnauthorized: true }
      : { rejectUnauthorized: false };

  return {
    connectionString: url.toString(),
    ssl,
    max: 1,
    idleTimeoutMillis: 10_000,
    connectionTimeoutMillis: 8_000
  };
}

export function getPool(connectionString: string): pg.Pool {
  let pool = pools.get(connectionString);
  if (!pool) {
    pool = new pg.Pool(poolConfig(connectionString));
    // An idle client erroring (e.g. the pooler restarting) must not crash the
    // function. Only the code is logged: Postgres messages can quote values.
    pool.on("error", (error: Error & { code?: string }) => {
      console.error("[pg] idle connection error:", error.code ?? "unknown");
    });
    pools.set(connectionString, pool);
  }
  return pool;
}

/** The Postgres error code (e.g. "23514"), never its message. */
export function pgErrorCode(error: unknown): string {
  const code = (error as { code?: unknown } | null)?.code;
  return typeof code === "string" ? code : "unknown";
}
