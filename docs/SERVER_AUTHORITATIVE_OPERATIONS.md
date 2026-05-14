# Contratos de Operaciones Autoritativas

Este documento define las operaciones que deben pasar a servidor antes de considerar segura la economia online, el ladder o cualquier flujo monetizado. No implementa endpoints todavia; fija contratos y criterios para la siguiente fase.

Los contratos TypeScript y esquemas de validacion base viven en `features/server/authoritativeOperations.ts`. Cualquier endpoint, RPC o Server Action futura debe reutilizar esos esquemas antes de ejecutar logica transaccional.

La primera ruta proxy vive en `/api/server/authoritative`, permanece oculta salvo `SERVER_AUTHORITATIVE_API_ENABLED=true` y requiere `Authorization: Bearer <supabase-user-jwt>`. La ruta solo llama RPCs ya existentes y no usa service role.

La ruta aplica un rate limit basico en memoria antes de parsear el JSON. Usa una clave derivada de hash del bearer token o, si no hay token valido, de la IP reenviada. Este limite reduce abuso accidental o automatizado en el MVP, pero para despliegue distribuido debe sustituirse por un limitador compartido externo.

El cliente interno vive en `features/server/authoritativeClient.ts`. Centraliza el POST a `/api/server/authoritative`, exige token explicito, valida el payload con los mismos contratos locales y limita llamadas a las operaciones que ya tienen RPC.

El dispatcher progresivo vive en `features/server/authoritativeOperationDispatcher.ts`. Sus primeras integraciones conectadas a UI cubren `syncLocalSnapshot` para importacion explicita de progreso invitado, `purchaseShopOffer` contra el catalogo server-side `server_shop_offers`, `openAdventureMapInteraction` para cofres de mapa, `claimAdventureNodeReward` para nodos no-combate `c1l3`/`c1l7`, `claimAdventureBattleResult` para resultados de combate Adventure, `recordArenaResult` para resultados de Arena, `recordEventResult` para resultados de Events, `saveLoadout` desde Deck, `upgradeFrontlineCard` desde Deck, `upgradeFrontlineFortress` desde Fortress, `claimDailyLogin` desde Home y `claimMission` para metricas cuyo progreso ya nace de operaciones server-side. Si hay sesion Supabase usan el proxy autoritativo; si no hay sesion o la API esta desactivada, conservan el flujo local. Si el servidor conectado rechaza la operacion, no se hace fallback local para evitar bypass de reglas autoritativas.

La politica de progresion vive en `lib/progressionAuthoritativePolicy.ts`. Las mejoras de nivel/estrellas/skills de heroes, cartas Frontline y edificios de la Fortress visible ya usan `levelUpHero`/`starUpHero`/`skillUpHero`/`upgradeFrontlineCard`/`upgradeFrontlineFortress` como operaciones autoritativas. La fortaleza clasica usada por sistemas legacy permanece en local hasta tener un modelo de migracion separado.

El smoke HTTP local vive en `scripts/smoke-authoritative-api.mjs` y se ejecuta con `npm.cmd run smoke:authoritative-api` despues de arrancar Supabase y Next con `SERVER_AUTHORITATIVE_API_ENABLED=true`. Este smoke usa Supabase Auth real, no service role.

## Principios de Contrato

- Toda operacion sensible recibe una `idempotencyKey`.
- Toda operacion valida usuario autenticado y ownership.
- Toda operacion comprueba prerequisitos en servidor.
- Toda operacion aplica cambios en una transaccion atomica.
- Toda operacion devuelve un snapshot parcial autoritativo.
- El cliente nunca envia el reward final como verdad; como maximo envia la accion solicitada.

## Rewards Server-Side

La base reutilizable vive en `public.grant_reward_bundle(...)` y `public.grant_reward_definition(...)`.

Objetivo:

- Las RPCs no deben duplicar la logica de sumar recursos, XP, shards o cartas.
- Las cantidades deben vivir en catalogos server-side, no en condiciones por oferta o por mision dentro del cliente.
- Los tests deben validar invariantes y comparar contra catalogo, no contra numeros de balance escritos a mano.

Tablas y funciones:

