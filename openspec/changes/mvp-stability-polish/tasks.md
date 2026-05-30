# Tasks: MVP Stability and Polish

## Review Workload Forecast

- Estimated changed lines for full program: High.
- 400-line budget risk: High for full program; Low for the current Ladder stabilization slice.
- Chained PRs recommended: Yes for the full program; not required for the current first slice.
- Decision needed before apply: No for `stabilize-current-ladder-work`; ask-on-risk remains active for later slices.

## Phase 1: Stabilize current Ladder work

- [x] 1.1 Verify active Bronze Ladder opponents are player-like Frontline commanders.
- [x] 1.2 Verify same-division matchmaking accepts any active same-division opponent and rejects stale/mismatched opponents.
- [x] 1.3 Verify the Supabase migration contains every frontend Ladder opponent and preset id.
- [x] 1.4 Run focused Ladder tests and the repo quality check.
- [x] 1.5 Run production build before closing the slice.

## Phase 2: Quality validation hardening

- [x] 2.1 Add CI for check/test/build/audit high.
- [x] 2.2 Harden screenshot automation timeout and cleanup.
- [x] 2.3 Preserve performance budget gates.

## Phase 3: Shared pending feedback

- [x] 3.1 Add shared pending/loading pattern for authoritative actions.
- [x] 3.2 Apply it to Shop, rewards/claims, Adventure, Auth, and Arena/Ladder submissions.
- [x] 3.3 Add i18n keys and tests for double-submit prevention where applicable.
- [x] 3.4 Extend pending feedback to internal screen navigation transitions.

## Phase 4: Frontline combat readability

- [x] 4.1 Slow and clarify enemy turn presentation without changing combat rules.
- [ ] 4.2 Improve active front, actor, clash, breach, and core damage feedback.
- [ ] 4.3 Respect reduced motion and keep browser validation evidence.

## Phase 5: Arena light mutators

- [ ] 5.1 Add data-driven Arena Trial mutator definitions.
- [ ] 5.2 Show mutator preview before battle.
- [ ] 5.3 Apply lightweight Arena-only effects with focused tests.

## Phase 6: Release candidate validation

- [ ] 6.1 Run full check/test/build/audit/performance commands.
- [ ] 6.2 Run browser validation for entry, Adventure, Combat, Shop, Arena, Ladder, and mobile/desktop.
- [ ] 6.3 Record residual risks and next recommended slice.
