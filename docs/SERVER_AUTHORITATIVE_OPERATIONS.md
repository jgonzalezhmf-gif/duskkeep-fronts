# Contratos de Operaciones Autoritativas

Este documento define las operaciones que deben pasar a servidor antes de considerar segura la economia online, el ladder o cualquier flujo monetizado. No implementa endpoints todavia; fija contratos y criterios para la siguiente fase.

Los contratos TypeScript y esquemas de validacion base viven en `features/server/authoritativeOperations.ts`. Cualquier endpoint, RPC o Server Action futura debe reutilizar esos esquemas antes de ejecutar logica transaccional.

La primera ruta proxy vive en `/api/server/authoritative`, permanece oculta salvo `SERVER_AUTHORITATIVE_API_ENABLED=true` y requiere `Authorization: Bearer <supabase-user-jwt>`. La ruta solo llama RPCs ya existentes y no usa service role.

Antes de preparar una operacion sensible, el proxy valida que la configuracion publica no exponga secretos mediante `NEXT_PUBLIC_*`. Se permiten las claves publicas esperadas, como URL Supabase, anon key y persistencia, pero se rechazan nombres o valores con pinta de service-role, private key, password o secreto.

El header `Authorization` se limita en tamano y solo acepta un token Bearer con caracteres seguros de token. Supabase sigue siendo la autoridad de autenticacion real; esta validacion solo evita cabeceras anormales antes de crear el cliente RPC.

La ruta usa Fetch Metadata como defensa adicional: requests de navegador con `Sec-Fetch-Site: cross-site` se rechazan antes del rate limit y antes de parsear el body. Las llamadas sin ese header siguen permitidas para smokes, herramientas y clientes no navegador.

La ruta aplica un rate limit basico mediante el adaptador `AuthoritativeRateLimiter`. El backend actual es `memory`, configurado con `AUTHORITATIVE_RATE_LIMIT_BACKEND=memory`, y usa una clave derivada de hash del bearer token o, si no hay token valido, de la IP reenviada. Cualquier backend no soportado falla durante el arranque para evitar creer que hay proteccion distribuida cuando no existe. Ademas aplica un segundo limite por operacion ya parseada, con cuotas mas estrictas para `syncLocalSnapshot`, compras, cofres, claims, upgrades y resultados de combate. Estos limites reducen abuso accidental o automatizado en el MVP, pero para despliegue distribuido deben sustituirse por un adaptador compartido externo sin tocar la ruta ni los contratos.

La ruta emite eventos de seguridad estructurados solo para rechazos/fallos. Estos eventos registran etapa, codigo, estado HTTP, operacion sanitizada e identidad hasheada cuando existe. No registran bearer tokens, headers completos, payloads, rewards, resources ni datos de pago. Sirven para detectar rate limits, payloads invalidos, fallos RPC y futuros rechazos de replay sin exponer informacion sensible.

El sink de observabilidad se configura por entorno:

- `AUTHORITATIVE_SECURITY_EVENT_SINK=console` escribe JSON sanitizado por consola. Es el valor por defecto.
- `AUTHORITATIVE_SECURITY_EVENT_SINK=disabled` desactiva la emision.
- `AUTHORITATIVE_SECURITY_EVENT_SINK=webhook` envia el evento por `POST` a `AUTHORITATIVE_SECURITY_EVENT_WEBHOOK_URL`.
- En produccion, el webhook debe ser `https://`. En desarrollo se permite `http://localhost` para pruebas locales.
- `AUTHORITATIVE_SECURITY_EVENT_WEBHOOK_TIMEOUT_MS` limita el tiempo de envio y se acota entre 250 ms y 5000 ms.

Los fallos del sink no cambian la respuesta al jugador y se registran como eventos tecnicos de sink sin incluir la URL ni el payload original.

Cada request del proxy genera un `requestId` opaco y no sensible. Ese id se devuelve en la cabecera `X-Request-Id` y se incluye en los eventos sanitizados para poder correlacionar una respuesta rechazada con el log operacional sin exponer tokens, payloads ni datos de economia.

El cliente interno vive en `features/server/authoritativeClient.ts`. Centraliza el POST a `/api/server/authoritative`, exige token explicito, valida el payload con los mismos contratos locales y limita llamadas a las operaciones que ya tienen RPC.

