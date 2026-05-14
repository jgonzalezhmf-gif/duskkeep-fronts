# Modelo de Datos de Servidor Objetivo

Este documento define el modelo de datos objetivo para mover Duskkeep Fronts desde persistencia local a persistencia online segura. No sustituye una migracion SQL final; es la referencia previa para disenar schema, RLS, validaciones y contratos de servidor.

## Principios

- El servidor es la fuente de verdad para cuenta, recursos, progreso, compras, claims y resultados competitivos.
- El cliente puede mantener cache local y feedback visual, pero no decide balances ni recompensas definitivas.
- Toda tabla de jugador debe tener ownership por usuario autenticado.
- Las operaciones sensibles deben ser atomicas e idempotentes.
- Los datos seed del alpha pueden seguir viviendo en codigo, pero los estados del jugador deben persistirse online.

## Entidades Principales

### `profiles`

Representa el perfil jugable asociado a un usuario Supabase. Ese usuario puede ser anonimo/invitado o una cuenta vinculada.

Campos objetivo:

- `id uuid primary key`
- `user_id uuid unique not null references auth.users(id)`
- `display_name text not null`
- `account_level int not null`
- `account_xp int not null`
- `created_at timestamptz not null`
- `updated_at timestamptz not null`

Reglas:

- `user_id` referencia la identidad autenticada.
- El modo invitado debe usar un usuario anonimo Supabase, no progreso sensible guardado solo en `localStorage`.
- Convertir invitado a cuenta debe conservar el mismo `user_id` siempre que Supabase permita actualizar el usuario anonimo con email/password.
- RLS: cada usuario solo puede leer su perfil.
- Las mutaciones de level/xp deben pasar por operaciones de servidor.

### `player_resources`

Balance actual de recursos.

Campos objetivo:

- `profile_id uuid primary key`
- `gold int not null`
- `dust int not null`
- `gems int not null`
- `arena_tickets int not null`
- `adventure_keys int not null`
- `updated_at timestamptz not null`

Reglas:

- Ningun balance puede ser negativo.
- `gems` y futuros recursos premium nunca deben concederse por confianza en cliente.
- Cualquier cambio debe crear una entrada en `resource_ledger`.

### `resource_ledger`

Auditoria de cambios de recursos.

Campos objetivo:

- `id uuid primary key`
- `profile_id uuid not null`
- `operation_id uuid not null`
- `source text not null`
- `resource text not null`
- `delta int not null`
- `balance_after int not null`
- `metadata jsonb`
- `created_at timestamptz not null`

Reglas:

- Toda operacion sensible genera entradas de ledger.
- `operation_id` permite agrupar cambios de una misma accion.
- Debe permitir diagnosticar duplicados, exploits y errores de economia.

### `server_operations`

Registro de idempotencia para operaciones sensibles.

Campos objetivo:

- `id uuid primary key`
- `profile_id uuid not null`
- `idempotency_key text not null`
- `operation_type text not null`
- `payload_hash text not null`
- `status text not null`
- `result jsonb`
- `error_code text`
- `created_at timestamptz not null`
- `completed_at timestamptz`

Reglas:

- `(profile_id, idempotency_key)` debe ser unico.
- Repetir la misma operacion debe devolver el resultado almacenado.
- Reusar una key con payload diferente debe rechazarse como conflicto.

### `player_heroes`

Estado de heroes del jugador.

Campos objetivo:

- `profile_id uuid not null`
- `hero_id text not null`
- `level int not null`
- `stars int not null`
- `shards int not null`
- `xp int not null`
- `skill_level int not null`
- `unlocked boolean not null`
- `updated_at timestamptz not null`
- primary key `(profile_id, hero_id)`

Reglas:

- Stats base siguen viniendo de data/feature code.
- El servidor valida costes de level up, star up y skill up.

### `player_frontline_cards`

Estado de cartas Frontline.

Campos objetivo:

- `profile_id uuid not null`
- `card_id text not null`
- `unlocked boolean not null`
- `level int not null`
- `updated_at timestamptz not null`
- primary key `(profile_id, card_id)`

Reglas:

- Las cartas starter se inicializan desbloqueadas.
- Nuevos unlocks entran por recompensas validadas.
- El servidor valida costes y limites de mejora.

### `frontline_loadouts`

Loadout activo de combate.

Campos objetivo:

- `profile_id uuid primary key`
- `leader_id text not null`
- `squad jsonb not null`
- `deck jsonb not null`
- `updated_at timestamptz not null`

Reglas:

- `squad` contiene slots ordenados de heroes.
- `deck` contiene slots ordenados de cartas.
- El servidor debe validar que heroes/cartas estan desbloqueados antes de guardar.

### `adventure_progress`

Progreso por nodo de Adventure.

Campos objetivo:

- `profile_id uuid not null`
- `chapter_id text not null`
- `node_id text not null`
- `status text not null`
- `cleared boolean not null`
- `first_clear_taken boolean not null`
- `claimed boolean not null`
- `cleared_at timestamptz`
- `updated_at timestamptz not null`
- primary key `(profile_id, node_id)`

Estados recomendados:

