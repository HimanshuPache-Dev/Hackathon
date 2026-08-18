-- Allocate the staffing shortfall for an incident instead of always selecting one officer.
-- This migration changes operational recommendations only; historical evidence is untouched.
drop index if exists public.recommendations_one_pending_per_incident;
create unique index if not exists recommendations_one_pending_officer_per_incident
  on public.recommendations(incident_id,officer_id)
  where status='PENDING' and incident_id is not null;

create or replace function public.simulate_incident_atomic(p_junction_id uuid,p_severity numeric,p_incident_type text,p_reporter_user_id uuid,p_is_simulated boolean)
returns jsonb language plpgsql security definer set search_path=public as $$
declare
  j public.junctions%rowtype;i public.incidents%rowtype;o public.officers%rowtype;
  active_severity numeric;score numeric;level text;gap numeric;distance_km numeric;
  target_count integer;needed_count integer;created_count integer:=0;created jsonb:='[]'::jsonb;new_recommendation jsonb;
begin
  if p_severity not between 0 and 1 then return jsonb_build_object('code','INVALID','message','Severity must be between 0 and 1');end if;
  if p_incident_type not in ('COLLISION','CONGESTION','OBSTRUCTION') then return jsonb_build_object('code','INVALID','message','Unsupported incident type');end if;
  select * into j from public.junctions where id=p_junction_id for update;
  if not found then return jsonb_build_object('code','NOT_FOUND','message','Junction not found');end if;
  insert into public.incidents(junction_id,junction_name,severity,incident_type,is_simulated) values(j.id,j.name,p_severity,p_incident_type,p_is_simulated) returning * into i;
  select coalesce(max(severity),0) into active_severity from public.incidents where junction_id=j.id and status='ACTIVE';
  score:=round(100*(.30*(j.historical_risk_score/100.0)+.25*coalesce(j.current_congestion,0)+.15*coalesce(j.current_violations,0)+.10*coalesce(j.current_obstruction,0)+.05*coalesce(j.current_weather,0)+.05*coalesce(j.current_event,0)+.10*active_severity));
  level:=case when score>=80 then 'CRITICAL' when score>=60 then 'HIGH' when score>=35 then 'MEDIUM' else 'LOW' end;
  update public.junctions set current_incident=active_severity,current_risk_score=score,current_risk_level=level where id=j.id returning * into j;
  if level in ('HIGH','CRITICAL') then
    target_count:=greatest(coalesce(j.required_officers,1),case when active_severity>=.8 then 3 when active_severity>=.5 then 2 else 1 end);
    needed_count:=greatest(0,target_count-coalesce(j.assigned_officers,0));
    gap:=case when target_count<=0 then 0 else needed_count::numeric/target_count end;
    for o in
      select candidate.* from public.officers candidate
      where candidate.status='AVAILABLE' and candidate.available=true and candidate.latitude is not null and candidate.longitude is not null
        and not exists(select 1 from public.recommendations existing where existing.officer_id=candidate.id and existing.status in ('PENDING','ACCEPTED','MODIFIED') and coalesce(existing.officer_response_status,'PENDING') in ('PENDING','ACCEPTED'))
      order by 6371*2*asin(sqrt(power(sin(radians(candidate.latitude-j.latitude)/2),2)+cos(radians(j.latitude))*cos(radians(candidate.latitude))*power(sin(radians(candidate.longitude-j.longitude)/2),2))),candidate.assignments_completed
      limit needed_count for update skip locked
    loop
      distance_km:=6371*2*asin(sqrt(power(sin(radians(o.latitude-j.latitude)/2),2)+cos(radians(j.latitude))*cos(radians(o.latitude))*power(sin(radians(o.longitude-j.longitude)/2),2)));
      insert into public.recommendations(junction_id,incident_id,officer_id,recommendation_text,travel_time_minutes,expected_risk_reduction,deployment_priority,reasons,confidence)
      values(j.id,i.id,o.id,'Deploy badge '||o.badge_code||' to '||j.name,greatest(2,ceil(distance_km/(24.0/60.0)))::integer,round(100.0/target_count),round(.85*score+15*gap),array[level||' current risk ('||score||'/100)',needed_count||' officer staffing shortfall','Available officer ranked by distance ('||round(distance_km,1)||' km)'],j.confidence)
      returning to_jsonb(recommendations.*) into new_recommendation;
      created:=created||jsonb_build_array(new_recommendation);created_count:=created_count+1;
    end loop;
  end if;
  return jsonb_build_object('code','OK','incident',to_jsonb(i),'junction',to_jsonb(j),'recommendation',case when created_count=0 then null else created->0 end,'recommendations',created,'recommended_officer_count',created_count,'requested_officer_count',coalesce(needed_count,0));
end $$;

revoke all on function public.simulate_incident_atomic(uuid,numeric,text,uuid,boolean) from public;
grant execute on function public.simulate_incident_atomic(uuid,numeric,text,uuid,boolean) to service_role;
