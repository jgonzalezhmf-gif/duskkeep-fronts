# Handoff Funcional de Duskkeep Fronts

Fecha de corte: 2026-05-17

Este documento resume el estado funcional y visual del juego para que una futura sesion de Codex u otra IA pueda continuar sin depender del historial conversacional.

## Como Usar Este Documento

Leer primero:
- `AGENTS.md`
- `docs/DOCUMENTATION_INDEX.md`
- `docs/ENGINEERING_STANDARDS.md`
- `docs/DUSKKEEP_FRONTS_FUNCTIONAL_HANDOFF.md`
- `docs/GAME_ARCHITECTURE_AND_VISUAL_SYSTEM.md`
- `docs/FRONTLINE_COMBAT_HANDOFF.md`
- `docs/FRONTLINE_PROGRESSION.md`
- `docs/PROJECT_STATUS_AND_NEXT_STEPS.md`
- `docs/DEMO_GUIDE.md`
- `docs/SCREEN_UX_CHECKLIST.md`
- `docs/OPERATIONS_TROUBLESHOOTING.md`

Regla practica:
- Si la tarea toca combate, leer tambien `docs/FRONTLINE_COMBAT_HANDOFF.md`.
- Si la tarea toca progresion de heroes, Deck, cartas Frontline o Fortress, leer tambien `docs/FRONTLINE_PROGRESSION.md`.
- Si la tarea toca assets/iconos, leer `docs/ART_PIPELINE_CODEX.md`.
- Si la tarea toca animacion, leer `docs/IMPECCABLE_ANIMATION_USAGE.md`.
- Si la tarea toca recompensas reclamables, leer `docs/REWARD_VISIBILITY_RULES.md`.
- Si la tarea toca backend, BBDD, persistencia online, economia segura o ladder, leer `docs/SECURITY_AND_BACKEND_ROADMAP.md`, `docs/BACKEND_DATA_MODEL.md` y `docs/SERVER_AUTHORITATIVE_OPERATIONS.md`.
- Si la tarea toca audio, musica o SFX, revisar `lib/audioAssets.ts`, `docs/audio/ELEVENLABS_PIPELINE.md` y usar las skills de audio solo para generar assets nuevos, no para sobreescribir finales.

## Vision del Juego

Duskkeep Fronts es un alpha de juego tactico por turnos con progresion meta. La direccion actual busca:
- Dark medieval fantasy.
- UI visual-first: iconos, cartas, standees, landmarks y estados antes que texto.
- Home como hub principal.
- Duskkeep Fronts como combate manual principal.
- Supabase/Postgres/RPC como direccion server-authoritative para cuentas online.
- Zustand/localStorage como cache de cliente, preferencias, UI state y fallback local de desarrollo/offline.
- Seguridad, rendimiento y documentacion como criterios de producto, no tareas separadas al final.

No se debe convertir la app en una web app de paneles. Las pantallas deben sentirse como partes de un juego.

## Stack y Arquitectura

Stack:
- Next.js App Router.
- TypeScript.
- Tailwind.
- Zustand para UI/cache de snapshot.
- Vitest.
- Supabase Auth, migraciones, RLS, RPCs y smokes para persistencia online autoritativa.

Directorios principales:
- `app/`: rutas y pantallas.
- `components/game/`: UI de juego.
- `components/game/frontline/`: Combat / Duskkeep Fronts.
- `components/game/shared/`: chrome, iconos, recursos, rewards, botones comunes.
- `components/ui/`: primitives visuales reutilizables.
- `features/frontline/`: motor y datos funcionales de Frontline.
- `features/battle/`: auto-battle legacy/rewards.
- `features/tactical/`: grid tactical legacy/prototipo.
- `data/`: seed data.
- `lib/store.ts`: store cliente, cache/snapshot, fallback local explicito y acciones online-first.
- `features/server/*`: contratos y dispatcher de operaciones autoritativas.
- `supabase/`: migraciones, seed, smokes y RPCs.

Regla de arquitectura:
- Las reglas de juego viven en `features/*`, `data/*` o helpers de dominio.
- Los componentes no deben esconder balance ni economia.
- Los assets opcionales se cargan solo via manifest para evitar 404.
- En modo `NEXT_PUBLIC_PERSISTENCE=supabase`, recursos, rewards, compras, claims, progreso, upgrades y snapshots sensibles vienen del servidor.
- El frontend envia ids, seleccion del jugador y resumenes minimos; no envia precios, recompensas finales ni balances como verdad.

