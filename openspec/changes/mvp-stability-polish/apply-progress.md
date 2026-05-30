# Apply Progress: MVP Stability and Polish

## Batch 1 - Stabilize current Ladder work

Status: complete.

### Completed Tasks

- [x] 1.1 Active Bronze Ladder opponents are player-like Frontline commanders.
- [x] 1.2 Same-division matchmaking accepts active same-division opponents and rejects stale/mismatched opponents.
- [x] 1.3 Supabase migration contains every frontend Ladder opponent and preset id.
- [x] 1.4 Focused Ladder tests and repo quality check pass.
- [x] 1.5 Production build passes.

### TDD Cycle Evidence

| Task | RED | GREEN | REFACTOR |
| --- | --- | --- | --- |
| 1.1 | Added/kept `ladderOpponentCatalog` catalog assertions for player-like heroes and player card decks. | `npm.cmd run test -- tests/ladderResultState.test.ts tests/ladderOpponentCatalog.test.ts` passed. | No production refactor needed. |
| 1.2 | Added deterministic matchmaking coverage for same-division entropy selection. | Focused Ladder tests passed. | No production refactor needed. |
| 1.3 | Added migration alignment coverage for frontend opponent ids and preset ids. | Focused Ladder tests passed. | No production refactor needed. |
| 1.4 | Quality gates run after tests. | `npm.cmd run check` passed. | No changes needed. |
| 1.5 | Build gate run after quality checks. | `npm.cmd run build` passed. | No changes needed. |

### Validation

- `npm.cmd run test -- tests/ladderResultState.test.ts tests/ladderOpponentCatalog.test.ts` - passed, 2 files / 9 tests.
- `npm.cmd run check` - passed.
- `npm.cmd run build` - passed.
- `npm.cmd run test` - passed, 82 files / 595 tests.
- `npm.cmd run audit:build` - passed; `.next/static` remains 2.98 MB.
- `npm.cmd run check:performance` - passed, with `.next/static` still close to its 3.00 MB budget.
- `git diff --check` - passed; Git only reported expected LF/CRLF working-copy warnings.

### Files Changed in This Batch

- `tests/ladderOpponentCatalog.test.ts` - added deterministic matchmaking and Supabase migration alignment coverage.
- Existing Ladder catalog/preset/migration files were preserved and validated as the current dirty-tree slice.

### Remaining Slices

- Quality validation hardening.
- Shared pending feedback.
- Frontline combat readability.
- Arena light mutators.
- Release candidate validation.


## Batch 2 - Quality validation hardening

Status: complete.

### Completed Tasks

- [x] 2.1 CI runs the MVP quality gates: check, test, build, audit high, build audit, and performance budgets.
- [x] 2.2 Screenshot automation has a global timeout and process-tree cleanup for started servers.
- [x] 2.3 Performance budget gates remain part of local and CI validation.

### TDD Cycle Evidence

| Task | RED | GREEN | REFACTOR |
| --- | --- | --- | --- |
| 2.1 | Added `qualityWorkflow` test before `.github/workflows/quality.yml` existed. | Focused quality tests passed after adding the workflow. | Kept workflow narrow and read-only. |
| 2.2 | Added `captureScreensRuntime` tests before `capture-screens-runtime.mjs` existed. | Focused runtime tests passed after adding timeout and process-tree helpers. | `capture-screens.mjs` now delegates timeout and cleanup logic to helpers. |
| 2.3 | Workflow test requires `audit:build` and `check:performance`; local validation ran both gates. | Build audit and performance check passed. | No budget increase needed. |

### Validation

- `npm.cmd run test -- tests/captureScreensRuntime.test.ts tests/qualityWorkflow.test.ts` - failed first as expected before implementation, then passed, 2 files / 5 tests.
- `npm.cmd run check` - passed.
- `npm.cmd run test` - passed, 84 files / 600 tests.
- `npm.cmd run build` - passed.
- `npm.cmd run audit:high` - passed, 0 vulnerabilities.
- `npm.cmd run audit:build` - passed; `.next/static` remains 2.98 MB.
- `npm.cmd run check:performance` - passed; `.next/static` remains 2.98 MB / 3.00 MB.
- `git diff --check` - passed.

### Files Changed in This Batch

- `.github/workflows/quality.yml` - CI quality gates for check/test/build/audit/performance.
- `scripts/capture-screens-runtime.mjs` - tested timeout and process-tree shutdown helpers.
- `scripts/capture-screens.mjs` - global timeout, idempotent cleanup, Windows taskkill and Unix process-group shutdown.
- `tests/captureScreensRuntime.test.ts` - runtime helper coverage.
- `tests/qualityWorkflow.test.ts` - workflow command coverage.

