# Roadmap de Seguridad y Servidor

Este documento define la direccion objetivo para persistencia online segura y futuras funcionalidades conectadas.

## Estado Actual

El alpha empezo priorizando funcionamiento offline, pero la direccion objetivo cambia a invitado respaldado por servidor:

- El modo invitado debe intentar crear una sesion anonima Supabase y un perfil de jugador en servidor.
- `localStorage` queda como fallback de alpha y para preferencias/cache no sensibles.
- El progreso real online debe vivir en servidor tanto para invitado como para cuenta vinculada.
- El juego sigue siendo jugable sin conexion mientras el backend no este disponible, pero ese modo no es fuente de verdad para economia online.

Esto evita depender de importar progreso manipulable desde `localStorage` cuando el jugador decide crear una cuenta.

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

### Fase 2: MVP de persistencia invitada/autenticada

- Anadir sesion invitada anonima con Supabase Auth.
- Crear/provisionar perfil servidor para usuarios anonimos y registrados.
- Vincular la sesion invitada a cuenta nueva mediante actualizacion del usuario anonimo, no mediante merge con cuenta existente.
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

## Invitado Respaldado por Servidor

El flujo objetivo no debe ser `localStorage -> subir progreso -> cuenta`, sino `perfil invitado servidor -> vincular cuenta`.

1. En la pantalla inicial, el usuario puede iniciar sesion con una cuenta existente, crear una cuenta nueva o jugar como invitado.
2. Al elegir invitado, el cliente intenta `signInAnonymously` con Supabase.
3. El usuario anonimo recibe un `auth.users.id`; las tablas de jugador usan el mismo ownership/RLS que una cuenta normal.
4. Si Supabase no esta configurado o anonymous auth falla, se conserva fallback local solo para alpha/offline.
5. Si el invitado quiere guardar el progreso, desde opciones solo puede crear una cuenta nueva sobre esa sesion anonima.
6. El flujo invitado -> cuenta no debe ofrecer login con una cuenta existente ni fusionar progreso invitado con una cuenta preexistente.
7. La conversion usa actualizacion del usuario anonimo con email/password para conservar el mismo `user_id` y sus filas de progreso.
8. El snapshot local queda como mecanismo de transicion/desarrollo, con allowlists y limites estrictos, no como arquitectura final.
9. Los mensajes de login, registro y recuperacion deben ser genericos: no confirmar si una cuenta existe, no existe o esta en otro estado.

Requisitos operativos:

- En Supabase local, `supabase/config.toml` debe tener `auth.enable_anonymous_sign_ins = true`.
- En Supabase remoto, Anonymous Sign-Ins debe activarse explicitamente antes de validar el flujo invitado real.
- El smoke `npm.cmd run smoke:supabase:guest` comprueba que un usuario anonimo provisiona `profiles`, `player_resources`, heroes starter, cartas starter y loadout inicial.
- El smoke `npm.cmd run smoke:supabase:snapshot` comprueba que el snapshot server-side solo devuelve datos del usuario autenticado.
- En produccion conviene activar captcha o mitigaciones equivalentes para altas anonimas si aumenta el abuso.

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