## Estado Actual de la Vertical Slice

El alpha jugable actual esta centrado en:
- Home hub.
- Intro cinematica y Auth Gate con login, registro, invitado y conversion de invitado a cuenta nueva.
- Adventure map integrado con precombat y Frontline.
- Battle quick start con Frontline.
- Deck Frontline squad/card builder.
- Fortress MVP con edificios, garrison y raids automaticos.
- Shop/Market con ofertas, recursos y feedback visual.
- Missions como command log con claims.
- Arena y Events migrados en MVP a Frontline.
- Chapter 1 como contenido demo activo; Chapter 2 visible pero bloqueado hasta tener arte, musica, layout y contenido propio.
- Cofre interactuable de Adventure con Adventure Keys, loot table, claim con reset temporal y estados visuales.
- Persistencia local/offline y persistencia online Supabase server-authoritative para cuentas vinculadas e invitados Supabase.

La base es presentable para alpha, con backlog claro antes de monetizacion, ladder publico o lanzamiento abierto.

## Estado Reciente de Backend, Auth y Datos

Estado:
- Backend/Auth/Data-driven esta cerrado como MVP estable para alpha.
- Supabase local y remoto se han validado manualmente con cuenta de prueba.
- `get_player_snapshot` es la fuente de verdad para recursos, progreso, compras, misiones, daily login, Arena/Events y agregados de batalla.
- `/api/server/authoritative` es el camino de mutaciones sensibles cuando la app usa Supabase.
- Las operaciones sensibles principales refrescan snapshot servidor tras mutacion para evitar cache local obsoleta.
- El modo invitado usa sesion anonima Supabase cuando esta disponible; si se convierte a cuenta nueva, conserva el mismo `user_id`.
- No se permite merge de invitado con cuenta existente dentro del flujo invitado. Si el usuario quiere cuenta existente, debe iniciar sesion desde el Auth Gate inicial.

Reglas activas:
- No rehidratar estado sensible desde `localStorage` en modo Supabase.
- No fallback local para cuentas vinculadas o invitados Supabase cuando una operacion autoritativa falla.
- Errores de login/registro/recuperacion deben ser genericos para evitar enumeracion de cuentas.
- No exponer secrets en `NEXT_PUBLIC_*`.

Documentos clave:
- `docs/AUTH_FLOW_AND_SESSION_POLICY.md`
- `docs/SERVER_AUTHORITATIVE_STATE_OWNERSHIP.md`
- `docs/SERVER_AUTHORITATIVE_OPERATIONS.md`
- `docs/BACKEND_SECURITY_CLOSURE_REVIEW.md`
- `docs/SUPABASE_REMOTE_OPERATIONS.md`
- `docs/OPERATIONS_TROUBLESHOOTING.md`

Riesgos residuales aceptados para alpha:
- Rate limit autoritativo en memoria.
- Combate ejecutado en cliente con validaciones defensivas, sin replay server-side completo.
- Fallback local solo para desarrollo/offline cuando no hay backend configurado.

No aceptar antes de monetizacion o ladder publico:
- Moneda premium concedida desde cliente.
- Ranking o puntuacion competitiva confiada al cliente.
- Rate limit en memoria para trafico publico sensible.
- Webhooks/pagos sin backend-only y firma verificada.

## Duskkeep Fronts

Estado:
- Es el combate manual principal.
- Usa 3 frentes, core por bando, command por turno, mano de cartas y clash.
- Usa standees, portraits de lider, fondos por capitulo/tipo y card art registrados mediante manifests.
- Las cartas en combate priorizan arte, coste y stats utiles; se redujo texto redundante.
- Heroes y cartas del jugador usan perfiles progresados derivados, no los datos base mutados.
- Tiene cola visual de eventos, ataques mas lentos, KO ghost y overlay de victoria/derrota.
- La UI de combate fue aligerada para dejar ver mejor fondos y personajes.
- La musica de boss debe sonar sola; no debe superponerse con temas de Home/Adventure.

Archivos clave:
- `features/frontline/types.ts`
- `features/frontline/data.ts`
- `features/frontline/engine.ts`
- `features/frontline/heroProfile.ts`
- `features/frontline/cardProgression.ts`
- `features/frontline/adventure.ts`
- `features/frontline/fortress.ts`
- `components/game/frontline/FrontlineBattle.tsx`
- `components/game/frontline/FrontlineVisualPrimitives.tsx`
- `components/game/frontline/frontlineVisualAssets.ts`
- `components/game/BattlePageClient.tsx`

