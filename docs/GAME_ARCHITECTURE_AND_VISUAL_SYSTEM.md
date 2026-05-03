# Game Architecture and Visual System

Fecha de corte: 2026-04-24

Este documento es la guia de producto para evitar que cada pantalla evolucione aislada. El objetivo es que Duskkeep Fronts se sienta como un unico juego: mismas reglas visuales, mismos assets reutilizables, misma logica de navegacion y dependencias claras entre pantallas.

## Principios Globales

1. Home manda como hub principal.
   - Casi todas las pantallas deben poder volver al Home con un CTA claro.
   - Combat puede ser la excepcion parcial, pero siempre debe tener salida post-battle hacia Home, Adventure o Deck.

2. La informacion visual manda sobre el texto.
   - Primero icono, estado, color, pieza, barra, silueta o imagen.
   - Texto corto solo para confirmar intencion.
   - Texto largo solo en tooltip, panel contextual, modal de detalle o pantalla que lo justifique.

3. Un componente compartido debe ganar a una solucion local.
   - Si algo aparece en 2 o mas pantallas, debe vivir en `components/game/*`, `components/ui/*` o un feature visual compartido.
   - Evitar que Deck, Heroes, Shop y Combat tengan cada uno su propia version incompatible de cartas, retratos o recursos.

4. Duskkeep Fronts es la columna vertebral del combate manual.
   - Adventure, Arena y Events deben migrar hacia Frontline.
   - TacticalBattle, DeckBattle y TowerDefense quedan como legacy/prototipos hasta decision explicita.

5. Assets futuros deben entrar por manifest, no por rutas inventadas.
   - Heroes, enemigos, cartas, summons, efectos e iconos deben tener claves estables.
   - Si el asset real no existe, se usa fallback sin provocar 404.

## Mapa de Pantallas

```text
Home
  -> Adventure
       -> Adventure Level Precombat
            -> Frontline Combat
                 -> Victory/Defeat Rewards
                      -> Adventure / Home / Deck
  -> Battle / Quick Combat
       -> Frontline Combat
            -> Rewards
                 -> Home / Deck / Battle Again
  -> Deck
       -> Frontline Squad Builder
       -> Frontline Card Package
       -> Home / Battle
  -> Heroes / Roster
       -> Hero collection
       -> Hero tiers future
       -> Hero visuals future
       -> Home / Deck
  -> Fortress
       -> Buildings
       -> Garrison
       -> Auto raids
       -> Rewards
       -> Home / Shop / Adventure
  -> Shop
       -> Resource offers
       -> Card packs future
       -> Hero shards future
       -> Cosmetics future
       -> Home / Deck / Heroes
  -> Missions / Quests
       -> Daily/weekly objectives
       -> Direct CTAs to Adventure, Combat, Fortress, Shop
       -> Home
  -> Events
       -> Frontline operation selection
       -> Event rewards
       -> Home / Combat
  -> Arena
       -> Frontline rival selection
       -> Tickets and ladder rewards
       -> Home / Combat
```

## Navegacion Obligatoria

Pantallas con vuelta directa a Home:
- Adventure
- Deck
- Heroes / Roster
- Fortress
- Shop
- Missions / Quests
- Events
- Arena
- Team / Squad Review mientras exista

Pantallas con salida contextual:
- Combat debe salir a la fuente que lo lanzo si existe: Adventure, Arena, Event o Battle libre.
- Post-battle debe ofrecer como minimo: repetir, volver al modo origen, volver a Home.

Pendiente tecnico:
- `components/game/shared/GameBackNav.tsx` existe como retorno compartido a Home.
- `ScreenScaffold` lo muestra automaticamente cuando `dock={false}`, colocado bajo el HUD para no solaparse con el commander badge.
- Deck, Fortress, Heroes/Roster, Missions y Team lo usan directamente porque no montan el HUD/dock completo.

## Direccion Visual Compartida

La direccion actual mas avanzada viene de:
- Home: hub full-screen, landmarks, iconografia propia, sensacion de mundo.
- Combat: Duskkeep Fronts, standees, cartas full-art placeholder, feedback visual.

Todas las pantallas secundarias deben acercarse a estos criterios:
- Menos dashboard.
- Menos panel negro rectangular.
- Mas escena, objetos, piezas, iconos grandes y siluetas.
- Menos texto visible permanente.
- Mas jerarquia por tamano, luz, contraste y posicion.
- Recursos y recompensas deben sentirse como objetos del juego, no como numeros en una tabla.

## Sistema de Assets Reutilizables

### Heroes del jugador

Ruta objetivo:
- `public/assets/frontline/heroes/`

Uso:
- Combat standees.
- Deck squad builder.
- Heroes/Roster.
- Shop hero shards / cosmetics.
- Fortress garrison.
- Event previews.

Claves:
- `bran`
- `kara`
- `mira`
- `vex`
- `drak`
- `tovi`

Regla:
- El componente no debe pedir `/assets/...` si el asset no esta registrado en manifest.
- Registrar en `components/game/frontline/frontlineVisualAssets.ts`.

### Enemigos

Ruta objetivo:
- `public/assets/frontline/heroes/`

