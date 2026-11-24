-- The leads database contract, rebuilt for the integration test ONLY.
-- Mirrors the HSG admin app's table, the agreed migration and the
-- `leads_website` role exactly. Never run this against the real database.

-- public.leads before the migration.
create table public.leads (
  lead_id bigint generated always as identity primary key,
  created_at timestamptz not null default now(),
  "legalName" text not null,
  email text not null,
  phone text,
  "applicationType" text,
  "leadSource" text
);

-- The migration, verbatim.
alter table public.leads
  add column "preferredName" text, add column "consentVersion" text, add column "consentAt" timestamptz,
  add column "verificationMethod" text, add column "verifiedAt" timestamptz;
alter table public.leads
  add constraint leads_application_type_check check ("applicationType" in ('Individual','Joint','Business')),
  add constraint leads_verification_method_check check ("verificationMethod" is null or "verificationMethod" in ('OTP','Secure link'));
create or replace view public.homeready_leads as
select lead_id::text as lead_id, created_at, created_at as updated_at, "legalName" as legal_name,
       "preferredName" as preferred_name, email, phone, "applicationType" as application_type,
       "leadSource" as lead_source, "consentVersion" as consent_version, "consentAt" as consent_at,
       "verificationMethod" as verification_method, "verifiedAt" as verified_at
from public.leads;

-- RLS on, as in Supabase.
alter table public.leads enable row level security;

-- The website's role, verbatim.
create role leads_website with login password '<secret>';
grant usage on schema public to leads_website;
grant insert on public.leads to leads_website;
create policy "leads_website can insert" on public.leads for insert to leads_website with check (true);
