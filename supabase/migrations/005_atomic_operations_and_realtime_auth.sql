-- Atomic operational workflows and role-scoped realtime access. Review in staging first.
create table if not exists public.operational_notes(
  id uuid primary key default gen_random_uuid(),
  officer_id uuid not null references public.officers(id),
  junction_id uuid references public.junctions(id),
  incident_id uuid references public.incidents(id),
  note text not null check(length(btrim(note)) between 1 and 2000),
  created_at timestamptz not null default now()
);
alter table public.operational_notes enable row level security;
create unique index if not exists realtime_locations_officer_timestamp on public.realtime_locations(officer_id,timestamp);

create or replace function public.is_commander() returns boolean language sql stable security definer set search_path=public
as $$ select coalesce((auth.jwt()->'app_metadata'->>'role')='commander',false) $$;
revoke all on function public.is_commander() from public;
grant execute on function public.is_commander() to authenticated;

do $$ declare t text; begin
  foreach t in array array['junctions','officers','incidents','recommendations','decision_logs','realtime_locations','operational_notes'] loop
    execute format('drop policy if exists %I on public.%I','commander realtime read',t);
    execute format('create policy %I on public.%I for select to authenticated using(public.is_commander())','commander realtime read',t);
  end loop;
end $$;
drop policy if exists "authenticated read junctions" on public.junctions;
drop policy if exists "authenticated read officers" on public.officers;
drop policy if exists "authenticated read incidents" on public.incidents;
drop policy if exists "authenticated read recommendations" on public.recommendations;
drop policy if exists "authenticated read decision logs" on public.decision_logs;
drop policy if exists "authenticated read realtime locations" on public.realtime_locations;

do $$ begin
  if not exists(select 1 from pg_publication_tables where pubname='supabase_realtime' and schemaname='public' and tablename='operational_notes') then
    alter publication supabase_realtime add table public.operational_notes;
  end if;
end $$;

create or replace function public.update_officer_location_atomic(p_officer_id uuid,p_latitude numeric,p_longitude numeric,p_accuracy numeric,p_recorded_at timestamptz)
returns jsonb language plpgsql security definer set search_path=public as $$
declare o public.officers%rowtype; l public.realtime_locations%rowtype;
begin
  if p_latitude not between -90 and 90 or p_longitude not between -180 and 180 or p_accuracy<0 or p_accuracy>10000 then return jsonb_build_object('code','INVALID','message','Invalid location values'); end if;
  select * into o from public.officers where id=p_officer_id for update;
  if not found then return jsonb_build_object('code','NOT_FOUND','message','Officer not found'); end if;
  if o.status='OFF_DUTY' then return jsonb_build_object('code','CONFLICT','message','Off-duty officers cannot share location'); end if;
  insert into public.realtime_locations(officer_id,latitude,longitude,accuracy,timestamp) values(p_officer_id,p_latitude,p_longitude,p_accuracy,p_recorded_at)
    on conflict(officer_id,timestamp) do update set latitude=excluded.latitude,longitude=excluded.longitude,accuracy=excluded.accuracy returning * into l;
  update public.officers set latitude=p_latitude,longitude=p_longitude,last_location_update=p_recorded_at,updated_at=now() where id=p_officer_id returning * into o;
  return jsonb_build_object('code','OK','officer',to_jsonb(o)-'pin_hash','location',to_jsonb(l));
end $$;

create or replace function public.submit_operational_note(p_officer_id uuid,p_note text,p_junction_id uuid default null,p_incident_id uuid default null)
returns jsonb language plpgsql security definer set search_path=public as $$
declare n public.operational_notes%rowtype;
begin
  if length(btrim(coalesce(p_note,''))) not between 1 and 2000 then return jsonb_build_object('code','INVALID','message','Note must contain between 1 and 2000 characters'); end if;
  perform 1 from public.officers where id=p_officer_id;if not found then return jsonb_build_object('code','NOT_FOUND','message','Officer not found');end if;
  if p_junction_id is not null then perform 1 from public.junctions where id=p_junction_id;if not found then return jsonb_build_object('code','NOT_FOUND','message','Junction not found');end if;end if;
  if p_incident_id is not null then perform 1 from public.incidents where id=p_incident_id;if not found then return jsonb_build_object('code','NOT_FOUND','message','Incident not found');end if;end if;
  insert into public.operational_notes(officer_id,junction_id,incident_id,note) values(p_officer_id,p_junction_id,p_incident_id,btrim(p_note)) returning * into n;
  return jsonb_build_object('code','OK','note',to_jsonb(n));
