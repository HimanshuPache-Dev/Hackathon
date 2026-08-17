-- Run only after migrations 001, 002, 004 and 005 on a disposable database.
-- Every block is wrapped in a transaction and rolled back.
begin;
do $$ declare j uuid; first_i uuid; second_i uuid; result jsonb; begin
  select id into j from public.junctions limit 1;
  if j is null then raise exception 'Fixture junction required'; end if;
  result:=public.simulate_incident_atomic(j,.8,'COLLISION',null,true); first_i:=(result->'incident'->>'id')::uuid;
  if (result->'junction'->>'current_incident')::numeric<>.8 then raise exception 'single incident severity failed'; end if;
  result:=public.simulate_incident_atomic(j,.3,'CONGESTION',null,true); second_i:=(result->'incident'->>'id')::uuid;
  if (result->'junction'->>'current_incident')::numeric<>.8 then raise exception 'lower incident overwrote maximum'; end if;
  result:=public.resolve_incident(second_i);if (result->>'remaining_incident_factor')::numeric<>.8 then raise exception 'lower resolution failed';end if;
  result:=public.resolve_incident(first_i);if (result->>'remaining_incident_factor')::numeric<>0 then raise exception 'final resolution failed';end if;
  result:=public.resolve_incident(first_i);if result->>'code'<>'CONFLICT' then raise exception 'repeat resolution was not rejected';end if;
  result:=public.simulate_incident_atomic(j,.2,'OBSTRUCTION',null,true);
  result:=public.simulate_incident_atomic(j,.9,'COLLISION',null,true);
  if (result->'junction'->>'current_incident')::numeric<>.9 then raise exception 'higher incident did not become maximum'; end if;
end $$;
rollback;

begin;
do $$ declare j uuid;o uuid;r uuid;i uuid;result jsonb;recorded timestamptz:=clock_timestamp();before_count integer;after_count integer;begin
  select id into j from public.junctions limit 1;select id into o from public.officers limit 1;
  if j is null or o is null then raise exception 'Fixture junction and officer required';end if;
  update public.officers set status='AVAILABLE',available=true,current_junction_id=null where id=o;
  insert into public.incidents(junction_id,junction_name,severity,incident_type,is_simulated) select id,name,.1,'OBSTRUCTION',true from public.junctions where id=j returning id into i;
  insert into public.recommendations(junction_id,incident_id,officer_id,recommendation_text,travel_time_minutes,expected_risk_reduction,deployment_priority,reasons,status)
    values(j,i,o,'Atomic test',2,0,1,array['test'],'PENDING') returning id into r;
  result:=public.decide_recommendation(r,'ACCEPTED',null,null,null,null);if result->>'code'<>'OK' then raise exception 'accept failed';end if;
  if (select count(*) from public.decision_logs where recommendation_id=r)<>1 then raise exception 'audit count failed';end if;
  result:=public.decide_recommendation(r,'ACCEPTED',null,null,null,null);if result->>'code'<>'CONFLICT' then raise exception 'duplicate decision accepted';end if;
  select assigned_officers into before_count from public.junctions where id=j;
  result:=public.confirm_officer_arrival(o,j);if result->>'code'<>'OK' then raise exception 'arrival failed';end if;
  select assigned_officers into after_count from public.junctions where id=j;if after_count<before_count then raise exception 'coverage regressed';end if;
  result:=public.confirm_officer_arrival(o,j);if result->>'code'<>'CONFLICT' then raise exception 'duplicate arrival accepted';end if;
  update public.officers set status='OFF_DUTY' where id=o;result:=public.update_officer_location_atomic(o,21.1458,79.0882,5,recorded);if result->>'code'<>'CONFLICT' then raise exception 'off-duty location accepted';end if;
  update public.officers set status='AVAILABLE' where id=o;result:=public.update_officer_location_atomic(o,21.1458,79.0882,5,recorded);if result->>'code'<>'OK' then raise exception 'location failed';end if;
  result:=public.update_officer_location_atomic(o,21.1458,79.0882,5,recorded);if (select count(*) from public.realtime_locations where officer_id=o and timestamp=recorded)<>1 then raise exception 'location idempotency failed';end if;
end $$;
rollback;
