# Changelog

Todas las iteraciones relevantes del alpha deben quedar registradas aqui.

Formato basado en Keep a Changelog y versionado semantico pragmatico:
- `MAJOR`: cambios incompatibles de arquitectura, persistencia, gameplay core o direccion de producto.
- `MINOR`: nuevas pantallas, sistemas, integraciones jugables, pipelines visuales o cambios perceptibles de UX.
- `PATCH`: fixes, ajustes visuales pequenos, documentacion, tests o mantenimiento sin cambio funcional grande.

## [0.32.50] - 2026-05-15

### Security
- Anhadida validacion defensiva server-side para resultados Frontline persistidos en `battle_results`.
- Los resultados de Adventure, Arena y Events ahora exigen coherencia entre `winner`, turnos y core HP antes de quedar persistidos.
- Endurecido el contrato TypeScript de `battleSummary` para evitar summaries vacios o contradictorios en operaciones autoritativas.

### Docs
- Documentado el alcance del nuevo gate anti-forjado y aclarado que no sustituye la simulacion server-side completa para ladder/ranking real.

### Tested
- `npm.cmd run typecheck`
- `npm.cmd test -- tests/server.authoritativeOperations.test.ts tests/server.authoritativeOperationDispatcher.test.ts tests/storeAuthoritativeFallback.test.ts`
- `npm.cmd run check`
- `npm.cmd test`
- `npm.cmd run build`

## [0.32.49] - 2026-05-15

### Docs
- Cerrado el bloque server-authoritative con una seccion operativa de estado, gates previos a monetizacion/ranking y backlog tecnico priorizado.
- Documentado que no conviene seguir micro-refactorizando servicios por oferta/recompensa salvo bug real; los cambios de balance deben ir por catalogos server-side.

### Security
- Priorizados los riesgos pendientes: validacion server-side de combate competitivo, rate limit distribuido, observabilidad, webhooks de pago y migracion final de invitado.

### Tested
- `npm.cmd run typecheck`
- `npm.cmd run check`
- `npm.cmd test -- tests/server.authoritativeOperations.test.ts`
- `npm.cmd run build`

## [0.32.48] - 2026-05-15

### Docs
- Documentada una matriz de cobertura data-driven para operaciones server-authoritative.
- Aclarado que las migraciones antiguas pueden conservar importes historicos, pero la funcion efectiva tras reset es la ultima `create or replace function`.
- Separados los valores que deben vivir en catalogos de los limites defensivos y datos de setup que pueden permanecer como constantes por ahora.

### Security
- Registrados riesgos residuales del bloque backend: resultados de combate todavia cliente-MVP, rate limit en memoria, observabilidad y posible catalogo futuro de provisioning.

### Tested
- `npm.cmd run typecheck`
- `npm.cmd run check`
- `npm.cmd test -- tests/server.authoritativeOperations.test.ts`
- `npm.cmd run build`

## [0.32.47] - 2026-05-15

### Security
- Endurecidos los schemas de payload autoritativos para rechazar campos no declarados en operaciones sensibles.
- Anhadida cobertura transversal para impedir que cliente envie `cost`, `rewards`, `resources` o `rewardId` como verdad economica.

### Docs
- Documentado que los contratos server-authoritative deben aceptar acciones/ids, no cantidades finales de economia o recompensas.

### Tested
- `npm.cmd run typecheck`
- `npm.cmd test -- tests/server.authoritativeOperations.test.ts`
- `npm.cmd run check`
- `npm.cmd test`
- `npm.cmd run build`

## [0.32.46] - 2026-05-15

### Security
- Acotadas las redirecciones de OAuth y recuperacion de password al mismo origen de la aplicacion.
- Anhadida cobertura para descartar dominios externos y esquemas peligrosos en `redirectTo`.

### Tested
- `npm.cmd run typecheck`
- `npm.cmd test -- tests/supabaseBrowserSession.test.ts`
- `npm.cmd run check`
- `npm.cmd test`
- `npm.cmd run build`

## [0.32.45] - 2026-05-15

### Security
- Centralizada la resolucion de errores del envio de email de recuperacion de password.
- Anhadida cobertura para mantener generico el fallo del proveedor y evitar senhales sobre existencia de cuentas.

### Tested
- `npm.cmd run typecheck`
- `npm.cmd test -- tests/sessionSecurity.test.ts`
- `npm.cmd run check`
- `npm.cmd test`
- `npm.cmd run build`

## [0.32.44] - 2026-05-15

### Security
- Anhadida normalizacion y limites defensivos para credenciales email/password antes de llamar al SDK de Supabase.
- El flujo de recovery evita enviar emails vacios o excesivos al proveedor y responde de forma neutra para no generar senhales de enumeracion.

### Tested
- `npm.cmd run typecheck`
- `npm.cmd test -- tests/supabaseBrowserSession.test.ts tests/sessionSecurity.test.ts`
- `npm.cmd run check`
- `npm.cmd test`
- `npm.cmd run build`

## [0.32.43] - 2026-05-15

### Security
- Extraida a helpers testeables la deteccion y limpieza de URLs de recuperacion de password.
- El flujo de recovery elimina tokens sensibles del hash visible y preserva solo query params seguros no relacionados con recovery.

### Tested
- `npm.cmd run typecheck`
- `npm.cmd test -- tests/sessionSecurity.test.ts`
- `npm.cmd run check`
- `npm.cmd test`
- `npm.cmd run build`

## [0.32.42] - 2026-05-15

### Security
- Centralizada la resolucion de errores de actualizacion de password en `sessionSecurity`.
- Anhadida cobertura para mantener genericos los fallos sensibles del flujo de recuperacion de password.

### Tested
- `npm.cmd run typecheck`
- `npm.cmd test -- tests/sessionSecurity.test.ts`
- `npm.cmd run check`
- `npm.cmd test`
- `npm.cmd run build`

## [0.32.41] - 2026-05-15

### Security
- Centralizada la resolucion de mensajes de error de autenticacion en `features/server/sessionSecurity.ts`.
- Anhadida cobertura para garantizar que registro y upgrade de invitado usan mensajes genericos cuando el proveedor devuelve errores sensibles, evitando pistas sobre existencia de cuentas.

### Tested
- `npm.cmd run typecheck`
- `npm.cmd test -- tests/sessionSecurity.test.ts tests/supabaseBrowserSession.test.ts`
- `npm.cmd run check`
- `npm.cmd test`
- `npm.cmd run build`

## [0.32.40] - 2026-05-15

### Security
- Endurecido `upgradeAnonymousSupabaseUserWithPassword` para convertir solo sesiones autenticadas anonimas.
- Anhadido helper testeado que bloquea conversiones guest-upgrade desde sesiones vinculadas o sin sesion, evitando depender solo del bloqueo visual de la UI.

### Tested
- `npm.cmd run typecheck`
- `npm.cmd test -- tests/supabaseBrowserSession.test.ts tests/sessionSecurity.test.ts`
- `npm.cmd run check`
- `npm.cmd test`
- `npm.cmd run build`

## [0.32.39] - 2026-05-15

### Changed
- Extraidas las operaciones autoritativas de Adventure a `features/server/authoritativeAdventureOperations.ts`.
- `authoritativeOperationDispatcher` reexporta las mismas funciones publicas, manteniendo intactos contratos, fallback y validacion de respuestas.

### Tested
- `npm.cmd run typecheck`
- `npm.cmd test -- tests/server.authoritativeOperationDispatcher.test.ts tests/storeAuthoritativeFallback.test.ts`
- `npm.cmd run check`
- `npm.cmd test`
- `npm.cmd run build`

## [0.32.38] - 2026-05-15

### Changed
- Extraidas las operaciones autoritativas de progresion de heroes a `features/server/authoritativeHeroOperations.ts`.
- `authoritativeOperationDispatcher` reexporta las mismas funciones publicas, pero deja de mezclar wrappers de heroes con el resto de operaciones server-side.

### Tested
- `npm.cmd run typecheck`
- `npm.cmd test -- tests/server.authoritativeOperationDispatcher.test.ts tests/storeAuthoritativeFallback.test.ts tests/progressionAuthoritativePolicy.test.ts`
- `npm.cmd run check`
- `npm.cmd test`
- `npm.cmd run build`

## [0.32.37] - 2026-05-15

### Changed
- Centralizados los errores genericos del dispatcher autoritativo en `features/server/authoritativeDispatcherErrors.ts`.
- `authoritativeOperationDispatcher` mantiene los mismos mensajes seguros, pero evita duplicar strings de respuesta invalida y mismatch.

### Tested
- `npm.cmd run typecheck`
- `npm.cmd test -- tests/server.authoritativeDispatcherErrors.test.ts tests/server.authoritativeOperationDispatcher.test.ts`
- `npm.cmd run check`
- `npm.cmd test`
- `npm.cmd run build`

## [0.32.36] - 2026-05-15

### Changed
- Extraida la infraestructura comun de llamadas autoritativas a `features/server/authoritativeOperationCaller.ts`.
- `authoritativeOperationDispatcher` mantiene los mismos wrappers y parsers, pero delega token, llamada HTTP, idempotencia y fallback comun en un helper dedicado.

### Tested
- `npm.cmd run typecheck`
- `npm.cmd test -- tests/server.authoritativeOperationDispatcher.test.ts`
- `npm.cmd run check`
- `npm.cmd test`
- `npm.cmd run build`

## [0.32.35] - 2026-05-15

### Security
- Las respuestas de `/api/server/authoritative` ahora fuerzan `Cache-Control: private, no-store, max-age=0` y `Pragma: no-cache`.
- Anhadido helper testeable para preservar headers operativos como `Retry-After` sin permitir cache de respuestas sensibles.

### Tested
- `npm.cmd run typecheck`
- `npm.cmd test -- tests/server.authoritativeResponseHeaders.test.ts tests/server.authoritativeRequestGuards.test.ts tests/server.authoritativeRpcProxy.test.ts`
- `npm.cmd run check`
- `npm.cmd test`
- `npm.cmd run build`

## [0.32.34] - 2026-05-15

### Security
- Anhadido limite de longitud para el header `Authorization` del endpoint autoritativo antes del rate limit y del proxy RPC.
- El extractor Bearer tambien rechaza tokens excesivamente largos para evitar procesar cabeceras anormales.

### Tested
- `npm.cmd run typecheck`
- `npm.cmd test -- tests/server.authoritativeRequestGuards.test.ts tests/server.authoritativeRpcProxy.test.ts tests/server.authoritativeOperations.test.ts`
- `npm.cmd run check`
- `npm.cmd test`
- `npm.cmd run build`

## [0.32.33] - 2026-05-15

### Security
- Anhadido guard de `Content-Type` para `/api/server/authoritative`, rechazando requests que no sean `application/json` o variantes `+json` antes de parsear el body.
- Alineados los codigos de error autoritativos con `request_too_large` y `unsupported_media_type`.

### Tested
- `npm.cmd run typecheck`
- `npm.cmd test -- tests/server.authoritativeRequestGuards.test.ts tests/server.authoritativeOperations.test.ts`
- `npm.cmd run check`
- `npm.cmd test`
- `npm.cmd run build`

## [0.32.32] - 2026-05-15

### Security
- Anhadido un guard de tamano para `/api/server/authoritative` que rechaza bodies superiores a 256 KiB antes de parsear JSON.
- Cubierto el guard con tests para solicitudes permitidas, bloqueadas y cabeceras `Content-Length` ausentes o malformadas.

### Tested
- `npm.cmd run typecheck`
- `npm.cmd test -- tests/server.authoritativeRequestGuards.test.ts`
- `npm.cmd run check`
- `npm.cmd test`
- `npm.cmd run build`

## [0.32.31] - 2026-05-15

### Security
- Endurecido el proxy `/api/server/authoritative` para no devolver detalles internos de validacion (`issues`) en respuestas publicas de payload invalido.
- Anhadida cobertura para confirmar que los errores sanitizados no exponen nombres de campos ni mensajes internos de schema.

### Tested
- `npm.cmd run typecheck`
- `npm.cmd test -- tests/server.authoritativeRpcProxy.test.ts`
- `npm.cmd run check`
- `npm.cmd test`
- `npm.cmd run build`

## [0.32.30] - 2026-05-15

### Changed
- Extraido el overlay de texto y controles de la intro a `components/game/intro/IntroOverlay.tsx`.
- `IntroStage` conserva la orquestacion de motion y estilos globales, delegando el texto central, skip y CTA final en un componente dedicado.

### Tested
- `npm.cmd run typecheck`
- `npm.cmd test -- tests/introMotion.test.ts`
- `npm.cmd run check`
- `npm.cmd test`
- `npm.cmd run build`

## [0.32.29] - 2026-05-15

### Changed
- Extraido el mundo visual de la intro a `components/game/intro/IntroWorld.tsx`.
- `IntroStage` delega fondo, niebla, cuervos, glow del castillo, boss, relampago, flash, vignette y omen veil sin cambiar timings ni clases CSS.

### Tested
- `npm.cmd run typecheck`
- `npm.cmd test -- tests/introMotion.test.ts`
- `npm.cmd run check`
- `npm.cmd test`
- `npm.cmd run build`

## [0.32.28] - 2026-05-15

### Changed
- Extraido el emblema/titulo de la intro a `components/game/intro/IntroCrest.tsx`.
- `IntroStage` mantiene los mismos assets, clases CSS y opacidades del crest, pero delega su render en un componente dedicado.

### Tested
- `npm.cmd run typecheck`
- `npm.cmd test -- tests/introMotion.test.ts`
- `npm.cmd run check`
- `npm.cmd test`
- `npm.cmd run build`

## [0.32.27] - 2026-05-15

### Changed
- Extraida la capa del boss de la intro a `components/game/intro/IntroBoss.tsx`.
- `IntroStage` conserva los mismos assets, clases CSS y transform del boss, pero delega su render en un componente dedicado.

### Tested
- `npm.cmd run typecheck`
- `npm.cmd test -- tests/introMotion.test.ts`
- `npm.cmd run check`
- `npm.cmd test`
- `npm.cmd run build`

## [0.32.26] - 2026-05-15

### Changed
- Extraido el bloque de cuervos de la intro a `components/game/intro/IntroCrows.tsx`.
- `IntroStage` mantiene los mismos timings, clases CSS y sprites, pero delega el render de la bandada en un componente dedicado.

### Tested
- `npm.cmd run typecheck`
- `npm.cmd test -- tests/introMotion.test.ts`
- `npm.cmd run check`
- `npm.cmd test`
- `npm.cmd run build`

## [0.32.25] - 2026-05-15

### Changed
- Extraido el hook `useIntroMotion` para agrupar los valores derivados de motion de la intro.
- `IntroStage` consume un unico objeto de motion y deja de coordinar directamente cada `useMemo` de camara, niebla, cuervos, boss, crest y lightning.

### Tested
- `npm.cmd run typecheck`
- `npm.cmd test -- tests/introMotion.test.ts`
- `npm.cmd run check`
- `npm.cmd test`
- `npm.cmd run build`

## [0.32.24] - 2026-05-15

### Changed
- Extraido el hook de resolucion de idioma de la intro a `components/game/intro/useIntroLocale.ts`.
- `IntroStage` queda centrado en la escena cinematica y deja la deteccion de idioma del navegador en un hook dedicado.

### Tested
- `npm.cmd run typecheck`
- `npm.cmd test -- tests/introMotion.test.ts`
- `npm.cmd run check`
- `npm.cmd test`
- `npm.cmd run build`

## [0.32.23] - 2026-05-15

### Changed
- Extraidas las curvas puras de movimiento de la intro a `components/game/intro/introMotion.ts`.
- `IntroStage` delega camera scale/origin/drift, fog, crows, keep glow, boss reveal, shake, crest y lightning en helpers testeables.
- Reducido el tamano de `IntroStage.tsx` sin mover CSS, assets ni flujo de entrada/login.

### Tested
- `npm.cmd run typecheck`
- `npm.cmd test -- tests/introMotion.test.ts`
- `npm.cmd run check`
- `npm.cmd test`
- `npm.cmd run build`

## [0.32.22] - 2026-05-15

### Changed
- Extraida la decision de bloqueo de fallback local autoritativo a `lib/storeAuthoritativeFallback.ts`.
- `lib/store.ts` aplica la decision de fallback sin conocer directamente el mensaje ni la politica de seguridad de sesion.
- Anadidos tests unitarios para el caso vinculado sin sesion, invitado offline y rechazo autoritativo real.

### Security
- La politica sigue bloqueando fallback local para cuentas vinculadas sin sesion/API y evita convertir rechazos del servidor en exito local.
- No cambia payloads, RPCs, rewards, economia, progresion, audio ni reglas de gameplay.

### Tested
- `npm.cmd run typecheck`
- `npm.cmd test -- tests/storeAuthoritativeFallbackDecision.test.ts tests/storeAuthoritativeFallback.test.ts tests/sessionSecurity.test.ts`
- `npm.cmd run check`
- `npm.cmd test`
- `npm.cmd run build`

## [0.32.21] - 2026-05-15

### Changed
- Extraida la configuracion de persistencia de Zustand a `lib/storePersistence.ts`.
- `lib/store.ts` deja de conocer directamente `createJSONStorage`, `noopStorage`, nombre/version de storage y `mergePersistedGameState`.
- `persistedGameState` importa sus tipos desde `storeTypes` para reducir dependencia con el wrapper runtime del store.

### Security
- No cambia la migracion/merge del estado persistido ni la clave/version de localStorage.
- No cambia economia, rewards, progresion, acciones online-first, audio ni reglas de gameplay.

### Tested
- `npm.cmd run typecheck`
- `npm.cmd test -- tests/persistedGameState.test.ts tests/localSyncSnapshot.test.ts tests/storeAuthoritativeFallback.test.ts tests/sessionSecurity.test.ts`
- `npm.cmd run check`
- `npm.cmd test`
- `npm.cmd run build`

## [0.32.20] - 2026-05-15

### Changed
- Centralizado el bloqueo de fallback local autoritativo en `lib/store.ts` para que las operaciones online-first compartan la misma reaccion ante sesion ausente/API desactivada en cuentas vinculadas.
- Reducida duplicacion en flujos online-first de loadout, upgrades, Fortress, Arena, Events, Adventure, Missions, Shop, Daily Login y snapshot server-side.

### Security
- Mantiene la politica de no permitir fallback local cuando una cuenta vinculada requiere validacion autoritativa.
- No cambia payloads, RPCs, rewards, economia, progresion, reglas de combate ni catalogos server-side.

### Tested
- `npm.cmd run typecheck`
- `npm.cmd test -- tests/storeAuthoritativeFallback.test.ts tests/sessionSecurity.test.ts tests/server.authoritativeOperationDispatcher.test.ts`
- `npm.cmd run check`
- `npm.cmd test`
- `npm.cmd run build`

## [0.32.19] - 2026-05-15

### Changed
- Extraidos los contratos publicos del dispatcher autoritativo a `features/server/authoritativeOperationTypes.ts`.
- `authoritativeOperationDispatcher` conserva los re-exports publicos, pero queda centrado en ejecutar operaciones, validar respuestas parseadas y mantener idempotencia/fallback.
- `localSyncSnapshot` depende directamente del modulo de tipos para reducir acoplamiento con la implementacion del dispatcher.

### Security
- No cambia payloads, RPCs, idempotency keys, recursos, rewards, progresion ni reglas de gameplay.
- Se mantiene la frontera segura: fallback local solo para sesion ausente o API desactivada, no para rechazos autoritativos.

### Tested
- `npm.cmd run typecheck`
- `npm.cmd test -- tests/server.authoritativeOperationDispatcher.test.ts tests/localSyncSnapshot.test.ts tests/storeAuthoritativeFallback.test.ts`
- `npm.cmd run check`
- `npm.cmd test`
- `npm.cmd run build`

## [0.32.18] - 2026-05-15

### Changed
- Extraidos los parsers de respuestas autoritativas a `features/server/authoritativeOperationParsers.ts`.
- `authoritativeOperationDispatcher` queda centrado en orquestar operaciones, idempotencia, llamadas al proxy y comprobaciones de mismatch, reduciendo su tamano de 1565 a 1139 lineas.

### Security
- La validacion de respuestas `unknown` sigue siendo allowlist/shape-safe antes de aplicar recursos, rewards, progreso, loadout o Fortress en cliente.
- No cambia contratos, RPCs, fallback autoritativo, rewards ni reglas de gameplay.

### Tested
- `npm.cmd run typecheck`
- `npm.cmd test -- tests/server.authoritativeOperationDispatcher.test.ts tests/server.authoritativeOperations.test.ts tests/storeAuthoritativeFallback.test.ts`
- `npm.cmd run check`
- `npm.cmd test`
- `npm.cmd run build`

## [0.32.17] - 2026-05-15

### Changed
- `authoritativeOperationDispatcher` centraliza el patron comun de token Supabase, llamada al proxy autoritativo y fallback `missing_session`/`api_disabled` en `callOperationWithSession`.
- Todas las operaciones autoritativas del dispatcher usan el mismo flujo de error/fallback, reduciendo duplicacion y riesgo de divergencias entre Shop, Missions, Daily Login, Adventure, Arena, Events, Deck, Heroes y Fortress.

### Security
- Mantiene la regla de no hacer fallback local cuando un servidor conectado rechaza una operacion; solo conserva fallback local para sesion ausente o API desactivada.
- No cambia payloads, idempotency keys, RPCs, rewards ni reglas de gameplay.

### Tested
- `npm.cmd test -- tests/server.authoritativeOperationDispatcher.test.ts tests/progressionAuthoritativePolicy.test.ts tests/storeAuthoritativeFallback.test.ts`
- `npm.cmd run typecheck`
- `npm.cmd run check`
- `npm.cmd test`
- `npm.cmd run build`

## [0.32.16] - 2026-05-15

### Fixed
- El modal de Opciones permite scroll vertical en viewports bajos para que la seccion de cuenta y el boton `Crear cuenta y guardar progreso` sigan siendo accesibles.
- El cliente Supabase lee `NEXT_PUBLIC_SUPABASE_URL` y `NEXT_PUBLIC_SUPABASE_ANON_KEY` mediante referencias estaticas para que Next las inyecte correctamente en bundles cliente.
- `next.config.mjs` declara explicitamente las variables publicas de Supabase para asegurar que el cliente Auth queda configurado en builds locales/produccion.
- El flujo `guest -> cuenta nueva` usa un snapshot fresco al enviar el formulario y llama siempre al helper de conversion anonima para evitar que una carrera de estado dispare `signUp` en vez de convertir la sesion invitada.

### Tested
- `npm.cmd test -- tests/supabasePublicConfig.test.ts tests/supabaseBrowserSession.test.ts tests/sessionSecurity.test.ts tests/storeAuthoritativeFallback.test.ts`
- `npm.cmd run check`
- `npm.cmd test`
- `npm.cmd run build`
- `agent-browser`: `/` en produccion local, intro, login gate, entrada como invitado, Opciones y apertura del modal `Crear cuenta y guardar progreso`.

## [0.32.15] - 2026-05-15

### Changed
- El smoke `smoke:supabase:guest-upgrade` ahora valida tambien la sincronizacion del snapshot local tras convertir una sesion invitada anonima en cuenta nueva.
- Actualizada la documentacion de seguridad para reflejar que el smoke cubre `user_id`, `profileId`, starter state y progreso local sincronizado.

### Security
- La validacion operativa cubre el punto critico del flujo invitado -> cuenta nueva: no basta con convertir Auth, tambien debe persistirse progreso local mediante la RPC endurecida.

### Tested
- `npm.cmd run smoke:supabase:guest-upgrade`
- `npm.cmd run check`
- `npm.cmd test`
- `npm.cmd run build`

## [0.32.14] - 2026-05-15

### Changed
- El flujo de opciones `Crear cuenta y guardar progreso` sincroniza primero el snapshot local validado mediante `syncLocalSnapshotOnlineFirst` en lugar de cargar inmediatamente el snapshot del servidor.
- Los errores de registro usan respuesta generica para reducir riesgo de enumeracion de cuentas, manteniendo mensajes especificos solo para configuracion ausente y rate limit.
- Actualizada la documentacion de seguridad para reflejar el puente alpha de invitado a cuenta nueva.

### Security
- El flujo invitado -> cuenta nueva evita login/merge con cuentas existentes y no filtra si un email esta registrado.
- Si la sincronizacion autoritativa falla, el modal de cuenta no se cierra ni marca el progreso como guardado.

### Tested
- `npm.cmd test -- tests/sessionSecurity.test.ts tests/supabaseBrowserSession.test.ts tests/storeAuthoritativeFallback.test.ts`
- `npm.cmd run check`
- `npm.cmd test`
- `npm.cmd run build`

## [0.32.13] - 2026-05-15

### Changed
- `sync_local_snapshot` endurece la importacion de progreso invitado validando heroes, cartas, nodos Adventure e interacciones contra catalogos server-side habilitados.
- La importacion de loadout y garrison rechaza configuraciones con IDs desconocidos, duplicados o no poseidos/desbloqueados tras la importacion validada.
- Actualizada la documentacion de operaciones autoritativas para dejar claro que el snapshot local es un puente alpha limitado, no una fuente de verdad para economia final.

### Security
- El cliente ya no puede crear heroes, cartas, progreso Adventure ni claims de mapa inventando IDs dentro de un snapshot local manipulado.
- La migracion mantiene `auth.uid()`, idempotencia, caps conservadores y grants acotados a la RPC publica.

### Tested
- `npx.cmd supabase migration up --local`
- `npx.cmd supabase db reset`
- `npx.cmd supabase db query --local --file supabase/smoke-tests/adventure_shop_rpcs.sql --output table`
- `npx.cmd supabase db query --local --output table` para confirmar que `authenticated` puede ejecutar `sync_local_snapshot` pero no leer catalogos internos de heroes, cartas, nodos ni claims.
- `npm.cmd test -- tests/server.authoritativeOperationDispatcher.test.ts tests/server.authoritativeRpcProxy.test.ts tests/server.authoritativeOperations.test.ts tests/storeAuthoritativeFallback.test.ts`
- `npm.cmd run check`
- `npm.cmd test`
- `npm.cmd run build`

## [0.32.12] - 2026-05-15

### Added
- Backend introduce `server_upgradeable_frontline_cards` para definir cartas Frontline habilitadas y nivel maximo.
- Backend introduce `server_frontline_card_upgrade_costs` para definir costes de mejora de cartas por nivel actual.

### Changed
- `upgrade_frontline_card` deja de tener allowlist, nivel maximo y formula de coste hardcodeados.
- El smoke valida costes de cartas contra catalogo en lugar de comparar numeros fijos.
- Actualizada la documentacion de operaciones autoritativas para reflejar Frontline card progression data-driven.

### Security
- El cliente sigue enviando solo `cardId`; no decide elegibilidad, nivel maximo ni costes.
- `server_upgradeable_frontline_cards`, `server_frontline_card_upgrade_costs` y `frontline_card_upgrade_cost` quedan sin grants para `authenticated`.
- La operacion mantiene ownership, idempotencia, locks sobre recursos/carta y ledger de oro/polvo gastados.

### Tested
- `npx.cmd supabase migration up --local`
- `npx.cmd supabase db reset`
- `npx.cmd supabase db query --local --file supabase/smoke-tests/adventure_shop_rpcs.sql --output table`
- `npx.cmd supabase db query --local --output table` para confirmar que `authenticated` no puede leer catalogos de cartas ni ejecutar `frontline_card_upgrade_cost`.
- `npm.cmd test -- tests/server.authoritativeOperationDispatcher.test.ts tests/server.authoritativeRpcProxy.test.ts tests/server.authoritativeOperations.test.ts tests/storeAuthoritativeFallback.test.ts`
- `npm.cmd run check`
- `npm.cmd test`
- `npm.cmd run build`

## [0.32.11] - 2026-05-14

### Added
- Backend introduce `server_upgradeable_heroes` para definir heroes habilitados y limites de nivel, estrellas y skill.
- Backend introduce `server_hero_upgrade_costs` para definir costes de level/star/skill por valor actual.

### Changed
- `level_up_hero`, `star_up_hero` y `skill_up_hero` dejan de tener allowlists y costes hardcodeados.
- El smoke valida costes de progresion de heroes contra catalogo en lugar de comparar numeros fijos.
- Actualizada la documentacion de operaciones autoritativas para reflejar Hero progression data-driven.

### Security
- El cliente sigue enviando solo `heroId`; no decide elegibilidad, limites ni costes.
- `server_upgradeable_heroes`, `server_hero_upgrade_costs` y `hero_upgrade_cost` quedan sin grants para `authenticated`.
- Las operaciones mantienen ownership, idempotencia, locks sobre filas de jugador y ledger cuando hay gasto de recursos globales.

