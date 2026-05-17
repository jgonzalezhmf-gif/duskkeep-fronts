# Indice de Documentacion

Este indice es el punto de entrada recomendado para entender y extender Duskkeep Fronts sin depender del historial de conversaciones.

## Lectura Inicial

Leer primero estos documentos:

- `README.md`: resumen del proyecto, comandos y flujo de desarrollo local.
- `AGENTS.md`: reglas de trabajo para Codex y futuras sesiones de implementacion.
- `docs/DUSKKEEP_FRONTS_FUNCTIONAL_HANDOFF.md`: estado funcional actual, decisiones y notas de continuidad.
- `docs/ARCHITECTURE.md`: capas del codigo, limites, flujo de datos y reglas de extension.
- `docs/ENGINEERING_STANDARDS.md`: estandares de calidad, seguridad, rendimiento y desarrollo para futuros cambios.
- `docs/PROJECT_STATUS_AND_NEXT_STEPS.md`: estado de bloques, siguientes prioridades y regla para no iterar indefinidamente.
- `docs/DEMO_GUIDE.md`: recorrido recomendado para demostrar la vertical slice y validar una demo de 10-15 minutos.
- `docs/SCREEN_UX_CHECKLIST.md`: checklist UX por pantalla para demo, release candidate y pasadas visuales acotadas.

## Por Area

### Arquitectura y Organizacion del Codigo

- `docs/ARCHITECTURE.md`: arquitectura actual, limites entre capas y riesgos conocidos.
- `docs/GAME_ARCHITECTURE_AND_VISUAL_SYSTEM.md`: direccion general de arquitectura de juego y sistema visual.
- `docs/ENGINEERING_STANDARDS.md`: reglas practicas para mantener los cambios pequenos, seguros y mantenibles.

Leer antes de:

- extraer componentes grandes
- mover reglas de dominio
- anadir modulos nuevos de feature
- cambiar primitives UI compartidas
- anadir campos persistentes

### Gameplay y Sistemas

- `docs/GAMEPLAY_GUIDE.md`: loop jugable y expectativas de cada pantalla.
- `docs/FRONTLINE_COMBAT_HANDOFF.md`: comportamiento de Frontline Combat y notas de integracion.
- `docs/FRONTLINE_PROGRESSION.md`: heroes, cartas, desbloqueos y reglas de progresion.
- `docs/FRONTLINE_SYNERGIES.md`: direccion de sinergias tacticas existentes y planificadas.
- `docs/ADVENTURE_MAP_INTERACTIONS_BACKLOG.md`: backlog de interacciones del mapa Adventure y cofres con llave.

Leer antes de:

- cambiar comportamiento de nodos de Adventure
- cambiar Combat o presets
- cambiar Deck, heroes, cartas o rewards
- anadir reglas nuevas de misiones, eventos o arena

### Recursos Visuales y Cohesion Visual

- `docs/ART_PIPELINE_CODEX.md`: registro de assets, rutas y reglas de fallback seguro.
- `docs/GAME_ARCHITECTURE_AND_VISUAL_SYSTEM.md`: direccion visual y lenguaje UI compartido.
- `docs/IMPECCABLE_ANIMATION_USAGE.md`: guias de motion y animacion.
- `docs/ASSET_RIGHTS_NOTES.md`: notas sobre uso de assets.

Leer antes de:

- anadir assets PNG/WebP
- reemplazar iconos, portraits, card art, fondos o efectos
- anadir nuevos loops de animacion
- tocar visuales de Home, mapa Adventure o Combat

### Rewards, Economia y Progresion

- `docs/REWARD_VISIBILITY_RULES.md`: cuando los rewards deben verse, ocultarse, quedar reclamados o mostrarse como replay reducido.
- `docs/FRONTLINE_PROGRESSION.md`: expectativas de progresion de cartas/heroes y desbloqueos.
- `docs/SECURITY_AND_BACKEND_ROADMAP.md`: manejo futuro autoritativo de acciones sensibles de economia.

Leer antes de:

- anadir rewards
- cambiar comportamiento first-clear/replay
- cambiar claims de key chest
- cambiar ofertas de tienda
- cambiar misiones o rewards diarios

### Seguridad y Servidor

- `docs/AUTH_FLOW_AND_SESSION_POLICY.md`: flujo de intro, login, invitado, conversion de invitado a cuenta nueva y expiracion de sesion.
- `docs/SECURITY_AND_BACKEND_ROADMAP.md`: fases objetivo de backend, operaciones sensibles y direccion Supabase.
- `docs/SUPABASE_REMOTE_OPERATIONS.md`: pasos operativos para preparar y validar Supabase remoto sin commitear secretos.
- `docs/BACKEND_DATA_MODEL.md`: modelo de datos objetivo para cuenta, recursos, progreso, compras, claims, combate y ledger.
- `docs/SERVER_AUTHORITATIVE_STATE_OWNERSHIP.md`: matriz de estado server-owned, client-cache y client-only.
- `docs/SERVER_AUTHORITATIVE_OPERATIONS.md`: contratos de operaciones sensibles que deben ejecutarse en servidor.
- `docs/BACKEND_SECURITY_CLOSURE_REVIEW.md`: cierre del bloque server-authoritative, riesgos mitigados, riesgos residuales y gates antes de monetizacion/ranking.
- `docs/QUALITY_AND_RELEASE.md`: checklist de seguridad para el alpha presentable.

Leer antes de:

- anadir autenticacion
- mover persistencia fuera de localStorage
- validar Supabase remoto
- anadir flujos de pago o premium
- anadir ladder online o almacenamiento de cuenta
- aceptar resultados de economia o batalla enviados por el cliente
- disenar endpoints o funciones de servidor para rewards, compras o claims

### Rendimiento y Lanzamiento

- `docs/PERFORMANCE_BASELINE.md`: presupuestos actuales, auditoria de assets y practicas de rendimiento.
- `docs/QUALITY_AND_RELEASE.md`: checks de lanzamiento, rutas de validacion rapida y gates de calidad.
- `docs/PROJECT_STATUS_AND_NEXT_STEPS.md`: matriz de bloques cerrados, backlog priorizado y gates por tipo de trabajo.
- `docs/DEMO_GUIDE.md`: guia practica de preparacion, recorrido, persistencia online y troubleshooting para demo.
- `docs/SCREEN_UX_CHECKLIST.md`: criterios de aceptacion por pantalla y riesgos antes de tocar UI.

Leer antes de:

- anadir assets grandes
- anadir CSS global o animaciones
- cambiar comportamiento de carga de bundles
- preparar una release candidate
- investigar regresiones de Lighthouse

## Huecos Actuales de Documentacion

Estos son los siguientes puntos de documentacion que conviene mejorar:

- Ampliar troubleshooting operativo si aparecen incidencias repetidas en Supabase remoto, navegador o assets.
- Traducir a espanol documentos historicos que todavia mantengan secciones en ingles.

## Reglas de Documentacion

- No documentar experimentos temporales como arquitectura final.
- Mantener los documentos alineados con el codigo tras cada iteracion relevante.
- Preferir actualizar documentos existentes antes que crear duplicados.
- No incluir contexto privado del proyecto que no deba estar en el repositorio.
- No mencionar otros juegos, productos externos o referencias externas en documentacion versionada.
- Si un documento describe un sistema futuro, marcarlo claramente como roadmap o arquitectura objetivo.
