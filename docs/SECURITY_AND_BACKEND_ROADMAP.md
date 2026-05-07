# Security And Backend Roadmap

This document defines the target direction for secure online persistence and future connected features.

## Current State

The alpha is offline-first:

- Player state is stored in localStorage through Zustand persist.
- Supabase schema and SDK are present but not authoritative.
- The game remains playable without network access.

This is acceptable for alpha iteration, but not secure for online economy, ladder or monetized features.

## Security Principle

The browser is not authoritative.

Any future online version must treat client state as a requested action or cached view, not as trusted truth.

## Backend Responsibilities

The backend should validate and persist:

- Account profile and identity.
- Resource balances.
- Adventure progress.
- Key chest claims and loot rolls.
- Shop purchases.
- Premium currency transactions.
- Battle results.
- Arena ladder submissions.
- Daily/weekly reset state.

The client may render previews and local feedback, but the server decides whether sensitive actions are valid.

## Recommended Architecture

### Phase 1: Backend design and schema hardening

- Update Supabase schema to cover current local state.
- Add user ownership to player records.
- Add row-level security policies.
- Define server-side operations for economy-sensitive actions.
- Keep localStorage fallback for development.

### Phase 2: Authenticated persistence MVP

- Add login/auth.
- Migrate local player snapshot into an authenticated account.
- Save non-sensitive profile/progress online.
- Keep battle execution client-side but persist results server-side after validation.

### Phase 3: Authoritative economy

- Move reward claims, shop purchases, key chest opens and premium purchases to backend functions.
- Add idempotency keys for purchases and claims.
- Add audit tables for resources and paid transactions.
- Prevent duplicate claims by database constraints.

### Phase 4: Competitive and monetized systems

- Validate arena results before ladder updates.
- Store deterministic battle seeds and result summaries.
- Add anti-tamper checks for impossible resource/progression changes.
- Integrate payment provider webhooks server-side only.

## Data Model Targets

Minimum future tables:

- `profiles`
- `player_resources`
- `player_heroes`
- `player_cards`
- `frontline_loadouts`
- `adventure_progress`
- `adventure_map_claims`
- `shop_purchases`
- `battle_results`
- `arena_ladder_snapshots`
- `resource_ledger`

## Sensitive Operations

These should become backend/API operations:

- Award rewards.
- Spend resources.
- Buy shop offer.
- Open key chest.
- Claim mission.
- Claim daily login.
- Record battle victory.
- Submit arena result.

Each operation should:

- Authenticate the user.
- Check ownership.
- Validate prerequisites.
- Apply changes atomically.
- Return the updated authoritative snapshot.

## Supabase Guidance

Supabase can be used for:

- Auth.
- Postgres persistence.
- Row-level security.
- Edge Functions or RPC functions for validated actions.

Do not expose service-role keys in the client. Use anon keys only with RLS, and route sensitive mutations through server-side code.

## Migration From LocalStorage

Migration should be explicit:

1. User logs in.
2. Client reads local snapshot.
3. Backend validates snapshot shape and allowed ranges.
4. Backend creates or updates online account.
5. Client switches to online persistence.
6. Local snapshot remains as backup until confirmed synced.

## Risks To Avoid

- Client awarding premium currency directly.
- Client deciding paid purchase success.
- Client submitting arbitrary ladder scores.
- Missing ownership filters on player rows.
- Replaying the same claim request multiple times.
- Storing secrets in `.env.local` and committing them.

## Release Boundary

For the current presentable alpha:

- Offline-first is acceptable.
- Online backend can remain documented and designed.
- Monetization and ladder should not be presented as secure until backend validation exists.