### Tested
- `npx.cmd supabase migration up --local`
- `npx.cmd supabase db reset`
- `npx.cmd supabase db query --local --file supabase/smoke-tests/adventure_shop_rpcs.sql --output table`
- `npx.cmd supabase db query --local --output table` para confirmar que `authenticated` no puede leer catalogos de progresion de heroes ni ejecutar `hero_upgrade_cost`.
- `npm.cmd test -- tests/server.authoritativeOperationDispatcher.test.ts tests/server.authoritativeRpcProxy.test.ts tests/server.authoritativeOperations.test.ts tests/storeAuthoritativeFallback.test.ts`
- `npm.cmd run check`
- `npm.cmd test`
- `npm.cmd run build`

## [0.32.10] - 2026-05-14

### Added
- Backend introduce `server_frontline_fortress_hero_scores` para definir la contribucion base de heroes a raids Fortress.
- Backend introduce `server_frontline_fortress_raid_profiles` para definir formula de ataque/defensa, outcomes, cooldown y rewards base.

### Changed
- `resolve_frontline_fortress_raid` deja de tener hardcodeadas las formulas de raid y lee la configuracion desde catalogos internos.
- `frontline_fortress_hero_presence_score` deja de hardcodear stats base de heroes y pasa a resolverlos desde catalogo server-side.
- Los rewards de raid Fortress pasan por `grant_reward_bundle` para compartir validacion y ledger centralizado.
- Actualizada la documentacion de operaciones autoritativas para reflejar Fortress raids data-driven.

### Security
- El cliente sigue solicitando solo resolver el raid; no decide ataque, defensa, outcome, cooldown ni rewards.
- `server_frontline_fortress_hero_scores` y `server_frontline_fortress_raid_profiles` quedan sin grants para `authenticated`.
- La operacion mantiene ownership, idempotencia, cooldown server-side y ledger de recursos ganados.

### Tested
- `npx.cmd supabase migration up --local`
- `npx.cmd supabase db reset`
- `npx.cmd supabase db query --local --file supabase/smoke-tests/adventure_shop_rpcs.sql --output table`
- `npx.cmd supabase db query --local --output table` para confirmar que `authenticated` no puede leer los catalogos de raids ni ejecutar `frontline_fortress_hero_presence_score`.
- `npm.cmd test -- tests/server.authoritativeOperationDispatcher.test.ts tests/server.authoritativeRpcProxy.test.ts tests/server.authoritativeOperations.test.ts tests/storeAuthoritativeFallback.test.ts`
- `npm.cmd run check`
- `npm.cmd test`
- `npm.cmd run build`

## [0.32.9] - 2026-05-14

### Added
- Backend introduce `server_frontline_fortress_buildings` para definir edificios de Fortress, nivel maximo y curvas de coste.
- Registrado catalogo inicial para `keep`, `treasury` y `barracks` conservando los valores actuales.

### Changed
- `upgrade_frontline_fortress` deja de validar edificios y costes con valores hardcodeados y lee la configuracion desde catalogo server-side.
- `frontline_fortress_building_cost` pasa a resolver costes desde catalogo interno con `security definer`.
- El smoke valida costes de Fortress contra el catalogo en lugar de comparar contra un numero fijo.
- Actualizada la documentacion de operaciones autoritativas para reflejar Fortress upgrades data-driven.

### Security
- El cliente sigue solicitando solo `buildingId`; no decide coste, max level ni curva de progresion.
- `server_frontline_fortress_buildings` queda sin grants para `authenticated`.
- La operacion mantiene ownership, idempotencia, coste atomico y ledger de recursos gastados.

### Tested
- `npx.cmd supabase migration up --local`
- `npx.cmd supabase db reset`
- `npx.cmd supabase db query --local --file supabase/smoke-tests/adventure_shop_rpcs.sql --output table`
- `npx.cmd supabase db query --local --output table` para confirmar que `authenticated` no puede leer ni modificar `server_frontline_fortress_buildings`.
- `npm.cmd test -- tests/server.authoritativeOperationDispatcher.test.ts tests/server.authoritativeRpcProxy.test.ts tests/server.authoritativeOperations.test.ts tests/storeAuthoritativeFallback.test.ts`
- `npm.cmd run check`
- `npm.cmd test`
- `npm.cmd run build`

## [0.32.8] - 2026-05-14

### Added
- Backend introduce `server_event_definitions` para definir eventos, preset, nivel de desbloqueo y reward diario first-clear.
- Registrado catalogo inicial de rewards para `gold_rush`, `arcane_surge` y `td_fortress_siege`.

### Changed
- `record_event_result` deja de tener hardcodeados eventos, presets, niveles de desbloqueo y rewards.
- Los rewards diarios first-clear de Events se conceden mediante `grant_reward_definition`.
- El smoke valida `gold_rush` contra `server_event_definitions` + `server_reward_definitions`.
- Actualizada la documentacion de operaciones autoritativas para reflejar Event results data-driven.

### Security
- El cliente sigue sin enviar ni decidir unlock level, preset ni rewards de Events.
- `server_event_definitions` queda sin grants para `authenticated`.
- La operacion mantiene ownership, idempotencia, daily first-clear server-side y ledger por reward grant.

### Tested
- `npx.cmd supabase migration up --local`
- `npx.cmd supabase db reset`
- `npx.cmd supabase db query --local --file supabase/smoke-tests/adventure_shop_rpcs.sql --output table`
- `npx.cmd supabase db query --local --output table` para confirmar que `authenticated` no puede leer catalogos internos ni ejecutar grants internos.
- `npm.cmd test -- tests/server.authoritativeOperationDispatcher.test.ts tests/server.authoritativeRpcProxy.test.ts tests/server.authoritativeOperations.test.ts tests/storeAuthoritativeFallback.test.ts`
- `npm.cmd run check`
- `npm.cmd test`
- `npm.cmd run build`

## [0.32.7] - 2026-05-14

### Added
- Backend introduce `server_arena_opponents` para definir rivales Arena, preset, coste de ticket y rewards por resultado.
- Registrado catalogo inicial de rewards para victorias Arena y recompensas de empate/derrota.

### Changed
- `record_arena_result` deja de tener hardcodeados los rivales, presets y rewards y lee la configuracion desde catalogo server-side.
- Los rewards de Arena se conceden mediante `grant_reward_definition`.
- El smoke valida coste y reward de `arena_bonewood` contra `server_arena_opponents` + `server_reward_definitions`.
- Actualizada la documentacion de operaciones autoritativas para reflejar Arena results data-driven.

### Security
- El cliente sigue sin enviar ni decidir coste de ticket, preset ni rewards de Arena.
- `server_arena_opponents` queda sin grants para `authenticated`.
- La operacion mantiene ownership, idempotencia, coste atomico de ticket y ledger por coste/reward.

### Tested
- `npx.cmd supabase migration up --local`
- `npx.cmd supabase db reset`
- `npx.cmd supabase db query --local --file supabase/smoke-tests/adventure_shop_rpcs.sql --output table`
- `npx.cmd supabase db query --local --output table` para confirmar que `authenticated` no puede leer catalogos internos ni ejecutar grants internos.
- `npm.cmd test -- tests/server.authoritativeOperationDispatcher.test.ts tests/server.authoritativeRpcProxy.test.ts tests/server.authoritativeOperations.test.ts tests/storeAuthoritativeFallback.test.ts`
- `npm.cmd run check`
- `npm.cmd test`
- `npm.cmd run build`

## [0.32.6] - 2026-05-14

### Added
- Backend introduce `server_adventure_battle_nodes` para definir nodos Adventure de combate por `node_id`, tipo, prerequisitos, unlocks y rewards first-clear/replay.
- Registrado catalogo inicial de rewards para nodos de combate Chapter 1 manteniendo el comportamiento actual.

### Changed
- `claim_adventure_battle_result` deja de tener hardcodeadas las ramas por nodo y lee la configuracion desde catalogo server-side.
- Los rewards de victoria Adventure se conceden mediante `grant_reward_definition`.
- El smoke valida first-clear y replay de `c1l1` contra `server_adventure_battle_nodes` + `server_reward_definitions`.
- Actualizada la documentacion de operaciones autoritativas para reflejar Adventure battle rewards data-driven.

### Security
- El cliente sigue sin enviar ni decidir rewards, unlocks, prerequisitos ni repeat policy de nodos de combate Adventure.
- `server_adventure_battle_nodes` queda sin grants para `authenticated`.
- La claim mantiene ownership, idempotencia, prerequisitos server-side, ledger por reward grant y bloqueo de Chapter 2 al no estar catalogado.

### Tested
- `npx.cmd supabase migration up --local`
- `npx.cmd supabase db reset`
- `npx.cmd supabase db query --local --file supabase/smoke-tests/adventure_shop_rpcs.sql --output table`
- `npx.cmd supabase db query --local --output table` para confirmar que `authenticated` no puede leer catalogos internos ni ejecutar grants internos.
- `npm.cmd test -- tests/server.authoritativeOperationDispatcher.test.ts tests/server.authoritativeRpcProxy.test.ts tests/server.authoritativeOperations.test.ts tests/storeAuthoritativeFallback.test.ts`
- `npm.cmd run check`
- `npm.cmd test`
- `npm.cmd run build`

## [0.32.5] - 2026-05-14

### Added
- Backend introduce `server_adventure_map_interactions` para definir interactuables Adventure por `interaction_id`, coste de llave, prerequisitos y cooldown.
- Backend introduce `server_adventure_map_loot_entries` para definir loot tables ponderadas por tier y `reward_id`.
- Registrado catalogo inicial de loot para `c1-lower-cache` manteniendo los mismos lotes common/rare/epic/legendary.

### Changed
- `open_adventure_map_interaction` deja de tener hardcodeado el key chest y lee interaccion, coste, reset y loot desde catalogos server-side.
- El loot elegido concede rewards mediante `grant_reward_definition`.
- El smoke valida el reward del cofre contra `server_adventure_map_loot_entries` + `server_reward_definitions`.
- Actualizada la documentacion de operaciones autoritativas para reflejar key chest data-driven.

### Security
- El cliente sigue sin enviar ni decidir loot, probabilidades, coste ni rewards del cofre de mapa.
- Los catalogos internos de interacciones y loot quedan sin grants para `authenticated`.
- La apertura mantiene ownership, idempotencia, prerequisitos server-side, coste atomico de llave y bloqueo por cooldown.

### Tested
- `npx.cmd supabase migration up --local`
- `npx.cmd supabase db reset`
- `npx.cmd supabase db query --local --file supabase/smoke-tests/adventure_shop_rpcs.sql --output table`
- `npx.cmd supabase db query --local --output table` para confirmar que `authenticated` no puede leer catalogos internos ni ejecutar grants internos.
- `npm.cmd test -- tests/server.authoritativeOperationDispatcher.test.ts tests/server.authoritativeRpcProxy.test.ts tests/server.authoritativeOperations.test.ts tests/storeAuthoritativeFallback.test.ts`
- `npm.cmd run check`
- `npm.cmd test`
- `npm.cmd run build`

## [0.32.4] - 2026-05-14

### Added
- Backend introduce `server_adventure_node_rewards` para definir nodos Adventure no-combate reclamables por `node_id`, `chapter_id`, prerequisitos y `reward_id`.
- Registrados rewards catalogados para `c1l3` y `c1l7`.

### Changed
- `claim_adventure_node_reward` lee prerequisitos y rewards desde catalogo server-side y concede mediante `grant_reward_definition`.
- El smoke valida el reward de `c1l3` contra `server_adventure_node_rewards` + `server_reward_definitions`.
- Actualizada la documentacion de operaciones autoritativas para reflejar Adventure node rewards data-driven.

### Security
- El cliente sigue sin enviar ni decidir rewards de nodos Adventure.
- `server_adventure_node_rewards` queda sin grants para `authenticated`.
- Claims de nodos mantienen ownership, idempotencia, prerequisitos server-side y bloqueo de doble claim.

### Tested
- `npx.cmd supabase migration up --local`
- `npx.cmd supabase db reset`
- `npx.cmd supabase db query --local --file supabase/smoke-tests/adventure_shop_rpcs.sql --output table`
- `npx.cmd supabase db query --local --output table` para confirmar que `authenticated` no puede leer catalogos internos ni ejecutar grants internos.
- `npm.cmd test -- tests/server.authoritativeOperationDispatcher.test.ts tests/server.authoritativeRpcProxy.test.ts tests/server.authoritativeOperations.test.ts tests/storeAuthoritativeFallback.test.ts`
- `npm.cmd run check`
- `npm.cmd test`
- `npm.cmd run build`

## [0.32.3] - 2026-05-14

### Added
- Backend introduce `server_mission_definitions` para definir misiones server-side por `kind`, `metric`, `target` y `reward_id`.
- Missions registra rewards `mission_*` en `server_reward_definitions`.

### Changed
- `advance_mission_progress` ya no usa ramas fijas por metrica; avanza las misiones activas definidas en `server_mission_definitions`.
- `claim_mission_reward` lee target/reward desde catalogo y concede mediante `grant_reward_definition`.
- El smoke de Adventure/Shop valida misiones contra el catalogo server-side en vez de asumir rewards o targets fijos.
- Actualizada la documentacion de operaciones autoritativas para reflejar Missions data-driven.

### Security
- El cliente sigue sin poder enviar progreso ni rewards de misiones.
- `server_mission_definitions` queda sin grants para `authenticated`.
- Claims de Missions mantienen ciclo server-side, ownership, idempotencia y bloqueo de doble claim.

### Tested
- `npx.cmd supabase migration up --local`
- `npx.cmd supabase db reset`
- `npx.cmd supabase db query --local --file supabase/smoke-tests/adventure_shop_rpcs.sql --output table`
- `npx.cmd supabase db query --local --output table` para confirmar que `authenticated` no puede leer `server_reward_definitions`/`server_mission_definitions` ni ejecutar grants internos.
- `npm.cmd test -- tests/server.authoritativeOperationDispatcher.test.ts tests/server.authoritativeRpcProxy.test.ts tests/storeAuthoritativeFallback.test.ts tests/missionAuthoritativeClaims.test.ts`
- `npm.cmd run check`
- `npm.cmd test`
- `npm.cmd run build`

## [0.32.2] - 2026-05-14

### Added
- Daily Login registra `daily_login_streak_1..7` en `server_reward_definitions`.

### Changed
- `claim_daily_login` ahora calcula elegibilidad/streak y concede rewards mediante `grant_reward_definition`.
- El smoke de Adventure/Shop valida el reward diario contra `server_reward_definitions` en vez de asumir cantidades fijas.
- Actualizada la documentacion de operaciones autoritativas para reflejar Daily Login como consumidor del sistema de rewards server-side.

### Security
- Daily Login mantiene dia UTC, claim unica, idempotencia y ownership en servidor.
- El cliente sigue sin poder decidir recompensas diarias ni ejecutar directamente funciones internas de grant.

### Tested
- `npx.cmd supabase migration up --local`
- `npx.cmd supabase db reset`
- `npx.cmd supabase db query --local --file supabase/smoke-tests/adventure_shop_rpcs.sql --output table`
- `npx.cmd supabase db query --local --output table` para confirmar que `authenticated` no puede leer `server_reward_definitions` ni ejecutar funciones internas de grant.
- `npm.cmd test -- tests/server.authoritativeOperationDispatcher.test.ts tests/server.authoritativeRpcProxy.test.ts tests/storeAuthoritativeFallback.test.ts`
- `npm.cmd run check`
- `npm.cmd test`
- `npm.cmd run build`

## [0.32.1] - 2026-05-14

### Added
- Backend introduce la base reutilizable `server_reward_definitions`, `grant_reward_bundle` y `grant_reward_definition` para aplicar rewards server-side desde datos.
- `jsonb_reward_payload_is_valid` centraliza la validacion de payloads de rewards para recursos, account XP, XP de squad, shards y cartas.

### Changed
- `purchase_shop_offer` deja de duplicar la logica de concesion de rewards y usa `grant_reward_bundle` como primer consumidor controlado.
- Documentado el patron de rewards server-side para futuras migraciones incrementales de Adventure, Missions y Daily Login.

### Security
- Mantiene las funciones internas de concesion sin grants para `authenticated`, reduciendo el riesgo de que el cliente invoque rewards directamente.
- Refuerza el modelo server-authoritative: las RPCs validan accion/contexto y delegan la aplicacion atomica de rewards a una primitiva comun.

### Tested
- `npx.cmd supabase migration up --local`
- `npx.cmd supabase db reset`
- `npx.cmd supabase db query --local --file supabase/smoke-tests/adventure_shop_rpcs.sql --output table`
- `npx.cmd supabase db query --local --output table` para confirmar que `authenticated` no puede ejecutar `grant_reward_bundle` ni `grant_reward_definition`.
- `npm.cmd test -- tests/server.authoritativeOperationDispatcher.test.ts tests/storeAuthoritativeFallback.test.ts tests/server.authoritativeOperations.test.ts`
- `npm.cmd run check`
- `npm.cmd test`
- `npm.cmd run build`

## [0.32.0] - 2026-05-14

### Added
- Shop amplia el catalogo server-side `server_shop_offers` para recompensas de progresion: `accountXp`, XP de squad Frontline, shards de heroes y unlocks de cartas.
- El catalogo autoritativo incluye bundles de progresion, entrenamiento y shard packs sin crear ramas nuevas por oferta.
- La RPC `purchase_shop_offer` devuelve `requiresSnapshotRefresh` cuando una compra modifica cuenta, heroes o cartas.

### Changed
- El cliente rehidrata el snapshot server-side despues de compras autoritativas que afectan progresion, evitando calcular en local estados sensibles de cuenta/heroes/cartas.
- Los smoke tests de Shop comparan recompensas y limites contra `server_shop_offers` en vez de fijar balances concretos en el test.
- Actualizada la documentacion de operaciones autoritativas para reflejar el alcance data-driven actual del catalogo.

### Security
- Mantiene coste, recompensa, daily limit, one-time, prerequisitos e idempotencia bajo autoridad del servidor para ofertas de Shop.
- Reduce el acoplamiento inseguro a valores de balance concretos: el servidor valida invariantes y el catalogo define cantidades modificables.
- Evita fallback local en cuentas vinculadas cuando el servidor rechaza o no conoce una oferta.

### Tested
- `npx.cmd supabase db query --local --file supabase/smoke-tests/adventure_shop_rpcs.sql --output table`
- `npm.cmd test -- tests/server.authoritativeOperationDispatcher.test.ts tests/storeAuthoritativeFallback.test.ts tests/server.authoritativeOperations.test.ts`
- `npm.cmd run typecheck`
- `npm.cmd run check`
- `npm.cmd test`
- `npm.cmd run build`

## [0.31.0] - 2026-05-14

### Added
- Shop introduce el catalogo server-side `server_shop_offers` para compras data-driven.
- `purchase_shop_offer` lee coste, recompensa, limite diario, one-time, ventana temporal y prerequisitos desde datos en vez de ramas hardcodeadas por oferta.
- El catalogo inicial cubre ofertas de recursos simples: `adventure_key_ring`, `daily_raid_payout`, `daily_arena_tickets`, `keep_construction_chest`, `arcane_ink_crate` y `arena_push_kit`.

### Changed
- El dispatcher cliente ya no mantiene una allowlist fija de ofertas autoritativas.
- Cuentas vinculadas envian cualquier compra de Shop al servidor; si el catalogo server-side la rechaza, no hay fallback local.
- Documentada la frontera actual: ofertas con `xp`, `accountXp`, shards o cartas quedan pendientes hasta aplicar snapshots/patches autoritativos completos de cuenta/heroes/cartas.

### Security
- Reduce el riesgo de divergencia cliente-servidor al mover coste/reward/limites de Shop a datos controlados por servidor.
- Mantiene idempotencia, validacion de recursos, prerequisitos, limites diarios y ledger dentro de la RPC.
- Evita que una oferta nueva quede accidentalmente autorizada por el cliente sin existir en el catalogo del servidor.

### Tested
- `npx.cmd supabase migration up --local`
- `npx.cmd supabase db query --local --file supabase/smoke-tests/adventure_shop_rpcs.sql --output table`
- `npm.cmd test -- tests/server.authoritativeOperationDispatcher.test.ts tests/storeAuthoritativeFallback.test.ts tests/server.authoritativeOperations.test.ts`
- `npm.cmd run typecheck`
- `npm.cmd run check`
- `npm.cmd test`
- `npm.cmd run build`

## [0.30.24] - 2026-05-14

### Added
- Shop soporta `daily_arena_tickets` mediante la RPC autoritativa `purchase_shop_offer`.
- El smoke de Adventure/Shop cubre compra, replay idempotente y bloqueo por limite diario de `daily_arena_tickets`.

### Changed
- Actualizada la documentacion de operaciones autoritativas para reflejar las tres ofertas de Shop ya server-side: `adventure_key_ring`, `daily_raid_payout` y `daily_arena_tickets`.

### Security
- Cuentas vinculadas ya no necesitan fallback local para comprar tickets diarios de Arena.
- La compra valida coste, limite diario, idempotencia y ledger en servidor antes de conceder tickets.

### Tested
- `npx.cmd supabase migration up --local`
- `npx.cmd supabase db query --local --file supabase/smoke-tests/adventure_shop_rpcs.sql --output table`
- `npm.cmd test -- tests/server.authoritativeOperationDispatcher.test.ts tests/storeAuthoritativeFallback.test.ts`
- `npm.cmd run typecheck`
- `npm.cmd run check`
- `npm.cmd run build`

## [0.30.23] - 2026-05-14

### Added
- Shop soporta `daily_raid_payout` mediante la RPC autoritativa `purchase_shop_offer`.
- El smoke de Adventure/Shop cubre compra, replay idempotente, segunda compra diaria y bloqueo por limite diario de `daily_raid_payout`.

### Security
- Cuentas vinculadas pueden comprar `daily_raid_payout` solo mediante validacion server-side de coste, limite diario, idempotencia y ledger.
- Las ofertas de Shop sin operacion autoritativa siguen bloqueadas para cuentas vinculadas y quedan limitadas al fallback invitado de alpha.

### Tested
- `npx.cmd supabase migration up --local`
- `npx.cmd supabase db query --local --file supabase/smoke-tests/adventure_shop_rpcs.sql --output table`
- `npm.cmd test -- tests/server.authoritativeOperationDispatcher.test.ts tests/storeAuthoritativeFallback.test.ts`
- `npm.cmd run typecheck`
- `npm.cmd run check`
- `npm.cmd run build`

## [0.30.22] - 2026-05-14

### Changed
- Shop bloquea en cuentas vinculadas las ofertas que aun no tienen operacion autoritativa.
- El modo invitado mantiene compras locales de ofertas no autoritativas como fallback de alpha.

### Security
- Reduce el riesgo de que una cuenta online compre ofertas no validadas por servidor.
- `adventure_key_ring` sigue usando la ruta autoritativa existente; el resto queda pendiente de RPC antes de economia online real.

### Tested
- `npm.cmd test -- tests/storeAuthoritativeFallback.test.ts tests/server.authoritativeOperationDispatcher.test.ts`
- `npm.cmd run typecheck`

## [0.30.21] - 2026-05-14

### Changed
- Roadmap y milestones ya no conceden rewards locales en cuentas vinculadas mientras no tengan RPC autoritativa propia.
- El modo invitado conserva los claims locales de roadmap/milestones como fallback de alpha.

### Security
- Reduce la superficie donde una cuenta online podia convertir progreso local manipulable en recursos.
- Los claims de progreso meta sin operación server-side quedan bloqueados para cuentas vinculadas.

### Tested
- `npm.cmd test -- tests/storeAuthoritativeFallback.test.ts tests/metaRewardClaims.test.ts`
- `npm.cmd run typecheck`

## [0.30.20] - 2026-05-14

### Changed
- Los empates de Adventure ya no conceden rewards locales en cuentas vinculadas.
- El modo invitado mantiene los rewards locales de empate de Adventure como fallback de alpha.

### Security
- Cierra un bypass donde una cuenta vinculada podia recibir rewards de empate sin pasar por RPC autoritativa.
- Mantiene la regla de no convertir resultados no soportados por servidor en economia online.

### Tested
- `npm.cmd test -- tests/storeAuthoritativeFallback.test.ts tests/frontlineBattleRewardPolicy.test.ts`
- `npm.cmd run typecheck`

## [0.30.19] - 2026-05-14

### Changed
- Extraida politica de persistencia de resultados Frontline para diferenciar combates autoritativos, Adventure y practica local.
- Las cuentas vinculadas ya no persisten rewards/progreso de combates locales no autoritativos desde `/battle`.
- Si un claim de Adventure falla por servidor/sesion, el resultado de combate no marca victoria local ni progreso local por accidente.

### Security
- Reduce el riesgo de que combates no validados por servidor alimenten misiones o recursos online en cuentas vinculadas.
- El modo invitado conserva el fallback local de alpha.

### Tested
- `npm.cmd test -- tests/frontlineBattleRewardPolicy.test.ts tests/storeAuthoritativeFallback.test.ts`
- `npm.cmd run typecheck`

## [0.30.18] - 2026-05-14

### Changed
- Missions considera ahora autoritativas todas las metricas actuales con fuente server-side: Adventure, Arena, Events, batallas ganadas y mejoras de heroes.
- Cuentas vinculadas no convierten misiones futuras no soportadas en rewards locales si la politica no encuentra fuente server-side conocida.
- Actualizada la documentacion de operaciones autoritativas para reflejar que `heroes_upgraded` ya nace de RPCs server-side.

### Security
- Se reduce la superficie de manipulacion de progreso local en claims de Missions para cuentas vinculadas.
- Los claims de misiones actuales pasan por `claimMissionAuthoritatively` cuando hay cuenta online, manteniendo fallback local solo para invitado/API desactivada.

### Tested
- `npm.cmd test -- tests/missionAuthoritativeClaims.test.ts tests/storeAuthoritativeFallback.test.ts`
- `npm.cmd run typecheck`

## [0.30.17] - 2026-05-14

### Added
- Aniadida RPC autoritativa `record_event_result` para registrar resultados de Events.
- Aniadido contrato `recordEventResult` al cliente/proxy autoritativo.
- El smoke Supabase cubre primera victoria diaria de Event, idempotencia, segundo intento sin reward y rechazo de evento no soportado.

### Changed
- `/events` usa `recordEventResultOnlineFirst` al finalizar combate.
- En cuentas vinculadas, el servidor decide si el Event concede recompensa diaria; invitado/API desactivada conserva flujo local.
- El smoke Supabase limpia `battle_results` del perfil de prueba para evitar resultados acumulados entre ejecuciones.

### Security
- El cliente ya no puede elegir rewards de Events cuando hay sesion vinculada.
- La RPC valida `auth.uid()`, evento allowlisted, desbloqueo por nivel, idempotencia y registra recursos en `resource_ledger`.
- Los resultados se guardan en `battle_results` con `source = 'event'` para alimentar misiones server-side.

### Known Limitations
- El MVP no simula la batalla en servidor ni valida todavia un log determinista completo; antes de Events competitivos o rankings habra que validar resultado con seed/log o ejecutar simulacion autoritativa.

### Tested
- `npm.cmd test -- tests/server.authoritativeOperations.test.ts tests/server.authoritativeRpcProxy.test.ts tests/server.authoritativeClient.test.ts tests/server.authoritativeOperationDispatcher.test.ts tests/storeAuthoritativeFallback.test.ts`
- `npm.cmd run typecheck`
- `npx.cmd supabase migration up --local`
- `npx.cmd supabase db query --local --file supabase/smoke-tests/adventure_shop_rpcs.sql --output table`
- `npm.cmd test`
- `npm.cmd run check`
- `npm.cmd run build`

## [0.30.16] - 2026-05-14

### Added
- Aniadida RPC autoritativa `record_arena_result` para registrar resultados de Arena.
- Aniadido contrato `recordArenaResult` al cliente/proxy autoritativo.
- El smoke Supabase cubre resultado de Arena, consumo de ticket, rewards, idempotencia y rechazo de rival no soportado.

### Changed
- `/arena` usa `recordArenaResultOnlineFirst` al finalizar combate.
- En cuentas vinculadas, el ticket y las recompensas de Arena los decide el servidor; invitado/API desactivada conserva flujo local.
- El contrato de Arena acepta `draw` y bloquea campos extra como rewards enviados por cliente.

### Security
- El cliente ya no puede elegir rewards ni evitar coste de ticket en Arena cuando hay sesion vinculada.
- La RPC valida `auth.uid()`, rival allowlisted, ticket disponible, idempotencia y registra recursos en `resource_ledger`.
- Los resultados se guardan en `battle_results` con `source = 'arena'` para alimentar misiones server-side.

