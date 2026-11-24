function readEnv(...values: Array<string | undefined>) {
  return values.find((value) => value !== undefined && value.trim() !== "");
}

const nodeEnv = process.env.NODE_ENV ?? "development";
const cliPort = readCliPort(process.argv);

export const env = {
  NODE_ENV: nodeEnv,
  // Local standalone dev server only (_core/dev-server.ts). On Vercel the
  // function is invoked directly and never listens on a port.
  PORT: Number(cliPort ?? process.env.PORT ?? 9901),
  // AXP CRM (Supabase). Server-only: the browser never talks to it directly --
  // see services/axp-crm.ts. The key here is the ANON key, which on its own can
  // do exactly three things: read published Knowledge Centre posts, file an
  // enquiry, and register a website sign-up as a CRM contact. It cannot read a
  // client case, a staff record or another customer. Empty values simply
  // disable the integration rather than crashing the site.
  AXP_CRM_URL: readEnv(process.env.AXP_CRM_URL) ?? "",
  AXP_CRM_ANON_KEY: readEnv(process.env.AXP_CRM_ANON_KEY) ?? "",
  // HomeReady sign-up (routes/homeready.route.ts). All server-only; any one of
  // them empty switches registration off (503) rather than crashing the site.
  //
  // The leads database, as the INSERT-only `leads_website` role, through
  // Supabase's SESSION pooler (port 5432). See services/leads-db.ts.
  LEADS_DB_URL: readEnv(process.env.LEADS_DB_URL) ?? "",
  // The website's own pending-sign-up / rate-limit tables (schema
  // `website_otp` in the same database, role `leads_website_otp`). Never public.leads.
  HOMEREADY_STORE_DB_URL: readEnv(process.env.HOMEREADY_STORE_DB_URL) ?? "",
  // Optional PEM of the Supabase database CA. When set, both connections
  // verify the server certificate; without it they are encrypted only.
  SUPABASE_DB_CA_CERT: readEnv(process.env.SUPABASE_DB_CA_CERT) ?? "",
  // Secret for hashing one-time codes and rate-limit keys (32+ random bytes).
  HOMEREADY_OTP_SECRET: readEnv(process.env.HOMEREADY_OTP_SECRET) ?? "",
  // SendByte, for emailing the one-time code.
  SENDBYTE_API_KEY: readEnv(process.env.SENDBYTE_API_KEY) ?? "",
  SENDBYTE_FROM: readEnv(process.env.SENDBYTE_FROM) ?? "",
  SENDBYTE_BASE_URL: readEnv(process.env.SENDBYTE_BASE_URL) ?? "https://api.sendbyte.africa"
};

function readCliPort(argv: string[]) {
  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];

    if ((arg === "-p" || arg === "--port") && argv[index + 1]) {
      return argv[index + 1];
    }

    if (arg.startsWith("--port=")) {
      return arg.slice("--port=".length);
    }
  }

  return undefined;
}
