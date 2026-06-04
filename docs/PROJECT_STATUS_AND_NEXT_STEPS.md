# Estado del Proyecto y Siguientes Bloques

Este documento sirve para decidir que hacer cuando una sesion dice "sigamos", "siguiente" o "vamos alla". La regla es no seguir iterando sobre un bloque estable salvo bug real, validacion fallida o cambio explicito de alcance.

## Bloques Estables Para Alpha

### Seguridad y backend autoritativo

Estado: cerrado para alpha presentable.

Evidencia:

- `docs/BACKEND_SECURITY_CLOSURE_REVIEW.md`
- `docs/SECURITY_AND_BACKEND_ROADMAP.md`
- `docs/SERVER_AUTHORITATIVE_OPERATIONS.md`
- Smokes Supabase y tests server-authoritative.

No seguir salvo:

- Nueva operacion sensible sin contrato autoritativo.
- Smoke o test fallando.
- Paso a monetizacion, pagos reales o ladder competitivo publico.

### Auth, invitado y conversion de cuenta

Estado: estable para alpha local/Supabase local.

Evidencia:

- `docs/AUTH_FLOW_AND_SESSION_POLICY.md`
- `npm.cmd run smoke:supabase:guest`
- `npm.cmd run smoke:supabase:snapshot`
- `npm.cmd run smoke:supabase:guest-upgrade`

No seguir salvo:

- Fallo real en UI de login/intro.
- Validacion con Supabase remoto.
- Decision de activar OAuth real.
- Cambios de politica de sesion.

### Rendimiento

Estado: aceptable para alpha presentable.

Evidencia:

- `docs/PERFORMANCE_BASELINE.md`
- Mejoras previas de assets/carga.
- Lighthouse local reportado por el usuario en rango aproximadamente 80-90.

No seguir salvo:

- Regresion clara en Lighthouse.
- Nuevo asset grande.
- Nueva pantalla pesada.
- Preparacion de release candidata.

### Refactorizacion de store y reglas puras

Estado: tanda cerrada para alpha presentable.

Evidencia:

- Versiones cerradas `0.37.21` a `0.37.31`.
- `lib/store.ts` conserva la orquestacion online-first, snapshots y fallback local explicito.
- Reglas puras recientes extraidas a helpers testeados: guards autoritativos, resultados de Arena/Ladder/Events, contadores de batalla, notificaciones de rewards, rewards autoritativos y progresion autoritativa de heroes.
- `npm.cmd run check:full` verde en `0.37.31` con 586 tests y build correcto.

No seguir salvo:

- Regla nueva duplicada dentro de `lib/store.ts`.
- Bug real en sincronizacion online-first, snapshots, rewards o progresion.
- Cambio de arquitectura que justifique mover un bloque completo.
- Preparacion de produccion publica con nuevas restricciones de seguridad.

### Documentacion base

Estado: base suficiente.

Evidencia:

- `docs/DOCUMENTATION_INDEX.md`
- `docs/ARCHITECTURE.md`
- `docs/ENGINEERING_STANDARDS.md`
- `docs/QUALITY_AND_RELEASE.md`
- `docs/GAMEPLAY_GUIDE.md`
- `docs/DEMO_GUIDE.md`
- `docs/SCREEN_UX_CHECKLIST.md`
- `docs/OPERATIONS_TROUBLESHOOTING.md`

No seguir salvo:

- Nuevo sistema relevante.
- Documento en ingles pendiente de traduccion.
- Documento obsoleto o contradictorio con el codigo.

### Localizacion MVP

Estado: cerrado en `0.37.57` para alcance MVP.

Evidencia:

- `lib/i18n/locales.ts` expone solo `en` y `es`.
- `lib/i18n/dictionaries.ts` carga solo diccionarios mantenidos.
- `tests/i18nMvpLocales.test.ts` bloquea reintroducir locales no mantenidos y exige paridad estructural entre ingles y espanol.

No seguir salvo:

