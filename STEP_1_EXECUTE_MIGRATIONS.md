# Step 1 — Execute SafeFlow migrations in disposable staging

This procedure is for a separate, disposable Supabase staging project only. It does not authorize a production migration or deployment. Never paste passwords, access tokens, database URLs, service-role keys, personal information, or exact coordinates into this file, Git, chat, screenshots, or command output.

## Stop conditions

Do not run `supabase db push` unless every item below is complete:

- [ ] The target project is confirmed to be disposable staging, not production.
- [ ] The staging project reference has been checked in the Supabase dashboard.
- [ ] A fresh staging backup exists outside this repository and is non-empty.
- [ ] Only one operator will run the migration.
- [ ] `supabase migration list` shows no unexplained local/remote divergence.
- [ ] Preflight duplicate and schema-conflict checks return no blocking results.
- [ ] The application commit and UTC start time have been recorded without secrets.

If any check fails, stop. Do not delete data, repair migration history, or edit an already-applied migration automatically.

## Required migration order

Apply the existing files exactly once, in this order:

1. `001_initial_schema.sql`
2. `002_data_provenance.sql`
3. `003_legacy_decision_log_reconciliation.sql`
4. `004_security_and_consistency_fixes.sql`
5. `005_atomic_operations_and_realtime_auth.sql`
6. `006_officer_mobile_workflows.sql`

Migration `003` is an approved, one-time reconciliation for legacy duplicate terminal decision logs. It archives every duplicate row in a service-role-only table before retaining one canonical active log per recommendation, allowing migration `004` to enforce uniqueness.

Migration `006` is a once-only forward migration. Do not rewrite it if it has already been applied. Mobile assignment synchronization uses authenticated polling; mobile Realtime, push notifications, and background GPS are not implemented.

## 1. Confirm local files

From the repository root:

```powershell
Get-ChildItem -LiteralPath .\supabase\migrations -File | Sort-Object Name | Select-Object Name,Length
```

Confirm that the six filenames above appear and are non-empty.

## 2. Create and verify a staging backup

Follow the full backup checklist in `STAGING_VERIFICATION.md`. Store all dumps outside this repository. Confirm each backup command exits successfully and each required file is non-empty.

Do not continue merely because Supabase reports that a platform backup exists. Record the restore method and confirm that the staging plan supports it.

## 3. Authenticate and link staging

Use the project reference copied directly from the disposable staging project's dashboard:

```powershell
supabase login
$stagingProjectRef = "YOUR_DISPOSABLE_STAGING_PROJECT_REF"
supabase link --project-ref $stagingProjectRef
supabase projects list
supabase migration list
```

Visually confirm that the linked project is staging. If the project identity is unclear, stop and unlink rather than guessing.

## 4. Run preflight checks

Set the staging database URL through a secure local secret mechanism. Do not save it in the repository or shell history.

```powershell
psql $env:STAGING_DATABASE_URL -v ON_ERROR_STOP=1 -c "select current_database(), current_user, version();"
psql $env:STAGING_DATABASE_URL -v ON_ERROR_STOP=1 -c "select status,incident_id,junction_id,count(*) from public.recommendations where status='PENDING' group by status,incident_id,junction_id having count(*)>1;"
psql $env:STAGING_DATABASE_URL -v ON_ERROR_STOP=1 -c "select recommendation_id,count(*) from public.decision_logs group by recommendation_id having count(*)>1;"
```

Also inspect the target for partially created `006` columns, named constraints, functions, tables, and RLS policies. Any unexpected existing object or duplicate row is a stop condition and requires separate remediation approval.

## 5. Preview and apply to staging

Review the pending set before execution:

```powershell
supabase migration list
supabase db push --dry-run
```

If the dry run shows exactly the expected pending migrations and no unexplained conflict, apply them to disposable staging:

```powershell
supabase db push
supabase migration list
```

Do not treat `already exists`, partial execution, or migration-history mismatch as success. Do not run `supabase migration repair` without a separate investigation and approval.

## 6. Run rollback-wrapped SQL tests

```powershell
psql $env:STAGING_DATABASE_URL -v ON_ERROR_STOP=1 -f .\supabase\tests\security-and-consistency.sql
psql $env:STAGING_DATABASE_URL -v ON_ERROR_STOP=1 -f .\supabase\tests\atomic-operations.sql
psql $env:STAGING_DATABASE_URL -v ON_ERROR_STOP=1 -f .\supabase\tests\officer-mobile-workflows.sql
```

Each script must finish without an unhandled error and end in `ROLLBACK`. Record only sanitized results.

## 7. Application verification

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
git diff --check
```

Complete the API, authentication, incident, recommendation, arrival, notes, location, Realtime, historical-protection, and physical-device checklists in `STAGING_VERIFICATION.md`.

## 8. Go/no-go record

Record the following without sensitive values:

- Branch and commit
- Sanitized staging project reference
- Backup completion time and restore method
- Migration list before and after
- Migration command exit code
- SQL test results
- Application command results
- Smoke-test results
- Remaining failures and limitations

Staging success does not automatically authorize production. Production migration requires separate explicit approval after every critical blocker has been verified.

## Recovery

If migration or verification fails, stop staging traffic and preserve sanitized logs. Prefer restoring or recreating the disposable staging project from the verified backup. Do not write ad-hoc reverse SQL, modify historical data, or repair migration history automatically. Follow the rollback and restore plan in `STAGING_VERIFICATION.md`.