### Known Limitations
- El MVP no simula la batalla en servidor ni valida todavia un log determinista completo; antes de ladder competitivo real habra que validar el resultado con seed/log o ejecutar simulacion autoritativa.

### Tested
- `npm.cmd test -- tests/server.authoritativeOperations.test.ts tests/server.authoritativeRpcProxy.test.ts tests/server.authoritativeClient.test.ts tests/server.authoritativeOperationDispatcher.test.ts tests/storeAuthoritativeFallback.test.ts`
- `npm.cmd run typecheck`
- `npx.cmd supabase migration up --local`
- `npx.cmd supabase db query --local --file supabase/smoke-tests/adventure_shop_rpcs.sql --output table`
- `npm.cmd test`
- `npm.cmd run check`
- `npm.cmd run build`

## [0.30.15] - 2026-05-14

### Added
- Aniadida RPC autoritativa `resolve_frontline_fortress_raid` para resolver raids de la Fortress visible desde Supabase.
- Aniadido contrato cliente/API para `resolveFrontlineFortressRaid` y proxy hacia la RPC.
- El smoke Supabase cubre resolucion de raid, replay idempotente y bloqueo por cooldown.

### Changed
- `/fortress` usa ahora `resolveFrontlineFortressRaidOnlineFirst`; cuentas invitadas o API desactivada mantienen fallback local.
- La resolucion online devuelve snapshot autoritativo de recursos y `frontlineFortress`.

### Security
- El cliente deja de decidir ataque, defensa, rewards o timing del raid cuando hay sesion vinculada.
- La RPC valida `auth.uid()`, perfil, cooldown, estado de Fortress e idempotencia antes de conceder recursos.
- Oro, Dust y Gems ganados por raids quedan registrados en `resource_ledger`.
- Cuentas vinculadas sin sesion no pueden resolver raids localmente para saltarse reglas autoritativas.

### Tested
- `npm.cmd test -- tests/server.authoritativeOperations.test.ts tests/server.authoritativeRpcProxy.test.ts tests/server.authoritativeOperationDispatcher.test.ts tests/storeAuthoritativeFallback.test.ts`
- `npm.cmd run typecheck`
- `npx.cmd supabase migration up --local`
- `npx.cmd supabase db query --local --file supabase/smoke-tests/adventure_shop_rpcs.sql --output table`
- `npm.cmd test`
- `npm.cmd run check`
- `npm.cmd run build`

## [0.30.14] - 2026-05-14

### Changed
- `sync_local_snapshot` importa ahora `frontlineFortress` para conservar el progreso de Fortress al convertir progreso invitado en cuenta.
- El snapshot normalizado de `syncLocalSnapshot` devuelve tambien `frontlineFortress`.
- La documentacion del modelo backend incluye `player_frontline_fortress` y su mapeo desde snapshot local.

### Security
- La importacion acepta solo campos whitelisted: `buildings`, `integrity`, `garrison` y `raidsResolved`.
- Los niveles e integridad se recortan con rangos conservadores y no se aceptan reports calculados por cliente.
- El estado online existente no se reduce: edificios y raids importados usan maximo contra el servidor.

### Tested
- `npm.cmd test -- tests/server.authoritativeOperations.test.ts tests/server.authoritativeOperationDispatcher.test.ts tests/localSyncSnapshot.test.ts tests/serverPlayerSnapshot.test.ts tests/serverPlayerSnapshotState.test.ts`
- `npx.cmd supabase migration up --local`
- `npx.cmd supabase db query --local --file supabase/smoke-tests/adventure_shop_rpcs.sql --output table`
- `npm.cmd test`
- `npm.cmd run check`
- `npm.cmd run build`

## [0.30.13] - 2026-05-14

### Added
- Aniadida tabla `player_frontline_fortress` para persistir edificios, integridad, guarnicion y raids de la Fortress visible.
- Aniadida RPC autoritativa `upgrade_frontline_fortress` para mejorar `keep`, `treasury` y `barracks` consumiendo recursos server-side.
- El snapshot de servidor devuelve `frontlineFortress` para hidratar progreso online al recargar.

### Changed
- La pantalla `/fortress` usa `upgradeFrontlineFortressOnlineFirst`; el fallback local queda solo para invitado/API desactivada.
- `frontlineFortress.upgradeBuilding` pasa a politica autoritativa. La fortaleza clasica legacy sigue local por separado.

### Security
- La mejora valida `auth.uid()`, perfil, edificio permitido, coste calculado en servidor, recursos suficientes e idempotencia.
- El gasto de oro/polvo queda en `resource_ledger`; cuentas vinculadas no pueden mejorar localmente si la sesion falta.

### Tested
- `npm.cmd test -- tests/server.authoritativeOperations.test.ts tests/server.authoritativeRpcProxy.test.ts tests/server.authoritativeOperationDispatcher.test.ts tests/storeAuthoritativeFallback.test.ts tests/serverPlayerSnapshot.test.ts tests/serverPlayerSnapshotState.test.ts tests/localSyncSnapshot.test.ts tests/progressionAuthoritativePolicy.test.ts`
- `npm.cmd run typecheck`
- `npx.cmd supabase migration up --local`
- `npx.cmd supabase db query --local --file supabase/smoke-tests/adventure_shop_rpcs.sql --output table`
- `npm.cmd test`
- `npm.cmd run check`
- `npm.cmd run build`

## [0.30.12] - 2026-05-14

### Added
- Aniadida RPC autoritativa `skill_up_hero` para mejorar skills de heroes consumiendo Arcane Dust server-side.
- Aniadida accion `skillUpHeroOnlineFirst` en store para futuras UI de mejora de skill.
- El smoke Supabase cubre skill up de heroe, replay idempotente y rechazo de hero id no valido.

### Security
- La mejora online valida `auth.uid()`, perfil, allowlist de heroes, ownership/desbloqueo, skill maximo, Dust suficiente e idempotencia.
- El gasto de Dust queda registrado en `resource_ledger`.
- La mision `heroes_upgraded` avanza desde evento server-side en la RPC.

### Tested
- `npm.cmd run test -- --run tests/server.authoritativeOperations.test.ts tests/server.authoritativeRpcProxy.test.ts tests/server.authoritativeClient.test.ts tests/server.authoritativeOperationDispatcher.test.ts tests/storeAuthoritativeFallback.test.ts tests/progressionAuthoritativePolicy.test.ts`
- `npx.cmd supabase migration up --local`
- `npx.cmd supabase db query --local --file supabase/smoke-tests/adventure_shop_rpcs.sql --output table`
- `npm.cmd run check`
- `npm.cmd run build`

## [0.30.11] - 2026-05-14

### Added
- Aniadida RPC autoritativa `star_up_hero` para subir estrellas de heroes consumiendo shards server-side.
- El modal de heroe usa ahora `starUpHeroOnlineFirst`, con fallback local solo para invitado/API desactivada.
- El smoke Supabase cubre star up de heroe, replay idempotente y rechazo de hero id no valido.

### Security
- La subida online valida `auth.uid()`, perfil, allowlist de heroes, ownership/desbloqueo, estrellas maximas, shards suficientes e idempotencia.
- Las cuentas vinculadas ya no pueden subir estrellas localmente si falta sesion.
- La mision `heroes_upgraded` avanza desde evento server-side en la RPC.

### Tested
- `npm.cmd run test -- --run tests/server.authoritativeOperations.test.ts tests/server.authoritativeRpcProxy.test.ts tests/server.authoritativeClient.test.ts tests/server.authoritativeOperationDispatcher.test.ts tests/storeAuthoritativeFallback.test.ts tests/progressionAuthoritativePolicy.test.ts`
- `npx.cmd supabase migration up --local`
- `npx.cmd supabase db query --local --file supabase/smoke-tests/adventure_shop_rpcs.sql --output table`
- `npm.cmd run check`
- `npm.cmd run build`

## [0.30.10] - 2026-05-14

### Added
- Aniadida RPC autoritativa `level_up_hero` para subir nivel de heroes con coste de oro server-side.
- El modal de heroe usa ahora `levelUpHeroOnlineFirst`, con fallback local solo para invitado/API desactivada.
- El smoke Supabase cubre level up de heroe, replay idempotente y rechazo de hero id no valido.

### Security
- La subida online valida `auth.uid()`, perfil, allowlist de heroes, ownership/desbloqueo, nivel maximo, oro suficiente, idempotencia y ledger server-side.
- Las cuentas vinculadas ya no pueden subir heroes localmente si falta sesion: vuelven al login igual que compras/rewards/cartas.
- La mision `heroes_upgraded` avanza desde evento server-side en la RPC.

### Tested
- `npm.cmd run test -- --run tests/server.authoritativeOperations.test.ts tests/server.authoritativeRpcProxy.test.ts tests/server.authoritativeClient.test.ts tests/server.authoritativeOperationDispatcher.test.ts tests/storeAuthoritativeFallback.test.ts tests/progressionAuthoritativePolicy.test.ts`
- `npx.cmd supabase migration up --local`
- `npx.cmd supabase db query --local --file supabase/smoke-tests/adventure_shop_rpcs.sql --output table`
- `npm.cmd run check`
- `npm.cmd run build`

## [0.30.9] - 2026-05-14

### Added
- Aniadida RPC autoritativa `upgrade_frontline_card` para mejoras de cartas Frontline.
- El Deck usa ahora `upgradeFrontlineCardOnlineFirst`, con fallback local solo para invitado/API desactivada.
- El smoke Supabase cubre mejora de carta, replay idempotente y rechazo de carta no jugable.

### Security
- La mejora online valida `auth.uid()`, perfil, carta desbloqueada, nivel maximo, recursos suficientes, idempotencia y ledger server-side.
- Las cuentas vinculadas ya no pueden mejorar cartas localmente si falta sesion: vuelven a login como en el resto de operaciones sensibles.
- El cliente recibe solo errores seguros y no puede imponer recursos, nivel ni ownership desde el navegador.

### Tested
- `npm.cmd run test -- --run tests/server.authoritativeOperations.test.ts tests/server.authoritativeRpcProxy.test.ts tests/server.authoritativeClient.test.ts tests/server.authoritativeOperationDispatcher.test.ts tests/storeAuthoritativeFallback.test.ts tests/progressionAuthoritativePolicy.test.ts`
- `npx.cmd supabase migration up --local`
- `npx.cmd supabase db query --local --file supabase/smoke-tests/adventure_shop_rpcs.sql --output table`
- `npm.cmd run check`
- `npm.cmd run build`

## [0.30.8] - 2026-05-14

### Changed
- Endurecida la RPC `save_frontline_loadout` para validar ownership de loadout en servidor.
- El servidor rechaza leaders fuera de allowlist, heroes no desbloqueados, cartas no desbloqueadas y duplicados en squad/deck.

### Security
- El cliente ya no puede guardar un loadout online con unidades o cartas que no pertenezcan al perfil.
- La validacion vive en Postgres/RPC, detras de `auth.uid()` y sin confiar en el estado del navegador.
- El smoke autoritativo cubre casos negativos de heroes/cartas desconocidos.

### Tested
- `npm.cmd run smoke:supabase:snapshot`
- `npx.cmd supabase db query --local --file supabase/smoke-tests/adventure_shop_rpcs.sql --output table`
- `npm.cmd run test -- tests/server.authoritativeOperations.test.ts tests/server.authoritativeRpcProxy.test.ts tests/server.authoritativeOperationDispatcher.test.ts`
- `npm.cmd run check`
- `npm.cmd run build`

## [0.30.7] - 2026-05-14

### Changed
- Opciones deja de presentar la accion principal como sincronizacion de progreso local.
- El flujo de crear cuenta desde invitado refresca el snapshot server-side tras convertir la sesion invitada.
- El panel de cuenta vinculada ahora ofrece actualizar desde servidor en vez de importar estado local.
- Actualizados textos de autenticacion para describir invitado anonimo respaldado por servidor y fallback local de alpha.

### Security
- El flujo visible de cuenta sigue la direccion servidor -> cliente y no promueve `localStorage` como fuente de verdad.
- Se conserva `syncLocalSnapshotOnlineFirst` solo como mecanismo transicional interno/de alpha, no como accion principal visible.

### Tested
- `npm.cmd run test -- tests/sessionSecurity.test.ts tests/serverPlayerSnapshotState.test.ts tests/storeAuthoritativeFallback.test.ts`
- `npm.cmd run check`
- `npm.cmd run build`

## [0.30.6] - 2026-05-14

### Added
- Aniadido smoke `npm.cmd run smoke:supabase:guest-upgrade` para validar el flujo invitado anonimo -> cuenta nueva.
- Documentado el smoke de conversion invitada en la guia Supabase y roadmap de seguridad.

### Security
- El smoke usa solo URL publica y anon key, sin service-role ni secretos de servidor.
- Valida que `updateUser` conserva el mismo `user_id`, `profileId` y starter state server-side.
- Refuerza la politica de no hacer merge con cuentas existentes para guardar progreso invitado.

### Tested
- `npm.cmd run smoke:supabase:guest-upgrade`
- `npm.cmd run check`
- `npm.cmd run build`

## [0.30.5] - 2026-05-14

### Added
- Ampliado el provisioning Supabase de usuarios para crear heroes starter, cartas Frontline starter y loadout inicial en servidor.
- Aniadido backfill idempotente para perfiles existentes sin pisar loadouts o progreso ya creado.

### Security
- El estado starter online se crea server-side al alta de Auth, reduciendo dependencia del estado local como fuente inicial.
- La funcion interna de provisioning no concede permisos de ejecucion a `public`, `anon` ni `authenticated`.
- Los smokes validan que invitados anonimos reciben recursos, heroes, cartas y loadout desde servidor.

### Tested
- `npm.cmd run smoke:supabase:guest`
- `npm.cmd run smoke:supabase:snapshot`
- `npm.cmd run test -- tests/serverPlayerSnapshotState.test.ts tests/serverPlayerSnapshot.test.ts`
- `npm.cmd run check`
- `npm.cmd run build`

## [0.30.4] - 2026-05-14

### Changed
- Conectada la carga del snapshot server-side al monitor de sesion Supabase para invitados anonimos y cuentas vinculadas.
- Aniadido adaptador `createServerPlayerSnapshotPatch` para aplicar cuenta, recursos y colecciones online normalizadas al store.

### Security
- La hidratacion online aplica datos en sentido servidor -> cliente y no usa el estado local como autoridad.
- Las cuentas vinculadas vuelven a `undecided` si la lectura de snapshot falla por falta de sesion.
- La aplicacion del snapshot no borra heroes/loadout starter mientras esas filas todavia no esten provisionadas en servidor.

### Tested
- `npm.cmd run test -- tests/serverPlayerSnapshot.test.ts tests/serverPlayerSnapshotState.test.ts tests/storeAuthoritativeFallback.test.ts`
- `npm.cmd run check`
- `npm.cmd run build`

## [0.30.3] - 2026-05-14

### Added
- Aniadida RPC read-only `get_player_snapshot` para leer el estado normalizado del jugador autenticado o anonimo desde Supabase.
- Aniadido helper cliente tipado `loadServerPlayerSnapshot` para consumir el snapshot sin exponer tokens ni detalles internos.
- Aniadido smoke `npm.cmd run smoke:supabase:snapshot` para validar ownership del snapshot local.

### Security
- El snapshot usa `auth.uid()` y devuelve solo datos del perfil propietario.
- La respuesta excluye `server_operations`, ledger e identificadores internos de operaciones.
- Cubierto por smoke que dos usuarios locales no pueden leer datos cruzados.

### Tested
- `npm.cmd run test -- tests/serverPlayerSnapshot.test.ts tests/supabaseBrowserSession.test.ts`
- `npm.cmd run smoke:supabase:snapshot`
- `npm.cmd run check`
- `npm.cmd run build`

## [0.30.2] - 2026-05-14

### Added
- Activado Anonymous Auth en la configuracion local de Supabase.
- Aniadido smoke `npm.cmd run smoke:supabase:guest` para comprobar provisioning de perfiles invitados anonimos.

### Security
- Verificado que un usuario anonimo Supabase crea `profiles` y `player_resources` iniciales mediante el trigger server-side.
- Documentado que Anonymous Sign-Ins debe activarse tambien en Supabase remoto y que produccion debe usar mitigaciones anti-abuso.

### Tested
- `npm.cmd run smoke:supabase:guest`
- `npm.cmd run check`
- `npm.cmd run build`

## [0.30.1] - 2026-05-14

### Fixed
- Los usuarios invitados vuelven a ver el gate de autenticacion tras recargar o reabrir la pagina, despues de la intro.
- La sesion anonima Supabase ya no se presenta como cuenta vinculada en el gate de entrada.
- `Continuar como invitado` reutiliza la sesion anonima existente si ya existe.

### Security
- El invitado puede elegir login con cuenta existente tras recargar sin hacer merge con el progreso invitado.
- La eleccion de continuar como invitado solo se recuerda durante la carga actual de pagina, no de forma persistente.

### Tested
- `npm.cmd run test -- tests/sessionSecurity.test.ts tests/supabaseBrowserSession.test.ts`
- `npm.cmd run check`
- `npm.cmd run build`

## [0.30.0] - 2026-05-14

### Changed
- Redisenado el flujo objetivo de invitado hacia sesiones anonimas Supabase respaldadas por servidor.
- `Jugar como invitado` intenta crear una sesion anonima Supabase antes de caer al modo local de alpha.
- El monitor de sesion distingue usuarios anonimos de cuentas vinculadas.
- El flujo invitado -> cuenta prepara conversion del usuario anonimo con email/password en vez de crear una cuenta separada.

### Security
- Documentado que el objetivo ya no es importar progreso sensible desde `localStorage`, sino conservar un perfil invitado de servidor y vincularlo a cuenta nueva.
- El flujo invitado -> cuenta sigue sin permitir login/merge con cuenta existente.
- Los snapshots locales quedan como transicion/fallback, no como arquitectura final para economia online.

### Tested
- `npm.cmd run test -- tests/sessionSecurity.test.ts tests/supabaseBrowserSession.test.ts`
- `npm.cmd run check`
- `npm.cmd run build`

## [0.29.13] - 2026-05-14

### Changed
- Endurecido el contrato de `syncLocalSnapshot` con limites explicitos para mapas de cartas, progreso Adventure y claims de mapa.

### Security
- Los snapshots locales manipulados con mapas excesivos se rechazan antes de llegar a persistencia.
- Cubierto por tests que el snapshot no acepta campos raiz no permitidos ni sincroniza campos locales como `accountLinkMode` o `hasSeenIntro`.

### Tested
- `npm.cmd run test -- tests/server.authoritativeOperations.test.ts tests/localSyncSnapshot.test.ts`
- `npm.cmd run check`
- `npm.cmd run build`

## [0.29.12] - 2026-05-14

### Changed
- Extraidas reglas del gate de autenticacion a helpers testeables de seguridad de sesion.

### Security
- Cubierto por tests que el flujo invitado -> cuenta fuerza creacion de cuenta nueva y no login.
- Cubierto por tests que el flujo invitado -> cuenta bloquea sesiones ya autenticadas para evitar merge accidental.
- Cubierto por tests que los errores de creacion desde invitado son genericos salvo configuracion/rate-limit.

### Tested
- `npm.cmd run test -- tests/sessionSecurity.test.ts`
- `npm.cmd run check`
- `npm.cmd run build`

## [0.29.11] - 2026-05-14

### Added
- Aniadido script `npm.cmd run audit:high` para auditar vulnerabilidades altas o criticas sin forzar fixes automaticos.

### Security
- Documentada la politica de no usar `npm audit fix --force` sin revisar el plan de cambios.
- Documentado el workaround seguro `NODE_OPTIONS=--use-system-ca` para auditorias npm en Windows cuando Node no usa el almacen de certificados del sistema.
- Registrada la vulnerabilidad moderada conocida de `next`/`postcss` como seguimiento pendiente hasta que exista version estable compatible.

### Tested
- `npm.cmd run check`
- `npm.cmd run audit:high`
- `npm.cmd run build`

## [0.29.10] - 2026-05-14

### Added
- Aniadidos tests de integracion del store para la politica de fallback autoritativo.

### Security
- Cubierto por regresion que una cuenta `linked` sin sesion Supabase no pueda reclamar daily rewards ni comprar ofertas mediante fallback local.
- Verificado que el fallback local sigue permitido para modo invitado/offline y para API desactivada.

### Tested
- `npm.cmd run test -- tests/storeAuthoritativeFallback.test.ts`
- `npm.cmd run check`
- `npm.cmd run build`

## [0.29.9] - 2026-05-14

### Added
- Aniadido rate limit basico en memoria para `/api/server/authoritative`.
- Documentado `rate_limited` como codigo de error esperado en operaciones autoritativas.

### Security
- El rate limit se aplica antes de parsear JSON y usa hash del bearer token o IP reenviada, sin almacenar tokens crudos.
- Reducido el riesgo de abuso automatizado o rafagas sobre mutaciones autoritativas de rewards, compras y progreso.

### Tested
- `npm.cmd run test -- tests/server.authoritativeRateLimit.test.ts tests/server.authoritativeRpcProxy.test.ts tests/server.authoritativeOperations.test.ts`
- `npm.cmd run check`
- `npm.cmd run build`

## [0.29.8] - 2026-05-14

### Fixed
- Normalizadas las respuestas de fallo de RPC en `/api/server/authoritative`.

### Security
- Los errores internos de Supabase/Postgres ya no se devuelven al cliente como `reason`.
- Reducida la exposicion de detalles internos de base de datos, JWT o schema ante fallos de operaciones autoritativas.

### Tested
- `npm.cmd run check`
- `npm.cmd run test -- tests/server.authoritativeRpcProxy.test.ts`
- `npm.cmd run build`

## [0.29.7] - 2026-05-14

### Fixed
- Bloqueada la caida local de operaciones `OnlineFirst` sensibles cuando una cuenta vinculada no tiene sesion Supabase activa.
- Las operaciones de rewards, compras, daily login, cofres/interacciones y guardado de loadout vuelven a requerir login si falta la sesion online.

### Security
- Evitado que una sesion vinculada expirada o ausente pueda otorgar recursos/progreso mediante fallback local.
- El fallback local se mantiene para modo invitado/offline y para entornos con API desactivada, sin romper el flujo local de desarrollo.

### Tested
- `npm.cmd run check`
- `npm.cmd run test -- tests/sessionSecurity.test.ts tests/server.authoritativeOperationDispatcher.test.ts`
- `npm.cmd run build`

## [0.29.6] - 2026-05-14

### Fixed
- Reconciliado el estado local de cuenta con la sesion real Supabase al arrancar.
- El modo invitado inicial intenta cerrar cualquier sesion Supabase previa para evitar operaciones online accidentales.

### Security
- Una cuenta marcada como `linked` sin sesion activa vuelve a requerir login.
- Una sesion autenticada real marca la cuenta como `linked`.
- Si Supabase Auth no esta configurado, el estado local cae a invitado en vez de quedar falsamente como online.

### Tested
- `npm.cmd run check`
- `npm.cmd run test -- tests/sessionSecurity.test.ts tests/supabaseBrowserSession.test.ts`

## [0.29.5] - 2026-05-14

### Added
- Aniadido monitor global de seguridad de sesion para detectar inactividad en cualquier pantalla del juego.
- Aniadido timeout de inactividad de una hora para cuentas vinculadas, con re-login obligatorio al expirar.
- Aniadidos helpers puros para evaluar expiracion por inactividad y throttling de actividad.

### Security
- La sesion Supabase sigue con refresh automatico mientras existe sesion, pero el cliente fuerza cierre tras inactividad prolongada.
- Al expirar por inactividad, se cierra Supabase, se marca la cuenta como no resuelta y se muestra el gate de login con mensaje generico.

### Tested
- `npm.cmd run check`
- `npm.cmd run test -- tests/sessionSecurity.test.ts tests/supabaseBrowserSession.test.ts`

## [0.29.4] - 2026-05-14

### Added
- Aniadido cierre de sesion desde el panel de cuenta en Opciones.

### Security
- El cierre de sesion usa el helper central Supabase y no borra progreso local; cambia la sesion visible a modo invitado/local si el cierre se completa.
- Los errores de cierre de sesion se muestran con mensaje generico, sin exponer detalles del proveedor.

### Tested
- `npm.cmd run check`
- `npm.cmd run test -- tests/supabaseBrowserSession.test.ts`

## [0.29.3] - 2026-05-14

### Added
- Aniadido modal de recuperacion para establecer nueva password cuando Supabase devuelve una sesion `PASSWORD_RECOVERY`.
- Aniadido helper central `updateSupabasePassword` y suscripcion a eventos Auth sin exponer tokens en el store.

### Security
- El modal limpia tokens/hash de recuperacion de la URL tras detectar el flujo.
- Los errores de cambio de password se muestran con mensajes genericos, sin revelar detalles internos del proveedor.

### Tested
- `npm.cmd run check`
- `npm.cmd run test -- tests/supabaseBrowserSession.test.ts`

## [0.29.2] - 2026-05-14

### Added
- Aniadida accion de recuperacion de acceso por email en el gate inicial de cuenta.
- Centralizado `resetPasswordForEmail` en los helpers de sesion Supabase del cliente.

### Security
- La recuperacion de acceso usa respuesta generica y no confirma si el email existe, no existe o esta en otro estado.
- La recuperacion no aparece en el flujo invitado -> cuenta nueva, preservando la separacion con cuentas existentes.

### Tested
- `npm.cmd run check`
- `npm.cmd run test -- tests/supabaseBrowserSession.test.ts`

## [0.29.1] - 2026-05-14

### Fixed
- Separado el flujo de cuenta inicial del flujo invitado -> cuenta: desde Opciones ahora solo se puede crear una cuenta nueva para guardar el progreso invitado.
- El flujo de guardado invitado ya no muestra pestañas de login ni acceso Google, evitando vincular o fusionar progreso invitado con una cuenta existente.
- Al crear cuenta desde una partida invitada se intenta sincronizar automaticamente el snapshot local y queda reintentable desde Opciones si falla.

### Security
- Los errores de creacion de cuenta desde invitado usan mensajes genericos para no revelar si un email existe, no existe o esta en otro estado.
- Documentada la regla de no enumeracion de cuentas y la prohibicion de merge invitado -> cuenta existente.

### Tested
- `npm.cmd run check`

## [0.29.0] - 2026-05-14

### Added
- Aniadida operacion autoritativa `syncLocalSnapshot` para importar progreso local/invitado a una cuenta autenticada.
- Aniadida RPC Supabase `sync_local_snapshot` con idempotencia, hash de payload, caps conservadores y merge que no reduce progreso online existente.
- Aniadido builder `createLocalSyncSnapshot` para enviar solo campos whitelisted del store local.
- Aniadido boton en Opciones para sincronizar progreso local cuando la cuenta ya esta vinculada.

### Security
- La importacion no acepta el store completo ni recursos ilimitados: valida shape en TypeScript, aplica allowlists/caps en SQL y requiere JWT autenticado.
- La operacion no hace fallback local si el servidor conectado rechaza la solicitud.

### Tested
- `npm.cmd run test -- tests/server.authoritativeOperations.test.ts tests/server.authoritativeRpcProxy.test.ts tests/server.authoritativeClient.test.ts tests/server.authoritativeOperationDispatcher.test.ts tests/localSyncSnapshot.test.ts`
- `npm.cmd run typecheck`
- `npx.cmd supabase db reset`
- `npx.cmd supabase db query --local --file supabase/smoke-tests/adventure_shop_rpcs.sql --output table`

## [0.28.2] - 2026-05-14

### Fixed
- La intro ahora se muestra una vez por carga real de la web y no se repite al volver a Home durante la misma sesion SPA.
- Home deja de montar el world map detras de la intro para evitar que los efectos de World arranquen ocultos y aparezcan desalineados al cerrar la cinematica.
- Los campos del gate de cuenta ya no quedan deshabilitados cuando la configuracion online no esta disponible; solo se bloquea el envio.

### Tested
- `npm.cmd run check`

## [0.28.1] - 2026-05-14

### Fixed
- Home ahora fuerza la intro antes del gate de cuenta cuando `accountLinkMode` sigue sin decidir, incluso si el flag historico `hasSeenIntro` ya estaba marcado.

### Tested
- `npm.cmd run check`

## [0.28.0] - 2026-05-14

### Added
- Aniadido gate de cuenta despues de la intro con dos rutas: autenticacion online o modo invitado local.
- Aniadido flujo reutilizable de sign-in/sign-up por email/password y acceso Google mediante helper central de Supabase Auth.
- Aniadido panel de cuenta en Opciones para que un jugador invitado pueda abrir la vinculacion de cuenta mas adelante.

