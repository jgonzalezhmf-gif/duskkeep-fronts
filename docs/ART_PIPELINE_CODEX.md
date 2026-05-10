# Pipeline de Arte para Codex

El proyecto debe tratar la produccion de arte como un pipeline por capas, no como una unica decision de herramienta.

## Regla Principal

Usar tres capas combinadas:

1. Ilustracion principal:
   - Escena pintada para `Home`, splash art de campania, portraits de cartas, enemigos y bosses.
   - Generada o creada como bitmap art.
   - Es el ancla emocional y la principal fuente de atractivo visual.

2. Composicion UI:
   - Layout HTML/CSS/React para navegacion, labels, recompensas, CTAs, overlays y gestion de mazo.
   - Mantiene el juego legible, responsive y facil de mantener.

3. Capa de efectos vivos:
   - Canvas PixiJS para particulas, brillos, brasas, pulsos, chispas, runas, props con parallax y bursts de recompensa.
   - Se usa para dar vida a escenas sin repintar toda la pantalla.

PixiJS no debe sustituir la ilustracion principal. Debe amplificarla.

## Uso Recomendado en Duskkeep Fronts

### Home

Usar una ilustracion principal pintada y una capa viva ligera:

- escena de valle con fortaleza
- brillo localizado alrededor de castillo, shrine, arena y shop
- niebla suave, chispas, luciernagas y polvo magico
- parallax leve de camara en desktop
- feedback de click mas claro en hotspots

### Deck

Usar HTML/CSS para la estructura y anadir motion de alto valor:

- brillo foil en cartas raras o legendarias
- burst sutil al seleccionar una carta
- gema de coste animada
- pulso del poder de lider cuando esta activo

### Battle

Mantener la batalla legible por encima de todo. Usar arte solo donde refuerce claridad:

- burst de summon
- impacto de hechizo
- onda de poder de lider
- burst de recompensa de victoria

No sobrecargar el campo de batalla con particulas constantes.

## Web vs Mobile

El proyecto necesita encuadres visuales distintos por objetivo:

### Web

- priorizar composicion ancha
- conservar escenario lateral
- permitir mas detalle ambiental
- usar mayor profundidad de parallax
- permitir railes laterales junto al arte

### Mobile

- centrar fortaleza y landmarks criticos
- evitar props pequenos ilegibles
- mantener separacion generosa entre hotspots
- reducir overdraw y densidad de particulas

La misma ilustracion solo puede reutilizarse si esta compuesta con zonas de recorte seguras.

## Estrategia de Assets

### Ilustraciones Principales

Preparar al menos:

- ilustracion master de `Home`
- recorte mobile
- recorte web
- version segura para overlay, con espacio negativo suave para UI

### Cartas

Dividir assets en:

- marco de carta
- portrait art
- tratamiento de rareza
- overlay de efecto
- icono de faccion/escuela

Esto hace que el sistema de cartas escale mejor y sea mas facil de tematizar.

### Enemigos

Preparar disenos con silueta primero:

- una forma fuerte y legible
- una familia cromatica dominante
- una firma VFX especial

Los enemigos deben leerse bien incluso en portrait pequeno.

### Iconos de Modo/Evento

Los iconos de modo y evento viven en `public/assets/icons/modes/` y deben registrarse en `lib/iconAssets.ts` dentro del manifest `modes` antes de que cualquier componente pueda cargarlos. Usar `components/game/shared/ModeIcon.tsx` para integracion UI, de forma que assets ausentes o no registrados caigan al sistema de glyphs existente sin 404.

Claves oficiales:

- `campaign` -> mapa/entrada de campania.
- `ladder` -> progresion clasificada o ladder.
- `arena_draft` -> entrada de Arena y cartas de arena draft.
- `daily_event` -> eventos diarios rotativos.
- `boss_event` -> cartas de boss o evento especial.
- `fortress_raid` -> superficies de modo raid de Fortress.
- `challenge` -> modificadores de desafio o tareas especiales.
- `dungeon_run` -> modos futuros basados en ruta.
- `boss_rush` -> modo futuro de cadena de bosses.

No registrar laminas fuente como `Modes.png`; registrar solo PNGs finales recortados que deba pedir el navegador.

## Flujo de Trabajo para Codex

Cuando se trabaje en tareas con mucho arte en este repo:

1. Definir el objetivo de pantalla:
   - retencion
   - legibilidad
   - payoff de fantasia

2. Decidir que pertenece a cada capa:
   - ilustracion bitmap
   - DOM/UI
   - efectos PixiJS

3. Construir primero la composicion responsive.

4. Anadir motion despues.

5. Anadir espectaculo al final.

Si una pantalla se ve ruidosa, quitar efectos antes que sacrificar claridad de layout.

## Uso de la Skill Local de Pixi

El material local `.agents/skills/pixijs-2d` es util como referencia tecnica para:

- contenedores de particulas
- filtros
- limites de rendimiento
- sprite batching
- arquitectura de overlays

Tratarlo como guia de implementacion, no como direccion de producto.

## Direccion Actual del Proyecto

Plan a corto plazo:

1. Mantener `Home` como referencia visual principal con layout basado en key art.
2. Mantener navegacion por hotspots en React/HTML por fiabilidad.
3. Anadir capa viva tipo PixiJS solo cuando la composicion estatica este aprobada.
4. Mejorar Deck para que se sienta coleccionable y premium.
5. Estandarizar briefs de card art y enemy art antes de produccion masiva.