No tocar sin encargo explicito:
- Reglas de combate.
- Economia.
- Backend.
- Audio.
- Arquitectura canvas/WebGL.

Pendiente Frontline:
- Animaciones por tipo de carta: order, tactic, summon, gear, signature, relic.
- VFX por keyword/status: poison, burn, guard, rush, regen.
- Bosses y mutadores de eventos.
- Mejor transition layer post-victoria.
- Mejor AI readability sin depender del log.
- Audio/VFX de boss: tension, rayo/eclipse, impacto de castillo o presencia de boss sin mezclar tracks.

## Heroes, Enemigos y Assets

Heroes jugador actuales:
- `bran`
- `kara`
- `mira`
- `vex`
- `drak`
- `tovi`

Enemigos actuales:
- `enemy_bone_archer`
- `enemy_rotmaw`
- `enemy_void_acolyte`
- `enemy_plague_troll`
- `enemy_blood_duelist`
- `enemy_ember_ogre`

Rutas de assets:
- Heroes/enemigos: `public/assets/frontline/heroes/`
- Cartas: `public/assets/frontline/cards/`
- Efectos: `public/assets/frontline/effects/`
- Iconos: `public/assets/icons/`

Regla critica:
- No hacer requests a PNGs especulativos.
- Registrar assets en manifests antes de usarlos.
- Si no esta registrado, usar fallback visual.

Manifests/componentes relevantes:
- `components/game/frontline/frontlineVisualAssets.ts`
- `lib/iconAssets.ts`
- `components/ui/GameAssetIcon.tsx`
- `components/game/shared/ResourceIcon.tsx`
- `components/game/shared/ShopIcon.tsx`
- `components/game/shared/ProgressionIcon.tsx`

## Iconos y Recursos

Ya existe un sistema de iconos PNG con fallback seguro para:
- resources
- nav
- combat
- cards
- status
- fortress
- progression
- shop
- modes

Objetivo visual:
- Iconos grandes, con silueta clara.
- Menos circulos/cajas alrededor.
- Reutilizacion consistente en Home, Shop, Fortress, Deck, Missions y Combat.
- Cero 404 por assets opcionales.

## Rewards y Game Feel

Estado actual:
- `GameResourceBar` muestra recursos compartidos.
- `GameRewardToken` muestra rewards con iconos y pop.
- `RewardBurstOverlay` centraliza bursts visuales para objetos `Rewards`.
- Shop dispara feedback visual real cuando una compra autoritativa/local valida devuelve ok.
- Shop oculta ofertas one-shot compradas y stock diario agotado tras el feedback de compra.
- Missions dispara feedback visual real cuando `claimMission` devuelve rewards.
- Missions oculta contratos ya reclamados en el ciclo actual y muestra estado vacio por columna.
- Battle Result usa el mismo burst de recompensas al entrar en resultado.
- Fortress raid usa el mismo burst al resolver una raid correctamente.
- La barra de recursos remonta chips por valor para hacer pop cuando cambia gold/dust/gems/tickets.
- Adventure y precombat no muestran bonuses `firstClearRewards` ni desbloqueos de cartas si la primera limpieza ya fue tomada.
- Events permite replay tras completar la rotacion diaria, pero no vuelve a mostrar ni entregar el payout diario como recompensa activa.
- Adventure battle, Arena, Events, Fortress, Shop, daily login, misiones, Deck/loadout y upgrades principales tienen ruta online-first cuando Supabase esta activo.
- Key chest consume Adventure Keys, usa loot table server/local y no debe permitir doble claim dentro de su ciclo.

Archivos:
- `components/game/shared/GameRewardToken.tsx`
- `components/game/shared/RewardBurstOverlay.tsx`
- `lib/rewardVisibility.ts`
- `app/shop/page.tsx`
- `app/missions/page.tsx`
- `components/game/adventure/AdventureCampaignScene.tsx`
- `components/game/BattlePageClient.tsx`
- `app/events/page.tsx`
- `app/fortress/page.tsx`
- `app/globals.css`
- `docs/REWARD_VISIBILITY_RULES.md`

Pendiente:
- Hacer que reward tokens vuelen hacia la barra de recursos.
- Reutilizar el mismo patron en Events y Arena.
- Diferenciar visualmente gasto de recurso vs ganancia.
- Completar validacion server-side de combate antes de ladder publico o economia premium.

## Estado de Pantallas

