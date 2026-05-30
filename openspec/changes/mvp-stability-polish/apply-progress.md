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
