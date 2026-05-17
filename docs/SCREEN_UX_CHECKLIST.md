# Checklist UX por Pantalla

Este documento sirve para revisar pantallas antes de una demo, release candidate o pasada visual. No define gameplay nuevo; solo fija criterios de aceptacion UX, visuales y de navegacion.

## Criterios Globales

Aplican a todas las pantallas:

- La pantalla carga sin errores criticos de consola.
- No hay 404 de assets registrados.
- No hay overflow horizontal en desktop ni mobile.
- Existe una ruta clara para volver a Home o al flujo anterior.
- El CTA principal se entiende en menos de 3 segundos.
- Recursos, recompensas y estados bloqueados se muestran con texto e icono, no solo color.
- Los iconos PNG registrados se priorizan frente a glyphs genericos cuando exista asset.
- Las imagenes no se deforman; usar `object-contain` u `object-cover` segun contexto.
- Las animaciones decorativas respetan `prefers-reduced-motion`.
- Los cambios sensibles de recursos/progreso dependen del servidor en modo Supabase.

## Estado por Pantalla

### Intro y Auth

Estado: `Aligned`.

Validar:

- La intro aparece al entrar en la app, antes del login.
- Skip funciona y no rompe Home ni Auth.
- Login, registro, invitado y recuperacion usan mensajes genericos ante error.
- Invitado puede continuar, pero al recargar/cerrar vuelve a tener opcion de login o seguir como invitado.
- Cuenta vinculada no muestra el gate salvo logout, expiracion o sesion invalida.
- Mobile permite ver y pulsar todos los CTAs sin scroll bloqueado.

Riesgos:

- No exponer si una cuenta existe.
- No dejar tokens en URL despues de callbacks.
- No mezclar progreso local antiguo con snapshot servidor.

### Home

Estado: `Aligned`.

Validar:

- Es el hub visual principal y no parece una pantalla tecnica.
- Landmarks, flares, fuegos y banderas no bailan ni se descuadran tras recargar.
- Recursos superiores son legibles y no tapan landmarks importantes.
- CTA de continuar Adventure es claro si hay progreso.
- Settings/audio siguen accionables.
- Navegacion a rutas principales funciona sin 404.

Riesgos:

- Assets y efectos del mundo pueden desalinearse si se recalibran desde QA.
- Evitar cargar assets de pantallas no visibles de forma innecesaria.

### Adventure

Estado: `Aligned`.

Validar:

- El mapa es protagonista; header y briefing no tapan mas de lo necesario.
- Chapter 1 esta activo y Chapter 2 aparece bloqueado si no hay contenido.
- Nodos tienen estado claro: available, current, cleared, locked, claimed.
- El marcador de party apunta al ultimo progreso real.
- La mission card cambia CTA por tipo: battle, elite, boss, chest, locked.
- Key chest muestra estado locked, key-needed, claimable o claimed con asset especifico.
- `?qa=adventure-map` sigue permitiendo mover nodos, props e interacciones sin romper guardado.

Riesgos:

- No cambiar coordenadas manuales sin una tarea explicita.
- Chest no debe iniciar combate ni permitir claim repetido.
- Replays no deben dar recompensas first-clear.

### Pre-Combate

Estado: `Aligned`.

Validar:

- Muestra enemigo, recompensa, dificultad y CTA sin saturar texto.
- Permite volver a Adventure.
- No reinicia musica si debe continuar el tema de Adventure.
- No se mezclan dos musicas.
- En mobile el CTA de inicio sigue visible.

Riesgos:

- No duplicar validaciones sensibles en cliente.
- No mostrar recompensas que el servidor no vaya a conceder.

### Combat

Estado: `Aligned`, con riesgo de regresion visual si se toca.

Validar:

- Heroes y enemigos estan centrados y con imagen protagonista.
- Cartas muestran arte completo, coste y stats utiles sin texto redundante.
- Resolve Clash y habilidad de lider se distinguen claramente.
- Historial no domina la escena.
- Fondo de batalla se percibe y la UI mantiene contraste.
- Victoria/derrota permite volver a Adventure o Home.

Riesgos:

- No tocar motor ni reglas salvo tarea especifica.
- Evitar reintroducir paneles opacos o texto redundante.
- El resultado debe delegar rewards/progreso al flujo autoritativo cuando aplique.

### Deck

Estado: `Recoverable`.

Validar:

- Cartas con art registrado no muestran placeholder.
- Rarity/frame se entiende sin deformar imagen.
- Loadout seleccionado queda claro.
- Estados locked/future no parecen errores.
- Cambios de deck no rompen Combat.
- Mobile permite revisar cartas sin overflow.