### Remaining Slices

- Shared pending feedback.
- Frontline combat readability.
- Arena light mutators.
- Release candidate validation.


## Batch 3 - Shared pending feedback

Status: complete.

### Completed Tasks

- [x] 3.1 Shared pending/loading helpers and UI components cover scoped async actions.
- [x] 3.2 Shop purchases, reward/mission/daily claims, Adventure cache/node claims, Auth actions, Arena results and Frontline battle results now surface pending state.
- [x] 3.3 Pending copy is localized in English and Spanish, with helper tests covering double-submit prevention.
- [x] 3.4 Internal screen navigation now shows a transition overlay; the destination label stays accessible but is no longer visible in the center.

### TDD Cycle Evidence

| Task | RED | GREEN | REFACTOR |
| --- | --- | --- | --- |
| 3.1 | Added `pendingActions` helper coverage for stable scoped keys, duplicate starts and clearing independent actions. | Focused pending helper tests passed after adding `lib/pendingActions.ts`. | Shared hook/spinner/label/overlay live in `components/game/shared/PendingActionFeedback.tsx`. |
| 3.2 | Existing UI flows lacked shared pending guards and relied on local one-off busy flags or no visible wait state. | `npm.cmd run check` passed after wiring pending feedback across the selected async flows. | Kept economy, rewards and server-authoritative payloads unchanged; only UI pending state and duplicate-submit guards changed. |
| 3.3 | New pending labels were missing from dictionaries. | English and Spanish dictionaries now include the new keys. | Reused existing i18n fallback behavior for other locales. |
| 3.4 | Added `navigationTransition` tests before the helper existed. | Focused navigation transition tests passed after adding route detection helpers and the global overlay. | Kept route transition feedback bundle-light by reusing `PendingActionOverlay`; visible route text was removed after user feedback while preserving the sr-only label. |

### Validation

- `npm.cmd run test -- tests/pendingActions.test.ts` - passed, 1 file / 3 tests.
- `npm.cmd run test -- tests/navigationTransition.test.ts` - failed first before implementation, then passed, 1 file / 4 tests.
- `npm.cmd run test -- tests/navigationTransition.test.ts tests/pendingActions.test.ts` - passed, 2 files / 7 tests.
- `npm.cmd run check` - passed.
- `npm.cmd run test` - passed, 86 files / 607 tests.
- `npm.cmd run build` - passed.
- `npm.cmd run audit:high` - passed, 0 vulnerabilities.
- `npm.cmd run audit:build` - passed; `.next/static` remains within the 3.00 MB budget after simplifying the shared pending overlay.
- `npm.cmd run check:performance` - passed; `.next/static` is 7,514 bytes under budget after adding navigation transition feedback.
- One-off Playwright smoke on production start `3006` passed: Home `a[href="/arena"]` shows `Opening Arena` transition overlay and lands on `/arena` with no console/page errors.
- `$env:SCREENSHOT_RUN_TIMEOUT_MS='600000'; npm.cmd run screenshots:auto` - passed, 24/24 desktop/mobile scenarios ok; screenshots written to `tmp/playwright-screenshots/2026-05-30T12-39-13-902Z`.
- Follow-up navigation polish after user feedback passed: `npm.cmd run test -- tests/navigationTransition.test.ts`, `npm.cmd run check`, `npm.cmd run test`, `npm.cmd run clean:next; npm.cmd run build; npm.cmd run check:performance; npm.cmd run audit:build`, `git diff --check`, and a production Playwright smoke verifying Home -> Arena shows the overlay, no visible center text, and a spinner below center.
- `git diff --check` - passed; Git only reported expected LF/CRLF working-copy warnings.

### Files Changed in This Batch

