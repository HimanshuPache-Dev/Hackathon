alter table public.junctions add column if not exists historical_data_period text default 'Source workbook reporting period';
alter table public.junctions add column if not exists data_source_type text default 'HISTORICAL';
alter table public.junctions add column if not exists dynamic_data_status text default 'SIMULATED';
alter table public.junctions add column if not exists last_risk_calculated_at timestamptz default now();
alter table public.junctions alter column coverage_gap type numeric(4,3) using coverage_gap::numeric;
alter table public.junctions alter column coverage_gap set default 1.0;
alter publication supabase_realtime add table public.decision_logs;
