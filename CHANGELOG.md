# Changelog

Todas las iteraciones relevantes del alpha deben quedar registradas aqui.

Formato basado en Keep a Changelog y versionado semantico pragmatico:
- `MAJOR`: cambios incompatibles de arquitectura, persistencia, gameplay core o direccion de producto.
- `MINOR`: nuevas pantallas, sistemas, integraciones jugables, pipelines visuales o cambios perceptibles de UX.
- `PATCH`: fixes, ajustes visuales pequenos, documentacion, tests o mantenimiento sin cambio funcional grande.

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
