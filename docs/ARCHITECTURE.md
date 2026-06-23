# Arquitectura de Duskkeep Fronts

Este documento describe la arquitectura actual del alpha y las reglas que mantienen el codigo mantenible mientras el juego crece.

## Objetivos

- Mantener jugable la vertical slice mientras evolucionan los sistemas.
- Mantener las reglas de gameplay fuera de componentes de presentacion.
- Mantener assets visuales detras de manifests y fallbacks seguros.
- Mantener funcionando el fallback local de desarrollo y el modo online server-authoritative sin confundir cache cliente con autoridad.
- Hacer que el codigo sea facil de auditar, probar y extender.

## Stack

- Next.js App Router para rutas y composicion de pantallas.
- React client components para pantallas interactivas de juego.
- TypeScript para modelos de dominio y seguridad de tipos.
- Tailwind CSS para UI responsive de juego.
- Zustand persist para estado local/offline y preferencias/cache de cliente.
- Vitest para tests deterministas de gameplay y rewards.
- Supabase SDK, Auth, migraciones, RLS, RPCs, smokes y `get_player_snapshot` para persistencia online autoritativa. En produccion no es opcional para progreso real.

## Limites Entre Capas

### `app/`

Puntos de entrada de rutas y wiring de alto nivel. Los archivos de ruta deben:

- Seleccionar datos del store.
- Componer componentes de juego.
- Disparar navegacion.
- Evitar incrustar reglas de balance, economia o combate.

### `components/`

UI reutilizable y presentacion de juego. Los componentes deben:

- Renderizar estado de forma clara.
- Delegar calculos a `features/*`, `data/*` o `lib/*`.
- Usar componentes compartidos de iconos, fondos, rewards y assets.
- Evitar URLs especulativas de assets.

### `features/`

Sistemas de dominio y logica de gameplay. Aqui deben vivir las reglas:

- `features/frontline`: combate Duskkeep Fronts, cartas, presets, perfiles de heroe e integracion con Fortress.
- `features/adventure`: resolucion de nodos Adventure, progresion, interacciones de mapa y rewards.
- `features/frontline`: motor principal de combate Duskkeep Fronts.

### `data/`

Seed data estatica del contenido alpha:

- Heroes.
- Niveles de Adventure.
- Ofertas de Shop.
- Missions.
- Edificios de Fortress.
- Presets y cartas Frontline.

Los archivos de datos pueden definir valores y configuracion, pero el comportamiento debe vivir en helpers de feature.

### `lib/`

Infraestructura compartida:

- Store Zustand y persistencia.
- Tipos compartidos.
- Helpers de visibilidad de rewards.
- Manifests de assets.
- Diccionarios i18n.
- RNG y constantes.

`lib/store.ts` sigue siendo un orquestador amplio, pero la tanda reciente de refactor dejo fuera varias reglas puras de dominio y feedback. Las nuevas reglas deben extraerse a helpers de feature cuando no sean simples transiciones de estado; no conviene seguir dividiendo el store sin un corte funcional claro.

## Flujo de Datos

1. El contenido estatico se define en `data/*` y archivos especificos de feature.
2. Los helpers de feature derivan estado de gameplay, rewards, desbloqueos y resumenes para UI.
3. `lib/store.ts` orquesta estado local/offline y acciones `OnlineFirst`; en modo Supabase aplica snapshots/respuestas autoritativas.
4. Las rutas en `app/*` seleccionan estado y componen pantallas.
5. Los componentes renderizan estado visual con assets compartidos y fallbacks.

## Estrategia de Persistencia

Modo local/offline:

- Zustand persist escribe en `localStorage`.
- Permite desarrollo, QA y demos locales sin servidor.
- Es fallback de desarrollo/alpha, no fuente valida para economia, progreso o rankings de produccion.

Modo Supabase / produccion online:

- El estado de cliente es cache/proyeccion UI, no autoridad.
- `get_player_snapshot` rehidrata recursos, progreso, compras, claims, loadout, Fortress, Arena/Events/Ladder y datos sensibles.
- Las mutaciones sensibles pasan por `/api/server/authoritative` y RPCs con JWT, ownership/RLS, idempotencia, catalogos server-side y ledger cuando toca recursos.
- El login visible puede ser opcional; el invitado online debe usar sesion anonima Supabase si genera progreso real.
- Los resultados Frontline tienen validacion defensiva y replay opcional; competitivo publico todavia requiere simulacion/replay server-side robusto.

## Principios de Calidad

- Responsabilidad unica: separar reglas, datos y presentacion.
- Abierto/cerrado: anadir nuevas cartas, nodos, rewards y assets mediante registros y manifests.
- Inversion de dependencias: la UI depende de helpers tipados e interfaces, no de storage o backend raw.
- Determinismo: combate y rewards deben poder probarse con seeds estables cuando aplique.
- Fallbacks seguros: los assets opcionales deben degradar sin 404.

## Riesgos Tecnicos Actuales

- `lib/store.ts` sigue siendo amplio; extraer solo reglas duplicadas, sensibles o testeables con un beneficio claro, evitando micro-refactors por inercia.
- Todavia existen sistemas legacy que deben aislarse del flujo principal Frontline.
- La persistencia online es autoritativa para el MVP alpha, pero faltan gates de produccion como rate limit distribuido, observabilidad real y replay/simulacion server-side completa para competitivo publico.
- La app es visualmente rica, por lo que smoke tests en navegador y validacion de assets importan antes de release.

## Reglas de Extension

- Nuevas reglas de gameplay van en `features/*`.
- Nuevos assets visuales pasan por manifests antes de usarse en UI.
- Nuevos rewards deben usar helpers `Rewards` y UI compartida de rewards.
- Nuevas pantallas deben reutilizar `ScreenScaffold`, `ScreenBackground`, `GameBackNav`, iconos compartidos y reward tokens.
- Nuevos campos persistentes requieren defaults de migracion en el store.
