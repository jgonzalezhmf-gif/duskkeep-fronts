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

## Preparar Proyecto Remoto

Pasos recomendados:

1. Crear proyecto Supabase remoto.
2. Activar Anonymous Sign-Ins si se quiere validar modo invitado real.
3. Configurar el dominio de la app en Auth redirect URLs cuando se active OAuth o email flows.
4. Ejecutar migraciones:

   ```powershell
   npx.cmd supabase login
   npx.cmd supabase link --project-ref <project-ref>
   npx.cmd supabase db push
   ```

5. Cargar seed solo si se necesita para catalogos o datos iniciales:

   ```powershell
   npx.cmd supabase db query --linked --file supabase/seed.sql
   ```

6. Revisar en Supabase SQL Editor que RLS esta activado en tablas de jugador.
7. Ejecutar los smokes aplicables.

## Smokes Contra Remoto

Con `.env.local` apuntando al proyecto remoto:

```powershell
npm.cmd run check:supabase:remote
npm.cmd run smoke:supabase:guest-upgrade
```

Notas:

- `smoke:supabase:guest-upgrade` crea un usuario anonimo real y solicita vincular un email al invitado.
- En proyectos remotos con confirmacion de email activada, el smoke termina correctamente cuando la solicitud de verificacion queda pendiente y confirma que `user_id` y `profileId` siguen preservados.
- Tras pulsar el enlace de verificacion del email, la app abre el flujo de definicion de password y sincroniza el snapshot local validado.
- En remoto puede requerir ajustar politica de confirmacion de email para entorno de prueba.
- No debe ejecutarse contra produccion publica con emails reales sin una estrategia de limpieza.

Para validar el proxy autoritativo contra remoto:

1. Arrancar la app con backend remoto y proxy habilitado:

   ```powershell
   $env:SERVER_AUTHORITATIVE_API_ENABLED="true"
   npm.cmd run start
   ```

2. Ejecutar:

   ```powershell
   npm.cmd run smoke:authoritative-api -- --base-url http://127.0.0.1:3000
   ```

El smoke usa Supabase Auth y JWT real. No usa service-role.

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
