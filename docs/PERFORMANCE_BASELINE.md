# Performance Baseline

Fecha: 2026-05-09

Este documento marca el inicio del bloque de rendimiento. No sustituye profiling real en navegador, pero deja una base medible para no optimizar a ciegas.

## Estado Actual

- `npm.cmd run check:full` pasa de forma estable antes de iniciar este bloque.
- La app usa Next.js App Router con rutas mayoritariamente estaticas y algunas rutas dinamicas para Battle, Adventure level y endpoints dev.
- El mayor riesgo inmediato de peso no esta en codigo JS, sino en assets publicos grandes y en evitar que laminas fuente/raw entren en `public/assets`.
- Tras mover raw/drafts fuera de `public/assets`, la auditoria queda en 415 archivos y 167.93 MB.

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

## Auditoria Actual

Resultado de `npm.cmd run audit:assets`:

- `public/assets`: 415 archivos.
- Peso total: 167.93 MB.
- Los assets activos mas pesados son musica aprobada y landmarks/fondos registrados.

## Script De Auditoria

Usar:

```powershell
npm.cmd run audit:assets
```

El script lista:

- numero total de archivos en `public/assets`
- peso total de assets publicos
- top de assets mas pesados

## Siguientes Focos

1. Revisar imagenes publicas pesadas que si estan registradas y decidir si conviene comprimir, redimensionar o mantener calidad.
2. Medir bundle/rutas tras build para detectar pantallas con coste alto.
3. Revisar carga de musica/audio sin tocar el sistema de reproduccion actual.
4. Definir una politica de assets: source/raw fuera del repo, solo PNGs finales recortados en `public/assets`.
