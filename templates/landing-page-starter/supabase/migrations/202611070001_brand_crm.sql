create extension if not exists pgcrypto;

create table if not exists public.brand_crm_leads (
  id uuid primary key default gen_random_uuid(),
  submission_id uuid not null unique,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  full_name text not null,
  phone text not null,
  email text,
  contact_method text not null default 'messenger',
  province text not null,
  city text not null,
  ownership text,
  property_type text,
  utility text,
  bill_band text,
  daytime_use text,
  goals text[] not null default '{}',
  backup_loads text[] not null default '{}',
  timeline text,
  budget text,
  payment_preference text,
  assessment_consent boolean not null default false,
  marketing_consent boolean not null default false,
  result_key text,
  result_badge text,
  result_title text,
  result_copy text,
  result_next_step text,
  recommended_kw integer,
  recommended_package text,
  recommended_price text,
  recommendation_framing text,
  lead_source jsonb not null default '{}'::jsonb,
  status text not null default 'new' check (status in ('new', 'contacted', 'qualified', 'site_visit_booked', 'quotation_sent', 'won', 'lost', 'follow_up')),
  assigned_to text,
  next_follow_up timestamptz,
  last_contacted_at timestamptz,
  internal_notes text
);

create index if not exists brand_crm_leads_status_created_idx on public.brand_crm_leads (status, created_at desc);
create index if not exists brand_crm_leads_follow_up_idx on public.brand_crm_leads (next_follow_up) where next_follow_up is not null;

create or replace function public.brand_crm_touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists brand_crm_leads_touch_updated_at on public.brand_crm_leads;
create trigger brand_crm_leads_touch_updated_at
before update on public.brand_crm_leads
for each row execute function public.brand_crm_touch_updated_at();

alter table public.brand_crm_leads enable row level security;
revoke all on table public.brand_crm_leads from anon, authenticated;

