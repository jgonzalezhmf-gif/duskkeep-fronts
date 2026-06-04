# Operativa de Supabase Remoto

Este documento describe como preparar y validar una instancia remota de Supabase sin convertir el navegador en fuente de verdad.

## Alcance

El objetivo de este bloque es dejar listo el camino operativo para una instancia remota:

- Migraciones aplicadas de forma controlada.
- Anonymous Sign-Ins activado si se valida el modo invitado real.
- Variables de entorno revisadas sin exponer secretos.
- Smokes ejecutables contra remoto cuando el propietario configure credenciales.
- Riesgos residuales separados de monetizacion, pagos y ladder real.

No incluye:

- Pagos reales.
- Ladder publico competitivo.
- Rate limit distribuido.
- Webhooks de pago.
- Service-role key en cliente.

## Variables Requeridas

En local, despliegue o proveedor de hosting:

```env
NEXT_PUBLIC_SUPABASE_URL=https://<project-ref>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon-key-publica>
NEXT_PUBLIC_PERSISTENCE=supabase
SERVER_AUTHORITATIVE_API_ENABLED=true
AUTHORITATIVE_RATE_LIMIT_BACKEND=memory
AUTHORITATIVE_SECURITY_EVENT_SINK=console
```

Reglas:

- `NEXT_PUBLIC_SUPABASE_ANON_KEY` debe ser la anon key publica, nunca service-role.
- Ninguna variable `NEXT_PUBLIC_*` debe contener secretos, passwords, private keys ni tokens de pago.
- `SERVER_AUTHORITATIVE_API_ENABLED=true` solo debe activarse cuando las migraciones, Auth y smokes esten validados.
- `AUTHORITATIVE_RATE_LIMIT_BACKEND=memory` es aceptable para alpha/single instance; no es suficiente para trafico publico sensible.

## Chequeo de Preparacion

Antes de validar remoto:

```powershell
npm.cmd run check:supabase:remote
```

El comando comprueba:

- URL Supabase remota con `https`.
- Anon key presente y no compatible con service-role.
- Ausencia de nombres/valores sospechosos en `NEXT_PUBLIC_*`.
- Configuracion valida de persistencia, proxy autoritativo, rate limit y sink de eventos.
- Webhook HTTPS si se usa observabilidad por webhook.

El comando no imprime secretos. Solo muestra el host de Supabase.

Evidencia reciente:

- 2026-06-02: `npm.cmd run check:supabase:remote` paso contra `https://vyuoegsmbgmsxexzciur.supabase.co`.
- Configuracion detectada: `NEXT_PUBLIC_PERSISTENCE=supabase`, `SERVER_AUTHORITATIVE_API_ENABLED=true`, rate limit `memory` y sink de eventos `console`.
- El aviso de rate limit en memoria queda aceptado solo para alpha/single instance; no es valido para monetizacion, pagos o ladder publico.

## Preparar Proyecto Remoto

Pasos recomendados:

1. Crear proyecto Supabase remoto.
2. Activar Anonymous Sign-Ins si se quiere validar modo invitado real.
3. Configurar Custom SMTP para evitar los limites bajos del proveedor de email integrado de Supabase. En alpha remoto se ha validado con Resend.
4. Configurar el dominio de la app en Auth redirect URLs cuando se active OAuth o email flows.
5. Ejecutar migraciones:

   ```powershell
   npx.cmd supabase login
   npx.cmd supabase link --project-ref <project-ref>
   npx.cmd supabase db push
   ```

6. Cargar seed solo si se necesita para catalogos o datos iniciales:

   ```powershell
   npx.cmd supabase db query --linked --file supabase/seed.sql
   ```

7. Revisar en Supabase SQL Editor que RLS esta activado en tablas de jugador.
8. Ejecutar los smokes aplicables.

## Custom SMTP

El proveedor de email integrado de Supabase es suficiente para pruebas muy limitadas, pero sus limites pueden bloquear la validacion del flujo de registro/upgrade. Para remoto se recomienda configurar SMTP externo.

Configuracion validada con Resend:

```text
Host: smtp.resend.com
Port: 587
Username: resend
Password: <api-key-privada-de-resend>
Sender email: no-reply@auth.<dominio-verificado>
Sender name: Duskkeep Fronts
```

Reglas:

- La API key de Resend no debe guardarse en `.env`, `.env.local`, `NEXT_PUBLIC_*` ni en Git.
- El dominio o subdominio usado como sender debe estar verificado en Resend.
- Los registros DNS de Resend deben copiarse exactamente desde su panel.
- Si se usa Cloudflare, los `CNAME` de verificacion deben estar en modo `DNS only`.
- Para produccion se puede mantener Resend o migrar a otro proveedor como SES sin cambiar la logica del juego.

## Smokes Contra Remoto

Con `.env.local` apuntando al proyecto remoto:

```powershell
npm.cmd run check:supabase:remote
npm.cmd run smoke:supabase:guest-upgrade -- --email tu_correo+smoke1@example.com
```

Notas:

