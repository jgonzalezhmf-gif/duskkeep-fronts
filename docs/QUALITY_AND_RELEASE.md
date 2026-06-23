# Checklist de Calidad y Lanzamiento

Este documento define el minimo de calidad para una build presentable de Duskkeep Fronts.

## Objetivos de Lanzamiento

- El alpha es jugable desde Home hasta Adventure, Combat y recompensas.
- Las pantallas principales cargan sin crashes runtime.
- El codigo tiene limites claros y sistemas documentados.
- Los assets cargan mediante manifests o fallbacks seguros.
- La persistencia local sigue siendo compatible.
- Los checks estan en verde o los bloqueos quedan documentados.

## Alcance Release Candidate

La candidata actual debe presentarse como producto desarrollado con metodologia asistida por IA, SDD, agentes y gates de calidad. No depende de anadir IA generativa dentro del juego.

Para cerrar una candidata presentable:

- Congelar funcionalidades jugables salvo bug o bloqueo de demo.
- Mantener Chapter 2, monetizacion y ladder publico como trabajo futuro.
- Usar Supabase remoto como persistencia real para demo online.
- Documentar evidencia de checks, navegador, smokes y despliegue.
- Mantener materiales privados de presentacion fuera de Git hasta aprobacion explicita; este repo conserva solo documentacion operativa/producto.

Una RC no queda lista si:

- Hay errores criticos de consola en rutas principales.
- Una accion sensible online cae a progreso local sin advertencia.
- La URL production no puede completar Intro/Auth -> Home -> Adventure -> Combat -> Rewards.
- No existe evidencia reproducible de los checks ejecutados.

## Evidencia RC Local Actual

Ultima pasada local registrada: `0.37.77` / 2026-06-17.

- `npm.cmd run check`: pasa.
- `npm.cmd run test`: pasa con 100 test files y 674 tests.
- `npm.cmd run build`: pasa con Next.js 16.2.6.
- `$env:NODE_OPTIONS="--use-system-ca"; npm.cmd install --no-audit --no-fund`: pasa desde `node_modules` limpio.
- `$env:NODE_OPTIONS="--use-system-ca"; npm.cmd run audit:high`: pasa con 0 vulnerabilidades high o superiores; queda 1 low de `esbuild` en tooling de desarrollo.
- `npm.cmd run audit:assets`: 292 assets publicos, 41.68 MB.
- `npm.cmd run audit:asset-refs`: 0 candidatos no referenciados.
- `npm.cmd run audit:build`: `.next/static` 3.15 MB; server app 0.88 MB.
- `npm.cmd run check:performance`: pasa todos los presupuestos.
- `npm.cmd run check:supabase:remote`: pasa contra `https://vyuoegsmbgmsxexzciur.supabase.co`; queda el aviso aceptado para alpha de rate limit en memoria.

Notas:

- Antes de repetir el gate, se limpio `.next` porque la cache generada aun contenia tipos de un spike de Canvas/WebGL ya aparcado fuera de `main`.
- `npm audit` reporto vulnerabilidades transitorias de tooling; las high quedaron mitigadas en el lock actual actualizando Babel/ws, alineando `@types/node` con Vite 7 y forzando `vite@7.3.5` mediante `overrides`. Queda un aviso low de `esbuild` ligado al dev server en Windows, no bloqueante para RC production.
- La evidencia visual local previa sigue siendo util como referencia: `tmp/playwright-screenshots/2026-06-04T16-56-25-860Z/manifest.json` y `tmp/rc-route-validation/20260604-190306/manifest.json` tuvieron 24/24 escenarios OK.
- El cierre de demo online requiere redeploy production del commit actual y smoke Supabase remoto post-deploy.

## Gate Production

Antes de considerar lista la demo online:

- Seguir `docs/PRODUCTION_DEPLOYMENT.md`.
- Configurar variables production en el hosting antes del primer deploy util.
- Confirmar `npm.cmd run check:supabase:remote`.
- Ejecutar smoke autoritativo contra la URL production.
- Ejecutar capturas o validacion browser contra la URL production.
- Registrar URL, commit desplegado, fecha, comandos y riesgos residuales.

Estado actual: Supabase remoto pasa preflight y el proyecto Vercel `duskkeep-fronts` ya existe. Falta redeploy production del commit actual y ejecutar smoke post-deploy contra la URL publica.

## Comandos Requeridos

Si algun comando o flujo falla, revisar primero `docs/OPERATIONS_TROUBLESHOOTING.md`.

Ejecutar antes de una candidata a lanzamiento:

```powershell
npm.cmd run check
npm.cmd test
npm.cmd run build
$env:NODE_OPTIONS="--use-system-ca"; npm.cmd run audit:high
```

Si el entorno bloquea procesos hijos con `spawn EPERM`, repetir fuera del shell restringido y documentar la limitacion.

Si la candidata toca auth, Supabase o economia autoritativa, ejecutar tambien:

```powershell
npm.cmd run smoke:supabase:guest
npm.cmd run smoke:supabase:snapshot
npm.cmd run smoke:supabase:guest-upgrade
npm.cmd run smoke:authoritative-api
```

Si la candidata toca assets, rendimiento o fondos pesados, ejecutar tambien:

```powershell
npm.cmd run audit:assets
npm.cmd run audit:asset-refs
npm.cmd run audit:build
npm.cmd run check:performance
```

