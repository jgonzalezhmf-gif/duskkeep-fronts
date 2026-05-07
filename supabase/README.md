# Supabase integration

The game runs **fully offline** with localStorage by default. Supabase is
optional and off in alpha.

For the online roadmap, read `docs/SECURITY_AND_BACKEND_ROADMAP.md` before
turning Supabase into an authoritative persistence backend. Client-side state
is not secure for economy, purchases, ladder or reward claims.

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
`SupabaseBackend` skeleton. Replace its methods only after the server-side
validation strategy is defined for sensitive actions.

## Security notes

- Use authenticated user ownership for all player rows.
- Enable row-level security before storing real account data.
- Do not expose service-role keys to the browser.
- Keep paid purchases, premium currency, reward claims and ladder updates
  behind server-side functions or API routes.
- Add idempotency keys for purchases and repeatable claims.
