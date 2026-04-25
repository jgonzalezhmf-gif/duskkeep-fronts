# Frontline Progression

Fecha de corte: 2026-04-28

Este documento describe el estado actual y la direccion propuesta de la progresion vinculada a Duskkeep Fronts. Es documentacion de producto/arquitectura: no implica que todo este implementado.

## Objetivo

Frontline debe ser el nucleo jugable que conecte:
- Heroes progresados: el roster del jugador modifica los perfiles usados en combate, precombat, Deck y Fortress.
- Cartas Frontline: el mazo debe evolucionar desde un paquete inicial fijo hacia coleccion, desbloqueo y mejora de cartas.
- Combat: usa loadout, perfiles progresados, mazo y recompensas.
- Deck: prepara squad, lider y paquete de cartas.
- Fortress: usa el poder de heroes progresados para raids/garrison.

Regla de continuidad:
- Mantener offline-first con Zustand/localStorage.
- No acoplar Frontline a Supabase hasta que exista migracion clara.
- No duplicar economia ni rewards fuera del store/helpers existentes.

## Estado Actual

### Heroes Progresados

Ya existe una capa de adaptacion entre el roster legacy y Frontline:
- `PlayerHero` vive en `lib/types.ts` y conserva `heroId`, `level`, `stars`, `shards` y flags de desbloqueo.
- `features/frontline/heroProfile.ts` convierte un heroe del roster en `FrontlineHeroDef`.
- Si el heroe existe en `FRONTLINE_UNIT_BY_ID`, se usa su perfil Frontline base.
- Si no existe perfil Frontline explicito, se genera un fallback desde stats legacy.
- `applyFrontlineHeroProgression` aplica progresion local:
  - level sube principalmente `maxHp`, y periodicamente `atk`/`def`.
  - stars suben `maxHp`, `atk`, `def` y eventualmente `speed`.
  - solo se aplica a `family: "hero"`, no a enemigos.

Este perfil progresado ya alimenta:
- Combat/precombat: `BattlePageClient` resuelve `frontlineLoadout.squad` con `getFrontlineHeroProfileById`.
- Deck: muestra squad y perfiles Frontline para preparar los tres frentes.
- Roster modal: muestra stats Frontline y permite level/star desde el heroe.
- Fortress: `createFrontlineHeroProfileMap` permite que defensa de garrison use poder progresado.

### Loadout Frontline

El loadout actual contiene:
- `leaderId`.
- `squad`: 3 slots, uno por frente.
- `deck`: 8 slots.

Responsabilidades actuales:
- Deck modifica leader, squad y cartas.
- Battle valida `squadReady` y `deckReady`.
- Combat consume el loadout completo para inicializar batalla.

Limitacion:
- El mazo es todavia seleccion desde pool disponible, no una coleccion progresada.
- No hay cantidades, upgrades, rarezas funcionales, duplicados ni restricciones por propiedad.

### Fortress

Fortress ya esta conectada parcialmente a Frontline:
- Garrison usa heroes Frontline.
- Defensa combina edificios, integridad y poder de heroes progresados.
- Raids dan rewards segun outcome.
- Barracks aumenta eficiencia del garrison.

Limitacion:
- No hay cartas/defensas asignables a Fortress.
- No hay perks de edificios que desbloqueen cartas, slots o modificadores de combate.
- No hay relacion explicita entre raids y adquisicion de cartas Frontline.

## Sistema Implementado de Cartas Frontline

El objetivo no es reemplazar el motor actual, sino envolverlo con progresion derivada y segura.

Estado implementado:
- `frontlineCardUnlocks` vive en `lib/store.ts` como `Record<cardId, boolean>`.
- `frontlineCardLevels` vive en `lib/store.ts` como `Record<cardId, level>`.
- El save persiste ownership y niveles, no definiciones completas de cartas.
- `features/frontline/cardProgression.ts` deriva cartas y summons progresados desde `FRONTLINE_CARD_BY_ID` y `FRONTLINE_SUPPORT_BY_ID`.
- `createFrontlineCardProfileMap` crea el catalogo progresado del jugador.
- `createFrontlineSupportProfileMap` mejora tokens temporales de cartas `summon`.
- `FrontlineBattleState` puede recibir `allyCardProfiles` y `allySupportProfiles` como snapshot no persistido.
- Combat usa cartas progresadas para validacion, coste y ejecucion de efectos del jugador.
- Enemigos siguen usando el catalogo base.
- Deck muestra ownership, nivel/coste y permite mejorar cartas Frontline desbloqueadas con gold+dust.
- Team y Battle setup muestran cartas derivadas para que los efectos visibles coincidan con Combat.
- Adventure puede entregar cartas Frontline como `firstClearRewards.frontlineCards`.
- El preview de precombat y el payout real de victoria pasan por `getFrontlineAdventureRewardPreview(...)` y `getFrontlineAdventureVictoryRewards(...)` en `features/frontline/adventure.ts` para no duplicar la condicion first-clear.
- Battle Result muestra los unlocks de cartas como recompensas de primer clear.

