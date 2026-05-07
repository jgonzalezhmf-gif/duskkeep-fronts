# Changelog

Todas las iteraciones relevantes del alpha deben quedar registradas aqui.

Formato basado en Keep a Changelog y versionado semantico pragmatico:
- `MAJOR`: cambios incompatibles de arquitectura, persistencia, gameplay core o direccion de producto.
- `MINOR`: nuevas pantallas, sistemas, integraciones jugables, pipelines visuales o cambios perceptibles de UX.
- `PATCH`: fixes, ajustes visuales pequenos, documentacion, tests o mantenimiento sin cambio funcional grande.

## [0.25.9] - 2026-05-07

### Changed
- Extraidos tipos, perfiles de mezcla, claves de preferencias y helpers puros de audio a `lib/audio-runtime`.
- Reducido `lib/audio.ts` para que concentre menos configuracion global y mantenga el runtime de reproduccion como responsabilidad principal.
- Mantenido el comportamiento de musica, SFX, preferencias y fallback procedural sin cambios funcionales.

### Tested
- `npm.cmd run check:full`

## [0.25.8] - 2026-05-07

### Changed
- Extraido el panel de cache interactuable de Adventure a `AdventureMapInteractionPanel`.
- Extraido el overlay de reveal de recompensas a `AdventureCacheRevealOverlay`.
- Reducido `AdventureMissionPanels` a la composicion del panel de mision del nodo seleccionado, sin cambios de gameplay, rewards, progreso ni coordenadas del mapa.

### Tested
- `npm.cmd run check:full`

## [0.25.7] - 2026-05-07

### Changed
- Extraidos los helpers de `AdventureMissionPanels` a `AdventureMissionPanelParts`: labels, CTAs, mission facts, badge de nodo, filas de enemigos y reward chips.
- `AdventureMissionPanels` queda centrado en componer los paneles de mision, cache interactuable y reveal de recompensas.
- Mantenido el comportamiento de Adventure sin cambios de gameplay, progreso, rewards ni layout del mapa.

### Tested
- `npm.cmd run check`
- `npm.cmd run typecheck`
- `npm.cmd run test`
- `npm.cmd run build`

## [0.25.6] - 2026-05-07

### Changed
- Extraida la logica de estado de `/adventure` a `useAdventureMapPageState`: progreso, seleccion, claims, interaction states, reveals, CTA de nodo y cache interactuable.
- Movidos los metadatos/localizacion de capitulos a `AdventureChapterMeta` para separar configuracion de render.
- Reducida la pagina `/adventure` a composicion de mapa, placa de capitulos y mission card.

### Tested
- `npm.cmd run check`
- `npm.cmd run typecheck`
- `npm.cmd run test`
- `npm.cmd run build`

## [0.25.5] - 2026-05-07

### Changed
- Extraida la logica de estado de Adventure map a `useAdventureCampaignMapState`: modo QA, layout local, seleccion, drag, shortcuts, creacion/duplicado/borrado y guardado del editor.
- `AdventureCampaignScene` queda como componente de composicion visual del canvas, usando el hook para datos derivados y acciones.
- Movida la derivacion de nodos visuales y rutas del mapa al hook para aislar mejor reglas de presentacion de JSX.

### Tested
- `npm.cmd run check`
- `npm.cmd run typecheck`
- `npm.cmd run test`
- `npm.cmd run build`

## [0.25.4] - 2026-05-07

### Changed
- Extraidos los renderers visuales de Adventure a `AdventureMapElements`: rutas, runas, nodos, party marker, props, handles de QA y estilos del key chest.
- `AdventureCampaignScene` queda reducido a orquestacion del canvas, estado QA, seleccion y construccion de nodos/rutas visuales.
- Reforzada la separacion entre herramientas QA, geometria compartida y elementos visuales del mapa.

### Tested
- `npm.cmd run check`
- `npm.cmd run typecheck`
- `npm.cmd run test`
- `npm.cmd run build`

## [0.25.3] - 2026-05-07

### Changed
- Extraido el editor QA de Adventure a `AdventureMapEditorOverlay` para separar herramientas de calibracion del renderer principal del mapa.
- Movida la geometria compartida de mapa/rutas/props a `AdventureMapGeometry`, evitando duplicar calculos entre escena y editor.
- Reducido `AdventureCampaignScene` a la responsabilidad de canvas, nodos, rutas, props y orquestacion del mapa.

### Tested
- `npm.cmd run check`
- `npm.cmd run typecheck`
- `npm.cmd run test`
- `npm.cmd run build`

## [0.25.2] - 2026-05-07

### Changed
- Separados los tipos compartidos de Adventure en `AdventureCampaignTypes` para reducir acoplamiento entre mapa, pagina y paneles.
- Extraidos los paneles de mision, cache interactuable y reveal de recompensa a `AdventureMissionPanels`, dejando `AdventureCampaignScene` centrado en mapa/editor/canvas.
- Eliminado codigo duplicado y helpers de rewards que ya no pertenecian al renderer principal del mapa.

### Tested
- `npm.cmd run check`
- `npm.cmd run typecheck`
- `npm.cmd run test`
- `npm.cmd run build`

## [0.25.1] - 2026-05-07

### Added
- `docs/ARCHITECTURE.md` con capas del repo, flujo de datos, boundaries y reglas de extension.
- `docs/GAMEPLAY_GUIDE.md` con guia del loop jugable, pantallas y expectativas de interaccion.
- `docs/QUALITY_AND_RELEASE.md` con checklist de release, comandos, rutas smoke y criterios de calidad.
- `docs/SECURITY_AND_BACKEND_ROADMAP.md` con roadmap de persistencia online, backend autoritativo y seguridad.

### Changed
- Actualizado `README.md` para enlazar la documentacion publica clave y priorizar checks/release.
- Reforzado `supabase/README.md` con notas de seguridad antes de activar persistencia online real.

### Tested
- `npm.cmd run check`
- `npm.cmd run test`
- `npm.cmd run build`
- `npm.cmd run screenshots:auto` genero capturas parciales en `tmp/playwright-screenshots/2026-05-07T15-27-04-796Z` antes de exceder timeout.

## [0.25.0] - 2026-05-07

### Added
- Frontline AI tactica variada (B1): nueva funcion `chooseEnemyAction` en `runEnemyTurn` con prioridades en cascada (execute en lane abierto, heal, stun al hero con mayor ATK, rally antes de carta de dano, summon en lane libre, fallback por coste).
- Sistema de sinergias (B2) con 7 entradas iniciales: Blade Strike Affinity, Archer's Focus, Shadow Strike, Bulwark Cohesion, Sanctified Healing, Howling Pack (forward) y Howling Pack Echo. Categorias: Affinity (carta + trait del target), Presence (carta + trait de un ally vivo) y Combo (carta + estado global).
- Eventos `signature: "synergy"` con `signatureId` para identificar la sinergia disparada.
- UI generica para sinergias: `SynergyProcBadge` (sobre el standee si tiene lane) y `SynergyGlobalToast` (banner central si la sinergia es global).
- `docs/FRONTLINE_SYNERGIES.md` con catalogo, integracion tecnica y guia para anadir sinergias nuevas.
- Tests para AI variada (3) y para cada sinergia (8) en `tests/frontline.engine.test.ts`.

### Changed
- `FRONTLINE_COMBAT_HANDOFF.md` referencia el nuevo doc de sinergias.
- Sanctuary aplica spread heal con target `mend` (healer), no con `bulwark`. Battle Hymn aplica el bonus de presencia con `bulwark` (en lugar del antiguo `chant`).
- `FrontlineEvent.signature` admite `"synergy"`.

### Fixed
- `TraitProcBadge` ya no usa `Date.now()` durante render (regla de pureza de React).

### Tested
- `npm.cmd run check`
- `npm.cmd run test` (114/114).

## [0.24.13] - 2026-05-07

### Added
- Registrado `heroes_bg.png` en el manifest compartido de backgrounds como fondo de Heroes/Team.

### Changed
- Integrado `heroes_bg.png` como fondo principal de `/team` mediante `ScreenScaffold`.
- Integrado `heroes_bg.png` como fondo principal de `/roster` con fallback al backdrop legacy.
- Anadidas capas tonales y overlay suave/medio para mantener legibles cards, filtros y header.

### Tested
- `npm.cmd run check`
- `npm.cmd run build`

## [0.24.12] - 2026-05-07

