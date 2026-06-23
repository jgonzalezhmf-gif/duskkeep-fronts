# Duskkeep Fronts - Combat Handoff

Fecha de corte: 2026-04-24

## Estado

Duskkeep Fronts es ahora el núcleo activo de combate manual del alpha. Sustituye al combate táctico/grid antiguo para `/battle` y para el flujo de Adventure integrado en esta pasada.

El sistema está en fase alpha aceptable:
- Jugador con 3 héroes fijos.
- 3 frentes: izquierda, centro, derecha.
- Core por bando.
- 3 Command por turno.
- Mazo corto de 8 cartas.
- Mano inicial de 5 cartas; robo de 1 carta por turno a partir del segundo turno (cambiado en v0.37.42-43, 2026-05-30).
- Clash obligatorio.
- Breach al Core si un frente queda abierto.
- Leader power simple.
- Recompensas y progreso conectados.
- Enemigos separados de héroes del jugador.
- Assets de héroes/enemigos preparados para PNGs futuros.

## Archivos Principales

- `features/frontline/types.ts`: tipos del núcleo Frontline.
- `features/frontline/data.ts`: líderes, héroes de jugador, enemigos, supports, cartas y presets.
- `features/frontline/engine.ts`: orquestador principal (478 líneas). La lógica está distribuida en módulos especializados:
  - `frontlineTurnPreparation.ts` — preparación de turno y robo
  - `frontlineCardRules.ts` — reglas de cartas
  - `frontlineActorStrike.ts` — resolución de golpes
  - `frontlineClashEffects.ts` — efectos de Clash
  - `frontlineBreachMath.ts` / `frontlineBreachRules.ts` — lógica de Breach
  - `frontlineEnemyAi.ts` — IA enemiga
  - `frontlineBossSignatures.ts` — ataques de jefe con firma
  - `frontlineBattleSetup.ts` — inicialización de batalla
  - `frontlineBattleOutcome.ts` — resolución de resultado
  - `frontlineStrikeOrder.ts` — orden de golpes
  - `battleEntryPresentation.ts` — metadata de entrada a combate (compartido entre modos)
  - `battleSummary.ts` / `battleReplay.ts` — resumen y replay
- `features/frontline/fortress.ts`: lógica de Fortaleza MVP.
- `features/frontline/adventure.ts`: mapeo Adventure -> preset Frontline.
- `components/game/frontline/FrontlineBattle.tsx`: UI de combate, standees, cartas, feedback y animaciones ligeras.
- `components/game/frontline/frontlineVisualAssets.ts`: manifest explícito de assets para evitar 404s.
- `components/game/BattlePageClient.tsx`: setup, precombate, combate, resultado y rewards.
- `app/battle/page.tsx`: entrada general a Combat.
- `app/adventure/[levelId]/page.tsx`: gate de Adventure hacia Frontline.
- `app/deck/page.tsx`: builder mínimo de squad/deck Frontline.
- `app/fortress/page.tsx`: Fortaleza MVP.

## Sinergias

Catálogo y reglas técnicas en [FRONTLINE_SYNERGIES.md](FRONTLINE_SYNERGIES.md). Resumen:
- 7 sinergias activas (tanda 2): Blade Strike Affinity, Archer's Focus, Shadow Strike, Bulwark Cohesion, Sanctified Healing, Howling Pack (forward) y Howling Pack Echo.
- Tres categorías: Affinity (carta + trait del target), Presence (carta + trait de un ally vivo), Combo (carta + estado global como rally activo o support en campo).
- UI genérica con un solo componente: `FrontlineTraitProcBadge.tsx` (sobre el standee si la sinergia tiene lane) y `FrontlineSynergyFeedback.tsx` (banner central si es global).
- Detección dentro de `playCard` con helpers `livingAllyWithTrait`, `ralliedAllyCount` y `emitSynergy`.

## Reglas del Núcleo

El combate no usa grid libre. Cada bando tiene 3 combatientes principales, uno por frente. Las cartas modifican frentes, unidades o summons temporales.

Flujo:
1. Preparar turno.
2. Robar hasta mano máxima.
3. Recuperar 3 Command.
4. Jugar cartas y/o poder de líder.
5. Resolver Clash por frentes.
6. Aplicar Breach si un frente queda abierto.
7. Limpiar temporales, supports y estados.
8. Pasar iniciativa o terminar partida.