El dispatcher progresivo vive en `features/server/authoritativeOperationDispatcher.ts`. Sus primeras integraciones conectadas a UI cubren `syncLocalSnapshot` para importacion explicita de progreso invitado, `purchaseShopOffer` contra el catalogo server-side `server_shop_offers`, `openAdventureMapInteraction` para cofres de mapa, `claimAdventureNodeReward` para nodos no-combate `c1l3`/`c1l7`, `claimAdventureBattleResult` para resultados de combate Adventure, `recordArenaResult` para resultados de Arena, `recordEventResult` para resultados de Events, `saveLoadout` desde Deck, `upgradeFrontlineCard` desde Deck, `upgradeFrontlineFortress` desde Fortress, `claimDailyLogin` desde Home y `claimMission` para metricas cuyo progreso ya nace de operaciones server-side. Si hay sesion Supabase usan el proxy autoritativo; si no hay sesion o la API esta desactivada, conservan el flujo local. Si el servidor conectado rechaza la operacion, no se hace fallback local para evitar bypass de reglas autoritativas.

La politica de progresion vive en `lib/progressionAuthoritativePolicy.ts`. Las mejoras de nivel/estrellas/skills de heroes, cartas Frontline y edificios de la Fortress visible ya usan `levelUpHero`/`starUpHero`/`skillUpHero`/`upgradeFrontlineCard`/`upgradeFrontlineFortress` como operaciones autoritativas. Los engines legacy de combate/defensa fueron eliminados en `0.38.0`; cualquier modo futuro debe entrar por contratos autoritativos nuevos o por un fallback local explicito de desarrollo.

El smoke HTTP local vive en `scripts/smoke-authoritative-api.mjs` y se ejecuta con `npm.cmd run smoke:authoritative-api` despues de arrancar Supabase y Next con `SERVER_AUTHORITATIVE_API_ENABLED=true`. Este smoke usa Supabase Auth real, no service role.

## Principios de Contrato

- Toda operacion sensible recibe una `idempotencyKey`.
- Toda operacion valida usuario autenticado y ownership.
- Toda operacion comprueba prerequisitos en servidor.
- Toda operacion aplica cambios en una transaccion atomica.
- Toda operacion devuelve un snapshot parcial autoritativo.
- El cliente nunca envia el reward final como verdad; como maximo envia la accion solicitada.
- Los schemas de payload de operaciones sensibles son estrictos: campos como `cost`, `costPaid`, `rewards`, `rewardsGranted`, `resources` o `rewardId` enviados por cliente deben rechazarse salvo que una operacion concreta los defina explicitamente como input seguro.

## Rewards Server-Side

La base reutilizable vive en `public.grant_reward_bundle(...)` y `public.grant_reward_definition(...)`.

Objetivo:

- Las RPCs no deben duplicar la logica de sumar recursos, XP, shards o cartas.
- Las cantidades deben vivir en catalogos server-side, no en condiciones por oferta o por mision dentro del cliente.
- Los tests deben validar invariantes y comparar contra catalogo, no contra numeros de balance escritos a mano.

Tablas y funciones:

- `server_reward_definitions`: catalogo interno de recompensas reutilizables. No tiene policies de lectura/escritura para cliente.
- `jsonb_reward_payload_is_valid`: valida el shape permitido de rewards server-side.
- `grant_reward_bundle`: aplica un payload validado a `player_resources`, `profiles`, `player_heroes`, `player_frontline_cards` y `resource_ledger`. La XP de cuenta se normaliza siempre en servidor como `account_level` + XP sobrante antes de devolver el snapshot.
- `grant_reward_definition`: resuelve un `reward_id` del catalogo y llama a `grant_reward_bundle`.
- `server_mission_definitions`: define ciclo, metrica, target y `reward_id` de misiones server-side.
- `server_adventure_node_rewards`: define nodos Adventure no-combate reclamables, prerequisitos y `reward_id`.
- `server_adventure_map_interactions` y `server_adventure_map_loot_entries`: definen interactuables de mapa, coste, cooldown, prerequisitos y loot table ponderada por `reward_id`.
- `server_adventure_battle_nodes`: define nodos Adventure de combate, prerequisitos, unlocks, tipo y rewards first-clear/replay por `reward_id`.
- `server_arena_opponents`: define rivales Arena, preset, coste de ticket y rewards por resultado mediante `reward_id`.
- `server_event_definitions`: define eventos, preset, nivel de desbloqueo y reward diario first-clear mediante `reward_id`.
- `server_frontline_fortress_buildings`: define edificios de Fortress visible, nivel maximo y curva de coste server-side.
- `server_frontline_fortress_hero_scores`: define la contribucion base de cada heroe a la defensa de Fortress.
- `server_frontline_fortress_raid_profiles`: define formula de ataque/defensa, cooldown, outcomes e importes base de rewards de raids Fortress.
- `server_upgradeable_heroes`: define heroes que pueden progresar y sus limites de nivel, estrellas y skill.
- `server_hero_upgrade_costs`: define costes server-side de level/star/skill por valor actual.
- `server_upgradeable_frontline_cards`: define cartas Frontline que pueden progresar y su nivel maximo.
- `server_frontline_card_upgrade_costs`: define costes server-side de mejora de cartas por nivel actual.