### Changed
- Convertido el key chest de Adventure en un cofre recargable con ciclo de 8 horas tras cada apertura.
- El estado del cofre vuelve automaticamente a `needs_key` o `ready` cuando expira el ciclo, segun las llaves disponibles.
- Anadido texto de tiempo restante en la mission card cuando el cofre esta reclamado.
- Anadido un refresco ligero de estado en Adventure para que el cofre se reactive sin requerir recargar la pantalla.

### Tested
- `npm.cmd run typecheck`
- `npm.cmd run test -- tests/adventure.mapInteractions.test.ts tests/rewards.test.ts`

## [0.24.11] - 2026-05-07

### Changed
- Ampliado ligeramente el brillo claimable del key chest para que sobresalga mas alrededor del cofre.
- Acelerada la animacion del brillo del cofre a `0.65s` manteniendo frames en ventana fija.

### Tested
- `npm.cmd run typecheck`

## [0.24.10] - 2026-05-06

### Changed
- Ampliado el brillo claimable del key chest para que sobresalga mas por los bordes sin mover el spritesheet.
- Acelerada la reproduccion de frames del brillo de cofre manteniendo la ventana fija por frame.
- Anadida respiracion sutil al PNG del cofre, separada del brillo, para dar vida sin reintroducir bamboleo lateral.

### Tested
- `npm.cmd run typecheck`

## [0.24.9] - 2026-05-06

### Fixed
- Regenerado el brillo del cofre claimable como `gold_shine_loop_core_aligned.png`, alineando los frames por centro luminoso para reducir el bamboleo residual del asset.
- Cambiado el render del brillo a frames animados por opacidad en una ventana fija, sin `translateX` animado, sin mostrar la tira completa y sin escala del contenedor.

### Tested
- `npm.cmd run typecheck`

## [0.24.8] - 2026-05-06

### Fixed
- Cambiado el brillo del cofre claimable a frames apilados con opacidad para eliminar cualquier movimiento lateral del spritesheet.
- Eliminado el `translateX` animado del brillo de cofre; cada frame queda fijo en la misma ventana visual.

### Tested
- `npm.cmd run typecheck`

## [0.24.7] - 2026-05-06

### Fixed
- Normalizado `gold_shine_loop` para que el brillo del cofre use frames centrados y no baile lateralmente.
- Corregido el `frameCount` real del brillo de cofre a 5 frames visibles y ajustado el desplazamiento interno del spritesheet.

### Tested
- `npm.cmd run typecheck`

## [0.24.6] - 2026-05-06

### Changed
- Ampliado el brillo del cofre claimable para que salga por los bordes del PNG en vez de quedar tapado por el cofre.
- Eliminado el marco de seleccion del cofre en Adventure normal.
- Anadida respiracion sutil de escala/brillo al cofre claimable para hacerlo mas accionable sin animar el mapa completo.

### Tested
- `npm.cmd run typecheck`

## [0.24.5] - 2026-05-06

### Added
- Registrado `gold_shine_loop.png` como efecto de interaccion de Adventure y aplicado solo al cofre listo para abrir, con ventana de frames fija y opacidad controlada.
- Ampliados tests de cofres/llaves para cubrir fuentes first-clear, replay sin llaves y oferta diaria `adventure_key_ring`.

### Changed
- Renombrada la oferta de llave de Shop a `adventure_key_ring` manteniendo coste de 45 gems, limite diario 1 y recompensa `{ adventureKeys: 1 }`.
- Reforzado el cofre claimable con brillo localizado sin particulas globales ni circulos genericos.

### Tested
- `npm.cmd run typecheck`
- `npm.cmd run test -- tests/adventure.mapInteractions.test.ts tests/rewards.test.ts`
- `npm.cmd run check`
- `npm.cmd run build`
- Validacion browser acotada en `/adventure`, `/shop` y `/?qa=adventure-map`.

## [0.24.4] - 2026-05-06

### Changed
- Eliminado el aro circular generico del cofre interactuable de Adventure en modo normal.
- Anadido realce localizado y pulso sutil al cofre cuando esta listo para abrirse, sin usar glow circular grande.

### Tested
- `npm.cmd run typecheck`

## [0.24.3] - 2026-05-06

### Fixed
- Corregida la plantilla del endpoint `Save to code` de `?qa=adventure-map` para no borrar `key_chest`, `interaction`, `rotationX/rotationY` ni `ADVENTURE_MAP_INTERACTION_KINDS`.
- Restaurada la config generada de Adventure tras un guardado incompleto del editor QA.

### Tested
- `npm.cmd run typecheck`

## [0.24.2] - 2026-05-06

### Fixed
- Blindado el editor `?qa=adventure-map` para que los selects no rompan si una config exportada pierde opciones.
- Restaurados los tipos/config de interaccion del cofre con llave tras exportar layout desde QA.
- Anadidos controles `rotate x`, `rotate y` y `rotate z` para inclinar props del mapa en 3D sin perder el giro plano.
- Reforzada la visibilidad del icono `adventure_key` en los previews de contenido de Shop.

### Tested
- `npm.cmd run typecheck`

## [0.24.1] - 2026-05-06

### Fixed
- Corregido el prop del cofre con llave de Adventure para que aparezca en `?qa=adventure-map` como `key_chest` en vez de estar oculto bajo un `hidden_glow`.
- Anadido `key_chest` al selector de nuevos props del editor QA, con interaccion de cofre de llave preparada por defecto.
- Mejorada la etiqueta del selector de props del editor para mostrar tipo e id del elemento.

### Tested
- `npm.cmd run typecheck`

## [0.24.0] - 2026-05-06

### Added
- Anadido loot ponderado para cofres de llave de Adventure con tiers `common` 50%, `rare` 30%, `epic` 15% y `legendary` 5%.
- Anadido reveal central de apertura del cofre con resultado oculto hasta reclamarlo y persistencia del lote obtenido.
- Anadida visualizacion condicional de `adventureKeys` en la barra de recursos solo en Adventure/Shop tras desbloquear la primera llave.
- Anadido soporte de rotacion en props del editor `?qa=adventure-map` para encajar cofres/interactuables sobre el arte del mapa.

### Changed
- Reposicionado y redimensionado el cofre interactuable de Chapter I para cubrir el cofre pintado abajo a la derecha del mapa.
- El panel del cofre ya no revela recompensas exactas antes de abrirlo; muestra probabilidades y el resultado despues de reclamar.
- Shop oculta la oferta de llave hasta que el sistema de llaves se desbloquea con `c1l2`.
- Limpiado `adventure_key.png` para eliminar el fondo gris del asset y usarlo como icono real de recurso/oferta.

### Tested
- `npm.cmd run typecheck`
- `npm.cmd run test -- tests/adventure.mapInteractions.test.ts tests/rewards.test.ts`

## [0.23.0] - 2026-05-06

### Added
- Anadido recurso persistente `adventureKeys` para abrir interactuables especiales del mapa de Adventure.
- Creado sistema `AdventureMapInteraction` con estados `locked`, `needs_key`, `ready` y `claimed`.
- Asociado el primer cofre interactuable del mapa (`c1-lower-cache`) a un prop editable de `?qa=adventure-map`.
- Anadido panel compacto de cofre de mapa con coste de llave, recompensa, estado y CTA de apertura sin lanzar combate.
- Ampliado el editor QA de Adventure para activar/desactivar interacciones en props y exportar `interaction` dentro del JSON.
- Anadida oferta diaria de Shop `Eclipse Cache Key` para comprar una llave de Adventure.
- Registrados assets visuales especificos para cofres con llave: locked, needs key, claimable y claimed, ademas de `adventure_key.png`.

### Changed
- Las primeras limpiezas de `c1l2`, `c1l5` y `c1l11` ahora entregan una llave de Adventure.
- Los rewards, bursts, previews de batalla y Shop reconocen `adventureKeys` sin cambiar reglas del engine ni recompensas existentes fuera de esos nodos.
- El cofre interactuable del mapa cambia de PNG segun estado y solo usa un realce localizado cuando esta listo para reclamar.
- Inicializado el estado tipado de usos por carta en la creacion de mazos Frontline para mantener `typecheck` en verde sin alterar reglas de combate.

### Tested
- `npm.cmd run test -- tests/adventure.mapInteractions.test.ts tests/rewards.test.ts`
- `npm.cmd run check`
- `npm.cmd run build`

## [0.22.0] - 2026-05-06

### Changed
- Bloqueado Chapter II de Adventure como contenido de demo: aparece en el selector de capitulos, pero no se puede seleccionar ni abrir por ruta directa.
- Cambiada la progresion visual de Adventure a desbloqueo por grafo de nodos, permitiendo que un nodo habilite varias ramas.
- Configurado `c1l2` para desbloquear tanto `c1l3` como `c1l7`, con ruta visible entre ambos caminos.
- Ampliado `?qa=adventure-map` con campo `connectsTo` para editar/exportar varios nodos destino desde un nodo.
- Documentado backlog de interactuables futuros del mapa: cofres, llaves, recompensas temporales, nodos ocultos, lore y combates especiales.

