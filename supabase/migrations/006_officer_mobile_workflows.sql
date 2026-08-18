-- Officer mobile acknowledgements and field reports. Does not modify risk or historical evidence.
alter table public.recommendations add column if not exists officer_response_status text not null default 'PENDING';
alter table public.recommendations add column if not exists officer_responded_at timestamptz;
alter table public.recommendations add column if not exists officer_response_reason text;
alter table public.recommendations add column if not exists officer_arrived_at timestamptz;
alter table public.recommendations add constraint recommendations_officer_response_allowed check(officer_response_status in ('PENDING','ACCEPTED','REJECTED','ARRIVED')) not valid;

create table if not exists public.officer_assignment_events(
  id uuid primary key default gen_random_uuid(),recommendation_id uuid not null references public.recommendations(id),
  officer_id uuid not null references public.officers(id),response text not null check(response in ('ACCEPTED','REJECTED')),
  reason text,created_at timestamptz not null default now(),unique(recommendation_id)
);
create table if not exists public.field_reports(
  id uuid primary key default gen_random_uuid(),officer_id uuid not null references public.officers(id),junction_id uuid references public.junctions(id),
  incident_type text not null check(incident_type in ('COLLISION','CONGESTION','OBSTRUCTION','MEDICAL_EMERGENCY','OTHER')),
  severity numeric(3,2) not null check(severity between 0 and 1),note text not null check(length(btrim(note)) between 3 and 2000),
  latitude numeric(10,5) not null check(latitude between -90 and 90),longitude numeric(10,5) not null check(longitude between -180 and 180),created_at timestamptz not null default now()
);
alter table public.officer_assignment_events enable row level security;alter table public.field_reports enable row level security;
create policy "commander read assignment events" on public.officer_assignment_events for select to authenticated using(public.is_commander());
create policy "commander read field reports" on public.field_reports for select to authenticated using(public.is_commander());

create or replace function public.respond_to_officer_assignment(p_officer_id uuid,p_recommendation_id uuid,p_response text,p_reason text default null)
returns jsonb language plpgsql security definer set search_path=public as $$
declare r public.recommendations%rowtype;o public.officers%rowtype;
begin
  if p_response not in ('ACCEPTED','REJECTED') then return jsonb_build_object('code','INVALID','message','Invalid assignment response');end if;
  if p_response='REJECTED' and length(btrim(coalesce(p_reason,'')))<3 then return jsonb_build_object('code','INVALID','message','Rejection reason is required');end if;
  select * into r from public.recommendations where id=p_recommendation_id for update;
  if not found or r.officer_id<>p_officer_id then return jsonb_build_object('code','NOT_FOUND','message','Assignment not found');end if;
  if r.status not in ('ACCEPTED','MODIFIED') then return jsonb_build_object('code','CONFLICT','message','Assignment is not commander-approved');end if;
  if r.officer_response_status<>'PENDING' then return jsonb_build_object('code','CONFLICT','message','Assignment response already recorded');end if;
  select * into o from public.officers where id=p_officer_id for update;if not found then return jsonb_build_object('code','NOT_FOUND','message','Officer not found');end if;
  update public.recommendations set officer_response_status=p_response,officer_responded_at=now(),officer_response_reason=case when p_response='REJECTED' then btrim(p_reason) else null end where id=r.id;
  if p_response='ACCEPTED' then update public.officers set status='EN_ROUTE',available=false,current_junction_id=r.junction_id,updated_at=now() where id=o.id;
  else update public.officers set status='AVAILABLE',available=true,current_junction_id=null,current_junction_name=null,assignments_rejected=coalesce(assignments_rejected,0)+1,updated_at=now() where id=o.id and status='EN_ROUTE' and current_junction_id=r.junction_id;end if;
  insert into public.officer_assignment_events(recommendation_id,officer_id,response,reason) values(r.id,o.id,p_response,case when p_response='REJECTED' then btrim(p_reason) else null end);
  return jsonb_build_object('code','OK','recommendation_id',r.id,'officer_response_status',p_response,'officer_status',case when p_response='ACCEPTED' then 'EN_ROUTE' else 'AVAILABLE' end);