Alcance actual:

- Shop ya usa `grant_reward_bundle` desde `purchase_shop_offer`.
- Daily Login ya usa `grant_reward_definition` para resolver `daily_login_streak_1..7`.
- Missions ya usa `server_mission_definitions` para progreso/claim y `grant_reward_definition` para rewards.
- Adventure node rewards no-combate ya usa `server_adventure_node_rewards` para `c1l3`/`c1l7`.
- Adventure map interactions ya usa catalogos internos para `c1-lower-cache`, coste de llave, cooldown y loot table.
- Adventure battle results ya usa `server_adventure_battle_nodes` para Chapter 1 combat nodes.
- Arena results ya usa `server_arena_opponents` para rivales, coste de ticket y rewards win/draw/loss.
- Event results ya usa `server_event_definitions` para eventos, unlock level, preset y reward diario first-clear.
- Fortress upgrades ya usa `server_frontline_fortress_buildings` para edificios habilitados, nivel maximo y costes.
- Fortress raids ya usa `server_frontline_fortress_hero_scores` y `server_frontline_fortress_raid_profiles` para calcular defensa, ataque, outcome, cooldown y rewards.
- Hero progression ya usa `server_upgradeable_heroes` y `server_hero_upgrade_costs` para heroes permitidos, limites y costes de level/star/skill.
- Frontline card progression ya usa `server_upgradeable_frontline_cards` y `server_frontline_card_upgrade_costs` para cartas permitidas, nivel maximo y costes.

## Cobertura Data-Driven Actual

Esta matriz resume que valores de balance se resuelven desde servidor y donde se valida que el cliente no decide cantidades finales. En migraciones SQL puede aparecer codigo antiguo con importes hardcodeados porque el historico mantiene versiones anteriores; tras `supabase db reset`, la funcion activa es la ultima `create or replace function` aplicada.

