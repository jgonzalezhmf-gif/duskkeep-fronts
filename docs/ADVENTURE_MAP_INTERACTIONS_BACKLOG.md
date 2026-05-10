# Backlog de Interacciones del Mapa Adventure

Notas para mecanicas del mapa Adventure posteriores al alcance demo. Estas ideas no forman parte del bloqueo actual de la demo salvo que se indique lo contrario.

## Alcance Demo

- Chapter 2 permanece visible en el listado de capitulos, pero bloqueado hasta que existan fondo, musica, layout y ritmo de encuentros.
- Completar el boss de Chapter 1 debe marcar el progreso de Chapter 1 como completado sin redirigir a Chapter 2.

## Rutas Ramificadas

- Un nodo puede desbloquear varios objetivos mediante `unlocks` en los datos de Adventure o `connectsTo` en el layout QA del mapa.
- El primer ejemplo de bifurcacion en Chapter 1 es `c1l2 -> c1l3, c1l7`.
- Las bifurcaciones futuras deben mantener dificultad comparable entre rutas paralelas y converger despues en gates elite, event o boss.

## Interactuables Futuros

- Cofre de mapa: usar el cofre visible cerca del camino inferior derecho como cache interactuable cuando se cumplan condiciones.
- Llaves: rewards opcionales de combates, ofertas de Shop o Events pueden abrir caches especiales del mapa.
- Caches temporizadas: caches diarias o por progreso de capitulo pueden pulsar cuando sean reclamables, pero no deben convertirse en farmeo infinito.
- Nodos ocultos: mecanismos, objetos de lore o victorias elite pueden revelar nodos secretos o caches ocultas.
- Fragmentos de lore: nodos sin combate pueden desbloquear documentos breves del mundo en lugar de recompensas.
- Combates especiales: nodos activados pueden generar encuentros danger/elite sin cambiar la ruta base.

## Reglas Visuales

- Los interactuables deben vivir en el mismo sistema de coordenadas 1920x1080 del mapa Adventure.
- Los objetos reclamables pueden usar efectos pequenos y localizados de sprite/luz, no glows genericos grandes.
- Todos los interactuables futuros deben poder editarse y exportarse desde `?qa=adventure-map`.