Breach actual:
- Lateral: 2.
- Centro: 3.
- Algunos traits pueden añadir daño extra.

## Héroes del Jugador

Los héroes jugables viven en `FRONTLINE_HEROES`.

Actuales:
- `bran`: tanque/ancla.
- `kara`: striker rápido.
- `vex`: archer/breach.
- `mira`: healer.
- `drak`: finisher.
- `tovi`: chanter/support ofensivo.

Importante:
- Estos son los que debe usar el jugador en Deck/Fortress.
- Las imágenes actuales parecen tier 3/4 visualmente, pero el sistema de tiers de héroe queda para futuro.
- Futuro recomendado: `heroId + tier` o `skinKey` para permitir `bran_t1`, `bran_t2`, `bran_t3`, etc. sin reescribir UI.

## Enemigos

Los enemigos viven en `FRONTLINE_ENEMIES`, no en `FRONTLINE_HEROES`.

IDs actuales:
- `enemy_bone_archer`: tier 1, archer frágil, rápido, presión de breach.
- `enemy_rotmaw`: tier 1, bruiser venenoso.
- `enemy_void_acolyte`: tier 2, chanter/mago de apoyo.
- `enemy_plague_troll`: tier 2, troll lento, mucha vida, regeneración suave.
- `enemy_blood_duelist`: tier 3, vampiro/duelista con lifesteal.
- `enemy_ember_ogre`: tier 4, bruto lento, mucha vida, mucho daño, sin habilidad especial.

Assets:
- `enemy_bone_archer` -> `public/assets/frontline/heroes/Enemy1.webp`
- `enemy_plague_troll` -> `public/assets/frontline/heroes/Enemy2.webp`
- `enemy_ember_ogre` -> `public/assets/frontline/heroes/Enemy3.webp`
- `enemy_blood_duelist` -> `public/assets/frontline/heroes/Enemy4.webp`
- `enemy_rotmaw` -> `public/assets/frontline/heroes/Enemy5.webp`
- `enemy_void_acolyte` -> `public/assets/frontline/heroes/Enemy6.webp`

## Cartas

Hay separación entre cartas del jugador y cartas enemigas:

- `FRONTLINE_PLAYER_CARDS`: pool que se muestra en Deck.
- `FRONTLINE_ENEMY_CARDS`: cartas de IA/campaña/eventos, no se muestran al jugador.
- `FRONTLINE_CARDS`: unión completa para que el motor pueda resolver cualquier ID.
- `FRONTLINE_CARD_POOL`: solo cartas del jugador.

Tipos MVP:
- `order`
- `tactic`
- `summon`

No implementado todavía:
- Gear cards profundas.
- Relics de combate.
- Signatures avanzadas.
- Draft de Arena.
- Bosses multifase.
- Mutadores complejos.

## Assets Visuales

Los assets opcionales deben registrarse en `components/game/frontline/frontlineVisualAssets.ts`.

No basta con añadir el PNG al filesystem. Si no está en el manifest, la UI no lo pide. Esto evita 404s.

Estructura:
- `public/assets/frontline/heroes/`
- `public/assets/frontline/cards/`
- `public/assets/frontline/effects/`

Fallbacks:
- Héroes: asset registrado o retrato antiguo.
- Enemigos: asset registrado o fallback visual.
- Cartas: arte registrado, standee relacionado o glyph de tipo.
- Efectos: CSS/floating labels si no hay PNG registrado.

## Adventure Integrado

Adventure ya no debe lanzar engines de combate obsoletos.

Estado actual:
- `/adventure` sigue siendo el mapa de campaña.
- `/adventure/[levelId]` ahora abre el precombate Frontline.
- `/battle?adventure=<levelId>` también puede lanzar Frontline con rewards/progreso de Adventure.
- `features/frontline/adventure.ts` decide qué preset enemigo usar según capítulo/índice.

Mapping actual:
- `data/adventure.ts` declara `frontlinePresetId` explicito por nodo cuando aplica.
- `features/frontline/adventure.ts` mantiene helpers para derivar presets y previews Frontline desde Adventure.

