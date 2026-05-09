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

## Auditoria De Build Actual

Resultado de `npm.cmd run audit:build` tras `npm.cmd run check:full`:

- `.next/static`: 39 archivos, 2.31 MB.
- `.next/server/app`: 245 archivos, 1.31 MB.
- Chunk estatico mayor: CSS de 338.7 KB.
- Rutas HTML mas pesadas: `deck.html` 123.3 KB, `shop.html` 100.7 KB, `roster.html` 94.0 KB, `missions.html` 92.3 KB.

## Siguientes Focos

1. Revisar imagenes publicas pesadas que si estan registradas y decidir si conviene comprimir, redimensionar o mantener calidad.
2. Investigar rutas HTML pesadas empezando por Deck y Shop antes de tocar componentes.
3. Revisar carga de musica/audio sin tocar el sistema de reproduccion actual.
4. Definir una politica de assets: source/raw fuera del repo, solo PNGs finales recortados en `public/assets`.
