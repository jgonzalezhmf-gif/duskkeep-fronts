# Duskkeep Fronts Functional Handoff

Fecha de corte: 2026-04-28

Este documento resume el estado funcional y visual del juego para que una futura sesion de Codex u otra IA pueda continuar sin depender del historial conversacional.

## Como Usar Este Documento

Leer primero:
- `AGENTS.md`
- `docs/DUSKKEEP_FRONTS_FUNCTIONAL_HANDOFF.md`
- `docs/GAME_ARCHITECTURE_AND_VISUAL_SYSTEM.md`
- `docs/FRONTLINE_COMBAT_HANDOFF.md`
- `docs/FRONTLINE_PROGRESSION.md`
- `docs/SCREEN_AUDIT_AND_ROADMAP.md`

Regla practica:
- Si la tarea toca combate, leer tambien `docs/FRONTLINE_COMBAT_HANDOFF.md`.
- Si la tarea toca progresion de heroes, Deck, cartas Frontline o Fortress, leer tambien `docs/FRONTLINE_PROGRESSION.md`.
- Si la tarea toca assets/iconos, leer `docs/ART_PIPELINE_CODEX.md`.
- Si la tarea toca animacion, leer `docs/IMPECCABLE_ANIMATION_USAGE.md`.
- Si la tarea toca recompensas reclamables, leer `docs/REWARD_VISIBILITY_RULES.md`.

## Vision del Juego

Duskkeep Fronts es un alpha de juego tactico por turnos con progresion meta. La direccion actual busca:
- Dark medieval fantasy.
- UI visual-first: iconos, cartas, standees, landmarks y estados antes que texto.
- Home como hub principal.
- Duskkeep Fronts como combate manual principal.
- Progresion offline-first con Zustand/localStorage por ahora.
- Backend Supabase preparado como skeleton, no acoplado al loop actual.

No se debe convertir la app en una web app de paneles. Las pantallas deben sentirse como partes de un juego.

## Stack y Arquitectura

Stack:
- Next.js App Router.
- TypeScript.
- Tailwind.
- Zustand persist.
- Vitest.
- Supabase futuro, actualmente stub/skeleton.

Directorios principales:
- `app/`: rutas y pantallas.
- `components/game/`: UI de juego.
- `components/game/frontline/`: Combat / Duskkeep Fronts.
- `components/game/shared/`: chrome, iconos, recursos, rewards, botones comunes.
- `components/ui/`: primitives visuales reutilizables.
- `features/frontline/`: motor y datos funcionales de Frontline.
- `features/battle/`: auto-battle legacy/rewards.
- `features/tactical/`: grid tactical legacy/prototipo.
- `data/`: seed data.
- `lib/store.ts`: progresion, economia local, misiones, shop, fortress.

Regla de arquitectura:
- Las reglas de juego viven en `features/*`, `data/*` o helpers de dominio.
- Los componentes no deben esconder balance ni economia.
- Los assets opcionales se cargan solo via manifest para evitar 404.

## Estado Actual de la Vertical Slice

El alpha jugable actual esta centrado en:
- Home hub.
- Adventure map integrado con precombat y Frontline.
- Battle quick start con Frontline.
- Deck Frontline squad/card builder.
- Fortress MVP con edificios, garrison y raids automaticos.
- Shop/Market con ofertas, recursos y feedback visual.
- Missions como command log con claims.
- Arena y Events migrados en MVP a Frontline.

La base es aceptable para seguir iterando, pero aun no es premium.

## Duskkeep Fronts

Estado:
- Es el combate manual principal.
- Usa 3 frentes, core por bando, command por turno, mano de cartas y clash.
- Usa heroes como standees placeholder.
- Usa cartas full-art placeholder cuando existen.
- Heroes y cartas del jugador usan perfiles progresados derivados, no los datos base mutados.
- Tiene cola visual de eventos, ataques mas lentos, KO ghost y overlay de victoria/derrota.

Archivos clave:
- `features/frontline/types.ts`
- `features/frontline/data.ts`
- `features/frontline/engine.ts`
- `features/frontline/heroProfile.ts`
- `features/frontline/cardProgression.ts`
- `features/frontline/adventure.ts`
- `features/frontline/fortress.ts`
- `components/game/frontline/FrontlineBattle.tsx`
- `components/game/frontline/FrontlineVisualPrimitives.tsx`
- `components/game/frontline/frontlineVisualAssets.ts`
- `components/game/BattlePageClient.tsx`

No tocar sin encargo explicito:
- Reglas de combate.
- Economia.
- Backend.
- Audio.
- Arquitectura canvas/WebGL.

