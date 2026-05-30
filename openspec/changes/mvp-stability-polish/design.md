# Design: MVP Stability and Polish

## Approach

Implement the program as small reviewable slices. The first slice closes current Ladder work; later slices must start from the artifacts in this change and update `tasks.md` and apply progress as they complete.

## Slice Boundaries

1. **Ladder stabilization**: frontend Ladder catalog, player-like Frontline presets, Supabase opponent upsert migration, focused tests, and version/changelog already in progress.
2. **Quality validation hardening**: CI and screenshot cleanup only; no gameplay changes.
3. **Pending feedback**: shared async UI pattern for authoritative actions.
4. **Combat readability**: UI pacing and feedback only; no command/draw/reward changes.
5. **Arena mutators**: data-driven lightweight Arena Trial modifiers with preview and tests.
6. **Release validation**: full checks, browser validation, and residual risk report.

## Architecture Rules

- Gameplay rules stay in `features/*`.
- UI/presentation stays in `components/*` or route-level composition.
- User-facing copy goes through dictionaries.
- Supabase-sensitive flows must continue using existing server-authoritative operation boundaries.
- No new runtime asset path may bypass manifests/fallbacks.

## Review Workload Forecast

- Estimated changed lines for the full program: High.
- Chained PRs recommended: Yes if implemented as one PR.
- Current delivery strategy: ask-on-risk.
- Current apply slice: `stabilize-current-ladder-work`, accepted as a bounded first slice.