| Operacion | Catalogo / fuente server-side | Smoke / cobertura actual | Riesgo residual |
| --- | --- | --- | --- |
| `purchaseShopOffer` | `server_shop_offers` + `grant_reward_bundle` | El smoke compara coste, contenido y limites contra catalogo. | Solo soporta los tipos de coste/reward definidos en el grant base. |
| `claimDailyLogin` | `server_reward_definitions` con `daily_login_streak_*` | El smoke compara el reward concedido contra `server_reward_definitions`. | La secuencia de streak es fija; si cambia el modelo diario, ampliar catalogo antes de tocar RPC. |
| `claimMission` | `server_mission_definitions` + `server_reward_definitions` | El smoke valida target, ciclo y reward desde catalogos. | Nuevas metricas deben nacer de eventos server-side antes de poder reclamar online. |
| `claimAdventureNodeReward` | `server_adventure_node_rewards` + `server_reward_definitions` | El smoke valida prerequisitos, claim unica y reward por `reward_id`. | Nuevos tipos no-combate deben registrarse en catalogo antes de exponerse online. |
| `openAdventureMapInteraction` | `server_adventure_map_interactions`, `server_adventure_map_loot_entries`, `server_reward_definitions` | El smoke valida coste, cooldown, loot ponderado y reward por catalogo. | La aleatoriedad es server-side, pero conviene ampliar observabilidad si el loot pasa a monetizacion. |
| `claimAdventureBattleResult` | `server_adventure_battle_nodes` + `server_reward_definitions` | El smoke valida prerequisitos, first-clear/replay, unlocks y rewards desde catalogo. | El resultado de combate todavia se acepta como resumen cliente en MVP; ladder/competitivo requiere simulacion o log validado server-side. |
| `recordArenaResult` | `server_arena_opponents` + `server_reward_definitions` | El smoke valida coste de ticket y reward win/draw/loss desde catalogo. | Igual que combate: antes de ranking real, validar resultado en servidor. |
| `recordEventResult` | `server_event_definitions` + `server_reward_definitions` | El smoke valida unlock level y first-clear diario desde catalogo. | Nuevos eventos con reglas especiales deben evitar logica puntual dentro de RPC. |
| `upgradeFrontlineFortress` | `server_frontline_fortress_buildings` | El smoke valida coste/nivel contra funcion y tabla server-side. | Si aparecen nuevos edificios, registrar curva en catalogo antes de UI. |
| `resolveFrontlineFortressRaid` | `server_frontline_fortress_hero_scores` + `server_frontline_fortress_raid_profiles` | El smoke valida cooldown/outcome/rewards por perfil. | El modelo es formula server-side; si el balance se vuelve complejo, extraer mas columnas de perfil. |
| `levelUpHero` / `starUpHero` / `skillUpHero` | `server_upgradeable_heroes` + `server_hero_upgrade_costs` | El smoke valida costes y limites desde catalogo. | El sistema esta preparado para cambiar curvas sin tocar UI, pero progresiones nuevas necesitan columnas/tabla nuevas. |
| `upgradeFrontlineCard` | `server_upgradeable_frontline_cards` + `server_frontline_card_upgrade_costs` | El smoke valida coste/nivel contra catalogo. | Si se anaden evoluciones o rarezas con reglas propias, deben modelarse como datos, no como `case` por carta. |

Valores que pueden seguir como constantes por ahora:

- Limites defensivos de importacion de snapshot local. No son balance jugable; son caps de seguridad para evitar importes imposibles desde modo invitado.
- Recursos iniciales de provisioning. Son seed de cuenta, no reward repetible; si se van a balancear a menudo, conviene moverlos a un catalogo `server_starter_profile`.
- Numeros esperados en smoke tests que preparan estado. Solo deben comprobar transiciones de prueba, no convertirse en fuente de balance.

Siguiente bloque recomendado antes de monetizacion o ranking:

- Validacion server-side de resultados de combate, al menos para Arena/ladder y eventos competitivos.
- Rate limit compartido fuera de memoria para despliegue distribuido.
- Observabilidad de operaciones sensibles: compras, loot rolls, sync invitado, claims repetidos e idempotency conflicts.
- Catalogo de provisioning si se prevé ajustar recursos iniciales con frecuencia.

## Validacion Defensiva de Resultados Frontline

La primera capa de validacion server-side de combate vive en `public.frontline_battle_summary_is_consistent(...)` y en el trigger `battle_results_validate_frontline_summary`.

Alcance actual:

- Aplica a inserts/updates de `battle_results` con `source` `adventure`, `arena` o `event`.
- Exige que `summary` incluya `allyCoreHp` y `enemyCoreHp`.
- Los clientes Frontline construyen el summary con `createFrontlineBattleSummary`, que incluye `schemaVersion`, `engineVersion`, `seed`, `round`, `maxRounds`, lanes y eventos recientes.
- El summary incluye un `actionLog` canonico generado por la UI de combate a partir de acciones reales del jugador: cartas jugadas, poderes de lider y resolver turno.
- El contrato TypeScript rechaza summaries cuyo `seed`, `round` o `winner` no coincidan con la operacion enviada.
- El contrato TypeScript valida forma defensiva del `actionLog`: secuencia estrictamente creciente, rondas dentro del combate y campos obligatorios por tipo de accion.
- Si el summary incluye `winner` o `round`, deben coincidir con los campos persistidos.
- Rechaza victorias imposibles: por ejemplo `winner = 'ally'` con `enemyCoreHp > 0` antes del max round.
- Permite victorias por limite de rondas cuando `turns >= 8` y el core declarado ganador tiene mas HP.