Reglas actuales:
- Nivel maximo: 5.
- Starter deck desbloqueado por defecto: `FRONTLINE_STARTER_DECK`.
- Cartas fuera del starter aparecen bloqueadas hasta recibir `Rewards.frontlineCards`.
- Los costes de upgrade se calculan con `frontlineCardUpgradeCost(level)`.
- Las cartas bloqueadas no se pueden equipar ni mejorar.
- Los upgrades no reducen coste de Command.
- No se guardan cartas completas en localStorage para evitar congelar balance viejo.
- El sistema acepta saves antiguos: si no hay nivel persistido, una carta se considera nivel 1.
- Migracion de compatibilidad: si un save antiguo ya tenia una carta en `frontlineLoadout.deck`, se conserva como desbloqueada al rehidratar.

### Modelo de Coleccion

El modelo implementado para esta fase es deliberadamente pequeno:

```ts
type FrontlineCardUnlocks = Record<string, boolean>;
type FrontlineCardLevels = Record<string, number>;
```

Modelo de coleccion futuro posible:

```ts
type FrontlineCardCollectionEntry = {
  cardId: string;
  owned: boolean;
  copies: number;
  level: number;
  shards?: number;
  unlockedAt?: string;
};
```

Reglas mantenidas:
- El motor sigue consumiendo `FrontlineCardDef` simple.
- La progresion vive en store/helpers, no en componentes.
- Las mejoras de carta se traducen a una version derivada para UI/combat.
- `FRONTLINE_CARDS` base no se muta.

Pendiente:
- Copies/shards.
- Unlock source por Adventure/Fortress/Shop.
- Reglas de duplicados y restricciones de deck.

### Tipos de Carta

Estado actual implementado:
- `order`: orden directa a un frente/heroe.
- `tactic`: utilidad, burst, heal, stun o rally.
- `summon`: soporte temporal en un frente.

Tipos propuestos/futuros ya alineados visualmente:
- `gear`: mejora persistente o semi-persistente asociada a heroe/squad.
- `signature`: carta ligada a un heroe, desbloqueada por tier/star/quest.
- `relic`: modificador raro de run, Fortress o modo evento.

Reglas de diseno:
- `order`, `tactic`, `summon` pueden seguir siendo cartas de combate normales.
- `gear` no debe introducir equipo permanente dentro del motor hasta definir si es loadout, carta jugable o bonus pasivo.
- `signature` debe depender de `heroId` y no ser equipable si el heroe no esta en squad, salvo decision explicita.
- `relic` debe evitar power creep global; mejor como modificador de modo/evento o reward temporal.

### Fuentes de Obtencion

Fuentes sugeridas:
- Adventure first clear: ya desbloquea cartas base tempranas.
- Fortress raids: dan shards/copies de tacticas, summons y defensas.
- Shop: vende packs Frontline, shards o cartas destacadas.
- Events: mutadores y relics temporales con reward reveal propio.
- Arena: cartas cosmicas/competitivas o currency para upgrades, cuando el modo este migrado.
- Missions: objetivos que empujan a usar roles/tipos de carta.

Regla de economia:
- No crear una currency nueva si gold/dust/gems/tickets pueden cubrir el caso.
- Si se crea una currency de cartas, documentar primero su fuente, sink y rate.

Fuentes implementadas en Chapter 1:
- `c1l3` first clear desbloquea `order_shadow_dive`.
- `c1l7` first clear desbloquea `tactic_core_burst`.
- `c1l10` first clear desbloquea `summon_totem`.

### Upgrades de Carta

Fase implementada:
- Level visual y funcional.
- Costes de upgrade con gold+dust.
- Efectos derivados por nivel, con cap de nivel 5.
- Tests de motor para comprobar que Combat usa efectos progresados.

Escalado actual:
- `hero_strike`: sube `atk` y, si existe, `shield`.
- `front_shot`: sube `damage`.
- `rally`: sube `atk` y, si existe, `shield`.
- `heal_front`: sube `heal` y parcialmente `coreHeal`.
- `stun_front`: aumenta duración al llegar a nivel alto.
- `execute_front`: sube `damage` y parcialmente `bonusOpenCore`.
- `summon`: no cambia la carta, pero mejora el soporte invocado.

No hacer al inicio:
- Reducir Command cost por upgrade sin una regla global.
- Aumentar robo/mano/max deck desde upgrades individuales.
- Mezclar upgrade permanente con buffs temporales de run sin labels claros.

## Conexion Entre Sistemas