## [0.21.37] - 2026-05-06

### Changed
- Reajustada la composicion de cartas en Combat con arte completo en primer plano y fondo del mismo arte a sangre para llenar el marco sin perder imagen.
- Ensanchado el marco de cartas para aproximarlo mejor al ratio real de los PNG de cartas Frontline.
- Suavizados los bordes blancos de paneles, lanes, core, Focus e historial para que el fondo de batalla tenga mas protagonismo.
- Reducida la opacidad de fondos de secciones de Combat manteniendo legibilidad de acciones, vida, Command y estados.

## [0.21.36] - 2026-05-06

### Changed
- Ensanchadas ligeramente las cartas de mano en Combat para reducir recortes laterales manteniendo arte a sangre.
- Unificada la escala visual de iconos de cartas con una capsula fija y un unico icono de combate principal.
- Aumentada la presencia de iconos de escena en Combat: Command, ataque, estados/tipologia, centro de lane, Focus e historial.
- Reforzada la lectura numerica de ataque y recursos junto a iconos mas grandes sin tocar reglas de combate.

## [0.21.35] - 2026-05-06

### Changed
- Ajustadas las cartas de mano de Combat para que el arte cubra todo el marco y deje solo un borde estrecho de tipologia.
- Aumentado ligeramente el tamano de las cartas y de sus iconos de efecto/coste para mejorar lectura visual.
- Cambiado el boton de habilidad de lider a un tratamiento circular/medallon mas accionable y menos romboidal.
- Reforzada la visibilidad de iconos clave de Combat en Command, habilidad de lider, Resolve Clash y stats de combatiente.

## [0.21.34] - 2026-05-06

### Changed
- Reposicionado el coste de cartas en Combat al nivel raiz de cada carta para que quede realmente anclado arriba a la derecha.
- Reducido el ancho fijo de las cartas de mano y eliminado el estiramiento por columnas iguales para acercarlas a un formato mas vertical.
- Compactado el panel central superior de Combat, ocultando textos guia redundantes y dando mas presencia al boton de habilidad de lider.
- Evitado que el panel central se estire con la altura de los nucleos laterales para dejar mas escenario visible.

## [0.21.33] - 2026-05-06

### Changed
- Centrado y ampliado el layout visual de heroes/enemigos en Combat para que los standees ocupen mejor cada lane.
- Ajustadas las cartas de mano a un formato mas vertical, con coste arriba a la derecha y sin icono superior redundante.
- Cambiado el arte de cartas y retratos de nucleos a `object-contain` para evitar recortes fuertes y mostrar mejor la imagen completa.
- Cerradas sesiones de `agent-browser` tras la validacion para no dejar procesos Chrome consumiendo recursos.

## [0.21.32] - 2026-05-06

### Changed
- Redisenadas las cartas de mano en Combat como piezas full-art: coste e icono/efecto pasan a ser la lectura principal y se ocultan nombre, nivel y target redundante.
- Replanteados heroes y enemigos en lanes para dar mas protagonismo al standee, con nombre arriba, trait en esquina y vida bajo el personaje.
- Simplificados los nucleos de lider a retrato grande con nombre y vida debajo, eliminando labels redundantes de "nucleo".
- Aligerado el panel lateral Focus para mostrar menos ficha tecnica y dejar mas peso visual al campo de batalla.

## [0.21.31] - 2026-05-06

### Changed
- Eliminado el banner superior redundante en combates de boss para evitar duplicidad con el estado propio del boss.
- Compactado el banner de boss en una fila de senales visuales con iconos, contadores y tooltips en lugar de bloques largos de texto.
- Reducido texto visible en el flujo de accion, separadores de lane, panel Focus y cartas de mano, manteniendo informacion accesible mediante iconos, estados y textos ocultos/tooltip.

## [0.21.30] - 2026-05-06

### Changed
- Ampliado el contenedor de Combat para que use mas ancho y alto del viewport, acercandolo al tratamiento de pantallas inmersivas.
- Cambiado el fondo de batalla a una composicion de doble capa `cover` + `contain` para mantener visible la imagen completa sin bandas vacias duras.
- Reducido el padding exterior de la fase de batalla para que el escenario tenga mas protagonismo sin cambiar reglas ni datos.

## [0.21.29] - 2026-05-06

### Changed
- Reducida la densidad visual de overlays, lanes, core panels y hand container en Combat para dejar ver mejor los nuevos fondos de batalla.
- Suavizadas las bases, marcos y sombras de combatientes para que heroes y enemigos se integren mas con el escenario.
- Mantenida la legibilidad de lanes, core, hand y CTA sin tocar reglas de combate, economia ni rewards.

## [0.21.28] - 2026-05-06

### Changed
- Registrados fondos PNG de batalla Frontline por tipo de encuentro de Chapter 1 mediante manifest seguro.
- Integrado fondo de camino para combates normales, ruinas para elite/danger y Eclipse Gate para boss `the_eclipse`.
- Mantenido fallback al fondo legacy por seed cuando no exista mapping especifico de fondo.

## [0.21.27] - 2026-05-06

### Fixed
- Evitado que las batallas de boss arranquen primero el tema normal de Battle antes de cambiar al tema de Boss.
- Reforzado el gestor de audio para detener canales musicales HTML/procedurales residuales antes de reproducir una nueva pista MP3.
- Anadido registro interno de elementos de musica para limpiar pistas antiguas que pudieran quedar vivas tras cambios de pantalla o HMR.

## [0.21.26] - 2026-05-05

### Changed
- Registrados nuevos standees PNG para heroes de reserva Frontline en el manifest visual compartido.
- Mapeados los assets de Lyria, Morr, Ursa, Fenra, Sol y Noct a sus hero ids existentes sin cambiar stats, roles, desbloqueos ni progresion.
- Sustituidos placeholders visuales en vistas basadas en `FrontlineHeroStandee` cuando estos heroes aparecen en Roster o detalle.

## [0.21.25] - 2026-05-05

### Changed
- Registradas 12 nuevas card arts PNG de Frontline en el manifest visual compartido de cartas.
- Dejadas preparadas las artes `guard_break`, `quick_step`, `holy_ward`, `blood_pact`, `dark_bolt`, `iron_skin`, `piercing_shot`, `war_drums`, `soul_chain`, `frost_trap`, `rending_blow` y `last_stand` sin anadirlas al pool jugable.
- Verificado que Deck, Shop, Adventure y Battle siguen resolviendo las cartas existentes mediante el sistema de fallback seguro.

## [0.21.24] - 2026-05-05

### Changed
- Registrado `missions_bg.png` en el manifest compartido de fondos de pantalla.
- Integrado el nuevo fondo PNG en Missions/Rewards como base visual principal, manteniendo fallback al `SceneBackdrop` anterior.
- Ajustadas las capas de overlay de Missions para dejar visible el nuevo fondo sin perder legibilidad de contratos y recompensas.

## [0.21.23] - 2026-05-05

### Changed
- Oscurecido y limpiado el fondo de Missions/Rewards para reducir la sensacion de pantalla rota y acercarlo al tono dark fantasy del resto del juego.
- Compactado el hero de Command Log y priorizado el contrato principal para que recompensa, progreso y CTA entren antes en desktop.
- Reducida la altura de cards, métricas, rails y acciones de misiones diarias/semanales sin cambiar recompensas, progreso ni economia.
- Reforzada la presentacion visual de recompensas de Missions usando los tokens compartidos existentes y manteniendo el feedback de claim.

## [0.21.22] - 2026-05-05

### Changed
- Compactado el layout inicial de Events para que las operaciones activas aparezcan en el primer viewport junto al estado de escuadra.
- Reforzada la identidad de Events como tablero de operaciones Frontline con cards de operacion mas visibles y enemy lineup mas compacto.
- Compactado el layout inicial de Arena para que el selector de rivales aparezca antes y el gate de entrada no empuje la ladder hacia abajo.
- Anadida una placa compacta de rango/progreso en Arena sin tocar reglas, tickets ni rewards.

## [0.21.21] - 2026-05-04

