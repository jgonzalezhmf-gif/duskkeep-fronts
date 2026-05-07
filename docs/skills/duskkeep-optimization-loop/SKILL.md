---
name: duskkeep-optimization-loop
description: "Use this skill whenever doing repeated Duskkeep Fronts optimization, refactoring, cleanup, performance, maintainability, God-class reduction, module extraction, or quality-hardening passes. It keeps each iteration small, validates correctly, updates changelog/version, commits intentionally, and avoids mixing unrelated assets or gameplay changes."
---

# Duskkeep Fronts Optimization Loop

Use this skill when the user asks to keep optimizing, reduce large files, improve maintainability, harden architecture, review God classes, or continue a sequence of cleanup/refactor iterations.

## Goal

Improve code quality in safe, reviewable slices without changing gameplay, economy, audio, routes, progression, or visuals unless explicitly requested.

## Pre-Edit Checklist

1. Inspect `git status --short`.
2. Ignore unrelated raw/source assets unless the task is asset pipeline work.
3. Pick one small optimization with a clear boundary.
4. Prefer extraction over behavior changes when reducing large files.
5. Identify whether the slice touches UI, domain logic, data, persistence, tests, audio or build tooling.
6. If audio is in scope, be extra conservative and preserve one-track-at-a-time behavior.

## Good Optimization Targets

Prefer:
- Extracting pure JSX helpers from large components.
- Extracting constants, manifests or pure helpers from God files.
- Moving domain rules out of components into `features/*`, `data/*` or `lib/*`.
- Splitting large UI files by scene, concern, or reusable visual primitive.
- Reducing duplicated asset lookups by using manifests.
- Adding focused tests for extracted domain behavior.

Avoid:
- Refactors that change gameplay, balance, economy or progression as a side effect.
- Broad renames across the repo without a functional need.
- Combining visual redesign, gameplay changes and architecture cleanup in one commit.
- Touching raw/source assets unless explicitly requested.
- Browser validation for pure non-visual refactors unless the risk justifies it.

## Iteration Shape

Use this loop:

1. Announce the specific optimization target.
2. Read only the files needed to understand that target.
3. Apply a small patch.
4. Run `npm.cmd run typecheck` early.
5. Run `npm.cmd run check:full` before closing if the change affects app code.
6. Bump patch version with `npm.cmd version <next> --no-git-tag-version`.
7. Update `CHANGELOG.md` under the new version.
8. Run `npm.cmd run typecheck` again after versioning.
9. Run `git diff --check`.
10. Verify the GitHub repo is private before pushing.
11. Stage only intended files.
12. Commit with a narrow message.
13. Push.
14. Report commit hash, checks, and remaining risks.

## Versioning

Use `PATCH` for:
- Refactors.
- Cleanup.
- Documentation.
- Tests.
- Small internal performance work.

Use `MINOR` only for new user-facing systems or visible UX changes.

## Commit Scope

Before commit, check:
- No `.env*`, logs, screenshots, build output or raw/source assets are staged.
- No unrelated user changes are staged.
- `package.json`, `package-lock.json` and `CHANGELOG.md` are included when closing an iteration.
- The staged diff matches the announced target.

## Output

Keep final updates concise:
- What was optimized.
- Version and commit hash.
- Checks run.
- What was intentionally not touched.
- Any pending raw assets or unrelated files if present.
