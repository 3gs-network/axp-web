-- HomeReady sign-up: the website's OWN storage, in the leads database.
--
-- Holds sign-ups waiting for their one-time code, plus rate-limit counters.
-- It does not touch public.leads or public.homeready_leads. Run it once, as
-- the database owner (Supabase SQL editor), after replacing <secret>.
--
-- Rows here are short-lived: a pending sign-up is deleted as soon as its lead
-- is written, and abandoned ones an hour after their code expires.

create schema if not exists website_otp;

create table if not exists website_otp.pending_signups (
  id           uuid primary key,
  lead         jsonb not null,          -- the validated form, until verified
  code_hash    text not null,           -- HMAC of the code; never the code
  attempts     integer not null default 0,
  consent_at   timestamptz not null,
  code_sent_at timestamptz not null,
  expires_at   timestamptz not null,
  claimed_at   timestamptz,
  created_at   timestamptz not null default now()
);
create index if not exists pending_signups_expires_at_idx on website_otp.pending_signups (expires_at);

create table if not exists website_otp.rate_events (
  bucket text not null,                 -- e.g. "register-ip:<hmac>"; never a raw IP or email
  at     timestamptz not null
);
create index if not exists rate_events_bucket_at_idx on website_otp.rate_events (bucket, at);

-- The role the website uses for this schema (HOMEREADY_STORE_DB_URL). It can
-- reach this schema and nothing else.
create role leads_website_otp with login password '<secret>';
grant usage on schema website_otp to leads_website_otp;
grant select, insert, update, delete on website_otp.pending_signups, website_otp.rate_events to leads_website_otp;

-- Keep Supabase's API roles out, and let only the website role through RLS.
revoke all on schema website_otp from public;
alter table website_otp.pending_signups enable row level security;
alter table website_otp.rate_events enable row level security;
create policy "leads_website_otp full access" on website_otp.pending_signups
  for all to leads_website_otp using (true) with check (true);
create policy "leads_website_otp full access" on website_otp.rate_events
  for all to leads_website_otp using (true) with check (true);