### Security
- El flujo de Auth no guarda credenciales ni tokens en el store y solo persiste la decision local `accountLinkMode`.
- Los errores de autenticacion se normalizan antes de mostrarse al jugador, sin filtrar mensajes internos del proveedor.
- La migracion de progreso local a cuenta queda explicitamente diferida hasta implementar `syncLocalSnapshot` server-side.

### Tested
- `npm.cmd run test -- tests/persistedGameState.test.ts tests/supabaseBrowserSession.test.ts`
- `npm.cmd run typecheck`
- `npm.cmd run check`

## [0.27.2] - 2026-05-14

### Security
- Aniadida skill `duskkeep-secure-backend` para guiar trabajo futuro de Supabase/Auth/RPCs con SSDLC, shift-left security, OWASP Top 10/ASVS y MITRE ATT&CK.
- Centralizada la validacion de configuracion publica Supabase, rechazando URLs HTTP no locales y claves publicas que parezcan `service_role`/secret.
- El proxy autoritativo ahora falla cerrado si la configuracion Supabase publica no es segura.
- Ampliada la capa de sesion Supabase del cliente con snapshot sin tokens, sign-in/sign-up/sign-out centralizados y clasificacion segura de errores.

### Tested
- `npm.cmd run typecheck`
- `npm.cmd run test -- tests/supabasePublicConfig.test.ts tests/supabaseBrowserSession.test.ts tests/server.authoritativeRpcProxy.test.ts tests/server.authoritativeClient.test.ts tests/server.authoritativeOperationDispatcher.test.ts`

## [0.27.1] - 2026-05-14

### Security
- Actualizado `next` a `16.2.6`, eliminando las vulnerabilidades altas reportadas para Next 16.
- Actualizados `postcss` a `8.5.10`, `autoprefixer` a `10.5.0` y `eslint-config-next` a `16.2.6`.

### Notes
- `npm audit` queda con 2 vulnerabilidades moderadas por la copia interna `next/node_modules/postcss@8.4.31`; `next@16.2.6` es el `latest` estable y no hay fix estable disponible sin usar canary o dejar un override npm invalido.

### Tested
- `npm.cmd audit --audit-level=high`

## [0.27.0] - 2026-05-14

### Added
- Ampliada la intro cinematica con timeline de 24 segundos, nueva escena de presagio, sombra del jefe, cuervos animados y CTA final.
- Aniadido replay de intro por query param (`?replayIntro=1` o `?intro=1`) manteniendo el control existente desde Opciones.
- Registrado el sprite loop de cuervos en el manifest de intro con test de existencia.

### Changed
- Home vuelve a respetar `hasSeenIntro` para no repetir la intro en cada carga, salvo replay explicito.
- La intro ya no se cierra con Enter/Espacio para evitar skips accidentales durante la carga.
- Limpieza de keys/asset entries no usados y de backups locales mediante ignore de `*.bak`.

### Tested
- `npm.cmd run typecheck`
- `npm.cmd run test -- tests/introAssets.test.ts tests/persistedGameState.test.ts`
- `npm.cmd run check`

## [0.26.5] - 2026-05-12

### Fixed
- Restaurados assets alineados de compatibilidad para `flame_loop` en Home QA, evitando que HMR/cache deje invisibles los flames rojos de `world`.

### Tested
- `npm.cmd run audit:asset-refs`

## [0.26.4] - 2026-05-12

### Fixed
- Revertida la calibracion incorrecta de efectos Home/world que afectaba a fuegos y banderas.
- Restaurado el pipeline anterior de `flame_loop`, flares y banderas de Home para no romper landmarks ni efectos ya calibrados.

### Tested
- `npm.cmd run typecheck`

## [0.26.1] - 2026-05-12

### Added
- Aniadido control en Opciones para reproducir la intro cinematica bajo demanda.

### Changed
- La reproduccion manual de la intro se carga de forma diferida y no modifica el progreso guardado ni el flag persistente de intro vista.

### Tested
- `npm.cmd run typecheck`
- `npm.cmd run check`
- `npm.cmd run build`

## [0.26.0] - 2026-05-12

### Added
- Aniadida intro cinematica antes de Home en la primera entrada del jugador, con escenas temporizadas, skip, CTA final y soporte de reduced motion.
- Aniadido manifest `introAssets` y componentes `GameIntro`, `IntroStage`, `IntroLayer` e `introScenes`.
- Aniadido flag persistente `hasSeenIntro` con acciones `markIntroSeen` y `resetIntro`.
- Aniadidos assets WebP optimizados para la intro y tests para asegurar que existen y mantienen un payload compacto.

### Changed
- Home muestra la intro solo tras hidratacion real del store, evitando flashes para jugadores que ya la vieron.
- Los PNG fuente de intro quedan ignorados; la aplicacion usa las capas WebP registradas.

### Tested
- `npm.cmd run typecheck`
- `npx.cmd vitest run tests/introAssets.test.ts tests/persistedGameState.test.ts`
- `npm.cmd run check`
- `npm.cmd run audit:asset-refs`
- `npm.cmd run build`

## [0.25.294] - 2026-05-12

### Added
- Aniadida constante `PROGRESSION_COMMAND_KINDS` como fuente runtime unica para los tipos de comandos de progresion.

### Changed
- La politica autoritativa de progresion y sus tests reutilizan `PROGRESSION_COMMAND_KINDS`, evitando listas duplicadas al aniadir futuros upgrades.

### Tested
- `npm.cmd run typecheck`
- `npx.cmd vitest run tests/progressionAuthoritativePolicy.test.ts tests/progressionCommands.test.ts tests/progressionCommandStoreAdapter.test.ts`
- `npm.cmd run check`
- `npm.cmd run build`

## [0.25.293] - 2026-05-12

### Added
- Aniadida politica `progressionAuthoritativePolicy` para declarar que upgrades de heroes, cartas y fortaleza siguen locales hasta tener modelo/RPC estable.
- Aniadidos tests para evitar que un comando de progresion pase a autoritativo accidentalmente.

### Changed
- Actualizada la documentacion de operaciones autoritativas para reflejar que `claimMission` ya esta conectado de forma acotada.
- Documentado que la progresion sensible queda bloqueada por politica hasta cerrar diseno, migracion y backend.

### Tested
- `npm.cmd run typecheck`
- `npx.cmd vitest run tests/progressionAuthoritativePolicy.test.ts tests/progressionCommands.test.ts tests/server.authoritativeOperations.test.ts tests/server.authoritativeClient.test.ts tests/missionAuthoritativeClaims.test.ts`
- `npm.cmd run check`
- `npm.cmd run build`

## [0.25.292] - 2026-05-12

### Added
- Aniadido `progressionCommandStoreAdapter` para aplicar comandos de progresion al store desde un boundary aislado.
- Aniadidos tests del adaptador para cubrir aplicacion de patches, progreso de misiones, notificaciones y fallos sin mutacion.

### Changed
- Reducido `lib/store.ts` extrayendo la logica generica de aplicacion de comandos de progresion.
- La integracion de futuras operaciones online-first de progresion queda menos acoplada al store principal.

### Tested
- `npm.cmd run typecheck`
- `npx.cmd vitest run tests/progressionCommandStoreAdapter.test.ts tests/progressionCommands.test.ts tests/heroUpgrades.test.ts tests/frontlineCardState.test.ts tests/fortressState.test.ts tests/missions.test.ts`
- `npm.cmd run check`
- `npm.cmd run build`

## [0.25.291] - 2026-05-12

### Added
- Aniadido modulo `progressionCommands` para envolver mejoras de heroes, cartas Frontline y fortaleza como comandos puros con `patch` y efectos declarativos.
- Aniadidos tests de comandos de progresion para cubrir level/star/skill de heroes, upgrade de cartas y upgrades de fortaleza.

### Changed
- El store ahora aplica los upgrades de progresion a traves de un boundary comun en vez de mezclar validacion, costes, mutacion y feedback dentro de cada accion.
- La progresion de heroes queda local y funcional, pero preparada para sustituir comandos concretos por operaciones autoritativas cuando el diseno de progresion se cierre.

### Tested
- `npm.cmd run typecheck`
- `npx.cmd vitest run tests/progressionCommands.test.ts tests/heroUpgrades.test.ts tests/frontlineCardState.test.ts tests/fortressState.test.ts tests/missions.test.ts`
- `npm.cmd run check`
- `npm.cmd run build`

## [0.25.290] - 2026-05-12

### Added
- Aniadida accion `claimMissionOnlineFirst` en el store para reclamar misiones con backend autoritativo cuando la metrica ya esta soportada.
- Aniadida politica `missionAuthoritativeClaims` para decidir que misiones pueden reclamar online-first sin acoplar la UI a detalles de backend.
- Conectada la pantalla Missions a `claimMissionOnlineFirst`.
- Aniadidos tests para la politica de claims autoritativos de misiones.

### Changed
- Las misiones de Adventure pueden usar claim autoritativo cuando existe sesion Supabase; si no hay sesion o la API esta desactivada, conservan fallback local.
- Las misiones de mejora de heroes siguen reclamando en local hasta que la progresion de heroes tenga una operacion server-side estable, dejando el sistema abierto a futuros cambios de progresion.

### Tested
- `npm.cmd run typecheck`
- `npx.cmd vitest run tests/missionAuthoritativeClaims.test.ts tests/server.authoritativeOperationDispatcher.test.ts tests/missions.test.ts`
- `npm.cmd run check`
- `npm.cmd run build`

## [0.25.289] - 2026-05-12

### Added
- Aniadidos helpers/triggers SQL para avanzar `missions_progress` desde eventos autoritativos de servidor.
- `adventure_progress` avanza misiones de nodos de Adventure al pasar por primera vez a completado/reclamado.
- `battle_results` avanza misiones de victorias, y queda preparado para arena/eventos cuando esas fuentes escriban resultados autoritativos.
- Ampliado el smoke SQL para confirmar que Adventure genera progreso server-side y permite reclamar `d_adv_2` sin insertar progreso manual.

### Changed
- Documentado el flujo de progreso de misiones autoritativo y los pendientes para metricas que aun dependen de acciones locales.

### Tested
- `npx.cmd supabase db reset`
- `npx.cmd supabase db query --local --file supabase/smoke-tests/adventure_shop_rpcs.sql --output table`
- `npm.cmd run check`
- `npm.cmd run build`

## [0.25.288] - 2026-05-12

### Tested
- Validado el smoke SQL ampliado de Supabase tras reiniciar Supabase local: `npx.cmd supabase db query --local --file supabase/smoke-tests/adventure_shop_rpcs.sql --output table`.
- Confirmado `NOTICE (00000): Adventure/Shop RPC smoke test passed.`

## [0.25.287] - 2026-05-12

### Added
- Aniadida RPC `public.claim_mission_reward` para reclamar misiones completadas desde `missions_progress` sin aceptar progreso ni rewards del cliente.
- Expuesto `claimMission` en el proxy autoritativo y aniadido `claimMissionAuthoritatively` en el dispatcher cliente.
- Ampliado el smoke SQL de RPCs para cubrir claim de mision, idempotencia y bloqueo de segundo claim.

### Changed
- Documentado que `claimMission` queda preparado pero no conectado a UI hasta persistir progreso de misiones server-side.

### Tested
- `npm.cmd run typecheck`
- `npx.cmd vitest run tests/server.authoritativeOperations.test.ts tests/server.authoritativeRpcProxy.test.ts tests/server.authoritativeClient.test.ts tests/server.authoritativeOperationDispatcher.test.ts`
- `npm.cmd run check`
- `npm.cmd run build`

### Pending
- `npx.cmd supabase db reset` fallo al iniciar el contenedor local (`error running container: exit 1`), por lo que el smoke SQL ampliado queda pendiente de reintento en Supabase local limpio.

## [0.25.286] - 2026-05-12

### Added
- Conectado el guardado manual del loadout Frontline desde Deck mediante `DeckLoadoutSyncButton`.
- Aniadidas claves i18n EN/ES para estados de sincronizacion del loadout.

### Changed
- Deck puede sincronizar el snapshot actual del loadout con `syncFrontlineLoadoutOnlineFirst`, manteniendo fallback local cuando no hay sesion Supabase.
- La sincronizacion queda bajo accion explicita del jugador para evitar llamadas autoritativas en cada cambio de carta o heroe.

### Tested
- `npm.cmd run check`
- `npx.cmd vitest run tests/server.authoritativeOperationDispatcher.test.ts tests/loadoutState.test.ts`
- `npm.cmd run build`

## [0.25.285] - 2026-05-12

### Added
- Conectada la recompensa diaria en Home mediante `DailyLoginCharm`, reutilizando `claimDailyLoginOnlineFirst` y su fallback local.
- Aniadidas claves i18n EN/ES para el claim diario sin hardcodear textos nuevos en el componente.

### Changed
- Home muestra una placa compacta de tributo diario bajo el comandante, con estado claimed/pending y resumen visual de recompensas.

### Tested
- `npm.cmd run check`
- `npm.cmd run build`

## [0.25.284] - 2026-05-11

### Added
- Aniadido `claimDailyLoginAuthoritatively` en el dispatcher cliente para reclamar recompensa diaria contra el proxy autoritativo cuando exista sesion Supabase.
- Aniadida accion `claimDailyLoginOnlineFirst` en el store con fallback local seguro si no hay sesion o la API esta desactivada.
- Extendidos tests del dispatcher para claim diaria autoritativa, fallback sin sesion y rechazo servidor sin bypass local.

### Changed
- El claim diario online-first queda preparado pero todavia no conectado a UI, para evitar cambiar el flujo visible sin validacion de integracion.

### Tested
- `npm.cmd run typecheck`
- `npx.cmd vitest run tests/server.authoritativeOperationDispatcher.test.ts tests/metaRewardClaims.test.ts`

## [0.25.283] - 2026-05-11

### Added
- Aniadida RPC `public.claim_daily_login` para reclamar recompensa diaria con dia UTC server-side, idempotencia y bloqueo de segunda claim del mismo dia.
- Expuesta `claimDailyLogin` en el proxy autoritativo y cubierta por tests de mapping.
- Extendidos los smoke tests SQL para validar claim diaria, replay idempotente y bloqueo de segundo intento.

### Changed
- Documentado el alcance inicial de `claimDailyLogin`: backend preparado, todavia no conectado al store/UI.

### Tested
- `npm.cmd run check`
- `npx.cmd vitest run tests/server.authoritativeOperations.test.ts tests/server.authoritativeRpcProxy.test.ts tests/server.authoritativeClient.test.ts`
- `npm.cmd run build`

## [0.25.282] - 2026-05-11

### Added
- Aniadida accion `syncFrontlineLoadoutOnlineFirst` en el store para sincronizar el loadout Frontline con el dispatcher autoritativo.

### Changed
- El sync de loadout queda preparado como llamada explicita y no se ejecuta automaticamente desde Deck/Combat para evitar llamadas de red en cada cambio de seleccion.

### Tested
- `npm.cmd run typecheck`
- `npx.cmd vitest run tests/server.authoritativeOperationDispatcher.test.ts tests/loadoutState.test.ts`

## [0.25.281] - 2026-05-11

### Added
- Extendidos los smoke tests SQL de Supabase para validar `save_frontline_loadout` e idempotencia antes del resto de operaciones Adventure/Shop.
- Extendido `scripts/smoke-authoritative-api.mjs` para validar `saveLoadout` via `/api/server/authoritative` con replay idempotente.

### Tested
- `npm.cmd run typecheck`
- `npx.cmd vitest run tests/server.authoritativeOperations.test.ts tests/server.authoritativeRpcProxy.test.ts tests/server.authoritativeClient.test.ts`

## [0.25.280] - 2026-05-11

### Added
- Aniadido `saveFrontlineLoadoutAuthoritatively` en el dispatcher cliente para guardar loadouts contra el proxy autoritativo cuando exista sesion Supabase.
- Extendidos tests del dispatcher para fallback sin sesion, exito autoritativo y rechazo servidor de `saveLoadout`.

### Changed
- El contrato de ids autoritativos acepta `_`, necesario para ids reales como `leader_aurora` y cartas Frontline.
- Reducida la clave idempotente de guardado de loadout para no codificar todo el mazo en la key; el hash server-side conserva la proteccion contra payload distinto.

### Tested
- `npm.cmd run typecheck`
- `npx.cmd vitest run tests/server.authoritativeOperationDispatcher.test.ts tests/server.authoritativeOperations.test.ts tests/server.authoritativeRpcProxy.test.ts tests/server.authoritativeClient.test.ts`

## [0.25.279] - 2026-05-11

### Added
- Aniadida RPC `public.save_frontline_loadout` para persistir leader/squad/deck Frontline con idempotencia y shape validation server-side.
- Expuesta `saveLoadout` en el proxy autoritativo y mapeada a `save_frontline_loadout`.
- Extendidos tests de contratos/proxy para cubrir el mapping de guardado de loadout.

### Changed
- Documentado el alcance inicial de `saveLoadout`: preparado en backend, pero todavia no conectado al store ni usado como fuente autoritativa de Combat.

### Tested
- `npm.cmd run check`
- `npx.cmd vitest run tests/server.authoritativeOperations.test.ts tests/server.authoritativeRpcProxy.test.ts tests/server.authoritativeClient.test.ts`

## [0.25.278] - 2026-05-11

### Added
- Conectado `claimAdventureBattleResult` al dispatcher online-first para que los resultados de combate de Adventure puedan reclamarse contra backend autoritativo cuando exista sesion Supabase.
- Aniadida accion `claimAdventureBattleResultOnlineFirst` en el store, con fallback local para modo offline/API desactivada y sin duplicar recompensas.
- Aniadido resumen compacto de batalla al payload autoritativo y tests del dispatcher para exito, fallback, rechazo servidor y respuesta inconsistente.

### Changed
- El post-combate de Adventure usa la nueva accion online-first para progreso, first-clear y rewards; los combates no Adventure mantienen el flujo local existente.
- Normalizadas las claves de idempotencia del dispatcher por tipo de operacion (`shop`, `map`, `node`, `battle`).

### Tested
- `npm.cmd run check`
- `npx.cmd vitest run tests/server.authoritativeOperationDispatcher.test.ts tests/server.authoritativeOperations.test.ts tests/server.authoritativeRpcProxy.test.ts`

## [0.25.277] - 2026-05-11

### Added
- Conectado `claimAdventureNodeReward` al dispatcher online-first para reclamar cofres de nodo no-combate (`c1l3`, `c1l7`) con backend autoritativo cuando exista sesion Supabase.
- Aniadida accion `claimAdventureNodeOnlineFirst` en el store, con fallback local solo si no hay sesion o si el proxy esta desactivado.
- Extendidos los tests del dispatcher para claims de nodo, rechazos servidor y respuestas de nodo inconsistentes.

### Changed
- Adventure usa la accion online-first para nodos reclamables no-combate sin tocar layout, rutas, coordenadas ni reglas de Combat.
- Documentado que el dispatcher ya cubre compra de llave, key chest y cofres de nodo.

### Tested
- `npm.cmd run check`
- `npx.cmd vitest run tests/server.authoritativeOperationDispatcher.test.ts tests/server.authoritativeClient.test.ts tests/adventureNodeState.test.ts tests/adventure.nodeResolution.test.ts`
- `npm.cmd run build`

## [0.25.276] - 2026-05-11

### Added
- Conectado `openAdventureMapInteraction` al dispatcher online-first para que los cofres de mapa puedan usar el proxy autoritativo cuando exista sesion Supabase.
- Aniadida accion `claimAdventureMapInteractionOnlineFirst` en el store con fallback local si no hay sesion o la API esta desactivada.
- Extendidos los tests del dispatcher para apertura autoritativa de cofre, fallback local y rechazo servidor sin bypass.

### Changed
- Adventure usa la accion online-first para abrir el key chest sin tocar layout, coordenadas ni reglas locales.
- Documentado que el dispatcher ya cubre compra de llave y apertura de cofre de mapa.

### Tested
- `npm.cmd run typecheck`
- `npx.cmd vitest run tests/server.authoritativeOperationDispatcher.test.ts tests/server.authoritativeClient.test.ts tests/adventureMapInteractionClaims.test.ts tests/adventure.mapInteractions.test.ts`

## [0.25.275] - 2026-05-11

### Added
- Aniadido dispatcher progresivo `features/server/authoritativeOperationDispatcher.ts` para usar operaciones autoritativas cuando exista sesion Supabase y conservar fallback local cuando no exista.
- Aniadido helper `features/server/supabaseBrowserSession.ts` para leer sesion Supabase en navegador sin exponer service role.
- Aniadida accion `purchaseOfferOnlineFirst` en el store para conectar solo `adventure_key_ring` al proxy autoritativo.
- Aniadidos tests del dispatcher para fallback local, API desactivada, exito autoritativo y rechazos sin bypass local.

### Changed
- La pantalla Shop usa la accion online-first, pero el flujo local sigue siendo el fallback por defecto si no hay sesion o si el proxy esta desactivado.
- Documentado el alcance inicial del dispatcher en `docs/SERVER_AUTHORITATIVE_OPERATIONS.md`.

### Tested
- `npm.cmd run check`
- `npx.cmd vitest run tests/server.authoritativeOperationDispatcher.test.ts tests/server.authoritativeClient.test.ts tests/shopPurchases.test.ts`
- `npm.cmd run build`

## [0.25.274] - 2026-05-11

### Added
- Aniadida migracion `supabase/migrations/20260511204500_provision_auth_player_account.sql` para provisionar `profiles` y `player_resources` al crear usuarios de Supabase Auth.
- Aniadido script `npm.cmd run smoke:authoritative-api` para validar `/api/server/authoritative` con JWT real de Supabase Auth local.

### Changed
- Documentado el flujo de smoke HTTP local del proxy autoritativo en `supabase/README.md` y `docs/SERVER_AUTHORITATIVE_OPERATIONS.md`.
- Actualizado el smoke SQL de Adventure/Shop para convivir con el provisionado automatico de cuentas.

### Tested
- `npx.cmd supabase db reset`
- `npx.cmd supabase db query --local --file supabase/smoke-tests/adventure_shop_rpcs.sql --output table`
- `npm.cmd run smoke:authoritative-api -- --base-url http://127.0.0.1:3101`
- `npm.cmd run check`
- `npx.cmd vitest run tests/server.authoritativeClient.test.ts tests/server.authoritativeRpcProxy.test.ts tests/server.authoritativeOperations.test.ts`

## [0.25.273] - 2026-05-11

### Added
- Aniadido SDK interno `features/server/authoritativeClient.ts` para llamar a `/api/server/authoritative` con token explicito y validacion local de payloads.
- Aniadida lista compartida de operaciones autoritativas expuestas por API para evitar duplicar reglas entre cliente y proxy.
- Aniadidos tests del SDK para token requerido, validacion previa, normalizacion de payload, operaciones no expuestas y errores devueltos por servidor.

### Changed
- Documentado que el SDK autoritativo todavia no esta conectado a la UI y solo cubre operaciones respaldadas por RPC.

### Tested
- `npm.cmd run typecheck`
- `npx.cmd vitest run tests/server.authoritativeClient.test.ts tests/server.authoritativeRpcProxy.test.ts tests/server.authoritativeOperations.test.ts`

## [0.25.272] - 2026-05-11

### Added
- Aniadida ruta `POST /api/server/authoritative` como proxy HTTP hacia RPCs autoritativas de Supabase.
- Aniadido modulo `features/server/authoritativeRpcProxy.ts` para validar flag, entorno, bearer token, payloads y mapping a RPC.
- Aniadidos tests de proxy para flag desactivado, autenticacion, operaciones soportadas y mapeo de argumentos RPC.

### Changed
- Documentado `SERVER_AUTHORITATIVE_API_ENABLED=false` en `.env.example`.
- Documentado que la ruta proxy no usa service role y permanece desactivada por defecto.

### Tested
- `npm.cmd run typecheck`
- `npx.cmd vitest run tests/server.authoritativeRpcProxy.test.ts tests/server.authoritativeOperations.test.ts`
- `npm.cmd run check`
- `npm.cmd run build`
- `git diff --check`

## [0.25.271] - 2026-05-11

### Added
- Aniadida migracion `supabase/migrations/20260511182000_claim_adventure_node_reward_rpc.sql` con la RPC `public.claim_adventure_node_reward` para cofres de nodo `c1l3` y `c1l7`.
- Aniadido contrato `claimAdventureNodeReward` en los esquemas server-authoritative.
- Extendidos los smoke tests SQL para validar claim de nodo, idempotencia y bloqueo de segundo claim.

### Changed
- Documentado el alcance inicial de `claimAdventureNodeReward` en `docs/SERVER_AUTHORITATIVE_OPERATIONS.md` y `supabase/README.md`.

### Tested
- `npx.cmd supabase db reset`
- `npx.cmd supabase db query --local --file supabase/smoke-tests/adventure_shop_rpcs.sql --output table`
- `npm.cmd run check`
- `npx.cmd vitest run tests/server.authoritativeOperations.test.ts`
- `git diff --check`

## [0.25.270] - 2026-05-11

### Added
- Aniadida migracion `supabase/migrations/20260511172000_claim_adventure_battle_result_rpc.sql` con la RPC `public.claim_adventure_battle_result` para combates de Adventure Chapter 1.
- Extendidos los smoke tests SQL para validar first-clear, replay reducido e idempotencia de resultados de batalla Adventure.

### Changed
- Documentado el alcance inicial de `claimAdventureBattleResult` en `docs/SERVER_AUTHORITATIVE_OPERATIONS.md` y `supabase/README.md`.

### Tested
- `npx.cmd supabase db reset`
- `npx.cmd supabase db query --local --file supabase/smoke-tests/adventure_shop_rpcs.sql --output table`
- `npm.cmd run check`
- `git diff --check`

## [0.25.269] - 2026-05-11

### Added
- Aniadido smoke test SQL `supabase/smoke-tests/adventure_shop_rpcs.sql` para validar localmente las RPC `purchase_shop_offer` y `open_adventure_map_interaction`.
- Documentado el comando de smoke test local en `supabase/README.md`.

### Changed
- Ignorados `supabase/config.toml`, `supabase/.gitignore`, `supabase/.branches/` y `supabase/.temp/` como estado local de Supabase CLI no versionado por ahora.

### Fixed
- Aniadida migracion `supabase/migrations/20260511165000_fix_rpc_extension_search_path.sql` para que las RPC autoritativas resuelvan `extensions.digest()` en Supabase.

### Tested
- `npx.cmd supabase db reset`
- `npx.cmd supabase db query --local --file supabase/smoke-tests/adventure_shop_rpcs.sql --output table`
- `npm.cmd run check`
- `git diff --check`

## [0.25.267] - 2026-05-11

### Fixed
- Corregido `supabase/seed.sql` para que no falle `supabase start`/`db reset` cuando el schema seguro no contiene tablas legacy como `adventure_chapters`.

### Changed
- Documentado en `supabase/README.md` que el seed actual es tolerante y no autoritativo.

### Tested
- `npm.cmd run check`
- `git diff --check`

## [0.25.266] - 2026-05-11

### Added
- Aniadida migracion `supabase/migrations/20260511063000_purchase_shop_offer_rpc.sql` con la RPC `public.purchase_shop_offer`.
- Implementado soporte server-authoritative inicial para `adventure_key_ring`: unlock por Adventure, limite diario, coste en gemas, reward de llave, ledger e idempotencia.

### Changed
- Documentado el alcance inicial de `purchaseShopOffer` en `docs/SERVER_AUTHORITATIVE_OPERATIONS.md` y `supabase/README.md`.

### Tested
- `npm.cmd run check`
- `npm.cmd run build`
- `git diff --check`
- `rg -i "might|mighty|cunt|cuntwars|darkest dungeon|hearthstone|fall guys|slay the spire|raid shadow|marvel snap|gwent|darkest|hearth" README.md docs AGENTS.md supabase features tests -g "!docs/skills/**"`

## [0.25.265] - 2026-05-11

### Added
- Aniadida migracion `supabase/migrations/20260511061000_open_adventure_map_interaction_rpc.sql` con la RPC `public.open_adventure_map_interaction`.
- La RPC valida autenticacion, perfil, unlock de Adventure, cooldown de claim, llaves disponibles, idempotencia, loot server-side, ledger y actualizacion atomica de rewards.

### Changed
- Documentada la primera implementacion SQL de `openAdventureMapInteraction` en `docs/SERVER_AUTHORITATIVE_OPERATIONS.md` y `supabase/README.md`.

### Tested
- `npm.cmd run check`
- `npm.cmd run build`
- `git diff --check`
- `rg -i "might|mighty|cunt|cuntwars|darkest dungeon|hearthstone|fall guys|slay the spire|raid shadow|marvel snap|gwent|darkest|hearth" README.md docs AGENTS.md supabase features tests -g "!docs/skills/**"`

