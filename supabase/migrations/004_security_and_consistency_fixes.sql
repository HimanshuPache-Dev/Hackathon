-- PoliceOps security and consistency hardening.
-- Additive/non-destructive. Review before applying to any live project.

alter table public.junctions add column if not exists historical_data_period text default 'Source workbook reporting period';
alter table public.junctions add column if not exists data_source_type text default 'HISTORICAL';
alter table public.junctions add column if not exists source_identifier text;
alter table public.junctions add column if not exists original_source_metadata jsonb default '{}'::jsonb;
alter table public.junctions add column if not exists required_officers integer default 1;
alter table public.recommendations add column if not exists incident_id uuid references public.incidents(id);

alter table public.junctions add constraint junctions_required_officers_nonnegative check(required_officers>=0) not valid;
alter table public.incidents add constraint incidents_type_allowed check(incident_type in ('COLLISION','CONGESTION','OBSTRUCTION','OTHER')) not valid;
alter table public.incidents add constraint incidents_status_allowed check(status in ('ACTIVE','RESOLVED')) not valid;
alter table public.officers add constraint officers_status_allowed check(status in ('OFF_DUTY','AVAILABLE','ON_PATROL','BUSY','EN_ROUTE','DEPLOYED')) not valid;
alter table public.recommendations add constraint recommendations_status_allowed check(status in ('PENDING','ACCEPTED','MODIFIED','REJECTED')) not valid;
alter table public.decision_logs add constraint decisions_allowed check(decision in ('ACCEPTED','MODIFIED','REJECTED')) not valid;

create unique index if not exists recommendations_one_pending_per_incident
  on public.recommendations(incident_id) where status='PENDING' and incident_id is not null;
create unique index if not exists recommendations_one_pending_without_incident
  on public.recommendations(junction_id) where status='PENDING' and incident_id is null;
create unique index if not exists decision_logs_one_terminal_decision
  on public.decision_logs(recommendation_id);

create or replace function public.protect_historical_junction_fields() returns trigger language plpgsql as $$
begin
  if row(old.historical_crashes,old.fatalities,old.major_injuries,old.minor_injuries,
         old.weighted_severity_index,old.historical_risk_score,old.historical_tier,
         old.confidence,old.evidence_url,old.evidence_note,old.historical_data_period,
         old.data_source_type,old.source_identifier,old.original_source_metadata)
     is distinct from
     row(new.historical_crashes,new.fatalities,new.major_injuries,new.minor_injuries,
         new.weighted_severity_index,new.historical_risk_score,new.historical_tier,
         new.confidence,new.evidence_url,new.evidence_note,new.historical_data_period,
         new.data_source_type,new.source_identifier,new.original_source_metadata) then
    raise exception 'Historical evidence fields are immutable';
  end if;
  new.updated_at=now(); return new;
end $$;

create or replace function public.decide_recommendation(
  p_recommendation_id uuid,p_decision text,p_commander_id uuid,p_notes text default null,
  p_replacement_officer_id uuid default null,p_replacement_junction_id uuid default null
) returns jsonb language plpgsql security definer set search_path=public as $$
declare r public.recommendations%rowtype; chosen_officer uuid; chosen_junction uuid; officer_state text;
begin
  select * into r from public.recommendations where id=p_recommendation_id for update;
  if not found then return jsonb_build_object('code','NOT_FOUND','message','Recommendation not found'); end if;
  if r.status<>'PENDING' then return jsonb_build_object('code','CONFLICT','message','Recommendation has already been decided'); end if;
  if p_decision not in ('ACCEPTED','MODIFIED','REJECTED') then raise exception 'Invalid decision'; end if;
  chosen_officer:=coalesce(p_replacement_officer_id,r.officer_id); chosen_junction:=coalesce(p_replacement_junction_id,r.junction_id);
  if p_decision='MODIFIED' and (p_replacement_officer_id is null or p_replacement_junction_id is null) then raise exception 'Modified decision requires officer and junction'; end if;
  if p_decision in ('ACCEPTED','MODIFIED') then
    select status into officer_state from public.officers where id=chosen_officer for update;
    if not found then return jsonb_build_object('code','NOT_FOUND','message','Officer not found'); end if;
    if officer_state<>'AVAILABLE' then return jsonb_build_object('code','CONFLICT','message','Officer is no longer available'); end if;
    perform 1 from public.junctions where id=chosen_junction;
    if not found then return jsonb_build_object('code','NOT_FOUND','message','Junction not found'); end if;
  end if;
  update public.recommendations set status=p_decision,officer_id=chosen_officer,junction_id=chosen_junction,
    commander_decision_at=now(),commander_notes=p_notes where id=r.id;
  if p_decision in ('ACCEPTED','MODIFIED') then
    update public.officers set status='EN_ROUTE',available=false,current_junction_id=chosen_junction,updated_at=now() where id=chosen_officer;
  end if;
  insert into public.decision_logs(recommendation_id,commander_id,decision,decision_notes)
    values(r.id,p_commander_id,p_decision,p_notes);
  return jsonb_build_object('code','OK','recommendation_id',r.id,'status',p_decision,'officer_id',chosen_officer,'junction_id',chosen_junction);