- Nueva clave visible sin traduccion EN/ES.
- QA de copy por pantalla detecta texto malo, truncado o sin traducir.
- Decision explicita de reabrir soporte de un nuevo idioma con mantenimiento real.

### Pulido no-combat reciente

Estado: tanda cerrada para alpha presentable.

Evidencia:

- Team usa el icono `team` registrado en el chrome superior.
- Arena muestra la placa de rango/progreso tambien en layouts no grandes.
- Events refuerza la identidad de cada operacion con firma, mutador y tono visual propio.
- Versiones cerradas: `0.32.70`, `0.32.71`, `0.32.72`.

No seguir salvo:

- Bug visual concreto reportado por el usuario.
- Pantalla rota por una integracion posterior.
- Pasada de release candidate con navegador que detecte overflow, 404 o error de consola.

## Bloques Pendientes Priorizados

### 1. Politica de Intro por sesion de pestana

Estado: cerrado en `0.37.48`.

Objetivo: la Intro debe aparecer al entrar al juego en una pestana nueva, pero no al volver a Home ni al usar Back dentro de la misma sesion.

Cuándo hacerlo:

- Antes de la validacion browser de release candidate.
- Cuando la Intro reaparezca tras login, invitado, navegacion interna o boton Back.

Validar:

- Entrada fresca al juego muestra Intro si corresponde.
- Intro/Auth/invitado -> Home -> ruta principal -> Back no vuelve a mostrar Intro.
- Cerrar y reabrir pestana permite volver a mostrar Intro como entrada fresca.

### 2. Transicion compartida de entrada a batalla

Estado: cerrado en `0.37.51` para Adventure/direct battle, Ladder, Arena Trial, Events y Fortress Defense.

Objetivo: todas las batallas deben tener una presentacion previa reusable, con mensaje/audio por modo y sin entrar de golpe al combate.

Nota de cierre: la entrada ya no muestra CTA manual de inicio; avanza automaticamente tras la transicion. Fortress Defense usa la guarnicion con imagenes de heroes y datos claros de oleadas, objetivo y ordenes.

Cuándo hacerlo:

- Antes de la validacion browser de release candidate.
- Cuando se toque Adventure, Arena, Ladder, Events o Fortress battle entry.

Validar:

- Adventure/direct battle, Arena Trial, Ladder y Events muestran transicion antes de `FrontlineBattle`.
- La transicion usa copy/audio especifico del modo y respeta reduced motion.
- Si hay datos suficientes, presenta heroes/enemigos; si no, usa un banner visual seguro.
- Fortress Defense entra automaticamente tras la transicion y no muestra `Defensa`/`Pronostico` en la pantalla previa.

### 3. Validacion browser de release candidate

Estado: pasada localmente en `0.37.52`.

Objetivo: comprobar la experiencia real de usuario tras intro/login/Home y rutas principales.

Evidencia:

- `npm.cmd run check`
- `npm.cmd run test`
- `npm.cmd run clean:next && npm.cmd run build`
- `npm.cmd run audit:high`
- `npm.cmd run audit:assets`
- `npm.cmd run audit:asset-refs`
- `npm.cmd run audit:build`
- `npm.cmd run check:performance`
- Browser local en `http://127.0.0.1:3000` con screenshots en `tmp/rc-validation/screens`: Intro/Auth invitado, Home, Adventure, pre-combat `c1l1`, Deck, Roster, Missions, Events, Arena, Shop, Fortress y Battle en desktop/mobile.

Riesgo residual:

- Esta pasada fue local/offline. Supabase remoto sigue siendo un bloque separado cuando se quiera demo con login real, sincronizacion entre dispositivos o persistencia online.

Cuándo hacerlo:

- Antes de una demo o release candidata.
- Despues de cambios visuales importantes.
- Cuando el usuario pida validacion UI real.

Validar:

- Intro -> Auth -> invitado -> Home.
- Intro -> Auth -> login/registro si Supabase remoto/local esta preparado.
- Rutas principales sin 404, overflow ni errores consola.
- Reward/Shop/Adventure/Combat smoke visual.

### 4. Supabase remoto y entorno operativo

Estado: validado para alpha con cuenta de prueba y preflight automatizado de entorno remoto.

Objetivo: mantener una instancia remota segura sin activar todavia monetizacion.

Cuándo hacerlo:

- Cuando se quiera validar persistencia online fuera del entorno local.
- Antes de una demo que dependa de login real o sincronizacion entre dispositivos.
- Antes de activar OAuth real.

Tareas:

- Revisar variables de entorno.
- Confirmar Anonymous Sign-Ins.
- Ejecutar migraciones.
- Ejecutar smokes equivalentes contra remoto si se prepara script seguro.
- Revisar RLS y permisos.
- Documentar pasos de rollback/reset seguros.

Estado operativo:

- Existe `docs/SUPABASE_REMOTE_OPERATIONS.md` como guia de preparacion y validacion remota.
- Existe `npm.cmd run check:supabase:remote` para comprobar variables publicas, URL remota, anon key, persistencia, proxy autoritativo, rate limit y observabilidad sin imprimir secretos.
- El 2026-06-02 `npm.cmd run check:supabase:remote` paso contra `https://vyuoegsmbgmsxexzciur.supabase.co` con `NEXT_PUBLIC_PERSISTENCE=supabase` y `SERVER_AUTHORITATIVE_API_ENABLED=true`. Riesgo residual informado: rate limit en memoria y sink de eventos en consola, aceptables solo para alpha/single instance.
- El 2026-06-03 `npm.cmd run check:supabase:remote` volvio a pasar contra el mismo proyecto remoto; `smoke:supabase:guest-upgrade` paso con un alias unico de inbox real y `smoke:authoritative-api -- --auth anonymous` paso contra Next local apuntando al remoto.
- El 2026-06-04 la validacion browser de demo contra Next local apuntando a Supabase/proxy real genero 24 capturas desktop/mobile sin errores de escenario, consola ni page errors. Evidencia local: `tmp/playwright-screenshots/2026-06-04T06-05-28-131Z/manifest.json`.
- Las pruebas manuales remotas recientes cubrieron login, Adventure, recompensas, Shop, Arena, logout/login e incognito sin perdida aparente de snapshot.
- El checklist manual queda definido en `docs/QUALITY_AND_RELEASE.md`.

No seguir salvo:

- Fallo real de sincronizacion, sesion, RLS, RPC o snapshot.
- Preparacion de produccion publica.
- Monetizacion, pagos, ladder real o necesidad de rate limit distribuido.

### 5. Pulido de pantallas no-combat bajo demanda

Objetivo: mejorar pantallas todavia menos fuertes sin tocar Combat.

Candidatas:

- Missions: iteracion acotada cerrada en `0.37.54` con mapa visual de rutas en escritorio, prioridad responsive y test de resumen de rutas.
- Arena: iteracion acotada cerrada en `0.37.55` con informe visual de modo en el gate de entrada, diferenciando Ladder sin ticket y Trials con tickets/mutadores.
- Fortress: iteracion acotada cerrada en `0.37.56` con loop visual guarnicion -> mejora -> raid en el hero, responsive mobile legible y helper testeado.
- Events: iteracion acotada cerrada en `0.37.58` con banda de operacion recomendada, motivo contextual y helper testeado sin tocar reglas ni economia.
- Team/Roster.
- Deck.
- Shop contenido futuro.

Regla:

- Auditar una pantalla.
- Hacer una iteracion acotada.
- Validar.
- Cerrar o pasar a la siguiente.

### 6. Ladder/Arena competitiva

Objetivo: no aceptar ranking real desde datos confiados del cliente.

Tareas:

- Activar o completar replay validation server-side.
- Definir score/rating en servidor.
- Anadir rate limit distribuido si hay trafico real.
- Auditar abuso de resultados.

