# Despliegue Production

Este runbook prepara Duskkeep Fronts para una demo online estable y futuro MVP publico.

## Alcance

Objetivo:

- Publicar la app Next.js en un hosting production.
- Usar Supabase remoto como persistencia real.
- Mantener `/api/server/authoritative` activo para operaciones sensibles.
- Dejar evidencia reproducible de checks, deploy y smoke post-deploy.

No incluye:

- Monetizacion, pagos o premium currency.
- Ladder competitivo publico.
- Rate limit distribuido.
- Materiales privados de presentacion dentro del repo.

## Estado Actual

- RC local cerrada de nuevo en `0.37.77`; gates pre-deploy repetidos el 2026-06-17 tras aparcar el spike Canvas/WebGL y volver a `main`.
- `npm.cmd run check:supabase:remote` pasa contra el proyecto remoto configurado.
- Desde `0.37.65`, aplicar la migracion `20260604211500_normalize_account_progress.sql` antes del smoke online para reparar XP/nivel acumulado y mantener el snapshot como fuente de verdad.
- El proyecto Vercel `duskkeep-fronts` ya existe y esta asociado al repositorio correcto `jgonzalezhmf-gif/duskkeep-fronts`.
- `.vercel/` no debe commitearse; si se enlaza localmente, queda ignorado por Git.
- Vercel no debe validarse como demo hasta desplegar el commit actual y tener smoke post-deploy en verde.

## Variables Production

Configurar en el proveedor de hosting para `Production` y, si se quieren previews online, tambien para `Preview`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://<project-ref>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon-key-publica>
NEXT_PUBLIC_PERSISTENCE=supabase
SERVER_AUTHORITATIVE_API_ENABLED=true
AUTHORITATIVE_RATE_LIMIT_BACKEND=memory
AUTHORITATIVE_SECURITY_EVENT_SINK=console
```

Reglas:

- No usar service-role key en ninguna variable `NEXT_PUBLIC_*`.
- No commitear `.env`, `.env.local`, `.vercel/`, dumps ni logs.
- `AUTHORITATIVE_RATE_LIMIT_BACKEND=memory` es aceptable solo para demo alpha de baja concurrencia.
- Para publico real, cambiar a rate limit distribuido y observabilidad mas fuerte antes de monetizacion o ladder.

## Opcion Recomendada: Vercel

Pasos:

1. Crear/importar proyecto desde el repositorio privado.
2. Framework: Next.js.
3. Root directory: raiz del repo.
4. Install command: `npm install`.
5. Build command: `npm run build`.
6. Output directory: dejar automatico de Next.js.
7. Configurar las variables production anteriores.
8. Desplegar a Preview primero.
9. Validar Preview con smoke y navegador.
10. Promocionar a Production o ejecutar deploy production.

Si se usa Vercel CLI:

```powershell
npx.cmd vercel link
npx.cmd vercel pull --yes --environment=production
npx.cmd vercel build --prod
npx.cmd vercel deploy --prebuilt --prod
```

No commitear `.vercel/project.json`; `.vercel/` ya esta ignorado.

## Pre-Deploy Gate

Antes de desplegar:

```powershell
npm.cmd run check
npm.cmd run test
npm.cmd run build
$env:NODE_OPTIONS="--use-system-ca"; npm.cmd run audit:high
npm.cmd run audit:assets
npm.cmd run audit:asset-refs
npm.cmd run audit:build
npm.cmd run check:performance
npm.cmd run check:supabase:remote
```

Evidencia `0.37.67` del 2026-06-04:

- `npm.cmd run check` paso: ESLint, `tsc --noEmit` y `check:store-boundaries`.
- `npm.cmd run test` paso: 98 archivos, 659 tests.
- `npm.cmd run build` paso con Next.js 16.2.6.
- `$env:NODE_OPTIONS="--use-system-ca"; npm.cmd run audit:high` paso: 0 vulnerabilidades high o superiores.
- `npm.cmd run audit:assets` paso: 292 assets publicos, 41.68 MB.
- `npm.cmd run audit:asset-refs` paso: 0 candidatos no referenciados.
- `npm.cmd run audit:build` paso: `.next/static` 3.12 MB, `.next/server/app` 0.88 MB.
- `npm.cmd run check:performance` paso todos los presupuestos.
- `npm.cmd run check:supabase:remote` paso contra `https://vyuoegsmbgmsxexzciur.supabase.co`.