## [0.25.264] - 2026-05-11

### Added
- Aniadidos contratos TypeScript y esquemas Zod para operaciones server-authoritative en `features/server/authoritativeOperations.ts`.
- Aniadidos tests de validacion para idempotencia, payloads sensibles, loadout Frontline y rewards.

### Changed
- Enlazado `docs/SERVER_AUTHORITATIVE_OPERATIONS.md` con el modulo de contratos vivo.

### Tested
- `npm.cmd run typecheck`
- `npx.cmd vitest run tests/server.authoritativeOperations.test.ts`

## [0.25.263] - 2026-05-10

### Added
- Aniadida migracion `supabase/migrations/20260510194500_adventure_shop_operations.sql` con progreso de Adventure, claims de mapa, compras, misiones, login diario, resultados de batalla e idempotencia.
- Documentado `server_operations` y `daily_login_claims` en el modelo objetivo de backend.

### Changed
- Actualizado `supabase/README.md` para listar la segunda migracion segura de persistencia online.

### Tested
- `npm.cmd run check`
- `npm.cmd run typecheck`
- `git diff --check`
- `rg -i "might|mighty|cunt|cuntwars|darkest dungeon|hearthstone|fall guys|slay the spire|raid shadow|marvel snap|gwent|darkest|hearth" README.md docs AGENTS.md supabase -g "!docs/skills/**"`

## [0.25.262] - 2026-05-10

### Added
- Aniadida migracion `supabase/migrations/20260510193000_secure_player_core.sql` con el nucleo seguro de persistencia online: profiles, resources, ledger, heroes, cartas Frontline y loadout.

### Changed
- Actualizado `supabase/README.md` para diferenciar el schema alpha legacy de las nuevas migraciones seguras.
- Alineado `docs/BACKEND_DATA_MODEL.md` con ownership por `auth.users`.

### Tested
- `npm.cmd run typecheck`
- `git diff --check`
- `rg -i "might|mighty|cunt|cuntwars|darkest dungeon|hearthstone|fall guys|slay the spire|raid shadow|marvel snap|gwent|darkest|hearth" README.md docs AGENTS.md supabase -g "!docs/skills/**"`

## [0.25.261] - 2026-05-10

### Added
- Aniadido `docs/BACKEND_DATA_MODEL.md` con el modelo objetivo de persistencia online segura: perfil, recursos, ledger, heroes, cartas, loadout, Adventure, claims, Shop, misiones, combate y Arena.
- Aniadido `docs/SERVER_AUTHORITATIVE_OPERATIONS.md` con contratos de operaciones autoritativas, idempotencia, errores tipados y transacciones atomicas.

### Changed
- Enlazados los nuevos documentos desde `README.md`, `docs/DOCUMENTATION_INDEX.md`, `docs/DUSKKEEP_FRONTS_FUNCTIONAL_HANDOFF.md` y `docs/SECURITY_AND_BACKEND_ROADMAP.md`.
- Traducido `supabase/README.md` y actualizado el encabezado de `supabase/schema.sql` para dejar claro que el schema actual es alpha y no autoritativo.

### Tested
- `npm.cmd run typecheck`
- `git diff --check`
- `rg -i "might|mighty|cunt|cuntwars|darkest dungeon|hearthstone|fall guys|slay the spire|raid shadow|marvel snap|gwent|darkest|hearth" README.md docs AGENTS.md supabase -g "!docs/skills/**"`

## [0.25.260] - 2026-05-10

### Changed
- Traducidos al espanol documentos secundarios de proyecto: `ADVENTURE_MAP_INTERACTIONS_BACKLOG.md`, `ART_PIPELINE_CODEX.md`, `ASSET_RIGHTS_NOTES.md`, `IMPECCABLE_ANIMATION_USAGE.md` y `REWARD_VISIBILITY_RULES.md`.
- Revisada de nuevo la documentacion versionada principal para evitar referencias a juegos externos o competidores.

### Tested
- `npm.cmd run typecheck`
- `git diff --check`
- `rg -i "might|mighty|cunt|cuntwars|darkest dungeon|hearthstone|fall guys|slay the spire|raid shadow|marvel snap|gwent|darkest|hearth" README.md docs AGENTS.md -g "!docs/skills/**"`

## [0.25.259] - 2026-05-10

### Changed
- Traducidos al espanol `README.md`, `docs/ARCHITECTURE.md`, `docs/GAMEPLAY_GUIDE.md`, `docs/QUALITY_AND_RELEASE.md` y `docs/SECURITY_AND_BACKEND_ROADMAP.md`.
- Aniadida regla explicita para no incluir referencias a otros juegos, competidores o ejemplos externos en documentacion versionada.
- Revisada la documentacion versionada principal para confirmar que no contiene referencias a juegos externos prohibidos.

### Tested
- `npm.cmd run typecheck`
- `git diff --check`
- `rg -i "might|mighty|cunt|cuntwars|darkest dungeon|hearthstone|fall guys|slay the spire|raid shadow|marvel snap|gwent|darkest|hearth" README.md docs AGENTS.md -g "!docs/skills/**"`

## [0.25.258] - 2026-05-10

### Changed
- Traducidos al espanol `docs/DOCUMENTATION_INDEX.md` y `docs/ENGINEERING_STANDARDS.md`.
- Ajustadas las referencias documentales del `README.md` para que la seccion de documentacion quede en espanol.

### Tested
- `npm.cmd run typecheck`
- `git diff --check`

## [0.25.257] - 2026-05-10

### Added
- Aniadido `docs/DOCUMENTATION_INDEX.md` como puerta de entrada a la documentacion por area: arquitectura, gameplay, assets, rewards, seguridad, backend, rendimiento y release.
- Aniadido `docs/ENGINEERING_STANDARDS.md` con estandares de arquitectura, calidad, seguridad, rendimiento, assets, testing, release y preparacion backend.

### Changed
- Actualizado `README.md` y el handoff funcional para incluir los nuevos documentos en la ruta de lectura recomendada.

### Tested
- `npm.cmd run typecheck`
- `git diff --check`

## [0.25.256] - 2026-05-10

### Changed
- Aniadidas variantes WebP redimensionadas para los landmarks principales de Home y conectado `srcSet/sizes` para evitar descargar assets de 1024-1536px cuando se renderizan a tamanos pequenos.
- Aniadidas variantes WebP pequenas para iconos de recursos, UI, navegacion, modos y `reward_chest`, registradas mediante manifest explicito sin rutas especulativas.
- Aniadidos thumbnails WebP para portraits de lider en la commander card de Home, manteniendo los portraits completos para pantallas donde se muestran grandes.

### Tested
- `npm.cmd run typecheck`
- `npm.cmd run check:full`
- `npm.cmd run audit:assets`
- `npm.cmd run audit:asset-refs`
- `npm.cmd run audit:build`
- `npm.cmd run check:performance`

## [0.25.255] - 2026-05-10

### Changed
- Eliminadas transiciones de `border-color` en los resource chips del HUD para evitar animaciones no compuestas reportadas por Lighthouse.
- Sustituido el impacto de ganancia de recursos que animaba `box-shadow` por una animacion basada en `transform/opacity`.

### Tested
- `npm.cmd run lint`
- `npm.cmd run typecheck`
- `npm.cmd run check:full`
- `npm.cmd run audit:build`
- `npm.cmd run check:performance`

## [0.25.254] - 2026-05-10

### Changed
- Aniadidas variantes WebP para portraits de lideres Frontline y registrado el fallback PNG en el manifest existente.
- Actualizada la commander card de Home para usar `<picture>` y descargar WebP cuando el navegador lo soporta.

### Tested
- `npm.cmd run lint`
- `npm.cmd run typecheck`
- `npm.cmd run audit:asset-refs`
- `npm.cmd run check:full`
- `npm.cmd run audit:build`
- `npm.cmd run check:performance`

## [0.25.253] - 2026-05-10

### Changed
- Migrado el aleteo de cuervos de `HomeSkyAtmosphere` de `left` a `transform: translate3d(...)` para reducir animaciones no compuestas.
- Registrados WebP preferentes para los assets atmosfericos de Home usados por nubes/cuervos, manteniendo PNG fallback.

### Tested
- `npm.cmd run lint`
- `npm.cmd run typecheck`
- `npm.cmd run check:full`
- `npm.cmd run audit:asset-refs`
- `npm.cmd run audit:build`
- `npm.cmd run check:performance`

## [0.25.252] - 2026-05-10

### Changed
- Diferida la atmosfera decorativa de Home hasta idle/timeout corto para priorizar el primer render del fondo y landmarks principales.
- Conservado el modo QA de efectos con render inmediato para no romper herramientas de calibracion.

### Tested
- `npm.cmd run lint`
- `npm.cmd run typecheck`
- `npm.cmd run check:full`
- `npm.cmd run audit:build`
- `npm.cmd run check:performance`

## [0.25.251] - 2026-05-10

### Changed
- Migradas las animaciones frame-by-frame de `HomeEffectSprite` de `left` a `transform: translate3d(...)` para reducir animaciones no compuestas reportadas por Lighthouse.
- Mantenidos los offsets calibrados de spritesheets, render modes y fallbacks WebP/PNG sin cambiar la identidad visual de Home.

### Tested
- `npm.cmd run lint`
- `npm.cmd run typecheck`
- `npm.cmd run check:full`
- `npm.cmd run audit:build`
- `npm.cmd run check:performance`

## [0.25.250] - 2026-05-10

### Changed
- Aniadidas variantes WebP para los sprites/effects activos de Home, incluyendo flames, portal, crystal, crows, clouds, candles, lanterns y flags.
- Actualizado `HomeEffectSprite` para usar `image-set(...)` con WebP preferente y PNG fallback, manteniendo calibracion y render modes existentes.

### Tested
- `npm.cmd run typecheck`
- `npm.cmd run audit:asset-refs`
- `npm.cmd run check:full`
- `npm.cmd run audit:assets`
- `npm.cmd run audit:build`
- `npm.cmd run check:performance`

## [0.25.249] - 2026-05-10

### Changed
- Aniadidas variantes WebP registradas para el fondo principal y landmarks de Home, manteniendo los PNG originales como fallback seguro.
- Actualizados `HomeScene` y `HomeLandmarkAsset` para usar `<picture>` y priorizar WebP en navegadores compatibles sin cambiar layout ni assets registrados.

### Tested
- `npm.cmd run typecheck`
- `npm.cmd run audit:asset-refs`
- `npm.cmd run check:full`
- `npm.cmd run audit:assets`
- `npm.cmd run audit:build`
- `npm.cmd run check:performance`

## [0.25.248] - 2026-05-10

### Changed
- Simplificado `RewardFlightOverlay` para usar directamente las entradas normalizadas de `getRewardDisplayEntries` sin reconstruir un payload sintetico de rewards.
- Mantenida una firma estable de entradas para que la animacion de vuelo no se reprograme por renders que no cambian la recompensa visible.

### Tested
- `npm.cmd run lint`
- `npm.cmd run typecheck`
- `npm.cmd run check:full`
- `npm.cmd run audit:build`
- `npm.cmd run check:performance`

## [0.25.247] - 2026-05-10

### Changed
- Alineada la deteccion de rewards visibles con `getRewardDisplayEntries` para evitar dos reglas distintas entre visibilidad y overlays.
- Cubiertos los casos de XP, llaves de aventura y shards sin cantidad visible en los tests de `rewardVisibility`.

### Tested
- `npm.cmd run typecheck`
- `npm.cmd run test -- rewardVisibility rewardDisplayEntries`
- `npm.cmd run check:full`
- `npm.cmd run audit:build`
- `npm.cmd run check:performance`

## [0.25.246] - 2026-05-10

### Changed
- Extraida la normalizacion visual de rewards a `getRewardDisplayEntries`, compartida por `RewardFlightOverlay` y `RewardBurstOverlay`.
- Eliminada duplicacion en el formateo de oro, polvo, gemas, tickets, llaves, XP, shards y cartas dentro de los overlays de recompensa.

### Tested
- `npm.cmd run typecheck`
- `npm.cmd run test -- rewardDisplayEntries`
- `npm.cmd run build`
- `npm.cmd run audit:build`
- `npm.cmd run check:performance`
- `npm.cmd run check:full`

## [0.25.245] - 2026-05-10

### Changed
- Aniadido `LazyRewardBurstOverlay` para diferir el burst visual de recompensas hasta que hay un claim, raid o resultado que mostrar.
- Sustituidos imports estaticos de `RewardBurstOverlay` en Arena, Events, Missions, Fortress y resultado de Frontline, manteniendo intacta la logica de rewards.

### Tested
- `npm.cmd run typecheck`
- `npm.cmd run build`
- `npm.cmd run audit:build`
- `npm.cmd run check:performance`
- `npm.cmd run check:full`

## [0.25.244] - 2026-05-10

### Changed
- Aniadido `LazyRewardFlightOverlay` para diferir el overlay de vuelo de recompensas hasta que realmente hay una compra, claim, raid o resultado que mostrar.
- Sustituidos imports estaticos de `RewardFlightOverlay` en Shop, Missions, Fortress, Arena, Events y el panel de resultado de Frontline sin cambiar la logica de rewards.

### Tested
- `npm.cmd run typecheck`
- `npm.cmd run build`
- `npm.cmd run audit:build`
- `npm.cmd run check:performance`
- `npm.cmd run check:full`

## [0.25.243] - 2026-05-10

### Changed
- Separados los handles QA de Home en un componente pequeno (`HomeEffectQaHandles`) y movido el contrato de tipos a `HomeEffectsQaTypes`.
- Diferida la carga de `HomeEffectsQaPanel` para que el panel completo de edicion de efectos solo se importe cuando se usa `?qa=effects`.

### Tested
- `npm.cmd run typecheck`
- `npm.cmd run build`
- `npm.cmd run audit:build`
- `npm.cmd run check:performance`
- `npm.cmd run check:full`

## [0.25.242] - 2026-05-09

### Changed
- Diferida la carga del editor QA `AdventureMapEditorOverlay` para que el mapa normal de Adventure no importe el panel de edicion salvo al abrir `?qa=adventure-map` o `?qa=map-editor`.
- Mantenida intacta la configuracion de nodos, props, rutas, interacciones y comportamiento de Adventure; el cambio solo separa codigo de herramientas QA.

### Tested
- `npm.cmd run typecheck`
- `npm.cmd run build`
- `npm.cmd run audit:build`
- `npm.cmd run check:performance`
- `npm.cmd run check:full`

## [0.25.241] - 2026-05-09

### Changed
- Diferida la carga de `FrontlineBattle` en Arena y Events hasta entrar realmente en fase de combate, evitando cargar el bundle de batalla durante el listado inicial.
- Aniadida una shell ligera compartida para cubrir el estado de carga del combate diferido sin tocar el engine ni las reglas de Frontline.

### Tested
- `npm.cmd run typecheck`
- `npm.cmd run build`
- `npm.cmd run audit:build`
- `npm.cmd run check:performance`
- `npm.cmd run check:full`

## [0.25.240] - 2026-05-09

### Changed
- Endurecido `npm.cmd run check:performance` tras la optimizacion de prerender: ahora valida `.next/server/app` <= 1 MB y HTML por ruta <= 80 KB.
- Documentados los nuevos presupuestos para detectar regresiones reales de peso en rutas estaticas y server app.

### Tested
- `npm.cmd run audit:build`
- `npm.cmd run check:performance`
- `npm.cmd run check:full`

## [0.25.239] - 2026-05-09

### Changed
- Optimizado Events para prerenderizar una shell ligera hasta la hidratacion cliente, evitando serializar operaciones, completions diarios y estado de loadout placeholder en HTML estatico.
- Actualizada la linea base de build: `events.html` baja de 55.8 KB a 25.7 KB y `.next/server/app` queda en 0.77 MB.

### Tested
- `npm.cmd run typecheck`
- `npm.cmd run build`
- `npm.cmd run audit:build`
- `npm.cmd run check:performance`

## [0.25.238] - 2026-05-09

### Changed
- Optimizado Fortress para prerenderizar una shell ligera hasta que el reloj cliente este listo, evitando serializar garrison, raids, upgrades y reportes placeholder en HTML estatico.
- Actualizada la linea base de build: `fortress.html` baja de 66.6 KB a 25.3 KB y `.next/server/app` queda en 0.80 MB.

### Tested
- `npm.cmd run typecheck`
- `npm.cmd run build`
- `npm.cmd run audit:build`
- `npm.cmd run check:performance`

## [0.25.237] - 2026-05-09

### Changed
- Optimizado Adventure para prerenderizar una shell ligera hasta la hidratacion cliente, evitando serializar mapa, nodos, paneles e interacciones placeholder en HTML estatico.
- Actualizada la linea base de build: `adventure.html` baja de 83.7 KB a 30.3 KB y `.next/server/app` queda en 0.84 MB.

### Tested
- `npm.cmd run typecheck`
- `npm.cmd run build`
- `npm.cmd run audit:build`
- `npm.cmd run check:performance`

## [0.25.236] - 2026-05-09

### Changed
- Optimizado Team para prerenderizar una shell ligera hasta la hidratacion cliente, evitando serializar loadout, squad y deck placeholder en HTML estatico.
- Actualizada la linea base de build: `team.html` baja de 84.3 KB a 26.4 KB y `.next/server/app` queda en 0.89 MB.

### Tested
- `npm.cmd run typecheck`
- `npm.cmd run build`
- `npm.cmd run audit:build`
- `npm.cmd run check:performance`

## [0.25.235] - 2026-05-09

### Changed
- Optimizado Arena para prerenderizar una shell ligera hasta la hidratacion cliente, evitando serializar rivales, gates y ranking placeholder en HTML estatico.
- Actualizada la linea base de build: `arena.html` baja de 89.9 KB a 30.2 KB y `.next/server/app` queda en 0.95 MB.

### Tested
- `npm.cmd run typecheck`
- `npm.cmd run build`
- `npm.cmd run audit:build`
- `npm.cmd run check:performance`

## [0.25.234] - 2026-05-09

### Changed
- Optimizado Missions para prerenderizar una shell ligera hasta la hidratacion cliente, evitando serializar contratos diarios/semanales y progreso placeholder en HTML estatico.
- Actualizada la linea base de build: `missions.html` baja de 92.3 KB a 24.2 KB y `.next/server/app` queda en 1.01 MB.

### Tested
- `npm.cmd run typecheck`
- `npm.cmd run build`
- `npm.cmd run audit:build`
- `npm.cmd run check:performance`

## [0.25.233] - 2026-05-09

### Changed
- Optimizado Roster para prerenderizar una shell ligera hasta la hidratacion cliente, evitando serializar hero grid, filtros y ownership placeholder en HTML estatico.
- Actualizada la linea base de build: `roster.html` baja de 94.0 KB a 24.0 KB y `.next/server/app` queda en 1.08 MB.

### Tested
- `npm.cmd run typecheck`
- `npm.cmd run build`
- `npm.cmd run audit:build`
- `npm.cmd run check:performance`

## [0.25.232] - 2026-05-09

### Changed
- Optimizado Shop para prerenderizar una shell ligera hasta la hidratacion cliente, evitando serializar ofertas, stock diario y rewards placeholder en HTML estatico.
- Actualizada la linea base de build: `shop.html` baja de 100.7 KB a 25.0 KB y `.next/server/app` queda en 1.14 MB.

### Tested
- `npm.cmd run typecheck`
- `npm.cmd run build`
- `npm.cmd run audit:build`
- `npm.cmd run check:performance`

## [0.25.231] - 2026-05-09

### Changed
- Optimizado Deck para prerenderizar una shell ligera hasta la hidratacion cliente, evitando serializar todo el card pool y roster en HTML estatico.
- Actualizada la linea base de build: `deck.html` baja de 123.3 KB a 23.7 KB y `.next/server/app` queda en 1.22 MB.

### Tested
- `npm.cmd run typecheck`
- `npm.cmd run build`
- `npm.cmd run audit:build`
- `npm.cmd run check:performance`

## [0.25.230] - 2026-05-09

### Added
- Anadido `scripts/check-performance-budget.mjs` y el comando `npm.cmd run check:performance` para detectar regresiones grandes de peso en assets publicos, build estatica y HTML prerenderizado.
- Documentados presupuestos actuales de rendimiento: `public/assets` <= 112 MB, `.next/static` <= 3 MB y HTML por ruta <= 150 KB.

### Tested
- `npm.cmd run audit:assets`
- `npm.cmd run audit:build`
- `npm.cmd run check:performance`
- `npm.cmd run check:full`

## [0.25.229] - 2026-05-09

### Added
- Anadido `scripts/audit-public-asset-refs.mjs` y el comando `npm.cmd run audit:asset-refs` para detectar candidatos de assets publicos sin referencias textuales.

### Changed
- Movido fuera de `public/assets` `banner_red_pole.png`, variante legacy no referenciada; Home conserva `flag_red_pole.png`.
- Actualizada la linea base de rendimiento: `public/assets` queda en 251 archivos y 103.48 MB.

### Tested
- `npm.cmd run audit:assets`
- `npm.cmd run audit:asset-refs -- 20`
- `npm.cmd run check:full`

## [0.25.228] - 2026-05-09

### Changed
- Movidas fuera de `public/assets` variantes Home no referenciadas de spritesheets intermedios y pruebas de banner.
- Conservados los sprites activos registrados en `lib/homeEffectAssets.ts`, incluidos los pipelines normalizados que si usa Home.
- Actualizada la linea base de rendimiento: `public/assets` queda en 252 archivos y 103.61 MB.

### Tested
- `npm.cmd run audit:assets`
- `npm.cmd run check:full`

## [0.25.227] - 2026-05-09

### Changed
- Movidas fuera de `public/assets` dos versiones intermedias no registradas del brillo del key chest.
- Conservada la version activa `gold_shine_loop_core_aligned.png` registrada en el manifest de interacciones de Adventure.
- Actualizada la linea base de rendimiento: `public/assets` queda en 259 archivos y 106.54 MB.

### Tested
- `npm.cmd run audit:assets`
- `npm.cmd run check:full`

## [0.25.226] - 2026-05-09

### Changed
- Movidos fuera de `public/assets` duplicados de fondos de batalla Chapter 1 y el landmark legacy `deck_hall.png`.
- Alineado `lib/homeLandmarkAssets.ts` para que el expectedFile de Deck coincida con `deck_hall_clean.png`.
- Actualizada la linea base de rendimiento: `public/assets` queda en 261 archivos y 109.11 MB.

### Tested
- `npm.cmd run audit:assets`
- `npm.cmd run check:full`

## [0.25.225] - 2026-05-09

### Added
- Anadido `scripts/audit-build-output.mjs` y el comando `npm.cmd run audit:build` para medir `.next/static`, `.next/server/app`, chunks grandes y HTML prerenderizado.

### Changed
- Actualizada la linea base de rendimiento con pesos de build: `.next/static` 2.31 MB y `.next/server/app` 1.31 MB.

### Tested
- `npm.cmd run audit:assets`
- `npm.cmd run audit:build`
- `npm.cmd run check:full`

## [0.25.224] - 2026-05-09

### Changed
- Movidas fuera del proyecto laminas PNG fuente ignoradas y no referenciadas de Adventure, Frontline icons/cards, modos, recursos y landmarks legacy locales.
- Actualizada la linea base de rendimiento: `public/assets` queda en 265 archivos y 117.34 MB.

### Tested
- `npm.cmd run audit:assets`
- `npm.cmd run check:full`

## [0.25.223] - 2026-05-09

### Changed
- Movidos fuera de `public/assets` los borradores y backups historicos de musica que no usa el juego en runtime.
- Anadida regla `.gitignore` para evitar que `public/assets/audio/**/archive/` vuelva a entrar al repo.
- Actualizada la linea base de rendimiento: `public/assets` queda en 415 archivos y 167.93 MB.

### Tested
- `npm.cmd run audit:assets`
- `npm.cmd run check:full`

## [0.25.222] - 2026-05-09

### Added
- Iniciado el bloque de rendimiento con `scripts/audit-public-assets.mjs` y el comando `npm.cmd run audit:assets`.
- Documentada la linea base en `docs/PERFORMANCE_BASELINE.md`, incluyendo assets raw movidos fuera del proyecto y siguientes focos.

### Changed
- Movidas fuera del proyecto laminas raw ignoradas y no referenciadas de Frontline para evitar que sigan dentro de `public/assets` local.

### Tested
- `npm.cmd run audit:assets`
- `npm.cmd run check:full`

## [0.25.221] - 2026-05-09

### Changed
- Eliminadas normalizaciones duplicadas en las utilidades dev de Adventure Map Layout.
- Simplificado el retorno de rutas, props e indicador de party sin cambiar la forma serializada.

### Tested
- `npx.cmd vitest run tests/devRouteUtils.test.ts tests/devRouteGuards.test.ts`
- `npm.cmd run check:full`

## [0.25.220] - 2026-05-09

### Changed
- Centralizado el bloqueo en produccion de endpoints dev de guardado en `app/api/dev/devRouteGuards.ts`.
- Reutilizado el guard en Adventure Map Layout y Home Effects sin cambiar mensajes ni codigos HTTP.

### Tested
- `npx.cmd vitest run tests/devRouteGuards.test.ts tests/devRouteUtils.test.ts`
- `npm.cmd run check:full`

## [0.25.219] - 2026-05-09

### Added
- Tests de hardening para las utilidades de guardado dev de Adventure Map y Home Effects.

### Tested
- `npx.cmd vitest run tests/devRouteUtils.test.ts`
- `npm.cmd run check:full`

## [0.25.218] - 2026-05-09

### Changed
- Extraida la normalizacion y serializacion del endpoint dev de Home Effects a `app/api/dev/home-effects/homeEffectsRouteUtils.ts`.
- Reducido `app/api/dev/home-effects/route.ts` al flujo HTTP de validacion, guardado y respuesta, manteniendo el bloqueo en produccion.

### Tested
- `npm.cmd run check:full`

## [0.25.217] - 2026-05-09

### Changed
- Extraida la generacion de IDs de notificacion a `createNotificationId` en `lib/storeHousekeeping.ts`.
- Reducido el inline de `pushNotification` en `lib/store.ts` sin cambiar timeout, notificaciones ni flujo de UI.

### Tested
- `npm.cmd run check:full`

## [0.25.216] - 2026-05-09

### Changed
- Extraida la construccion de nodos visuales de Adventure a `components/game/adventure/AdventureCampaignVisualNodes.ts`.
- Reducido `useAdventureCampaignMapState` sin cambiar coordenadas, editor QA, rutas, props, progreso ni recompensas.

### Tested
- `npm.cmd run check:full`

## [0.25.215] - 2026-05-09

### Changed
- Extraida la normalizacion y serializacion del endpoint dev de Adventure map layout a `app/api/dev/adventure-map-layout/adventureMapLayoutRouteUtils.ts`.
- Reducido `app/api/dev/adventure-map-layout/route.ts` al flujo HTTP de validacion, guardado y respuesta, manteniendo el bloqueo en produccion.

### Tested
- `npm.cmd run check:full`

## [0.25.214] - 2026-05-09

### Changed
- Extraido el marcador central de lanes de Frontline a `components/game/frontline/FrontlineLaneCenterMarker.tsx`.
- Reducido `components/game/frontline/FrontlineBattleLanes.tsx` manteniendo clases, iconos, labels accesibles y comportamiento visual.

### Tested
- `npm.cmd run check:full`

## [0.25.213] - 2026-05-09

### Changed
- Extraidas las animaciones core de `FrontlineBattleStyles` a `components/game/frontline/FrontlineBattleCoreStyles.ts`.
- Reducido `components/game/frontline/FrontlineBattleStyles.tsx` sin cambiar nombres de clases, keyframes, audio, engine ni reglas.

### Tested
- `npm.cmd run check:full`

## [0.25.212] - 2026-05-09

### Changed
- Extraidas derivaciones de render de `FrontlineBattle` a `components/game/frontline/useFrontlineBattleViewModel.ts`.
- Reducido `components/game/frontline/FrontlineBattle.tsx` sin cambiar handlers, engine, audio, FX timers, rewards ni reglas.

### Tested
- `npm.cmd run check:full`

## [0.25.211] - 2026-05-09

### Changed
- Centralizada la limpieza de timers de `FrontlineBattle` en `components/game/frontline/FrontlineBattleTimers.ts`.
- Reducida la duplicacion de `clearTimeout` sin cambiar programacion de FX, audio, rewards ni reglas.

### Tested
- `npm.cmd run check:full`

## [0.25.210] - 2026-05-09

