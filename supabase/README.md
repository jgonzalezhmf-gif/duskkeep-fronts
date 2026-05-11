# Integracion Supabase

El juego funciona **sin conexion** usando `localStorage` por defecto. Supabase es opcional y permanece desactivado en el alpha.

Antes de convertir Supabase en servidor autoritativo, leer:

- `docs/SECURITY_AND_BACKEND_ROADMAP.md`
- `docs/BACKEND_DATA_MODEL.md`
- `docs/SERVER_AUTHORITATIVE_OPERATIONS.md`

El estado de cliente no es seguro para economia, compras, ladder ni claims de recompensas.

## Activacion

1. Copiar `.env.example` a `.env.local`.
2. Rellenar `NEXT_PUBLIC_SUPABASE_URL` y `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
3. Definir `NEXT_PUBLIC_PERSISTENCE=supabase`.
4. Para el schema alpha legacy, aplicar:

   ```bash
   psql "$SUPABASE_DB_URL" -f supabase/schema.sql
   ```

5. Para empezar la linea de persistencia online segura, aplicar migraciones:

   ```bash
   supabase db push
   ```

6. Opcional: cargar datos seed con `supabase/seed.sql`. El seed actual es tolerante con el schema seguro y salta datos legacy si las tablas antiguas no existen.

La interfaz de persistencia (`lib/persistence.ts`) ya expone un skeleton `SupabaseBackend`. Sustituir sus metodos solo despues de definir estrategia de validacion server-side para acciones sensibles.

## Migraciones

- `supabase/schema.sql` conserva el schema alpha reproducible y no autoritativo.
- `supabase/migrations/20260510193000_secure_player_core.sql` crea el nucleo seguro de persistencia online: `profiles`, `player_resources`, `resource_ledger`, `player_heroes`, `player_frontline_cards` y `frontline_loadouts`.
- `supabase/migrations/20260510194500_adventure_shop_operations.sql` crea las tablas para progreso de Adventure, claims de mapa, compras, misiones, login diario, resultados de batalla e idempotencia.
- `supabase/migrations/20260511061000_open_adventure_map_interaction_rpc.sql` crea la primera RPC autoritativa para abrir el cofre de Adventure con llaves, loot server-side, ledger e idempotencia.
- `supabase/migrations/20260511063000_purchase_shop_offer_rpc.sql` crea la primera RPC autoritativa de Shop para comprar `adventure_key_ring` con limite diario, coste, reward, ledger e idempotencia.
- `supabase/migrations/20260511165000_fix_rpc_extension_search_path.sql` ajusta el `search_path` de las RPC para resolver funciones de `extensions` como `digest()`.
- `supabase/migrations/20260511172000_claim_adventure_battle_result_rpc.sql` crea la primera RPC autoritativa para resultados de batalla Adventure de Chapter 1.
- `supabase/migrations/20260511182000_claim_adventure_node_reward_rpc.sql` crea la primera RPC autoritativa para reclamar cofres de nodo no-combate de Chapter 1.
- Las migraciones nuevas deben seguir `docs/BACKEND_DATA_MODEL.md` y `docs/SERVER_AUTHORITATIVE_OPERATIONS.md`.

## Smoke Tests Locales

Despues de `npx.cmd supabase start` o `npx.cmd supabase db reset`, validar las primeras RPC autoritativas con:

```bash
psql "postgresql://postgres:postgres@127.0.0.1:54322/postgres" -f supabase/smoke-tests/adventure_shop_rpcs.sql
```

El script crea un usuario local de prueba, valida `claim_adventure_battle_result`, valida `claim_adventure_node_reward`, valida `purchase_shop_offer`, valida `open_adventure_map_interaction`, comprueba idempotencia y confirma que el cofre consume la llave.

## Notas de Seguridad

- Usar ownership de usuario autenticado para todas las filas de jugador.
- Activar Row Level Security antes de guardar datos reales de cuenta.
- No exponer service-role keys al navegador.
- Mantener compras pagadas, moneda premium, claims de recompensas y actualizaciones de ladder detras de funciones de servidor o API routes.
- Anadir claves de idempotencia para compras y claims repetibles.
