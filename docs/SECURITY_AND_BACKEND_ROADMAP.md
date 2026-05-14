# Roadmap de Seguridad y Servidor

Este documento define la direccion objetivo para persistencia online segura y futuras funcionalidades conectadas.

## Estado Actual

El alpha prioriza funcionamiento offline:

- El estado del jugador se guarda en `localStorage` mediante Zustand persist.
- El schema y SDK de Supabase existen, pero no son autoritativos.
- El juego sigue siendo jugable sin conexion.

Esto es aceptable para iteracion alpha, pero no es seguro para economia online, ladder o funcionalidades monetizadas.

## Principio de Seguridad

El navegador no es autoritativo.

Cualquier version online futura debe tratar el estado de cliente como una accion solicitada o una vista cacheada, no como verdad confiable.

## Responsabilidades del Servidor

El servidor debe validar y persistir:

- Perfil de cuenta e identidad.
- Balances de recursos.
- Progreso de Adventure.
- Claims y loot rolls de key chests.
- Compras de Shop.
- Transacciones de moneda premium.
- Resultados de batalla.
- Subidas a ladder de Arena.
- Estado de resets diarios/semanales.

El cliente puede renderizar previews y feedback local, pero el servidor decide si las acciones sensibles son validas.

## Arquitectura Recomendada

### Fase 1: Diseno de servidor y endurecimiento de schema

- Actualizar schema Supabase para cubrir el estado local actual.
- Anadir ownership de usuario a registros de jugador.
- Anadir politicas Row Level Security (RLS).
- Definir operaciones de servidor para acciones sensibles de economia.
- Mantener fallback `localStorage` para desarrollo.

### Fase 2: MVP de persistencia autenticada

- Anadir login/auth.
- Migrar snapshot local del jugador a una cuenta autenticada.
- Guardar perfil/progreso no sensible online.
- Mantener ejecucion de combate en cliente, pero persistir resultados en servidor tras validacion.

### Fase 3: Economia autoritativa

- Mover claims de recompensas, compras de Shop, aperturas de key chest y compras premium a funciones de servidor.
- Anadir claves de idempotencia para compras y claims.
- Anadir tablas de auditoria para recursos y transacciones pagadas.
- Prevenir claims duplicados con constraints de base de datos.

### Fase 4: Sistemas competitivos y monetizados

- Validar resultados de Arena antes de actualizar ladder.
- Guardar seeds deterministas y resumenes de batalla.
- Anadir checks anti-tamper para cambios imposibles de recursos/progreso.
- Integrar webhooks de proveedor de pagos solo en servidor.

## Modelo de Datos Objetivo

Ver `docs/BACKEND_DATA_MODEL.md` para el diseno detallado. Tablas minimas futuras:

- `profiles`
- `player_resources`
- `player_heroes`
- `player_cards`
- `frontline_loadouts`
- `adventure_progress`
- `adventure_map_claims`
- `shop_purchases`
- `battle_results`
- `arena_ladder_snapshots`
- `resource_ledger`

## Operaciones Sensibles

Ver `docs/SERVER_AUTHORITATIVE_OPERATIONS.md` para contratos de request/response, idempotencia y errores. Deben convertirse en operaciones de servidor/API:

- Conceder recompensas.
- Gastar recursos.
- Comprar oferta de Shop.
- Abrir key chest.
- Reclamar mission.
- Reclamar login diario.
- Registrar victoria de batalla.
- Enviar resultado de Arena.

Cada operacion debe:

- Autenticar al usuario.
- Comprobar ownership.
- Validar requisitos.
- Aplicar cambios de forma atomica.
- Devolver el snapshot autoritativo actualizado.

## Guia Supabase

Supabase puede usarse para:

- Auth.
- Persistencia Postgres.
- Row Level Security (RLS).
- Edge Functions o RPC para acciones validadas.

No exponer service-role keys en cliente. Usar anon keys solo con RLS, y enrutar mutaciones sensibles mediante codigo de servidor.

## Migracion desde LocalStorage

La migracion debe ser explicita y no debe filtrar informacion de cuentas:

1. En la pantalla inicial, el usuario puede iniciar sesion con una cuenta existente o crear una cuenta nueva.
2. Si el usuario entra como invitado, desde opciones solo puede crear una cuenta nueva para guardar ese progreso local.
3. El flujo invitado -> cuenta no debe ofrecer inicio de sesion con una cuenta existente ni fusionar progreso invitado con una cuenta preexistente.
4. El cliente lee el snapshot local solo despues de autenticarse con la nueva cuenta creada para esa partida invitada.
5. El servidor valida shape y rangos permitidos antes de persistir el snapshot.
6. El cliente cambia a persistencia online cuando la sincronizacion se confirma o deja la accion como reintentable si falla.
7. Los mensajes de login, registro y recuperacion deben ser genericos: no confirmar si una cuenta existe, no existe o esta en otro estado.

## Riesgos a Evitar

- Conceder moneda premium directamente desde cliente.
- Dejar que el cliente decida exito de compras pagadas.
- Enviar puntuaciones arbitrarias de ladder desde cliente.
- Omitir filtros de ownership en filas de jugador.
- Permitir replay del mismo claim varias veces.
- Guardar secretos en `.env.local` y commitearlos.

## Gestion de Dependencias y Auditoria

- Usar `npm.cmd run audit:high` como gate operativo para vulnerabilidades altas o criticas.
- En Windows, si npm falla con `unable to verify the first certificate`, ejecutar la terminal con `NODE_OPTIONS=--use-system-ca` o persistirlo a nivel de usuario si el certificado raiz del sistema es confiable.
- No ejecutar `npm audit fix --force` sin revisar el plan, porque puede aplicar downgrades o cambios incompatibles.
- La vulnerabilidad moderada conocida en `next`/`postcss` debe revisarse cuando exista una version estable compatible que la corrija.
- Mantener `package.json` con `"private": true` y no introducir dependencias nuevas para seguridad, pagos o backend sin revisar superficie de ataque y mantenimiento.

## Limite de Lanzamiento

Para el alpha presentable actual:

- Offline-first es aceptable.
- El servidor online puede quedar documentado y disenado.
- Monetizacion y ladder no deben presentarse como seguros hasta que exista validacion de servidor.
