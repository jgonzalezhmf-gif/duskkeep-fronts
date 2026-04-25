# Screen Audit and Roadmap

Fecha de auditoria: 2026-04-24

Documento relacionado:
- `docs/GAME_ARCHITECTURE_AND_VISUAL_SYSTEM.md` define el mapa global de pantallas, navegacion, assets reutilizables, componentes compartidos y reglas visuales comunes. Este roadmap debe leerse como plan operativo de ese documento.

Referencia de calidad actual:
- Home: pantalla avanzada en dirección visual, hub full-screen y mundo más reconocible.
- Combat: Duskkeep Fronts es la base jugable/visual actual, con standees, cartas, frentes, enemigos y assets preparados.

Objetivo de las siguientes iteraciones:
- Subir el resto de pantallas al nivel de Home/Combat.
- Eliminar dependencias obsoletas del combate antiguo.
- Mantener el alpha jugable durante la migración.

## Resumen Ejecutivo

Pantallas recuperables con retoque fuerte:
- Deck
- Fortress
- Shop
- Adventure map

Pantallas que necesitan rediseño profundo o migración funcional:
- Events
- Heroes/Roster
- Missions/Quests

Pantallas claramente legacy:
- Events normal battle flow
- Parte de Adventure data model, aunque la ruta ya se ha integrado con Frontline.

## Adventure

Estado actual:
- El mapa `/adventure` es visualmente una de las pantallas secundarias más trabajadas.
- La ruta `/adventure/[levelId]` ya fue sustituida para abrir Duskkeep Fronts en vez del combate viejo.
- El mapa ahora muestra squads Frontline derivados mediante `features/frontline/adventure.ts`.
- `data/adventure.ts` sigue usando `enemyTeam` legacy con héroes antiguos.

Recuperable o rediseño:
- Recuperable.
- Necesita migración de datos, no rediseño visual completo.

Tareas:
- Sustituir `enemyTeam` legacy por `frontlinePresetId`, `enemySquadId` o `enemyTierBand`.
- Crear presets concretos para cada fase: tutorial, early, mid, late, boss.
- Añadir bosses Frontline con reglas simples.
- Mejorar el precombate de Adventure para mostrar mejor cartas, enemigos y recompensa.
- Añadir estado de ruta: first clear, replay payout, boss locked, tier recomendado.

Plan:
1. Migrar datos de campaña a `frontlinePresetId`.
2. Crear 8-12 presets enemigos escalonados.
3. Añadir boss presets especiales.
4. Rehacer panel lateral del mapa para mostrar squad enemigo real con standees.
5. Validar first clear y rewards end-to-end.

Punto importante:
- Adventure debe ser el modo principal de entrada a Frontline durante las primeras horas.

## Deck

Estado actual:
- Ya está alineado funcionalmente con Frontline: leader, 3 héroes, 8 cartas.
- Se siente más "builder" que antes, pero todavía parece herramienta de configuración.
- Usa retratos antiguos en varias zonas y no aprovecha del todo los standees nuevos.

Recuperable o rediseño:
- Recuperable con pasada visual/UX fuerte.

Tareas:
- Convertir el trío de héroes en escena de squad, no lista de slots.
- Usar standees `frontlineVisualAssets` para los héroes.
- Convertir cartas del pool en cartas full-art compactas, consistentes con Combat.
- Separar mejor: squad, plan, paquete de cartas, curva de Command.
- Mostrar sinergias simples: burst, sustain, breach, summon, stun.
- Preparar tiers de héroes sin implementarlos todavía.

Plan:
1. Reutilizar componentes visuales de FrontlineBattle para cartas/standees.
2. Reducir copy y reforzar build fantasy.
3. Añadir resumen de plan automático más visual.
4. Añadir validaciones claras de deck listo.

Punto importante:
- Deck debe ser la pantalla donde el jugador siente que está construyendo una estrategia, no rellenando un formulario.

## Heroes / Roster

Estado actual:
- `/roster` ya fue migrado a una galeria visual con `FrontlineHeroStandee`.
- `HeroDetailModal` ya usa la misma familia visual, separando perfil Frontline/reserve y progreso.
- `features/frontline/heroProfile.ts` crea un mapping visual para renderizar heroes legacy como perfiles Frontline provisionales.
- Todavia no existe sistema real de tiers por personaje ni assets por tier.

Recuperable o rediseño:
- Recuperable. La base visual ya esta alineada con Deck/Combat.
- Lo pendiente es profundidad de progresion/tier, no rehacer la pantalla completa.

Tareas:
- Redefinir Heroes como colección de personajes evolucionables.
- Integrar tiers futuros: apariencia, habilidad, stat identity.
- Mostrar cada héroe con standee, rol Frontline y evolución.
- Separar stats legacy de stats Frontline o crear una vista compatible.
- Convertir HeroDetailModal en ficha de progression fantasy.

Plan:
1. Sustituir assets placeholder por imagenes/tier art segun existan.
2. Definir datos reales de tier por heroe: apariencia, habilidad, stat identity.
3. Conectar CTA con Deck para asignar heroe al squad.
4. Conectar Shop/shards/materiales cuando exista economia de tier.

