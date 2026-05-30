# Apply Progress: MVP Stability and Polish

## Batch 1 — Stabilize current Ladder work

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

- `npm.cmd run test -- tests/ladderResultState.test.ts tests/ladderOpponentCatalog.test.ts` — passed, 2 files / 9 tests.
- `npm.cmd run check` — passed.
- `npm.cmd run build` — passed.
- `npm.cmd run test` — passed, 82 files / 595 tests.
- `npm.cmd run audit:build` — passed; `.next/static` remains 2.98 MB.
- `npm.cmd run check:performance` — passed, with `.next/static` still close to its 3.00 MB budget.
- `git diff --check` — passed; Git only reported expected LF/CRLF working-copy warnings.

### Files Changed in This Batch

- `tests/ladderOpponentCatalog.test.ts` — added deterministic matchmaking and Supabase migration alignment coverage.
- Existing Ladder catalog/preset/migration files were preserved and validated as the current dirty-tree slice.

### Remaining Slices

- Quality validation hardening.
- Shared pending feedback.
- Frontline combat readability.
- Arena light mutators.
- Release candidate validation.
