# SafeFlow staging verification and recovery runbook

This runbook is for a disposable Supabase staging project only. It does not authorize production deployment. Never paste database passwords, service-role keys, access tokens, or dump contents into Git, terminal transcripts, tickets, or chat.

## 1. Readiness verdict

The SQL files are statically ready for staging in this order: `001`, `002`, `004`, `005`. Both test scripts start a transaction and end with `rollback`, so successful test execution does not retain their test mutations.

Stop before applying anything unless all of these are true:

- The linked project reference is visibly the disposable staging project.
- A fresh logical backup exists outside the repository and its files are non-empty.
- Staging contains at least one valid junction and one officer before running `atomic-operations.sql`.
- Existing data has no duplicate pending recommendation per incident, duplicate pending recommendation without an incident per junction, or duplicate decision log per recommendation.
- No constraint with the names introduced by migration `004` already exists outside migration history.
- Only one operator will run `supabase db push`.

Static-review limitations: these scripts have not been executed by PostgreSQL in this repository. Runtime SQL validity, existing-data compatibility, RLS behavior, Realtime publication state, and transaction rollback must be proven in disposable staging.

## 2. Database backup checklist

- [ ] Record the staging project reference, Postgres version, UTC timestamp, current application commit, and operator.
- [ ] Confirm the project in Supabase Dashboard under Database > Backups.
- [ ] If plan-supported, confirm a recent platform backup or PITR restore point.
- [ ] Store the database URL only in a local environment variable.
- [ ] Create role, schema, data, and migration-history dumps outside the Git repository.
- [ ] Confirm every dump command exits successfully.
- [ ] Confirm every dump file exists and is non-empty.
- [ ] Restrict backup-file access and record its secure location and retention date.
- [ ] Remember that database backups contain Storage metadata, not the underlying Storage objects.
- [ ] If custom database roles exist, separately record the need to reset their passwords after restore.

Example PowerShell setup (use a directory outside this repository):

```powershell
$stagingProjectRef = "YOUR_DISPOSABLE_STAGING_PROJECT_REF"
$backupRoot = "C:\SafeFlow-Backups\staging-before-005"
New-Item -ItemType Directory -Path $backupRoot -Force
```

Set `STAGING_DATABASE_URL` through your secure local secret mechanism, then run:

```powershell
supabase db dump --db-url $env:STAGING_DATABASE_URL -f "$backupRoot\roles.sql" --role-only
supabase db dump --db-url $env:STAGING_DATABASE_URL -f "$backupRoot\schema.sql"
supabase db dump --db-url $env:STAGING_DATABASE_URL -f "$backupRoot\data.sql" --use-copy --data-only -x "storage.buckets_vectors" -x "storage.vector_indexes"
supabase db dump --db-url $env:STAGING_DATABASE_URL -f "$backupRoot\migration-history-schema.sql" --schema supabase_migrations
supabase db dump --db-url $env:STAGING_DATABASE_URL -f "$backupRoot\migration-history-data.sql" --use-copy --data-only --schema supabase_migrations
Get-ChildItem -LiteralPath $backupRoot | Select-Object Name,Length,LastWriteTime
```

Do not proceed if a required dump is empty or any command failed.

## 3. Pre-migration database checks

Link and visibly confirm staging:

```powershell
supabase login
supabase link --project-ref $stagingProjectRef
supabase projects list
supabase migration list
```

Run these read-only checks using `psql`:

```powershell
psql $env:STAGING_DATABASE_URL -v ON_ERROR_STOP=1 -c "select current_database(), current_user, version();"
psql $env:STAGING_DATABASE_URL -v ON_ERROR_STOP=1 -c "select status, incident_id, junction_id, count(*) from public.recommendations where status='PENDING' group by status,incident_id,junction_id having count(*)>1;"
psql $env:STAGING_DATABASE_URL -v ON_ERROR_STOP=1 -c "select recommendation_id,count(*) from public.decision_logs group by recommendation_id having count(*)>1;"
psql $env:STAGING_DATABASE_URL -v ON_ERROR_STOP=1 -c "select (select count(*) from public.junctions) junctions,(select count(*) from public.officers) officers;"
```

Any duplicate result is a stop condition. Do not delete or rewrite records automatically; investigate and approve remediation separately.

## 4. Migration-order checklist

- [ ] `001_initial_schema.sql`: base tables, initial historical trigger, RLS, scoring configuration, initial Realtime publication.
- [ ] `002_data_provenance.sql`: provenance fields, numeric coverage gap, decision-log publication.
- [ ] Migration `003` is intentionally absent.
- [ ] `004_security_and_consistency_fixes.sql`: constraints, unique workflow indexes, expanded historical immutability, decision/arrival/resolution RPCs.
- [ ] `005_atomic_operations_and_realtime_auth.sql`: operational notes, atomic simulation/location/note RPCs, commander-only browser read policies.
- [ ] `supabase migration list` shows no unexpected remote-only/local-only divergence.
- [ ] The backup checklist is complete.
- [ ] The preflight duplicate queries return no rows.

Apply to disposable staging only:

