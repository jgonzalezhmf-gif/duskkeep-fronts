# Tasks: MVP Stability and Polish

## Review Workload Forecast

- Estimated changed lines for full program: High.
- 400-line budget risk: High for full program; Low for the current Intro session-policy slice.
- Chained PRs recommended: Yes for the full program; not required for the current Intro fix.
- Decision needed before apply: No for `home-intro-session-policy`; ask-on-risk remains active for battle-transition and RC slices.

Decision needed before apply: No
Chained PRs recommended: Yes
Chain strategy: pending
400-line budget risk: High

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
- [x] 4.2 Improve active front, actor, clash, breach, and core damage feedback.
- [x] 4.3 Respect reduced motion and keep browser validation evidence.
- [x] 4.4 Tune stun contract and one-card draw pacing.
- [x] 4.5 Clarify opening hand, leader-power core targeting, support visibility, and leader-power affordance.
- [x] 4.6 Convert open-lane temporary attack buffs into extra breach pressure with matching UI preview.
- [x] 4.7 Improve breach/core-damage visual targeting and impact readability.
- [x] 4.8 Slow turn playback and deduplicate resolution float feedback.

## Phase 5: Arena light mutators

- [x] 5.1 Add data-driven Arena Trial mutator definitions.
- [x] 5.2 Show mutator preview before battle.
- [x] 5.3 Apply lightweight Arena-only effects with focused tests.

## Phase 6: Home intro session policy

- [x] 6.1 Add tested session-only Intro eligibility so Intro can show on fresh tab entry but not after in-tab navigation/back.
- [x] 6.2 Wire `HomePageClient` to mark Intro complete for the current browser tab after Intro/Auth/guest entry.
- [x] 6.3 Validate fresh entry, Home -> route -> browser Back, and tab-reopen behavior.

## Phase 7: Shared battle entry presentation

- [ ] 7.1 Define shared battle-entry metadata for Adventure, Ladder, Arena Trial, Events, and Fortress-style messaging/audio.
- [ ] 7.2 Build a reusable transition UI with mode copy, reduced-motion support, and hero/enemy presentation when data exists.
- [ ] 7.3 Wire Adventure/direct battle, Arena/Ladder, and Events so Frontline battles do not start abruptly.
- [ ] 7.4 Validate desktop/mobile battle entry, mode-specific copy, and battle music timing.

## Phase 8: Release candidate validation

- [ ] 8.1 Run full check/test/build/audit/performance commands.
- [ ] 8.2 Run browser validation for entry, Adventure, Combat, Shop, Arena, Ladder, and mobile/desktop.
- [ ] 8.3 Record residual risks and next recommended slice.
