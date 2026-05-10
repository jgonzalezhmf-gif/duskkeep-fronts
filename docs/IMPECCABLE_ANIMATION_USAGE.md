# Uso de Impeccable para Animacion

## Estado de la Skill

- `impeccable` esta instalada en `.agents/skills/impeccable`.
- El comando relevante para motion es `animate [target]`, con referencia en `.agents/skills/impeccable/reference/animate.md`.
- Sus tests locales estan en `scripts/test-impeccable-skill.mjs`.
- El preflight de la skill espera `PRODUCT.md` y recomienda `DESIGN.md`. Ambos existen en la raiz del repo y deben mantenerse como contexto base antes de una pasada visual grande.

## Como Usarla en Duskkeep Fronts

Usar `impeccable` como apoyo, no como sustituto de las skills Duskkeep Fronts.

Orden recomendado para tareas de animacion:

1. Usar la skill Duskkeep Fronts del area afectada: `duskkeep-combat`, `duskkeep-adventure-flow`, `duskkeep-visual-cohesion`, etc.
2. Ejecutar `node .agents/skills/impeccable/scripts/load-context.mjs`.
3. Leer `.agents/skills/impeccable/reference/animate.md`.
4. Definir una capa de motion con objetivo claro: feedback, guia, impacto o delight.
5. Implementar con CSS/React ligero, respetando `prefers-reduced-motion` y evitando animar layout.
6. Validar con `agent-browser` en desktop y mobile.

## Puntos Donde Aporta Mas Valor

- Combat / Duskkeep Fronts: ataque, impacto, breach, KO, carta seleccionada, summon token, poder de lider y secuencia posterior al choque.
- Adventure map: reveal de nodos, pulso de ruta activa, camino que conecta fases, preview de enemigo/recompensa y CTA visible.
- Pre-combat: entrada de escuadra enemiga, comparativa visual de frentes, readiness gate y boton de iniciar combate.
- Home: hotspots, landmarks, recursos, ofertas/recompensas y transiciones de foco sin saturar.
- Deck: seleccion de carta, swap de slots, feedback de mazo completo/incompleto y previews de cartas full-art.
- Roster/Heroes: seleccion de heroe, upgrade/tier-up futuro, cambio de aspecto por tier y estados desbloqueado/bloqueado.
- Shop/Market: claim gratis, sold out, refresh, oferta destacada, compra confirmada y feedback de gasto de recursos.
- Fortress: repair, raid incoming, dano de integrity, asignacion de garrison y building upgrade.
- Missions/Events/Arena: claim de recompensa, gasto de ticket, inicio de desafio, evento completado y reward reveal.

## Restricciones para este Proyecto

- No cambiar gameplay, economia o reglas para justificar animaciones.
- No introducir VFX pesados si CSS/PNG/standees resuelven la intencion.
- No bloquear interaccion con animaciones largas.
- No usar bounce/elastic como estilo base.
- No animar `width`, `height`, `top`, `left` o margenes salvo que no haya alternativa y se mida.
- No duplicar sistemas: preferir clases/tokens compartidos y componentes reutilizables.

## TODO Recomendado

- Definir tokens globales de motion: duraciones, easing, intensidad y reduced-motion.
- Extraer utilidades de feedback visual compartidas para recursos, recompensas, cartas y standees.
- Revisar Combat con `impeccable animate` cuando toque la siguiente pasada de game feel.
- Separar efectos de carta por tipologia en Duskkeep Fronts: `order`, `tactic`, `summon`, `gear`, `signature` y `relic`, reutilizando PNGs/manifest y sin cambiar reglas.
- Revisar `PRODUCT.md` y `DESIGN.md` si cambia la direccion artistica general, el tono de producto o el sistema visual compartido.
