# Architecture

```text
Commander browser
  ├─ Supabase Auth ──────────────────────────────┐
  ├─ HTTPS API ──> Express/TypeScript            │
  │                 ├─ risk calculator           │
  │                 ├─ allocation engine         │
  │                 ├─ recommendation workflow   │
  │                 └─ service-role DB access ───┤
  └─ Supabase Realtime <─────────────────────────┤
                                                 ▼
                                      Supabase PostgreSQL
                                      ├─ immutable junction evidence
                                      ├─ operational state
                                      ├─ incidents / recommendations
                                      ├─ officer GPS
                                      └─ decision audit log
```

The browser receives only the anon key. Privileged writes go through the API, where commander access tokens are verified. The service-role key stays on the backend. Supabase Realtime invalidates the dashboard view after database events; REST reloads remain the source of truth.

## Decision flow

1. A commander creates a labeled simulation for a selected junction.
2. The backend calculates the exact seven-factor weighted score.
3. If the junction is high/critical and unmanned, the allocation engine ranks available officers by distance and prior assignments.
4. A pending recommendation records the reasons, confidence, ETA, expected benefit, and deployment priority.
5. The commander accepts, modifies, or rejects it.
6. The action is written to `decision_logs`; only acceptance changes the officer to `EN_ROUTE`.

Historical crash fields are protected by a PostgreSQL trigger. Current factors and simulations cannot overwrite them.