- `server_reward_definitions`: catalogo interno de recompensas reutilizables. No tiene policies de lectura/escritura para cliente.
- `jsonb_reward_payload_is_valid`: valida el shape permitido de rewards server-side.
- `grant_reward_bundle`: aplica un payload validado a `player_resources`, `profiles`, `player_heroes`, `player_frontline_cards` y `resource_ledger`.
- `grant_reward_definition`: resuelve un `reward_id` del catalogo y llama a `grant_reward_bundle`.
- `server_mission_definitions`: define ciclo, metrica, target y `reward_id` de misiones server-side.

Alcance actual:

- Shop ya usa `grant_reward_bundle` desde `purchase_shop_offer`.
- Daily Login ya usa `grant_reward_definition` para resolver `daily_login_streak_1..7`.
- Missions ya usa `server_mission_definitions` para progreso/claim y `grant_reward_definition` para rewards.
- El siguiente paso natural es migrar Adventure de forma incremental, reutilizando esta primitiva sin cambiar UI ni flujo local invitado.

## Formato Base

Request comun:

```ts
type ServerActionRequest<TPayload> = {
  idempotencyKey: string;
  payload: TPayload;
};
```

Response comun:

```ts
type ServerActionResponse<TResult> =
  | { ok: true; result: TResult; authoritative: true }
  | { ok: false; reason: string; code: string };
```

Codigos recomendados:

- `unauthenticated`
- `forbidden`
- `not_found`
- `locked`
- `insufficient_resources`
- `already_claimed`
- `daily_limit_reached`
- `invalid_loadout`
- `invalid_state`
- `idempotency_conflict`
- `rate_limited`

## Operaciones MVP

### `syncLocalSnapshot`

Migra un snapshot local a cuenta autenticada.

Primera implementacion SQL: `public.sync_local_snapshot(p_idempotency_key text, p_local_version text, p_snapshot jsonb)`. Alcance inicial: importacion explicita de recursos, perfil basico, heroes, cartas Frontline, loadout, Fortress visible, progreso Adventure y claims de mapa con allowlists/caps. No reduce progreso online existente y no debe considerarse suficiente para economia monetizada final.

Payload:

```ts
type SyncLocalSnapshotPayload = {
  localVersion: string;
  snapshot: unknown;
};
```

Validaciones:

- El usuario esta autenticado.
- El snapshot tiene shape esperado.
- Los valores estan dentro de rangos permitidos.
- No se importan balances imposibles.

Resultado:

```ts
type SyncLocalSnapshotResult = {
  profileId: string;
  imported: boolean;
  normalizedSnapshot: PlayerSnapshot;
};
```

Notas:

- Debe ser una operacion explicita, no automatica y silenciosa.
- Puede rechazar o recortar datos sospechosos.
- El cliente envia solo un snapshot whitelisted mediante `createLocalSyncSnapshot`; no se envia el store completo.
- La RPC aplica limites conservadores antes de persistir para reducir abuso de localStorage manipulado.
- `frontlineFortress` importa solo `buildings`, `integrity`, `garrison` y `raidsResolved`; no acepta reports ni datos calculados por cliente.

### `saveLoadout`

Guarda lider, squad y deck activos.

Primera implementacion SQL: `public.save_frontline_loadout(p_idempotency_key text, p_leader_id text, p_squad jsonb, p_deck jsonb)`. Alcance inicial: persistencia shape-safe y ownership-safe del loadout.

Payload:

```ts
type SaveLoadoutPayload = {
  leaderId: string;
  squad: (string | null)[];
  deck: (string | null)[];
};
```

Validaciones:

- El usuario esta autenticado.
- El tamano de squad/deck coincide con reglas actuales.
- El lider pertenece a la allowlist actual.
- Los heroes/cartas no nulos estan desbloqueados para el perfil.
- No hay duplicados en squad/deck.
- La operacion es idempotente.

Resultado:

```ts
type SaveLoadoutResult = {
  leaderId: string;
  squad: (string | null)[];
  deck: (string | null)[];
  updatedAt: string;
};
```

### `claimAdventureBattleResult`

Registra resultado de un nodo Adventure y concede recompensas validas.

Primera implementacion SQL: `public.claim_adventure_battle_result(p_idempotency_key text, p_node_id text, p_battle_seed bigint, p_winner text, p_turns int, p_battle_summary jsonb)`. Alcance inicial: combates de Chapter 1. Chapter 2 permanece bloqueado.

Payload:

```ts
type ClaimAdventureBattleResultPayload = {
  nodeId: string;
  battleSeed: number;
  winner: "ally" | "enemy";
  turns: number;
  battleSummary: unknown;
};
```

