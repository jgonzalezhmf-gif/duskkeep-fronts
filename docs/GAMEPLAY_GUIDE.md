# Guia de Gameplay de Duskkeep Fronts

Esta guia explica el loop jugable del alpha y como deberia entender el juego un jugador nuevo.

## Fantasia Principal

Duskkeep Fronts es un juego tactico de fantasia oscura sobre construir un escuadron de frontline, avanzar por un mapa de campania, ganar combates cortos basados en cartas y mejorar la cuenta entre partidas.

## Loop Principal

1. Empezar en Home.
2. Entrar en Adventure y elegir un nodo disponible.
3. Revisar el briefing de mision.
4. Iniciar combate.
5. Ganar o perder un combate tactico de tres frentes.
6. Reclamar recompensas.
7. Mejorar heroes, cartas, fortress o recursos.
8. Volver a Adventure y avanzar mas lejos.

## Home

Home es el hub principal. Debe tratarse como pantalla de navegacion y estado global.

Sirve para:

- Continuar Adventure.
- Entrar en Deck, Team, Heroes, Shop, Fortress, Missions, Arena y Events.
- Consultar progreso general de cuenta.

## Adventure

Adventure es la campania principal.

Comportamiento actual:

- Chapter 1 es el capitulo jugable activo.
- Chapter 2 es visible pero bloqueado para el alcance demo actual.
- Los nodos pueden ser combates, elites, bosses, cofres o futuros tipos de interaccion.
- El marcador del grupo muestra la progresion actual.
- Los key chests pueden requerir Adventure Keys y reiniciarse por ciclo.

Expectativas de nodos:

- Los nodos battle inician combate Frontline normal.
- Los nodos elite deben sentirse mas dificiles y dar mejores recompensas de primera victoria.
- Los nodos boss cierran hitos importantes de progresion.
- Los cofres/interacciones no deben iniciar combate.
- Los nodos bloqueados no se pueden jugar.

## Frontline Combat

Duskkeep Fronts Combat usa:

- Tres lanes/frentes.
- Vida de core aliado y enemigo.
- Command como recurso de batalla.
- Cartas para orders, tactics, summons y otros efectos.
- Resolucion de choque entre frentes.

El objetivo es destruir el core enemigo antes de que caiga el core aliado.

## Deck

Deck es donde el jugador prepara el loadout Frontline.

Sirve para:

- Elegir lider.
- Asignar tres heroes.
- Construir un paquete de ocho cartas.
- Mejorar cartas cuando la progresion lo permite.

Los cambios de Deck deben afectar a preparacion de combate, no a valores ocultos de economia.

## Team / Heroes

Team muestra el squad actual y el paquete de combate como revision rapida.

Heroes/Roster muestra la coleccion completa:

- Heroes obtenidos.
- Heroes bloqueados.
- Roles, rareza y progresion.
- Modal de detalle de heroe.

Trabajo futuro: profundizar tiers, evolucion y uso de shards.

## Fortress

Fortress es la capa de gestion.

Comportamiento actual:

- Mejorar edificios.
- Asignar garrison.
- Resolver raids.
- Recoger recompensas defensivas.

Debe sentirse como mantenimiento estrategico, no como una hoja de calculo de economia.

## Shop

Shop proporciona ofertas de recursos y futuros productos de progresion.

Regla importante:

- La UI de Shop puede previsualizar y comprar ofertas, pero flujos premium o pagados futuros deben validarse con backend.

## Missions

Missions guia actividad diaria y semanal.

Debe:

- Dirigir al jugador hacia acciones utiles.
- Mostrar progreso de forma clara.
- Usar feedback de recompensas al reclamar.

## Arena y Events

Arena y Events son modos secundarios basados en Frontline.

Alcance actual:

- Arena usa tickets y presets de oponentes.
- Events usa presets de operaciones y reglas de recompensa diaria.

Alcance futuro:

- Ladder de Arena.
- Modificadores de evento.
- Mejores revelados de recompensas y timing de rotacion.

## Reglas de Guia al Jugador

- Los CTAs importantes deben ser visibles sin scroll largo.
- El estado de recompensa debe ser claro: primera victoria, repeticion, reclamada, bloqueada o lista.
- El texto debe explicar decisiones, no repetir lo que ya comunican iconos y estado.
- La identidad visual debe mantenerse como fantasia oscura y con sensacion de videojuego en todas las pantallas.