Punto importante:
- Esta pantalla será clave para monetización/progresión futura. No conviene dejarla como galería técnica.

## Missions / Quests

Estado actual:
- `/missions` ya fue rehecha como `Command Log` visual.
- Las misiones se muestran como contratos con icono, fuente, progreso, recompensa visual y CTA al modo que las progresa.
- Sigue usando los datos/store actuales de misiones diarias/semanales.

Recuperable o rediseño:
- Recuperable. La base visual ya esta alineada con el nuevo tono.
- Lo pendiente es reward feel avanzado y objetivos mas conectados a Fortress/Shop/Frontline.

Tareas:
- Cambiar de lista de tareas a tablero de encargos.
- Agrupar misiones por fuente: Adventure, Combat, Fortress, Shop, Arena.
- Añadir reward feel mejor para claim.
- Reducir texto y hacer progreso más visual.
- Mostrar "qué hago ahora" y CTA directo a pantalla relevante.

Plan:
1. Mantener `data/missions.ts` y store.
2. Añadir reward reveal especifico al reclamar.
3. Añadir misiones nuevas conectadas a Fortress, Deck y Frontline.
4. Evaluar reducir/renombrar copy de misiones cuando se amplie contenido.

Punto importante:
- Quests deben empujar loop diario y rutas de juego, no ser solo checklist.

## Events

Estado actual:
- `/events` ya fue migrada a Duskkeep Fronts en MVP.
- Usa operaciones con presets enemigos Frontline, rewards diarios, estado de clear diario y post-battle propio.
- El contenido de Tower Defense queda representado provisionalmente como una operacion `Siege Event` con preset Frontline pesado.
- La pantalla ya usa Home nav y recursos compartidos, sin dock inferior ni HUD legacy.

Recuperable o rediseño:
- Recuperable.
- Ya no necesita migracion funcional base; necesita mutadores reales, reward feel y decision final sobre TowerDefense.

Tareas:
- Crear eventos con mutadores Frontline reales: +1 Command, supports extra, enemigos especificos, core alterado.
- Extraer operaciones a `data/frontlineEvents.ts` si crece el contenido.
- Decidir que hacer con TowerDefense legacy:
  - Mantener como modo especial futuro.
  - O archivar y sustituir por raids automaticos de Fortress.
- Usar enemigos nuevos/tiered enemies.
- Mejorar reward feel de evento.

Plan:
1. Mantener el flujo actual con `FrontlineBattle`.
2. Extraer datos de operaciones si se superan los 3 eventos hardcoded/derivados.
3. Implementar mutadores MVP.
4. Añadir reward reveal especifico de Events.
5. Decidir si TowerDefense se borra, se oculta o se convierte en evento especial futuro.

Punto importante:
- Events ya no lanza `TacticalBattle` en el flujo visible. El riesgo ahora es que se quede como selector de presets sin identidad propia.

## Arena

Estado actual:
- `/arena` ya fue migrada a Duskkeep Fronts.
- Usa seleccion de 3 rivales IA con `FrontlinePreset`, tickets, wins/losses y rewards.
- La batalla se abre con `FrontlineBattle` embebido y mantiene el loop post-battle de victoria/derrota.
- Visualmente esta alineada con la familia `ScreenScaffold`, `GameIcon` y `FrontlineHeroStandee`, aunque aun es MVP de ladder.

Recuperable o rediseño:
- Recuperable.
- Ya no necesita migracion funcional base; necesita profundidad de ladder, matchmaking y mejor progression fantasy.

Tareas:
- Extraer rivales a `data/frontlineArenaOpponents.ts` si crece el contenido.
- Añadir tiers/rangos: Bronze, Silver, Gold, Elite.
- Añadir barra de progreso/rating y streak bonus.
- Crear mas rivales por banda de poder usando enemigos tiered.
- Mejorar post-battle de Arena con avance de rango y reward reveal propio.

Plan:
1. Mantener la base actual embebida en `FrontlineBattle`.
2. Extraer datos de rivales si se superan los 3 rivales hardcoded.
3. Añadir rank/progress bar.
4. Añadir matchmaking por banda de poder.
5. Añadir reward reveal especifico de Arena.

Punto importante:
- Arena ya no es legacy funcional. El riesgo ahora es que se quede como selector simple sin identidad de ladder.

## Shop

Estado actual:
- `/shop` es una de las pantallas secundarias más trabajadas visualmente.
- Tiene storefront, categorías, ofertas y buena presentación.
- Funcionalmente sigue vendiendo recursos/shards/boosts legacy.
- No está conectada a cartas Frontline, tiers de héroes ni packs de enemigos/eventos.

Recuperable o rediseño:
- Recuperable.
- Necesita actualización de contenido/economía.

Tareas:
- Añadir productos relacionados con Frontline:
  - card packs
  - hero shards
  - tier materials
  - cosmetics/standees futuros
  - Fortress repair/boost suaves