Pendiente Frontline:
- Animaciones por tipo de carta: order, tactic, summon, gear, signature, relic.
- VFX por keyword/status: poison, burn, guard, rush, regen.
- Bosses y mutadores de eventos.
- Mejor transition layer post-victoria.
- Mejor AI readability sin depender del log.

## Heroes, Enemigos y Assets

Heroes jugador actuales:
- `bran`
- `kara`
- `mira`
- `vex`
- `drak`
- `tovi`

Enemigos actuales:
- `enemy_bone_archer`
- `enemy_rotmaw`
- `enemy_void_acolyte`
- `enemy_plague_troll`
- `enemy_blood_duelist`
- `enemy_ember_ogre`

Rutas de assets:
- Heroes/enemigos: `public/assets/frontline/heroes/`
- Cartas: `public/assets/frontline/cards/`
- Efectos: `public/assets/frontline/effects/`
- Iconos: `public/assets/icons/`

Regla critica:
- No hacer requests a PNGs especulativos.
- Registrar assets en manifests antes de usarlos.
- Si no esta registrado, usar fallback visual.

Manifests/componentes relevantes:
- `components/game/frontline/frontlineVisualAssets.ts`
- `lib/iconAssets.ts`
- `components/ui/GameAssetIcon.tsx`
- `components/game/shared/ResourceIcon.tsx`
- `components/game/shared/ShopIcon.tsx`
- `components/game/shared/ProgressionIcon.tsx`

## Iconos y Recursos

Ya existe un sistema de iconos PNG con fallback seguro para:
- resources
- nav
- combat
- cards
- status
- fortress
- progression
- shop

Objetivo visual:
- Iconos grandes, con silueta clara.
- Menos circulos/cajas alrededor.
- Reutilizacion consistente en Home, Shop, Fortress, Deck, Missions y Combat.
- Cero 404 por assets opcionales.

## Rewards y Game Feel

Estado actual:
- `GameResourceBar` muestra recursos compartidos.
- `GameRewardToken` muestra rewards con iconos y pop.
- `RewardBurstOverlay` centraliza bursts visuales para objetos `Rewards`.
- Shop dispara feedback visual real cuando `purchaseOffer` devuelve ok.
- Shop oculta ofertas one-shot compradas y stock diario agotado tras el feedback de compra.
- Missions dispara feedback visual real cuando `claimMission` devuelve rewards.
- Missions oculta contratos ya reclamados en el ciclo actual y muestra estado vacio por columna.
- Battle Result usa el mismo burst de recompensas al entrar en resultado.
- Fortress raid usa el mismo burst al resolver una raid correctamente.
- La barra de recursos remonta chips por valor para hacer pop cuando cambia gold/dust/gems/tickets.
- Adventure y precombat no muestran bonuses `firstClearRewards` ni desbloqueos de cartas si la primera limpieza ya fue tomada.
- Events permite replay tras completar la rotacion diaria, pero no vuelve a mostrar ni entregar el payout diario como recompensa activa.

Archivos:
- `components/game/shared/GameRewardToken.tsx`
- `components/game/shared/RewardBurstOverlay.tsx`
- `lib/rewardVisibility.ts`
- `app/shop/page.tsx`
- `app/missions/page.tsx`
- `components/game/adventure/AdventureCampaignScene.tsx`
- `components/game/BattlePageClient.tsx`
- `app/events/page.tsx`
- `app/fortress/page.tsx`
- `app/globals.css`
- `docs/REWARD_VISIBILITY_RULES.md`

Pendiente:
- Hacer que reward tokens vuelen hacia la barra de recursos.
- Reutilizar el mismo patron en Events y Arena.
- Diferenciar visualmente gasto de recurso vs ganancia.

## Estado de Pantallas

Home:
- Pantalla mas avanzada visualmente.
- Hub principal y referencia de direccion.
- Pendiente: mas detalle en landmarks si se retoma arte.

Combat:
- Base alpha aceptable.
- Mejor pantalla junto a Home.
- Pendiente: VFX por tipo de carta/status y mejor pacing final.

Adventure:
- Integrada con Frontline.
- Mapa visual recuperable.
- Pendiente: camino mas natural, fases con iconos mas fuertes, precombat mas visual, datos de campana menos legacy.

Precombat:
- Ya conecta con Frontline.
- Pendiente: mas representacion visual de enemigos, rewards y cartas recomendadas.

