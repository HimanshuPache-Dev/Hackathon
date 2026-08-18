-- Officer incident intake, emergency intent logging, traffic observations and
-- commander-approved predeployment planning. Historical evidence is untouched.

alter table public.field_reports add column if not exists client_request_id uuid;
alter table public.field_reports add column if not exists emergency_requested boolean not null default false;
create unique index if not exists field_reports_officer_request_unique on public.field_reports(officer_id,client_request_id) where client_request_id is not null;

create table if not exists public.emergency_assistance_requests(
  id uuid primary key default gen_random_uuid(),officer_id uuid not null references public.officers(id),
  field_report_id uuid not null references public.field_reports(id),incident_id uuid references public.incidents(id),
  requested_at timestamptz not null default now(),unique(field_report_id)
);
create table if not exists public.traffic_observations(
  id uuid primary key default gen_random_uuid(),junction_id uuid not null references public.junctions(id),
  observed_at timestamptz not null,congestion numeric(3,2) not null check(congestion between 0 and 1),
  source text not null,source_kind text not null check(source_kind in ('LICENSED_FEED','OFFICER_OBSERVATION','HISTORICAL_PATTERN')),
  freshness_seconds integer check(freshness_seconds>=0),created_at timestamptz not null default now(),unique(junction_id,observed_at,source)
);
create table if not exists public.deployment_plans(
  id uuid primary key default gen_random_uuid(),plan_date date not null,time_window text not null,
  status text not null default 'DRAFT' check(status in ('DRAFT','APPROVED','MODIFIED','REJECTED')),
  source_label text not null default 'FORECAST',data_freshness timestamptz,commander_id uuid references auth.users(id),
  commander_notes text,created_at timestamptz not null default now(),decided_at timestamptz
);
create table if not exists public.plan_assignments(
  id uuid primary key default gen_random_uuid(),plan_id uuid not null references public.deployment_plans(id) on delete cascade,
  junction_id uuid not null references public.junctions(id),predicted_congestion numeric(3,2) not null check(predicted_congestion between 0 and 1),
  predicted_risk numeric(5,2) not null check(predicted_risk between 0 and 100),confidence text not null,
  factors text[] not null,recommended_officers integer not null check(recommended_officers>=0),staging_time timestamptz,
  staffing_shortfall integer not null default 0 check(staffing_shortfall>=0),eligible_officer_count integer not null default 0 check(eligible_officer_count>=0),
  estimated_travel_minutes integer check(estimated_travel_minutes>=0),unique(plan_id,junction_id)
);

alter table public.emergency_assistance_requests enable row level security;
alter table public.traffic_observations enable row level security;
alter table public.deployment_plans enable row level security;
alter table public.plan_assignments enable row level security;
create policy "commander read emergency requests" on public.emergency_assistance_requests for select to authenticated using(public.is_commander());
create policy "commander read traffic observations" on public.traffic_observations for select to authenticated using(public.is_commander());
create policy "commander read deployment plans" on public.deployment_plans for select to authenticated using(public.is_commander());
create policy "commander read plan assignments" on public.plan_assignments for select to authenticated using(public.is_commander());

do $$ declare t text; begin
  foreach t in array array['emergency_assistance_requests','traffic_observations','deployment_plans','plan_assignments'] loop
    if not exists(select 1 from pg_publication_tables where pubname='supabase_realtime' and schemaname='public' and tablename=t) then execute format('alter publication supabase_realtime add table public.%I',t);end if;
  end loop;
end $$;