Esto reduce abuso obvio y evita que rewards/misiones/ranking futuro se apoyen en un resultado contradictorio. No sustituye la simulacion server-side completa: Arena competitiva o ladder real siguen necesitando replay determinista o ejecucion de combate en servidor.

La primera pieza de replay determinista vive en `features/frontline/battleReplay.ts`. Reutiliza el engine Frontline existente, no duplica reglas, y reproduce una partida desde `seed`, `loadout`, `preset` y `actionLog`. Tambien permite comparar el summary declarado con el resultado reproducido para detectar divergencias en core HP, winner, rondas, lanes o log.

El gate de proxy vive en `features/server/authoritativeBattleReplayGuard.ts` y se activa solo con `SERVER_FRONTLINE_REPLAY_VALIDATION=true`. Cuando esta activo:

- Resuelve el preset por operacion (`nodeId`, `opponentId` o `eventId`) desde catalogos internos del servidor.
- Lee `frontline_loadouts`, `player_heroes` y `player_frontline_cards` mediante anon key + JWT del usuario y RLS.
- Exige `actionLog` y reproduce el combate antes de llamar a la RPC.
- Rechaza summaries cuyo resultado no coincide con el replay.

Permanece desactivado por defecto para no bloquear entornos donde la progresion server-side todavia no este completamente sincronizada con el cliente.

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
- Los heroes, cartas, nodos Adventure e interacciones de mapa deben existir en catalogos server-side habilitados.
- El loadout y la garrison solo aceptan unidades/cartas ya poseidas o desbloqueadas tras la importacion validada.

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
- La RPC ignora IDs desconocidos o no habilitados aunque aparezcan en el snapshot local; el cliente no puede crear heroes, cartas, nodos ni claims nuevos por enviar strings inventados.
- `frontlineFortress` importa solo `buildings`, `integrity`, `garrison` y `raidsResolved`; no acepta reports ni datos calculados por cliente.
- Esta importacion sigue siendo un puente alpha para vincular progreso invitado a una cuenta nueva; para economia monetizada final debe mantenerse el enfoque de operaciones incrementales autoritativas.

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

Implementacion SQL: `public.claim_adventure_battle_result(p_idempotency_key text, p_node_id text, p_battle_seed bigint, p_winner text, p_turns int, p_battle_summary jsonb)`. Alcance actual: combates de Chapter 1 definidos en `server_adventure_battle_nodes`. Chapter 2 permanece bloqueado.

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
- Prerequisitos, unlocks y rewards first-clear/replay se resuelven desde catalogo server-side.

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

Implementacion SQL: `public.open_adventure_map_interaction(p_idempotency_key text, p_interaction_id text)`. La interaccion, coste, prerequisitos, cooldown y loot ponderado se leen desde `server_adventure_map_interactions` y `server_adventure_map_loot_entries`; el cliente no envia ni decide rewards ni probabilidades.

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
- El loot entry elegido resuelve su contenido por `reward_id` desde `server_reward_definitions`.

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

Implementacion SQL: `public.claim_adventure_node_reward(p_idempotency_key text, p_node_id text)`. Alcance actual: nodos no-combate definidos en `server_adventure_node_rewards`, empezando por `c1l3` y `c1l7`.

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
- El reward se resuelve por `reward_id` desde catalogo server-side.

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

Primera implementacion SQL: `public.upgrade_frontline_fortress(p_idempotency_key text, p_building_id text)`. Alcance inicial: `keep`, `treasury` y `barracks`. El cliente solicita solo el edificio; el servidor calcula coste y nuevo nivel desde el catalogo interno `server_frontline_fortress_buildings`.

Payload:

```ts
type UpgradeFrontlineFortressPayload = {
  buildingId: "keep" | "treasury" | "barracks";
};
```

Validaciones:

- El usuario esta autenticado.
- El edificio existe, esta habilitado y no supera el nivel maximo definido en `server_frontline_fortress_buildings`.
- El coste de oro/polvo se calcula en servidor desde `gold_base`/`dust_base` y sus curvas de crecimiento.
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

Primera implementacion SQL: `public.resolve_frontline_fortress_raid(p_idempotency_key text)`. El cliente no envia poder de ataque, defensa, rewards ni timing; solo solicita resolver el raid. El servidor calcula disponibilidad, ataque, defensa, resultado, recompensas, cooldown y snapshot final desde catalogos internos.

Payload:

