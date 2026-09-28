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
  AXP_CRM_ANON_KEY: readEnv(process.env.AXP_CRM_ANON_KEY) ?? ""
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
