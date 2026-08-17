-- Run only against a disposable/test database after migration 004.
begin;
do $$ begin
  begin
    update public.junctions set historical_crashes=historical_crashes+1 where junction_id=(select junction_id from public.junctions limit 1);
    raise exception 'Historical update unexpectedly succeeded';
  exception when others then
    if sqlerrm='Historical update unexpectedly succeeded' then raise; end if;
  end;
end $$;
rollback;
