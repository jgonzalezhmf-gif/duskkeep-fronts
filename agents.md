# AGENTS.md

## Fuentes De Verdad
- Para tareas amplias lee primero `README.md`, `docs/DOCUMENTATION_INDEX.md` y `docs/DUSKKEEP_FRONTS_FUNCTIONAL_HANDOFF.md`.
- Si tocas backend/Auth/Supabase/economia online, lee tambien `docs/SERVER_AUTHORITATIVE_STATE_OWNERSHIP.md`, `docs/SERVER_AUTHORITATIVE_OPERATIONS.md` y `docs/BACKEND_SECURITY_CLOSURE_REVIEW.md`.
- Si tocas combate, Adventure, assets, rewards, i18n o audio, usa los docs/skills especificos citados en el handoff antes de editar.
- Algunas guias antiguas aun dicen que Supabase es "futuro" o "skeleton"; el estado actual verificado es online opcional con RPCs autoritativas y `get_player_snapshot`.

## Comandos Reales
- Instalar/arrancar: `npm.cmd install`, copiar `.env.example` a `.env.local` si hace falta, `npm.cmd run dev`.
- `npm.cmd run dev` usa `next dev --webpack` a proposito; en este repo dentro de OneDrive, Turbopack puede corromper `.next/dev/cache`. Usa `npm.cmd run clean:next` si dev queda en mal estado.
- Supabase local + proxy autoritativo en dev: `npm.cmd run dev:supabase` fuerza `NEXT_PUBLIC_PERSISTENCE=supabase` y `SERVER_AUTHORITATIVE_API_ENABLED=true`.
- Check rapido por defecto: `npm.cmd run check` = ESLint + `tsc --noEmit` + `check:store-boundaries`.
- Test puntual: `npm.cmd run test -- tests/nombre.test.ts` o `npm.cmd run test -- -t "texto del caso"`.
- Cierre amplio: `npm.cmd run check`, `npm.cmd run test`, `npm.cmd run build`; `npm.cmd run check:full` encadena todo si el entorno permite procesos hijos.
- En sandboxes/Windows restringidos, Vitest o Next build pueden fallar por `spawn EPERM`; reporta el bloqueo si `check` pasa.
- Screenshots: `npm.cmd run screenshots:auto`; si Playwright falla por navegador, probar `$env:PLAYWRIGHT_CHANNEL="msedge"; npm.cmd run screenshots:auto`.
- No hay CI de npm checks; `.github/workflows/datadog-synthetics.yml` solo corre Datadog synthetics.

## Arquitectura Que No Debe Confundirse
- `app/*` son rutas App Router y wiring; muchas paginas son client components que componen UI de `components/game/*`.
- `components/game/*` renderiza pantallas y feedback; no debe esconder reglas de balance, economia ni combate.
- `features/frontline/*` es el combate manual principal: 3 frentes, cores, command, cartas, clash, breach, boss/signatures y replay helpers.
- `features/battle/*`, `features/tactical/*`, `features/deckbattle/*` y `features/td/*` son legacy/prototipos; no los hagas crecer salvo pedido explicito.
- `data/*` contiene seed/config alpha; el comportamiento reutilizable va en `features/*` o helpers de `lib/*`, no en JSX.
- `lib/store.ts` sigue siendo el orquestador grande de meta-loop, recursos, misiones, shop, Adventure, Deck, Fortress, Arena/ladder y acciones online-first. Lee la seccion relevante antes de tocarlo.
- Tipos compartidos viven en `lib/types.ts` o `lib/storeTypes.ts`; tipos de motor viven en su `features/*/types.ts`.

## Server-Authoritative
- Con `NEXT_PUBLIC_PERSISTENCE=supabase`, recursos, rewards, compras, claims, upgrades, progreso, loadout, Fortress, Adventure, Arena/Events/Ladder y snapshots sensibles vienen del servidor.
- El cliente solo envia ids, seleccion del jugador, `battleSummary`/`actionLog` y decisiones minimas; nunca envia costes, rewards finales, balances, unlocks ni loot como verdad.
- Mutaciones sensibles pasan por `/api/server/authoritative` y RPCs Supabase con JWT del usuario, RLS/ownership, idempotencia, catalogos server-side y ledger si toca recursos.
- UI debe seleccionar acciones `*OnlineFirst` del store. `npm.cmd run check:store-boundaries` bloquea `useGameStore.setState` y acciones locales sensibles desde `app/` o `components/`.
- No hagas fallback local para cuentas `linked` ni invitado Supabase si falla una operacion autoritativa; el fallback local es solo desarrollo/offline sin backend configurado.
- En modo Supabase, `localStorage` persiste solo preferencias/UI (`language`, audio, intro, onboarding, motion, escala); estado sensible se rehidrata desde `get_player_snapshot`.
- `/api/server/authoritative` esta desactivada salvo `SERVER_AUTHORITATIVE_API_ENABLED=true`; no uses service-role key en el navegador ni en el proxy.
- `SERVER_FRONTLINE_REPLAY_VALIDATION=true` activa validacion defensiva de replays Frontline antes de RPC, pero no sustituye una simulacion server-side completa para competitivo publico.

