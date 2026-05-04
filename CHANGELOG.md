# Changelog

Todas las iteraciones relevantes del alpha deben quedar registradas aqui.

Formato basado en Keep a Changelog y versionado semantico pragmatico:
- `MAJOR`: cambios incompatibles de arquitectura, persistencia, gameplay core o direccion de producto.
- `MINOR`: nuevas pantallas, sistemas, integraciones jugables, pipelines visuales o cambios perceptibles de UX.
- `PATCH`: fixes, ajustes visuales pequenos, documentacion, tests o mantenimiento sin cambio funcional grande.

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
