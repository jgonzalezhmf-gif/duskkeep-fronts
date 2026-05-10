# Performance Baseline

Fecha: 2026-05-09

Este documento marca el inicio del bloque de rendimiento. No sustituye profiling real en navegador, pero deja una base medible para no optimizar a ciegas.

## Estado Actual

- `npm.cmd run check:full` pasa de forma estable antes de iniciar este bloque.
- La app usa Next.js App Router con rutas mayoritariamente estaticas y algunas rutas dinamicas para Battle, Adventure level y endpoints dev.
- El mayor riesgo inmediato de peso no esta en codigo JS, sino en assets publicos grandes y en evitar que laminas fuente/raw entren en `public/assets`.
- Tras mover raw/drafts, duplicados y efectos intermedios fuera de `public/assets`, la auditoria queda en 251 archivos y 103.48 MB.

## Assets Raw Movidos Fuera Del Proyecto

Se movieron fuera del repo, a `../Shifty game raw assets/public-assets-raw`, las laminas ignoradas y no referenciadas:

- `public/assets/frontline/cards/cardsReals.png`
- `public/assets/frontline/heroes/Enemigos.png`
- `public/assets/frontline/heroes/PersonajesHeroes.png`
- `public/assets/frontline/Icons/shop/shop.png`

Tambien se movieron fuera de `public/assets` los borradores y backups historicos de musica:

- `public/assets/audio/music/_drafts/`
- `public/assets/audio/music/archive/`

Los MP3 activos registrados en `lib/audioAssets.ts` se mantienen en `public/assets/audio/music/`.

Los archivos movidos no aparecian referenciados por manifests o componentes. Los assets finales recortados/registrados siguen dentro del proyecto.

Tambien se movieron fuera de `public/assets` laminas fuente PNG ignoradas y no referenciadas de Adventure, Frontline icons/cards, modos, recursos y landmarks legacy locales. Los PNG finales registrados en `lib/iconAssets.ts`, manifests de cartas, Home y fondos se mantienen dentro del proyecto.

Se eliminaron duplicados publicos de fondos de batalla de Chapter 1 bajo `public/assets/backgrounds/`; el runtime usa los registrados en `public/assets/frontline/backgrounds/`. Tambien se retiro `deck_hall.png` legacy tras alinear el manifest de Home con `deck_hall_clean.png`.

Tambien se movieron fuera de `public/assets` versiones intermedias no registradas del brillo del key chest (`gold_shine_loop.png` y `gold_shine_loop_aligned.png`). El runtime conserva la version activa `gold_shine_loop_core_aligned.png`, registrada en `lib/adventureMapInteractionAssets.ts`.

Tambien se movieron fuera de `public/assets` variantes Home no referenciadas (`*_aligned` intermedias, `banner_red_cloth_loop.png` y `banner_red_static.png`). Se conservaron los sprites activos registrados por `lib/homeEffectAssets.ts`, incluidos `flag_red_cloth_loop.png`, `blue_flame_loop_aligned.png` y `purple_flame_loop_base_aligned.png`.

Se anadio `npm.cmd run audit:asset-refs` para listar candidatos sin referencias textuales en codigo/docs/tests. Es una herramienta de revision manual, no un gate automatico, porque los paths dinamicos pueden producir falsos positivos. Tras revisar el primer reporte se movio fuera de `public/assets` `banner_red_pole.png`; Home usa `flag_red_pole.png`.

## Auditoria Actual

Resultado de `npm.cmd run audit:assets`:

- `public/assets`: 251 archivos.
- Peso total: 103.48 MB.
- Los assets activos mas pesados son musica aprobada y landmarks/fondos registrados.

## Script De Auditoria

Usar:

```powershell
npm.cmd run audit:assets
npm.cmd run audit:asset-refs
npm.cmd run audit:build
npm.cmd run check:performance
```

`audit:assets` lista:

- numero total de archivos en `public/assets`
- peso total de assets publicos
- top de assets mas pesados

`audit:asset-refs` lista candidatos no referenciados textualmente y debe revisarse manualmente antes de mover o borrar archivos.

`audit:build` requiere una build previa y lista:

