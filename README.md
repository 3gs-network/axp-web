# AXP Africa — Public Website

The public website for AXP Africa: a React single-page app with a small Hono API
that connects it to the AXP CRM. The site and the API deploy together to one
Vercel project on one origin.

## Layout

- `apps/client` — React 19, Vite, Tailwind CSS v4, react-router. Also holds
  `api/index.js`, the Vercel Function that serves `/api/*`.
- `apps/server` — the Hono API. Routes in `routes/*.route.ts` auto-mount at
  `/api/<name>`.
- `packages/shared` — the API response envelope (`@repo/shared/http`).

## API

| Route | What it does |
| --- | --- |
| `GET /api/health` | Liveness check |
| `GET /api/knowledge` | Published Knowledge Centre posts from the CRM |
| `POST /api/leads` | Files an enquiry into the CRM queue |
| `/api/account/*` | Website accounts: sign-up, sign-in, refresh, me, sign-out, resend-confirmation |
| `/api/homeready/*` | HomeReady sign-up for `/register`: register, verify, resend (see below) |

The site has no database of its own. Everything it stores goes to the AXP CRM,
which is reached only from the server (see `apps/server/services/axp-crm.ts`).
Website accounts are users in the CRM's Supabase Auth: sign-up creates the user
(the CRM emails a confirmation link back to `/auth`) and registers them as a CRM
contact. The browser keeps the session tokens; `apps/client/src/lib/session.ts`
owns them. Home-ownership listings come from a separate
platform API (`VITE_LISTINGS_API_BASE_URL`), called from the browser.

## Local development

```bash
pnpm install
cp .env.example .env   # then fill in the CRM key
cd apps/client && pnpm dev
```

Open `http://localhost:3100`. The Vite dev server runs the Hono API in-process
under `/api/*`, so there is nothing else to start.

## Environment

| Variable | Where | Purpose |
| --- | --- | --- |
| `AXP_CRM_URL` | server | AXP CRM (Supabase) URL |
| `AXP_CRM_ANON_KEY` | server | CRM anon key. Without it the Knowledge Centre falls back to built-in content and enquiries answer 503. |
| `LEADS_DB_URL` | server | Leads database as `leads_website` (INSERT only). See "HomeReady sign-up". |
| `HOMEREADY_STORE_DB_URL` | server | Leads database as `leads_website_otp` (the `website_otp` schema only). |
| `HOMEREADY_OTP_SECRET` | server | 32+ random bytes, e.g. `openssl rand -hex 32`. Hashes codes and rate-limit keys. |
| `SENDBYTE_API_KEY` | server | SendByte key. `sk_test_...` sends nothing (sandbox); `sk_live_...` in production. |
| `SENDBYTE_FROM` | server | Sender, e.g. `AXP HomeReady <homeready@axpafrica.com>`, on a domain verified in SendByte. |
| `SUPABASE_DB_CA_CERT` | server, optional | PEM of the Supabase database CA (Database settings → SSL). Turns on certificate verification. |
| `VITE_LISTINGS_API_BASE_URL` | browser | Listings feed base URL |
| `VITE_API_BASE_URL` | browser, optional | Points the site at a different API origin. Leave unset in production. |

Browser variables must start with `VITE_` and are public. Never put a secret in one.

## HomeReady sign-up (`/register`)

A visitor fills in the form, confirms their email with a 6-digit code, and the
server inserts **one row** into `public.leads` in the leads database. The HSG
admin app reads new rows from `public.homeready_leads` every 5 minutes and opens
a case per row. The website never updates or deletes a lead, and never reads one.

`/register` sits alongside the existing "Register interest" route on
`/contact`; it does not replace it, and it is left out of the sitemap.