Validaciones:

- El nodo existe.
- El nodo esta disponible o es repetible.
- El resultado no fue reclamado con la misma idempotency key.
- Si `winner !== "ally"`, no se conceden recompensas de victoria.
- Si es primera victoria, se conceden base + first-clear.
- Si es replay, se aplica politica de repeticion.
- Chapter 2 sigue bloqueado hasta tener contenido.

Resultado:

```ts
type ClaimAdventureBattleResultResult = {
  progress: AdventureProgressSnapshot;
  rewardsGranted: Rewards;
  resources: Resources;
  unlockedNodeIds: string[];
};
```

### `openAdventureMapInteraction`

Abre un interactuable de mapa como key chest.

Primera implementacion SQL: `public.open_adventure_map_interaction(p_idempotency_key text, p_interaction_id text)`.

Payload:

```ts
type OpenAdventureMapInteractionPayload = {
  interactionId: string;
};
```

Validaciones:

- La interaccion existe.
- La interaccion esta desbloqueada por progreso.
- La claim anterior no esta activa o ya vencio el reset.
- El jugador tiene suficientes `adventureKeys`.
- El coste se consume y el loot se genera en la misma transaccion.

Resultado:

```ts
type OpenAdventureMapInteractionResult = {
  interactionId: string;
  status: "claimed";
  lootId: string;
  lootTier: string;
  lootTitle: string;
  rewardsGranted: Rewards;
  resources: Resources;
  resetAvailableAt: string | null;
};
```

### `claimAdventureNodeReward`

Reclama un nodo no-combate de Adventure, como cofres de ruta.

Primera implementacion SQL: `public.claim_adventure_node_reward(p_idempotency_key text, p_node_id text)`. Alcance inicial: `c1l3` y `c1l7`.

Payload:

```ts
type ClaimAdventureNodeRewardPayload = {
  nodeId: string;
};
```

Validaciones:

- El nodo existe y es reclamable.
- Los prerequisitos de ruta estan completados.
- El nodo no fue reclamado antes.
- La operacion es idempotente.

Resultado:

```ts
type ClaimAdventureNodeRewardResult = {
  nodeId: string;
  status: "claimed";
  rewardsGranted: Rewards;
  resources: Resources;
};
```

### `purchaseShopOffer`

Compra una oferta de Shop.

Implementacion SQL: `public.purchase_shop_offer(p_idempotency_key text, p_offer_id text, p_quantity int)`. La RPC lee coste, contenido, limite diario, one-time, ventana temporal y prerequisitos desde `public.server_shop_offers`. El cliente no decide coste ni recompensa.

Alcance actual del catalogo: ofertas con costes de recursos simples (`gold`, `dust`, `gems`, `adventureKeys`) y recompensas de recursos, `accountXp`, XP de squad Frontline, shards y unlocks de cartas. Cuando una compra afecta cuenta, heroes o cartas, el cliente rehidrata snapshot server-side despues de aplicar la compra para no calcular progresion sensible en local.

Payload:

```ts
type PurchaseShopOfferPayload = {
  offerId: string;
  quantity?: number;
};
```

Validaciones:

- La oferta existe y esta visible para el jugador.
- Si requiere desbloqueo, el prerequisito esta cumplido.
- `oneTime` no fue comprado antes.
- `dailyLimit` no fue superado en el ciclo actual.
- Hay recursos suficientes.
- La operacion es idempotente.

Resultado:

```ts
type PurchaseShopOfferResult = {
  offerId: string;
  quantity: number;
  costPaid: Rewards;
  contentsGranted: Rewards;
  resources: Resources;
  remaining: number | null;
};
```

### Progreso de misiones

Primera implementacion SQL: `public.advance_mission_progress` y triggers sobre `adventure_progress` y `battle_results`.

Reglas actuales:

- `server_mission_definitions` define `kind`, `metric`, `target` y `reward_id`.
- `adventure_progress` emite la metrica `adventure_levels_cleared` cuando un nodo pasa por primera vez a `cleared`, `claimed` o `first_clear_taken`.
- `battle_results` emite `battles_won` cuando el ganador es `ally`.
- `battle_results` emite tambien `arena_battles` y `events_played` cuando esas fuentes escriben resultados autoritativos.
- `advance_mission_progress` busca misiones activas por metrica y escribe `missions_progress` con ciclos `daily:YYYY-MM-DD` y `weekly:IYYY-IW`, calculados en servidor.

