# Troubleshooting Operativo

Esta guia agrupa incidencias repetidas de desarrollo, demo y validacion. El objetivo es diagnosticar rapido sin relajar seguridad ni convertir el cliente en fuente de verdad.

## Reglas Generales de Diagnostico

- No corregir recursos, progreso, compras o claims editando `localStorage` si la sesion usa Supabase.
- No hacer fallback local para cuentas vinculadas cuando falle una operacion autoritativa.
- No imprimir ni commitear tokens, JWTs, `.env`, `.env.local`, service-role keys, SMTP passwords ni logs con credenciales.
- Si una accion sensible falla, revisar primero `/api/server/authoritative`, RPCs Supabase, RLS, migraciones y snapshot servidor.
- Si agent-browser o Playwright se quedan abiertos, cerrar procesos de prueba antes de continuar.

## Comandos Base

Validacion rapida:

```powershell
npm.cmd run check
npm.cmd run build
```

Validacion completa si el entorno lo permite:

```powershell
npm.cmd run check:full
```

Validacion Supabase local:

```powershell
npx.cmd supabase start
npx.cmd supabase db reset
npm.cmd run smoke:supabase:guest
npm.cmd run smoke:supabase:snapshot
npm.cmd run smoke:authoritative-api
```

Validacion Supabase remoto:

```powershell
npm.cmd run check:supabase:remote
```

## Supabase y Backend Autoritativo

### `request_validation/not_found` en `/api/server/authoritative`

Sintoma:

```text
stage:"request_validation", status:404, code:"not_found"
```

Causa habitual:

- La app se arranco sin `SERVER_AUTHORITATIVE_API_ENABLED=true`.

Comprobar:

```powershell
$env:SERVER_AUTHORITATIVE_API_ENABLED
$env:NEXT_PUBLIC_PERSISTENCE
```

Solucion:

- En desarrollo Supabase usar `npm.cmd run dev:supabase`.
- En build local de produccion, fijar variables antes de arrancar:

```powershell
$env:NEXT_PUBLIC_PERSISTENCE="supabase"
$env:SERVER_AUTHORITATIVE_API_ENABLED="true"
npm.cmd run start
```

No hacer:

- No conceder recompensa local como sustituto si la cuenta es vinculada o invitado Supabase.

### Recompensas visibles pero desaparecen tras recargar

Causa probable:

- El cliente mostro un estado optimista o local, pero el snapshot servidor no tenia esa mutacion.

Comprobar:

- Consola de Next para `authoritative_api`.
- Respuesta de la operacion sensible.
- Si el cliente refresco `get_player_snapshot` tras la mutacion.
- Si la RPC existe en remoto y esta migrada.

Accion:

```powershell
npm.cmd run smoke:supabase:snapshot
npm.cmd run smoke:authoritative-api
```

Si ocurre en remoto:

```powershell
npm.cmd run check:supabase:remote
```

### Nodo de Adventure rechazado como `locked`

Sintoma:

```text
operationType:"claimAdventureBattleResult", code:"locked"
```

Causa probable:

- Desalineacion entre grafo de desbloqueo cliente y reglas servidor.
- El nodo se inicio desde cache local antigua.
- El usuario no tenia completado el requisito en snapshot servidor.

Comprobar:

- Que el nodo aparece disponible en `/adventure` antes de entrar.
- Que el progreso servidor esta actualizado tras el nodo anterior.
- Que el grafo cliente y RPC usan el mismo prerequisito.

Accion:

- Refrescar snapshot tras completar nodos.
- No iniciar rutas directas `/adventure/<nodeId>` si el mapa lo marca bloqueado.
- Si el bug persiste, corregir grafo compartido o migracion/RPC, no el resultado cliente.

### `Invalid Refresh Token: Refresh Token Not Found`

Causa habitual:

- Token local de Supabase obsoleto tras logout, cambio de cuenta, incognito o limpieza parcial.

Comportamiento esperado:

- El cliente debe limpiar sesion corrupta y volver a auth gate sin conservar estado sensible.

Accion manual si se queda bloqueado:

- Cerrar sesion desde UI si es posible.
- En desarrollo, limpiar storage del origen local.
- Volver a iniciar sesion y verificar que `get_player_snapshot` carga recursos/progreso.

No hacer:

- No copiar tokens entre navegadores.
- No usar logs con refresh tokens como evidencia versionada.

### `auth_error` o `rate_limited` en registro/upgrade invitado

Causas habituales:

- Anonymous Sign-Ins desactivado.
- SMTP no configurado o password/API key incorrecta.
- Rate limit del proveedor de email.
- Redirect URL no permitido.
- Email ya usado en un flujo previo.

Comprobar:

- Supabase Auth logs.
- Anonymous Sign-Ins activo.
- SMTP externo configurado si se valida remoto.
- Redirect URLs incluyen la URL local/remota usada.
- Usar una direccion de prueba nueva si el flujo requiere email unico.

Regla de seguridad:

- La UI debe mantener errores genericos. No revelar si una cuenta existe.

## Auth, Invitado e Intro

### Login aparece antes de la intro

Comportamiento correcto:

- Al entrar por URL, la intro aparece primero.
- Al terminar o saltar, aparece Auth si la carga actual requiere decision.

Comprobar:

- `docs/AUTH_FLOW_AND_SESSION_POLICY.md`.
- Estado de intro/onboarding en store.
- Que el auth gate no se monta antes de completar intro.

### Invitado no vuelve a ver opcion de login tras recargar