Home:
- Pantalla mas avanzada visualmente.
- Hub principal y referencia de direccion.
- Intro aparece antes de Auth al entrar por URL.
- Auth Gate permite cuenta, registro, Google preparado e invitado.
- HUD mobile fue pulido para separar commander, recursos, opciones/audio y tutorial inicial.
- Pendiente: mas detalle en landmarks si se retoma arte.

Combat:
- Base alpha aceptable.
- Mejor pantalla junto a Home.
- Personajes y cartas ya tienen tratamiento mas visual y menos texto.
- Pendiente: VFX por tipo de carta/status, audio de boss/eclipse y mejor pacing final.

Adventure:
- Integrada con Frontline.
- Mapa visual full-screen con mission card compacta.
- Los nodos ya declaran `frontlinePresetId` explicito y el mapa usa unidades Frontline reales para leer amenaza.
- Chapter 2 aparece bloqueado para alcance demo.
- Soporta nodos battle, elite, boss, chest y locked con repeat policies.
- Cofre interactuable de mapa usa estados visuales de key chest y Adventure Keys.
- QA `?qa=adventure-map` sigue siendo la herramienta para posiciones manuales.
- Pendiente: nuevas interacciones de mapa, nodos ocultos, eventos/lore/recompensas periodicas y precombat mas visual.

Precombat:
- Ya conecta con Frontline.
- Permite volver al mapa.
- La musica no debe reiniciarse si continua Adventure; al entrar en combate debe sonar solo la musica de combate correspondiente.
- Pendiente: mas representacion visual de enemigos, rewards y cartas recomendadas.

Deck:
- Funcionalmente alineado con Frontline.
- Usa standees, cartas full-art y upgrade de cartas Frontline nivel 1-5 con gold+dust.
- La coleccion de cartas Frontline se guarda como `frontlineCardUnlocks`; el starter deck esta desbloqueado por defecto.
- La progresion de cartas se guarda como `frontlineCardLevels`; los efectos se derivan en runtime.
- Adventure first clear puede entregar `Rewards.frontlineCards`; Deck muestra locked/unlocked y bloquea equipar/mejorar cartas no desbloqueadas.
- Pendiente: sentirse menos builder tecnico y mas preparacion de squad.

Roster/Heroes:
- Usa standees y modal visual.
- Pendiente: sistema real de tiers, evolucion, shards y arte por tier.

Fortress:
- MVP funcional con edificios, garrison, raids y rewards.
- Usa iconos PNG fortress.
- Pendiente: mas escena/landmark, feedback de upgrade/raid mas fuerte, progresion profunda y SFX/ambiente de castillo.

Shop/Market:
- Storefront avanzado visualmente.
- Usa iconos shop/resources/progression.
- Tiene feedback real de compra.
- Adventure Keys aparecen como recurso/oferta cuando estan desbloqueadas.
- Pendiente: productos Frontline reales, packs, shards, bundles por evento y reward flight.

Missions/Quests:
- Command Log visual.
- Tiene feedback real de claim.
- Pendiente: agrupar por fuente, claims mas jugosos y objetivos mas conectados a Frontline/Fortress.

Events:
- Migrado en MVP a Frontline.
- Identidad visual reforzada en tarjetas de operacion con firma, mutador y tono propio.
- Pendiente: mutadores reales y reward reveal propio.

Arena:
- Migrada en MVP a Frontline.
- La placa de rango/progreso ya es visible tambien fuera de layouts grandes.
- Evita refrescos locales de tickets cuando la persistencia es Supabase.
- Ahora separa dos modos: Ladder sin tickets, con MMR Bronce III-II-I y rivales tipo jugador; y Arena Trials con tickets, mutadores visibles y rewards mas especiales.
- Ladder usa `recordLadderResult` server-authoritative para puntos, progreso de llave y rewards anti-farm.
- Pendiente: mas ligas/rivales, mutadores reales en Trials, reward reveal propio y replay/simulacion server-side completa antes de competitivo publico.

Team:
- Existe como pantalla auxiliar.
- Usa el icono `team` registrado en el chrome superior.
- Pendiente: decidir si se mantiene, se fusiona con Deck/Roster o se archiva.

## Localizacion

Sistema:
- `lib/i18n/*`
- `lib/i18n/dictionaries.ts`
- `duskkeep-localization` skill para tareas con texto.

Regla:
- No introducir texto user-facing hardcoded en componentes.
- Usar keys de i18n.
- Si el texto es puramente decorativo/aria-hidden, se puede evitar texto nuevo.

