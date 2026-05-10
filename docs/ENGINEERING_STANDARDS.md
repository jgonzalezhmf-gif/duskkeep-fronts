# Engineering Standards

This document defines the practical engineering bar for future Duskkeep Fronts work. It is intentionally pragmatic: protect the playable alpha first, then improve structure, safety, performance and maintainability in small slices.

## Priorities

1. Keep the alpha playable.
2. Preserve local persistence compatibility.
3. Keep gameplay, economy and reward rules deterministic and auditable.
4. Keep visuals coherent without loading unnecessary assets.
5. Prepare for backend authority without coupling the current offline alpha to a backend too early.

## Architecture Standards

### Layer Ownership

- `app/*` owns routing and high-level screen composition.
- `components/game/*` owns game presentation and screen UI.
- `components/ui/*` owns reusable visual primitives.
- `features/*` owns domain rules and gameplay helpers.
- `data/*` owns seed content and static configuration.
- `lib/*` owns store orchestration, persistence, shared types, manifests and utilities.

### Rule Placement

Put rules where they can be tested and reused:

- Combat rules belong in `features/frontline/*`.
- Adventure node and map interaction rules belong in `features/adventure/*`.
- Reward visibility and reward normalization belong in shared helpers, not repeated JSX.
- Economy mutations should go through store actions or feature helpers.
- Static balance/configuration can live in `data/*`, but behavior should not be hidden in data files.

### Component Boundaries

Components should:

- accept typed props
- render state
- call callbacks
- use shared primitives for icons, rewards, backgrounds and panels
- avoid duplicating game rules

Components should not:

- mutate economy directly
- hardcode hidden balance values
- generate speculative asset paths
- contain large unrelated sub-systems
- mix UI redesign, gameplay changes and persistence changes in one file pass

## SOLID, Applied Pragmatically

- Single responsibility: one component/helper should have one clear reason to change.
- Open/closed: add new assets, cards, nodes and rewards through manifests/configuration before changing rendering logic.
- Liskov substitution: shared primitives should behave consistently across screens and not require screen-specific hacks.
- Interface segregation: pass only the data a component needs; avoid broad store objects when selectors are enough.
- Dependency inversion: UI should depend on typed helpers and manifests, not raw paths, backend details or storage internals.

## Store And Persistence Standards

Current persistence is local:

- Zustand persist writes to `localStorage`.
- Store migrations must provide safe defaults for new fields.
- Existing snapshots should not be destructively reset during normal iteration.
- New persistent data must be version-safe and tolerate missing fields.

Until backend authority exists:

- Do not present client-side balances as secure.
- Do not rely on localStorage for anything monetized or competitive.
- Keep economy-sensitive operations centralized so they can later move server-side.

## Security Standards

The browser is not authoritative.

For the current offline alpha:

- Never commit `.env`, `.env.local`, service keys, logs or dumps.
- Keep `package.json` private.
- Keep optional assets behind manifests to avoid 404 spam and path probing.
- Validate external-facing inputs in API/dev endpoints.
- Treat dev-only endpoints as local tooling, not production features.

For future online mode:

- Authenticate users before persistence.
- Enforce ownership server-side.
- Validate rewards, purchases and battle results server-side.
- Use idempotency keys for claims and purchases.
- Record resource changes in an auditable ledger.
- Keep service-role keys server-only.

## Performance Standards

### Assets

- Keep raw/source sheets outside `public/assets`.
- Register runtime assets through manifests.
- Prefer WebP/AVIF variants for browser delivery when possible.
- Use responsive variants for images displayed small.
- Keep PNG fallbacks only when needed.
- Do not add large assets without checking `npm.cmd run audit:assets`.

### Rendering

- Prefer `transform` and `opacity` for motion.
- Avoid animating `left`, `top`, `width`, `height`, `box-shadow`, large blurs or border colors.
- Respect `prefers-reduced-motion` for decorative animation.
- Lazy-load overlays, editors and heavy panels that are not needed at first paint.
- Do not import Combat or QA editors into hub/list screens unless needed.

### Budgets

Use:

```powershell
npm.cmd run audit:assets
npm.cmd run audit:build
npm.cmd run check:performance
```

Current budget checks are intentionally simple and should remain green:

- public assets total
- `.next/static` size
- `.next/server/app` size
- largest prerendered route HTML

## Quality Standards

Before closing a meaningful iteration:

- run the smallest useful validation early
- run broader checks before commit if app code changed
- update `CHANGELOG.md`
- bump `package.json` and `package-lock.json`
- keep commits narrow and reviewable

Recommended commands:

```powershell
npm.cmd run typecheck
npm.cmd run check
npm.cmd run test
npm.cmd run build
npm.cmd run check:full
```

Use `check:full` for closed app-code iterations when the environment supports it.

## Testing Standards

Add or preserve tests for:

- deterministic combat behavior
- reward claiming and replay policies
- key chest claim rules
- store migrations and persistence-sensitive helpers
- extracted pure domain helpers

Browser validation should be used for:

- visual changes
- navigation changes
- responsive layout changes
- asset integration
- reward/claim flows

Pure documentation or isolated domain refactors do not need browser validation unless risk is high.

## Asset Standards

- Use `lib/iconAssets.ts` for shared game icons.
- Use screen/feature manifests for backgrounds, portraits, card art, effects and props.
- Do not construct public URLs from arbitrary ids.
- Do not request future assets that are not present.
- Provide a fallback visual or glyph for optional assets.
- Report bad alpha/checker/fondo issues rather than forcing broken assets.

## Release Standards

Before a presentable build:

- `npm.cmd run check`
- `npm.cmd run test`
- `npm.cmd run build`
- browser smoke test major routes
- confirm no 404 for registered assets
- confirm no horizontal overflow on desktop/mobile
- confirm sensitive future features are not represented as secure if still local-only

## Refactor Standards

Refactor in safe slices:

- Extract pure helpers before moving behavior.
- Preserve public component APIs unless the change is intentional.
- Avoid broad renames.
- Avoid creating many tiny files without a clear boundary.
- Prefer feature-level modules over dumping everything into `lib`.
- Stop if unrelated user changes conflict with the current task.

## Backend Readiness Standards

When backend work begins, use this order:

1. Document target schema and server operations.
2. Add validation contracts.
3. Add authenticated persistence for low-risk profile/progress data.
4. Move reward claims and purchases server-side.
5. Add resource ledger and idempotency.
6. Add competitive/monetized flows only after authority exists.

Do not bolt payments, ladder or premium economy directly onto client-owned state.