Riesgos:

- No cambiar balance de cartas desde la UI.
- No anadir cartas jugables nuevas solo por tener art.

### Team y Roster

Estado: `Recoverable`.

Validar:

- Heroes existentes usan standees registrados.
- Heroes bloqueados mantienen estado locked, shards y unlock level.
- Roles y rarezas se entienden con iconos/tags consistentes.
- Upgrade muestra coste actualizado y bloquea spam de clicks mientras espera servidor.
- Fondo y cards mantienen legibilidad.
- Mobile permite abrir detalle sin tapar CTA principal.

Riesgos:

- No cambiar stats, rarezas, roles ni progresion sin tarea de balance.
- No conceder upgrades client-side en modo Supabase.

### Shop

Estado: `Recoverable`.

Validar:

- Ofertas muestran coste, recompensa, limite y estado comprado/agotado.
- Adventure Key usa icono real donde aparezca.
- Compra solo actualiza recursos tras respuesta autoritativa en modo Supabase.
- Errores de compra son claros pero no revelan datos sensibles.
- Daily/stock no parece infinito si tiene limite.

Riesgos:

- No hardcodear precios o rewards en componentes.
- No permitir compra repetida si el servidor marca dailyLimit alcanzado.

### Missions

Estado: `Recoverable`.

Validar:

- Fondo, header y cards se integran con el estilo actual.
- Misiones muestran progreso, estado y recompensa reclamable.
- Claim no aparece si no cumple requisitos.
- Recompensa reclamada queda marcada.
- Daily/weekly se diferencian sin saturar.

Riesgos:

- No calcular claims sensibles solo en cliente para cuentas online.
- Evitar duplicar rewards si hay refresh o doble click.

### Arena

Estado: `Recoverable`.

Validar:

- Tickets, rango/progreso y CTA son visibles.
- Si no hay ticket, el bloqueo es claro.
- Resultado y rewards no contradicen servidor.
- No aparece aviso de progreso online si la operacion fue validada.
- Mobile no oculta tickets ni CTA.

Riesgos:

- No aceptar ranking futuro desde cliente.
- Antes de ladder publico, exigir validacion server-side y rate limit distribuido.

### Events

Estado: `Recoverable`.

Validar:

- Operacion activa, mutador, recompensa y estado diario se leen rapido.
- El tono visual del evento se distingue sin parecer otra pantalla.
- Empty/locked states no parecen errores.
- Resultado queda persistido si hay Supabase.

Riesgos:

- No duplicar rewards diarios por refresh.
- No meter eventos con reglas especiales sin contrato server-authoritative.

### Fortress

Estado: `Recoverable`.

Validar:

- Base, defensa, garrison y raid se entienden sin leer parrafos largos.
- Rewards y cooldowns se comunican con iconos y texto breve.
- Claims y raid results usan feedback compartido.
- Mobile permite operar garrison/raid sin scroll roto.

Riesgos:

- Progresion de fortaleza futura debe ser data-driven y server-authoritative.
- No enterrar reglas de raid en JSX.

### Battle Result

Estado: `Aligned`.

Validar:

- Victoria/derrota se reconoce visualmente.
- Rewards concedidos se muestran una sola vez y con feedback claro.
- Si el servidor tarda, el mensaje diferencia pendiente, error reintentable y rechazo real.
- Botones de volver a Adventure/Home son visibles.
- No aparece un aviso de fallback si la recompensa ya se persistio.

Riesgos:

- No mostrar como ganada una recompensa que el servidor rechazo.
- No permitir reclamar dos veces por volver atras o recargar.

## Checklist Mobile

Validar en al menos 1024x700 y un viewport movil:

- No hay scroll horizontal.
- CTAs principales tienen area tactil suficiente.
- Panels flotantes no tapan recursos ni CTA.
- Modales se pueden cerrar.
- Texto critico no baja de legibilidad minima.
- Safe area no tapa botones inferiores.

## Checklist de Release Visual

Antes de cerrar una pasada visual:

- Ejecutar `npm.cmd run check`.
- Ejecutar `npm.cmd run build` si hubo cambios de componentes o assets.
- Capturar rutas principales si el cambio afecta UX visible.
- Revisar consola y network por 404.
- Cerrar agent-browser o cualquier navegador de prueba al terminar.

## Uso Recomendado

Para una auditoria rapida:

1. Escoger una pantalla.
2. Revisar su estado en este documento.
3. Ejecutar solo una iteracion acotada.
4. Validar la ruta afectada.
5. Actualizar este documento si el estado cambia de `Recoverable` a `Aligned`.

No usar esta checklist para abrir refactors grandes sin bug o alcance explicito.