Uso:
- Combat enemy standees.
- Adventure mission preview.
- Events.
- Arena rivals.
- Boss previews future.

Claves actuales:
- `enemy_bone_archer`
- `enemy_rotmaw`
- `enemy_void_acolyte`
- `enemy_plague_troll`
- `enemy_blood_duelist`
- `enemy_ember_ogre`

### Cartas

Ruta objetivo:
- `public/assets/frontline/cards/`

Uso:
- Combat hand.
- Deck package builder.
- Shop packs.
- Reward reveal.
- Event modifier previews.

Claves:
- Cada carta debe tener `id`, `kind`, `target`, `cost`, `shortText` y asset opcional.
- Las cartas de jugador y las de enemigo no deben mezclarse en el pool de jugador.

### Efectos

Ruta objetivo:
- `public/assets/frontline/effects/`

Uso:
- hit
- heal
- shield
- breach
- summon
- KO
- reward reveal

MVP:
- CSS + labels + pulses.
- PNGs futuros solo si estan registrados.

### Iconos de juego

Componentes actuales:
- `components/game/home/HomeIcon.tsx`

Problema:
- La familia de iconos vive demasiado ligada al Home.

Objetivo:
- Extraer una familia compartida tipo `GameIcon` para recursos, modos, acciones y estados.
- Home puede seguir teniendo wrappers propios, pero no debe ser la unica fuente.

Iconos globales necesarios:
- gold
- gems
- dust/shards
- tickets
- power
- hp
- atk
- shield
- heal
- breach
- command
- adventure
- arena
- events
- shop
- deck
- heroes
- fortress
- battle
- reward

## Componentes Compartidos Objetivo

Componentes existentes que deben consolidarse:
- `ArtPortrait`: base de retrato, pero debe convivir con standees y full-art cards.
- `ScreenChrome`: util para pantallas secundarias, pero no debe empujar todas a parecer paneles.
- `SceneBackdrop`: buena base para escenas, debe ampliarse por modo.
- `frontlineVisualAssets`: fuente actual para assets Frontline.
- `HomeIcon`: familia fuerte pero demasiado local.
- `components/game/frontline/FrontlineVisualPrimitives.tsx`: primera extraccion compartida de `FrontlineHeroStandee` y `FrontlineCardView`, ya usada por Deck, Heroes/Roster y Team.

Componentes a crear o extraer:
- `GameIcon` creado en `components/game/shared/GameIcon.tsx`
- `GameResourceChip`
- `RewardReveal`
- `HeroStandee` iniciado como `FrontlineHeroStandee`
- `EnemyStandee`
- `FrontlineCardView` creado en `components/game/frontline/FrontlineVisualPrimitives.tsx`
- `SquadSlot`
- `GameBackNav` creado en `components/game/shared/GameBackNav.tsx`
- `ModeEntryCard`
- `ScreenHeroScene`
- `ContextTooltip`

Regla:
- Si una pantalla necesita una carta visual o un standee, debe reutilizar el componente compartido, no recrearlo localmente.

## Dependencias de Producto

### Combat depende de
- `features/frontline/data.ts`
- `features/frontline/engine.ts`
- `features/frontline/types.ts`
- `components/game/frontline/*`
- `lib/store.ts` para loadout, rewards y persistencia local.

### Adventure depende de
- `data/adventure.ts`
- `features/frontline/adventure.ts`
- `BattlePageClient`
- Rewards/store.

Pendiente:
- Migrar `enemyTeam` legacy a `frontlinePresetId` o `enemySquadId`.

### Deck depende de
- `frontlineLoadout`
- `FRONTLINE_HEROES`
- `FRONTLINE_CARD_POOL`
- assets de heroes/cartas.

Pendiente:
- Usar componentes visuales compartidos de cartas/standees.

### Heroes/Roster depende de
- datos legacy de heroes.
- futuros tiers por personaje.
- assets de heroes por tier.

Pendiente:
- `features/frontline/heroProfile.ts` crea el mapping visual inicial `Hero -> FrontlineHeroDef` para poder renderizar todos los heroes con la gramatica Frontline.
- Queda pendiente el sistema real de tiers por personaje y assets por tier.

### Fortress depende de
- `features/frontline/fortress.ts`
- heroes como garrison.
- recursos/rewards.

Pendiente:
- Profundizar reward reveal, raid log y conexion con Shop/Adventure. Base visual de castillo interactivo ya iniciada.

### Shop depende de
- economia actual.
- recursos.
- shards.
- ofertas Frontline actuales: starter cache, spellforge prep, fortress supplies, hero shards, arena tickets y resources.
- futuros card packs reales, cosmetics y tier materials.

Pendiente:
- Crear rewards reales de cartas/cosmeticos cuando exista inventario para ello. Hoy los previews de cartas son visuales y las recompensas siguen siendo `Rewards`.

### Missions depende de
- progresion diaria/semanal.
- estados de Adventure, Combat, Fortress, Shop y Arena.

Pendiente:
- `/missions` ya fue convertida en `Command Log` visual con contratos, recompensas por icono, progreso y CTAs directos a modos.
- Pendiente: mas feedback de claim/reward reveal y conexion contextual con objetivos futuros de Fortress/Shop.