### Changed
- Aumentado el tamano visual de los iconos de opciones y audio en el HUD para mejorar lectura en desktop.
- Oscurecido el badge de comandante del HUD inmersivo para evitar el fondo dorado fuerte en Adventure y acercarlo al tratamiento de Home.
- Actualizado el acceso rapido de Deck en pantallas sin dock para usar un marco dorado y un asset de cartas mas grande, evitando el formato azul anterior.
- Ajustado el chip de recompensa de cartas en Adventure para usar el asset directo de Deck en lugar de un marco generico.
- Unificado el badge de comandante de pantallas inmersivas con la composicion visual de Home.
- Redisenado el acceso rapido de Deck y el icono principal del mission card de Adventure para eliminar medallones legacy coloreados cuando ya existen PNGs especificos.

## [0.21.20] - 2026-05-04

### Changed
- Registrados los nuevos iconos PNG de Combat, UI, Team y progression en el manifest central sin rutas especulativas.
- Sustituidos los glyphs visibles de opciones, audio, team, clash/rewards y varios chips de progreso por wrappers/PNGs específicos.
- Anadido placeholder PNG de unidad Frontline para evitar glyphs genericos cuando falte standee o portrait.
- Ampliado el resolver de glyphs para reutilizar assets existentes en iconos genericos visibles sin provocar 404.

## [0.21.19] - 2026-05-04

### Changed
- Integrados portraits PNG dark medieval fantasy para Aurora Valeborn, Morrow Blackveil, comandantes enemigos y Crown of Ashes mediante un manifest seguro de líderes Frontline.
- Actualizados Home y Deck para resolver los portraits aliados nuevos desde el fallback compartido de líderes.
- Actualizados Adventure briefing, selección pre-combate y paneles de core de Combat para usar portraits enemigos por preset/boss sin reutilizar portraits aliados.
- Mantenidos fallbacks existentes para líderes legacy y mapeos inferidos para presets enemigos no registrados explícitamente.

## [0.21.18] - 2026-05-04

### Fixed
- Anadida salida de vuelta desde el pre-combate hacia Adventure cuando el combate viene del mapa, o hacia Home en combates directos.
- Anadidas acciones de salida en el resultado de combate para volver al mapa de Adventure y/o al Home sin depender de repetir combate.
- Corregido el party marker del mapa de Adventure para seguir el ultimo nodo completado o reclamado, en lugar de quedarse en una posicion fija del layout o saltar al siguiente nodo actual.
- Mantenida la posicion manual del party marker en `?qa=adventure-map`, sin afectar el comportamiento normal del mapa.

## [0.21.17] - 2026-05-04

### Fixed
- Corregida la direccion musical del pre-combate de Adventure para mantener el tema de Adventure en lugar de forzar musica de Battle.
- Evitado que el director global de rutas pise la musica que `BattlePageClient` gestiona por fase: setup, battle y result.
- Evitado el solape de MP3 al cambiar de tema: una pista final se detiene antes de iniciar la siguiente.
- Evitado reiniciar musica cuando dos pantallas usan el mismo MP3 registrado; el canal activo conserva su posicion y solo actualiza mezcla/tema.

## [0.21.16] - 2026-05-04

### Changed
- Promovidas las nuevas musicas generadas para Home, Adventure y Battle a los assets finales usados por el juego.
- Reutilizada la musica Battle anterior como nuevo tema `battle_boss`.
- Archivadas copias de seguridad de las musicas anteriores de Home, Adventure, Battle, Boss y Event en `public/assets/audio/music/archive/2026-05-04`.

## [0.21.15] - 2026-05-03

### Fixed
- Restauradas las musicas finales aprobadas de Home, Adventure y Battle desde el commit previo para no perder los temas existentes.
- Conservadas las nuevas generaciones de Home, Adventure y Battle como drafts locales en `_drafts` en lugar de reemplazar los assets finales.
- Protegido el script `audio:music` para generar drafts por defecto y exigir `--final`/`--approve-final` antes de sobrescribir una pista final.

## [0.21.14] - 2026-05-03

### Changed
- Regenerada la musica final de Home con una pieza mas larga, loopable, tranquila, misteriosa y dark medieval fantasy.
- Regenerada la musica final de Adventure con una pieza de campana mas larga, variada y preparada para bucle.
- Regenerada la musica final de Battle con una pieza mas extensa, de entrada inmediata, percusion potente, cuerdas tensas y secciones corales epicas.
- Actualizados los prompts del plan ElevenLabs para futuras regeneraciones coherentes con la nueva direccion sonora.

## [0.21.13] - 2026-05-03

### Added
- Anadida resolucion de tipos de nodo de Adventure en `features/adventure`: battle, elite, boss, chest y placeholders seguros para shrine/merchant/event/secret/danger.
- Anadidas politicas de repeticion para Adventure: battle/elite con replay reducido, boss como practice sin reward mayor y chest reclamable una sola vez.
- Anadida accion persistida `claimAdventureNode` para abrir cofres en el mapa sin lanzar Combat, entregar rewards existentes y marcar el nodo como `claimed`.
- Anadidos tests de dominio para cofre one-shot, replay reducido, politicas de elite/boss y separacion de nodos combatibles/reclamables.

### Changed
- La mission card de Adventure ahora cambia CTA y reward text por tipo real de nodo: `Start Adventure`, `Challenge Elite`, `Face Boss`, `Open Chest`, `Claimed` y `Locked`.
- El precombat de Adventure bloquea rutas directas a nodos no combatibles como cofres, evitando que un chest pueda iniciar Combat por URL.
- La preview/reward de Combat para Adventure usa las nuevas politicas de first-clear/replay sin repetir recompensas premium.

## [0.21.12] - 2026-05-02

### Changed
- Reducido el chrome persistente de Adventure: `Warpath Atlas` pasa a una placa compacta con selector desplegable de capitulos.
- Sustituido el panel lateral permanente por una mission card inferior compacta con `Start Adventure` siempre visible.
- Anadido estado expandido opcional para briefing de Adventure, con objetivo, terreno, recompensas y formacion enemiga solo bajo demanda.
- Ocultada la mission card durante `?qa=adventure-map` para mantener intacto el editor visual y evitar que tape herramientas.

## [0.21.11] - 2026-05-02

### Changed
- Eliminados los rings circulares dominantes de los nodos de Adventure para que los PNGs de nodos sean la identidad visual principal.
- Aumentada la presencia visual de nodos por tipo/estado sin tocar coordenadas manuales: current, boss, chest y available destacan mas; locked queda mas pequeno y apagado.
- Reforzada la ruta principal con trazos y runas mas continuos, manteniendo rutas y puntos de control existentes.
- Bajado el peso visual de props decorativos en modo normal para que no compitan con nodos ni current marker.

## [0.21.10] - 2026-05-02

### Changed
- Mejorada la jerarquia visual de Adventure sin tocar coordenadas manuales: nodos PNG mas legibles por estado/tipo, boss/chest/current con mayor presencia y locked mas apagados.
- Reforzada la lectura de rutas con trazos mas claros para rutas disponibles, boss route mas amenazante y locked casi invisible.
- Compactados header de capitulos y briefing lateral para que el mapa tenga mas protagonismo.
- Bajados props decorativos a segundo plano en modo normal, manteniendo su z-index editable intacto dentro de `?qa=adventure-map`.

## [0.21.9] - 2026-05-02

### Added
- Anadido manifest de assets de Adventure Map para nodos y props PNG usando rutas reales bajo `public/assets/adventures`, evitando requests a rutas no registradas.
- Integrados props decorativos de Adventure sobre el mapa: campamento, hoguera, linternas de camino, ruina, brillo oculto y carro mercante, con efectos opcionales relativos al prop.

### Changed
- Sustituidos los nodos circulares genericos de Adventure por PNGs dark fantasy cuando existe asset registrado, manteniendo fallback visual seguro.
- El marcador de party/current usa `current_marker.png` si esta disponible y conserva fallback CSS si no existe.
- Ampliado `?qa=adventure-map` para editar props con ancho/alto y efecto relativo, manteniendo crear, duplicar, borrar, guardar en codigo y export JSON.

## [0.21.8] - 2026-05-02

### Changed
- Reforzado el movimiento de nubes en Adventure para que el drift sea perceptible sin parecer ruido.
- Anadida una tercera bandada de cuervos desde el lado derecho con trayectoria, escala y timing distintos hacia el horizonte.

## [0.21.7] - 2026-05-02

### Added
- Anadida atmosfera de cielo en Adventure con capas de nubes oscuras usando profundidad lateral/fondo y bandadas de cuervos en diagonal hacia el horizonte.
- Reutilizados los assets registrados de atmosfera de Home para evitar nuevas rutas especulativas y mantener coherencia visual.

## [0.21.6] - 2026-05-02

