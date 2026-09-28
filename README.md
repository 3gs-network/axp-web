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
| `VITE_LISTINGS_API_BASE_URL` | browser | Listings feed base URL |
| `VITE_API_BASE_URL` | browser, optional | Points the site at a different API origin. Leave unset in production. |

Browser variables must start with `VITE_` and are public. Never put a secret in one.

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
