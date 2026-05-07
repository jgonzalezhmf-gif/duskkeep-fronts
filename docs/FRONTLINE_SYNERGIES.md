# Frontline — Sistema de Sinergias

Fecha de corte: 2026-05-07

## Qué es

Las sinergias son bonificaciones condicionales que se aplican al jugar una carta cuando la composición del squad o el estado del campo "encajan" con esa carta. No reemplazan el efecto base; lo amplifican o extienden. Su propósito es que la elección de héroes y el orden de las cartas tengan peso táctico, sin añadir una capa de balance separada.

Cada sinergia activa emite un evento `signature: "synergy"` con `signatureId` único y `label`. El UI lo refleja con un badge dorado:
- `SynergyProcBadge` (sobre el standee del actor) si el evento tiene `lane`.
- `SynergyGlobalToast` (banner central superior) si el evento no tiene `lane` (sinergias de presencia o globales).

## Categorías

Tres tipologías cubren todo el catálogo actual y deben servir para futuras sinergias:

| Categoría | Definición | Detección |
|---|---|---|
| **Affinity** | La carta se potencia cuando el target tiene el trait/role afín. | Comprobamos `heroDefinition(targetHero).trait.type` en `playCard`. |
| **Presence** | La carta se potencia cuando hay un ally vivo con un trait concreto en el squad. | `livingAllyWithTrait(state, side, traitType)`. |
| **Combo** | Dos cartas (o una carta y un soporte ya en campo) se buffan entre sí. | Lectura de estado global: rallied count, supports, stuns, etc. |

El badge UI es genérico y único — el `label` describe la sinergia. No se crea un componente nuevo por cada sinergia.

## Catálogo actual (Tanda 2)

| ID | Nombre | Categoría | Carta | Condición | Bonus |
|---|---|---|---|---|---|
| `blade_strike_affinity` | Blade Strike Affinity | Affinity | `order_twin_slash` | target ally con trait `flurry` (Blade Striker / Kara) | +2 ATK extra al target |
| `archers_focus` | Archer's Focus | Presence | `order_focus_fire` | ally vivo con trait `breach` (Breach Archer / Vex) | +2 daño |
| `shadow_strike` | Shadow Strike | Affinity (estado del target) | `order_shadow_dive` | enemy hero target stunned (`stun > 0`) | +3 daño |
| `bulwark_cohesion` | Bulwark Cohesion | Presence | `tactic_battle_hymn` | ally vivo con trait `bulwark` (Anchor Tank / Bran) | +1 ATK extra al rally (de +2 a +3) |
| `sanctified_healing` | Sanctified Healing | Affinity | `tactic_sanctuary` | target ally con trait `mend` (Field Healer / Mira) | cura 3 a las 2 lanes laterales |
| `howling_pack` | Howling Pack | Combo | `summon_wolf` | ≥2 ally heroes con `tempAtk > 0` (rally activo) | wolf entra con +2 HP / +1 ATK |
| `howling_echo` | Howling Pack Echo | Combo | `tactic_battle_hymn` | al menos 1 ally support en campo | +1 ATK al support |

Las afinidades por trait corresponden a roles "narrativos":

| Trait | Role narrativo | Heroes con el trait |
|---|---|---|
| `bulwark` | Anchor Tank | Bran |
| `flurry` | Blade Striker | Kara |
| `breach` | Breach Archer | Vex (también enemy `enemy_skirmisher`) |
| `mend` | Field Healer | Mira (también enemy `enemy_plague_priest`) |
| `ambush` | Shadow Finisher | Drak |
| `chant` | War Chanter | Tovi (también enemy `enemy_war_caller`) |

## Integración técnica

### Engine (`features/frontline/engine.ts`)

- Helper `livingAllyWithTrait(state, side, traitType)` — usado por Presence.
- Helper `ralliedAllyCount(state, side)` — usado por Howling Pack forward.
- Helper `emitSynergy(state, side, synergyId, label, lane?)` — empuja el evento `signature: "synergy"` con `signatureId` y `lane` opcional.
- La detección vive dentro de los bloques de cada `card.effect.type` en `playCard`. Esto evita un pipeline separado y mantiene la sinergia ligada al efecto que la activa. La condición se evalúa antes del efecto (para modificar `damage`/`atk`) o después (para spread heals, support buffs, etc).

