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
- Mano máxima de 5.
- Robo de 2 al inicio de turno hasta máximo 5.
- Clash obligatorio.
- Breach al Core si un frente queda abierto.
- Leader power simple.
- Recompensas y progreso conectados.
- Enemigos separados de héroes del jugador.
- Assets de héroes/enemigos preparados para PNGs futuros.

## Archivos Principales

- `features/frontline/types.ts`: tipos del núcleo Frontline.
- `features/frontline/data.ts`: líderes, héroes de jugador, enemigos, supports, cartas y presets.
- `features/frontline/engine.ts`: reglas de turno, cartas, Clash, Breach, leader power e IA básica.
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
- UI genérica con un solo componente: `SynergyProcBadge` (sobre el standee si la sinergia tiene lane) y `SynergyGlobalToast` (banner central si es global).
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
- `enemy_bone_archer` -> `public/assets/frontline/heroes/Enemy1.png`
- `enemy_plague_troll` -> `public/assets/frontline/heroes/Enemy2.png`
- `enemy_ember_ogre` -> `public/assets/frontline/heroes/Enemy3.png`
- `enemy_blood_duelist` -> `public/assets/frontline/heroes/Enemy4.png`
- `enemy_rotmaw` -> `public/assets/frontline/heroes/Enemy5.png`
- `enemy_void_acolyte` -> `public/assets/frontline/heroes/Enemy6.png`

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

Adventure ya no debe lanzar el `DeckBattle` viejo.

Estado actual:
- `/adventure` sigue siendo el mapa de campaña.
- `/adventure/[levelId]` ahora abre el precombate Frontline.
- `/battle?adventure=<levelId>` también puede lanzar Frontline con rewards/progreso de Adventure.
- `features/frontline/adventure.ts` decide qué preset enemigo usar según capítulo/índice.

Mapping actual:
- Chapter 1, niveles 1-4: `bonewood_raiders`.
- Chapter 1, niveles 5-8: `plague_pack`.
- Chapter 1, niveles 9-12: `ember_court`.
- Chapter 2, niveles 1-2: `plague_pack`.
- Chapter 2, niveles 3+: `ember_court`.

Limitación:
- `data/adventure.ts` todavía contiene `enemyTeam` antiguo basado en héroes legacy. El mapa ahora muestra el squad Frontline derivado, pero la seed antigua sigue ahí para compatibilidad y debe migrarse en una pasada posterior.

## Recompensas y Progreso

`BattlePageClient` aplica:
- Rewards de preset para combate libre.
- Rewards de `data/adventure.ts` para Adventure.
- First clear si corresponde.
- `markAdventureCleared`.
- `recordBattleResult`.
- `awardRewards`.

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
- Debe dejar de depender de Tactical/DeckBattle para combate manual.

Arena:
- Todavía usa `TacticalBattle`.
- Debe migrarse a Frontline o a una variante Frontline PvE/PvAI.

Events:
- Todavía usa `TacticalBattle` y `TowerDefenseRun`.
- Debe decidirse si los eventos normales pasan a Frontline y si Tower Defense queda como modo separado.

Team:
- Es legacy para el sistema antiguo.
- A medio plazo debe fusionarse, ocultarse o reconvertirse según Deck/Frontline.

Roster/Heroes:
- Sigue basado en `data/heroes.ts` y progresión vieja.
- Necesita conectarse con tiers visuales y roles Frontline.

Shop:
- Sigue vendiendo recursos/shards/boosts legacy.
- Debe alinearse con cartas Frontline, héroes, tiers y posiblemente enemy/event unlocks.

## Deuda Técnica Conocida

- Coexisten motores antiguos:
  - `features/battle/*`
  - `features/tactical/*`
  - `features/deckbattle/*`
  - `features/frontline/*`
- `savedBattle` en store todavía guarda `TacticalState`; Adventure nuevo no lo usa.
- `data/adventure.ts`, `data/events.ts`, `data/arenaOpponents.ts` todavía modelan enemigos como héroes legacy.
- `TeamPage` y varias pantallas usan `team`, no `frontlineLoadout`.
- `TacticalBattle`, `DeckBattle` y `TowerDefenseRun` siguen presentes para modos no migrados.

## Próximos Pasos Recomendados

1. Migrar `data/adventure.ts` a `frontlinePresetId`, `enemyTierBand` o `enemySquadId`.
2. Crear más presets enemigos por tier: tutorial, early, mid, elite, boss.
3. Añadir tipos de enemigos y habilidades más expresivas sin ampliar demasiado el motor.
4. Crear bosses Frontline con reglas simples: core mayor, trait especial, carta signature.
5. Conectar Deck con arte full-card real y tiers de héroe.
6. Migrar Arena a Frontline con rivales por rango.
7. Migrar eventos normales a Frontline con mutadores ligeros.
8. Decidir si `TeamPage` se elimina o se transforma en una vista legacy escondida.
9. Añadir tests de integración para Adventure -> Frontline -> Rewards cuando Vitest no esté bloqueado por el entorno.
10. Validar browser de `/adventure`, `/adventure/c1l1`, `/battle?adventure=c1l1&start=1` y `/deck`.