- `locked`
- `available`
- `current`
- `cleared`
- `claimed`

Reglas:

- El servidor calcula si un nodo esta disponible segun requisitos y desbloqueos.
- Replay no debe conceder recompensas de first-clear.
- Chapter 2 permanece bloqueado hasta tener contenido valido.

### `adventure_map_claims`

Claims de interactuables del mapa, como key chests.

Campos objetivo:

- `profile_id uuid not null`
- `interaction_id text not null`
- `claimed boolean not null`
- `claimed_at timestamptz`
- `reset_available_at timestamptz`
- `loot_id text`
- `loot_tier text`
- `loot_title text`
- `rewards jsonb`
- primary key `(profile_id, interaction_id)`

Reglas:

- Los cofres con reset se vuelven reclamables cuando `reset_available_at <= now()`.
- La apertura consume llave y concede loot en una transaccion atomica.
- El loot roll debe ejecutarse en servidor para evitar manipulacion.

### `shop_purchases`

Historial y limites de compras.

Campos objetivo:

- `id uuid primary key`
- `profile_id uuid not null`
- `offer_id text not null`
- `purchase_day text`
- `quantity int not null`
- `cost jsonb not null`
- `contents jsonb not null`
- `idempotency_key text`
- `created_at timestamptz not null`

Reglas:

- `dailyLimit` se valida con `profile_id + offer_id + purchase_day`.
- Ofertas `oneTime` no pueden repetirse.
- Las compras premium requieren confirmacion server-side del proveedor de pagos.

### `missions_progress`

Progreso de misiones.

Campos objetivo:

- `profile_id uuid not null`
- `mission_id text not null`
- `cycle_key text not null`
- `progress int not null`
- `claimed boolean not null`
- `claimed_at timestamptz`
- primary key `(profile_id, mission_id, cycle_key)`

Reglas:

- Los resets diarios/semanales se calculan con cycle keys.
- Reclamar una mission debe ser idempotente.

### `daily_login_claims`

Claims de recompensa diaria.

Campos objetivo:

- `profile_id uuid not null`
- `day_key text not null`
- `streak int not null`
- `rewards jsonb not null`
- `claimed_at timestamptz not null`
- primary key `(profile_id, day_key)`

Reglas:

- El servidor calcula el dia/ciclo valido.
- Una recompensa diaria no puede reclamarse dos veces.
- El streak no debe depender de fechas confiadas por el cliente.

### `battle_results`

Registro de resultados de combate.

Campos objetivo:

- `id uuid primary key`
- `profile_id uuid not null`
- `source text not null`
- `node_id text`
- `event_id text`
- `arena_opponent_id text`
- `preset_id text`
- `seed bigint not null`
- `winner text not null`
- `turns int not null`
- `summary jsonb not null`
- `rewards jsonb`
- `created_at timestamptz not null`

Reglas:

- En alpha el combate puede ejecutarse en cliente, pero el servidor debe validar prerequisitos antes de persistir rewards.
- Para ladder futura, guardar seed y resumen permite auditoria y replay determinista.

### `arena_ladder_snapshots`

Estado competitivo futuro.

Campos objetivo:

- `profile_id uuid primary key`
- `rating int not null`
- `rank_tier text not null`
- `wins int not null`
- `losses int not null`
- `streak int not null`
- `updated_at timestamptz not null`

Reglas:

- Solo operaciones validadas de Arena pueden modificar rating.
- No aceptar puntuaciones arbitrarias desde cliente.

## Datos que Pueden Seguir en Codigo

Durante el alpha y el primer backend MVP pueden seguir como seed/code:

- Definiciones base de heroes.
- Definiciones base de cartas.
- Presets de enemigos.
- Layout visual del mapa Adventure.
- Definiciones de Shop, Missions, Events y Fortress.

Estos datos deben tener ids estables para poder referenciarlos desde tablas de jugador.

## Migracion desde Estado Local

La migracion desde estado local queda como mecanismo transitorio de alpha. El modelo objetivo es que incluso el invitado tenga perfil de servidor desde el inicio. Mientras exista importacion local, debe mapear solo campos permitidos y con limites conservadores:

- `account` -> `profiles`
- `resources` -> `player_resources` + `resource_ledger` inicial
- `heroes` -> `player_heroes`
- `frontlineCardUnlocks` y `frontlineCardLevels` -> `player_frontline_cards`
- `frontlineLoadout` -> `frontline_loadouts`
- `adventureProgress` -> `adventure_progress`
- `adventureMapClaims` -> `adventure_map_claims`
- `missionsProgress` -> `missions_progress`
- `shopPurchases` y `dailyShopPurchases` -> `shop_purchases`
- `arenaWins`/`arenaLosses` -> `arena_ladder_snapshots` inicial o estadistica local importada

## Criterios de Aceptacion del Modelo

- Todas las filas sensibles tienen `profile_id` o `user_id`.
- Todas las mutaciones economicas producen ledger.
- No hay balance negativo posible.
- Claims repetidos se bloquean por constraints o idempotencia.
- El cliente no puede escribir directamente recursos, compras, rewards ni ladder.
- El schema permite mantener fallback local durante desarrollo.