**Flow.** `POST /api/homeready/register` validates the form, keeps it in the
website's own `website_otp` schema with an HMAC of the code, and emails the code
through SendByte. `POST /api/homeready/verify` checks the code and inserts the
lead with `verificationMethod = 'OTP'`, `verifiedAt` = now and `consentAt` = the
time of the original submission, then deletes the pending copy.
`POST /api/homeready/resend` sends a new code. Codes expire after 10 minutes,
allow 5 wrong tries, and can be resent once a minute. Per hour: 10 sign-ups per
IP, 5 code emails per email address, 5 sign-ups per phone, 30 verifications and
10 resends per IP. A filled honeypot field gets a normal-looking answer and
nothing is stored. Repeat sign-ups are inserted like any other: the admin app
flags duplicates, and the website never says whether an email is known.

If any HomeReady variable under "Environment" is missing, or `PRIVACY_NOTICE` is unset,
the endpoints answer 503 and the rest of the site carries on.

Nothing personal is logged: database errors log their Postgres code only, and
email errors log SendByte's error code and HTTP status.

**Leads database roles** (run once by the database owner):

```sql
-- INSERT on public.leads only. No SELECT, so the website never uses RETURNING.
create role leads_website with login password '<secret>';
grant usage on schema public to leads_website;
grant insert on public.leads to leads_website;
create policy "leads_website can insert" on public.leads for insert to leads_website with check (true);
```

Then run [`docs/homeready-website-otp.sql`](docs/homeready-website-otp.sql),
which creates the `website_otp` schema and the `leads_website_otp` role. It does
not touch `public.leads` or the view.

Use Supabase's **session pooler on port 5432**, not the transaction pooler on
6543. The username is `<role>.<project-ref>`:

```
LEADS_DB_URL=postgresql://leads_website.<project-ref>:<secret>@aws-0-<region>.pooler.supabase.com:5432/postgres
HOMEREADY_STORE_DB_URL=postgresql://leads_website_otp.<project-ref>:<secret>@aws-0-<region>.pooler.supabase.com:5432/postgres
```

TLS is always on for non-local hosts (the URL's `sslmode` is ignored). Set
`SUPABASE_DB_CA_CERT` to verify the server certificate as well.

**Privacy notice version.** `PRIVACY_NOTICE` in
`packages/shared/src/homeready.ts` holds the notice's URL and version string
(for example `PN-2026-01`). The version is written to `"consentVersion"` with
every lead, so change it whenever the notice's wording changes. It is currently
`null` (the notice is not published yet). Until it is set, the form renders but
registrations are refused.

**Lead sources.** `"leadSource"` must match, ignoring case, an active lead
source in the admin app's Settings → Leads, or the case gets no source. It
defaults to `Website`. If the visitor arrived with `utm_source` or
`utm_campaign` (for example `?utm_source=instagram` on an Instagram link), the
first value seen in that tab is kept until they submit, and mapped through
`LEAD_SOURCE_MAP` in `packages/shared/src/homeready.ts`:

| UTM value (any case) | Lead source |
| --- | --- |
| `instagram`, `ig` | `Instagram` |
| anything else / none | `Website` |

Add a line to the map when a new campaign source is created in the admin app.

**Tests.** `apps/server/__tests__/homeready-validation.test.ts` covers the
shared rules and the UTM mapping, `homeready-flow.test.ts` covers the code
flow, and `homeready-db.integration.test.ts` rebuilds the leads contract in a
throwaway Postgres database. The integration test is skipped unless
`HOMEREADY_TEST_PG_URL` is set:

```bash
docker run --rm -d -p 55432:5432 -e POSTGRES_HOST_AUTH_METHOD=trust postgres:16
HOMEREADY_TEST_PG_URL=postgres://postgres@127.0.0.1:55432/postgres pnpm test
```

## Deploying (Vercel)

- Root Directory: `apps/client`, with "Include files outside the root directory" on.
- Vercel runs `vercel-build`, which bundles the API into `apps/client/api/_server/`
  and then builds the site into `dist/`.
- `apps/client/vercel.json` rewrites `/api/*` to the function and everything else
  to `index.html`.
- Set the server and browser variables above in the Vercel project.

## Checks

```bash
pnpm lint    # ESLint + type checks
pnpm test    # client and server tests
```