## Rutas de Validacion Rapida en Navegador

Para criterios UX especificos por pantalla, usar tambien `docs/SCREEN_UX_CHECKLIST.md`.

Validar estas rutas:

- `/`
- `/adventure`
- `/adventure/c1l1`
- `/battle?start=1`
- `/deck`
- `/team`
- `/roster`
- `/shop`
- `/fortress`
- `/missions`
- `/arena`
- `/events`

En cada ruta comprobar:

- La pagina carga.
- No hay errores criticos de consola.
- No hay 404 en assets registrados.
- No hay overflow horizontal.
- El CTA principal es visible.
- El layout mobile es usable.

## Escenarios de Gameplay

Validar al menos:

- Iniciar una batalla desde Adventure.
- Volver de pre-combate a Adventure.
- Terminar una batalla y llegar a pantalla de resultado.
- Reclamar una recompensa.
- Abrir un key chest si se cumplen requisitos.
- Comprar un item normal de Shop si hay recursos.
- Cambiar seleccion de Deck o Team sin romper el inicio de Combat.

## Smoke Manual Supabase Remoto

Ejecutar cuando la build use `NEXT_PUBLIC_PERSISTENCE=supabase` y `SERVER_AUTHORITATIVE_API_ENABLED=true`.

Preparacion:

- Confirmar que `npm.cmd run check:supabase:remote` pasa.
- Confirmar que `npx.cmd supabase db push` no deja migraciones pendientes.
- Usar una cuenta de prueba, no una cuenta de produccion real.

Flujo minimo:

1. Entrar en la app desde una ventana limpia.
2. Completar o saltar intro.
3. Iniciar sesion con cuenta vinculada.
4. Entrar en Adventure y completar un nodo disponible.
5. Verificar que la pantalla de victoria muestra recompensas sin aviso de fallback local.
6. Volver a Adventure y comprobar que el nodo queda persistido.
7. Reclamar o abrir una recompensa disponible, incluido key chest si hay llave.
8. Comprar una oferta normal de Shop y confirmar que los recursos cambian solo tras respuesta servidor.
9. Entrar en Arena, iniciar combate con ticket y finalizarlo.
10. Confirmar que Arena no muestra avisos de `Online progress must be validated by the server`.
11. Cerrar sesion y volver a iniciar sesion en otra ventana o incognito.
12. Confirmar que recursos, progreso de Adventure, compras y contador de Arena se recuperan desde servidor.

Senales de bloqueo:

- Error visible de `Invalid Refresh Token` repetido tras login normal.
- Aviso de fallback local en una accion sensible de cuenta vinculada.
- Recursos que aparecen tras una accion pero desaparecen tras recargar.
- Nodo de Adventure marcado como bloqueado tras haber sido iniciado desde un estado permitido.

Si aparece una senal de bloqueo, revisar primero `/api/server/authoritative`, `get_player_snapshot`, RLS y variables de entorno antes de tocar el frontend.

## Checklist de Calidad de Codigo

- Los tipos TypeScript son explicitos en datos de dominio.
- Las reglas de gameplay no estan enterradas en JSX.
- Las mutaciones de economia pasan por acciones de store o helpers de feature.
- Los assets opcionales estan registrados en manifests.
- Los componentes reutilizan chrome, iconos y UI de recompensas compartidos.
- No hay `Date.now()` ni valores aleatorios en rutas de render React.
- No hay `any` amplio salvo que este aislado y justificado.
- No se commitean secretos ni archivos de entorno.

## Checklist de Rendimiento

- Evitar blurs animados grandes, `box-shadow` animado y particulas globales.
- Preferir transforms y opacity para motion.
- Respetar `prefers-reduced-motion` en animacion decorativa.
- Mantener capas de fondo y sprites acotadas.
- Evitar cargar assets de pantallas que no estan visibles cuando sea practico.

## Checklist de Accesibilidad y UX

- Botones y links tienen nombres accesibles.
- Imagenes decorativas usan `alt=""` y `aria-hidden` cuando aplica.
- El estado importante se comunica con texto y tratamiento visual, no solo color.
- Los touch targets son suficientemente grandes en mobile.
- El foco de teclado sigue siendo usable en menus y dialogos.

## Checklist de Seguridad

Para cualquier release online:

- No confiar en balances de recursos del cliente.
- No conceder moneda premium solo en cliente.
- No aceptar claims de batalla/recompensa sin validacion de servidor.
- No exponer service-role keys ni tokens privados al navegador.
- Restringir persistencia por ownership de usuario autenticado.
- Mantener errores de login/registro/recuperacion genericos para evitar enumeracion de cuentas.
- Confirmar que rutas `/api/dev/*` siguen bloqueadas en produccion.
- Confirmar que `NEXT_PUBLIC_*` no contiene secretos.
- Documentar cualquier vulnerabilidad de dependencia aceptada y por que no se fuerza el fix.

## Notas de Lanzamiento

Cada iteracion cerrada debe actualizar:

- `CHANGELOG.md`
- `package.json`
- `package-lock.json`

Usar:

- Patch para fixes, documentacion y polish pequeno.
- Minor para sistemas visibles, flujos nuevos o cambios UX relevantes.
- Major solo para cambios incompatibles de arquitectura o direccion de gameplay.
