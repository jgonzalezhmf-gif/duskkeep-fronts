# Propiedad del Estado Server-Authoritative

Este documento fija que datos puede poseer cada capa del juego. La regla base es: si afecta economia, progreso, inventario, compras, rewards, claims, upgrades o competicion, el servidor es la fuente de verdad.

## Fuente de Verdad

### Server-owned

Estos datos viven en Supabase/Postgres y llegan al cliente mediante `get_player_snapshot` o respuestas de operaciones autoritativas:

- Cuenta jugable: nombre, nivel, XP y fechas de perfil.
- Recursos: oro, polvo, gemas, tickets de arena y llaves de Adventure.
- Heroes: desbloqueo, nivel, estrellas, shards, XP y skill.
- Cartas Frontline: desbloqueo y nivel.
- Loadout activo: lider, squad y deck.
- Fortress visible: edificios, integridad, guarnicion, raids y cooldowns.
- Adventure: progreso de nodos, first-clear, claims, cofres de mapa, loot y cooldowns.
- Shop: compras, limites diarios, one-time y stock server-side.
- Misiones, login diario, eventos, arena y resultados de batalla.
- Ledger, operaciones idempotentes y futuras transacciones premium.

El cliente no debe persistir estos datos como autoridad cuando `NEXT_PUBLIC_PERSISTENCE=supabase`.

### Client-cache

El cliente puede mantener copias temporales para renderizar rapido, pero deben poder descartarse y rehidratarse desde servidor:

- Snapshot actual de jugador en Zustand.
- Previews calculadas desde catalogos publicos.
- Resultado visual de una accion hasta que llegue respuesta servidor.
- Estado de panels, seleccion actual, pending flags y feedback.

Si una accion sensible termina correctamente y puede tocar varios dominios, refrescar snapshot servidor.

### Client-only

Estos datos pueden seguir en `localStorage`:

- Idioma, volumen, mute, SFX, preferencias visuales y escala de texto.
- Intro vista, onboarding y estado UI no sensible.
- Configuracion QA local y overlays de editor.
- Cache descartable que no conceda ventajas ni progreso.

## Reglas de Implementacion

- El frontend envia ids o decisiones del jugador, no importes finales.
- El BFF `/api/server/authoritative` valida request, sesion, rate limit, seguridad y llama RPCs.
- Las RPCs validan ownership/RLS, prerequisitos, idempotencia y aplican cambios atomicos.
- Las respuestas servidor deben incluir recursos actualizados o indicar que hay que recargar snapshot.
- Para cuentas `linked` o invitado Supabase, no hacer fallback local si la operacion online falla.
- El modo local queda como fallback de desarrollo/offline, no como arquitectura de cuenta online.
- `npm run check:store-boundaries` bloquea regresiones donde `app/` o `components/` usen `useGameStore.setState` o seleccionen acciones sensibles locales con alternativa `OnlineFirst`.

## Checklist para Nuevas Funciones

Antes de implementar una feature que toque progreso:

1. Definir tabla/catalogo server-side si hay valores de balance.
2. Definir operacion BFF/RPC con payload minimo.
3. Validar que el cliente no envia `cost`, `reward`, `resources`, `loot`, `unlock` ni estado final.
4. Anadir ledger si cambia recursos.
5. Actualizar snapshot si cambia estado visible.
6. Cubrir caso positivo, duplicado/idempotente y rechazo por prerequisitos.