Nota `0.37.68`:

- El primer deploy production real de Duskkeep en Vercel llego al repositorio correcto, pero fallo en `npm install` porque `eslint-config-next@16.2.6` exige `eslint >= 9` y el proyecto seguia declarando `eslint@8.57.0`.
- Se corrigio migrando a ESLint 9 y `eslint.config.mjs`; antes de volver a desplegar pasaron `npm.cmd run check`, `npm.cmd run test` y `npm.cmd run build`.

Evidencia `0.37.77` del 2026-06-17:

- `npm.cmd run check` paso: ESLint, `tsc --noEmit` y `check:store-boundaries`.
- `npm.cmd run test` paso: 100 archivos, 674 tests.
- `npm.cmd run build` paso con Next.js 16.2.6.
- `$env:NODE_OPTIONS="--use-system-ca"; npm.cmd install --no-audit --no-fund` paso desde `node_modules` limpio.
- `$env:NODE_OPTIONS="--use-system-ca"; npm.cmd run audit:high` paso: 0 vulnerabilidades high o superiores; queda 1 low de `esbuild` en tooling de desarrollo.
- `npm.cmd run audit:assets` paso: 292 assets publicos, 41.68 MB.
- `npm.cmd run audit:asset-refs` paso: 0 candidatos no referenciados.
- `npm.cmd run audit:build` paso: `.next/static` 3.15 MB, `.next/server/app` 0.88 MB.
- `npm.cmd run check:performance` paso todos los presupuestos.
- `npm.cmd run check:supabase:remote` paso contra `https://vyuoegsmbgmsxexzciur.supabase.co` con aviso aceptado de rate limit en memoria para alpha.

Nota de seguridad `0.37.77`:

- `npm audit` detecto vulnerabilidades transitorias de tooling en Babel/ws/Vite/esbuild.
- Se actualizo el lock para Babel/ws, se alineo `@types/node` con Vite 7 y se fijo `vite@7.3.5` via `overrides`, porque `vite@8.0.16` declaraba una dependencia no resoluble en el registry actual. El aviso residual low de `esbuild` afecta al dev server en Windows y no bloquea la RC production.

Siguiente paso:

- Desplegar el commit actual de `main` en production y ejecutar el smoke post-deploy contra la URL production.

## Post-Deploy Smoke

Con la URL production:

```powershell
npm.cmd run smoke:authoritative-api -- --base-url https://<production-url> --auth anonymous
$env:BASE_URL="https://<production-url>"; npm.cmd run screenshots
```

Flujo manual minimo:

1. Abrir una ventana limpia.
2. Completar o saltar intro.
3. Entrar como invitado Supabase o cuenta de prueba.
4. Llegar a Home.
5. Entrar en Adventure y completar un combate.
6. Ver recompensas sin fallback local.
7. Comprar una oferta normal de Shop.
8. Entrar en Arena o Events y completar un flujo disponible.
9. Cerrar sesion y volver a entrar o abrir incognito.
10. Confirmar que recursos, progreso y compras vuelven desde snapshot servidor.

Bloqueantes:

- Error visible de Auth repetido.
- Aviso de fallback local en cuenta online.
- Recompensa o compra que desaparece al recargar.
- `smoke:authoritative-api` fallando contra production.
- Consola con errores criticos o assets 404 en rutas principales.

## Rollback

Si falla la demo:

1. Guardar URL, hora y accion que fallo.
2. Revisar logs del despliegue y `/api/server/authoritative`.
3. Si el fallo es de app, volver al despliegue anterior.
4. Si el fallo es de Supabase/RPC, pausar la demo online y aplicar migracion correctiva hacia delante.
5. No convertir cuentas vinculadas a fallback local como solucion rapida.

## Riesgos Residuales Aceptados Para Demo Alpha

- Rate limit en memoria.
- Sink de eventos de seguridad en consola.
- Combate validado defensivamente, sin simulacion server-side completa.
- Demo online pensada para baja concurrencia y cuentas de prueba.

Antes de MVP publico:

- Rate limit distribuido.
- Observabilidad persistente.
- Replay/simulacion server-side robusta para competitivo.
- Politica de dominios/Auth/email production.
- Revalidacion de seguridad completa.
