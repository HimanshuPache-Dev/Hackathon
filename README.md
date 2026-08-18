# PoliceOps

Explainable traffic-risk decision support for Nagpur Traffic Police. The commander web application combines evidence-backed historical junction records, live operational factors, officer coverage, labeled incident simulations, human-reviewed deployment recommendations, and a complete decision audit trail.

## Current web deliverable

- React 18 + Vite commander dashboard with MapLibre mapping
- Express + TypeScript API backed exclusively by Supabase
- Exact weighted risk formula from the supplied scoring specification
- Nearest-available-officer allocation using Haversine distance
- Accept/reject/modify workflow; no autonomous deployment
- Supabase Realtime refresh across junctions, incidents, recommendations, officers, and GPS locations
- PostgreSQL migration with RLS, realtime publication, and a trigger that makes historical evidence immutable
- Idempotent seed importer for all junction and officer source records

The incident simulator creates records with `is_simulated = true`. It never changes the historical crash evidence.

## Setup

1. Create a Supabase project.
2. Run `supabase/migrations/001_initial_schema.sql` in the Supabase SQL editor or with the Supabase CLI.
3. Copy `.env.example` to `.env` and provide the server-side Supabase values. Never expose the service-role key to Vite.
4. Copy the `VITE_*` values into `frontend/.env.local`.
5. Create a commander user in Supabase Authentication.
6. Seed the database and start both services:

```powershell
npm install
npm run seed
npm run dev
```

In another terminal:

```powershell
Set-Location frontend
npm install
npm run dev
```

Open `http://localhost:5173` and sign in with the commander account.

## Production builds

```powershell
npm run build
Set-Location frontend
npm run build
```

Set the frontend deployment's `VITE_API_URL`, `VITE_SUPABASE_URL`, and `VITE_SUPABASE_ANON_KEY`. Set the API deployment's `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, and `WEB_ORIGIN`.

## Data boundaries

- **Historical:** evidence-backed junction fields; database trigger prevents updates.
- **Current:** congestion, weather, violations, obstruction, event pressure, coverage, and GPS state.
- **Simulated:** demo incidents explicitly stored with `is_simulated=true`.
- **Recommended:** explainable suggestions that remain pending until a commander acts.

The source dataset is represented by `data/junctions.ts`; the seed script imports it into Supabase. Runtime clients never fall back to local mock records.

## Repository layout

- `src/` — Express API, risk and allocation services
- `frontend/` — commander dashboard
- `supabase/` — database migration
- `scripts/seed-supabase.ts` — database importer
- `mobile/` — officer app scaffold; web delivery is prioritized first
- `ARCHITECTURE.md` — system and trust boundaries
- `DEMO_SCRIPT.md` — concise judge walkthrough

## Safety and privacy

PoliceOps is decision support, not autonomous policing. Mutating commander routes require an authenticated Supabase session, every recommendation decision creates an audit entry, and field displays use badge codes. Do not place `.env` files, keys, or personally identifying records in source control.