### Fixed
- Corregida la seleccion de nodos en Adventure normal: la capa de layout superior ya no intercepta clicks sobre el mapa, manteniendo tabs y briefing interactivos.

## [0.21.5] - 2026-05-02

### Added
- Documentado como backlog obligatorio pre-monetizacion el `GameFixedStage` global con resolucion logica fija para el juego completo.
- Documentado como requisito obligatorio pre-monetizacion el backend autoritativo para economia sensible, compras, claims, inventario, recompensas y progreso.

## [0.21.4] - 2026-05-02

### Fixed
- Cambiado el mapa full-screen de Adventure a composicion `contain` 16:9 para ver `adventure_bg.png` completo y mantener nodos/props/rutas sobre el mismo frame visual.
- Bajado el panel del editor QA de Adventure y reducida su altura maxima para permitir arrastre vertical real, no solo horizontal.

## [0.21.3] - 2026-05-02

### Added
- Anadido guardado dev-only del editor `?qa=adventure-map` mediante `Save to code`, persistiendo el capitulo activo en `adventureMapLayout.ts`.
- Anadido `Save draft` explicito en el panel QA de Adventure para guardar la configuracion actual en `localStorage`.

## [0.21.2] - 2026-05-02

### Fixed
- Corregido el editor QA de Adventure para que los props de efectos rendericen los sprites reales de Home mediante `HomeEffectSprite`, en lugar de placeholders circulares.
- Mantenido el crosshair/caja del editor solo como overlay de seleccion, sin sustituir visualmente la llama, portal, cristal, vela, linterna, bandera, cuervo o nube.

## [0.21.1] - 2026-05-01

### Changed
- Alineado el editor QA de Adventure con el flujo de Home Effects: selector de elemento, panel arrastrable, crear prop, crear nodo QA, crear ruta, duplicar, eliminar, reset local y copia de elemento/layout.
- Ampliados los tipos de props disponibles en Adventure para cubrir los efectos usados en Home, incluyendo banderas, portal, cristal, cuervos y nubes como placeholders seguros sin requests opcionales.

## [0.21.0] - 2026-05-01

### Added
- Anadido editor QA de Adventure accesible con `?qa=adventure-map` o `?qa=map-editor` para mover nodos, props, party marker y controles de ruta sobre el canvas 1920x1080.
- Centralizada la configuracion visual del mapa en `adventureMapLayout`, con nodos, props, party marker y tipos preparados para futuras rutas/efectos.
- Anadida exportacion JSON desde el editor para nodos, rutas, props o layout completo, con persistencia temporal en `localStorage`.

### Changed
- El mapa normal de Adventure usa la configuracion centralizada sin mostrar controles QA ni ids de editor.
- Props decorativos de Adventure quedan preparados en el mismo sistema de coordenadas sin introducir requests a assets no registrados.

## [0.20.0] - 2026-05-01

### Changed
- Convertida Adventure en una escena full-screen de mapa vivo: `adventure_bg.png` pasa a ser el escenario principal en lugar de una imagen dentro de un panel.
- Reposicionados nodos, rutas y marcador de party sobre el canvas 1920x1080 para que se lean como camino de campana integrado.
- Compactados header, tabs de capitulo y briefing lateral para que el mapa tenga mas protagonismo sin cambiar reglas, progreso ni rewards.
- Reestilizados nodos y rutas hacia medallones/sellos dark fantasy con rutas mas discretas y menos lectura de prototipo.

### Fixed
- Corregido el descuadre de nodos causado por la clase global `frontline-motion-tab`, que forzaba `position: relative` y rompia el posicionamiento absoluto del mapa.

## [0.19.19] - 2026-05-01

### Changed
- Rehecha la presentacion visual de Adventure para usar `adventure_bg.png` como mapa jugable real con nodos, rutas y marcador de party sobre la escena.
- Sustituido el mapa interno prototipo por un canvas logico 1920x1080 con coordenadas compartidas para nodos, rutas, marcador y QA.
- Compactado el briefing derecho de Adventure manteniendo el CTA de inicio y la lectura de enemigos/recompensas sin cambiar reglas ni datos.

### Added
- Anadido modo `?qa=adventure-map` para leer coordenadas del canvas y exportar posiciones de nodos del mapa.

## [0.19.18] - 2026-05-01

### Changed
- Compactada Deck en responsive: Build Plan pasa a chips, Selected Package deja de usar rail alto con scroll interno y las cartas bloqueadas mantienen mejor lectura visual del arte.
- Compactada Fortress: escenario central mas bajo, Keep menos encajonado, Garrison en filas compactas y Castle Loop como resumen plegable.
- Compactada Events: header mas corto, Squad Status en chips, eventos en grid regular y cards locked con menos detalle secundario.

## [0.19.17] - 2026-05-01

### Changed
- Compactada la pantalla Market para priorizar categoria, oferta destacada, recompensa, precio y compra con menos copy explicativo.
- Compactada la pantalla Deck con header mas corto, squad/package mas ajustados y Card Pool visible antes en desktop.
- Compactada Fortress con garrison y paneles de raid/upgrade mas densos, manteniendo el fondo visible.
- Sustituido el Keep central vectorial de Fortress por el asset real de fortaleza registrado en Home, con fallback al dibujo anterior.

### Fixed
- Evitado un hydration mismatch en Fortress causado por el contador de raid inicial calculado con `Date.now()` durante SSR/hidratacion.

## [0.19.16] - 2026-05-01

### Added
- Anadido manifest seguro de fondos secundarios para Market, Deck, Fortress, Events, Arena y Adventure.
- Anadido `ScreenBackground` reutilizable con imagen registrada, overlay tonal, vignette y fallback.

### Changed
- Integrados fondos PNG dark fantasy en Shop/Market, Deck, Fortress, Events, Arena y Adventure sin cambiar rutas, gameplay ni economia.
- `ScreenScaffold` usa el fondo registrado cuando existe y mantiene `SceneBackdrop` como fallback para escenas sin fondo secundario.
- Deck usa el mismo sistema de fondo registrado aunque su pantalla tenga composicion propia.

## [0.19.15] - 2026-05-01

### Changed
- Anadido control de opacidad con slider al panel `?qa=effects`, manteniendo el campo numerico para ajuste fino.
- Integradas las nubes como props `clouds_dark_layer` editables desde Home Effects, con posicion, tamano y opacidad persistibles igual que el resto de efectos.
- Ajustada la presencia de cuervos con dos bandadas, mayor opacidad y direcciones opuestas.

### Fixed
- Restaurado `banner_red_loop` al pipeline animado estable de bandera roja para evitar manchas marrones y drift lateral del asset original.

## [0.19.14] - 2026-05-01

### Changed
- Reforzado el ondeo de `banner_red_loop` manteniendo la base fija y animando solo una copia recortada del pano.
- Anadida capa ambiental `HomeSkyAtmosphere` con nubes oscuras lentas y cuervos ocasionales en el cielo.
- Aumentada la presencia visual de los cuervos sin convertirlos en ruido ni tapar el HUD.

### Fixed
- Mantenidos `candle_loop` y `lantern_warm_loop` en `staticWithLocalAnimation`, sin volver a sustituirlos por `flame_loop` ni animar su objeto completo.

## [0.19.13] - 2026-05-01

### Fixed
- Anadido `staticWithLocalAnimation` para que `lantern_warm_loop`, `candle_loop` y `banner_red_loop` mantengan su primer frame fijo sin baile lateral.
- Restaurada microvida local para linternas, velas y estandartes sin sustituirlos por `flame_loop`.
- Congelada la tira base de esos props y animada solo una capa interna pequena de luz o tela.

### Changed
- El editor `?qa=effects` muestra ahora si un prop usa animacion local, ademas de su `renderMode`.

## [0.19.12] - 2026-05-01

### Fixed
- Revertido el fallback visual incorrecto que sustituia `candle_loop` y `lantern_warm_loop` por `flame_loop`.
- Restaurados `banner_red_loop`, `lantern_warm_loop` y `candle_loop` como assets visibles con identidad propia mediante `staticFirstFrame`.
- Mantenido `flame_loop` solo para antorchas y fuegos abiertos, `blue_flame_loop` para fuegos azules y `purple_flame_loop` para fuegos morados.

### Changed
- Sustituido el estado de manifest por `renderMode: animated | staticFirstFrame | disabled`, mostrado tambien en `?qa=effects`.
- Anadido soporte de anchor visual `anchorXPercent` y `anchorYPercent` para props Home sin cambiar posiciones existentes.

## [0.19.11] - 2026-05-01