Comportamiento correcto:

- Si el usuario entro como invitado y recarga/cierra la web, tras la intro debe poder elegir login o continuar como invitado.
- Si navega dentro de la SPA sin recargar, no debe reaparecer auth gate.

Riesgo:

- Si se oculta el gate siempre para invitados, el usuario pierde la opcion de entrar con cuenta existente.

## Assets, Iconos y Visuales

### 404 de assets

Causa habitual:

- Un componente pide un asset por ruta hardcodeada no registrada.
- El PNG/WebP no existe con ese nombre exacto.
- Se movio un asset sin actualizar manifest.

Comprobar:

```powershell
npm.cmd run audit:assets
npm.cmd run audit:asset-refs
```

Regla:

- Registrar assets en manifests y usar wrappers compartidos.
- Si falta el asset, fallback seguro sin request especulativa.

### PNG con fondo raro, checker o alpha mala

Accion:

- No registrar como final si se ve roto.
- Usar fallback actual.
- Reportar asset concreto y pantalla afectada.

No hacer:

- No intentar ocultar un fondo malo con CSS si el asset debe ser transparente.

### Animaciones de spritesheets "bailan"

Causa habitual:

- Frames con centros visuales distintos.
- Animacion moviendo la tira completa sin ventana fija.
- Calibracion QA cambiando anclas o tamano sin compensar frame.

Comprobar:

- Usar ventana fija con `overflow: hidden`.
- Animar `background-position` o transform interno por steps sin mover el contenedor.
- Revisar `prefers-reduced-motion`.

## Navegador, agent-browser y Capturas

### agent-browser queda colgado o deja Chrome abierto

Cerrar solo procesos de agent-browser:

```powershell
Get-Process agent-browser-win32-x64 -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue
Get-Process chrome -ErrorAction SilentlyContinue | Where-Object { $_.Path -like '*\.agent-browser\browsers\*' } | Stop-Process -Force -ErrorAction SilentlyContinue
```

Si se uso puerto local de validacion:

```powershell
$owners = Get-NetTCPConnection -LocalPort 3003 -ErrorAction SilentlyContinue | Select-Object -ExpandProperty OwningProcess -Unique
foreach($owner in $owners){ if($owner -ne 0){ Stop-Process -Id $owner -Force -ErrorAction SilentlyContinue } }
```

Regla:

- No cerrar Chrome normal del usuario. Solo procesos cuyo path contenga `.agent-browser`.

### Captura Home movil muestra solo intro o auth

Causa:

- Home real esta detras de intro/auth gate en una carga limpia.

Para capturar Home post-intro:

1. Abrir `/`.
2. Pulsar `Saltar`.
3. Pulsar `PLAY WITHOUT ACCOUNT` o iniciar sesion.
4. Esperar snapshot.
5. Capturar.

### Warning `AudioContext was not allowed to start`

Significado:

- El navegador bloquea audio hasta que haya gesto de usuario.

Severidad:

- Normal en validacion automatizada si no se ha interactuado con audio.
- No es bloqueo si tras click/tap el audio funciona y no hay superposicion de musicas.

No hacer:

- No intentar arrancar audio automaticamente saltandose politicas del navegador.

## Build, Windows y OneDrive

### `spawn EPERM` en tests o build

Causa probable:

- Entorno restringido bloqueando procesos hijos de Vitest/esbuild/Next.

Accion:

- Repetir fuera del shell restringido.
- Si solo falla por sandbox, documentar limitacion.
- Mantener `npm.cmd run check` como gate minimo.

### Dev server corrupto o comportamiento raro en `.next`

Accion:

```powershell
npm.cmd run clean:next
npm.cmd run dev
```

Reglas:

- Mantener un solo `next dev` por repo.
- Evitar mezclar `localhost` y `127.0.0.1` en una misma evidencia si se esta depurando origen/session storage.

### Build modifica `next-env.d.ts`

Sintoma:

- `git status` muestra `next-env.d.ts` modificado, pero `git diff` no muestra cambios utiles.

Accion:

```powershell
git add next-env.d.ts
git status --short
```

Si desaparece del status, era falso positivo de indice/line endings. No commitear cambios inexistentes.

## Rendimiento

### Lighthouse marca LCP bajo por imagenes

Comprobar:

- Imagen LCP concreta.
- Tamano real vs tamano mostrado.
- Si existe variante WebP/96px/thumbnail.
- Si se estan cargando assets de pantallas no visibles.

Accion:

```powershell
npm.cmd run audit:build
npm.cmd run check:performance
```

Reglas:

- Optimizar variantes de imagen antes de introducir loaders complejos.
- Evitar animaciones no compuestas: preferir `transform` y `opacity`.

## Checklist Antes de Pedir Ayuda

Antes de abrir una incidencia nueva, recopilar:

- Ruta exacta.
- Modo: local, Supabase local o Supabase remoto.
- Variables relevantes sin valores secretos: `NEXT_PUBLIC_PERSISTENCE`, `SERVER_AUTHORITATIVE_API_ENABLED`.
- Ultima accion realizada.
- Mensaje visible para usuario.
- Linea de consola sanitizada con `operationType`, `code`, `requestId` si existe.
- Si se reproduce tras recargar.
- Si ocurre con cuenta vinculada, invitado Supabase o fallback local.

No incluir:

- JWTs.
- Refresh tokens.
- Auth headers.
- SMTP/API keys.
- Dumps completos de base de datos.
