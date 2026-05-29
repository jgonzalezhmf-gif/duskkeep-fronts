---
name: duskkeep-task-triage
description: "Use this skill whenever the user says sigamos, siguiente, next, vamos alla, vamos, adelante, asks que queda/como vamos/proximos pasos, or when a long Duskkeep Fronts block may be finished. It prevents endless iteration by checking project status, deciding whether the current block is closed, choosing the next highest-value task, and stating the expected iteration budget before continuing."
---

# Duskkeep Fronts Task Triage

Use this skill before choosing what to do next when the user gives a continuation prompt or asks about remaining work.

The goal is momentum without loops: finish blocks when they are stable, do not keep refactoring by inertia, and move to the next useful area when the current one is good enough for alpha.

## Required Context

Read only what is needed, in this order:

1. `docs/PROJECT_STATUS_AND_NEXT_STEPS.md`
2. `git status --short`
3. Recent changelog entries in `CHANGELOG.md` if the current block is unclear
4. The area-specific skill/doc only after choosing the next block

For broad or ambiguous tasks, also use the repo-wide sources from `AGENTS.md`.

## Decision Workflow

1. Identify the active block.
2. Decide whether it is:
   - `open`: still has a concrete failing validation, bug, or explicitly requested scope.
   - `stable`: good enough for alpha; do not keep iterating unless a new issue appears.
   - `unknown`: needs one quick status check before continuing.
3. If stable, move to the next prioritized block from `docs/PROJECT_STATUS_AND_NEXT_STEPS.md`.
4. If open, pick the smallest next task that materially advances closure.
5. State the expected iteration budget before doing substantial work.
6. Use the relevant domain skill for the selected block.
7. Close the block only with evidence: checks, tests, browser validation, docs, or explicit user acceptance.

## Iteration Budget

Use pragmatic estimates:

- `1 iteration`: small fix, doc sync, validation, isolated UI polish.
- `2-3 iterations`: one screen pass, one helper extraction, one backend/RPC path, or one asset pipeline pass.
- `4+ iterations`: a system-level feature, cross-screen migration, server-authoritative redesign, or release candidate.

If a block keeps exceeding its estimate, stop and reassess instead of continuing with "next" automatically.

## What To Avoid

- Do not keep splitting files just because a previous block was refactoring.
- Do not restart backend/security hardening when the backend block is marked closed unless a real sensitive gap exists.
- Do not create a new skill for one screen or one temporary bug.
- Do not run browser tools and leave servers or browsers alive.
- Do not commit or push without the normal privacy and validation gates.

## Recommended Response Pattern

When the user says "siguiente", "sigamos" or similar:

1. Briefly name the block being considered.
2. Say whether the previous block is stable or still open.
3. State the next task and why it is next.
4. If implementing, proceed with the smallest safe change.

Example:

```text
El bloque de store esta cerrado; no conviene seguir extrayendo helpers sin bug real. El siguiente bloque segun PROJECT_STATUS es validacion browser de release candidate. Hago una pasada real Intro/Auth -> invitado -> Home y rutas principales, y cierro con evidencia.
```

## Output

Report:

- Current block and status.
- Next selected task.
- Expected iteration budget.
- Validation performed.
- Any deferred work and why it should not block the current alpha.