La UI de Missions usa `claimMissionAuthoritatively` para las metricas actuales porque su progreso visible ya puede nacer de operaciones server-side: Adventure, Arena, Events y upgrades de heroes.

Pendiente:

- Evitar que nuevas misiones futuras entren en claims online sin una fuente de progreso server-side documentada.
- Antes de monetizacion real, impedir que combates locales no autoritativos contribuyan a misiones reclamables online.

### `claimMission`

Reclama una mission completada.

Implementacion SQL: `public.claim_mission_reward(p_idempotency_key text, p_mission_id text, p_cycle_key text)`. Solo reclama filas existentes en `missions_progress` para el ciclo server-side actual. No acepta progreso ni recompensas enviados por el cliente. El target y reward se leen desde `server_mission_definitions`; el contenido se concede mediante `grant_reward_definition`.

Payload:

```ts
type ClaimMissionPayload = {
  missionId: string;
  cycleKey: string;
};
```

Validaciones:

- La mission existe.
- El progreso esta completo.
- No fue reclamada en ese ciclo.
- La idempotency key no se uso con otro payload.

Resultado:

```ts
type ClaimMissionResult = {
  missionId: string;
  cycleKey: string;
  rewardsGranted: Rewards;
  resources: Resources;
};
```

La politica cliente solo permite claims autoritativos para metricas con fuente server-side conocida. Si una mision futura queda fuera de esa politica, cuentas invitadas pueden seguir el flujo local de alpha, pero cuentas vinculadas no deben convertir progreso local no validado en recompensas online.

### `claimDailyLogin`

Reclama recompensa diaria.

Implementacion SQL: `public.claim_daily_login(p_idempotency_key text, p_local_day_key text)`. Usa el dia UTC del servidor como fuente de verdad y bloquea una segunda claim del mismo dia. La RPC calcula el streak y resuelve el contenido desde `server_reward_definitions` con ids `daily_login_streak_1..7`; el cliente no envia ni decide el reward.

Payload:

```ts
type ClaimDailyLoginPayload = {
  localDayKey: string;
};
```

Validaciones:

- El dia no fue reclamado.
- El servidor calcula el dia valido.
- El streak se actualiza segun ultima claim server-side.
- La operacion es idempotente.

Resultado:

```ts
type ClaimDailyLoginResult = {
  streak: number;
  rewardsGranted: Rewards;
  resources: Resources;
};
```

### `upgradeFrontlineCard`

Mejora una carta Frontline.

Primera implementacion SQL: `public.upgrade_frontline_card(p_idempotency_key text, p_card_id text)`. Alcance inicial: cartas del pool de jugador actual. El cliente solicita solo el `cardId`; el servidor calcula coste y nuevo nivel.

Payload:

```ts
type UpgradeFrontlineCardPayload = {
  cardId: string;
};
```

### `upgradeFrontlineFortress`

Mejora un edificio de la Fortress visible.

Primera implementacion SQL: `public.upgrade_frontline_fortress(p_idempotency_key text, p_building_id text)`. Alcance inicial: `keep`, `treasury` y `barracks`. El cliente solicita solo el edificio; el servidor calcula coste y nuevo nivel.

Payload:

```ts
type UpgradeFrontlineFortressPayload = {
  buildingId: "keep" | "treasury" | "barracks";
};
```

Validaciones:

- El usuario esta autenticado.
- El edificio pertenece a la allowlist actual.
- El coste de oro/polvo se calcula en servidor.
- El jugador tiene recursos suficientes.
- La operacion es idempotente.
- El gasto queda en `resource_ledger`.
- El estado persiste en `player_frontline_fortress` y se devuelve en snapshots de servidor.

Resultado:

```ts
type UpgradeFrontlineFortressResult = {
  buildingId: "keep" | "treasury" | "barracks";
  level: number;
  costPaid: { gold: number; dust: number };
  resources: Resources;
  frontlineFortress: FrontlineFortressState;
};
```

### `resolveFrontlineFortressRaid`

Resuelve el raid disponible de la Fortress visible.

Primera implementacion SQL: `public.resolve_frontline_fortress_raid(p_idempotency_key text)`. El cliente no envia poder de ataque, defensa, rewards ni timing; solo solicita resolver el raid. El servidor calcula disponibilidad, ataque, defensa, resultado, recompensas, cooldown y snapshot final.