### Events y Arena dependen de
- Arena ya usa `FrontlineBattle` embebido con rivales `FrontlinePreset`, tickets, wins/losses y rewards.
- Events ya usa operaciones Frontline MVP con presets enemigos, rewards diarios y post-battle propio.
- TowerDefense queda fuera del flujo visible principal; su contenido se representa provisionalmente como una operacion Frontline de siege.

Pendiente:
- Crear mutadores Frontline reales por evento.
- Crear presets Frontline especificos para eventos/rangos.
- Profundizar Arena con rangos, matchmaking y progreso de ladder.
- Mantener tickets/rangos/rewards.

## Ranking de Deuda Artistica

Mayor necesidad de rediseño visual/art conflict:
1. Events mutator/reward depth
2. Arena ladder depth
3. Adventure data/precombat polish
4. Missions reward/depth polish
5. Heroes / Roster tier depth
6. Deck deeper build fantasy
7. Fortress reward/depth polish
8. Shop inventory/reward expansion
9. Team naming/nav cleanup
10. Home/Combat incremental polish

Pantallas con mayor riesgo de sentirse fuera del juego:
- Events: ya no lanza el flujo legacy principal, pero aun necesita mutadores/reward feel propios para no sentirse como selector de presets.
- Missions: parece checklist administrativa.
- Team: ya no es legacy funcional, pero necesita decision de naming/nav para no duplicar Deck.

## Plan de Ruta Recomendado

### Paso 1 - Arquitectura y sistema visual
- Mantener este documento actualizado.
- Extraer iconos/componentes compartidos antes de rehacer muchas pantallas.
- Definir navegacion Home-return.

### Paso 2 - Adventure data
- Migrar niveles a `frontlinePresetId`.
- Crear presets por tier.
- Preparar bosses simples.

### Paso 3 - Deck visual alignment
- Reutilizar standees/cartas de Combat. Iniciado: Deck ya usa `FrontlineHeroStandee` y `FrontlineCardView`.
- Reducir formulario. Iniciado: slots y pool pasan a piezas visuales, queda pendiente simplificar textos/copy.
- Mostrar build fantasy.

### Paso 4 - Heroes/Roster
- Rediseñar como coleccion/evolucion de personajes. Iniciado: Roster usa galeria de standees y modal de progression fantasy.
- Preparar tiers visuales futuros. Iniciado: se muestra estado `Frontline profile` / `Reserve profile` y mapping visual; falta tier system real.
- Conectar con Deck y Shop.

### Paso 5 - Missions
- Rediseñar como command log. Hecho: pantalla de contratos visuales.
- CTAs directos a pantallas relevantes. Hecho para Combat, Adventure, Heroes, Arena y Events.
- Mejor reward claim. Parcial: claim visual y recompensas por icono; falta reveal dedicado.

### Paso 6 - Arena y Events
- Arena migrada a Frontline en MVP: seleccion de rivales, tickets, recompensas y `FrontlineBattle` embebido.
- Events migrada a Frontline en MVP: operaciones, recompensas diarias y siege representado como preset Frontline.
- Crear presets y reglas especiales.
- Eliminar dependencia del combate viejo para flujos principales. Hecho para Arena/Events visibles; queda decidir si se borra o se archiva TowerDefense.

### Paso 7 - Fortress polish
- Mantener la base de castillo interactivo.
- Mejorar raid/reward feel, raid log y estados visuales por nivel.

### Paso 8 - Shop content
- Base alineada con Frontline/Fortress/Heroes.
- Pendiente: inventario real de cartas, cosmetics y tier materials.

## Reglas para Futuras Iteraciones

Antes de tocar una pantalla:
1. Identificar que componentes visuales compartidos deberia usar.
2. Ver si necesita volver a Home.
3. Ver que assets deben ser reutilizables.
4. Reducir texto visible antes de añadir nuevos bloques.
5. Mantener CTAs claros.
6. Validar que no se introducen rutas a assets inexistentes.
7. Actualizar este documento si cambia el mapa de pantallas o dependencias.

## Decisiones Abiertas

- `GameFixedStage` global obligatorio antes de monetización: definir una resolución lógica fija para el juego completo y migrar progresivamente Home, Adventure, Combat y pantallas posicionables para que fondo, nodos, props, hotspots y VFX escalen como una unidad controlada.
- Backend autoritativo obligatorio antes de monetización: Supabase/backend debe validar moneda premium, compras, claims, inventario, recompensas y progreso sensible. No confiar en canvas, DOM, localStorage ni requests del cliente como fuente de verdad.
- Si `Team` se mantiene como Squad Review, se renombra o se fusiona finalmente con `Deck`.
- Si `TowerDefenseRun` se mantiene como modo futuro o se absorbe en Fortress raids.
- Como evolucionar Arena desde rival selection simple hacia ladder por rangos o draft ligero.
- Como se representaran visualmente tiers de heroes: nuevo PNG por tier, marco por tier o ambos.
- Que parte de Shop vendera poder, cosmetica o conveniencia sin romper early game.