end $$;

create or replace function public.confirm_officer_arrival(p_officer_id uuid,p_junction_id uuid)
returns jsonb language plpgsql security definer set search_path=public as $$
declare o public.officers%rowtype; target_count integer; required_count integer;
begin
  select * into o from public.officers where id=p_officer_id for update;
  if not found then return jsonb_build_object('code','NOT_FOUND','message','Officer not found'); end if;
  if o.status='DEPLOYED' and o.current_junction_id=p_junction_id then return jsonb_build_object('code','CONFLICT','message','Arrival has already been confirmed'); end if;
  if o.status<>'EN_ROUTE' or o.current_junction_id is distinct from p_junction_id then return jsonb_build_object('code','CONFLICT','message','Officer has no matching en-route assignment'); end if;
  perform 1 from public.recommendations where officer_id=p_officer_id and junction_id=p_junction_id and status in ('ACCEPTED','MODIFIED');
  if not found then return jsonb_build_object('code','CONFLICT','message','No accepted assignment exists'); end if;
  update public.officers set status='DEPLOYED',available=false,current_junction_name=(select name from public.junctions where id=p_junction_id),assignments_completed=assignments_completed+1,updated_at=now() where id=p_officer_id;
  select count(*) into target_count from public.officers where current_junction_id=p_junction_id and status='DEPLOYED';
  select required_officers into required_count from public.junctions where id=p_junction_id for update;
  update public.junctions set assigned_officers=target_count,is_unmanned=(target_count=0),
    coverage_gap=case when required_count<=0 then 0 else greatest(0,required_count-target_count)::numeric/required_count end where id=p_junction_id;
  return jsonb_build_object('code','OK','officer_id',p_officer_id,'junction_id',p_junction_id,'arrived_at',now());
end $$;

create or replace function public.resolve_incident(p_incident_id uuid)
returns jsonb language plpgsql security definer set search_path=public as $$
declare i public.incidents%rowtype; j public.junctions%rowtype; remaining numeric; score numeric; level text;
begin
  select * into i from public.incidents where id=p_incident_id for update;
  if not found then return jsonb_build_object('code','NOT_FOUND','message','Incident not found'); end if;
  if i.status<>'ACTIVE' then return jsonb_build_object('code','CONFLICT','message','Incident has already been resolved'); end if;
  update public.incidents set status='RESOLVED',resolved_at=now() where id=i.id;
  select coalesce(max(severity),0) into remaining from public.incidents where junction_id=i.junction_id and status='ACTIVE';
  select * into j from public.junctions where id=i.junction_id for update;
  score:=round(100*(.30*(j.historical_risk_score/100.0)+.25*coalesce(j.current_congestion,0)+.15*coalesce(j.current_violations,0)+.10*coalesce(j.current_obstruction,0)+.05*coalesce(j.current_weather,0)+.05*coalesce(j.current_event,0)+.10*remaining));
  level:=case when score>=80 then 'CRITICAL' when score>=60 then 'HIGH' when score>=35 then 'MEDIUM' else 'LOW' end;
  update public.junctions set current_incident=remaining,current_risk_score=score,current_risk_level=level where id=j.id;
  return jsonb_build_object('code','OK','incident_id',i.id,'junction_id',j.id,'remaining_incident_factor',remaining,'current_risk_score',score,'current_risk_level',level);
end $$;

revoke all on function public.decide_recommendation(uuid,text,uuid,text,uuid,uuid) from public;
revoke all on function public.confirm_officer_arrival(uuid,uuid) from public;
revoke all on function public.resolve_incident(uuid) from public;
grant execute on function public.decide_recommendation(uuid,text,uuid,text,uuid,uuid) to service_role;
grant execute on function public.confirm_officer_arrival(uuid,uuid) to service_role;
grant execute on function public.resolve_incident(uuid) to service_role;

drop policy if exists "authenticated read decision logs" on public.decision_logs;
create policy "authenticated read decision logs" on public.decision_logs for select to authenticated using(true);
drop policy if exists "authenticated read realtime locations" on public.realtime_locations;
create policy "authenticated read realtime locations" on public.realtime_locations for select to authenticated using(true);

do $$ begin
  if not exists(select 1 from pg_publication_tables where pubname='supabase_realtime' and schemaname='public' and tablename='decision_logs') then alter publication supabase_realtime add table public.decision_logs; end if;
end $$;