end $$;

create or replace function public.simulate_incident_atomic(p_junction_id uuid,p_severity numeric,p_incident_type text,p_reporter_user_id uuid,p_is_simulated boolean)
returns jsonb language plpgsql security definer set search_path=public as $$
declare j public.junctions%rowtype; i public.incidents%rowtype; r public.recommendations%rowtype; o public.officers%rowtype; active_severity numeric; score numeric; level text; gap numeric; distance_km numeric;
begin
  if p_severity not between 0 and 1 then return jsonb_build_object('code','INVALID','message','Severity must be between 0 and 1'); end if;
  if p_incident_type not in ('COLLISION','CONGESTION','OBSTRUCTION') then return jsonb_build_object('code','INVALID','message','Unsupported incident type'); end if;
  select * into j from public.junctions where id=p_junction_id for update;
  if not found then return jsonb_build_object('code','NOT_FOUND','message','Junction not found'); end if;
  insert into public.incidents(junction_id,junction_name,severity,incident_type,is_simulated) values(j.id,j.name,p_severity,p_incident_type,p_is_simulated) returning * into i;
  select coalesce(max(severity),0) into active_severity from public.incidents where junction_id=j.id and status='ACTIVE';
  score:=round(100*(.30*(j.historical_risk_score/100.0)+.25*coalesce(j.current_congestion,0)+.15*coalesce(j.current_violations,0)+.10*coalesce(j.current_obstruction,0)+.05*coalesce(j.current_weather,0)+.05*coalesce(j.current_event,0)+.10*active_severity));
  level:=case when score>=80 then 'CRITICAL' when score>=60 then 'HIGH' when score>=35 then 'MEDIUM' else 'LOW' end;
  update public.junctions set current_incident=active_severity,current_risk_score=score,current_risk_level=level where id=j.id returning * into j;
  if j.is_unmanned and level in ('HIGH','CRITICAL') then
    select * into o from public.officers where status='AVAILABLE' and available=true and latitude is not null and longitude is not null order by 6371*2*asin(sqrt(power(sin(radians(latitude-j.latitude)/2),2)+cos(radians(j.latitude))*cos(radians(latitude))*power(sin(radians(longitude-j.longitude)/2),2))),assignments_completed limit 1 for update skip locked;
    if found then
      distance_km:=6371*2*asin(sqrt(power(sin(radians(o.latitude-j.latitude)/2),2)+cos(radians(j.latitude))*cos(radians(o.latitude))*power(sin(radians(o.longitude-j.longitude)/2),2)));
      gap:=case when coalesce(j.required_officers,1)<=0 then 0 else greatest(0,coalesce(j.required_officers,1)-coalesce(j.assigned_officers,0))::numeric/coalesce(j.required_officers,1) end;
      insert into public.recommendations(junction_id,incident_id,officer_id,recommendation_text,travel_time_minutes,expected_risk_reduction,deployment_priority,reasons,confidence)
      values(j.id,i.id,o.id,'Deploy badge '||o.badge_code||' to '||j.name,greatest(2,ceil(distance_km/(24.0/60.0)))::integer,round(gap*100),round(.85*score+15*gap),array[level||' current risk ('||score||'/100)','No active officer coverage','Nearest available officer ('||round(distance_km,1)||' km)'],j.confidence)
      on conflict(incident_id) where status='PENDING' and incident_id is not null do update set incident_id=excluded.incident_id returning * into r;
    end if;
  end if;
  return jsonb_build_object('code','OK','incident',to_jsonb(i),'junction',to_jsonb(j),'recommendation',case when r.id is null then null else to_jsonb(r) end);
end $$;

revoke all on function public.update_officer_location_atomic(uuid,numeric,numeric,numeric,timestamptz) from public;
revoke all on function public.simulate_incident_atomic(uuid,numeric,text,uuid,boolean) from public;
revoke all on function public.submit_operational_note(uuid,text,uuid,uuid) from public;
grant execute on function public.update_officer_location_atomic(uuid,numeric,numeric,numeric,timestamptz) to service_role;
grant execute on function public.simulate_incident_atomic(uuid,numeric,text,uuid,boolean) to service_role;
grant execute on function public.submit_operational_note(uuid,text,uuid,uuid) to service_role;