Idiomas objetivo:
- Ingles.
- Espanol.
- Chino.
- Japones.
- Frances.
- Aleman.
- Portugues o coreano, segun prioridad futura.

Pendiente:
- Migracion progresiva de todos los textos restantes.
- Revisar pluralizacion y formatos de fecha/hora.

## Skills Locales

Skills importantes:
- `duskkeep-visual-cohesion`
- `duskkeep-screen-audit`
- `duskkeep-asset-pipeline`
- `duskkeep-combat`
- `duskkeep-adventure-flow`
- `duskkeep-reward-feedback`
- `duskkeep-browser-validation`
- `duskkeep-localization`
- `duskkeep-secure-backend`
- `duskkeep-skill-maintenance`
- `impeccable`
- `audio-and-sound`
- `music`
- `sound-effects`
- `ux-sound-design`

Regla:
- Usar la skill si la tarea toca su area.
- Revisar skills ocasionalmente si aparece una tarea repetida o regla fragil.
- Mantener `docs/skills/*` como fuente y sincronizar con `.agents/skills/*` si cambia una skill.
- Para audio, no sobreescribir assets finales existentes sin crear copia/backup o asset versionado nuevo.

## Backlog Prioritario

Prioridad inmediata sugerida:
1. Validar Ladder/Arena en navegador y Supabase local/remoto tras aplicar migracion.
2. Audio pass acotado: musica/ambiente y SFX para boss/eclipse/castillo/rayo/tension, sin sobreescribir assets existentes.
3. Reward feedback reutilizable en Events, Arena y Ladder si se retoma pulido visual.
4. Precombat visual: enemigos, rewards, camino hacia Combat.
5. Adventure map mechanics: interacciones adicionales, nodos ocultos, lore/recompensas periodicas y condiciones.
6. Adventure map polish bajo demanda: camino real, iconos de fase, side panel limpio.
7. Deck visual: squad stage y cartas mas parecidas a Combat.
8. Fortress scene/audio pass: landmark mas vivo, upgrade/raid sequence y ambiente propio.
9. Roster tiers: definicion de datos y visual por tier.
10. Shop content: packs Frontline, shards, bundles, claim diario.
11. Localization migration continua.

Backlog tecnico:
- Antes de monetizacion: crear un `GameFixedStage` global para renderizar el juego dentro de una resolucion logica fija y migrar Home, Adventure, Combat y pantallas clave a ese shell si se decide estabilizar layout global.
- Antes de monetizacion: completar validacion server-side robusta de combate/replays y ladder. El cliente/canvas nunca debe ser fuente de verdad porque F12, memoria, localStorage y requests siempre son manipulables.
- Antes de monetizacion: rate limit distribuido, observabilidad operativa y webhooks backend-only si hay pagos.
- Extraer datos hardcoded de Arena/Events si crecen.
- Decidir destino de tactical/grid legacy.
- Mantener Supabase server-authoritative sin romper fallback local explicito de desarrollo/offline.
- Mejorar tests de Frontline y store de progresion.

## Reglas Para Futuras Iteraciones

No romper:
- Persistencia local.
- Economia existente.
- Reglas de Frontline.
- Assets manifest/fallback.
- Home return en pantallas no combat.

Preferir:
- Componentes compartidos.
- Iconos y assets registrados.
- Visual-first.
- Menos texto permanente.
- Animaciones por evento real, no solo hover.
- Browser validation en desktop y mobile cuando haya UI.

Evitar:
- Redisenos teoricos sin implementacion.
- Paneles negros apilados.
- Iconos tiny dentro de circulos dobles.
- Rutas de assets inventadas.
- Cambios de gameplay camuflados como UI.

## Comandos de Validacion

Usar:

```powershell
npm.cmd run check
npm.cmd run test
npm.cmd run build
```

Si se toca Supabase/backend:

```powershell
npm.cmd run smoke:supabase:guest
npm.cmd run smoke:supabase:snapshot
npm.cmd run smoke:authoritative-api
npm.cmd run check:supabase:remote
```

Si se toca UI:
- Validar con `agent-browser`.
- Capturar pantallas en `artifacts/validation/`.
- Revisar consola y 404.
- Cerrar agent-browser y servidores locales al terminar.

Si se toca audio:
- Validar que solo suena una musica a la vez.
- Si una pantalla comparte el mismo tema que la anterior, no reiniciar el track.
- Crear assets nuevos con nombre versionado o backup previo; no sobreescribir musica/SFX existente sin instruccion explicita.
- Revisar `lib/audioAssets.ts` y los manifests antes de cambiar rutas.
