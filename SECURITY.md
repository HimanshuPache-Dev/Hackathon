# Nagpur SafeFlow security operations

The API trusts commander accounts only when Supabase Auth sets `app_metadata.role` to `commander`. Do not use editable `user_metadata` for authorization. Assign that role manually through a trusted administrative workflow, then sign in again for a fresh token.

Keep `SUPABASE_SERVICE_ROLE_KEY`, `OFFICER_JWT_SECRET`, database passwords, and officer PINs server-side. Rotate every credential previously shared in chat or committed elsewhere. The browser and mobile clients may contain only publishable/anon keys. Configure `WEB_ORIGIN` as a comma-separated allowlist in production.

Before deployment:

1. Back up the database and review `supabase/migrations/004_security_and_consistency_fixes.sql`.
2. Apply it manually to the intended Supabase project; this repository does not apply it automatically.
3. Run `npx ts-node scripts/hash-existing-officer-pins.ts` once to replace legacy plaintext PIN values with bcrypt hashes.
4. Set a random `OFFICER_JWT_SECRET` of at least 32 characters and restart the API.
5. Execute `supabase/tests/security-and-consistency.sql` in a non-production validation environment.

## Mobile limitation

The existing mobile application is outside this web-security change. Until it is upgraded to use the signed officer token and the protected officer endpoints, it must be treated as incompatible with the hardened API. Do not weaken API authorization to accommodate the old client.
