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

### 1. Validacion browser de release candidate

Objetivo: comprobar la experiencia real de usuario tras intro/login/Home y rutas principales.

Cuándo hacerlo:

- Antes de una demo o release candidata.
- Despues de cambios visuales importantes.
- Cuando el usuario pida validacion UI real.

Validar:

- Intro -> Auth -> invitado -> Home.
- Intro -> Auth -> login/registro si Supabase remoto/local esta preparado.
- Rutas principales sin 404, overflow ni errores consola.
- Reward/Shop/Adventure/Combat smoke visual.

### 2. Supabase remoto y entorno operativo

Estado: validado manualmente para alpha con cuenta de prueba.

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
- Las pruebas manuales remotas recientes cubrieron login, Adventure, recompensas, Shop, Arena, logout/login e incognito sin perdida aparente de snapshot.
- El checklist manual queda definido en `docs/QUALITY_AND_RELEASE.md`.

No seguir salvo:

- Fallo real de sincronizacion, sesion, RLS, RPC o snapshot.
- Preparacion de produccion publica.
- Monetizacion, pagos, ladder real o necesidad de rate limit distribuido.

### 3. Pulido de pantallas no-combat bajo demanda

Objetivo: mejorar pantallas todavia menos fuertes sin tocar Combat.

Candidatas:

- Missions.
- Arena.
- Events.
- Fortress.
- Team/Roster.
- Deck.
- Shop contenido futuro.

Regla:

- Auditar una pantalla.
- Hacer una iteracion acotada.
- Validar.
- Cerrar o pasar a la siguiente.

### 4. Ladder/Arena competitiva

Objetivo: no aceptar ranking real desde datos confiados del cliente.

Tareas:

- Activar o completar replay validation server-side.
- Definir score/rating en servidor.
- Anadir rate limit distribuido si hay trafico real.
- Auditar abuso de resultados.

### 5. Monetizacion y pagos

Objetivo: preparar moneda premium y pagos sin confiar en cliente.

Tareas:

- Modelo de transacciones.
- Webhooks backend-only.
- Ledger premium.
- Idempotencia estricta.
- Entorno sandbox del proveedor.
- Observabilidad y alertas.

### 6. Canvas/stage global fijo

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
- Pulido no-combat: tanda cerrada tras Team, Arena y Events; no seguir pantalla por pantalla sin una incidencia concreta.
- Siguiente recomendado: validacion browser de release candidate o preparacion de Supabase remoto, segun si se prioriza demo local o persistencia online real.

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
