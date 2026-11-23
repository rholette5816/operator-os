-- Email nurture sequence state for Brand leads.
-- Run once in the Supabase SQL editor for the Brand CRM project.

alter table public.brand_crm_leads
  add column if not exists sequence_enrolled boolean not null default false,
  add column if not exists sequence_position integer not null default 0,
  add column if not exists sequence_unsubscribed boolean not null default false,
  add column if not exists sequence_next_send_at timestamptz,
  add column if not exists sequence_last_sent_at timestamptz;

create index if not exists brand_seq_due_idx
  on public.brand_crm_leads (sequence_enrolled, sequence_unsubscribed, sequence_next_send_at);
