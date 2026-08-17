create extension if not exists pgcrypto;

create table if not exists public.junctions (
  id uuid primary key default gen_random_uuid(), junction_id text unique not null, name text not null,
  latitude numeric(10,5) not null, longitude numeric(10,5) not null,
  historical_crashes integer not null, fatalities integer not null, major_injuries integer not null,
  minor_injuries integer not null, weighted_severity_index integer not null,
  historical_risk_score integer not null check (historical_risk_score between 0 and 100), historical_tier text not null,
  current_congestion numeric(3,2) default 0, current_violations numeric(3,2) default 0,
  current_obstruction numeric(3,2) default 0, current_weather numeric(3,2) default 0,
  current_event numeric(3,2) default 0, current_incident numeric(3,2) default 0,
  current_risk_score integer default 0, current_risk_level text default 'LOW',
  assigned_officers integer default 0, is_unmanned boolean default true, coverage_gap integer default 1,
  confidence text not null, evidence_url text, evidence_note text,
  created_at timestamptz default now(), updated_at timestamptz default now()
);

create table if not exists public.officers (
  id uuid primary key default gen_random_uuid(), name text not null, badge_code text unique not null,
  pin_hash text not null, status text default 'OFF_DUTY', current_junction_id uuid references public.junctions(id),
  current_junction_name text, latitude numeric(10,5), longitude numeric(10,5), last_location_update timestamptz,
  available boolean default false, duty_start_time timestamptz, duty_end_time timestamptz,
  assignments_completed integer default 0, assignments_rejected integer default 0,
  created_at timestamptz default now(), updated_at timestamptz default now()
);

create table if not exists public.incidents (
  id uuid primary key default gen_random_uuid(), junction_id uuid not null references public.junctions(id),
  junction_name text not null, severity numeric(3,2) not null check (severity between 0 and 1),
  incident_type text not null, is_simulated boolean default false, description text,
  reported_at timestamptz default now(), resolved_at timestamptz, status text default 'ACTIVE', created_at timestamptz default now()
);

create table if not exists public.recommendations (
  id uuid primary key default gen_random_uuid(), junction_id uuid not null references public.junctions(id),
  officer_id uuid not null references public.officers(id), recommendation_text text not null,
  travel_time_minutes integer not null, expected_risk_reduction integer not null, deployment_priority integer not null,
  reasons text[] not null, confidence text, status text default 'PENDING', commander_decision_at timestamptz,
  commander_notes text, created_at timestamptz default now()
);

create table if not exists public.decision_logs (
  id uuid primary key default gen_random_uuid(), recommendation_id uuid not null references public.recommendations(id),
  commander_id uuid references auth.users(id), decision text not null, decision_notes text, timestamp timestamptz default now()
);

create table if not exists public.realtime_locations (
  id uuid primary key default gen_random_uuid(), officer_id uuid not null references public.officers(id),
  latitude numeric(10,5) not null, longitude numeric(10,5) not null, accuracy numeric(7,2), timestamp timestamptz default now()
);

create table if not exists public.scoring_config (
  key text primary key, weight numeric(4,3) not null, description text
);
insert into public.scoring_config(key,weight,description) values
  ('accident_history',.30,'Historical crash severity'),('congestion',.25,'Current congestion'),
  ('violations',.15,'Observed traffic violations'),('obstruction',.10,'Road obstruction'),
  ('weather',.05,'Live weather risk'),('event',.05,'Event pressure'),('incident',.10,'Current incident')
on conflict (key) do update set weight=excluded.weight, description=excluded.description;

create or replace function public.protect_historical_junction_fields() returns trigger language plpgsql as $$
begin
  if row(old.historical_crashes,old.fatalities,old.major_injuries,old.minor_injuries,old.weighted_severity_index,old.historical_risk_score,old.historical_tier)
     is distinct from row(new.historical_crashes,new.fatalities,new.major_injuries,new.minor_injuries,new.weighted_severity_index,new.historical_risk_score,new.historical_tier) then
    raise exception 'Historical evidence fields are immutable';
  end if;
  new.updated_at = now(); return new;
end $$;
drop trigger if exists junction_history_read_only on public.junctions;
create trigger junction_history_read_only before update on public.junctions for each row execute function public.protect_historical_junction_fields();

alter table public.junctions enable row level security;
alter table public.officers enable row level security;
alter table public.incidents enable row level security;
alter table public.recommendations enable row level security;
alter table public.decision_logs enable row level security;
alter table public.realtime_locations enable row level security;
create policy "authenticated read junctions" on public.junctions for select to authenticated using (true);
create policy "authenticated read officers" on public.officers for select to authenticated using (true);
create policy "authenticated read incidents" on public.incidents for select to authenticated using (true);
create policy "authenticated read recommendations" on public.recommendations for select to authenticated using (true);

alter publication supabase_realtime add table public.junctions;
alter publication supabase_realtime add table public.officers;
alter publication supabase_realtime add table public.incidents;
alter publication supabase_realtime add table public.recommendations;
alter publication supabase_realtime add table public.realtime_locations;
