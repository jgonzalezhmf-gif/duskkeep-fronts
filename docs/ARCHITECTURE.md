# Arquitectura de Duskkeep Fronts

Este documento describe la arquitectura actual del alpha y las reglas que mantienen el codigo mantenible mientras el juego crece.

## Objetivos

- Mantener jugable la vertical slice mientras evolucionan los sistemas.
- Mantener las reglas de gameplay fuera de componentes de presentacion.
- Mantener assets visuales detras de manifests y fallbacks seguros.
- Mantener funcionando la persistencia local hasta introducir backend online.
- Hacer que el codigo sea facil de auditar, probar y extender.

## Stack

- Next.js App Router para rutas y composicion de pantallas.
- React client components para pantallas interactivas de juego.
- TypeScript para modelos de dominio y seguridad de tipos.
- Tailwind CSS para UI responsive de juego.
- Zustand persist para estado local del alpha.
- Vitest para tests deterministas de gameplay y rewards.
- Supabase SDK y schema skeleton para la futura pasada de persistencia online.

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
- `features/battle` y `features/tactical`: sistemas legacy/prototipo que no deben crecer salvo reactivacion explicita.

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

`lib/store.ts` sigue siendo un orquestador amplio. Las nuevas reglas deben extraerse a helpers de feature cuando no sean simples transiciones de estado.

## Flujo de Datos

1. El contenido estatico se define en `data/*` y archivos especificos de feature.
2. Los helpers de feature derivan estado de gameplay, rewards, desbloqueos y resumenes para UI.
3. `lib/store.ts` persiste el estado del jugador y llama helpers de feature para mutar progreso.
4. Las rutas en `app/*` seleccionan estado y componen pantallas.
5. Los componentes renderizan estado visual con assets compartidos y fallbacks.

## Estrategia de Persistencia

Alpha actual:

- Zustand persist escribe en `localStorage`.
- El juego prioriza funcionamiento offline y funciona sin servidor.
- `supabase/schema.sql` y `lib/persistence.ts` preparan la direccion backend futura.

Modo online futuro:

- El estado de cliente sera cache, no autoridad.
- Funciones de servidor validaran acciones sensibles de economia.
- Resultados de batalla, rewards, compras y ladder deben verificarse antes de persistir.

## Principios de Calidad

- Responsabilidad unica: separar reglas, datos y presentacion.
- Abierto/cerrado: anadir nuevas cartas, nodos, rewards y assets mediante registros y manifests.
- Inversion de dependencias: la UI depende de helpers tipados e interfaces, no de storage o backend raw.
- Determinismo: combate y rewards deben poder probarse con seeds estables cuando aplique.
- Fallbacks seguros: los assets opcionales deben degradar sin 404.

## Riesgos Tecnicos Actuales

- `lib/store.ts` es potente pero demasiado amplio; seguir extrayendo helpers de dominio.
- Todavia existen sistemas legacy que deben aislarse del flujo principal Frontline.
- La persistencia online aun no es autoritativa; no tratar recursos del cliente como seguros.
- La app es visualmente rica, por lo que smoke tests en navegador y validacion de assets importan antes de release.

## Reglas de Extension

- Nuevas reglas de gameplay van en `features/*`.
- Nuevos assets visuales pasan por manifests antes de usarse en UI.
- Nuevos rewards deben usar helpers `Rewards` y UI compartida de rewards.
- Nuevas pantallas deben reutilizar `ScreenScaffold`, `ScreenBackground`, `GameBackNav`, iconos compartidos y reward tokens.
- Nuevos campos persistentes requieren defaults de migracion en el store.