- `lib/pendingActions.ts` - pure helpers for pending action keys, start/finish state and duplicate-start prevention.
- `components/game/shared/PendingActionFeedback.tsx` - reusable pending hook, spinner, inline label and overlay.
- `components/game/shared/NavigationTransitionFeedback.tsx` - global internal-navigation overlay driven by link clicks and announced programmatic transitions.
- `tests/pendingActions.test.ts` - focused coverage for pending helper behavior.
- `tests/navigationTransition.test.ts` - focused coverage for internal navigation target detection, route labels and modified-click filtering.
- `lib/navigationTransition.ts` - pure route transition helpers and custom event for programmatic navigation.
- `app/shop/page.tsx`, `app/shop/ShopOfferCards.tsx` - purchase pending state and disabled duplicate buys.
- `app/missions/page.tsx`, `app/missions/MissionContracts.tsx`, `components/game/home/DailyLoginCharm.tsx` - claim pending feedback.
- `components/game/adventure/useAdventureMapPageState.ts`, `app/adventure/page.tsx`, `components/game/adventure/AdventureMissionPanels.tsx`, `components/game/adventure/AdventureMapInteractionPanel.tsx` - Adventure node/cache pending feedback.
- `components/game/auth/GameAuthGate.tsx` - Auth/guest pending labels and reliable busy cleanup.
- `app/arena/page.tsx`, `components/game/BattlePageClient.tsx` - result-submission overlays for Arena/Ladder and Adventure Frontline results.
- `lib/i18n/dictionary-data/en.ts`, `lib/i18n/dictionary-data/es.ts` - localized pending labels.

### Remaining Slices

- Frontline combat readability.
- Arena light mutators.
- Release candidate validation.


## Batch 4 - Frontline enemy-turn readability

Status: complete for task 4.1. Phase 4 remains open for deeper active front/core damage feedback.

### Completed Tasks

- [x] 4.1 Enemy card and power intent beats are visible in the resolution playback before clash impact.
- [x] 4.1 Enemy intent beats are slower than regular damage beats, giving the player time to read each enemy action.
- [x] 4.1 Combat rules, card effects, command economy, rewards and outcomes remain unchanged.

### Partial Tasks

- 4.2 partial: Clash spotlight labels now localize card/power/action side labels and show enemy card beats, but broader active front/core damage polish is still a follow-up.
- 4.3 partial: Browser evidence was captured for this slice; full Phase 4 should keep validating future visual feedback changes.

### TDD Cycle Evidence

| Task | RED | GREEN | REFACTOR |
| --- | --- | --- | --- |
| 4.1 | Added failing coverage for enemy-side card/power events missing from resolution playback and traced enemy-turn snapshots. | Focused Frontline tests passed after surfacing enemy card/power events and increasing their playback duration. | Reused the existing `ClashSpotlight` and resolution flow instead of adding a separate enemy-turn UI system. |
| 4.2 | Added duration coverage to protect the readability pacing distinction. | Clash spotlight now uses existing i18n keys for card, power and side labels. | No new user-facing dictionary keys were needed. |

### Validation

- `npm.cmd run test -- tests/frontline.battleDerivedState.test.ts tests/frontline.resolutionFlow.test.ts` - failed first as expected, then passed, 2 files / 9 tests.
- `npm.cmd run test -- tests/frontline.engine.test.ts tests/frontline.battleDerivedState.test.ts tests/frontline.resolutionFlow.test.ts` - passed, 3 files / 33 tests.
- `npm.cmd run check` - passed.
- `npm.cmd run test` - passed, 87 files / 611 tests.
- `npm.cmd run clean:next; npm.cmd run build; npm.cmd run check:performance; npm.cmd run audit:build` - passed; `.next/static` was 6,915 bytes under the 3.00 MB budget.
- One-off production Playwright smoke on `http://127.0.0.1:3007/battle?start=1` passed: `Resolve clash` showed `CENTER 1/12 CARD Enemy Plague Spit`, no console errors, no page errors and no failed requests. Screenshot: `tmp/playwright-screenshots/frontline-enemy-intent-2026-05-30T14-15-19-668Z.png`.
- `npm.cmd run check` - passed again after docs/version updates.
- `npm.cmd run test -- tests/frontline.engine.test.ts tests/frontline.battleDerivedState.test.ts tests/frontline.resolutionFlow.test.ts` - passed again after docs/version updates, 3 files / 33 tests.
- `git diff --check` - passed after docs/version updates; Git only reported expected LF/CRLF working-copy warnings.

### Files Changed in This Batch

- `features/frontline/frontlineEvents.ts` - enemy card/power events are now visible trace events for playback snapshots.
- `components/game/frontline/FrontlineResolutionFlow.ts` - enemy card/power events are included in resolution playback and receive longer readability durations.
- `components/game/frontline/FrontlineClashSpotlight.tsx` - card/power/action-side labels reuse existing i18n keys.
- `tests/frontline.battleDerivedState.test.ts` - covers enemy card/power playback inclusion.
- `tests/frontline.resolutionFlow.test.ts` - covers enemy intent beat pacing.
- `tests/frontline.engine.test.ts` - covers traced enemy-turn intent snapshots.

### Remaining Slices

- Frontline active front, actor, breach and core damage feedback polish.
- Arena light mutators.
- Release candidate validation.
