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

## Estado de Cierre del Bloque Server-Authoritative

El bloque actual ya cubre la base necesaria para que economia, progreso y rewards principales no dependan de cantidades enviadas por el cliente. Las operaciones conectadas a servidor usan contratos estrictos, idempotencia, RLS/ownership y catalogos internos para precios/recompensas.

Cobertura cerrada para el MVP:

- Shop, daily login, missions, Adventure rewards, Adventure battle rewards, key chests, Arena, Events, Fortress visible, progresion de heroes y progresion de cartas ya tienen operaciones server-authoritative documentadas.
- Los payloads sensibles del cliente aceptan ids/acciones, no `cost`, `rewards`, `resources`, `rewardId` ni balances finales.
- Los importes variables viven en catalogos SQL o funciones server-side documentadas, no en JSX ni en servicios de UI.
- El modo invitado respaldado por servidor es la direccion objetivo; `localStorage` queda como fallback alpha/cache, no como fuente de verdad para economia online.

No conviene seguir micro-refactorizando este bloque salvo que aparezca un bug real. A partir de aqui, los cambios de balance deberian hacerse modificando catalogos/seed server-side y actualizando smoke tests de comportamiento, no reescribiendo cada servicio.

## Gates Antes de Monetizacion o Ranking Real

Estos puntos son obligatorios antes de considerar segura una version con pagos, premium currency real o ladder competitivo:

1. Validacion server-side de combate competitivo.
   - Arena/ladder no debe aceptar `winner` como verdad definitiva.
   - Opcion minima: validar seed, log/resumen y reglas deterministas.
   - Opcion robusta: ejecutar o reproducir la simulacion en servidor.
   - Estado MVP actual: ya existe una capa defensiva que valida coherencia `winner`/core HP/turnos antes de persistir `battle_results`, y los clientes Frontline generan un summary canonico versionado con seed/lane/events/actionLog. Tambien existe un replay determinista puro en dominio y un gate opcional de proxy (`SERVER_FRONTLINE_REPLAY_VALIDATION=true`) que resuelve loadout/progresion por RLS y preset por catalogo antes de llamar a RPC. Permanece desactivado por defecto hasta cerrar sincronizacion completa de progresion server-side.

2. Rate limit distribuido.
   - El rate limit actual en memoria sirve para MVP local/una instancia.
   - Existe tambien un limite por operacion sensible en `/api/server/authoritative`, pero sigue siendo por proceso.
   - La ruta ya depende de un adaptador `AuthoritativeRateLimiter`, de forma que el siguiente paso puede sustituir `memory` por almacenamiento compartido o servicio dedicado sin reescribir contratos.
   - En despliegue distribuido debe moverse a un backend compartido real antes de activar trafico publico sensible.

3. Observabilidad y auditoria operativa.
   - Alertar sobre idempotency conflicts, claims repetidos, compras rechazadas, loot rolls anomalos y syncs invitado recortados.
   - Mantener logs sin tokens, JWTs, auth headers, datos de pago completos ni secretos.
   - Estado MVP actual: el proxy autoritativo emite eventos estructurados sanitizados para rechazos/fallos de request, rate limit, validacion, replay y RPC. El sink es configurable por entorno (`console`, `disabled`, `webhook`) y el webhook exige HTTPS en produccion. Faltan alertas/retencion reales del proveedor que se elija.

4. Webhooks de pago backend-only.
   - La concesion de premium currency debe depender exclusivamente de confirmacion firmada del proveedor en servidor.
   - El cliente nunca debe poder confirmar una compra por si mismo.

5. Catalogo de provisioning si se balancea con frecuencia.
   - Los recursos iniciales pueden seguir como seed por ahora.
   - Si se van a ajustar como parte del balance vivo, moverlos a `server_starter_profile` o equivalente.

6. Politica de migracion de invitado final.
   - La importacion de snapshot local es puente alpha.
   - El flujo final debe crear progreso en servidor desde el inicio y convertir invitado a cuenta nueva conservando `user_id`.

## Backlog Tecnico Priorizado

Orden recomendado para los siguientes bloques:

1. Combat server validation para Arena/ladder.
2. Rate limiting compartido y hardening operativo del proxy autoritativo.
3. Observabilidad de economia y operaciones sensibles.
4. Catalogos de provisioning y configuracion viva si el balance empieza a cambiar con frecuencia.
5. Preparacion de pagos: modelo de transacciones, webhooks, ledger premium y entorno de pruebas.

Este backlog debe tratarse por bloques cerrables, no por oferta o recompensa individual. La regla practica es: si un valor puede cambiar por balance, debe estar en catalogo; si una accion puede conceder o gastar recursos, debe pasar por RPC/operacion autoritativa.

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
8. Tras convertir la sesion invitada, la UI ejecuta `syncLocalSnapshotOnlineFirst` como puente alpha para guardar progreso local validado antes de refrescar desde servidor.
9. El snapshot local queda como mecanismo de transicion/desarrollo, con allowlists y limites estrictos, no como arquitectura final.
10. Los mensajes de login, registro y recuperacion deben ser genericos: no confirmar si una cuenta existe, no existe o esta en otro estado.

Requisitos operativos:

- En Supabase local, `supabase/config.toml` debe tener `auth.enable_anonymous_sign_ins = true`.
- En Supabase remoto, Anonymous Sign-Ins debe activarse explicitamente antes de validar el flujo invitado real.
- El smoke `npm.cmd run smoke:supabase:guest` comprueba que un usuario anonimo provisiona `profiles`, `player_resources`, heroes starter, cartas starter y loadout inicial.
- El smoke `npm.cmd run smoke:supabase:snapshot` comprueba que el snapshot server-side solo devuelve datos del usuario autenticado.
- El smoke `npm.cmd run smoke:supabase:guest-upgrade` comprueba que un invitado anonimo convertido a cuenta nueva conserva `user_id`, `profileId`, starter state y puede sincronizar el snapshot local validado tras la conversion.
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

## Cabeceras HTTP de Seguridad

La aplicacion configura cabeceras globales desde `next.config.mjs` mediante `features/server/securityHeaders.mjs`.

Cobertura actual:

- `Content-Security-Policy` con `default-src 'self'`, bloqueo de `object-src`, `base-uri` y `frame-ancestors`.
- `connect-src` permite el propio origen, el origen Supabase configurado y su canal `wss`; en desarrollo permite localhost/ws para tooling.
- `script-src` no permite `unsafe-eval` en produccion. En desarrollo se permite solo para compatibilidad con herramientas de Next.
- `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin` y `Permissions-Policy` restrictiva.

Riesgo residual aceptado para el alpha:

- `unsafe-inline` permanece en `script-src` y `style-src` por compatibilidad con el runtime/hidratacion de Next y estilos actuales. Antes de endurecer monetizacion o despliegue publico amplio, conviene evaluar CSP con nonces/hashes y reducir inline scripts/styles sin romper el cliente.
- No se activa todavia `Cross-Origin-Opener-Policy` porque puede afectar flujos de autenticacion/OAuth; debe validarse junto al login final.

## Limite de Lanzamiento

Para el alpha presentable actual:

- Offline-first es aceptable.
- El servidor online puede quedar documentado y disenado.
- Monetizacion y ladder no deben presentarse como seguros hasta que exista validacion de servidor.
