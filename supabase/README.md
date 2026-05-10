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
4. Aplicar schema:

   ```bash
   psql "$SUPABASE_DB_URL" -f supabase/schema.sql
   ```

5. Opcional: cargar datos seed con `supabase/seed.sql`.

La interfaz de persistencia (`lib/persistence.ts`) ya expone un skeleton `SupabaseBackend`. Sustituir sus metodos solo despues de definir estrategia de validacion server-side para acciones sensibles.

## Notas de Seguridad

- Usar ownership de usuario autenticado para todas las filas de jugador.
- Activar Row Level Security antes de guardar datos reales de cuenta.
- No exponer service-role keys al navegador.
- Mantener compras pagadas, moneda premium, claims de recompensas y actualizaciones de ladder detras de funciones de servidor o API routes.
- Anadir claves de idempotencia para compras y claims repetibles.
