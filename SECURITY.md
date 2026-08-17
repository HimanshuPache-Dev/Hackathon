# Nagpur SafeFlow security operations

The API trusts commander accounts only when Supabase Auth sets `app_metadata.role` to `commander`. Do not use editable `user_metadata` for authorization. Assign that role manually through a trusted administrative workflow, then sign in again for a fresh token.

Keep `SUPABASE_SERVICE_ROLE_KEY`, `OFFICER_JWT_SECRET`, database passwords, and officer PINs server-side. Rotate every credential previously shared in chat or committed elsewhere. The browser and mobile clients may contain only publishable/anon keys. Configure `WEB_ORIGIN` as a comma-separated allowlist in production.

Before deployment:

1. Back up the database and review `supabase/migrations/004_security_and_consistency_fixes.sql`.
2. Apply it manually to the intended Supabase project; this repository does not apply it automatically.
3. Run `npx ts-node scripts/hash-existing-officer-pins.ts` once to replace legacy plaintext PIN values with bcrypt hashes.
4. Set a random `OFFICER_JWT_SECRET` of at least 32 characters and restart the API.
5. Execute `supabase/tests/security-and-consistency.sql` in a non-production validation environment.

## Migration and staging order

Apply migrations to a disposable or staging project in numeric order: `001`, `002`, `004`, then `005`. Migration `003` was never created. Before `004`, inspect existing pending recommendations and decision logs for duplicates because its unique indexes intentionally reject inconsistent data. Migration `005` makes incident simulation and location updates atomic, adds operational notes, and narrows browser Realtime reads to commander-role Supabase users.

Recommended staging sequence: back up the target, run `supabase migration list`, review `supabase db diff`, apply with `supabase db push`, then execute both SQL files in `supabase/tests/` inside the disposable project. Confirm commander JWT `app_metadata`, recommendation decisions, arrival, multi-incident resolution, location updates, and Realtime before production promotion. Database rollback is restore-from-backup; do not attempt to undo these security migrations by deleting operational records.

### Officer API

`POST /api/officers/:officerId/notes` accepts `{ note, junction_id?, incident_id? }` with the signed officer bearer token. `GET /api/officers/:officerId/assignments` returns only that authenticated officer's accepted or modified assignment. Location updates and notes derive identity from the verified JWT, never from request bodies.

## Mobile limitation

The existing mobile application is outside this web-security change. Until it is upgraded to use the signed officer token and the protected officer endpoints, it must be treated as incompatible with the hardened API. Do not weaken API authorization to accommodate the old client.