- Reordenar categorías para el nuevo producto.
- Evitar vender poder que rompa early game.
- Añadir preview visual de cartas/héroes usando assets nuevos.

Plan:
1. Auditar `data/shop.ts`.
2. Crear ofertas MVP Frontline.
3. Sustituir o marcar legacy boosts.
4. Añadir previews visuales de reward.

Punto importante:
- Shop visualmente está bastante cerca, pero su contenido debe seguir al nuevo combate.

Actualizacion 2026-04-25:
- Catalogo MVP ya alineado con Frontline/Fortress/Arena y los seis heroes actuales.
- Las ofertas legacy de Sol/Noct/Lyria fueron sustituidas por caches, supplies, hero shards y training kits coherentes con el producto actual.
- `previewCards` y `previewHeroes` permiten mostrar cartas/heroes Frontline sin inventar recompensas que el sistema todavia no soporta.
- Pendiente: inventario real de cartas, cosmetics, tier materials y reward reveal especifico de compra.

## Fortress

Estado actual:
- `/fortress` ya está en la capa Frontline MVP.
- Usa Keep/Treasury/Barracks, garrison, integrity, raid forecast y rewards.
- Es coherente con la idea meta de defensa automática.
- La presentacion ya fue pasada a escena de castillo: edificios clicables, castillo central, raid watch, garrison con standees y recursos compartidos.

Recuperable o rediseño:
- Recuperable.
- Ya no necesita rehacer la base visual; necesita profundidad de loop, reward reveal y conexion economica.

Tareas:
- Añadir reward reveal mas fuerte al resolver raid.
- Añadir reparación/deterioro suave si hace falta.
- Conectar mas claramente con Adventure y Shop.
- Revisar si los edificios necesitan mas estados visuales por nivel.

Plan:
1. Mantener lógica actual.
2. Mantener presentacion como castillo interactivo.
3. Añadir log/reward reveal de raids.
4. Expandir edificios solo después de validar economía.

Punto importante:
- No convertir Fortress en combate manual. Su identidad es meta, defensa automática y payout periódico.

## Team

Estado actual:
- `/team` ya fue reconvertida en una vista de resumen del squad Frontline.
- Usa `frontlineLoadout`, `FrontlineHeroStandee`, `FrontlineCardView`, `GameBackNav` y `GameIcon`.
- No edita directamente el equipo: delega cambios reales a `/deck` y consulta de heroes a `/roster`.

Recuperable o rediseño:
- Recuperable como pantalla ligera de revision.
- No debe volver a duplicar el builder de Deck.

Tareas:
- Decidir si el producto la llama `Team`, `Squad`, `Command` o si se fusiona con Deck mas adelante.
- Ajustar Home/nav si se renombra.
- Añadir comparativa ligera de build solo si aporta valor sin duplicar Deck.

Plan:
1. Mantenerla como resumen read-only mientras Deck sea el builder.
2. Revisar copy y naming global cuando se cierre el mapa de navegacion.
3. Si se elimina, redirigir a `/deck` sin perder el acceso rapido desde Home.

Punto importante:
- Team ya no es legacy funcional. El riesgo ahora es duplicar decisiones de Deck si se le añade demasiada edicion.

## Home

Estado actual:
- Es referencia visual actual del producto.
- Full-screen hub, landmarks, hotspots y CTA ya avanzados.

Recuperable o rediseño:
- Mantener.
- Solo futuras iteraciones de polish.

Tareas:
- Ajustar accesos si se oculta Team o se renombra Deck/Heroes.
- Asegurar que Adventure, Deck, Fortress y Combat apunten a los sistemas nuevos.

Plan:
1. No tocar hasta migrar pantallas.
2. Volver para coherencia de navegación final.

## Combat

Estado actual:
- Referencia jugable actual.
- Alpha aceptable y aparcada temporalmente.

Recuperable o rediseño:
- Mantener.
- No reabrir reescritura hasta terminar migración de modos.

Tareas futuras:
- Más enemigos por tier.
- Bosses.
- Más cartas de jugador.
- Gear/relics.
- Mejor AI.
- Más reward feel.
- Validación móvil final.

Plan:
1. Congelar núcleo.
2. Migrar modos alrededor.
3. Volver a profundidad una vez Deck/Adventure/Arena/Events estén alineados.

## Orden de Iteración Recomendado

1. Adventure data migration.
2. Deck visual/build fantasy pass.
3. Arena ladder depth and rank progression.
4. Events mutators and reward depth.
5. Heroes/Roster redesign with tiers.
6. Shop content alignment with Frontline.
7. Fortress visual pass.
8. Missions/Quests command board.
9. Team naming/nav decision.

## Riesgos

- Mantener varios motores activos aumenta bugs y coste mental.
- Migrar Arena/Events sin preservar rewards puede romper progreso.
- Cambiar `data/adventure.ts` sin helper intermedio puede romper mapa y first clear.
- Héroes con tiers futuros necesitan diseño de datos antes de añadir muchas imágenes.
- Shop debe esperar a tener economía de cartas/tiers más clara.