Payload:

```ts
type ResolveFrontlineFortressRaidPayload = Record<string, never>;
```

Validaciones:

- El usuario esta autenticado.
- La Fortress existe o se inicializa con estado base server-side.
- `nextAttackAt` no esta en el futuro.
- Ataque, defensa y rewards se calculan en servidor desde edificios, guarnicion, heroes, nivel de cuenta e integridad.
- La operacion es idempotente.
- Los recursos ganados quedan en `resource_ledger`.
- La siguiente ventana de raid queda bloqueada por cooldown server-side.

Resultado:

```ts
type ResolveFrontlineFortressRaidResult = {
  report: FrontlineFortressReport;
  resources: Resources;
  frontlineFortress: FrontlineFortressState;
};
```

Validaciones:

- La carta existe.
- La carta pertenece al pool de cartas de jugador.
- La carta esta desbloqueada.
- No supera nivel maximo.
- El jugador tiene recursos suficientes.
- La operacion es idempotente.
- El gasto de oro/polvo queda en `resource_ledger`.

Resultado:

```ts
type UpgradeFrontlineCardResult = {
  cardId: string;
  level: number;
  costPaid: Rewards;
  resources: Resources;
};
```

### `levelUpHero`

Sube un nivel a un heroe desbloqueado.

Primera implementacion SQL: `public.level_up_hero(p_idempotency_key text, p_hero_id text)`. Alcance inicial: subida de nivel con coste de oro.

Payload:

```ts
type LevelUpHeroPayload = {
  heroId: string;
};
```

Validaciones:

- El usuario esta autenticado.
- El heroe pertenece a la allowlist actual.
- El heroe existe en `player_heroes` y esta desbloqueado.
- No supera nivel maximo server-side.
- El jugador tiene oro suficiente.
- La operacion es idempotente.
- El gasto de oro queda en `resource_ledger`.
- La mision `heroes_upgraded` avanza desde servidor.

Resultado:

```ts
type LevelUpHeroResult = {
  heroId: string;
  level: number;
  costPaid: { gold: number };
  resources: Resources;
};
```

### `starUpHero`

Sube una estrella a un heroe desbloqueado.

Primera implementacion SQL: `public.star_up_hero(p_idempotency_key text, p_hero_id text)`. Alcance inicial: subida de estrellas con coste de shards. No introduce ledger separado de shards; la auditoria queda en `server_operations.result` y el cambio atomico en `player_heroes`.

Payload:

```ts
type StarUpHeroPayload = {
  heroId: string;
};
```

Validaciones:

- El usuario esta autenticado.
- El heroe pertenece a la allowlist actual.
- El heroe existe en `player_heroes` y esta desbloqueado.
- No supera estrellas maximas server-side.
- El jugador tiene shards suficientes.
- La operacion es idempotente.
- La mision `heroes_upgraded` avanza desde servidor.

Resultado:

```ts
type StarUpHeroResult = {
  heroId: string;
  stars: number;
  shards: number;
  shardsSpent: number;
  resources: Resources;
};
```

### `skillUpHero`

Mejora el skill de un heroe desbloqueado.

Primera implementacion SQL: `public.skill_up_hero(p_idempotency_key text, p_hero_id text)`. Alcance inicial: subida de skill con coste de Arcane Dust.

Payload:

```ts
type SkillUpHeroPayload = {
  heroId: string;
};
```

Validaciones:

- El usuario esta autenticado.
- El heroe pertenece a la allowlist actual.
- El heroe existe en `player_heroes` y esta desbloqueado.
- No supera skill maximo server-side.
- El jugador tiene Dust suficiente.
- La operacion es idempotente.
- El gasto de Dust queda en `resource_ledger`.
- La mision `heroes_upgraded` avanza desde servidor.

Resultado:

```ts
type SkillUpHeroResult = {
  heroId: string;
  skillLevel: number;
  costPaid: { dust: number };
  resources: Resources;
};
```

### `recordArenaResult`

Registra un resultado de Arena y actualiza estadisticas basicas. La primera implementacion SQL es `public.record_arena_result(p_idempotency_key text, p_opponent_id text, p_battle_seed bigint, p_winner text, p_turns int, p_battle_summary jsonb)`.

