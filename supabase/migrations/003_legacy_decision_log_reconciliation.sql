-- One-time reconciliation for decision logs created before terminal decisions
-- became atomic. Every removed active row is preserved in this locked archive.
create table if not exists public.decision_log_duplicate_archive(
  archive_id uuid primary key default gen_random_uuid(),
  original_id uuid not null unique,
  recommendation_id uuid not null,
  commander_id uuid,
  decision text not null,
  decision_notes text,
  original_timestamp timestamptz,
  archived_at timestamptz not null default now(),
  archive_reason text not null default 'LEGACY_DUPLICATE_TERMINAL_DECISION'
);

alter table public.decision_log_duplicate_archive enable row level security;
revoke all on public.decision_log_duplicate_archive from anon,authenticated;
grant select,insert on public.decision_log_duplicate_archive to service_role;

with ranked as(
  select d.*,row_number() over(
    partition by d.recommendation_id
    order by d.timestamp asc nulls last,d.id asc
  ) as row_rank
  from public.decision_logs d
)
insert into public.decision_log_duplicate_archive(
  original_id,recommendation_id,commander_id,decision,decision_notes,original_timestamp
)
select id,recommendation_id,commander_id,decision,decision_notes,timestamp
from ranked where row_rank>1
on conflict(original_id) do nothing;

with ranked as(
  select d.id,row_number() over(
    partition by d.recommendation_id
    order by d.timestamp asc nulls last,d.id asc
  ) as row_rank
  from public.decision_logs d
)
delete from public.decision_logs d
using ranked r
where r.row_rank>1 and d.id=r.id
  and exists(
    select 1 from public.decision_log_duplicate_archive a where a.original_id=d.id
  );
