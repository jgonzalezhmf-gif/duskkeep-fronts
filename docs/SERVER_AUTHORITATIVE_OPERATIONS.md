# Contratos de Operaciones Autoritativas

Este documento define las operaciones que deben pasar a servidor antes de considerar segura la economia online, el ladder o cualquier flujo monetizado. No implementa endpoints todavia; fija contratos y criterios para la siguiente fase.

Los contratos TypeScript y esquemas de validacion base viven en `features/server/authoritativeOperations.ts`. Cualquier endpoint, RPC o Server Action futura debe reutilizar esos esquemas antes de ejecutar logica transaccional.

La primera ruta proxy vive en `/api/server/authoritative`, permanece oculta salvo `SERVER_AUTHORITATIVE_API_ENABLED=true` y requiere `Authorization: Bearer <supabase-user-jwt>`. La ruta solo llama RPCs ya existentes y no usa service role.

La ruta aplica un rate limit basico en memoria antes de parsear el JSON. Usa una clave derivada de hash del bearer token o, si no hay token valido, de la IP reenviada. Este limite reduce abuso accidental o automatizado en el MVP, pero para despliegue distribuido debe sustituirse por un limitador compartido externo.

El cliente interno vive en `features/server/authoritativeClient.ts`. Centraliza el POST a `/api/server/authoritative`, exige token explicito, valida el payload con los mismos contratos locales y limita llamadas a las operaciones que ya tienen RPC.

El dispatcher progresivo vive en `features/server/authoritativeOperationDispatcher.ts`. Sus primeras integraciones conectadas a UI cubren `syncLocalSnapshot` para importacion explicita de progreso invitado, `purchaseShopOffer` para `adventure_key_ring`, `openAdventureMapInteraction` para cofres de mapa, `claimAdventureNodeReward` para nodos no-combate `c1l3`/`c1l7`, `claimAdventureBattleResult` para resultados de combate Adventure, `saveLoadout` desde Deck, `upgradeFrontlineCard` desde Deck, `claimDailyLogin` desde Home y `claimMission` para metricas cuyo progreso ya nace de eventos server-side. Si hay sesion Supabase usan el proxy autoritativo; si no hay sesion o la API esta desactivada, conservan el flujo local. Si el servidor conectado rechaza la operacion, no se hace fallback local para evitar bypass de reglas autoritativas.

La politica de progresion vive en `lib/progressionAuthoritativePolicy.ts`. Las mejoras de cartas Frontline ya usan `upgradeFrontlineCard` como operacion autoritativa. Las mejoras de heroes y fortaleza permanecen en local hasta tener modelo, RPC y migracion estables.

El smoke HTTP local vive en `scripts/smoke-authoritative-api.mjs` y se ejecuta con `npm.cmd run smoke:authoritative-api` despues de arrancar Supabase y Next con `SERVER_AUTHORITATIVE_API_ENABLED=true`. Este smoke usa Supabase Auth real, no service role.

## Principios de Contrato

- Toda operacion sensible recibe una `idempotencyKey`.
- Toda operacion valida usuario autenticado y ownership.
- Toda operacion comprueba prerequisitos en servidor.
- Toda operacion aplica cambios en una transaccion atomica.
- Toda operacion devuelve un snapshot parcial autoritativo.
- El cliente nunca envia el reward final como verdad; como maximo envia la accion solicitada.

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

Primera implementacion SQL: `public.sync_local_snapshot(p_idempotency_key text, p_local_version text, p_snapshot jsonb)`. Alcance inicial: importacion explicita de recursos, perfil basico, heroes, cartas Frontline, loadout, progreso Adventure y claims de mapa con allowlists/caps. No reduce progreso online existente y no debe considerarse suficiente para economia monetizada final.

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

Primera implementacion SQL: `public.purchase_shop_offer(p_idempotency_key text, p_offer_id text, p_quantity int)`. Alcance inicial: `adventure_key_ring`.

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

- `adventure_progress` avanza `adventure_levels_cleared` cuando un nodo pasa por primera vez a `cleared`, `claimed` o `first_clear_taken`.
- `battle_results` avanza `battles_won` cuando el ganador es `ally`.
- `battle_results` prepara tambien `arena_battles` y `events_played` cuando esas fuentes escriban resultados autoritativos.
- El progreso se escribe en `missions_progress` con ciclos `daily:YYYY-MM-DD` y `weekly:IYYY-IW`, calculados en servidor.

Pendiente:

- Mover `heroes_upgraded` a una operacion server-side antes de conectar claims de upgrade diarios a backend.
- Conectar UI de Missions a `claimMissionAuthoritatively` solo cuando el progreso relevante ya se este generando server-side para las fuentes visibles.

### `claimMission`

Reclama una mission completada.

Primera implementacion SQL: `public.claim_mission_reward(p_idempotency_key text, p_mission_id text, p_cycle_key text)`. Solo reclama filas existentes en `missions_progress` para el ciclo server-side actual. No acepta progreso ni recompensas enviados por el cliente.

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

Pendiente antes de conectar toda la UI: cubrir server-side las metricas que aun dependen de acciones locales, especialmente `heroes_upgraded`.

### `claimDailyLogin`

Reclama recompensa diaria.

Primera implementacion SQL: `public.claim_daily_login(p_idempotency_key text, p_local_day_key text)`. Usa el dia UTC del servidor como fuente de verdad y bloquea una segunda claim del mismo dia.

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

### `recordArenaResult`

Registra un resultado de Arena y actualiza estadisticas/ranking cuando exista ladder.

Payload:

```ts
type RecordArenaResultPayload = {
  opponentId: string;
  battleSeed: number;
  winner: "ally" | "enemy";
  turns: number;
  battleSummary: unknown;
};
```

Validaciones:

- El jugador tiene ticket o permiso de entrada.
- El oponente existe.
- El resultado no fue enviado antes.
- Para ladder futura, el servidor valida consistencia del resumen.

Resultado:

```ts
type RecordArenaResultResult = {
  arenaWins: number;
  arenaLosses: number;
  rating?: number;
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
