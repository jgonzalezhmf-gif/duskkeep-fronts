# Despliegue Production

Este runbook prepara Duskkeep Fronts para una demo online estable de TFM y futuro MVP publico.

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
- Documentos privados de TFM dentro del repo.

## Estado Actual

- RC local cerrada en `0.37.63`.
- `npm.cmd run check:supabase:remote` pasa contra el proyecto remoto configurado.
- No hay proyecto Vercel de Duskkeep enlazado en el repo (`.vercel/` no existe y esta ignorado por Git).
- Vercel no debe desplegarse hasta configurar variables production; un deploy sin Supabase seria una demo online incompleta.

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
- `AUTHORITATIVE_RATE_LIMIT_BACKEND=memory` es aceptable solo para TFM/demo alpha de baja concurrencia.
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
npm.cmd test
npm.cmd run build
$env:NODE_OPTIONS="--use-system-ca"; npm.cmd run audit:high
npm.cmd run audit:assets
npm.cmd run audit:asset-refs
npm.cmd run audit:build
npm.cmd run check:performance
npm.cmd run check:supabase:remote
```

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

## Riesgos Residuales Aceptados Para TFM

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