Limitación:
- `data/adventure.ts` todavía contiene `enemyTeam` antiguo basado en héroes legacy. El mapa ahora muestra el squad Frontline derivado, pero la seed antigua sigue ahí para compatibilidad y debe migrarse en una pasada posterior.

## Recompensas y Progreso

`BattlePageClient` coordina setup, combate, resultado y rewards. En Adventure usa `claimAdventureBattleResultOnlineFirst` para que Supabase/RPC decida rewards y progreso cuando el modo online esta activo; en local/offline conserva el flujo de rewards local.

Importante:
- No duplicar rewards. La lógica de Adventure ya está centralizada en `BattlePageClient`.
- Si se añade otro modo basado en Frontline, debe pasar un contexto explícito y no duplicar el post-battle.

## Dependencias Externas al Combate

Deck:
- Define leader, 3 héroes y 8 cartas.
- Debe seguir usando solo `FRONTLINE_HEROES` y `FRONTLINE_CARD_POOL`.

Fortress:
- Usa `FRONTLINE_HEROES` para guarnición.
- No usa enemigos ni cartas de combate manual.

Adventure:
- Debe usar `features/frontline/adventure.ts`.
- Ya no depende de engines legacy para combate manual.

Arena:
- El flujo visible ya usa `FrontlineBattle`, con Ladder y Arena Trials separados.
- Ladder registra resultados mediante `recordLadderResultOnlineFirst`; Arena Trials usa `recordArenaResultOnlineFirst`.
- Antes de competitivo publico falta replay/simulacion server-side robusta.
- Namespaces: `features/ladder/` (`data.ts`, `resultState.ts`), `features/arena/` (`resultState.ts`, `trialMutators.ts`).

Events:
- Namespace: `features/events/` (`resultState.ts`).
- El flujo visible ya usa `FrontlineBattle` con operaciones Frontline y recompensa diaria.
- El engine de defensa legacy fue eliminado en v0.38.0. El modo de defensa activo es Last Bastion Defense en `features/fortress-defense/`.

Team:
- Es una vista ligera de revision del squad Frontline y no debe duplicar el builder de Deck.
- A medio plazo hay que decidir si se mantiene, renombra o fusiona con Deck.

Roster/Heroes:
- Sigue basado en `data/heroes.ts` y progresión vieja.
- Necesita conectarse con tiers visuales y roles Frontline.

Shop:
- Tiene catalogo MVP alineado con Frontline/Fortress/Arena y previews de cartas/heroes.
- Quedan pendientes inventario real de cartas, cosmetics, tier materials y reward reveal propio.

## Fortress Defense (motor separado)

Fortress tiene su propio motor de combate independiente de Frontline: `features/fortress-defense/` con `engine.ts`, `turnResolution.ts`, `combatMath.ts`, `targeting.ts`, `grid.ts` y `catalog.ts`. No comparte lógica con `features/frontline/` — es un sistema separado para el modo por oleadas Last Bastion Defense.

## Transición de entrada a combate

`components/game/frontline/BattleEntryTransition.tsx` + `features/frontline/battleEntryPresentation.ts` implementan el sistema de transición compartido al entrar en combate. Aplica a Adventure, Ladder, Arena Trial, Events y Fortress Defense (implementado en v0.37.49, 2026-06-01).

## Deuda Técnica Conocida

- `data/adventure.ts` conserva `enemyTeam` legacy por compatibilidad, aunque los nodos de combate usan `frontlinePresetId`.

## Próximos Pasos Recomendados

1. Eliminar o aislar datos legacy `enemyTeam` cuando ya no tengan consumidores reales.
2. Crear mas presets enemigos por tier: tutorial, early, mid, elite, boss.
3. Anadir tipos de enemigos y habilidades mas expresivas sin ampliar demasiado el motor.
4. Profundizar bosses Frontline y signatures.
5. Conectar Deck con arte full-card real y tiers de heroe.
6. Profundizar Arena/Ladder con rangos, rivales y validacion server-side robusta.
7. Anadir mutadores Frontline reales a Events.
8. Decidir si `Team` se mantiene como Squad Review o se fusiona con Deck.
9. Anadir tests de integracion para Adventure -> Frontline -> Rewards cuando aplique.
10. Validar browser de `/adventure`, `/adventure/c1l1`, `/battle?adventure=c1l1&start=1`, `/arena`, `/events` y `/deck`.