### Fixed
- Desactivado el render completo de `banner_red_loop` porque el spritesheet mueve el poste entre frames y no hay cloth-only limpio.
- Cambiados `candle_loop` y `lantern_warm_loop` a fallback estable con `flame_loop`, evitando que la vela o linterna completa baile lateralmente.
- Anadidos metadatos de estado `raw`, `normalized`, `layered`, `replacement` y `disabled` al manifest de efectos Home para distinguir assets seguros de assets descartados.

### Added
- Anadido `tools/normalize-spritesheet.mjs` para diagnosticar y generar spritesheets normalizados por anchor sin cambiar el sistema de render.
- Anadidos indicadores QA de estado de asset, anchor recomendado y fallback activo en `?qa=effects`.

## [0.19.10] - 2026-05-01

### Fixed
- Restaurados `candle_loop`, `lantern_warm_loop` y `banner_red_loop` a sus spritesheets originales para evitar deformaciones o capas visuales ajenas.
- Anadidos keyframes especificos por frame para `candle_loop`, `lantern_warm_loop` y `banner_red_loop`, compensando el ancla visual dentro de la ventana del sprite sin modificar el arte.
- Retirados del manifest y del disco los derivados intermedios incorrectos que superponian llamas ajenas o deformaban los props.

## [0.19.9] - 2026-05-01

### Fixed
- Restaurados `candle_loop`, `lantern_warm_loop` y `banner_red_loop` como sprites basados en su arte original, sin superponer `flame_loop` ni capas visuales ajenas.
- Anadidas tiras estabilizadas para `candle_loop`, `lantern_warm_loop` y `banner_red_loop` para reducir desplazamiento lateral entre frames manteniendo animacion.
- Actualizado el manifest de efectos Home para cargar solo las tiras estabilizadas registradas y evitar los PNGs estaticos de la pasada anterior.

## [0.19.8] - 2026-05-01

### Fixed
- Corregido el render de sprites Home con `frameCount: 1` para que no ejecuten keyframes ni desaparezcan al desplazar la tira fuera de la ventana.
- Estabilizados `candle_loop` y `banner_red_loop` como props estaticos hasta disponer de spritesheets animados limpios.

## [0.19.7] - 2026-05-01

### Fixed
- Restaurado `flame_loop` al comportamiento previo validado, evitando que las antorchas ya calibradas vuelvan a desplazarse.
- Convertido `candle_loop` a prop estatico estable porque el spritesheet generado desplaza cuerpo y llama entre frames.
- Convertido `banner_red_loop` a prop estatico estable para evitar drift lateral del estandarte hasta disponer de una tela separada limpia.

### Added
- Anadida accion `New prop` al editor `?qa=effects` para instanciar un nuevo efecto desde cero, seleccionarlo y moverlo en el canvas.

## [0.19.6] - 2026-05-01

### Fixed
- Restaurado `flame_loop` al spritesheet y keyframes calibrados previos para no romper las antorchas ya validadas.
- Corregido `purple_flame_loop` con una tira alineada por ancla inferior para reducir deriva perceptible.
- Separado `candle_loop` en cuerpo estatico y llama animada alineada para evitar que el prop completo se desplace.

### Added
- Registrados los sprites Home adicionales en el manifest compartido y en el editor QA de efectos.
- Anadidos dos estandartes `banner_red_loop` en Arena como props ajustables desde `?qa=effects`.

## [0.19.5] - 2026-05-01

### Fixed
- Separado `flag_red_loop` en dos capas internas: `flag_red_pole.png` estatica y `flag_red_cloth_loop.png` animada.
- Evitado que el palo de la bandera forme parte del loop de frames, eliminando el desplazamiento visual del palo durante la animacion.
- Mantenido el mismo prop `flag_red_loop` para el editor QA, sin cambiar posiciones ni configuracion existente.

## [0.19.4] - 2026-05-01

### Fixed
- Ajustada la compensacion X del frame desalineado de `flag_red_loop` usando el mismo enfoque que en las llamas: medir el ancla visual y desplazar la ventana interna del spritesheet, no mover el prop completo.
- Eliminado el backup temporal no registrado del spritesheet de bandera.

## [0.19.3] - 2026-05-01

### Fixed
- Normalizado `flag_red_loop.png` a 5 frames horizontales iguales con el palo alineado en el mismo punto en todos los frames.
- Simplificados los keyframes de `flag_red_loop` para cortar frames exactos y evitar deriva lateral de la bandera.
- Limpiado ruido de alpha bajo en el spritesheet de bandera para evitar artefactos alrededor del prop.

## [0.19.2] - 2026-05-01

### Added
- Anadido `yawDeg` al editor QA de efectos del Home para girar props en 3D sobre eje vertical: `0/180` cambia el lado visible y `90/270` deja el sprite de canto.
- Anadidos `originXPercent` y `originYPercent` para ajustar el pivote del giro, util en banderas que deben rotar desde el palo.
- Anadida persistencia de `yawDeg` y pivotes en el guardado dev-only a `homeEffectLayout.ts`.

### Changed
- Diferenciada la rotacion plana (`rotationDeg`) del giro 3D (`yawDeg`) para evitar usar espejos 2D cuando se quiere cambiar la direccion de una bandera.

## [0.19.1] - 2026-05-01

### Added
- Anadidos controles `flipX` y `flipY` al editor QA de efectos del Home para espejar props sin depender de una rotacion de 180 grados.
- Anadida persistencia de `flipX` y `flipY` en el guardado dev-only a `homeEffectLayout.ts`.

### Changed
- Mantenida `rotationDeg` como rotacion plana del sprite y separado el espejado horizontal/vertical para ajustar banderas y props con mas precision.

## [0.19.0] - 2026-05-01

### Added
- Anadido guardado local de la configuracion QA de efectos del Home directamente a `homeEffectLayout.ts` mediante una ruta dev-only.
- Anadido ancla `world` para colocar efectos en cualquier punto del canvas Home, no solo dentro de landmarks concretos.
- Anadida edicion de `anchor`, tipo de sprite y `rotationDeg` desde el panel QA de efectos.
- Anadido atajo de rotacion con `[` y `]` para girar props seleccionados en pasos de 1 grado, o 5 grados con Shift.

### Changed
- Eliminados los textos persistentes bajo cada handle de efecto para que no tapen la calibracion visual.
- Conservados correctamente `anchor`, tipo de sprite, `frameCount` y rotacion al recargar drafts del editor QA.

## [0.18.1] - 2026-05-01

### Added
- Anadido guardado explicito `Save draft` del editor QA de efectos del Home sobre `localStorage`.
- Anadido panel QA arrastrable para apartarlo de landmarks mientras se calibran antorchas, banderas, portales o cristales.
- Anadidas acciones para duplicar, copiar y eliminar un prop de efecto concreto, facilitando crear nuevas antorchas o variantes desde una existente.
- Anadida importacion/aplicacion de JSON pegado y descarga local del JSON de efectos.

## [0.18.0] - 2026-05-01

### Added
- Anadido modo temporal `/?qa=effects` / `/?effectsEditor=1` para calibrar visualmente efectos de landmarks del Home.
- Anadidos handles, bounding boxes, seleccion, drag, ajuste por teclado y export JSON de la config de efectos.
- Guardado local de ajustes QA en `localStorage` para iterar sin tocar codigo hasta copiar la configuracion final.

### Changed
- Refactorizada la configuracion de efectos del Home a definiciones relativas al landmark con `xPercent`, `yPercent`, tamano, opacidad, frameCount y estado `enabled`.
- Desactivada la navegacion de hotspots solo durante el modo QA para que los handles puedan capturar drag/click sin cambiar de pantalla.

## [0.17.5] - 2026-05-01

### Fixed
- Recalibradas las llamas de Arena usando una overlay sobre el PNG del landmark para alinear los centros con fuegos reales del asset.
- Movidas las llamas intermedias de Fortress fuera del muro y hacia antorchas inferiores reales.
- Generados artifacts de diagnostico con overlays de Fortress y Arena para evitar seguir ajustando efectos a ciegas.

## [0.17.4] - 2026-05-01

### Added
- Creada la skill `duskkeep-home-effect-calibration` para calibrar spritesheets y microvida de landmarks del Home con capturas, metricas y validacion browser.

### Fixed
- Afinado adicional de tamano y posicion de llamas en Fortress y Arena para acercarlas a las antorchas reales del arte.
- Ajustadas las banderas animadas del Arena para alinearlas mejor con los mastiles existentes.

## [0.17.3] - 2026-05-01