```powershell
supabase db push
supabase migration list
```

If migration history is out of sync, stop. Do not run `migration repair` until the difference is understood and independently approved.

## 5. SQL verification checklist

Run both rollback-wrapped scripts:

```powershell
psql $env:STAGING_DATABASE_URL -v ON_ERROR_STOP=1 -f supabase/tests/security-and-consistency.sql
psql $env:STAGING_DATABASE_URL -v ON_ERROR_STOP=1 -f supabase/tests/atomic-operations.sql
```

- [ ] Historical-field mutation was rejected.
- [ ] Lower-severity incident did not overwrite a higher active incident.
- [ ] Higher-severity incident became the active maximum.
- [ ] Final resolution returned the active factor to zero.
- [ ] Repeated incident resolution returned conflict.
- [ ] One successful decision produced exactly one audit record.
- [ ] Repeated decision returned conflict.
- [ ] Arrival changed coverage once and repeated arrival returned conflict.
- [ ] Off-duty location was rejected.
- [ ] Reusing an officer/timestamp produced only one location row.
- [ ] Both scripts completed with `ROLLBACK` and no unhandled error.

## 6. Post-migration smoke-test checklist

### Schema and permissions

- [ ] `operational_notes` exists with RLS enabled.
- [ ] All six RPCs exist: decision, arrival, resolution, simulation, location, and note submission.
- [ ] New operational RPC execution is granted to `service_role`, not `anon` or ordinary `authenticated` users.
- [ ] Commander JWT has `app_metadata.role=commander`.
- [ ] Commander can receive expected Realtime rows.
- [ ] Authenticated non-commander cannot read protected Realtime rows.
- [ ] Browser configuration contains only the publishable key.

### API behavior

- [ ] `/api/health` returns success.
- [ ] Missing commander token returns 401.
- [ ] Non-commander Supabase token returns 403.
- [ ] Commander dashboard loads junctions, officers, incidents, recommendations, decisions, and baseline.
- [ ] One simulated incident atomically returns incident, updated junction, and optional recommendation.
- [ ] A lower second incident preserves the higher active severity.
- [ ] Resolving one incident preserves the remaining active incident.
- [ ] Accept/reject/modify produces one terminal decision and one audit log.
- [ ] Repeated decision returns 409.
- [ ] Officer login returns a signed API JWT without exposing `pin_hash`.
- [ ] Officer A cannot mutate Officer B.
- [ ] Operational notes trim content, reject empty content, and validate optional references.
- [ ] Off-duty location returns 409; eligible location updates both location history and officer coordinates.
- [ ] Valid arrival updates officer and coverage once; repeated arrival returns 409.
- [ ] A 401 in the web client removes the token and returns the user to `/`, the configured login route.

### Application checks

```powershell
npm run typecheck
npm test -- --runInBand
npm run lint
Push-Location frontend
npm run build
Pop-Location
Push-Location mobile
npm run typecheck
Pop-Location
```

## 7. Rollback and restore plan

Prefer restoring the disposable staging project rather than writing ad-hoc reverse SQL. Reverse SQL can silently weaken RLS or remove operational records.

### Stop and contain

1. Stop application traffic to staging and stop all migration operators.
2. Record the failing command, UTC time, migration list, logs, and observed symptoms without recording secrets.
3. Do not retry partial manual SQL or edit migration history.
4. Preserve the failed database for diagnosis when possible.

### Preferred staging recovery

1. Create a fresh disposable Supabase project or use the Dashboard backup/PITR restore workflow when available.
2. Obtain its new database URL through the secure local secret mechanism.
3. Restore role/schema/data and migration history using the pre-migration dumps.
4. Rotate/reset custom-role passwords because logical/platform backups may not preserve them.
5. Relink the CLI to the restored staging project.
6. Run row counts, historical-data checks, application tests, and smoke tests before reopening staging.

Example restore into a newly created empty disposable project:

```powershell
psql $env:RESTORE_DATABASE_URL --single-transaction --variable ON_ERROR_STOP=1 --file "$backupRoot\roles.sql" --file "$backupRoot\schema.sql" --file "$backupRoot\data.sql" --file "$backupRoot\migration-history-schema.sql" --file "$backupRoot\migration-history-data.sql"
```

Restore tooling may require ordering or ownership adjustments for the target Supabase project. If the command fails, stop and retain its logs; do not use partial data as a successful restore.

### Restore validation

- [ ] Expected table row counts match the pre-migration record.
- [ ] Historical risk and evidence fields match the backup.
- [ ] Supabase migration history matches the restored schema.
- [ ] Commander and officer authentication succeed.
- [ ] RLS denies anonymous and unauthorized access.
- [ ] Realtime, incident, recommendation, arrival, notes, and location smoke tests pass.
- [ ] Application points only to restored staging, never production.

## 8. Evidence record

Record without secrets:

- Git commit and branch.
- Staging project reference.
- Backup timestamp and secure location.
- Preflight query results.
- Migration-list output.
- SQL test pass/fail result.
- Application command results.
- Smoke-test operator and UTC completion time.
- Final go/no-go decision.
