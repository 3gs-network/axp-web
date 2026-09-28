# Agent Guide

The AXP Africa public website. Read this before changing the API boundary,
deployment or environment.

## Stack

- Package manager: `pnpm` (workspaces: `apps/*`, `packages/*`)
- Client: `apps/client` — React 19, Vite/Rolldown, Tailwind CSS v4, shadcn/ui,
  react-router (`BrowserRouter`), TanStack Query
- Server: `apps/server` — Hono, zod
- Shared: `packages/shared` — API response helpers (`@repo/shared/http`)
- Hosting: one Vercel project. The site is static; `/api/*` is a single Vercel
  Function (`apps/client/api/index.js`) that re-exports the bundled Hono app.

There is no site database. Anything the site stores is written to the AXP CRM.
Website accounts are users in the CRM's Supabase Auth, proxied through
`/api/account/*` so the CRM key never reaches the browser.

## Project Map

- Pages: `apps/client/src/pages/` (`auth/` and `dashboard/` are the account pages)
- Client helpers: `apps/client/src/lib/` (api.ts, api-base.ts, api-error.ts,
  session.ts, utils.ts)
- UI components: `apps/client/src/components/ui/` (shadcn — use as-is)
- Server core: `apps/server/_core/` (create-app.ts, route-registry.ts, env.ts,
  vercel-entry.ts, dev-server.ts)
- Middleware: `apps/server/middlewares/` (not-found, on-error)
- Routes: `apps/server/routes/` (one `<name>.route.ts` per feature, auto-mounted)
- Services: `apps/server/services/` (`axp-crm.ts` — the only CRM client)
- Tests: `apps/server/_test/infra/` (health, CORS) and `apps/server/__tests__/`

## Hard Boundaries

- The CRM is reached from the server only, through `services/axp-crm.ts`, with
  the CRM's ANON key. Never ship the key to the browser, never call Supabase from
  client code, and never add a `service_role` key.
- Frontend business code calls the backend ONLY through `apiFetch` from
  `@/lib/api` (enforced by `eslint-rules/no-direct-api-request.js`).
- Frontend public env must use `VITE_`. Never put secrets in frontend env.
- New server env reads go through `_core/env.ts` (add a field there).
- Keep the home page's first render SSR-safe: `scripts/prerender.mjs` bakes it
  for crawlers and `main.tsx` hydrates it. No `window` / `document` /
  `localStorage` during render — use `useEffect`.

## Route Auto-Discovery

Every `apps/server/routes/<name>.route.ts` is discovered by
`_core/route-registry.ts` and mounted at `/api/<name>`. To add an endpoint, add a
route file — do not edit `create-app.ts`. Export the Hono router under any name
(or `default`). Register both `""` and `"/"` for collection handlers.

## API Surface

Server:

- `_core/env.ts` — `env.{NODE_ENV, PORT, AXP_CRM_URL, AXP_CRM_ANON_KEY}`.
- `services/axp-crm.ts` — `isCrmConfigured()`, `listKnowledge()`,
  `createLead(input)`, `registerCustomer(input)`, the account calls
  (`signUpAccount`, `signInAccount`, `refreshAccountSession`, `getAccountUser`,
  `signOutAccount`, `resendConfirmation`), `class CrmUnconfiguredError`. An
  unconfigured CRM must degrade gracefully, never crash the site.
- `@repo/shared/http` — `apiSuccess(data)` → `{ ok: true, data }`;
  `apiFailure(code, message)` → `{ ok: false, error: { code, message } }`.
  ALL API responses use this envelope.

Client (`apps/client/src/lib/`):

- `api.ts` — `apiFetch(path, init?)` → `Response`. Adds the base URL and `/api`
  prefix; pass `/leads`, not `/api/leads`. Non-OK responses trigger the shared
  error toast unless `notify: false`; still check `response.ok`.
- `session.ts` — the only code that touches account tokens: `signIn`, `signUp`
  (returns `"confirm_email"` while the CRM requires confirmation), `signOut`,
  `resendConfirmation`, `completeSignInFromUrl`. Components read the session
  with `useSession()` from `@/hooks/useSession` (`status` is loading / guest /
  authenticated — never treat loading as guest) and gate pages with
  `RequireAuth` from `@/components/auth/RequireAuth`.
- `api-base.ts` — `apiUrl(path)`, `API_BASE_URL` (`VITE_API_BASE_URL`, else
  same-origin).

## Validation

- `pnpm lint` — ESLint and type checks for both apps
- `pnpm test` — client and server tests
- `pnpm --filter client run build:api` — confirms the API still bundles for Vercel
- Dev server: `cd apps/client && pnpm dev` (site at `http://localhost:3100`,
  API under `/api/*`)