### Changed
- Extraida la seleccion de enemigo/adventure level de Frontline a `components/game/frontline/useBattlePageEnemySelection.ts`.
- Reducido `components/game/BattlePageClient.tsx` sin cambiar preset inicial, seleccion manual, audio, rewards ni reglas.

### Tested
- `npm.cmd run check:full`

## [0.25.209] - 2026-05-09

### Changed
- Extraidas las derivaciones de loadout y previews Frontline a `components/game/frontline/useBattlePageLoadoutPreview.ts`.
- Reducido `components/game/BattlePageClient.tsx` sin cambiar datos de squad/deck, boss config, audio, rewards ni reglas.

### Tested
- `npm.cmd run check:full`

## [0.25.208] - 2026-05-09

### Changed
- Extraida la resolucion de preset enemigo de Frontline a helpers puros en `frontlineBattlePageLogic.ts`.
- Reutilizado `heroPreviewPower` para evitar duplicar la formula de power preview en `BattlePageClient.tsx`.

### Tested
- `npm.cmd run check:full`

## [0.25.207] - 2026-05-09

### Changed
- Extraida la animacion local de reward reveal Frontline a `components/game/frontline/useBattlePageRewardReveal.ts`.
- Reducido `components/game/BattlePageClient.tsx` sin cambiar concesion de rewards, economia, audio ni reglas.

### Tested
- `npm.cmd run check:full`

## [0.25.206] - 2026-05-09

### Changed
- Extraida la vista de fase de batalla Frontline a `components/game/frontline/BattlePageBattleView.tsx`.
- Reducido `components/game/BattlePageClient.tsx` sin cambiar `FrontlineBattle`, modifiers, fondos, audio, rewards ni reglas.

### Tested
- `npm.cmd run check:full`

## [0.25.205] - 2026-05-09

### Changed
- Extraido el frame/layout visual de setup Frontline a `components/game/frontline/BattlePageSetupLayout.tsx`.
- Reducido `components/game/BattlePageClient.tsx` sin cambiar flujo de setup, batalla, audio, rewards ni reglas.

### Tested
- `npm.cmd run check:full`

## [0.25.204] - 2026-05-09

### Changed
- Extraido el panel Frontline Matchup de setup a `components/game/frontline/BattlePageMatchupPanel.tsx`.
- Reducido `components/game/BattlePageClient.tsx` sin cambiar lineup, power previews, audio, rewards ni reglas.

### Tested
- `npm.cmd run check:full`

## [0.25.203] - 2026-05-09

### Changed
- Extraido el rail derecho de setup Frontline a `components/game/frontline/BattlePageSetupSidebar.tsx`.
- Reducido `components/game/BattlePageClient.tsx` sin cambiar seleccion de enemigo, boss previews, rewards, result panel, audio ni reglas.

### Tested
- `npm.cmd run check:full`

## [0.25.202] - 2026-05-09

### Changed
- Extraido el panel de boss signatures de setup Frontline a `components/game/frontline/BattlePageBossSignaturesPanel.tsx`.
- Reducido `components/game/BattlePageClient.tsx` sin cambiar boss config, signatures, audio, rewards ni reglas.

### Tested
- `npm.cmd run check:full`

## [0.25.201] - 2026-05-09

### Changed
- Extraido el panel Battle Package de setup Frontline a `components/game/frontline/BattlePagePackagePanel.tsx`.
- Reducido `components/game/BattlePageClient.tsx` sin cambiar cartas equipadas, placeholders, audio, rewards ni reglas.

### Tested
- `npm.cmd run check:full`

## [0.25.200] - 2026-05-09

### Changed
- Extraido el panel de recompensas de setup Frontline a `components/game/frontline/BattlePageRewardsPanel.tsx`.
- Reducido `components/game/BattlePageClient.tsx` sin cambiar calculo de rewards, adventure rewards, audio ni reglas.

### Tested
- `npm.cmd run check:full`

## [0.25.199] - 2026-05-09

### Changed
- Extraido el panel Enemy Tricks de setup Frontline a `components/game/frontline/BattlePageEnemyTricksPanel.tsx`.
- Reducido `components/game/BattlePageClient.tsx` sin cambiar cartas enemigas, preview, audio, rewards ni reglas.

### Tested
- `npm.cmd run check:full`

## [0.25.198] - 2026-05-09

### Changed
- Extraido el selector de enemigos de setup Frontline a `components/game/frontline/BattlePageEnemySelector.tsx`.
- Reducido `components/game/BattlePageClient.tsx` sin cambiar seleccion de preset, portraits, audio, rewards ni reglas.

### Tested
- `npm.cmd run check:full`

## [0.25.197] - 2026-05-09

### Changed
- Extraido el grid de enfrentamientos Frontline setup a `BattlePageMatchupGrid`.
- Reducido `components/game/BattlePageClient.tsx` sin cambiar datos de heroes, forecast, power readout, audio ni reglas.

### Tested
- `npm.cmd run check:full`

## [0.25.196] - 2026-05-09

### Changed
- Extraido el hero visual de setup Frontline a `components/game/frontline/BattlePageSetupHero.tsx`.
- Reducido `components/game/BattlePageClient.tsx` sin cambiar readiness, power preview, seleccion de enemigo, audio ni reglas.

### Tested
- `npm.cmd run check:full`

## [0.25.195] - 2026-05-09

### Changed
- Extraido el panel de lanzamiento de pre-combate Frontline a `components/game/frontline/BattlePageLaunchPanel.tsx`.
- Reducido `components/game/BattlePageClient.tsx` sin cambiar inicio de combate, rewards preview, navegacion, audio ni reglas.

### Tested
- `npm.cmd run check:full`

## [0.25.194] - 2026-05-09

### Changed
- Extraida la cabecera de comandos de DeckBattle a `components/game/deckbattle/DeckBattleCommandPanel.tsx`.
- Reducido `components/game/DeckBattle.tsx` sin cambiar calculo de foco, hints, SFX, reglas ni flujo de turno.

### Tested
- `npm.cmd run check:full`

## [0.25.193] - 2026-05-09

### Changed
- Extraida la presentacion de la mano de cartas de DeckBattle a `components/game/deckbattle/DeckBattleHand.tsx`.
- Reducido `components/game/DeckBattle.tsx` sin cambiar reglas, seleccion de cartas, mana, SFX ni flujo de turno.

### Tested
- `npm.cmd run check:full`

## [0.25.192] - 2026-05-09

### Changed
- Extraida la configuracion de tipos, familias, paletas, auras e insets de HomeIcon a `components/game/home/HomeIconConfig.ts`.
- Reducido `components/game/home/HomeIcon.tsx` sin cambiar assets, fallback, SVG ni semantica visual de iconos Home.

### Tested
- `npm.cmd run check:full`

## [0.25.191] - 2026-05-09

### Changed
- Extraidos controles reutilizables del editor QA de Home Effects a `components/game/home/HomeEffectsQaFields.tsx`.
- Reducido `components/game/home/HomeEffectsQaEditor.tsx` por debajo de 500 lineas sin cambiar guardado, drag, import/export ni edicion de efectos.

### Tested
- `npm.cmd run check:full`

## [0.25.190] - 2026-05-09

### Changed
- Extraido el bloque global de keyframes de HomeWorldMap a `components/game/home/HomeWorldMapStyles.tsx`.
- Reducido `components/game/HomeWorldMap.tsx` por debajo de 500 lineas sin cambiar comportamiento, audio, navegacion ni editor QA.

### Tested
- `npm.cmd run check:full`

## [0.25.189] - 2026-05-09

### Changed
- Movido el tipo `HomeHotspot` a `components/game/home/types.ts` para desacoplar datos de hotspots del componente HomeWorldMap.
- Extraido `WorldHotspot` a `components/game/home/HomeWorldMapWidgets.tsx`, reduciendo `components/game/HomeWorldMap.tsx` sin cambiar layout, navegacion, SFX ni editor QA.

### Tested
- `npm.cmd run check:full`

## [0.25.188] - 2026-05-09

### Changed
- Extraido el CTA visual `FightCrystal` de HomeWorldMap a `components/game/home/HomeWorldMapWidgets.tsx`.
- Reducido `components/game/HomeWorldMap.tsx` sin cambiar rutas, copy, SFX, estado Home, recursos ni editor QA.

### Tested
- `npm.cmd run check:full`

## [0.25.187] - 2026-05-09

### Changed
- Extraidas acciones visuales de HomeWorldMap (`SideCharm`, `MiniActionCharm`, `DockShrine`, `CornerAction`) a `components/game/home/HomeWorldMapWidgets.tsx`.
- Reducido `components/game/HomeWorldMap.tsx` sin cambiar navegacion, recursos, editor QA, estado Home ni audio.

### Tested
- `npm.cmd run check:full`

## [0.25.186] - 2026-05-09

### Changed
- Extraidos widgets visuales de HomeWorldMap a `components/game/home/HomeWorldMapWidgets.tsx`.
- Eliminado `ResourceTotem` sin uso de `components/game/HomeWorldMap.tsx`.
- Reducido `HomeWorldMap.tsx` sin cambiar estado Home, recursos, navegacion, editor QA ni audio.

### Tested
- `npm.cmd run check:full`

## [0.25.185] - 2026-05-09

### Changed
- Extraidas constantes de acciones, estilos de tono y formatters de HomeWorldMap a `components/game/home/homeWorldMapConfig.ts`.
- Reducido `components/game/HomeWorldMap.tsx` sin cambiar interacciones, recursos, navegacion, editor QA ni audio.

### Tested
- `npm.cmd run check:full`

## [0.25.184] - 2026-05-09

### Changed
- Extraida la gestion de drafts del editor QA de efectos Home a `components/game/home/homeEffectsQaState.ts`.
- Reducido `components/game/HomeWorldMap.tsx` sin cambiar layout Home, efectos, editor QA, navegacion ni audio.

### Tested
- `npm.cmd run check:full`

## [0.25.183] - 2026-05-09

### Changed
- Eliminado codigo muerto de zonas SVG heredadas no renderizadas desde `components/game/home/HomeScene.tsx`.
- Reducido `HomeScene.tsx` sin cambiar background activo, capas de landmarks, efectos Home, QA ni audio.

### Tested
- `npm.cmd run check:full`

## [0.25.182] - 2026-05-09

### Changed
- Extraidos los props del Chapter 1 de Adventure a `components/game/adventure/adventureMapChapterOneProps.ts`.
- Reducido `components/game/adventure/adventureMapLayout.ts` por debajo de 500 lineas sin cambiar nodos, rutas, coordenadas, interacciones ni editor QA.

### Tested
- `npm.cmd run check:full`

## [0.25.181] - 2026-05-09

### Changed
- Movidos badges de tablero, status pills, highlights y leyenda tactica a `components/game/tactical/TacticalBoardPrimitives.tsx`.
- Reducido `components/game/TacticalBoard.tsx` por debajo de 500 lineas sin cambiar seleccion, acciones, highlights, reglas ni audio.

### Tested
- `npm.cmd run check:full`

## [0.25.180] - 2026-05-09

### Changed
- Extraidas las queries tacticas puras a `features/tactical/queries.ts`.
- Mantenidos reexports desde `features/tactical/engine.ts` para preservar imports existentes.
- Reducido `features/tactical/engine.ts` por debajo de 500 lineas sin cambiar movimiento, ataques, habilidades, IA ni audio.

### Tested
- `npm.cmd run check:full`

## [0.25.179] - 2026-05-09

### Changed
- Extraida la presentacion de cartas de mano de DeckBattle a `components/game/deckbattle/DeckBattleCards.tsx`.
- Reducido `components/game/DeckBattle.tsx` por debajo de 500 lineas sin cambiar cartas, mana, IA, audio ni resolucion tactica.

### Tested
- `npm.cmd run check:full`

## [0.25.178] - 2026-05-09

### Changed
- Movidos paneles de fase, lider, poder de lider y contexto de DeckBattle a `components/game/deckbattle/DeckBattlePrimitives.tsx`.
- Reducido `components/game/DeckBattle.tsx` sin cambiar turnos, mana, cartas, IA, audio ni resolucion tactica.

### Tested
- `npm.cmd run check:full`

## [0.25.177] - 2026-05-09

### Changed
- Extraidas primitivas visuales de DeckBattle a `components/game/deckbattle/DeckBattlePrimitives.tsx`.
- Movidos `MetricPill`, `HeaderChip`, `UtilityBubble` y `ManaWellPanel` fuera de `components/game/DeckBattle.tsx`.
- Reducido `DeckBattle.tsx` sin cambiar turnos, mana, cartas, IA, audio ni resolucion tactica.

### Tested
- `npm.cmd run check:full`

## [0.25.176] - 2026-05-09

### Changed
- Extraido el schema del mapa Adventure a `components/game/adventure/adventureMapSchema.ts`.
- Mantenidos reexports desde `components/game/adventure/adventureMapLayout.ts` para preservar imports existentes.
- Reducido `adventureMapLayout.ts` sin cambiar coordenadas, props, rutas, nodos ni datos del editor QA.

### Tested
- `npm.cmd run check:full`

## [0.25.175] - 2026-05-09

### Changed
- Movido `UnitStandee` y sus mapas visuales a `components/game/tactical/TacticalBoardPrimitives.tsx`.
- Reducido `components/game/TacticalBoard.tsx` por debajo de 500 lineas.
- Preservada la UI tactica existente sin cambiar seleccion, movimiento, ataques, habilidades ni audio.

### Tested
- `npm.cmd run check:full`

## [0.25.174] - 2026-05-09

### Changed
- Extraidas primitivas visuales de `TacticalBoard` a `components/game/tactical/TacticalBoardPrimitives.tsx`.
- Movidos `StatGem`, `ActionButton` y `FloatingText` fuera de `components/game/TacticalBoard.tsx`.
- Reducido `TacticalBoard.tsx` sin cambiar acciones, seleccion, highlights ni reglas tacticas.

### Tested
- `npm.cmd run check:full`

## [0.25.173] - 2026-05-09

### Changed
- Extraidos tipos compartidos de `GameGlyph` a `components/ui/gameGlyphTypes.ts`.
- Mantenido el reexport de `GlyphKind` desde `components/ui/GameGlyph.tsx` para preservar imports existentes.
- Reducido `components/ui/GameGlyph.tsx` por debajo de 500 lineas sin cambiar SVGs, fallbacks ni apariencia de iconos.

### Tested
- `npm.cmd run check:full`

## [0.25.172] - 2026-05-08

### Changed
- Extraidas utilidades de grid tactico a `features/tactical/tacticalGrid.ts`.
- Mantenidos reexports desde `features/tactical/engine.ts` para preservar imports existentes.
- Reducido `features/tactical/engine.ts` por debajo de 500 lineas sin cambiar movimiento, alcance, ataques ni habilidades.

### Tested
- `npm.cmd run check:full`

## [0.25.171] - 2026-05-08

### Changed
- Extraida la gestion de mazo, mano inicial, robo y cartas jugables de DeckBattle a `features/deckbattle/deckSideState.ts`.
- Mantenidos reexports desde `features/deckbattle/engine.ts` para preservar imports existentes.
- Reducido `features/deckbattle/engine.ts` por debajo de 500 lineas sin cambiar shuffle, mana, robo ni descarte.

### Tested
- `npm.cmd run check:full`

## [0.25.170] - 2026-05-08

### Changed
- Extraidos presets de combate Frontline a `features/frontline/frontlinePresetData.ts`.
- Convertido `features/frontline/data.ts` en fachada de exports de datos Frontline.
- Mantenidos ids, squads, decks, recompensas seed y bosses sin cambios.

### Tested
- `npm.cmd run check:full`

## [0.25.169] - 2026-05-08

### Changed
- Extraidas cartas, decks base e indices de cartas Frontline a `features/frontline/frontlineCardData.ts`.
- Mantenidos reexports desde `features/frontline/data.ts` para preservar integraciones de Deck, Shop, Battle y tests.
- Reducido `features/frontline/data.ts` a presets y fachada de datos sin cambiar costes, efectos, deck inicial ni pool de cartas.

### Tested
- `npm.cmd run check:full`

## [0.25.168] - 2026-05-08

### Changed
- Extraidos supports temporales de Frontline a `features/frontline/frontlineSupportData.ts`.
- Mantenidos reexports desde `features/frontline/data.ts` para preservar imports existentes.
- Reducido `features/frontline/data.ts` por debajo de 500 lineas sin cambiar duraciones, intercepts ni efectos de supports.

### Tested
- `npm.cmd run check:full`

## [0.25.167] - 2026-05-08

### Changed
- Extraidos heroes, enemigos e indices de unidades Frontline a `features/frontline/frontlineUnitData.ts`.
- Mantenidos reexports desde `features/frontline/data.ts` para conservar compatibilidad con pantallas, tests y setup de batalla.
- Reducido `features/frontline/data.ts` sin cambiar stats, traits, ids ni familias de unidades.

### Tested
- `npm.cmd run check:full`

## [0.25.166] - 2026-05-08

### Changed
- Extraidos datos de lideres de Frontline a `features/frontline/frontlineLeaderData.ts`.
- Mantenidos reexports desde `features/frontline/data.ts` para preservar imports existentes.
- Reducido `features/frontline/data.ts` sin cambiar ids, core HP ni poderes de lider.

### Tested
- `npm.cmd run check:full`

## [0.25.165] - 2026-05-08

### Changed
- Extraida la resolucion de golpes de actores a `features/frontline/frontlineActorStrike.ts`.
- Movidos calculos de ataque, aura `chant`, lifesteal, venom, cinder y soul drain por golpe fuera de `features/frontline/engine.ts`.
- Reducido `features/frontline/engine.ts` por debajo de 500 lineas sin cambiar orden de clash ni reglas de dano.

### Tested
- `npm.cmd run check:full`

## [0.25.164] - 2026-05-08

### Changed
- Extraidos efectos de clash, aftermath, expiracion de supports y limpieza de temporales a `features/frontline/frontlineClashEffects.ts`.
- Reducido `features/frontline/engine.ts` sin cambiar orden de efectos de support, traits `bulwark`/`mend`, stuns ni escudos temporales.

### Tested
- `npm.cmd run check:full`

## [0.25.163] - 2026-05-08

### Changed
- Extraida la resolucion de dano directo a `features/frontline/frontlineDirectDamage.ts`.
- Reducido `features/frontline/engine.ts` sin cambiar prioridad de dano a support, heroes, core, eventos KO ni resoluciones visibles.

### Tested
- `npm.cmd run check:full`

## [0.25.162] - 2026-05-08

### Changed
- Extraidas condiciones de victoria, derrota, empate y batalla resuelta a `features/frontline/frontlineBattleOutcome.ts`.
- Reducido `features/frontline/engine.ts` sin cambiar reglas de cierre de combate ni limite de rondas.

### Tested
- `npm.cmd run check:full`

## [0.25.161] - 2026-05-08

### Changed
- Extraida la preparacion de turnos y setup de fase enemiga a `features/frontline/frontlineTurnPreparation.ts`.
- Movidos los valores de command/robo por turno al modulo de preparacion correspondiente.
- Reducido `features/frontline/engine.ts` sin cambiar robo, command, cooldowns, eventos de round ni ticks de boss.

### Tested
- `npm.cmd run check:full`

## [0.25.160] - 2026-05-08

### Changed
- Extraidas reglas de presencia y breach a `features/frontline/frontlineBreachRules.ts`.
- Movido el mapa de dano de breach fuera de `features/frontline/engine.ts`.
- Reducido `features/frontline/engine.ts` sin cambiar dano por lane, bonus de breach, eventos ni resoluciones.

### Tested
- `npm.cmd run check:full`

## [0.25.159] - 2026-05-08

### Changed
- Extraida la ordenacion de actores y el readout de iniciativa a `features/frontline/frontlineStrikeOrder.ts`.
- Reexportados `laneStrikeOrder` y `FrontlineStrikeOrderEntry` desde `features/frontline/engine.ts` para preservar consumidores existentes.
- Reducido `features/frontline/engine.ts` sin cambiar desempates de iniciativa ni orden de resolucion por lane.

### Tested
- `npm.cmd run check:full`

## [0.25.158] - 2026-05-08

### Changed
- Extraida la logica de firmas de boss a `features/frontline/frontlineBossSignatures.ts`.
- Reducido `features/frontline/engine.ts` manteniendo en el engine solo los puntos de llamada de cinder, inferno, veil, armor y soul drain.
- Conservado el orden de ejecucion de boss signatures durante preparacion de turno, golpes y cinder marks.

### Tested
- `npm.cmd run check:full`

## [0.25.157] - 2026-05-08

### Changed
- Extraida la seleccion de acciones de IA enemiga a `features/frontline/frontlineEnemyAi.ts`.
- Reducido `features/frontline/engine.ts` manteniendo en el engine la ejecucion del turno enemigo y el uso de poderes de lider.
- Normalizados comentarios afectados por encoding a ASCII para evitar errores de lint sin cambiar logica.

### Tested
- `npm.cmd run check:full`

## [0.25.156] - 2026-05-08

### Changed
- Extraidas primitivas de vida, escudo, dano a heroes y dano a supports a `features/frontline/frontlineHealthRules.ts`.
- Reducido `features/frontline/engine.ts` sin cambiar calculos de HP, absorcion de escudo, curacion ni estados `alive`.

### Tested
- `npm.cmd run check:full`

## [0.25.155] - 2026-05-08

### Changed
- Extraidos helpers de definicion, iniciativa, breach, traits y presencia de combatientes a `features/frontline/frontlineCombatantRules.ts`.
- Reexportado `frontPresenceScore` desde `features/frontline/engine.ts` para mantener compatibilidad con imports existentes.
- Reducido `features/frontline/engine.ts` sin cambiar lideres, traits, iniciativa, breach ni resolucion de turnos.

### Tested
- `npm.cmd run check:full`

## [0.25.154] - 2026-05-08

### Changed
- Extraidas reglas auxiliares de cartas a `features/frontline/frontlineCardRules.ts`.
- Mantenidos los exports publicos desde `features/frontline/engine.ts` para preservar compatibilidad con preview y UI.
- Reducido `features/frontline/engine.ts` sin cambiar costes, targets validos, cartas jugables ni consumo de cartas.

### Tested
- `npm.cmd run check:full`

## [0.25.153] - 2026-05-08

### Changed
- Extraida la construccion inicial de lanes, heroes y boss state a `features/frontline/frontlineBattleSetup.ts`.
- Reducido `features/frontline/engine.ts` separando setup inicial de batalla sin modificar turnos, IA ni resolucion.

### Tested
- `npm.cmd run check:full`

## [0.25.152] - 2026-05-08

### Changed
- Extraidos accessors de estado de batalla a `features/frontline/frontlineBattleAccessors.ts`.
- Reducido `features/frontline/engine.ts` separando acceso a mazos, nucleo, heroes y supports por lane sin alterar reglas de combate.

### Tested
- `npm.cmd run check:full`

## [0.25.151] - 2026-05-08

### Changed
- Extraida la emision de eventos, snapshots visibles y resoluciones textuales a `features/frontline/frontlineEvents.ts`.
- Reducido `features/frontline/engine.ts` manteniendo intactos ids de eventos, orden de trazas e historial de resolucion.

### Tested
- `npm.cmd run check:full`

## [0.25.150] - 2026-05-08

### Changed
- Extraidos helpers puros de clonacion de estado a `features/frontline/frontlineStateClone.ts`.
- Extraidos helpers deterministas de mazo y robo a `features/frontline/frontlineDeckState.ts`.
- Reducido `features/frontline/engine.ts` sin cambiar reglas, orden de robo, snapshots ni resolucion de combate.

### Tested
- `npm.cmd run check:full`

## [0.25.149] - 2026-05-08

### Changed
- Extraidos los mapeos de SFX de cartas y eventos de `FrontlineBattle` a `components/game/frontline/FrontlineBattleSfx.ts`.
- Reducido `FrontlineBattle.tsx` por debajo de 500 lineas sin cambiar reglas, themes, delays ni condiciones de audio.

### Tested
- `npm.cmd run check:full`

## [0.25.148] - 2026-05-08

### Changed
- Extraida la composicion visual de `FrontlineBattle` a `components/game/frontline/FrontlineBattleStage.tsx`.
- Reducida la responsabilidad de `FrontlineBattle.tsx`, manteniendo en el archivo principal el estado, handlers y flujo de resolucion sin tocar reglas de combate.

### Tested
- `npm.cmd run check:full`

## [0.25.147] - 2026-05-08

### Changed
- Extraido el panel de resultado de `BattlePageClient` a `components/game/frontline/BattlePageResultPanel.tsx`.
- Reducido `BattlePageClient.tsx` por debajo de 500 lineas, dejando el cliente centrado en estado, seleccion de preset y transiciones de fase.

### Tested
- `npm.cmd run check:full`

## [0.25.146] - 2026-05-08

### Changed
- Extraidos los componentes de matchup y prebattle de `BattlePageClient` a `components/game/frontline/BattlePageMatchup.tsx`.
- Movido `heroPreviewPower` a `frontlineBattlePageLogic.ts` para reutilizar el calculo de power sin duplicarlo en el cliente principal.

### Added
- Cobertura focalizada para el calculo de preview power de lanes.

### Tested
- `npm.cmd run check:full`

## [0.25.145] - 2026-05-08

### Changed
- Extraidos paneles y componentes presentacionales de `BattlePageClient` a `components/game/frontline/BattlePagePanels.tsx`.
- Reducido `BattlePageClient.tsx` separando stats, rewards, result metrics, empty card y boss signature preview sin tocar reglas de Combat.

### Tested
- `npm.cmd run check:full`

## [0.25.144] - 2026-05-08

### Changed
- Extraidos helpers puros de `BattlePageClient` a `components/game/frontline/frontlineBattlePageLogic.ts`.
- Separada la logica de encounter badge, modificadores, fondo de batalla y proyeccion de XP de cuenta sin tocar reglas de Combat.

### Added
- Tests de logica de battle page para badges, modificadores, fondos y progreso de cuenta.

### Tested
- `npm.cmd run check:full`

## [0.25.143] - 2026-05-08

### Changed
- Extraida la planificacion de clear/claim de nodos Adventure a `lib/adventureNodeState.ts`.
- Reducida la responsabilidad de `lib/store.ts` separando first-clear, claims de nodos, rewards y patches de progreso.

### Added
- Tests de planes de nodos Adventure para first clear, clears repetidos, claims validos, claims repetidos y nodos desconocidos.

### Tested
- `npm.cmd run check:full`

## [0.25.142] - 2026-05-08

### Changed
- Extraida la planificacion de unlock/upgrade de cartas Frontline a `lib/frontlineCardState.ts`.
- Reducida la responsabilidad de `lib/store.ts` separando validacion de cartas, coste de upgrade y patch de niveles/unlocks.

### Added
- Tests de planes de cartas Frontline para unlocks, costes, bloqueos y max level.

### Tested
- `npm.cmd run check:full`

## [0.25.141] - 2026-05-08

### Changed
- Extraidos helpers de housekeeping del store a `lib/storeHousekeeping.ts`.
- Reducida la responsabilidad de `lib/store.ts` separando notificaciones, seed, guardado de batalla, eventos, refrescos diarios y onboarding.

### Added
- Tests de housekeeping para notificaciones, seed, eventos, shop diario, arena tickets, batalla guardada y onboarding.

### Tested
- `npm.cmd run check:full`

## [0.25.140] - 2026-05-08

### Changed
- Extraida la planificacion de claims de interacciones del mapa de Adventure a `lib/adventureMapInteractionClaims.ts`.
- Reducida la responsabilidad de `lib/store.ts` separando validacion de estado, mensajes y patch de claim de cofres de mapa.

### Added
- Tests de planificacion de claims para interacciones desconocidas, bloqueadas, sin llave, ya reclamadas y listas.

### Tested
- `npm.cmd run check:full`

## [0.25.139] - 2026-05-08

### Changed
- Extraidas transformaciones de team/deck/loadout a `lib/loadoutState.ts`.
- Reducida la responsabilidad de `lib/store.ts` separando seleccion de slots, lider de Frontline y toggle de deck.

### Added
- Tests de loadout para evitar duplicados y fijar la politica de toggle/reemplazo de cartas.

### Tested
- `npm.cmd run check:full`

## [0.25.138] - 2026-05-08

### Changed
- Extraidos helpers de Fortress a `lib/fortressState.ts`.
- Reducida la responsabilidad de `lib/store.ts` separando income, costes de upgrade, patches de edificios y garrison.

### Added
- Tests de Fortress para income, upgrades, bonuses de combate y exclusividad de garrison.

### Tested
- `npm.cmd run check:full`

## [0.25.137] - 2026-05-08