end $$;

create or replace function public.confirm_officer_arrival(p_officer_id uuid,p_junction_id uuid)
returns jsonb language plpgsql security definer set search_path=public as $$
declare o public.officers%rowtype;r public.recommendations%rowtype;target_count integer;required_count integer;arrived timestamptz:=now();
begin
  select * into o from public.officers where id=p_officer_id for update;if not found then return jsonb_build_object('code','NOT_FOUND','message','Officer not found');end if;
  if o.status='DEPLOYED' and o.current_junction_id=p_junction_id then return jsonb_build_object('code','CONFLICT','message','Arrival has already been confirmed');end if;
  if o.status<>'EN_ROUTE' or o.current_junction_id is distinct from p_junction_id then return jsonb_build_object('code','CONFLICT','message','Officer has no matching en-route assignment');end if;
  select * into r from public.recommendations where officer_id=p_officer_id and junction_id=p_junction_id and status in ('ACCEPTED','MODIFIED') and officer_response_status='ACCEPTED' order by commander_decision_at desc limit 1 for update;
  if not found then return jsonb_build_object('code','CONFLICT','message','Officer must accept the assignment before arrival');end if;
  update public.officers set status='DEPLOYED',available=false,current_junction_name=(select name from public.junctions where id=p_junction_id),assignments_completed=coalesce(assignments_completed,0)+1,updated_at=arrived where id=p_officer_id;
  update public.recommendations set officer_response_status='ARRIVED',officer_arrived_at=arrived where id=r.id;
  select count(*) into target_count from public.officers where current_junction_id=p_junction_id and status='DEPLOYED';select required_officers into required_count from public.junctions where id=p_junction_id for update;
  update public.junctions set assigned_officers=target_count,is_unmanned=(target_count=0),coverage_gap=case when required_count<=0 then 0 else greatest(0,required_count-target_count)::numeric/required_count end where id=p_junction_id;
  return jsonb_build_object('code','OK','officer_id',p_officer_id,'junction_id',p_junction_id,'arrived_at',arrived);
end $$;

create or replace function public.submit_officer_field_report(p_officer_id uuid,p_incident_type text,p_severity numeric,p_note text,p_latitude numeric,p_longitude numeric,p_junction_id uuid default null)
returns jsonb language plpgsql security definer set search_path=public as $$
declare f public.field_reports%rowtype;
begin
  perform 1 from public.officers where id=p_officer_id and status<>'OFF_DUTY';if not found then return jsonb_build_object('code','CONFLICT','message','Officer must be on duty to report an incident');end if;
  if p_incident_type not in ('COLLISION','CONGESTION','OBSTRUCTION','MEDICAL_EMERGENCY','OTHER') or p_severity not between 0 and 1 or p_latitude not between -90 and 90 or p_longitude not between -180 and 180 or length(btrim(coalesce(p_note,''))) not between 3 and 2000 then return jsonb_build_object('code','INVALID','message','Invalid field report');end if;
  if p_junction_id is not null then perform 1 from public.junctions where id=p_junction_id;if not found then return jsonb_build_object('code','NOT_FOUND','message','Junction not found');end if;end if;
  insert into public.field_reports(officer_id,junction_id,incident_type,severity,note,latitude,longitude) values(p_officer_id,p_junction_id,p_incident_type,p_severity,btrim(p_note),p_latitude,p_longitude) returning * into f;
  return jsonb_build_object('code','OK','report',to_jsonb(f));
end $$;
revoke all on function public.respond_to_officer_assignment(uuid,uuid,text,text) from public;revoke all on function public.submit_officer_field_report(uuid,text,numeric,text,numeric,numeric,uuid) from public;
grant execute on function public.respond_to_officer_assignment(uuid,uuid,text,text) to service_role;grant execute on function public.submit_officer_field_report(uuid,text,numeric,text,numeric,numeric,uuid) to service_role;