Alcance MVP: consume 1 `arenaTicket`, concede rewards server-side segun rival/resultado, escribe `battle_results`, avanza misiones mediante trigger y devuelve el record de Arena. Todavia no simula la batalla en servidor ni calcula ladder real; para ladder competitivo sera necesario validar el resultado con seed/log o ejecutar la simulacion autoritativa.

Payload:

```ts
type RecordArenaResultPayload = {
  opponentId: string;
  battleSeed: number;
  winner: "ally" | "enemy" | "draw";
  turns: number;
  battleSummary: unknown;
};
```

Validaciones:

- El usuario esta autenticado.
- El oponente pertenece a la allowlist de rivales Arena actuales.
- El jugador tiene al menos 1 `arenaTicket`.
- El servidor calcula coste y rewards; el cliente no envia recompensas.
- La operacion es idempotente.
- El gasto de ticket y rewards quedan en `resource_ledger`.
- El resultado se escribe en `battle_results` con `source = 'arena'`.
- Para ladder futura, el servidor debera validar consistencia del resumen o simular el combate.

Resultado:

```ts
type RecordArenaResultResult = {
  arenaWins: number;
  arenaLosses: number;
  rewardsGranted: Rewards;
  resources: Resources;
};
```

### `recordEventResult`

Registra un resultado de Events y concede la recompensa diaria de primera victoria. La primera implementacion SQL es `public.record_event_result(p_idempotency_key text, p_event_id text, p_battle_seed bigint, p_winner text, p_turns int, p_battle_summary jsonb)`.

Alcance MVP: valida una allowlist de eventos visibles, comprueba desbloqueo por nivel de cuenta, escribe `battle_results` con `source = 'event'`, avanza misiones mediante trigger y concede rewards server-side solo en la primera victoria diaria de ese evento. El cliente no envia recompensas finales. Todavia no simula la batalla en servidor; para eventos competitivos sera necesario validar el log/seed o ejecutar la simulacion autoritativa.

Payload:

```ts
type RecordEventResultPayload = {
  eventId: string;
  battleSeed: number;
  winner: "ally" | "enemy" | "draw";
  turns: number;
  battleSummary: unknown;
};
```

Validaciones:

- El usuario esta autenticado.
- El evento pertenece a la allowlist actual.
- El perfil cumple el nivel minimo de desbloqueo del evento.
- El servidor calcula first-clear diario y rewards; el cliente no envia recompensas.
- Si no es primera victoria diaria, se registra el resultado pero no se conceden recompensas.
- La operacion es idempotente.
- Los recursos concedidos quedan en `resource_ledger`.
- El resultado se escribe en `battle_results` con `source = 'event'`.

Resultado:

```ts
type RecordEventResultResult = {
  eventId: string;
  winner: "ally" | "enemy" | "draw";
  firstClear: boolean;
  rewardsGranted: Rewards;
  resources: Resources;
};
```

## Idempotencia

Cada operacion sensible debe guardar:

- `idempotencyKey`
- `profileId`
- hash del payload
- resultado o estado final
- fecha de creacion

Reglas:

- Repetir misma key con mismo payload devuelve el mismo resultado.
- Repetir misma key con payload distinto devuelve `idempotency_conflict`.
- La key debe expirar solo cuando sea seguro para la operacion.

## Transacciones

Operaciones que deben ser atomicas:

- gastar recursos + conceder recompensas
- abrir key chest + roll loot + crear claim + ledger
- comprar oferta + actualizar limite + ledger
- reclamar mission + marcar claimed + ledger
- registrar victoria Adventure + progreso + desbloqueos + ledger

Si falla cualquier paso, no se debe gastar recurso ni conceder recompensa parcial.

## Validacion de Cliente vs Servidor

El cliente puede:

- mostrar previews
- calcular UI optimista no autoritativa
- enviar ids de accion
- enviar resumen de batalla para auditoria

El cliente no puede decidir:

- rewards finales
- balances finales
- loot roll
- unlocks definitivos
- estado de ladder
- exito de compra premium

## Criterios de Aceptacion

- Todas las operaciones sensibles tienen contrato documentado.
- Todas las operaciones tienen errores tipados.
- Todas las operaciones tienen idempotencia.
- Todas las operaciones devuelven snapshot autoritativo minimo.
- Ninguna operacion confia en rewards enviados por cliente.
- El modelo sigue permitiendo modo local/offline mientras se implementa backend.