### Changed
- Extraidos los selectors/helpers publicos del store a `lib/storeSelectors.ts`.
- Reducida la responsabilidad de `lib/store.ts` dejando reexports compatibles para pantallas existentes.

### Tested
- `npm.cmd run check:full`

## [0.25.136] - 2026-05-08

### Changed
- Extraidos los tipos publicos del store a `lib/storeTypes.ts`.
- Reducida la responsabilidad visual de `lib/store.ts` dejando `GameState`, `GameActions`, notificaciones y preferencias como tipos reexportados.

### Tested
- `npm.cmd run check:full`

## [0.25.135] - 2026-05-08

### Changed
- Extraida la politica de claims meta a `lib/metaRewardClaims.ts`.
- Reducida la responsabilidad de `lib/store.ts` separando daily login, roadmap y milestones de la orquestacion de rewards.

### Added
- Tests de claims meta para daily login, bloqueo de doble claim diario, roadmap completado y milestones de cuenta.

### Tested
- `npm.cmd run check:full`

## [0.25.134] - 2026-05-08

### Changed
- Ampliada `lib/missionProgress.ts` para centralizar inicializacion, progreso por metrica y claim de misiones.
- Reducida la responsabilidad de `lib/store.ts` separando la politica de reset/progreso/claim de misiones.

### Added
- Tests de misiones para inicializacion, progreso con cap de objetivo, claim valido y rechazo de claims incompletos o ya reclamados.

### Tested
- `npm.cmd run check:full`

## [0.25.133] - 2026-05-08

### Changed
- Extraida la politica de compra de tienda a `lib/shopPurchases.ts`.
- Reducida la responsabilidad de `lib/store.ts` separando validacion de llaves, limites one-time/daily, contadores y stock restante.

### Added
- Tests de compras de tienda para desbloqueo de llaves, limites diarios, compras one-time, contadores y stock restante.

### Tested
- `npm.cmd run check:full`

## [0.25.132] - 2026-05-08

### Changed
- Extraidos helpers de progreso y claims de Adventure a `lib/adventureProgressState.ts`.
- Reducida la responsabilidad de `lib/store.ts` separando patches de clear de niveles, claim de nodos y claim de cofres interactuables.

### Added
- Tests de estado de Adventure para entradas por defecto, clears repetidos, claims de nodos y reset timing de interacciones de mapa.

### Tested
- `npm.cmd run check:full`

## [0.25.131] - 2026-05-08

### Changed
- Extraidas las reglas de mejora de heroes a `lib/heroUpgrades.ts`.
- Reducida la responsabilidad de `lib/store.ts` separando costes, limites y patches de `levelUpHero`, `starUpHero` y `skillUpHero`.

### Added
- Tests de mejoras de heroes para level-up, star-up, skill-up, recursos insuficientes, shards insuficientes, skill max y heroes bloqueados.

### Tested
- `npm.cmd run check:full`

## [0.25.130] - 2026-05-08

### Changed
- Extraida la construccion del patch de recompensas a `lib/rewardApplication.ts`.
- Reducida la responsabilidad de `lib/store.ts` para que `awardRewards` solo orqueste aplicacion de rewards y notificaciones.

### Added
- Tests de aplicacion combinada de recompensas para recursos, shards antes de XP de equipo, XP de cuenta y cartas Frontline.

### Tested
- `npm.cmd run check:full`

## [0.25.129] - 2026-05-08

### Changed
- Extraida la aplicacion de recompensas de cartas Frontline a `lib/frontlineCardRewards.ts`.
- Reducida la responsabilidad de `lib/store.ts` separando desbloqueo de cartas y deteccion de nuevas cartas desbloqueadas.

### Added
- Tests de recompensas de cartas Frontline para rewards vacios, cartas de progresion, cartas desconocidas y deteccion de nuevos unlocks.

### Tested
- `npm.cmd run check:full`

## [0.25.128] - 2026-05-08

### Changed
- Extraida la aplicacion de XP de equipo a `lib/heroXp.ts`.
- Reducida la responsabilidad de `lib/store.ts` separando la recompensa de XP por slots activos del team.

### Added
- Tests de XP de equipo para recompensas vacias, slots ocupados, heroes inexistentes y aplicacion por slot duplicado.

### Tested
- `npm.cmd run check:full`

## [0.25.127] - 2026-05-08

### Changed
- Extraida la aplicacion de shards de heroes a `lib/heroShards.ts`.
- Reducida la responsabilidad de `lib/store.ts` separando creacion, acumulacion y desbloqueo de heroes por shards.

### Added
- Tests de shards de heroes para recompensas vacias, heroes nuevos bloqueados, heroes nuevos desbloqueados, desbloqueo por acumulacion y heroes ya desbloqueados.

### Tested
- `npm.cmd run check:full`

## [0.25.126] - 2026-05-08

### Changed
- Extraida la progresion de XP de cuenta a `lib/accountProgression.ts`.
- Reducida la responsabilidad de `lib/store.ts` separando calculo de nivel, XP sobrante y `pendingUnlockLevel`.

### Added
- Tests de progresion de cuenta para no-reward, suma simple, level-up y preservacion del mayor unlock pendiente.

### Tested
- `npm.cmd run check:full`

## [0.25.125] - 2026-05-08

### Changed
- Extraidos helpers puros de recursos a `lib/resourceMath.ts`.
- Reducida la responsabilidad de `lib/store.ts` separando suma de rewards, validacion de costes y gasto de recursos.

### Added
- Tests para suma, affordability y gasto de recursos.

### Tested
- `npm.cmd run check:full`

## [0.25.124] - 2026-05-08

### Changed
- Extraido el merge de persistencia local a `lib/persistedGameState.ts`.
- Reducida la responsabilidad de `lib/store.ts` separando migracion de saves, defaults de campos nuevos, sanitizacion de deck y compatibilidad de heroes antiguos.

### Added
- Tests de compatibilidad de persistencia para `adventureKeys`, deck con ids invalidos y migracion de `skillLevel`.

### Tested
- `npm.cmd run check:full`

## [0.25.123] - 2026-05-08

### Changed
- Extraidos defaults iniciales del store a `lib/defaultGameState.ts`.
- Reducida la responsabilidad de `lib/store.ts` separando estado inicial, starter deck, starter roster, fortress base y helpers de fecha.
- Mantenidas intactas economia, rewards, progresion, persistencia local y reglas de combate.

### Tested
- `npm.cmd run check:full`

## [0.25.122] - 2026-05-08

### Changed
- Extraidos helpers de progreso/reset de misiones a `lib/missionProgress.ts`.
- Reducida la responsabilidad de `lib/store.ts` separando calculo de resets diarios/semanales y progreso inicial de misiones.
- Mantenidas intactas economia, rewards, progresion, persistencia local y reglas de combate.

### Tested
- `npm.cmd run check:full`

## [0.25.121] - 2026-05-08

### Changed
- Extraido el filtrado de eventos de playback de resolucion a `components/game/frontline/FrontlineBattleDerivedState.ts`.
- Reducida la responsabilidad de `components/game/frontline/FrontlineBattle.tsx` dejando `showResolutionFx` como orquestador del estado visual.

### Added
- Tests para filtrado y limite de eventos de resolution playback en `tests/frontline.battleDerivedState.test.ts`.

### Tested
- `npm.cmd run check:full`

## [0.25.120] - 2026-05-08

### Changed
- Extraidos tipos de estado visual/Fx de Combat a `components/game/frontline/FrontlineBattleFxState.ts`.
- Reducida la responsabilidad de `components/game/frontline/FrontlineBattle.tsx` eliminando aliases inline de resolution, card FX, finish FX, death ghosts y core shock.
- Mantenidas intactas las reglas del engine, validacion de targets, command economy, SFX, audio, rewards y persistencia.

### Tested
- `npm.cmd run check:full`

## [0.25.119] - 2026-05-08

### Changed
- Extraido el calculo puro de core shock de Combat a `components/game/frontline/FrontlineBattleDerivedState.ts`.
- Reducida la responsabilidad de `components/game/frontline/FrontlineBattle.tsx` dejando el efecto React solo como orquestador de estado visual y SFX.

### Added
- Cobertura de tests para `getCoreShockChange` en `tests/frontline.battleDerivedState.test.ts`.

### Tested
- `npm.cmd run check:full`

## [0.25.118] - 2026-05-08

### Changed
- Ampliados los helpers derivados de Combat en `components/game/frontline/FrontlineBattleDerivedState.ts`.
- Separados de `components/game/frontline/FrontlineBattle.tsx` los calculos de display state, lanes targeteables e insights ordenados por prioridad.
- Mantenidas intactas las reglas del engine, validacion de targets, command economy, SFX, audio, rewards y persistencia.

### Tested
- `npm.cmd run check:full`

## [0.25.117] - 2026-05-08

### Changed
- Extraida la factory de estado inicial de Combat a `components/game/frontline/FrontlineBattleStateFactory.ts`.
- Reducida duplicacion en `components/game/frontline/FrontlineBattle.tsx` al centralizar la creacion/reset del estado desde props.
- Mantenidas intactas las reglas del engine, validacion de targets, command economy, SFX, audio, rewards y persistencia.

### Tested
- `npm.cmd run check:full`

## [0.25.116] - 2026-05-08

### Changed
- Extraidos helpers derivados de Combat a `components/game/frontline/FrontlineBattleDerivedState.ts`.
- Separados calculos puros de boss segments, contexto seleccionado e inferno cast de `components/game/frontline/FrontlineBattle.tsx`.
- Mantenidas intactas las reglas del engine, validacion de targets, command economy, SFX, audio, rewards y persistencia.

### Tested
- `npm.cmd run check:full`

## [0.25.115] - 2026-05-08

### Changed
- Extraido el shell visual de Combat a `components/game/frontline/FrontlineBattleShell.tsx`.
- Reducida la responsabilidad de `components/game/frontline/FrontlineBattle.tsx` separando contenedor, fondos, overlays atmosfericos y estilos locales de la orquestacion de batalla.
- Mantenidas intactas las reglas del engine, validacion de targets, command economy, SFX, audio, rewards y persistencia.

### Tested
- `npm.cmd run check:full`

## [0.25.114] - 2026-05-08

### Changed
- Extraidos overlays globales de feedback de Combat a `components/game/frontline/FrontlineBattleOverlays.tsx`.
- Reducida la responsabilidad de `components/game/frontline/FrontlineBattle.tsx` separando clash spotlight, preview spotlight, card toast, synergy toast y end overlay.
- Mantenidas intactas las reglas del engine, validacion de targets, command economy, SFX, audio, rewards y persistencia.

### Tested
- `npm.cmd run check:full`

## [0.25.113] - 2026-05-08

### Changed
- Extraido el tablero de lanes de Combat a `components/game/frontline/FrontlineBattleLanes.tsx`.
- Reducida la responsabilidad de `components/game/frontline/FrontlineBattle.tsx` separando composicion de lanes, boss colossus, boss segments, combatientes y feedback visual por frente.
- Mantenidas intactas las reglas del engine, validacion de targets, command economy, SFX, audio, rewards y persistencia.

### Tested
- `npm.cmd run check:full`

## [0.25.112] - 2026-05-08

### Changed
- Extraido el header superior de Combat a `components/game/frontline/FrontlineBattleHeader.tsx`.
- Reducida la responsabilidad de `components/game/frontline/FrontlineBattle.tsx` separando cores, command pips, habilidad de lider, clear selection y resolve clash.
- Mantenidas intactas las reglas del engine, validacion de targets, command economy, SFX, audio, rewards y persistencia.

### Tested
- `npm.cmd run check:full`

## [0.25.111] - 2026-05-08

### Changed
- Extraido el panel lateral de foco/feed de Combat a `components/game/frontline/FrontlineBattleSidebar.tsx`.
- Reducida la responsabilidad de `components/game/frontline/FrontlineBattle.tsx` separando contexto de seleccion, score de lane, targets disponibles y feed reciente.
- Mantenidas intactas las reglas del engine, validacion de targets, command economy, SFX, audio, rewards y persistencia.

### Tested
- `npm.cmd run check:full`

## [0.25.110] - 2026-05-08

### Changed
- Extraida la seccion de mano de Combat a `components/game/frontline/FrontlineHandSection.tsx`.
- Reducida la responsabilidad de `components/game/frontline/FrontlineBattle.tsx` separando render de mano, estado de cartas jugables y recomendacion visual de lane.
- Mantenidas intactas las reglas del engine, target validation, command economy, SFX, audio, rewards y persistencia.

### Tested
- `npm.cmd run check:full`

## [0.25.109] - 2026-05-08

### Changed
- Extraido el bloque de animaciones y estilos locales de Combat a `components/game/frontline/FrontlineBattleStyles.tsx`.
- Reducida la responsabilidad de `components/game/frontline/FrontlineBattle.tsx` separando CSS de combate de la composicion y flujo de estado.
- Mantenidas intactas las reglas del engine, resolucion de combate, command economy, SFX, audio, rewards y persistencia.

### Tested
- `npm.cmd run check:full`

## [0.25.108] - 2026-05-08

### Changed
- Extraidos helpers de estado textual/visual de batalla a `components/game/frontline/FrontlineBattleUiState.ts`.
- Reducida la responsabilidad de `components/game/frontline/FrontlineBattle.tsx` separando labels de lane, resumen/target de carta, tono de impacto, flash de core y siguiente accion.
- Mantenidas intactas las reglas del engine, resolucion de combate, command economy, SFX, audio, rewards y persistencia.

### Tested
- `npm.cmd run check:full`

## [0.25.107] - 2026-05-08

### Changed
- Extraidos los helpers de flujo visual de resolucion a `components/game/frontline/FrontlineResolutionFlow.ts`.
- Reducida la responsabilidad de `components/game/frontline/FrontlineBattle.tsx` separando filtrado de eventos mostrables, duraciones, truncado al ganador y death ghosts.
- Mantenidas intactas las reglas del engine, resolucion de combate, command economy, SFX, audio, rewards y persistencia.

### Tested
- `npm.cmd run check:full`

## [0.25.106] - 2026-05-08

### Changed
- Extraidos los helpers de estado visual de combatientes a `components/game/frontline/FrontlineVisualState.ts`.
- Reducida la responsabilidad de `components/game/frontline/FrontlineBattle.tsx` separando targeting visual, tono de efectos, evento primario y estado visual de heroes.
- Mantenidas intactas las reglas del engine, resolucion de combate, command economy, SFX, audio, rewards y persistencia.

### Tested
- `npm.cmd run check:full`

## [0.25.105] - 2026-05-08

### Changed
- Extraidos los helpers de floats de resolucion a `components/game/frontline/FrontlineEventFloats.ts`.
- Reducida la responsabilidad de `components/game/frontline/FrontlineBattle.tsx` separando labels, clases e iconos visuales de eventos de combate.
- Mantenidas intactas las reglas del engine, secuencia de eventos, timings, SFX, audio, rewards y persistencia.

### Tested
- `npm.cmd run check:full`

## [0.25.104] - 2026-05-08

### Changed
- Extraidos los helpers de lectura de lanes a `components/game/frontline/FrontlineLaneInsights.ts`.
- Reducida la responsabilidad de `components/game/frontline/FrontlineBattle.tsx` separando analisis de frente, breach value, labels y metadatos visuales de estado.
- Mantenidas intactas las reglas del engine, formulas de combate, command economy, targeting, rewards, SFX, audio y persistencia.

### Tested
- `npm.cmd run check:full`

## [0.25.103] - 2026-05-08

### Changed
- Extraido `FrontlineHeroPiece` a `components/game/frontline/FrontlineHeroPiece.tsx`.
- Reducida la responsabilidad de `components/game/frontline/FrontlineBattle.tsx` separando el render visual de combatientes, estados, badges y soportes.
- Mantenidas intactas las reglas del engine, damage flow, command economy, targeting, rewards, SFX, audio y persistencia.

### Tested
- `npm.cmd run check:full`

## [0.25.102] - 2026-05-08

### Changed
- Extraido `FrontlineHandCard` a `components/game/frontline/FrontlineHandCard.tsx`.
- Reducida la responsabilidad de `components/game/frontline/FrontlineBattle.tsx` separando el render de cartas de mano y sus helpers visuales.
- Mantenidas intactas las reglas del engine, command economy, targeting, rewards, SFX, audio y persistencia.

### Tested
- `npm.cmd run check:full`

## [0.25.101] - 2026-05-08

### Changed
- Extraido `PreviewSpotlight` a `components/game/frontline/FrontlinePreviewSpotlight.tsx`.
- Reducida la responsabilidad de `components/game/frontline/FrontlineBattle.tsx` separando el spotlight visual de preview de carta.
- Mantenidas intactas las reglas del engine, calculo de preview, targeting, rewards, SFX, audio y persistencia.

### Tested
- `npm.cmd run check:full`

## [0.25.100] - 2026-05-08

### Changed
- Extraido `CardUseToast` a `components/game/frontline/FrontlineCardUseToast.tsx`.
- Reducida la responsabilidad de `components/game/frontline/FrontlineBattle.tsx` separando el toast visual de carta/power jugado.
- Mantenidas intactas las reglas del engine, timing del toast, targeting, rewards, SFX, audio y persistencia.

### Tested
- `npm.cmd run check:full`

## [0.25.99] - 2026-05-08

### Changed
- Extraido `ClashSpotlight` a `components/game/frontline/FrontlineClashSpotlight.tsx`.
- Reducida la responsabilidad de `components/game/frontline/FrontlineBattle.tsx` separando el spotlight visual del evento activo de clash.
- Mantenidas intactas las reglas del engine, resolucion de clash, targeting, rewards, SFX, audio y persistencia.

### Tested
- `npm.cmd run check:full`

## [0.25.98] - 2026-05-08

### Changed
- Extraido `ResolutionFloat` a `components/game/frontline/FrontlineResolutionFloat.tsx`.
- Reducida la responsabilidad de `components/game/frontline/FrontlineBattle.tsx` separando el render visual de eventos flotantes de resolucion.
- Mantenidas intactas las reglas del engine, resolucion de eventos, SFX, audio, rewards y persistencia.

### Tested
- `npm.cmd run check:full`

## [0.25.97] - 2026-05-08

### Changed
- Extraido `CardCastFx` a `components/game/frontline/FrontlineCardCastFx.tsx`.
- Movido el tipo visual `FrontlineCardPlayFx` junto al componente para reutilizarlo desde `FrontlineBattle`.
- Mantenidas intactas las reglas del engine, timing del cast visual, targeting, rewards, SFX, audio y persistencia.

### Tested
- `npm.cmd run check:full`

## [0.25.96] - 2026-05-08

### Changed
- Extraido `DeathGhost` a `components/game/frontline/FrontlineDeathGhost.tsx`.
- Movido el tipo visual `FrontlineDeathGhostFx` junto al componente para reutilizarlo desde `FrontlineBattle`.
- Mantenidas intactas las reglas del engine, deteccion de muertes, SFX de muerte, rewards, audio y persistencia.

### Tested
- `npm.cmd run check:full`

## [0.25.95] - 2026-05-08

### Changed
- Extraido `LaneActionTrail` a `components/game/frontline/FrontlineLaneActionTrail.tsx`.
- Reducida la responsabilidad de `components/game/frontline/FrontlineBattle.tsx` separando el trail/impact visual de acciones por lane.
- Mantenidas intactas las reglas del engine, targeting, resolucion de eventos, rewards, SFX, audio y persistencia.

### Tested
- `npm.cmd run check:full`

## [0.25.94] - 2026-05-08

### Changed
- Extraido `LaneKoFx` a `components/game/frontline/FrontlineLaneKoFx.tsx`.
- Reducida la responsabilidad de `components/game/frontline/FrontlineBattle.tsx` separando el burst visual de KO por lane.
- Mantenidas intactas las reglas del engine, resolucion de KO, targeting, rewards, SFX, audio y persistencia.

### Tested
- `npm.cmd run check:full`

## [0.25.93] - 2026-05-08

### Changed
- Extraido `CoreTotem` a `components/game/frontline/FrontlineCoreTotem.tsx`.
- Reducida la responsabilidad de `components/game/frontline/FrontlineBattle.tsx` separando el bloque visual de nucleo, retrato y cooldown de lider.
- Mantenidas intactas las reglas del engine, core HP, cooldowns, leader power, rewards, SFX, audio y persistencia.

### Tested
- `npm.cmd run check:full`

## [0.25.92] - 2026-05-08

### Changed
- Extraido `BossSegmentReadout` a `components/game/frontline/FrontlineBossSegmentReadout.tsx`.
- Reducida la responsabilidad de `components/game/frontline/FrontlineBattle.tsx` separando la tarjeta visual de segmentos del boss.
- Mantenidas intactas las reglas del engine, vida/estado de segmentos, targeting, scorch, rewards, SFX, audio y persistencia.

### Tested
- `npm.cmd run check:full`

## [0.25.91] - 2026-05-08

### Changed
- Extraido `ExhaustedPane` a `components/game/frontline/FrontlineExhaustedPane.tsx`.
- Reducida la responsabilidad de `components/game/frontline/FrontlineBattle.tsx` separando el resumen visual de cartas agotadas.
- Mantenidas intactas las reglas del engine, agotamiento de cartas, command economy, rewards, SFX, audio y persistencia.

### Tested
- `npm.cmd run check:full`

## [0.25.90] - 2026-05-08

### Changed
- Extraido `BossBanner` a `components/game/frontline/FrontlineBossBanner.tsx`.
- Reducida la responsabilidad de `components/game/frontline/FrontlineBattle.tsx` separando el banner visual de estado del boss.
- Mantenidas intactas las reglas del engine, presets de boss, cartas, command economy, rewards, SFX, audio y persistencia.

### Tested
- `npm.cmd run check:full`

## [0.25.89] - 2026-05-08

### Changed
- Extraido `BossColossusOverlay` a `components/game/frontline/FrontlineBossColossusOverlay.tsx`.
- Reducida la responsabilidad de `components/game/frontline/FrontlineBattle.tsx` separando el overlay visual de boss.
- Mantenidas intactas las reglas del engine, presets de boss, cartas, command economy, rewards, SFX, audio y persistencia.

### Tested
- `npm.cmd run check:full`

## [0.25.88] - 2026-05-08

### Changed
- Extraidos `SynergyGlobalToast` y `SynergyProcBadge` a `components/game/frontline/FrontlineSynergyFeedback.tsx`.
- Reducida la responsabilidad de `components/game/frontline/FrontlineBattle.tsx` separando el feedback visual de sinergias.
- Mantenidas intactas las reglas del engine, cartas, command economy, rewards, SFX, audio y persistencia.

### Tested
- `npm.cmd run check:full`

## [0.25.87] - 2026-05-08

### Changed
- Extraido `SupportToken` a `components/game/frontline/FrontlineSupportToken.tsx`.
- Reducida la responsabilidad de `components/game/frontline/FrontlineBattle.tsx` separando el token visual de supports/summons.
- Mantenidas intactas las reglas del engine, cartas, command economy, rewards, SFX, audio y persistencia.

### Tested
- `npm.cmd run check:full`

## [0.25.86] - 2026-05-08

### Changed
- Extraido `TraitProcBadge` a `components/game/frontline/FrontlineTraitProcBadge.tsx`.
- Reducida la responsabilidad de `components/game/frontline/FrontlineBattle.tsx` separando el badge visual de procs de rasgo.
- Mantenidas intactas las reglas del engine, cartas, command economy, rewards, SFX, audio y persistencia.

### Tested
- `npm.cmd run check:full`

## [0.25.85] - 2026-05-08

### Changed
- Eliminado el componente muerto `MiniActorLine` de `components/game/frontline/FrontlineBattle.tsx`.
- Reducido codigo no usado en Combat sin alterar UI renderizada, reglas del engine, cartas, command economy, rewards, SFX, audio ni persistencia.

### Tested
- `npm.cmd run check:full`

## [0.25.84] - 2026-05-08

### Changed
- Extraido `HeroFxBadge` a `components/game/frontline/FrontlineHeroFxBadge.tsx`.
- Reducida la responsabilidad de `components/game/frontline/FrontlineBattle.tsx` separando el badge visual flotante de impactos/heals/shields.
- Mantenidas intactas las reglas del engine, cartas, command economy, rewards, SFX, audio y persistencia.

### Tested
- `npm.cmd run check:full`

## [0.25.83] - 2026-05-08

### Changed
- Extraido `LaneInitiativeReadout` a `components/game/frontline/FrontlineLaneInitiativeReadout.tsx`.
- Reducida la responsabilidad de `components/game/frontline/FrontlineBattle.tsx` separando el readout visual de orden de ataque.
- Mantenidas intactas las reglas del engine, cartas, command economy, rewards, SFX, audio y persistencia.

### Tested
- `npm.cmd run check:full`

## [0.25.82] - 2026-05-08

### Changed
- Extraido `EncounterBanner` y su metadata a `components/game/frontline/FrontlineEncounterBanner.tsx`.
- Movido el tipo `FrontlineEncounterBadgeKind` al nuevo modulo y re-exportado desde `FrontlineBattle` para conservar compatibilidad.
- Mantenidas intactas las reglas del engine, cartas, command economy, rewards, SFX, audio y persistencia.

### Tested
- `npm.cmd run check:full`

## [0.25.81] - 2026-05-08

### Changed
- Extraidos `laneSurfaceClass` y `cardSurfaceClass` a `components/game/frontline/FrontlineBattleSurfaceClasses.ts`.
- Reducida la responsabilidad de `components/game/frontline/FrontlineBattle.tsx` separando helpers puros de clases visuales.
- Mantenidas intactas las reglas del engine, cartas, command economy, rewards, SFX, audio y persistencia.

### Tested
- `npm.cmd run check:full`

## [0.25.80] - 2026-05-08

### Changed
- Extraido `VisualAssetImage` a `components/game/frontline/FrontlineVisualAssetImage.tsx`.
- Reducida la responsabilidad de `components/game/frontline/FrontlineBattle.tsx` separando el helper de imagen/fallback visual.
- Conservada la misma logica de fallback ante errores de carga sin tocar reglas de combate, rewards, SFX, audio, command economy ni persistencia.

### Tested
- `npm.cmd run check:full`

## [0.25.79] - 2026-05-08

### Changed
- Extraido `BattleEndOverlay` a `components/game/frontline/FrontlineBattleEndOverlay.tsx`.
- Reducida la responsabilidad de `components/game/frontline/FrontlineBattle.tsx` separando el overlay visual de resultado.
- Mantenidos intactos el flujo de finalizacion de combate, rewards, engine, command economy, SFX, audio y persistencia.

### Tested
- `npm.cmd run check:full`

## [0.25.78] - 2026-05-08

### Changed
- Extraidos `CoreShockOverlay`, `CommandPips` y `CompactPressureBar` a `components/game/frontline/FrontlineBattleMeters.tsx`.
- Reducida la responsabilidad de `components/game/frontline/FrontlineBattle.tsx` separando medidores y overlays visuales de combate.
- Mantenidas intactas las reglas del engine, resolucion de turnos, cartas, command economy, rewards, SFX, audio y persistencia.

### Tested
- `npm.cmd run check:full`

## [0.25.77] - 2026-05-08

### Changed
- Extraidos `StatusTag` y `CompactPill` de `components/game/frontline/FrontlineBattle.tsx` a `components/game/frontline/FrontlineBattlePills.tsx`.
- Reducida la responsabilidad del componente principal de Frontline separando badges visuales reutilizables.
- Mantenidas intactas las reglas de combate, command economy, cartas, rewards, SFX, audio y persistencia.

### Tested
- `npm.cmd run check:full`

## [0.25.76] - 2026-05-08

### Changed
- Extraido el wrapper `CombatIcon` de `components/game/frontline/FrontlineBattle.tsx` a `components/game/frontline/FrontlineCombatIcon.tsx`.
- Reducida ligeramente la responsabilidad del componente principal de Frontline manteniendo intacta la resolucion de turnos, cartas, command economy, rewards, SFX y audio.
- Conservada la misma API visual para iconos de combate y sus fallbacks de assets.

### Tested
- `npm.cmd run check:full`

## [0.25.75] - 2026-05-08

### Changed
- Extraidos los props SVG decorativos de Home a `components/game/home/HomeSceneProps.tsx`.
- Reducida la responsabilidad de `components/game/home/HomeScene.tsx` manteniendo las mismas formas, coordenadas, clases de animacion y estilos SVG.
- Mantenidos sin cambios assets, landmarks, efectos, QA editor, gameplay, progreso, economia, rutas y audio.

### Tested
- `npm.cmd run check:full`

## [0.25.74] - 2026-05-08

