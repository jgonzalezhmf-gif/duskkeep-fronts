# Duskkeep Fronts

Turn-based tactical fantasy game for **web + mobile**. The current alpha centers on
Duskkeep Fronts: Home hub, Adventure flow, pre-combat, three-front card combat,
Deck progression, Fortress, Market, Missions, Events and Arena. Runs fully offline
on first boot; Supabase integration is prepared for a future persistence pass.

> Fuentes de referencia: `AGENTS.md`, `docs/DOCUMENTATION_INDEX.md`,
> `docs/DUSKKEEP_FRONTS_FUNCTIONAL_HANDOFF.md`, `docs/ARCHITECTURE.md`,
> `docs/ENGINEERING_STANDARDS.md`, `docs/GAMEPLAY_GUIDE.md`,
> `docs/QUALITY_AND_RELEASE.md` y `docs/SECURITY_AND_BACKEND_ROADMAP.md`.

## Stack
- **Next.js App Router** + TypeScript
- **Tailwind CSS** (mobile-first, responsive game shell)
- **Zustand** (persisted to `localStorage`)
- **Zod** (installed for future schema validation)
- **Vitest** (unit tests for engine + rng + rewards)
- **Supabase SDK** ready (schema in `supabase/schema.sql`)

## Documentacion

- `docs/ARCHITECTURE.md`: capas del codigo, flujo de datos, limites y reglas de extension.
- `docs/DOCUMENTATION_INDEX.md`: orden de lectura por area y huecos actuales de documentacion.
- `docs/ENGINEERING_STANDARDS.md`: estandares de arquitectura, calidad, seguridad, rendimiento y release.
- `docs/GAMEPLAY_GUIDE.md`: loop jugable, pantallas y expectativas de gameplay.
- `docs/QUALITY_AND_RELEASE.md`: checklist de release, comandos de test, rutas de smoke test y gates de calidad.
- `docs/SECURITY_AND_BACKEND_ROADMAP.md`: persistencia online, validacion backend y roadmap de seguridad.
- `docs/DUSKKEEP_FRONTS_FUNCTIONAL_HANDOFF.md`: handoff detallado para futuras sesiones de implementacion.

## Quick start

```bash
npm install          # or pnpm i / yarn
cp .env.example .env.local
npm run dev          # http://localhost:3000
```

Open the dev URL on your phone (same Wi-Fi) for mobile testing.

### Dev stability on Windows / OneDrive
This repo now uses `webpack` by default for `npm run dev`. That is intentional.

`next dev` with Turbopack was producing corrupted `.next/dev/cache/turbopack`
state in this environment, especially when:
- the repo is inside OneDrive
- more than one `next dev` process is running against the same repo
- a stale dev server is still alive while another starts

If dev mode gets into a bad state:
```bash
npm run clean:next
npm run dev
```

If you explicitly want to test Turbopack again:
```bash
npm run dev:turbo
```

Recommendation: keep only one local `next dev` process per repo at a time.

### Other commands
```bash
npm run check        # lint + typecheck
npm run check:full   # check + test + build
npm run build        # production build
npm run start        # serve production build
npm run clean:next   # remove .next when dev cache gets corrupted
npm run typecheck    # TS strict check, no emit
npm run lint         # ESLint via Next.js
npm run test         # run unit tests (battle engine, rng, rewards)
npm run test:watch   # tests in watch mode
npm run screenshots  # capture screens against an already running app
npm run screenshots:auto # start local dev server and capture screens automatically
```

### Screenshot automation
The repo now includes Playwright-based screenshot capture for UI review.

Default output:
```bash
tmp/playwright-screenshots/<timestamp>/
```

Typical usage:
```bash
npm run screenshots:auto
```

That command will:
1. build the app automatically if needed
2. start the built app on `http://127.0.0.1:3004`
3. wait for the server to be ready
4. capture the main routes in `desktop` and `mobile`
5. write a `manifest.json` with every generated file

If you already have the app running, use:
```bash
$env:BASE_URL="http://127.0.0.1:3000"; npm run screenshots
```

If Playwright fails on Windows with `spawn EPERM`, try forcing a system browser:
```powershell
$env:PLAYWRIGHT_CHANNEL="msedge"; npm run screenshots:auto
```

If you prefer Chrome:
```powershell
$env:PLAYWRIGHT_CHANNEL="chrome"; npm run screenshots:auto
```

You can also point directly to a browser executable:
```powershell
$env:PLAYWRIGHT_EXECUTABLE_PATH="C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe"; npm run screenshots:auto
```

