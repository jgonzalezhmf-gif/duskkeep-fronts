# Integracion Supabase

El juego funciona **sin conexion** usando `localStorage` por defecto. Supabase es opcional y permanece desactivado en el alpha.

Antes de convertir Supabase en servidor autoritativo, leer:

- `docs/SECURITY_AND_BACKEND_ROADMAP.md`
- `docs/SUPABASE_REMOTE_OPERATIONS.md`
- `docs/BACKEND_DATA_MODEL.md`
- `docs/SERVER_AUTHORITATIVE_OPERATIONS.md`

El estado de cliente no es seguro para economia, compras, ladder ni claims de recompensas.

## Activacion

1. Copiar `.env.example` a `.env.local`.
2. Rellenar `NEXT_PUBLIC_SUPABASE_URL` y `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
3. Definir `NEXT_PUBLIC_PERSISTENCE=supabase`.
4. Para el flujo invitado respaldado por servidor, activar Anonymous Auth:

   ```toml
   # supabase/config.toml local, o dashboard Auth en remoto
   [auth]
   enable_anonymous_sign_ins = true
   ```

   `supabase/config.toml` es local y no se versiona. En remoto hay que activar esta opcion explicitamente en el proyecto Supabase antes de validar invitados reales.

5. Para el schema alpha legacy, aplicar:

   ```bash
   psql "$SUPABASE_DB_URL" -f supabase/schema.sql
   ```

6. Para empezar la linea de persistencia online segura, aplicar migraciones:

   ```bash
   supabase db push
   ```

7. Opcional: cargar datos seed con `supabase/seed.sql`. El seed actual es tolerante con el schema seguro y salta datos legacy si las tablas antiguas no existen.

La interfaz de persistencia (`lib/persistence.ts`) ya expone un skeleton `SupabaseBackend`. Sustituir sus metodos solo despues de definir estrategia de validacion server-side para acciones sensibles.

La ruta `/api/server/authoritative` es el primer proxy HTTP hacia RPCs autoritativas. Esta desactivada por defecto y solo responde si `SERVER_AUTHORITATIVE_API_ENABLED=true`. Requiere `Authorization: Bearer <supabase-user-jwt>` y no usa service role.

## Migraciones

- `supabase/schema.sql` conserva el schema alpha reproducible y no autoritativo.
- `supabase/migrations/20260510193000_secure_player_core.sql` crea el nucleo seguro de persistencia online: `profiles`, `player_resources`, `resource_ledger`, `player_heroes`, `player_frontline_cards` y `frontline_loadouts`.
- `supabase/migrations/20260510194500_adventure_shop_operations.sql` crea las tablas para progreso de Adventure, claims de mapa, compras, misiones, login diario, resultados de batalla e idempotencia.
- `supabase/migrations/20260511061000_open_adventure_map_interaction_rpc.sql` crea la primera RPC autoritativa para abrir el cofre de Adventure con llaves, loot server-side, ledger e idempotencia.
- `supabase/migrations/20260511063000_purchase_shop_offer_rpc.sql` crea la primera RPC autoritativa de Shop para comprar `adventure_key_ring` con limite diario, coste, reward, ledger e idempotencia.
- `supabase/migrations/20260511165000_fix_rpc_extension_search_path.sql` ajusta el `search_path` de las RPC para resolver funciones de `extensions` como `digest()`.
- `supabase/migrations/20260511172000_claim_adventure_battle_result_rpc.sql` crea la primera RPC autoritativa para resultados de batalla Adventure de Chapter 1.
- `supabase/migrations/20260511182000_claim_adventure_node_reward_rpc.sql` crea la primera RPC autoritativa para reclamar cofres de nodo no-combate de Chapter 1.
- `supabase/migrations/20260511204500_provision_auth_player_account.sql` provisiona `profiles` y `player_resources` al crear un usuario de Supabase Auth.
- `supabase/migrations/20260511215500_save_frontline_loadout_rpc.sql` crea la RPC autoritativa para persistir el loadout Frontline.
- `supabase/migrations/20260511223000_claim_daily_login_rpc.sql` crea la RPC autoritativa de recompensa diaria.
- `supabase/migrations/20260512082000_claim_mission_reward_rpc.sql` crea la RPC autoritativa para reclamar misiones ya completadas en `missions_progress`.
- `supabase/migrations/20260512100000_mission_progress_from_authoritative_events.sql` crea helpers/triggers para avanzar misiones desde eventos autoritativos (`adventure_progress` y `battle_results`) sin aceptar progreso arbitrario del cliente.
- `supabase/migrations/20260514170000_get_player_snapshot_rpc.sql` crea la RPC read-only `get_player_snapshot` para leer el estado normalizado del jugador autenticado o anonimo sin exponer operaciones internas.
- `supabase/migrations/20260514183000_provision_starter_player_state.sql` amplia el provisioning de Auth para crear recursos, heroes starter, cartas starter y loadout inicial de Frontline en servidor.
- `supabase/migrations/20260514193000_validate_frontline_loadout_ownership.sql` endurece `save_frontline_loadout` para aceptar solo lideres permitidos y heroes/cartas desbloqueados por el perfil.
- Las migraciones nuevas deben seguir `docs/BACKEND_DATA_MODEL.md` y `docs/SERVER_AUTHORITATIVE_OPERATIONS.md`.

## Smoke Tests Locales

Despues de `npx.cmd supabase start` o `npx.cmd supabase db reset`, validar las primeras RPC autoritativas con:

```bash
psql "postgresql://postgres:postgres@127.0.0.1:54322/postgres" -f supabase/smoke-tests/adventure_shop_rpcs.sql
```

El script crea un usuario local de prueba, valida `save_frontline_loadout`, `claim_daily_login`, `claim_mission_reward`, `claim_adventure_battle_result`, `claim_adventure_node_reward`, `purchase_shop_offer` y `open_adventure_map_interaction`; tambien comprueba idempotencia, rechaza loadouts con heroes/cartas no desbloqueados, confirma que Adventure genera progreso de misiones server-side y confirma que el cofre consume la llave.

Para validar que un invitado anonimo provisiona perfil y recursos base:

```bash
npm.cmd run smoke:supabase:guest
```

El script inserta un usuario anonimo local en `auth.users` y comprueba que el trigger crea `profiles`, `player_resources`, heroes starter, cartas starter y loadout inicial.

Para validar la lectura del snapshot server-side del jugador autenticado:

```bash
npm.cmd run smoke:supabase:snapshot
```

El script crea dos usuarios locales de prueba y comprueba que `get_player_snapshot` devuelve solo el perfil, recursos, loadout, cartas y progreso del usuario autenticado por `auth.uid()`.

Para validar el flujo invitado anonimo -> cuenta nueva:

```bash
npm.cmd run smoke:supabase:guest-upgrade
```

El script crea un invitado anonimo real con Supabase Auth, lee su snapshot server-side, actualiza ese mismo usuario con email/password y comprueba que conserva el mismo `user_id`, `profileId` y starter state. Usa solo `NEXT_PUBLIC_SUPABASE_URL` y `NEXT_PUBLIC_SUPABASE_ANON_KEY`.

## Chequeo Remoto

Antes de apuntar la app a una instancia remota, validar la configuracion publica y operativa:

```bash
npm.cmd run check:supabase:remote
```

El chequeo falla si la URL remota no usa HTTPS, si apunta a localhost, si falta la anon key, si la anon key parece service-role o si alguna variable `NEXT_PUBLIC_*` parece contener secretos. Ver `docs/SUPABASE_REMOTE_OPERATIONS.md` para los pasos completos de migracion, smokes y riesgos residuales.

Para validar el proxy HTTP con JWT real de Supabase Auth local:

1. Arrancar Supabase local:

   ```bash
   npx.cmd supabase start
   ```

2. Arrancar Next con el proxy habilitado en otra terminal:

   ```powershell
   $env:SERVER_AUTHORITATIVE_API_ENABLED="true"; npm.cmd run dev
   ```

3. Ejecutar el smoke HTTP:

   ```bash
   npm.cmd run smoke:authoritative-api
   ```

El smoke crea o reutiliza un usuario local de prueba mediante Supabase Auth, llama a `/api/server/authoritative` con `Authorization: Bearer <jwt>`, reclama `c1l1` y repite la misma llamada para comprobar idempotencia.

## Notas de Seguridad

- Usar ownership de usuario autenticado para todas las filas de jugador.
- Activar Row Level Security antes de guardar datos reales de cuenta.
- No exponer service-role keys al navegador.
- Mantener compras pagadas, moneda premium, claims de recompensas y actualizaciones de ladder detras de funciones de servidor o API routes.
- Anadir claves de idempotencia para compras y claims repetibles.