```ts
type ResolveFrontlineFortressRaidPayload = Record<string, never>;
```

Validaciones:

- El usuario esta autenticado.
- La Fortress existe o se inicializa con estado base server-side.
- `nextAttackAt` no esta en el futuro.
- Ataque, defensa y rewards se calculan en servidor desde edificios, guarnicion, heroes, nivel de cuenta, integridad y `server_frontline_fortress_raid_profiles`.
- La contribucion de heroes se resuelve desde `server_frontline_fortress_hero_scores`.
- La operacion es idempotente.
- Los recursos ganados pasan por `grant_reward_bundle` y quedan en `resource_ledger`.
- La siguiente ventana de raid queda bloqueada por cooldown server-side.

Resultado:

```ts
type ResolveFrontlineFortressRaidResult = {
  report: FrontlineFortressReport;
  resources: Resources;
  frontlineFortress: FrontlineFortressState;
};
```

### `upgradeFrontlineCard`

Mejora una carta Frontline desbloqueada.

Implementacion SQL: `public.upgrade_frontline_card(p_idempotency_key text, p_card_id text)`. El cliente solicita solo `cardId`; la carta permitida, el nivel maximo y el coste se resuelven desde `server_upgradeable_frontline_cards` y `server_frontline_card_upgrade_costs`.

Payload:

```ts
type UpgradeFrontlineCardPayload = {
  cardId: string;
};
```

Validaciones:

- La carta esta habilitada en `server_upgradeable_frontline_cards`.
- La carta pertenece al pool de cartas de jugador.
- La carta esta desbloqueada.
- No supera nivel maximo definido server-side.
- El coste se resuelve por `server_frontline_card_upgrade_costs`.
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

Primera implementacion SQL: `public.level_up_hero(p_idempotency_key text, p_hero_id text)`. Alcance inicial: subida de nivel con coste de oro. El heroe permitido, nivel maximo y coste se resuelven desde `server_upgradeable_heroes` y `server_hero_upgrade_costs`.

Payload:

```ts
type LevelUpHeroPayload = {
  heroId: string;
};
```

Validaciones:

- El usuario esta autenticado.
- El heroe esta habilitado en `server_upgradeable_heroes`.
- El heroe existe en `player_heroes` y esta desbloqueado.
- No supera nivel maximo definido server-side.
- El coste se resuelve por `server_hero_upgrade_costs`.
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

Primera implementacion SQL: `public.star_up_hero(p_idempotency_key text, p_hero_id text)`. Alcance inicial: subida de estrellas con coste de shards. El heroe permitido, estrellas maximas y coste se resuelven desde `server_upgradeable_heroes` y `server_hero_upgrade_costs`. No introduce ledger separado de shards; la auditoria queda en `server_operations.result` y el cambio atomico en `player_heroes`.

Payload:

```ts
type StarUpHeroPayload = {
  heroId: string;
};
```

Validaciones:

- El usuario esta autenticado.
- El heroe esta habilitado en `server_upgradeable_heroes`.
- El heroe existe en `player_heroes` y esta desbloqueado.
- No supera estrellas maximas definidas server-side.
- El coste de shards se resuelve por `server_hero_upgrade_costs`.
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

Primera implementacion SQL: `public.skill_up_hero(p_idempotency_key text, p_hero_id text)`. Alcance inicial: subida de skill con coste de Arcane Dust. El heroe permitido, skill maximo y coste se resuelven desde `server_upgradeable_heroes` y `server_hero_upgrade_costs`.

Payload:

```ts
type SkillUpHeroPayload = {
  heroId: string;
};
```

Validaciones:

- El usuario esta autenticado.
- El heroe esta habilitado en `server_upgradeable_heroes`.
- El heroe existe en `player_heroes` y esta desbloqueado.
- No supera skill maximo definido server-side.
- El coste de Dust se resuelve por `server_hero_upgrade_costs`.
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

Registra un resultado de Arena y actualiza estadisticas basicas. La implementacion SQL es `public.record_arena_result(p_idempotency_key text, p_opponent_id text, p_battle_seed bigint, p_winner text, p_turns int, p_battle_summary jsonb)`.

