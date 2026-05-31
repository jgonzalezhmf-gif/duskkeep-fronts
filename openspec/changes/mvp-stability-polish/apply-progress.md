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


## Batch 5 - Frontline stun and draw pacing

Status: complete.

### Completed Tasks

- [x] 4.4 Stunned lane heroes no longer attack, trigger unit passives/aftermath, provide chant aura, breach the core, or originate offensive card abilities from that lane.
- [x] 4.4 Frontline now keeps the opening hand at 3 cards and draws 1 card on normal turn refresh.
- [x] 4.4 Enemy offensive card targeting respects stunned source lanes, while command economy, rewards and server payload shape remain unchanged.

### Deferred Tasks

- Open-lane core damage scaling remains a design follow-up; this batch only prevents stunned units from breaching.
- Leader power cost/value should be reassessed after playtesting the lower draw rate rather than changed blindly.

### TDD Cycle Evidence

| Task | RED | GREEN | REFACTOR |
| --- | --- | --- | --- |
| 4.4 | Added failing tests for lean opening hand, one-card turn refresh, stunned source lanes being unable to play offensive cards, and stunned heroes not breaching. | Focused tests passed after separating initial draw from turn refresh and making stun disable unit-origin combat actions. | Kept the change inside existing pure Frontline rule helpers; no UI or store changes were needed. |

### Validation

- `npm.cmd run test -- tests/frontline.engine.test.ts -t "opening hand|normal turn refresh|stunned front|stunned heroes"` - failed first as expected, then passed, 1 file / 4 focused tests.
- `npm.cmd run test -- tests/frontline.engine.test.ts tests/frontline.preview.test.ts tests/frontline.battleDerivedState.test.ts tests/frontline.resolutionFlow.test.ts tests/frontline.boss.test.ts` - passed, 5 files / 57 tests.
- `npm.cmd run check` - passed.
- `npm.cmd run test` - passed, 87 files / 614 tests.
- `npm.cmd run clean:next; npm.cmd run build; npm.cmd run check:performance; npm.cmd run audit:build` - passed; `.next/static` remains within the 3.00 MB budget.
- `git diff --check` - passed after docs/version updates; Git only reported expected LF/CRLF working-copy warnings.

### Files Changed in This Batch

- `features/frontline/engine.ts` - initial ally turn now starts without an extra draw on top of opening hand.
- `features/frontline/frontlineTurnPreparation.ts` - normal turn draw reduced to 1 and initial draw can be configured.
- `features/frontline/frontlineCardRules.ts` - offensive enemy-front cards require an unstunned acting hero in the source lane.
- `features/frontline/frontlineActorStrike.ts` - stunned heroes remain unable to strike and no longer provide chant aura.
- `features/frontline/frontlineClashEffects.ts` - stunned heroes no longer trigger unit aftermath passives.
- `features/frontline/frontlineBreachRules.ts` - stunned heroes do not count as active breach pressure.
- `tests/frontline.engine.test.ts` - coverage for draw pacing and stun contract.

### Remaining Slices

- Open-lane core damage scaling so buffs remain useful after a lane opens.
- Frontline active front, actor, breach and core damage feedback polish.
- Arena light mutators.
- Release candidate validation.


## Batch 6 - Frontline targeting clarity and leader power affordance

Status: complete.

### Completed Tasks

- [x] 4.5 Frontline starts with 5 cards again while normal turn refresh still draws exactly 1 card.
- [x] 4.5 Beam leader powers can target open enemy lanes and burn the enemy core.
- [x] 4.5 Empty lanes with a support now render that support token instead of looking fully vacant.
- [x] 4.5 The player leader-power button now has an always-visible `Power` label, visible power name, command cost pill, and ready-state glow.

### Rule Clarification

- Hero orders and healing/shield cards require an allied hero in the target lane.
- Field supports can be placed on any allied lane that has no support, even if no allied hero is there.
- Lane-origin offensive cards still require an unstunned acting unit in the same lane.
- Leader powers are commander-origin actions: beam powers can hit a unit/support if present or the enemy core through an open lane.

