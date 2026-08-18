-- Run only after migration 006 on a disposable database with seeded junction/officer fixtures.
begin;
\pset tuples_only on
select '1..1';
set local role postgres;
do $$ declare j uuid;o uuid;i uuid;r uuid;result jsonb;risk_before numeric;history_before jsonb;begin
  select id,current_risk_score,to_jsonb(x) into j,risk_before,history_before from (select id,current_risk_score,historical_crashes,fatalities,major_injuries,minor_injuries,weighted_severity_index,historical_risk_score,historical_tier,evidence_url,evidence_note from public.junctions limit 1) x;
  select id into o from public.officers limit 1;if j is null or o is null then raise exception 'Seeded junction and officer required';end if;
  update public.officers set status='AVAILABLE',available=true where id=o;
  insert into public.incidents(junction_id,junction_name,severity,incident_type,is_simulated) select id,name,.1,'OBSTRUCTION',true from public.junctions where id=j returning id into i;
  insert into public.recommendations(junction_id,incident_id,officer_id,recommendation_text,travel_time_minutes,expected_risk_reduction,deployment_priority,reasons,status)
    values(j,i,o,'Mobile workflow test',2,0,1,array['test'],'ACCEPTED') returning id into r;
  result:=public.respond_to_officer_assignment(o,r,'ACCEPTED',null);if result->>'code'<>'OK' then raise exception 'Officer acceptance failed';end if;
  result:=public.respond_to_officer_assignment(o,r,'ACCEPTED',null);if result->>'code'<>'CONFLICT' then raise exception 'Repeated response was not rejected';end if;
  result:=public.confirm_officer_arrival(o,j);if result->>'code'<>'OK' then raise exception 'Accepted officer arrival failed';end if;
  if (select officer_response_status from public.recommendations where id=r)<>'ARRIVED' or (select officer_arrived_at from public.recommendations where id=r) is null then raise exception 'Arrival state was not persisted';end if;
  result:=public.submit_officer_field_report(o,'COLLISION',.7,'Disposable staging field report',21.1458,79.0882,j);if result->>'code'<>'OK' then raise exception 'Field report failed';end if;
  if (select current_risk_score from public.junctions where id=j) is distinct from risk_before then raise exception 'Field report modified risk';end if;
  if (select to_jsonb(x) from (select id,current_risk_score,historical_crashes,fatalities,major_injuries,minor_injuries,weighted_severity_index,historical_risk_score,historical_tier,evidence_url,evidence_note from public.junctions where id=j) x) is distinct from history_before then raise exception 'Field report modified protected junction data';end if;
  update public.officers set status='OFF_DUTY',available=false where id=o;result:=public.submit_officer_field_report(o,'OTHER',.2,'Should be rejected while off duty',21.1458,79.0882,null);if result->>'code'<>'CONFLICT' then raise exception 'Off-duty field report accepted';end if;
end $$;
select 'ok 1 - officer mobile workflow assertions passed';
rollback;