create or replace function public.submit_officer_incident_report(p_officer_id uuid,p_incident_type text,p_severity numeric,p_note text,p_latitude numeric,p_longitude numeric,p_junction_id uuid,p_client_request_id uuid,p_emergency_requested boolean)
returns jsonb language plpgsql security definer set search_path=public as $$
declare o public.officers%rowtype;j public.junctions%rowtype;i public.incidents%rowtype;f public.field_reports%rowtype;junction_name text;
begin
  select * into o from public.officers where id=p_officer_id for update;
  if not found or o.status='OFF_DUTY' then return jsonb_build_object('code','CONFLICT','message','Officer must be on duty to report an incident');end if;
  if o.last_location_update is null or o.last_location_update<now()-interval '5 minutes' then return jsonb_build_object('code','CONFLICT','message','A fresh duty location is required');end if;
  if p_incident_type not in ('COLLISION','CONGESTION','OBSTRUCTION','MEDICAL_EMERGENCY','OTHER') or p_severity not between 0 and 1 or p_latitude not between -90 and 90 or p_longitude not between -180 and 180 or length(btrim(coalesce(p_note,''))) not between 3 and 2000 then return jsonb_build_object('code','INVALID','message','Invalid field report');end if;
  select * into f from public.field_reports where officer_id=p_officer_id and client_request_id=p_client_request_id;
  if found then return jsonb_build_object('code','OK','duplicate',true,'report',to_jsonb(f),'incident_id',f.incident_id);end if;
  if p_junction_id is not null then select * into j from public.junctions where id=p_junction_id;if not found then return jsonb_build_object('code','NOT_FOUND','message','Junction not found');end if;junction_name:=j.name;
  else select * into j from public.junctions order by 6371*2*asin(sqrt(power(sin(radians(latitude-p_latitude)/2),2)+cos(radians(p_latitude))*cos(radians(latitude))*power(sin(radians(longitude-p_longitude)/2),2))) limit 1;junction_name:='Away from listed junctions · nearest '||coalesce(j.name,'unknown');end if;
  insert into public.incidents(junction_id,junction_name,severity,incident_type,is_simulated,description)
  values(j.id,junction_name,p_severity,p_incident_type,false,btrim(p_note)) returning * into i;
  insert into public.field_reports(officer_id,junction_id,incident_id,incident_type,severity,note,latitude,longitude,client_request_id,emergency_requested)
  values(o.id,case when p_junction_id is null then null else j.id end,i.id,p_incident_type,p_severity,btrim(p_note),p_latitude,p_longitude,p_client_request_id,coalesce(p_emergency_requested,false)) returning * into f;
  if coalesce(p_emergency_requested,false) then insert into public.emergency_assistance_requests(officer_id,field_report_id,incident_id) values(o.id,f.id,i.id) on conflict(field_report_id) do nothing;end if;
  return jsonb_build_object('code','OK','duplicate',false,'report',to_jsonb(f),'incident',to_jsonb(i));
end $$;

create or replace function public.decide_deployment_plan(p_plan_id uuid,p_decision text,p_commander_id uuid,p_notes text default null)
returns jsonb language plpgsql security definer set search_path=public as $$
declare p public.deployment_plans%rowtype;
begin
  if p_decision not in ('APPROVED','MODIFIED','REJECTED') then return jsonb_build_object('code','INVALID','message','Invalid plan decision');end if;
  select * into p from public.deployment_plans where id=p_plan_id for update;if not found then return jsonb_build_object('code','NOT_FOUND','message','Plan not found');end if;
  if p.status<>'DRAFT' then return jsonb_build_object('code','CONFLICT','message','Plan already decided');end if;
  update public.deployment_plans set status=p_decision,commander_id=p_commander_id,commander_notes=nullif(btrim(coalesce(p_notes,'')),''),decided_at=now() where id=p.id returning * into p;
  return jsonb_build_object('code','OK','plan',to_jsonb(p));
end $$;

revoke all on function public.submit_officer_incident_report(uuid,text,numeric,text,numeric,numeric,uuid,uuid,boolean) from public;
revoke all on function public.decide_deployment_plan(uuid,text,uuid,text) from public;
grant execute on function public.submit_officer_incident_report(uuid,text,numeric,text,numeric,numeric,uuid,uuid,boolean) to service_role;
grant execute on function public.decide_deployment_plan(uuid,text,uuid,text) to service_role;