### TDD Cycle Evidence

| Task | RED | GREEN | REFACTOR |
| --- | --- | --- | --- |
| 4.5 | Updated Frontline engine tests failed for 5-card opening hand and beam leader power targeting an open lane. | Focused tests passed after initial draw was restored and beam targets included all lanes. | Kept normal draw at 1 in `frontlineTurnPreparation.ts`; reused existing direct-damage core fallback. |
| 4.5 UI | Existing empty-lane rendering hid supports because `FrontlineHeroPiece` returned before `SupportToken`. | Browser smoke confirmed the battle route loads and the leader-power button reads as `POWER / SOLAR LANCE / 2` on desktop and mobile. | Reused `SupportToken`, `CombatIcon`, `ResourceIcon`, i18n `frontline.power`, and the existing ready-ring motion class. |

### Validation

- `npm.cmd run test -- tests/frontline.engine.test.ts -t "opening hand|normal turn refresh|beam leader power"` - failed first as expected, then passed.
- `npm.cmd run test -- tests/frontline.engine.test.ts` - passed, 28 tests.
- `npm.cmd run test -- tests/frontline.engine.test.ts tests/frontline.preview.test.ts tests/frontline.battleDerivedState.test.ts tests/frontline.resolutionFlow.test.ts` - passed, 4 files / 45 tests.
- `npm.cmd run check` - passed.
- `npm.cmd run test` - passed, 87 files / 615 tests.
- `npm.cmd run build` - passed.
- `npm.cmd run check:performance` - passed; `.next/static` remains at the 3.00 MB budget.
- `npm.cmd run audit:build` - passed.
- Focused Playwright production smoke on `http://127.0.0.1:3007/battle?start=1` passed for desktop and mobile: no 404s, no filtered console issues, leader-power and resolve buttons visible. Screenshots: `tmp/validation/combat-leader-power-desktop.png`, `tmp/validation/combat-leader-power-mobile.png`.

### Files Changed in This Batch

- `features/frontline/engine.ts` - restores the opening draw to 5-card hand and allows beam leader powers to target open lanes.
- `components/game/frontline/FrontlineHeroPiece.tsx` - renders support tokens on open lanes.
- `components/game/frontline/FrontlineBattleHeader.tsx` - improves leader-power button hierarchy and ready state.
- `tests/frontline.engine.test.ts` - covers opening hand, one-card turn refresh, and open-lane leader power core damage.

### Remaining Slices

- Decide whether open-lane core damage from regular lane buffs/orders needs a separate scaling rule.
- Frontline active front, actor, breach and core damage feedback polish.
- Arena light mutators.
- Release candidate validation.


## Batch 7 - Open-lane breach pressure from attack buffs

Status: complete.

### Completed Tasks

- [x] 4.6 Temporary ATK buffs now increase open-lane breach damage instead of being ignored once the enemy lane is empty.
- [x] 4.6 The lane UI preview uses the same dynamic breach amount as the engine.
- [x] 4.6 Stun behavior remains protected because only active, unstunned heroes contribute temporary attack pressure.

### Rule Clarification

- Open-lane breach keeps its lane base value: left/right 2, center 3.
- Breach-trait heroes keep their existing extra core damage.
- Positive temporary ATK adds controlled extra core pressure: at least +1 when buffed, then roughly +1 per 2 temporary ATK.
- Base hero ATK does not directly convert to breach damage in this slice, preventing a broad balance spike.

### TDD Cycle Evidence

| Task | RED | GREEN | REFACTOR |
| --- | --- | --- | --- |
| 4.6 | Added a failing engine test proving `Twin Slash` on an open lane still dealt the same breach damage as no buff. | Focused engine test passed after adding temporary-pressure scaling to `frontlineBreachRules`. | Extracted reusable breach amount helpers for both engine and UI preview. |
| 4.6 UI | Added derived-state coverage for boosted open-lane breach amount in `analyzeLane`. | Lane status metadata/subtitle now use the dynamic amount. | Existing lane badges and subtitles were reused; no new copy or assets needed. |

### Validation

