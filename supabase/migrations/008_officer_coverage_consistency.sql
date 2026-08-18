-- Keep operational junction coverage synchronized with deployed officers.
-- Historical crash, casualty, score, tier, provenance and evidence fields are untouched.
create or replace function public.refresh_junction_officer_coverage(p_junction_id uuid)
returns void language plpgsql security definer set search_path=public as $$
declare deployed_count integer;required_count integer;
begin
  if p_junction_id is null then return;end if;
  select count(*) into deployed_count from public.officers where current_junction_id=p_junction_id and status='DEPLOYED';
  select required_officers into required_count from public.junctions where id=p_junction_id for update;
  if found then
    update public.junctions set assigned_officers=deployed_count,is_unmanned=(deployed_count=0),
      coverage_gap=case when coalesce(required_count,1)<=0 then 0 else greatest(0,coalesce(required_count,1)-deployed_count)::numeric/coalesce(required_count,1) end
    where id=p_junction_id;
  end if;
end $$;

create or replace function public.sync_officer_coverage_trigger()
returns trigger language plpgsql security definer set search_path=public as $$
begin
  if tg_op<>'INSERT' then perform public.refresh_junction_officer_coverage(old.current_junction_id);end if;
  if tg_op<>'DELETE' then perform public.refresh_junction_officer_coverage(new.current_junction_id);end if;
  return coalesce(new,old);
end $$;

drop trigger if exists officers_sync_junction_coverage on public.officers;
create trigger officers_sync_junction_coverage
after insert or delete or update of status,current_junction_id on public.officers
for each row execute function public.sync_officer_coverage_trigger();

-- Repair only incomplete fictional demo placements; preserve active en-route work.
update public.officers o set current_junction_id=j.id,current_junction_name=j.name,
  latitude=coalesce(o.latitude,j.latitude),longitude=coalesce(o.longitude,j.longitude),updated_at=now()
from public.junctions j,
  (values('NGP-002','J003'),('NGP-005','J005'),('NGP-008','J012'),('NGP-011','J018'),('NGP-014','J006')) as placement(badge_code,junction_code)
where o.badge_code=placement.badge_code and j.junction_id=placement.junction_code
  and o.status='DEPLOYED' and o.current_junction_id is null;

do $$ declare junction_record record;begin
  for junction_record in select id from public.junctions loop
    perform public.refresh_junction_officer_coverage(junction_record.id);
  end loop;
end $$;

revoke all on function public.refresh_junction_officer_coverage(uuid) from public;
revoke all on function public.sync_officer_coverage_trigger() from public;
grant execute on function public.refresh_junction_officer_coverage(uuid) to service_role;