- peso total de `.next/static`
- peso total de `.next/server/app`
- top de chunks estaticos
- top de HTML prerenderizado por ruta

`check:performance` requiere una build previa para revisar `.next/static` y HTML prerenderizado. Presupuestos actuales:

- `public/assets` <= 112 MB.
- `.next/static` <= 3 MB.
- `.next/server/app` <= 1 MB.
- HTML prerenderizado por ruta <= 80 KB.

## Auditoria De Build Actual

Resultado de `npm.cmd run audit:build` tras `npm.cmd run check:full`:

- `.next/static`: 48 archivos, 2.32 MB.
- `.next/server/app`: 245 archivos, 0.84 MB.
- Chunk estatico mayor: CSS de 342.5 KB.
- Rutas HTML mas pesadas: `adventure.html` 31.5 KB, `arena.html` 31.1 KB, `_not-found.html` 29.1 KB, `team.html` 27.6 KB.
- `deck.html` queda en 24.9 KB tras renderizar una shell ligera hasta la hidratacion cliente; Deck depende de estado local persistido y no necesita prerenderizar todo el card pool/roster en HTML estatico.
- `shop.html` queda en 26.2 KB tras renderizar una shell ligera hasta la hidratacion cliente; Shop depende de estado local persistido, stock diario y desbloqueo de Adventure Keys.
- `roster.html` queda en 25.2 KB tras renderizar una shell ligera hasta la hidratacion cliente; Roster depende de ownership, filtros y detalle de heroes persistidos en cliente.
- `missions.html` queda en 25.5 KB tras renderizar una shell ligera hasta la hidratacion cliente; Missions depende de progreso local, resets y rewards claimables.
- `arena.html` queda en 30.5 KB tras renderizar una shell ligera hasta la hidratacion cliente; Arena depende de tickets, loadout, ranking y seleccion de rival persistidos en cliente.
- `team.html` queda en 27.6 KB tras renderizar una shell ligera hasta la hidratacion cliente; Team depende de loadout, niveles de cartas y squad persistidos en cliente.
- `adventure.html` queda en 30.9 KB tras renderizar una shell ligera hasta la hidratacion cliente; Adventure depende de progreso local, layout interactivo, interacciones de mapa y modo QA.
- `fortress.html` queda en 26.5 KB tras renderizar una shell ligera hasta la hidratacion cliente; Fortress depende de reloj local, garrison, raids, upgrades y reportes persistidos en cliente.
- `events.html` queda en 26.7 KB tras renderizar una shell ligera hasta la hidratacion cliente; Events depende de nivel, completions diarios, loadout y seleccion de operacion.
- `FrontlineBattle` queda cargado de forma diferida en Arena y Events: los listados iniciales no importan el combate hasta que el usuario entra en fase `battle`. Esto no reduce necesariamente el total de `.next/static`, pero protege la carga inicial de pantallas que normalmente se abren como hub/listado.
- `AdventureMapEditorOverlay` queda cargado de forma diferida: el mapa normal de Adventure no importa el panel de edicion QA salvo cuando se usa el query param del editor.
- `HomeEffectsQaPanel` queda cargado de forma diferida y los handles QA de Home viven en un componente pequeno separado; Home normal no necesita importar el panel completo de edicion de efectos.
- `RewardFlightOverlay` queda cargado mediante `LazyRewardFlightOverlay` en pantallas donde solo aparece tras una accion de recompensa. Esto mantiene el feedback visual, pero evita imports estaticos del overlay en los listados normales.
- `RewardBurstOverlay` queda cargado mediante `LazyRewardBurstOverlay` en claims, raids y resultados; las pantallas normales no importan el burst visual completo hasta necesitarlo.

## Siguientes Focos

1. Revisar imagenes publicas pesadas que si estan registradas y decidir si conviene comprimir, redimensionar o mantener calidad.
2. Investigar rutas HTML pesadas empezando por Deck y Shop antes de tocar componentes.
3. Revisar carga de musica/audio sin tocar el sistema de reproduccion actual.
4. Definir una politica de assets: source/raw fuera del repo, solo PNGs finales recortados en `public/assets`.