### Combat

Combat debe recibir:
- `frontlineLoadout`.
- Perfiles progresados de heroes.
- Definiciones de cartas derivadas si existe progresion de cartas.
- Contexto de modo: quick battle, Adventure, Event, Arena, Fortress drill, etc.

Combat no debe:
- Decidir rewards finales.
- Escribir directamente coleccion/progresion.
- Leer Shop/Fortress/Adventure seeds por su cuenta.

### Deck

Deck debe ser la pantalla de preparacion:
- Lider.
- Tres frentes.
- Ocho cartas.
- Validacion visual de si el loadout es legal.
- En el futuro: filtros por owned, tipo, coste, rol, signature y synergy.

Pendiente de diseno:
- Si permitir duplicados.
- Si exigir minimo/maximo por tipo.
- Si signatures ocupan slot normal o slot especial.
- Si gear/relic son cartas del mazo o equipamiento separado.

### Fortress

Fortress debe conectar con Frontline sin convertirse en otro motor:
- Garrison usa heroes progresados.
- Barracks puede mejorar eficiencia o desbloquear slots/perks defensivos.
- Treasury puede mejorar rewards de cards/copies.
- Keep puede desbloquear tiers de Fortress o proteger integridad.

Propuesta futura:
- Raids pueden conceder card copies/shards.
- Edificios pueden desbloquear categorias de reward, no stats opacas.
- Una futura "defense deck" debe documentarse antes de implementarse para no duplicar el Deck principal.

### Roster/Heroes

Roster debe ser la fuente de verdad de progresion de heroes:
- Level/stars/shards siguen ahi.
- Frontline profile es una vista derivada.
- Tiers visuales/skins deben usar `heroId + tier` o `skinKey`, no reemplazar `heroId`.

Pendiente:
- Definir si tier de heroe es cosmetico, stat gate, o ambos.
- Conectar signatures a milestones de heroe sin romper heroes no-Frontline-ready.

### Rewards/Shop/Missions

Estos sistemas deben operar sobre objetos de reward estables:
- Hoy existen `Rewards` con gold/dust/gems/accountXp/shards.
- Futuro puede agregar `cards`, `cardShards` o `frontlinePacks`, pero requiere migracion de persistencia.

Regla:
- Si `Rewards` crece, actualizar reward preview, burst overlay, missions, shop y battle result juntos.
- No introducir reward nuevo solo en una pantalla.

## Riesgos

- Persistencia: el modelo actual agrega `frontlineCardLevels` con merge seguro; una coleccion futura con owned/copies si requerira migracion explicita.
- Balance: aplicar level/stars de heroes y upgrades de cartas al mismo tiempo puede inflar power sin control.
- Determinismo: derivar efectos de cartas por nivel debe seguir siendo puro y testeado para no romper replay/sim.
- Duplicacion: Deck, Fortress, Shop y Rewards pueden acabar cada uno inventando su propia idea de "card ownership".
- Legacy overlap: siguen vivos motores/datos antiguos; no mezclar `data/cards.ts` legacy con `features/frontline/data.ts` sin capa de compatibilidad.
- UX: demasiadas currencies/copies/shards pueden convertir el alpha en panel de inventario en vez de juego.
- Assets: cartas futuras deben respetar manifest/fallback; no pedir PNGs especulativos.
- i18n: nombres/descripciones nuevas de cartas deben pasar por sistema de localizacion cuando sean user-facing.

## Tareas Pendientes

Prioridad alta:
- Decidir si `Rewards` incorpora `cards/cardShards/packs` o si se crea un wrapper de reward reveal.
- Crear reglas de legalidad de Deck: owned, duplicates, min/max por tipo, signatures.
- Balancear costes/curva de `frontlineCardUpgradeCost` con telemetria o playtests.

Prioridad media:
- Conectar Adventure first clear con unlocks de cartas.
- Definir Fortress raid rewards de cards/copies y su preview.
- Disenar Shop packs Frontline y bundles sin romper economia actual.
- Preparar UI de Deck para owned/unowned sin implementar logica en JSX.

Prioridad baja:
- Definir relics temporales para Events.
- Definir rewards/ranks de Arena Frontline.
- Definir tiers visuales/skins por `heroId + tier` o `skinKey`.
- Evaluar si Team legacy se fusiona con Roster/Deck o se archiva.

## Criterio Para Implementacion Futura

Antes de tocar codigo para este sistema, una tarea debe declarar:
- Que parte cambia: heroes, cartas, rewards, deck, fortress, shop o missions.
- Que shape de persistencia cambia y como migra saves antiguos.
- Que pantallas consumen el cambio.
- Que tests/checks validan determinismo y compatibilidad.

La progresion Frontline debe sentirse como preparacion para combate, no como inventario aislado.