## UI, Assets E i18n
- Direccion visual: dark medieval fantasy, game-first, visual-first; evitar pantallas tipo dashboard SaaS y paneles negros apilados.
- Reutiliza `ScreenScaffold`, `ScreenBackground`, `GameBackNav`, `GameResourceBar`, reward overlays/tokens e iconos compartidos antes de crear chrome propio.
- No hardcodees rutas especulativas a `public/assets`; registra assets en manifests como `lib/iconAssets.ts`, `lib/screenBackgroundAssets.ts`, `lib/audioAssets.ts` o `components/game/frontline/frontlineVisualAssets.ts` y provee fallback sin 404.
- Textos user-facing nuevos van por `lib/i18n/dictionaries.ts` y sus `dictionary-data/*`; ids de dominio no se traducen.
- Respeta `reducedMotion`, `visualEffects`, `textScale`, touch targets moviles y evita comunicar estado critico solo con color.

## Gameplay Y Rewards
- Adventure es el camino principal temprano; `/adventure/[levelId]` abre precombate Frontline mediante `BattlePageClient` si el nodo es combate.
- Arena y Events ya usan Frontline; no sigas docs viejos que digan que dependen de `TacticalBattle` sin confirmar en codigo.
- Las recompensas reclamables deben pasar por `lib/rewardVisibility.ts`; no muestres first-clear, daily o one-shot como disponibles si ya fueron reclamadas.
- No cambies economia, balance o reglas de Frontline como parte de polish visual salvo instruccion explicita.

## Supabase Y Operaciones
- `.env.local` puede existir y no debe leerse ni commitearse salvo necesidad explicita; `.env.example` documenta variables publicas y flags seguros.
- Validacion remota: `npm.cmd run check:supabase:remote` carga `.env`/`.env.local`, redacts y falla si `NEXT_PUBLIC_*` parece secreto.
- Smokes locales utiles: `npm.cmd run smoke:supabase:guest`, `npm.cmd run smoke:supabase:snapshot`, `npm.cmd run smoke:supabase:guest-upgrade`, `npm.cmd run smoke:authoritative-api`.
- Antes de pagos, premium currency o ladder publico real faltan replay/simulacion server-side robusta, rate limit distribuido y webhooks backend-only.

## Versionado, Privacidad Y Cierre
- Para iteraciones cerradas de app/codigo, actualiza `CHANGELOG.md` y sincroniza `package.json`/`package-lock.json` con `npm.cmd version <version> --no-git-tag-version`.
- Usa PATCH para fixes/docs/tests pequenos, MINOR para sistemas o UX perceptible, MAJOR solo para cambios incompatibles de arquitectura, persistencia o gameplay core.
- El repo esperado es privado; antes de push/publicacion verifica `gh repo view <owner>/<repo> --json visibility,isPrivate` y no subas si `isPrivate` no es `true`.
- No commitees `.env*`, logs, `tmp/`, `artifacts/`, builds, dumps, capturas locales, zips ni credenciales; `.gitignore` ya marca muchos de esos paths.
- Cierra cada tarea diciendo que cambiaste, que validaste, que no pudiste validar y que riesgo queda.

## Skills Locales
- Usa skills Duskkeep cuando la tarea toque su area: `duskkeep-combat`, `duskkeep-adventure-flow`, `duskkeep-asset-pipeline`, `duskkeep-reward-feedback`, `duskkeep-localization`, `duskkeep-visual-cohesion`, `duskkeep-browser-validation` o `duskkeep-secure-backend`.
- Para motion/polish avanzado, usa `impeccable` y antes ejecuta `node .agents/skills/impeccable/scripts/load-context.mjs`; mantener `PRODUCT.md` y `DESIGN.md` como contexto visual.
- Si cambias una skill, `docs/skills/*` es la fuente y debe sincronizarse con `.agents/skills/*`; no crees skills para tareas puntuales.