### Fixed
- Recalibradas las llamas de Home para que tengan mas tamano y opacidad sobre antorchas reales de Fortress, Arena y Market.
- Reposicionadas las llamas de Fortress y Arena para reducir desalineaciones con las antorchas del arte base.
- Aumentadas y realineadas las banderas animadas del Arena para que se lean mejor sobre los mastiles.

## [0.17.2] - 2026-05-01

### Fixed
- Estabilizados los frames de los spritesheets del Home para compensar sprites generados con centros visuales desalineados.
- Reposicionadas y reescaladas las llamas para ajustarlas mejor a antorchas reales de Fortress, Arena y Market.
- Activados los sprites de bandera roja y portal azul con mayor opacidad y colocacion localizada.
- Aumentada la opacidad de cristal/eventos/deck para que la microvida sea visible sin volver a usar glows CSS genericos.

## [0.17.1] - 2026-05-01

### Fixed
- Corregida la animacion de spritesheets del Home para usar una ventana fija con `overflow:hidden` y una tira interna por frames.
- Evitado que los efectos de llama/cristal parezcan desplazarse lateralmente por el mapa.
- Verificado que `prefers-reduced-motion` detiene la animacion interna del spritesheet.

## [0.17.0] - 2026-05-01

### Added
- Anadido manifest seguro de spritesheets de efectos del Home para llamas, banderas, portal azul y cristal morado.
- Anadido componente reutilizable de sprite loop basado en `background-position` y `steps()` para animar spritesheets horizontales.
- Integrados sprites de llama y cristal en landmarks del Home con posicionamiento local al asset y fallback null.

### Changed
- Sustituida la microvida CSS anterior por efectos localizados basados en spritesheets reales.
- Reducido el coste visual en mobile ocultando efectos secundarios y respetando `prefers-reduced-motion`.
- Desactivado el uso visual de portal y bandera hasta tener variantes que no dupliquen el landmark ni parezcan capas pegadas.

## [0.16.5] - 2026-04-30

### Changed
- Activada una primera capa de microvida localizada en landmarks del Home: antorchas, pulsos de cristal/portal, runas, motes magicos, linternas y brillos discretos.
- Reducida la animacion en mobile para evitar blobs visuales y mantener fluidez.
- Mantenidas las animaciones de landmarks desactivables con `prefers-reduced-motion`.
- Evitadas particulas globales, cuadrados flotantes, glows grandes y efectos de tela/canopy mal anclados.

## [0.16.4] - 2026-04-30

### Fixed
- Corregida la posicion de Fortress y Arena en el Home para que caigan mejor sobre sus plataformas del canvas 1920x1080.
- Eliminado el tratamiento visual residual que hacia que Deck y Market parecieran translucidos.
- Reforzado el contraste local de Deck y Market sin reintroducir sombras grandes ni animaciones.
- Validado Home en 1920x913 y 1440x900 con seis landmarks, seis hotspots, sin overflow horizontal y sin animaciones de landmarks activas.

## [0.16.3] - 2026-04-30

### Changed
- Afinado final de posicion y escala de landmarks del Home tras revision visual.
- Aumentados Fortress, Arena y Events para mejorar presencia y encaje sobre sus pads.
- Reubicado Adventure ligeramente mas arriba y a la derecha.
- Bajado Deck dentro de su plataforma y recuperada su opacidad/contraste visual.
- Mantenido Market con el nuevo asset limpio y sin tratamiento translucido.

## [0.16.2] - 2026-04-30

### Changed
- Recalibradas las coordenadas base de los landmarks del Home para asentarlos mejor sobre sus pads reales del fondo.
- Movidos Deck y Market hacia sus plataformas inferiores correctas dentro del canvas logico 1920x1080.
- Ajustadas escala y posicion de Arena, Events, Adventure y Fortress para mejorar coherencia visual entre zonas.
- Actualizado el manifest de landmarks para usar el nuevo `market.png` limpio.
- Afinado el tratamiento visual de Market para no heredar la opacidad/contraste reducido del asset anterior.

## [0.16.1] - 2026-04-30

### Fixed
- Cambiado el Home desktop/tablet a un frame fijo tipo canvas 1920x1080 con escalado `contain`, evitando crop distinto segun la altura real del navegador.
- Corregido el anclaje de landmarks para que se posicionen por base visual y no por el centro del PNG.
- Movidas las transformaciones criticas de landmarks a estilos inline para que el navegador aplique siempre el anclaje determinista.
- Anadidos atributos de medicion para hotspots y labels del Home.
- Validado el caso realista 1920x913, equivalente a navegador con chrome/barra de marcadores visible.

## [0.16.0] - 2026-04-30

### Changed
- Rehecha la composicion tecnica del Home sobre un canvas logico fijo de 1920x1080 para que fondo, landmarks, labels y hotspots compartan el mismo sistema de coordenadas.
- Sustituido el escalado responsive del mundo por un factor uniforme calculado desde el viewport, con crop centrado y metricas de debug explicitas.
- Centralizadas las posiciones, tamanos, labels, hotspots y z-index de Fortress, Arena, Adventure, Events, Deck y Market en una tabla de layout verificable.
- Desactivadas temporalmente las microanimaciones y overlays de landmarks para priorizar estabilidad visual, rendimiento y evaluacion objetiva de composicion.
- Generadas capturas y metricas DOM de Home en 1920x1080, 1820x933, 1440x900, 1366x768, 1024x700 y mobile.

## [0.15.0] - 2026-04-30

### Changed
- Centralizada la composicion del Home en constantes explicitas para background, landmarks, hotspots, labels y CTA.
- Cambiado el stage desktop/tablet del Home a una composicion menos recortada para mostrar mas mapa util y pads completos.
- Reajustada la posicion y escala de Fortress, Arena, Adventure, Events, Deck y Market desde las constantes compartidas.
- Reforzadas microanimaciones localizadas de antorchas, portal, cristales, velas, linternas y brillos para que sean perceptibles en video sin usar particulas globales.
- Anadida validacion antes/despues con capturas, video y metricas DOM de stage, background, landmarks, labels y hotspots.

## [0.14.0] - 2026-04-30

### Changed
- Afinada la composicion del Home reduciendo overscan del stage y el zoom interno de `home_world_base.png` para mostrar mas mapa util.
- Reposicionados y reescalados los seis landmarks PNG para asentarlos mejor sobre sus pads reales del fondo.
- Ajustados hotspots, labels y CTA principal para reducir solapes con Deck/Market y mantener seis targets claros.
- Suavizadas las sombras/masas de Deck y Market con contacto mas corto y mascara estatica barata.
- Anadida microvida localizada en landmarks: antorchas, portal, cristales, runas, velas, linternas, banderas y brillos puntuales, con reduccion en mobile y `prefers-reduced-motion`.

## [0.13.0] - 2026-04-30

### Changed
- Integrado `home_world_base.png` como fondo principal del Home con manifest explicito y fallback al fondo anterior.
- Desactivadas las capas SVG/cartoon antiguas en la ruta normal para que el PNG sea la escena base real.
- Recolocados y reescalados landmarks PNG sobre las plataformas del nuevo fondo: Fortress, Arena, Adventure, Events, Deck y Market.
- Reducida la integracion visual a sombras/contactos discretos, sin pads SVG duplicados ni nuevas animaciones.

## [0.12.0] - 2026-04-30

### Changed
- Reorientado el fondo del Home hacia una escena crepuscular dark fantasy con cielo, montanas, terreno, caminos y agua menos saturados.
- Podadas microanimaciones y overlays caros de landmarks para priorizar fluidez y reducir ruido visual.
- Reducidas particulas ambientales, nieblas animadas, airships, rayos animados, blurs y filtros pesados.
- Suavizada la integracion de landmarks con sombras de contacto mas pequenas, pads menos brillantes y grading mas sobrio.

## [0.11.0] - 2026-04-30

### Changed
- Reintegrados los landmarks PNG del Home eliminando la duplicacion visual de edificios SVG/CSS antiguos.
- Reajustada escala, posicion, contacto con terreno y sombras de los landmarks para reducir sensacion de pegatina.
- Anadida microvida ligera por landmark con overlays pequenos para fuego, cristales, portal, particulas, velas y luces.
- Reposicionado Deck respecto al CTA principal para mejorar lectura del hub.

## [0.10.0] - 2026-04-30

### Added
- Anadido manifest explicito de landmarks del Home con fallback silencioso para evitar requests a assets no registrados.
- Anadido componente reutilizable para pintar landmarks PNG del Home sobre la escena existente.