- `npm.cmd run test -- tests/frontline.engine.test.ts -t "temporary attack buffs"` - failed first as expected, then passed.
- `npm.cmd run test -- tests/frontline.engine.test.ts tests/frontline.battleDerivedState.test.ts -t "temporary attack buffs|boosted open-lane"` - passed, 2 focused tests.
- `npm.cmd run test -- tests/frontline.engine.test.ts tests/frontline.battleDerivedState.test.ts tests/frontline.preview.test.ts tests/frontline.resolutionFlow.test.ts` - passed, 4 files / 47 tests.
- `npm.cmd run check` - passed.
- `npm.cmd run test` - passed, 87 files / 617 tests.
- `npm.cmd run build` - passed.
- `npm.cmd run check:performance` - passed.
- `npm.cmd run audit:build` - passed.
- Focused production Playwright smoke on `http://127.0.0.1:3007/battle?start=1` passed for desktop and mobile: route loads, leader power and resolve controls visible, no 404s, no filtered console issues. Screenshots: `tmp/validation/combat-open-lane-pressure-desktop.png`, `tmp/validation/combat-open-lane-pressure-mobile.png`.

### Files Changed in This Batch

- `features/frontline/frontlineBreachMath.ts` - shared pure breach amount helpers and temporary ATK pressure conversion.
- `features/frontline/frontlineBreachRules.ts` - applies the shared breach amount during end-of-round breach resolution.
- `components/game/frontline/FrontlineLaneInsights.ts` - dynamic breach amount in lane analysis, metadata and subtitles.
- `components/game/frontline/FrontlineBattleLanes.tsx` - breach badge shows dynamic amount.
- `components/game/frontline/FrontlineBattleDerivedState.ts` - selected-lane context uses dynamic breach subtitle.
- `tests/frontline.engine.test.ts` - regression coverage for attack buffs affecting open-lane breach damage.
- `tests/frontline.battleDerivedState.test.ts` - regression coverage for dynamic breach preview.

### Remaining Slices

- Frontline active front, actor, breach and core damage visual feedback polish.
- Arena light mutators.
- Release candidate validation.


## Batch 8 - Breach/core damage visual feedback

Status: complete for task 4.7. Phase 4 remains open only if a later pass decides to polish broader active-front or actor emphasis.

### Completed Tasks

- [x] 4.7 Breach events now target the defending core side in visual state derivation.
- [x] 4.7 Breach feedback uses the same attack-style lane trail as damage, stun and KO events.
- [x] 4.7 Clash spotlight labels breach targets as the relevant core instead of a generic hero/enemy target.
- [x] 4.7 Core shock feedback now shows a breach icon, localized core label and damage amount instead of a raw floating number.

### TDD Cycle Evidence

| Task | RED | GREEN | REFACTOR |
| --- | --- | --- | --- |
| 4.7 | Added failing derived-state coverage proving breach had no defending core target side. | Focused test passed after `eventPrimaryTargetSide` returned the opposite side for breach events. | Reused existing lane trail, clash spotlight, combat icon and i18n core labels; combat rules stayed untouched. |

### Validation

- `npm.cmd run test -- tests/frontline.battleDerivedState.test.ts -t "defending core side"` - failed first as expected, then passed.
- `npm.cmd run test -- tests/frontline.battleDerivedState.test.ts tests/frontline.engine.test.ts tests/frontline.resolutionFlow.test.ts` - passed, 3 files / 40 tests.
- `npm.cmd run check` - passed.
- `npm.cmd run test` - passed, 87 files / 618 tests.
- `npm.cmd run build` - passed.
- `npm.cmd run check:performance` - passed.
- `npm.cmd run audit:build` - passed.
- Focused production Playwright smoke on `http://127.0.0.1:3007/battle?start=1` passed for desktop and mobile after pressing `Resolve clash`: route stayed healthy, no 404s, no filtered console issues, no page errors, and sampled resolution floats had no duplicate labels. Screenshots: `tmp/validation/combat-turn-readability-desktop.png`, `tmp/validation/combat-turn-readability-mobile.png`.
- `git diff --check` - passed after docs/version updates; Git only reported expected LF/CRLF working-copy warnings.
- Focused production Playwright smoke on `http://127.0.0.1:3007/battle?start=1` passed for desktop and mobile: battle route loads, leader-power/resolve/core text is visible, no 404s, no filtered console issues and no page errors. Screenshots: `tmp/validation/combat-breach-core-feedback-desktop.png`, `tmp/validation/combat-breach-core-feedback-mobile.png`.
- `git diff --check` - passed after docs/version updates; Git only reported expected LF/CRLF working-copy warnings.