### 7. Monetizacion y pagos

Objetivo: preparar moneda premium y pagos sin confiar en cliente.

Tareas:

- Modelo de transacciones.
- Webhooks backend-only.
- Ledger premium.
- Idempotencia estricta.
- Entorno sandbox del proveedor.
- Observabilidad y alertas.

### 8. Canvas/stage global fijo

Objetivo: estabilizar layout visual del juego completo.

Tareas:

- Disenar `GameFixedStage` global.
- Migrar Home/Adventure/Combat/pantallas clave por fases.
- Mantener accesibilidad y responsive.
- No usarlo como medida de seguridad; es una solucion visual/layout, no anti-manipulacion.

## Regla Para "Siguiente"

Cuando se pida "siguiente":

1. Revisar si el bloque actual ya cumple sus criterios.
2. Si cumple, no anadir mas microcambios.
3. Elegir el siguiente bloque de esta lista por prioridad y contexto.
4. Ejecutar una iteracion acotada con objetivo verificable.
5. Actualizar changelog/version si se cierra la iteracion.
6. Reportar que queda y si conviene seguir o cambiar de bloque.

Aplicacion al estado actual:

- Backend/Auth/Data-driven: cerrado como MVP estable; no reabrir salvo bug, remoto, monetizacion o ladder real.
- Refactorizacion de store/reglas puras: tanda cerrada en `0.37.31`; no seguir extrayendo helpers por inercia.
- Pulido no-combat: tanda cerrada tras Team, Arena y Events; no seguir pantalla por pantalla sin una incidencia concreta.
- Intro por sesion: cerrado en `0.37.48`.
- Transicion compartida de entrada a batalla: cerrada en `0.37.51` para Adventure/direct battle, Ladder, Arena Trial, Events y Fortress Defense.
- Validacion browser de release candidate: cerrada localmente en `0.37.52`.
- Supabase remoto: preflight de entorno pasado el 2026-06-02; no ejecutar migraciones remotas, reset ni smokes con email real sin ventana de prueba aprobada.
- Missions: iteracion no-combat cerrada en `0.37.54`; no seguir tocandola salvo bug visual concreto o feedback del usuario.
- Arena: iteracion no-combat cerrada en `0.37.55`; no seguir tocandola salvo bug visual concreto o feedback del usuario.
- Fortress: iteracion no-combat cerrada en `0.37.56`; no seguir tocandola salvo bug visual concreto o feedback del usuario.
- Localizacion MVP: cerrada en `0.37.57`; solo ingles/espanol se exponen en opciones y ambos diccionarios deben mantener la misma estructura.
- Events: iteracion no-combat cerrada en `0.37.58`; no seguir tocandola salvo bug visual concreto o feedback del usuario.
- Siguiente recomendado: si la siguiente demo depende de online real, ejecutar el smoke remoto con inbox de prueba y el smoke del proxy autoritativo; si no, elegir la siguiente pantalla no-combat por prioridad contextual, probablemente Team/Roster o Deck.

## Gates Generales Antes de Release Presentable

Comandos minimos:

```powershell
npm.cmd run check
npm.cmd test
npm.cmd run build
$env:NODE_OPTIONS="--use-system-ca"; npm.cmd run audit:high
```

Con Supabase local si el bloque toca auth/backend:

```powershell
npm.cmd run smoke:supabase:guest
npm.cmd run smoke:supabase:snapshot
npm.cmd run smoke:supabase:guest-upgrade
npm.cmd run smoke:authoritative-api
```

Si el bloque toca assets/rendimiento:

```powershell
npm.cmd run audit:assets
npm.cmd run audit:asset-refs
npm.cmd run audit:build
npm.cmd run check:performance
```

Si el bloque toca UI:

- Validar rutas principales en navegador.
- Revisar consola.
- Revisar 404.
- Revisar overflow horizontal.
- Cerrar procesos de browser al terminar.