Alcance MVP: lee rival, preset, coste de `arenaTicket` y reward por resultado desde `server_arena_opponents`, escribe `battle_results`, avanza misiones mediante trigger y devuelve el record de Arena. Arena queda separada de Ladder: Arena usa tickets y batallas especiales; Ladder usa otra RPC sin coste de ticket.

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
- El oponente pertenece al catalogo server-side de rivales Arena actuales.
- El jugador tiene al menos 1 `arenaTicket`.
- El servidor calcula coste y rewards por `reward_id`; el cliente no envia recompensas.
- La operacion es idempotente.
- El gasto de ticket y rewards quedan en `resource_ledger`.
- El resultado se escribe en `battle_results` con `source = 'arena'`.
- Para modos competitivos publicos, el servidor debera validar el replay completo o simular el combate.

Resultado:

```ts
type RecordArenaResultResult = {
  arenaWins: number;
  arenaLosses: number;
  rewardsGranted: Rewards;
  resources: Resources;
};
```

### `recordLadderResult`

Registra un resultado de Ladder y actualiza puntos, rango, progreso de llave y rewards anti-farm. La implementacion SQL es `public.record_ladder_result(p_idempotency_key text, p_opponent_id text, p_battle_seed bigint, p_winner text, p_turns int, p_battle_summary jsonb)`.

Alcance MVP: lee rangos desde `server_ladder_tiers`, rivales desde `server_ladder_opponents` y premios desde `server_ladder_reward_rules`. Solo Bronce III-II-I esta habilitado. El cliente no envia MMR, rewards ni progreso de llave como verdad.

Payload:

```ts
type RecordLadderResultPayload = {
  opponentId: string;
  battleSeed: number;
  winner: "ally" | "enemy" | "draw";
  turns: number;
  battleSummary: unknown;
};
```

Validaciones:

- El usuario esta autenticado.
- El rival pertenece al catalogo server-side de Ladder y coincide con el rango actual del jugador.
- El servidor calcula puntos, rango, rewards, limite diario de rewards normales y progreso de llave.
- La operacion es idempotente.
- Los recursos concedidos quedan en `resource_ledger`.
- El resultado se escribe en `battle_results` con `source = 'ladder'`.
- El snapshot devuelve `ladder` para que el cliente no use cache local como autoridad online.

Resultado:

```ts
type RecordLadderResultResult = {
  opponentId: string;
  winner: "ally" | "enemy" | "draw";
  rewardsGranted: Rewards;
  resources: Resources;
  ladder: {
    seasonId: string;
    points: number;
    league: string;
    division: string;
    keyProgress: number;
    dailyRewardedWins: number;
    dailyCycleKey: string | null;
  };
  pointsDelta: number;
  keyProgressDelta: number;
  adventureKeysGranted: number;
  rewardMode: "normal" | "reduced" | "draw" | "loss";
};
```

### `recordEventResult`

Registra un resultado de Events y concede la recompensa diaria de primera victoria. La implementacion SQL es `public.record_event_result(p_idempotency_key text, p_event_id text, p_battle_seed bigint, p_winner text, p_turns int, p_battle_summary jsonb)`.

Alcance MVP: lee evento, preset, nivel de desbloqueo y reward diario first-clear desde `server_event_definitions`, escribe `battle_results` con `source = 'event'`, avanza misiones mediante trigger y concede rewards server-side solo en la primera victoria diaria de ese evento. El cliente no envia recompensas finales. Todavia no simula la batalla en servidor; para eventos competitivos sera necesario validar el log/seed o ejecutar la simulacion autoritativa.

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
- El evento pertenece al catalogo server-side actual.
- El perfil cumple el nivel minimo de desbloqueo del evento.
- El servidor calcula first-clear diario y rewards por `reward_id`; el cliente no envia recompensas.
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

Ademas, los contratos TypeScript rechazan campos economicos no declarados en todos los payloads autoritativos. Esto evita que una futura UI o integracion empiece a enviar cantidades concretas aunque el servidor siga calculandolas desde catalogos.

## Criterios de Aceptacion

- Todas las operaciones sensibles tienen contrato documentado.
- Todas las operaciones tienen errores tipados.
- Todas las operaciones tienen idempotencia.
- Todas las operaciones devuelven snapshot autoritativo minimo.
- Ninguna operacion confia en rewards enviados por cliente.
- El modelo sigue permitiendo modo local/offline para desarrollo, pero produccion debe usar operaciones autoritativas para todo progreso real.
