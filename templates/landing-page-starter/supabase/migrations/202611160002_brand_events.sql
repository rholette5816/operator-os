-- First-party analytics events for Brand (landing funnel + email funnel).
-- Run once in the Supabase SQL editor for the Brand CRM project.

create table if not exists public.brand_events (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  event text not null,
  channel text,
  email_id text,
  lead_id uuid,
  session_id text,
  path text
);

create index if not exists brand_events_event_idx on public.brand_events (channel, event, created_at desc);
create index if not exists brand_events_email_idx on public.brand_events (email_id, event);

-- Aggregated funnels, returned as one JSON object.
create or replace function public.brand_analytics()
returns jsonb language sql stable as $$
  select jsonb_build_object(
    'landing', (
      select coalesce(jsonb_object_agg(event, sessions), '{}'::jsonb) from (
        select event, count(distinct coalesce(session_id, id::text)) sessions
        from public.brand_events where channel = 'landing' group by event
      ) t
    ),
    'email_overall', (
      select coalesce(jsonb_object_agg(event, c), '{}'::jsonb) from (
        select event, count(*) c from public.brand_events where channel = 'email' group by event
      ) t
    ),
    'email_by_id', (
      select coalesce(jsonb_agg(r order by r->>'email_id'), '[]'::jsonb) from (
        select jsonb_build_object(
          'email_id', email_id,
          'sent',    count(*) filter (where event = 'email_sent'),
          'opened',  count(*) filter (where event = 'email_open'),
          'clicked', count(*) filter (where event = 'email_click')
        ) r
        from public.brand_events
        where channel = 'email' and email_id is not null
        group by email_id
      ) x
    ),
    'unsubscribed', (select count(*) from public.brand_crm_leads where sequence_unsubscribed = true),
    'total_leads',  (select count(*) from public.brand_crm_leads)
  );
$$;