To debug visually, run in headed mode:
```powershell
$env:PLAYWRIGHT_HEADLESS="0"; npm run screenshots:auto
```

Captured scenarios currently include:
- `home`
- `adventure-ch1`
- `adventure-ch2`
- `shop-featured`
- `shop-daily`
- `deck`
- `fortress`
- `arena`
- `battle-pre`
- `battle-live`

### Verification flow
```bash
npm run check
```

For release candidates, prefer:

```bash
npm run check
npm run test
npm run build
```

Use `npm run check:full` when your environment allows child-process spawning for
Vitest/esbuild and Next production build workers. In restricted sandboxes, tests
or builds may fail with `spawn EPERM` even when the code is otherwise correct.

## What's implemented (alpha)

- **Home** with account level, XP bar, continue-adventure shortcut, and
  navigation to all systems.
- **Roster**: 14 heroes seeded with distinct actives + passives. Level up
  with gold, star up with shards. Locked heroes visible with unlock
  progress.
- **Team builder**: 4-slot editor with power calculation and duplicate-swap
  prevention.
- **Adventure**: Chapter 1 with 12 progressive levels (last is a boss).
  First-clear bonus rewards, gated unlocks, replayable.
- **Battle engine**:
  - Deterministic by seed (Mulberry32)
  - Turn order by SPD
  - Basic attacks + 1 active + 1 passive per hero
  - Cooldowns, buffs, shields, stuns, AoE, lifesteal, thorns, regen, auras
  - Emits a typed event stream (`battle_start`, `damage`, `heal`, …) that
    the UI plays back
- **VS AI** quick battle scaling with your team power.
- **Arena** against pre-built opponent snapshots (4 difficulty tiers),
  consumes a ticket per fight, awards gold/gems.
- **Events**: 2 always-on rotating events with unique rewards.
- **Missions**: 4 daily + 3 weekly, track progress across all game modes,
  claimable rewards.
- **Shop**: starter pack (free, one-time), gold/dust bundles, hero-shard
  kits for late-game unlocks.
- **Resources** (gold/dust/gems) and **account XP** fully wired end-to-end.
- **Persistence**: Zustand + `localStorage`. Supabase is a drop-in backend.
- **Mobile UX**: 480px max-width shell, bottom nav, safe-area padding,
  touch-friendly hit targets.
- **Tests**: deterministic battle simulation, RNG, rewards merging.

## File layout

```
app/                   # Next.js routes (all client components)
  page.tsx             # home
  roster/page.tsx
  team/page.tsx
  adventure/…
  battle/page.tsx      # quick VS AI
  arena/page.tsx
  events/page.tsx
  missions/page.tsx
  shop/page.tsx
components/
  ui/                  # Button, Card, BottomNav, TopBar, Notifications, Hydrator
  game/                # HeroCard, BattleView
features/
  battle/              # engine.ts, rewards.ts, types.ts
data/                  # static seed: heroes, adventure, missions, events, shop, arena
lib/                   # store (zustand), persistence, rng, types, constants, cn
supabase/              # schema.sql, seed.sql, README
tests/                 # battle.test.ts, rng.test.ts, rewards.test.ts
```

## Resetting save data

- Open the app, DevTools → Application → Local Storage → delete key
  `duskkeep-fronts:player:v1`, then refresh.
- Or from the browser console:
  ```js
  useGameStore.getState().resetAll() // via the named import if exposed
  localStorage.removeItem("duskkeep-fronts:player:v1"); location.reload();
  ```

## Enabling Supabase (optional)

See `supabase/README.md`. The switch is flipped by
`NEXT_PUBLIC_PERSISTENCE=supabase` in `.env.local`. The game falls back
to local storage if credentials are missing.

## TODO — prioritized

### P0 (to finish the alpha promise)
1. Keep `npm run check`, `npm run test` and `npm run build` green.
2. Finish Chapter 1 demo polish and keep Chapter 2 gated until content exists.
3. Add route-level error boundaries and empty states.
4. Prepare backend persistence design without making the client authoritative.
5. Keep documentation current with gameplay, architecture and release state.

### P1
6. Daily/weekly mission reset timers and event calendar rotation.
7. Hero tiers/evolution and deeper shard usage.
8. Server-side deterministic replays and result summaries.
9. Proper analytics hook and feature flags.
10. Supabase persistence MVP behind authenticated accounts.

### P2
11. Authoritative economy operations.
12. Arena ladder and anti-tamper validation.
13. Cosmetics, skins and premium shop flows.
14. Push notifications.
15. Social, clans and real-time PvP.

## License
Private — for alpha iteration.
