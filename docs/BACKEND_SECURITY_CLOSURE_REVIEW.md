# Revision de Cierre: Seguridad y Backend

Fecha: 2026-05-15

Este documento cierra el bloque actual de endurecimiento de backend, autenticacion y operaciones autoritativas. Su objetivo es evitar seguir anadiendo micro-guards sin un problema concreto y dejar claro que esta cubierto, que queda pendiente y que debe revisarse antes de monetizacion, pagos o ranking competitivo.

## Estado del Bloque

El bloque queda en estado solido para el alpha presentable.

No significa que el juego este listo para monetizacion real o ladder publico. Significa que la base tecnica ya evita los riesgos mas importantes del modelo anterior: economia decidida por cliente, claims duplicables sin control, payloads con cantidades sensibles y endpoints sensibles sin guards basicos.

## Alcance Cerrado

### Operaciones autoritativas

Las acciones sensibles principales ya pasan por contratos server-authoritative cuando existe sesion/API conectada:

- Compras de Shop.
- Daily login.
- Missions.
- Rewards no-combate de Adventure.
- Resultados de combate Adventure.
- Cofres interactuables de Adventure.
- Arena y Events.
- Fortress visible.
- Progresion de heroes.
- Progresion de cartas Frontline.
- Guardado de loadout.
- Sincronizacion controlada de snapshot invitado.

Los contratos aceptan ids o acciones solicitadas, no cantidades finales decididas por el cliente.

### Datos data-driven

Los valores variables de balance se resuelven desde catalogos o funciones server-side:

- Precios.
- Rewards.
- Loot tables.
- Cooldowns.
- Limites diarios.
- Costes de upgrades.
- Requisitos de nodos/interacciones.

Esto permite cambiar balance sin reescribir servicios uno a uno, siempre que el nuevo contenido se registre en catalogos y se cubra con smoke tests.

### Seguridad de proxy y rutas

El proxy autoritativo y rutas dev-only tienen defensas MVP:

- API autoritativa oculta tras flag.
- `Authorization: Bearer` obligatorio y validado defensivamente.
- Rechazo de requests browser `cross-site` mediante Fetch Metadata.
- Validacion estricta de payloads.
- Idempotencia en operaciones sensibles.
- Rate limit por adaptador, con backend actual en memoria.
- `X-Request-Id` por request.
- Eventos de seguridad sanitizados.
- Respuestas con headers no-cache para operaciones sensibles.
- Rutas `/api/dev/*` bloqueadas en produccion, con Content-Type JSON y limite de body.
- Guard contra secretos expuestos accidentalmente en `NEXT_PUBLIC_*`.

### Supabase y RLS

El modelo actual usa Supabase Auth, ownership por usuario y RPCs con validacion server-side. Las migraciones y smokes cubren:

- Provisioning de invitado.
- Snapshot server-side.
- Conversion de invitado anonimo a cuenta nueva.
- Operaciones Adventure/Shop.
- Operaciones autoritativas HTTP.

## Riesgos Mitigados

Este bloque reduce especialmente estos riesgos:

- Manipulacion de rewards o recursos desde cliente.
- Repeticion de claims con la misma accion.
- Compra con coste/reward enviado por cliente.
- Loot roll decidido en navegador.
- Uso accidental de endpoints dev-only desde produccion.
- Exposicion accidental de secretos en variables publicas.
- Requests cross-site contra rutas sensibles de navegador.
- Logs con tokens, headers completos o payloads sensibles.

## Riesgos Residuales Aceptados Para Alpha

Estos puntos no bloquean el alpha, pero no deben ignorarse antes de produccion real:

- El rate limit actual es en memoria. En despliegue multi-instancia debe moverse a almacenamiento compartido o servicio gestionado.
- La observabilidad emite eventos sanitizados, pero falta proveedor real con alertas, retencion y panel operativo.
- La validacion replay server-side de combate existe como gate opcional, pero no esta activada por defecto hasta cerrar sincronizacion completa de progresion server-side.
- `localStorage` sigue existiendo como fallback alpha/cache. No debe considerarse fuente de verdad de economia online.
- La CSP aun conserva tolerancias por compatibilidad con el runtime actual. Antes de despliegue publico amplio conviene revisar nonces/hashes y reducir inline cuando sea viable.
- Los webhooks de pago todavia no existen. Cualquier monetizacion real debe conceder moneda premium solo desde backend tras confirmacion firmada del proveedor.
- La politica final de retencion/expiracion de sesiones y conversion de invitado debe validarse end-to-end con el flujo de login final.
- Queda una vulnerabilidad moderada conocida en la cadena `next`/`postcss`; no se fuerza fix porque el plan de `npm audit fix --force` puede aplicar cambios incompatibles.

## No Seguir Iterando Ahora

No conviene seguir haciendo pasadas pequenas sobre este bloque salvo que aparezca una evidencia concreta:

- Error de seguridad reproducible.
- Test o smoke fallando.
- Nueva operacion sensible sin contrato autoritativo.
- Cambio de alcance: pagos, ladder publico, backend distribuido o despliegue real.

Si ninguna de esas condiciones aparece, el siguiente trabajo debe pasar a otro bloque de producto o cerrar una validacion end-to-end especifica.

## Gates Antes de Monetizacion o Ranking

Antes de activar pagos, premium currency real o ladder competitivo:

- Sustituir rate limit en memoria por rate limit distribuido.
- Activar observabilidad real con alertas para compras, claims, loot rolls, idempotency conflicts y errores RPC.
- Activar o completar validacion server-side de resultados competitivos.
- Implementar webhooks de pago backend-only.
- Revisar CSP final y cabeceras con el proveedor de auth/OAuth definitivo.
- Revisar gestion de sesiones, expiracion por inactividad y recuperacion de cuenta.
- Ejecutar auditoria de secretos, variables de entorno y permisos Supabase remotos.

## Validacion Operativa Recomendada

Para cerrar una release de este bloque:

```powershell
npm.cmd run check
npm.cmd test
npm.cmd run build
$env:NODE_OPTIONS="--use-system-ca"; npm.cmd run audit:high
```

Con Supabase local arrancado:

```powershell
npx.cmd supabase db reset
npm.cmd run smoke:supabase:guest
npm.cmd run smoke:supabase:snapshot
npm.cmd run smoke:supabase:guest-upgrade
npm.cmd run smoke:authoritative-api
```

## Siguiente Bloque Recomendado

El siguiente bloque no deberia ser mas micro-hardening de backend. Opciones razonables:

- Validacion end-to-end de Auth UI, intro, invitado y conversion a cuenta nueva.
- Release checklist y documentacion final de arquitectura/operacion.
- Ladder/Arena server validation si se decide priorizar competitivo.
- Pulido funcional de pantallas no-combat pendientes.

La recomendacion inmediata es una validacion end-to-end de Auth UI e invitado, porque conecta directamente la base de seguridad con la experiencia real del jugador.