-- Re-state allocation atomically so stale locations can never be selected.
create or replace function public.simulate_incident_atomic(p_junction_id uuid,p_severity numeric,p_incident_type text,p_reporter_user_id uuid,p_is_simulated boolean)
returns jsonb language plpgsql security definer set search_path=public as $$
declare j public.junctions%rowtype;i public.incidents%rowtype;o public.officers%rowtype;active_severity numeric;score numeric;level text;gap numeric;distance_km numeric;target_count integer;needed_count integer;created_count integer:=0;created jsonb:='[]'::jsonb;new_recommendation jsonb;
begin
  if p_severity not between 0 and 1 then return jsonb_build_object('code','INVALID','message','Severity must be between 0 and 1');end if;
  if p_incident_type not in ('COLLISION','CONGESTION','OBSTRUCTION') then return jsonb_build_object('code','INVALID','message','Unsupported incident type');end if;
  select * into j from public.junctions where id=p_junction_id for update;if not found then return jsonb_build_object('code','NOT_FOUND','message','Junction not found');end if;
  insert into public.incidents(junction_id,junction_name,severity,incident_type,is_simulated) values(j.id,j.name,p_severity,p_incident_type,p_is_simulated) returning * into i;
  select coalesce(max(severity),0) into active_severity from public.incidents where junction_id=j.id and status='ACTIVE';
  score:=round(100*(.30*(j.historical_risk_score/100.0)+.25*coalesce(j.current_congestion,0)+.15*coalesce(j.current_violations,0)+.10*coalesce(j.current_obstruction,0)+.05*coalesce(j.current_weather,0)+.05*coalesce(j.current_event,0)+.10*active_severity));
  level:=case when score>=80 then 'CRITICAL' when score>=60 then 'HIGH' when score>=35 then 'MEDIUM' else 'LOW' end;
  update public.junctions set current_incident=active_severity,current_risk_score=score,current_risk_level=level where id=j.id returning * into j;
  if level in ('HIGH','CRITICAL') then
    target_count:=greatest(coalesce(j.required_officers,1),case when active_severity>=.8 then 3 when active_severity>=.5 then 2 else 1 end);needed_count:=greatest(0,target_count-coalesce(j.assigned_officers,0));gap:=case when target_count<=0 then 0 else needed_count::numeric/target_count end;
    for o in select candidate.* from public.officers candidate where candidate.status='AVAILABLE' and candidate.available=true and candidate.latitude is not null and candidate.longitude is not null and candidate.last_location_update>=now()-interval '5 minutes'
      and 6371*2*asin(sqrt(power(sin(radians(candidate.latitude-j.latitude)/2),2)+cos(radians(j.latitude))*cos(radians(candidate.latitude))*power(sin(radians(candidate.longitude-j.longitude)/2),2)))<=6
      and not exists(select 1 from public.recommendations existing where existing.officer_id=candidate.id and existing.status in ('PENDING','ACCEPTED','MODIFIED') and coalesce(existing.officer_response_status,'PENDING') in ('PENDING','ACCEPTED','ARRIVED'))
      order by case when 6371*2*asin(sqrt(power(sin(radians(candidate.latitude-j.latitude)/2),2)+cos(radians(j.latitude))*cos(radians(candidate.latitude))*power(sin(radians(candidate.longitude-j.longitude)/2),2)))<=4 then 0 else 1 end,
      6371*2*asin(sqrt(power(sin(radians(candidate.latitude-j.latitude)/2),2)+cos(radians(j.latitude))*cos(radians(candidate.latitude))*power(sin(radians(candidate.longitude-j.longitude)/2),2))),candidate.assignments_completed limit needed_count for update skip locked
    loop
      distance_km:=6371*2*asin(sqrt(power(sin(radians(o.latitude-j.latitude)/2),2)+cos(radians(j.latitude))*cos(radians(o.latitude))*power(sin(radians(o.longitude-j.longitude)/2),2)));
      insert into public.recommendations(junction_id,incident_id,officer_id,recommendation_text,travel_time_minutes,expected_risk_reduction,deployment_priority,reasons,confidence)
      values(j.id,i.id,o.id,'Deploy badge '||o.badge_code||' to '||j.name,greatest(2,ceil(distance_km/(24.0/60.0)))::integer,round(100.0/target_count),round(.85*score+15*gap),array[level||' current risk ('||score||'/100)',needed_count||' officer staffing shortfall',case when distance_km<=4 then 'Fresh location · preferred 4 km range ('||round(distance_km,1)||' km)' else 'Fresh location · extended 4-6 km range ('||round(distance_km,1)||' km)' end],j.confidence) returning to_jsonb(recommendations.*) into new_recommendation;
      created:=created||jsonb_build_array(new_recommendation);created_count:=created_count+1;
    end loop;
  end if;
  return jsonb_build_object('code','OK','incident',to_jsonb(i),'junction',to_jsonb(j),'recommendation',case when created_count=0 then null else created->0 end,'recommendations',created,'recommended_officer_count',created_count,'requested_officer_count',coalesce(needed_count,0));
end $$;
revoke all on function public.simulate_incident_atomic(uuid,numeric,text,uuid,boolean) from public;
grant execute on function public.simulate_incident_atomic(uuid,numeric,text,uuid,boolean) to service_role;
