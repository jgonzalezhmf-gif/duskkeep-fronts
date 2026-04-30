# Changelog

Todas las iteraciones relevantes del alpha deben quedar registradas aqui.

Formato basado en Keep a Changelog y versionado semantico pragmatico:
- `MAJOR`: cambios incompatibles de arquitectura, persistencia, gameplay core o direccion de producto.
- `MINOR`: nuevas pantallas, sistemas, integraciones jugables, pipelines visuales o cambios perceptibles de UX.
- `PATCH`: fixes, ajustes visuales pequenos, documentacion, tests o mantenimiento sin cambio funcional grande.

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
