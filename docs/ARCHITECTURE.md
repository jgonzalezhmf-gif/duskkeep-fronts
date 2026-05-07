# Duskkeep Fronts Architecture

This document describes the current alpha architecture and the rules that keep the codebase maintainable while the game grows.

## Goals

- Keep the vertical slice playable while systems evolve.
- Keep gameplay rules out of presentation components.
- Keep visual assets behind manifests and safe fallbacks.
- Keep local persistence working until the online backend is introduced.
- Make the codebase easy to audit, test and extend.

## Stack

- Next.js App Router for routes and screen composition.
- React client components for interactive game screens.
- TypeScript for domain models and compile-time safety.
- Tailwind CSS for responsive game UI.
- Zustand persist for local alpha state.
- Vitest for deterministic gameplay and reward tests.
- Supabase SDK and schema skeleton for the future online persistence pass.

## Layer Boundaries

### `app/`

Route entrypoints and high-level screen wiring. Route files should:

- Select data from the store.
- Compose game components.
- Trigger navigation.
- Avoid embedding balance, economy or combat rules.

### `components/`

Reusable UI and game presentation. Components should:

- Render state clearly.
- Delegate calculations to `features/*`, `data/*` or `lib/*`.
- Use shared icon, background, reward and asset components.
- Avoid speculative asset URLs.

### `features/`

Domain systems and gameplay logic. This is where rules belong:

- `features/frontline`: Duskkeep Fronts combat, cards, presets, hero profiles, fortress integration.
- `features/adventure`: Adventure node resolution, progression, map interactions and rewards.
- `features/battle` and `features/tactical`: legacy/prototype systems that should not grow unless explicitly revived.

### `data/`

Static seed data for alpha content:

- Heroes.
- Adventure levels.
- Shop offers.
- Missions.
- Fortress buildings.
- Frontline presets and cards.

Data files can define values and configuration, but behavior should still live in feature helpers.

### `lib/`

Shared infrastructure:

- Zustand store and persistence.
- Shared types.
- Reward visibility helpers.
- Asset manifests.
- I18n dictionaries.
- RNG and constants.

`lib/store.ts` is currently a large orchestrator. New rules should be extracted into feature helpers when they are not simple state transitions.

## Data Flow

1. Static content is defined in `data/*` and feature-specific data files.
2. Feature helpers derive gameplay state, rewards, unlocks and UI-ready summaries.
3. `lib/store.ts` persists player state and calls feature helpers to mutate progress.
4. Routes in `app/*` select state and compose screens.
5. Components render visual state with shared assets and fallbacks.

## Persistence Strategy

Current alpha:

- Zustand persist writes to `localStorage`.
- The game is offline-first and playable without a backend.
- `supabase/schema.sql` and `lib/persistence.ts` prepare the future backend direction.

Future online mode:

- Client state becomes a cache, not the authority.
- Server-side functions validate economy-sensitive actions.
- Battle results, rewards, purchases and ladder updates must be verified before persistence.

## Quality Principles

- Single responsibility: keep rules, data and presentation separated.
- Open/closed: add new cards, nodes, rewards and assets through registries and manifests.
- Dependency inversion: UI depends on typed helpers and interfaces, not raw storage or backend details.
- Determinism: combat and reward systems should be testable with stable seeds where applicable.
- Safe fallbacks: optional assets must degrade without 404s.

## Current Technical Risks

- `lib/store.ts` is powerful but too broad; continue extracting domain helpers.
- Some legacy systems still exist and should be isolated from the main Frontline flow.
- Online persistence is not yet authoritative; do not treat client resources as secure.
- The app is visually rich, so browser smoke tests and asset validation matter before release.

## Extension Rules

- New gameplay rules go into `features/*`.
- New visual assets go through manifests before UI usage.
- New rewards must use `Rewards` helpers and shared reward UI.
- New screens should reuse `ScreenScaffold`, `ScreenBackground`, `GameBackNav`, shared icons and reward tokens.
- New persistence fields require migration defaults in the store.