Deck:
- Funcionalmente alineado con Frontline.
- Usa standees, cartas full-art y upgrade de cartas Frontline nivel 1-5 con gold+dust.
- La coleccion de cartas Frontline se guarda como `frontlineCardUnlocks`; el starter deck esta desbloqueado por defecto.
- La progresion de cartas se guarda como `frontlineCardLevels`; los efectos se derivan en runtime.
- Adventure first clear puede entregar `Rewards.frontlineCards`; Deck muestra locked/unlocked y bloquea equipar/mejorar cartas no desbloqueadas.
- Pendiente: sentirse menos builder tecnico y mas preparacion de squad.

Roster/Heroes:
- Usa standees y modal visual.
- Pendiente: sistema real de tiers, evolucion, shards y arte por tier.

Fortress:
- MVP funcional con edificios, garrison, raids y rewards.
- Usa iconos PNG fortress.
- Pendiente: mas escena/landmark, feedback de upgrade/raid mas fuerte y progresion profunda.

Shop/Market:
- Storefront avanzado visualmente.
- Usa iconos shop/resources/progression.
- Tiene feedback real de compra.
- Pendiente: productos Frontline reales, packs, shards, bundles por evento y reward flight.

Missions/Quests:
- Command Log visual.
- Tiene feedback real de claim.
- Pendiente: agrupar por fuente, claims mas jugosos y objetivos mas conectados a Frontline/Fortress.

Events:
- Migrado en MVP a Frontline.
- Pendiente: mutadores reales, identidad de evento, reward reveal propio.

Arena:
- Migrada en MVP a Frontline.
- Pendiente: ranks, ladder, streaks, rivales por tier y reward reveal propio.

Team:
- Existe como pantalla auxiliar.
- Pendiente: decidir si se mantiene, se fusiona con Deck/Roster o se archiva.

## Localizacion

Sistema:
- `lib/i18n/*`
- `lib/i18n/dictionaries.ts`
- `duskkeep-localization` skill para tareas con texto.

Regla:
- No introducir texto user-facing hardcoded en componentes.
- Usar keys de i18n.
- Si el texto es puramente decorativo/aria-hidden, se puede evitar texto nuevo.

Idiomas objetivo:
- Ingles.
- Espanol.
- Chino.
- Japones.
- Frances.
- Aleman.
- Portugues o coreano, segun prioridad futura.

Pendiente:
- Migracion progresiva de todos los textos restantes.
- Revisar pluralizacion y formatos de fecha/hora.

## Skills Locales

Skills importantes:
- `duskkeep-visual-cohesion`
- `duskkeep-screen-audit`
- `duskkeep-asset-pipeline`
- `duskkeep-combat`
- `duskkeep-adventure-flow`
- `duskkeep-reward-feedback`
- `duskkeep-browser-validation`
- `duskkeep-localization`
- `duskkeep-skill-maintenance`
- `impeccable`

Regla:
- Usar la skill si la tarea toca su area.
- Revisar skills ocasionalmente si aparece una tarea repetida o regla fragil.
- Mantener `docs/skills/*` como fuente y sincronizar con `.agents/skills/*` si cambia una skill.

## Backlog Prioritario

Prioridad inmediata sugerida:
1. Reward feedback reutilizable en Battle Result, Fortress raid, Events y Arena.
2. Precombat visual: enemigos, rewards, camino hacia Combat.
3. Adventure map polish: camino real, iconos de fase, side panel limpio.
4. Deck visual: squad stage y cartas mas parecidas a Combat.
5. Fortress scene pass: landmark mas vivo, upgrade/raid sequence.
6. Roster tiers: definicion de datos y visual por tier.
7. Shop content: packs Frontline, shards, bundles, claim diario.
8. Localization migration continua.

Backlog tecnico:
- Extraer datos hardcoded de Arena/Events si crecen.
- Decidir destino de tactical/grid legacy.
- Preparar Supabase sin romper offline-first.
- Mejorar tests de Frontline y store de progresion.

## Reglas Para Futuras Iteraciones

No romper:
- Persistencia local.
- Economia existente.
- Reglas de Frontline.
- Assets manifest/fallback.
- Home return en pantallas no combat.

Preferir:
- Componentes compartidos.
- Iconos y assets registrados.
- Visual-first.
- Menos texto permanente.
- Animaciones por evento real, no solo hover.
- Browser validation en desktop y mobile cuando haya UI.

Evitar:
- Redisenos teoricos sin implementacion.
- Paneles negros apilados.
- Iconos tiny dentro de circulos dobles.
- Rutas de assets inventadas.
- Cambios de gameplay camuflados como UI.

## Comandos de Validacion

Usar:

```powershell
npm.cmd run check
npm.cmd run test
npm.cmd run build
```

Si se toca UI:
- Validar con `agent-browser`.
- Capturar pantallas en `artifacts/validation/`.
- Revisar consola y 404.