### Changed
- Integrados landmarks PNG para Fortress, Adventure, Arena, Market, Events y Deck en el Home, manteniendo hotspots y navegacion.
- Reajustados marcadores y labels del Home para apoyarse mas en los landmarks y menos en iconos flotantes.

## [0.9.0] - 2026-04-30

### Added
- Registrada la categoria `modes` en el manifest central de iconos con iconos PNG para campaign, ladder, arena draft, daily event, boss event, fortress raid, challenge, dungeon run y boss rush.
- Anadido `ModeIcon` como componente compartido con fallback seguro para iconografia de modos/eventos.

### Changed
- Integrados iconos de modos/eventos en Home, Adventure, Events, Arena y el panel de raid de Fortress sin cambiar gameplay ni economia.

## [0.8.0] - 2026-04-30

### Changed
- Reforzado el feedback de recompensas con vuelos mas brillantes, estelas, destellos y particulas durante la trayectoria.
- Los recursos del HUD ahora animan el incremento numerico y muestran un impacto visual de ganancia/gasto cuando cambia el valor.

## [0.7.1] - 2026-04-29

### Fixed
- Corregido un bucle de render en `RewardFlightOverlay` provocado por dependencias inestables de i18n y limpieza de estado repetida.

## [0.7.0] - 2026-04-29

### Added
- Anadido `RewardFlightOverlay` como capa visual compartida para hacer volar recompensas hacia la barra de recursos.
- Integrado reward flight en Battle Result, Fortress raids, Missions claims, Shop purchases, Events result y Arena result sin cambiar economia.

### Changed
- Los chips de `GameResourceBar` exponen targets visuales seguros para gold, dust, gems y tickets.

## [0.6.1] - 2026-04-29

### Fixed
- Evitado que la musica MP3 de batalla se reinicie o se superponga cuando la misma ruta/componente vuelve a solicitar el mismo tema.
- Reforzado el manager de audio como singleton en cliente para no duplicar canales de musica durante recargas de desarrollo.

## [0.6.0] - 2026-04-29

### Added
- Generados e integrados SFX unicos para summon, poder de lider, dano al Core, Resolve Clash, inicio de turno, tipos de carta y estados de combate.
- Generadas e integradas musicas especificas para pre-batalla y post-batalla con entrada inmediata.

### Fixed
- Corregida la ruta de turno enemigo en Frontline Command para que los KO de heroes aliados conserven ghost, animacion y voz humana.
- La pantalla de batalla cambia a musica post-battle al terminar el combate antes de lanzar stingers de victoria/derrota.
- Ajustada la mezcla de derrota para que no quede enterrada bajo la musica de batalla.

## [0.5.7] - 2026-04-29

### Fixed
- Reforzado el audio de KO en Frontline Command para usar voces humanas cuando muere un heroe aliado.
- Anadidos stingers de victoria y derrota al final de Frontline Command.
- Reducido el volumen relativo de SFX repetitivos de batalla: carta, ataque, hit y breach.

## [0.5.6] - 2026-04-29

### Fixed
- Conectados SFX de Frontline Command a eventos visuales de carta, golpe, hit, curacion, escudo, breach y KO.
- Registrada la musica MP3 de Events para evitar que esa ruta vuelva al tema procedural.
- Bloqueado el uso de cartas, poder de lider y Resolve Clash mientras se reproduce la secuencia visual de ataques.

## [0.5.5] - 2026-04-29

### Changed
- Conectado el runtime de audio para reproducir SFX y musica MP3 registrados con fallback procedural seguro.

## [0.5.4] - 2026-04-29

### Changed
- Promovidas y registradas las variantes finales de muerte humana masculina y femenina.

## [0.5.3] - 2026-04-29

### Changed
- Promovidos `home`, `battle`, `battle_boss`, `battle_event`, `shop`, `heal` y muerte de monstruo a assets finales registrados.
- Preparados slots y prompts para muertes humanas masculina y femenina.

## [0.5.2] - 2026-04-29

### Changed
- Promovidas las primeras variantes aprobadas de SFX y musica Adventure a assets finales registrados.
- Ajustada la direccion de prompts para nueva tanda de muerte, curacion, Home, Shop y batallas largas.

## [0.5.1] - 2026-04-29

### Added
- Generados drafts locales de la vertical slice de audio para SFX y musica mediante ElevenLabs.
- Hoja de revision para seleccionar variantes y promover solo assets finales aprobados.

### Fixed
- Ajustado `ui_hover` al minimo de duracion permitido por ElevenLabs.

## [0.5.0] - 2026-04-29

### Added
- Plan de direccion sonora para Duskkeep Fronts con batches de SFX, musica, criterios de aceptacion y reglas de prompts.
- Batches de produccion para generar audio por fases desde ElevenLabs.
- Soporte de variantes draft en los scripts de SFX y musica para comparar candidatos antes de registrar assets finales.

## [0.4.1] - 2026-04-29

### Fixed
- Corregido el encoding de las skills Duskkeep para que sus `SKILL.md` carguen con frontmatter YAML valido sin BOM.

## [0.4.0] - 2026-04-29

### Added
- Pipeline local de ElevenLabs para generar SFX y musica desde prompts versionados.
- Manifiesto explicito de assets de audio en `lib/audioAssets.ts` para registrar solo MP3s aprobados y evitar 404.
- Carpetas documentadas para audio final en `public/assets/audio/sfx` y `public/assets/audio/music`.
- Documentacion de prompts, registro, fallbacks y reglas de seguridad comercial de audio.

## [0.3.0] - 2026-04-28

### Changed
- Adventure migra a presets Duskkeep Fronts explicitos por nodo mediante `frontlinePresetId`.
- El mapa de Adventure calcula amenaza elite desde unidades Frontline reales en vez de depender de `enemyTeam` legacy.
- Anadidos presets enemigos escalonados para tutorial, early, mid, late y bosses sin cambiar reglas del motor.
- Pre-combate de Adventure redisenado como war table visual: escuadra enemiga visible, CTA de batalla prioritario, recompensas compactas y matchup por frentes con standees.

### Added
- Tests para asegurar que todos los nodos Adventure apuntan a presets Frontline registrados.

## [0.2.4] - 2026-04-28

### Changed
- Nombre de producto actualizado a Duskkeep Fronts en metadata, documentacion viva, skills fuente, i18n y referencias versionadas.
- Repositorio, paquete npm y claves locales alineadas con `duskkeep-fronts`.

## [0.2.3] - 2026-04-28

### Changed
- Metadata, documentacion viva, skills fuente y referencias internas versionadas alineadas con el nombre de producto vigente.
- Keys locales de persistencia/audio y prefijos CSS compartidos saneados.

## [0.2.2] - 2026-04-28

### Changed
- Nombre tecnico del paquete alineado con el nombre de producto visible.
- Changelog y documentacion de publicacion saneados para no incluir datos de remoto ni notas internas no publicables.

## [0.2.1] - 2026-04-28

### Changed
- Ajustado el conjunto de archivos versionados para mantener el repositorio centrado en codigo, assets finales, configuracion y documentacion vigente.
- `.gitignore` ampliado para excluir archivos locales, capturas temporales, trazas, builds y materiales fuente no finales.
- Las laminas fuente/composites generadas localmente quedan fuera del indice Git; el repo debe subir solo assets recortados y registrados por manifest.
- Anadida nota operativa de derechos de assets generados con IA en `docs/ASSET_RIGHTS_NOTES.md`.
- Version elevada a `0.2.1` como iteracion de higiene de publicacion.

## [0.2.0] - 2026-04-28

### Added
- Baseline alpha documentada para continuar el desarrollo sin depender del historial conversacional.
- Sistema de documentacion funcional en `docs/DUSKKEEP_FRONTS_FUNCTIONAL_HANDOFF.md`, `docs/FRONTLINE_PROGRESSION.md` y documentos relacionados.
- Duskkeep Fronts consolidado como combate principal con heroes, cartas, standees, rewards y progresion de cartas.
- Integracion Adventure -> Precombat -> Combat -> Deck con desbloqueos first-clear de cartas Frontline.
- Sistema compartido de iconos/assets con manifests y fallbacks para evitar 404 de assets opcionales.
- Sistema i18n inicial y regla de migracion progresiva de textos.
- Reglas de visibilidad de recompensas reclamadas en `docs/REWARD_VISIBILITY_RULES.md`.

### Changed
- Version del paquete elevada de `0.1.0` a `0.2.0` para marcar el primer baseline alpha mantenible.
- Proceso de trabajo actualizado: cada iteracion debe actualizar version y changelog segun impacto.

## [0.1.0] - 2026-04-28

### Added
- Version inicial del alpha local.