### Files Changed in This Batch

- `components/game/frontline/FrontlineVisualState.ts` - breach events now derive the defending side as their visual target.
- `components/game/frontline/FrontlineLaneActionTrail.tsx` - breach events receive attack-style lane trail feedback.
- `components/game/frontline/FrontlineClashSpotlight.tsx` - breach target labels name the defending core.
- `components/game/frontline/FrontlineBattleMeters.tsx` - core damage shock shows icon, core label and amount.
- `tests/frontline.battleDerivedState.test.ts` - focused regression for breach visual targeting.

### Remaining Slices

- Arena light mutators.
- Release candidate validation.


## Batch 9 - Turn playback pacing and float deduplication

Status: complete. Phase 4 combat readability is now closed for alpha unless a new concrete combat readability bug appears.

### Completed Tasks

- [x] 4.2 Active turn beats now hold longer, so strikes and support events do not advance before their visible animation has finished.
- [x] 4.3 Reduced-motion handling remains on the existing Frontline animation classes and browser evidence was captured for the changed battle route.
- [x] 4.8 Resolution lane floats now show intent/core-level beats only; unit damage, healing, shields, stuns, summons and KOs use the local target feedback instead of duplicating the same message at lane level.
- [x] 4.8 Core-targeted events no longer appear as hero-local float badges.

### TDD Cycle Evidence

| Task | RED | GREEN | REFACTOR |
| --- | --- | --- | --- |
| 4.8 pacing | Added failing duration coverage requiring unit impact beats to outlast the visible float/attack feedback. | Focused resolution-flow tests passed after increasing per-event playback durations and the max sequence cap. | Kept the change in pure playback timing; no combat rules, command, damage, healing or rewards changed. |
| 4.8 deduplication | Added failing float-selection coverage showing unit hits/heals/shields still produced lane-level floats and core-targeted events still produced hero badges. | Focused derived-state and resolution-flow tests passed after classifying core-targeted events and filtering duplicated unit-level lane floats. | Reused existing hero-local badges, clash spotlight and core/intent lane floats instead of adding another message layer. |

### Validation

- `npm.cmd run test -- tests/frontline.resolutionFlow.test.ts -t "holds unit impact|lane floats"` - failed first as expected, then passed.
- `npm.cmd run test -- tests/frontline.battleDerivedState.test.ts -t "duplicate core-targeted|target-local badge"` - failed first as expected, then passed.
- `npm.cmd run test -- tests/frontline.resolutionFlow.test.ts tests/frontline.battleDerivedState.test.ts tests/frontline.engine.test.ts` - passed, 3 files / 44 tests.
- `npm.cmd run check` - passed.
- `npm.cmd run test` - passed, 87 files / 622 tests.
- `npm.cmd run build` - passed.
- `npm.cmd run check:performance` - passed.
- `npm.cmd run audit:build` - passed.

### Files Changed in This Batch

- `components/game/frontline/FrontlineResolutionFlow.ts` - longer readable playback timings and larger sequence cap.
- `components/game/frontline/FrontlineEventFloats.ts` - lane-level float filtering for intent/core beats only.
- `components/game/frontline/FrontlineVisualState.ts` - core-targeted events no longer trigger hero-local float badges.
- `tests/frontline.resolutionFlow.test.ts` - pacing and lane-float deduplication coverage.
- `tests/frontline.battleDerivedState.test.ts` - hero-local core-target deduplication coverage.

### Remaining Slices

- Arena light mutators.
- Release candidate validation.