### Changed
- Extraidos `ZoneAura`, `AssetLandmarkGrounds` y los pads de zonas de Home a `components/game/home/HomeZoneAura.tsx`.
- Reducida la responsabilidad de `components/game/home/HomeScene.tsx` manteniendo las mismas coordenadas SVG, colores y estados activos.
- Mantenidos sin cambios landmarks, efectos, QA editor, gameplay, progreso, economia, rutas y audio.

### Tested
- `npm.cmd run check:full`

## [0.25.73] - 2026-05-08

### Changed
- Extraidas las capas de landmarks y efectos globales de Home a `components/game/home/HomeSceneLayers.tsx`.
- Reducida la responsabilidad de `components/game/home/HomeScene.tsx` separando posicionamiento de landmarks, estilos de assets y render de efectos world.
- Mantenidos sin cambios los efectos, posiciones, QA editor, rutas, gameplay, progreso, economia y audio.

### Tested
- `npm.cmd run check:full`

## [0.25.72] - 2026-05-08

### Changed
- Extraidos los estilos globales y keyframes de `HomeScene` a `components/game/home/HomeSceneStyles.tsx`.
- Reducida la responsabilidad de `components/game/home/HomeScene.tsx` manteniendo la composicion visual de Home sin cambios funcionales.
- Mantenida la integracion de `HomeEffectSpriteStyles` junto al scene stylesheet para no alterar sprites, efectos, gameplay, rutas ni audio.

### Tested
- `npm.cmd run check:full`

## [0.25.71] - 2026-05-08

### Changed
- Extraido el stage visual del castillo de Fortress a `app/fortress/FortressCastleStage.tsx`.
- Reducida la responsabilidad de `app/fortress/page.tsx` moviendo `CastleStage` y la silueta del castillo.
- Mantenido el comportamiento de raid, upgrades, garrison, economia, progreso, rutas y audio sin cambios.

### Tested
- `npm.cmd run check:full`

## [0.25.70] - 2026-05-08

### Changed
- Extraido el render del Card Pool de Deck a `app/deck/DeckCardPoolSection.tsx`.
- Reducida la responsabilidad de `app/deck/page.tsx` manteniendo la estructura visual original del pool y roster.
- Mantenido el comportamiento de seleccion, upgrades, unlocks, economia, progreso, rutas y audio sin cambios.

### Tested
- `npm.cmd run check:full`

## [0.25.69] - 2026-05-08

### Changed
- Extraido el panel de doctrina de lider de Deck a `app/deck/DeckLeaderDoctrinePanel.tsx`.
- Reducida la responsabilidad de `app/deck/page.tsx` manteniendo ahi el estado de loadout, squad, cartas y seleccion de lider.
- Mantenido el comportamiento de Deck, economia, progreso, rutas y audio sin cambios.

### Tested
- `npm.cmd run check:full`

## [0.25.68] - 2026-05-08

### Changed
- Extraidas primitives visuales de Roster a `app/roster/RosterPrimitives.tsx`.
- Reducida la responsabilidad de `app/roster/page.tsx` moviendo metricas, filtros, chips y tags.
- Mantenido el comportamiento de seleccion de heroes, filtros, modal, progreso, economia, rutas y audio sin cambios.

### Tested
- `npm.cmd run check:full`

## [0.25.67] - 2026-05-08

### Changed
- Extraidas primitives visuales de Team a `app/team/TeamPrimitives.tsx`.
- Reducida la responsabilidad de `app/team/page.tsx` moviendo botones de enlace, metricas y stats de build.
- Mantenido el comportamiento de loadout, squad, cartas, lideres, economia, progreso, rutas y audio sin cambios.

### Tested
- `npm.cmd run check:full`

## [0.25.66] - 2026-05-08

### Changed
- Extraido el panel de entrada y squad de Events a `app/events/EventEntryPanel.tsx`.
- Reducida la responsabilidad de `app/events/page.tsx` manteniendo ahi el estado de operacion, batalla, resultados y rewards.
- Mantenido el comportamiento de eventos, economia, progreso, rutas, combate y audio sin cambios.

### Tested
- `npm.cmd run check:full`

## [0.25.65] - 2026-05-08

### Changed
- Extraidos los tabs de categoria de Shop a `app/shop/ShopCategoryTabs.tsx`.
- Reducida la responsabilidad de `app/shop/page.tsx` manteniendo ahi el estado de categoria y el `sfx.tap()` de seleccion.
- Mantenido el comportamiento de tienda, compras, economia, progreso, rutas y audio sin cambios.

### Tested
- `npm.cmd run check:full`

## [0.25.64] - 2026-05-08

### Changed
- Extraida la card de rival de Arena a `app/arena/ArenaRivalCard.tsx`.
- Reducida la responsabilidad de `app/arena/page.tsx` manteniendo ahi tickets, inicio de combate, resultado y entrega de rewards.
- Mantenido el comportamiento de Arena, economia, progreso, rutas, combate y audio sin cambios.

### Tested
- `npm.cmd run check:full`

## [0.25.63] - 2026-05-08

### Changed
- Extraido el inspector de edificios de Fortress a `app/fortress/FortressBuildingInspector.tsx`.
- Reducida la responsabilidad de `app/fortress/page.tsx` manteniendo el calculo de coste y accion de upgrade en la pantalla.
- Mantenido el comportamiento de raid, garrison, economia, progreso, rutas y audio sin cambios.

### Tested
- `npm.cmd run check:full`

## [0.25.62] - 2026-05-08

### Changed
- Extraido el boton de roster de heroes de Deck a `app/deck/DeckHeroRosterButton.tsx`.
- Reducida la responsabilidad de `app/deck/page.tsx` manteniendo la seleccion de squad y assets visuales existentes.
- Mantenido el comportamiento de cartas, lideres, progreso, economia, rutas y audio sin cambios.

### Tested
- `npm.cmd run check:full`

## [0.25.61] - 2026-05-08

### Changed
- Extraidas las cards y contratos de Missions a `app/missions/MissionContracts.tsx`.
- Separada la UI de contrato destacado, columnas y contratos individuales de `app/missions/page.tsx`.
- Reducida la pantalla de Missions sin tocar progreso, claims de recompensas, economia, rutas ni audio.

### Tested
- `npm.cmd run check:full`

## [0.25.60] - 2026-05-08

### Changed
- Movida la eliminacion de nodos, props y rutas del editor QA de Adventure a `removeEditorSelectionFromLayout`.
- Reducida la responsabilidad de `useAdventureCampaignMapState.ts` en mutaciones de borrado del layout.
- Mantenida la limpieza de rutas y `partyMarker.anchorNodeId` al borrar nodos sin tocar coordenadas, rewards, progreso, gameplay ni audio.

### Tested
- `npm.cmd run check:full`

## [0.25.59] - 2026-05-08

### Changed
- Movida la duplicacion de nodos y props del editor QA de Adventure a `AdventureMapEditorFactories.ts`.
- Reducida la responsabilidad de `useAdventureCampaignMapState.ts` en construccion de copias del editor.
- Mantenidos los offsets, clamps y seleccion tras duplicar sin tocar coordenadas existentes, rewards, progreso, gameplay ni audio.

### Tested
- `npm.cmd run check:full`

## [0.25.58] - 2026-05-08

### Changed
- Extraidas factories puras del editor QA de Adventure a `components/game/adventure/AdventureMapEditorFactories.ts`.
- Separada la creacion de props, nodos y rutas nuevas de `useAdventureCampaignMapState.ts`.
- Reducido el hook del mapa sin tocar posiciones existentes, interacciones, rewards, progreso, gameplay ni audio.

### Tested
- `npm.cmd run check:full`

## [0.25.57] - 2026-05-08

### Changed
- Extraidos helpers puros de estado visual del mapa de Adventure a `components/game/adventure/AdventureMapStateHelpers.ts`.
- Separada la derivacion de tipo/estado de nodo y el helper de party node completado de `useAdventureCampaignMapState.ts`.
- Mantenido re-export de compatibilidad desde `AdventureMapElements.tsx` sin tocar progreso, rewards, coordenadas, gameplay ni audio.

### Tested
- `npm.cmd run check:full`

## [0.25.56] - 2026-05-08

### Changed
- Extraido el render de props del mapa de Adventure a `components/game/adventure/AdventureMapPropElement.tsx`.
- Convertido `AdventureMapElements.tsx` en un barrel ligero para mantener imports existentes.
- Separada la UI interactiva y QA de props sin tocar posicionamiento, interacciones, rewards, gameplay ni audio.

### Tested
- `npm.cmd run check:full`

## [0.25.55] - 2026-05-08

### Changed
- Extraido el party marker del mapa de Adventure a `components/game/adventure/AdventurePartyMarkerElement.tsx`.
- Separada la UI del marcador actual y su soporte QA de `AdventureMapElements.tsx`.
- Mantenido re-export de compatibilidad sin tocar posicionamiento, nodos, props, interacciones, gameplay, rewards ni audio.

### Tested
- `npm.cmd run check:full`

## [0.25.54] - 2026-05-08

### Changed
- Extraido el componente de nodo del mapa de Adventure a `components/game/adventure/AdventureMapNodeElement.tsx`.
- Separada la UI, seleccion y drag QA de nodos de `AdventureMapElements.tsx`.
- Mantenido re-export de compatibilidad sin tocar coordenadas, rutas, props, interacciones, gameplay, rewards ni audio.

### Tested
- `npm.cmd run check:full`

## [0.25.53] - 2026-05-08

### Changed
- Extraidos elementos de rutas del mapa de Adventure a `components/game/adventure/AdventureMapRouteElements.tsx`.
- Separadas rutas SVG, runas de ruta y handles QA de `AdventureMapElements.tsx`.
- Mantenidos re-exports de compatibilidad sin tocar coordenadas, nodos, props, interacciones, gameplay, rewards ni audio.

### Tested
- `npm.cmd run check:full`

## [0.25.52] - 2026-05-08

### Changed
- Extraida la presentacion de props e interacciones del mapa de Adventure a `components/game/adventure/AdventureMapPropVisuals.tsx`.
- Separados el contenido visual de props, estados del key chest, estilos de animacion y efectos de props de `AdventureMapElements.tsx`.
- Mantenido re-export de `AdventureMapInteractionStyles` para compatibilidad sin tocar consumidores, coordenadas, rewards, gameplay ni audio.

### Tested
- `npm.cmd run check:full`

## [0.25.51] - 2026-05-08

### Changed
- Extraidos helpers visuales puros de nodos de Adventure a `components/game/adventure/AdventureMapNodeVisuals.ts`.
- Separada la resolucion de asset, escala, icono y tema del nodo de `AdventureMapElements.tsx`.
- Reducido `AdventureMapElements.tsx` sin tocar posiciones, rutas, props, interacciones, gameplay, rewards ni audio.

### Tested
- `npm.cmd run check:full`

## [0.25.50] - 2026-05-08

### Changed
- Extraidos los editores de seleccion del QA map editor de Adventure a `components/game/adventure/AdventureMapEditorSelectionFields.tsx`.
- Separada la edicion de nodos, props, party marker y route handles del overlay principal.
- Reducido `AdventureMapEditorOverlay.tsx` sin tocar coordenadas, layout del mapa, interacciones, rewards, gameplay ni audio.

### Tested
- `npm.cmd run check:full`

## [0.25.49] - 2026-05-08

### Changed
- Extraidos los campos reutilizables del editor QA de Adventure a `components/game/adventure/AdventureMapEditorFields.tsx`.
- Separados `NumberField`, `SelectField`, `TextField`, `Readout` y el parser de listas de nodos del overlay principal.
- Reducido `AdventureMapEditorOverlay.tsx` sin tocar coordenadas, props, interacciones, rewards, gameplay ni audio.

### Tested
- `npm.cmd run check:full`

## [0.25.48] - 2026-05-08

### Changed
- Extraida la card de operacion de Events a `app/events/EventOperationCard.tsx`.
- Separada la UI de operacion, lineup enemigo, rewards y CTA de la pantalla principal.
- Reducida `app/events/page.tsx` sin tocar completions diarios, rewards, batalla de eventos, economia ni audio.

### Tested
- `npm.cmd run check:full`

## [0.25.47] - 2026-05-08

### Changed
- Extraido el helper de build plan de Deck a `app/deck/deckPageHelpers.ts`.
- Separado el calculo de doctrina, roles y conteo de tipos de carta de la pantalla principal.
- Reducida `app/deck/page.tsx` sin tocar loadout, cartas, upgrades, economia, progreso ni audio.

### Tested
- `npm.cmd run check:full`

## [0.25.46] - 2026-05-08

### Changed
- Extraidos datos y helpers de rivales de Arena a `app/arena/arenaPageHelpers.ts`.
- Separados `FRONTLINE_ARENA_RIVALS`, traduccion de rivales y tipos compartidos de la pantalla principal.
- Reducida `app/arena/page.tsx` sin tocar tickets, rewards, resultados, batalla, economia ni audio.

### Tested
- `npm.cmd run check:full`

## [0.25.45] - 2026-05-08

### Changed
- Extraido el overview superior de Fortress a `app/fortress/FortressRaidOverview.tsx`.
- Separados `FortressHero` y `RaidActionPanel` de la pantalla principal.
- Reducida `app/fortress/page.tsx` sin tocar raids, economia, upgrades, garrison, rewards ni audio.

### Tested
- `npm.cmd run check:full`

## [0.25.44] - 2026-05-08

### Changed
- Extraidos helpers y tipos de operaciones de Events a `app/events/eventsPageHelpers.ts`.
- Separados presets, tonos, traducciones, fecha diaria y construccion de operaciones de la pantalla principal.
- Reducida `app/events/page.tsx` sin tocar completions diarios, rewards, batalla de eventos, economia ni audio.

### Tested
- `npm.cmd run check:full`

## [0.25.43] - 2026-05-08

### Changed
- Extraidos paneles de estado de Fortress a `app/fortress/FortressStatusPanels.tsx`.
- Separados `FortressStatus` y `RaidHistoryPanel` de la pantalla principal.
- Reducida `app/fortress/page.tsx` sin tocar raids, economia, upgrades, garrison, rewards ni audio.

### Tested
- `npm.cmd run check:full`

## [0.25.42] - 2026-05-08

### Changed
- Extraidos visuales y helpers de rewards de ofertas Shop a `app/shop/ShopOfferVisuals.tsx`.
- Separados reward tokens, reward burst, icono visual de oferta y bundle showcase de `ShopOfferCards`.
- Reducido `app/shop/ShopOfferCards.tsx` sin tocar compras, stock, economia, rewards ni audio.

### Tested
- `npm.cmd run check:full`

## [0.25.41] - 2026-05-07

### Changed
- Extraidas primitives visuales de Arena a `app/arena/ArenaPrimitives.tsx`.
- Separados rank plate, metric cards, gate lines, result metrics y reward chips de la pantalla principal.
- Reducida `app/arena/page.tsx` sin tocar tickets, rewards, resultados, batalla, economia ni audio.

### Tested
- `npm.cmd run check:full`

## [0.25.40] - 2026-05-07

### Changed
- Extraidas primitives visuales de Deck a `app/deck/DeckPrimitives.tsx`.
- Separados paneles, metric cards, build pills, filas de paquete y barra de upgrade de la pantalla principal.
- Reducida `app/deck/page.tsx` sin tocar loadout, cartas, upgrades, economia, progreso ni audio.

### Tested
- `npm.cmd run check:full`

## [0.25.39] - 2026-05-07

### Changed
- Extraidas primitives visuales de Events a `app/events/EventsPrimitives.tsx`.
- Separados metric cards, squad chips, enemy lineup, result metrics y reward chips de la pantalla principal.
- Reducida `app/events/page.tsx` sin tocar completions diarios, rewards, batalla de eventos, economia ni audio.

### Tested
- `npm.cmd run check:full`

## [0.25.38] - 2026-05-07

### Changed
- Extraido el panel de guarnicion de Fortress a `app/fortress/FortressGarrisonPanel.tsx`.
- Separadas la seleccion de defensores y las slot cards de guarnicion de la pantalla principal.
- Reducida `app/fortress/page.tsx` sin tocar raids, economia, upgrades, garrison, rewards ni audio.

### Tested
- `npm.cmd run check:full`

## [0.25.37] - 2026-05-07

### Changed
- Extraidas primitives visuales de Missions a `app/missions/MissionsPrimitives.tsx`.
- Separados `LogMetric`, `ProgressRail`, `RewardChips`, `StatusSeal` y `MiniBadge` de la pantalla principal.
- Reducida `app/missions/page.tsx` sin tocar misiones, rewards, claim, progreso ni audio.

### Tested
- `npm.cmd run check:full`

## [0.25.36] - 2026-05-07

### Changed
- Extraidos helpers y metadatos de Missions a `app/missions/missionsPageHelpers.ts`.
- Separados metric metadata, traducciones de misiones, estadisticas, seleccion de siguiente contrato y labels de reset.
- Reducida `app/missions/page.tsx` sin tocar misiones, rewards, claim, progreso ni audio.

### Tested
- `npm.cmd run check:full`

## [0.25.35] - 2026-05-07

### Changed
- Extraido el chrome superior de Fortress a `app/fortress/FortressChrome.tsx`.
- Separado `FortressTopChrome` de la pantalla principal para aislar navegacion y barra de recursos.
- Reducida `app/fortress/page.tsx` sin tocar raids, economia, upgrades, garrison, rewards ni audio.

### Tested
- `npm.cmd run check:full`

## [0.25.34] - 2026-05-07

### Changed
- Extraidas primitives visuales de Fortress a `app/fortress/FortressPrimitives.tsx`.
- Separados `SceneLight`, `HeroMetric`, `PressureBar`, `RewardRow`, `CostTile` y `MiniFact`.
- Reducida `app/fortress/page.tsx` sin tocar raids, economia, upgrades, garrison, rewards ni audio.

### Tested
- `npm.cmd run check:full`

## [0.25.33] - 2026-05-07

### Changed
- Extraidos helpers y metadatos de Fortress a `app/fortress/fortressPageHelpers.ts`.
- Separados `BUILDING_META`, labels de edificios, countdown de raid, metadatos de integridad/outcome y seleccion de slot libre.
- Reducida `app/fortress/page.tsx` sin tocar raids, economia, upgrades, garrison ni recompensas.

### Tested
- `npm.cmd run check:full`

## [0.25.32] - 2026-05-07

### Changed
- Extraidas las cards y visuales de ofertas de Shop a `app/shop/ShopOfferCards.tsx`.
- Separados `FeaturedOfferStage`, `MerchantConsole`, `SpotlightOfferCard`, `ReserveOfferCard` y helpers de rewards visuales de la pagina principal.
- Reducido `app/shop/page.tsx` a un orquestador de estado y layout sin cambiar compra, stock, economia ni feedback de ofertas.

### Tested
- `npm.cmd run check:full`

## [0.25.31] - 2026-05-07

### Changed
- Extraidos componentes de chrome y estados de Shop a `app/shop/ShopChrome.tsx`.
- Separados `MarketTopChrome`, `LockedWingCard`, `EmptyShopStock` y `ShopBadge` de `app/shop/page.tsx`.
- Reducida la pantalla de Shop sin tocar compra, ofertas, recursos, economia ni audio.

### Tested
- `npm.cmd run check:full`

## [0.25.30] - 2026-05-07

### Changed
- Extraidas primitives visuales de Shop a `app/shop/ShopStorePrimitives.tsx`.
- Separados `StoreMiniFact`, `StoreSummaryPill`, `StoreStatusLine` y `StoreGlyph` de la pantalla principal.
- Reducido `app/shop/page.tsx` manteniendo intactos layout, audio de compra, ofertas y economia.

### Tested
- `npm.cmd run check:full`

## [0.25.29] - 2026-05-07

### Changed
- Extraidos helpers de Shop a `app/shop/shopPageHelpers.ts`.
- Separados labels, estados, coste, temporizador, icon mapping y compra con feedback fuera de `app/shop/page.tsx`.
- Reducida la pantalla de Shop sin cambiar layout, ofertas, economia ni logica de compra.

### Tested
- `npm.cmd run check:full`

## [0.25.28] - 2026-05-07

### Changed
- Separados los diccionarios i18n por locale en `lib/i18n/dictionary-data`.
- Reducido `lib/i18n/dictionaries.ts` a un agregador compatible que conserva la API publica `dictionaries`.
- Extraidos los tipos compartidos de traduccion a `lib/i18n/dictionaryTypes.ts` para reducir acoplamiento entre datos y consumo.

### Tested
- `npm.cmd run check:full`

## [0.25.27] - 2026-05-07

### Changed
- Extraida la escena decorativa de Events de `SceneBackdrop` a `SceneBackdropEventsScene`.
- Separadas sus capas propias: portal, fuegos artificiales, arco, tiendas, linternas, cristales, hogueras y montanas.
- Reducido `SceneBackdrop` a un compositor de escenas y landmarks sin JSX decorativo especifico.

### Tested
- `npm.cmd run check:full`

## [0.25.26] - 2026-05-07

### Changed
- Extraidas las escenas decorativas de Adventure de `SceneBackdrop` a `SceneBackdropAdventureScenes`.
- Separadas `AdventureMoonScene` y `AdventureAshScene` del compositor principal, manteniendo intactas sus capas, montanas, ruinas, cristales y efectos.
- Reducido `SceneBackdrop` sin tocar Adventure map, progreso, nodos ni rutas.

### Tested
- `npm.cmd run check:full`

## [0.25.25] - 2026-05-07

### Changed
- Extraida la escena decorativa de Arena de `SceneBackdrop` a `SceneBackdropArenaScene`.
- Separados `ArenaScene` y sus helpers propios: crowd bands, arena rim, arena floor, victory dais, pennants y dust sweep.
- Reducido `SceneBackdrop` para terminar la separacion de escenas secundarias sin tocar Arena gameplay, rewards ni rutas.

### Tested
- `npm.cmd run check:full`

## [0.25.24] - 2026-05-07

### Changed
- Extraida la escena decorativa de Fortress de `SceneBackdrop` a `SceneBackdropFortressScene`.
- Separados `FortressScene` y sus helpers propios: mountain line, moat, castle keep, fortress walls, tower glows, watch fires y sky bridge.
- Reducido `SceneBackdrop` sin tocar la logica funcional de Fortress, raids, economia ni progreso.

### Tested
- `npm.cmd run check:full`

## [0.25.23] - 2026-05-07

### Changed
- Extraida la escena decorativa de Missions de `SceneBackdrop` a `SceneBackdropMissionsScene`.
- Separados `MissionsScene` y sus helpers propios: mission floor, contract board, route pins, courier camps y reward crates.
- Reducido `SceneBackdrop` para mantener menos decoracion especifica de pantalla embebida.

### Tested
- `npm.cmd run check:full`

## [0.25.22] - 2026-05-07

### Changed
- Extraida la escena decorativa de Roster/Heroes de `SceneBackdrop` a `SceneBackdropRosterScene`.
- Separados `RosterScene` y sus helpers propios: hall floor, columns, statues, relics, lineage constellation y training dummies.
- Reducido `SceneBackdrop` para mantener el selector de escenas mas compacto y evitar acumulacion de JSX especifico.

### Tested
- `npm.cmd run check:full`

## [0.25.21] - 2026-05-07

### Changed
- Extraida la escena decorativa de Deck de `SceneBackdrop` a `SceneBackdropDeckScene`.
- Separados `DeckScene` y sus helpers propios: war table, card aurora, floating cards, map pedestals, candle columns, shelf glows y arcane projector.
- Reducido `SceneBackdrop` para seguir eliminando JSX especifico de escenas y mejorar mantenibilidad.

### Tested
- `npm.cmd run check:full`

## [0.25.20] - 2026-05-07

### Changed
- Extraida la escena decorativa de Shop/Market de `SceneBackdrop` a `SceneBackdropMarketScene`.
- Separados `ShopScene` y sus helpers de mercado: lanterns, stalls, pavilion, roofline, hanging signs, coin glints, carpets y walkway.
- Reducido `SceneBackdrop` para que siga avanzando hacia un compositor de escenas con menos JSX especifico embebido.

### Tested
- `npm.cmd run check:full`

## [0.25.19] - 2026-05-07

### Added
- Creada la skill `duskkeep-optimization-loop` para guiar iteraciones repetidas de refactor, limpieza, rendimiento y reduccion de God classes.
- Documentado el flujo seguro de optimizacion: seleccionar un slice pequeno, validar, versionar, actualizar changelog, verificar privacidad del repo, commitear y pushear.
- Sincronizada una copia local en `.agents/skills/duskkeep-optimization-loop` para futuras sesiones, manteniendo `docs/skills` como fuente versionada.

### Changed
- Movidos assets PNG raw/source no registrados fuera del proyecto a `C:\Users\Usuario\OneDrive\Documentos\Duskkeep raw assets`.

### Tested
- Validada igualdad entre la copia fuente y la copia local de la skill.

## [0.25.18] - 2026-05-07

### Changed
- Extraidas primitives y props compartidos de mundo de `SceneBackdrop` a `SceneBackdropWorldProps`.
- Separados moon/sun, montanas SVG, rios/lava, ruinas, spires, banners, portal, tiendas, senales de fuego, arboles de cristal y antorchas.
- Reducido `SceneBackdrop` para que mantenga menos decoracion reutilizable embebida y sea mas facil de seguir por escena.

### Tested
- `npm.cmd run check:full`

## [0.25.17] - 2026-05-07

### Changed
- Extraidos los landmarks restantes de `SceneBackdrop` al modulo `SceneBackdropCoreLandmarks`.
- Separados Hero Hall, Command Board, Citadel y Coliseum del renderer principal de escenas.
- Reducido `SceneBackdrop` para que concentre menos JSX decorativo y mantenga mejor su rol de composicion.

### Tested
- `npm.cmd run check:full`

## [0.25.16] - 2026-05-07

### Changed
- Extraidos landmarks principales de `SceneBackdrop` a `SceneBackdropCoreLandmarks`.
- Separados Moon Sanctum, Ash Forge, Festival Portal, Grand Market y Arcane War Room del renderer principal de escenas.
- Mantenidos los landmarks restantes en `SceneBackdrop` para limitar el riesgo visual de la iteracion.

### Tested
- `npm.cmd run check:full`

## [0.25.15] - 2026-05-07

### Changed
- Extraidos efectos auxiliares de escena a `SceneBackdropSceneEffects`.
- Separados starfall, ember rain, fireworks, market silk ceiling y arena spotlights del renderer principal de `SceneBackdrop`.
- Mantenidos `CardAurora` y `FortressMountainLine` en el archivo principal por sus dependencias internas, evitando un refactor visual de mayor riesgo.

### Tested
- `npm.cmd run check:full`

## [0.25.14] - 2026-05-07

### Changed
- Extraidos los overlays finales de `SceneBackdrop` a `SceneBackdropForeground`.
- Separados foreground mist, foreground color set y texture veil del renderer principal de escenas.
- Mantenida la composicion visual compartida sin cambios intencionales de estilos, rutas ni datos.

### Tested
- `npm.cmd run check:full`

## [0.25.13] - 2026-05-07

### Changed
- Extraidas las capas atmosfericas compartidas de `SceneBackdrop` a `SceneBackdropAtmosphere`.
- Separados sky, atmosphere glows, clouds, particles, constellation dust y birds del renderer principal de escenas.
- Mantenida la composicion visual de `SceneBackdrop` sin cambios intencionales de estilos, rutas ni gameplay.

### Tested
- `npm.cmd run check:full`

## [0.25.12] - 2026-05-07

### Changed
- Extraida la creacion del WebAudio graph a `lib/audio-graph`.
- Centralizadas las conexiones de master/music/sfx, compressor, reverb, delay e impulse buffers sin cambiar valores ni routing.
- Reducido `lib/audio.ts` manteniendo el control de estado, crossfade, scheduling y API publica en `AudioManager`.

### Tested
- `npm.cmd run check:full`

## [0.25.11] - 2026-05-07

### Changed
- Extraida la gestion de pistas musicales HTMLAudioElement a `lib/audio-music-assets`.
- Centralizados el registro global de music elements, fade de volumen y limpieza de pistas no controladas para reducir riesgo de musica solapada.
- Mantenida la API publica de `lib/audio` y el comportamiento de crossfade/fallback procedural sin cambios funcionales.

### Tested
- `npm.cmd run check:full`

## [0.25.10] - 2026-05-07

### Changed
- Extraido el controlador publico de SFX a `lib/audio-sfx`, manteniendo `sfx` exportado desde `lib/audio`.
- `lib/audio.ts` queda por debajo de 1000 lineas y mas centrado en el runtime de musica/WebAudio.
- Mantenidos los nombres publicos de SFX, fallbacks a sintesis procedural, stingers y vibracion sin cambios funcionales.

### Tested
- `npm.cmd run check:full`

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