### UI (`components/game/frontline/FrontlineBattle.tsx`)

- `HeroVisualState.synergy?: { id; label }` — derivado de `activeEvent` cuando `signature === "synergy"` y `event.side === side`.
- `SynergyProcBadge` — flotante dorado encima del standee del actor (lane-bound).
- `SynergyGlobalToast` — banner dorado en el área central cuando el evento no tiene `lane` (Presence/Combo globales).
- Ambos comparten el icono `buff` de `StatusIcon` y el mismo tono `amber-300/26 + border amber-200/80`.

### Tipos (`features/frontline/types.ts`)

- `FrontlineEvent.signature` admite `"synergy"` además de `"charge" | "cast" | "exhaust"`.
- `signatureId` reutiliza la propiedad existente.

## Cómo añadir una sinergia nueva

1. Dentro del bloque correspondiente de `playCard`, evaluar la condición sobre `state` (con `getHeroInLane`, `livingAllyWithTrait`, `ralliedAllyCount`, etc.).
2. Modificar el resultado del efecto (atk, damage, heal, support stats) y llamar a `emitSynergy(next, side, "id_unico", "Nombre legible", lane?)`. Pasa `lane` solo si la sinergia está ligada a un lane concreto — el UI usa eso para decidir entre badge sobre el standee (lane) o toast global (sin lane).
3. Añadir un test en `tests/frontline.engine.test.ts` que compare el efecto con/sin la condición y compruebe que el evento `signature: "synergy"` con `signatureId` correcto aparece en `state.events`.
4. Actualizar este documento (tabla del catálogo).

## Decisiones / por qué así

- **Categorías abstractas, badge único**: tener un componente por sinergia escalaría mal con decenas de entradas. El badge muestra el nombre y el icono `buff`; el log y el balance permiten distinguir el bonus.
- **Sanctuary aplica con `mend`, no con `bulwark`**: la curación encaja narrativamente con healers, no con tanks. Bran (bulwark) tiene su propio bonus a través de Bulwark Cohesion en Battle Hymn.
- **Howling Pack bidireccional**: el jugador no debería verse forzado a un orden específico de cartas. Si tiene un wolf en campo y juega Battle Hymn, el wolf también se beneficia (+1 ATK persistente sobre `support.atk`).
- **Presence vs Affinity**: separar las dos categorías permite que un héroe "esté" en el squad sin necesidad de ser el target — útil para cartas como `order_focus_fire` cuya target es un enemy.
- **Sin nuevo tipo de carta**: las sinergias viven en `playCard` y leen el estado. No se introduce `synergy` en `FrontlineCardDef` para evitar refactor amplio en `data.ts` y `cardProgression.ts`. Si la lista crece >15 sinergias o se quiere data-drive, se puede extraer entonces.

## Tests asociados

- `tests/frontline.engine.test.ts`:
  - Bulwark Cohesion (rally +1 con bulwark presence)
  - Sanctified Healing (mend target → spread heal)
  - Sanctified Healing NO se activa con bulwark target (regression)
  - Shadow Strike (stunned target → +3 dmg)
  - Howling Pack forward (wolf con rally activo)
  - Howling Pack echo (Battle Hymn con support en campo)
  - Blade Strike Affinity (Twin Slash + flurry target)
  - Archer's Focus (Focus Fire con breach presence)

## Pendiente / siguiente iteración

- Sinergias con cartas legendarias / signature de boss (cuando existan).
- Balance final tras playtest — los valores actuales son conservadores (+2 daño, +1 ATK, +3 heal) para no hacer pivote de balance global.
- Si el catálogo supera 15 sinergias, mover a un registro data-driven `features/frontline/synergies.ts` con `triggers` declarativos y resolver en un único pipeline.
- Tooltip en cartas indicando "sinergia con X" — ahora la sinergia se descubre solo al activarla.
