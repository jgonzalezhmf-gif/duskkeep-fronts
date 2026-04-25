# Supabase integration

The game runs **fully offline** with localStorage by default. Supabase is
optional and off in alpha.

## Enabling

1. Copy `.env.example` → `.env.local`.
2. Fill `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
3. Set `NEXT_PUBLIC_PERSISTENCE=supabase`.
4. Apply schema:
   ```bash
   psql "$SUPABASE_DB_URL" -f supabase/schema.sql
   ```
5. Optional: seed reference data via `supabase/seed.sql`.

The persistence interface (`lib/persistence.ts`) already exposes a
`SupabaseBackend` skeleton. Replace its methods with real queries
against the schema when you're ready.