- `smoke:supabase:guest-upgrade` crea un usuario anonimo real y solicita vincular un email al invitado.
- En remoto debe ejecutarse con `--email` y una bandeja real. El email sintetico por defecto solo es valido para entorno local o pruebas sin entrega real de correo.
- En proyectos remotos con confirmacion de email activada, el smoke termina correctamente cuando la solicitud de verificacion queda pendiente y confirma que `user_id` y `profileId` siguen preservados.
- Tras pulsar el enlace de verificacion del email, la app abre el flujo de definicion de password y sincroniza el snapshot local validado.
- En remoto puede requerir ajustar politica de confirmacion de email para entorno de prueba.
- No debe ejecutarse contra produccion publica con emails reales sin una estrategia de limpieza.
- No ejecutar este smoke con el email sintetico por defecto contra remoto: el script lo bloquea porque necesita una bandeja real para completar el flujo de verificacion.
- Si un email base ya fue usado en un flujo previo, usar un alias de la misma bandeja, por ejemplo `tu_correo+smoke-yyyymmdd@example.com`.

## Smoke Local de Snapshot Server-Owned

Tras aplicar migraciones en local, validar que la RPC de snapshot sigue devolviendo todos los campos que el cliente trata como server-owned:

```powershell
npm.cmd run smoke:supabase:snapshot
```

Este smoke comprueba:

- `resources`, cuenta, heroes, cartas y loadout propios.
- Aislamiento entre dos usuarios de prueba.
- Agregados derivados de `battle_results`: `battleStats`, `eventsPlayed` y `eventCompletions`.

Si falla tras una migracion de backend, no continuar con `db push` hasta corregir el contrato. El frontend no debe recrear esos contadores desde `localStorage` en modo Supabase.

Para validar el proxy autoritativo contra remoto:

1. Arrancar la app con backend remoto y proxy habilitado en desarrollo:

   ```powershell
   npm.cmd run dev:supabase
   ```

   Si se usa build local de produccion, el flag debe estar activo antes de `start`:

   ```powershell
   $env:SERVER_AUTHORITATIVE_API_ENABLED="true"
   npm.cmd run start
   ```

2. Ejecutar, apuntando al puerto donde este escuchando Next:

   ```powershell
   npm.cmd run smoke:authoritative-api -- --base-url http://127.0.0.1:3000 --auth anonymous
   ```

El smoke usa Supabase Auth y JWT real. No usa service-role. En remoto se recomienda `--auth anonymous` para validar el mismo trust boundary que el modo invitado real sin depender de una cuenta email/password ya confirmada. El modo por defecto sigue siendo email/password para compatibilidad con smokes locales o cuentas remotas confirmadas.

Si una operacion sensible muestra en consola `stage:"request_validation"`, `status:404`, `code:"not_found"` y `reason` interno de API desactivada, el proceso de Next se arranco sin `SERVER_AUTHORITATIVE_API_ENABLED=true`. En cuentas vinculadas esto no debe caer a progreso local, porque el siguiente snapshot servidor sobrescribiria ese resultado.

## Rollback y Reset Seguros

Para alpha remoto, separar tres casos:

1. **Rollback de app**: desactivar `SERVER_AUTHORITATIVE_API_ENABLED` en el entorno afectado o volver al despliegue anterior. No cambiar cuentas vinculadas a fallback local como "solucion", porque el snapshot servidor volvera a ser la fuente de verdad.
2. **Rollback de datos**: preferir una migracion correctiva hacia delante. Evitar resetear remoto salvo que el proyecto sea desechable, no tenga usuarios reales y exista una ventana de prueba aprobada.
3. **Reset de pruebas**: antes de borrar datos, pausar la demo, confirmar que solo hay usuarios de prueba, guardar evidencia minima del fallo y despues repetir migraciones, seed necesario, `check:supabase:remote` y smokes aplicables.

Reglas de seguridad:

- No usar service-role key en el navegador ni en scripts compartidos.
- No commitear `.env`, `.env.local`, dumps, exports ni logs de reset.
- Si hay duda sobre ownership/RLS, bloquear la demo online antes de tocar el frontend.

## Checklist de Seguridad

Antes de considerar remoto validado:

- `npm.cmd run check:supabase:remote` pasa.
- Migraciones aplicadas sin errores.
- Anonymous Sign-Ins activado si el modo invitado remoto es requisito.
- RLS activo en tablas de jugador.
- RPCs sensibles usan `auth.uid()`, ownership, idempotencia y ledger cuando hay recursos.
- `/api/server/authoritative` no se habilita si Supabase/Auth remoto no esta listo.
- Logs no contienen JWTs, Authorization headers, service-role keys ni datos de pago.
- `.env`, `.env.local`, dumps y logs no se commitean.

## Riesgos Residuales

Aceptables para alpha:

- Rate limit en memoria para una instancia.
- Combate ejecutado en cliente con validaciones defensivas, no reproduccion completa server-side obligatoria.
- `localStorage` como fallback/cache alpha cuando el backend no este disponible.

No aceptables para monetizacion o ladder publico:

- Rate limit en memoria.
- Aceptar resultados competitivos sin validacion server-side robusta.
- Conceder premium currency desde cliente.
- Usar service-role fuera de servidor controlado.
- Ejecutar pagos sin webhooks firmados backend-only.
