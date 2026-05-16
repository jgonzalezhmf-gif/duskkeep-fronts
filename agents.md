# AGENTS.md

## Objetivo
Este archivo define como debe trabajar Codex dentro de este repo para avanzar rapido sin romper la vertical slice del juego. El proyecto es un alpha de juego tactico por turnos con progresion meta, construido con Next.js App Router, TypeScript, Tailwind, Zustand y Supabase como backend autoritativo progresivo.

## Lectura rapida del repo
- `app/`: rutas y composicion de pantallas.
- `components/game/`: UI de juego y pantallas compuestas.
- `components/ui/`: primitives compartidas.
- `features/battle/`: motor auto-battle determinista, rewards y tipos.
- `features/tactical/`: motor grid-based tactico y helpers de IA.
- `data/`: seed data del alpha; heroes, shop, eventos, misiones, aventura.
- `lib/`: tipos compartidos, store global, constantes, persistencia, utilidades.
- `supabase/`: schema, seed, catalogos y RPCs autoritativas.
- `tests/`: cobertura del core simulation/rewards/rng.

## Contexto funcional vivo
- Antes de tareas amplias, leer `docs/DUSKKEEP_FRONTS_FUNCTIONAL_HANDOFF.md`.
- Ese documento resume estado actual, decisiones, pantallas, dependencias, backlog y reglas de continuidad entre sesiones.

## Estado actual del proyecto
- La arquitectura base esta bien separada entre UI, dominio y datos seed.
- `lib/store.ts` concentra gran parte de la logica de progresion, economia y meta-loop.
- Hay dos motores de juego distintos:
  - `features/battle/*` para combate automatico por eventos.
  - `features/tactical/*` para combate por grid con estado por turno.
- La direccion core es server-authoritative: Supabase/Postgres/RPC y el BFF de Next son fuente de verdad para economia/progreso online.
- Zustand/localStorage quedan como cache de cliente, UI state y fallback de desarrollo; no son autoridad para cuentas online.
- `npm run lint` ya es no interactivo y usable.
- `npm run typecheck` pasa.
- `npm run test` puede fallar en entornos restringidos por `esbuild spawn EPERM`.
- `npm run build` tambien puede fallar en esos mismos entornos restringidos por `spawn EPERM`.

## Responsabilidades logicas
Aunque Codex opere como un unico agente, debe cubrir estas responsabilidades por fases.

### 1. Architect
Responsable de:
- estructura del repo
- boundaries entre `app`, `components`, `features`, `lib`, `data`
- tipos compartidos y consistencia de nombres
- evitar mover logica de dominio a componentes sin necesidad

### 2. Gameplay Engineer
Responsable de:
- reglas del combate
- IA tactica
- balance base
- eventos emitidos por los motores
- integracion correcta de rewards y seeds

### 3. Progression Engineer
Responsable de:
- economia
- upgrades
- account level
- roadmap, milestones, misiones, eventos
- coherencia entre recompensas, costes y desbloqueos

### 4. Frontend Engineer
Responsable de:
- pantallas App Router
- UX movil y layout max-width
- estados de carga y error
- legibilidad del feedback de combate/progresion
- accesibilidad basica y no romper navegacion

### 5. Backend/Data Engineer
Responsable de:
- Supabase schema, RPCs, RLS, catalogos data-driven y migraciones
- compatibilidad del estado persistido
- seeds y shape de snapshots
- no introducir mutaciones sensibles fuera del BFF/RPC autoritativo

### 6. QA/Release
Responsable de:
- typecheck
- tests del core
- scripts de reset/bootstrapping
- `.env.example`
- documentar limitaciones operativas reales del repo

## Flujo de trabajo obligatorio para Codex
1. Empezar leyendo el contexto minimo necesario antes de editar.
2. Confirmar si el cambio afecta a arquitectura, gameplay, progresion, frontend, datos o QA.
3. Hacer cambios pequenos y directamente en el repo.
4. Verificar con comandos no interactivos.
5. Actualizar `CHANGELOG.md` y la version de `package.json`/`package-lock.json` en cada iteracion cerrada.
6. Cerrar cada tarea con estado real: que se cambio, que se verifico, que quedo pendiente.

## Arquitectura server-authoritative
- Para cuentas vinculadas o invitado Supabase, el servidor es la fuente de verdad de recursos, recompensas, progreso, compras, claims, inventario, upgrades, misiones y ladder futuro.
- El frontend envia acciones minimas: ids, seleccion del jugador y resumen/log de combate cuando aplique. Nunca envia precios, recompensas finales, balances, unlocks finales ni loot rolls como verdad.
- Toda mutacion sensible debe pasar por `/api/server/authoritative` y una RPC Supabase con auth, ownership/RLS, validacion, idempotencia y ledger si toca recursos.
- `localStorage` solo puede persistir preferencias y estado UI no sensible: idioma, audio, intro/onboarding, opciones visuales, QA local y cache descartable.
- En modo `NEXT_PUBLIC_PERSISTENCE=supabase`, no rehidratar estado sensible desde Zustand/localStorage. Debe venir de `get_player_snapshot` o de la respuesta autoritativa de una operacion.
- No anadir nuevas llamadas directas a `awardRewards`, `spend`, `claim*`, `purchase*` o `upgrade*` como autoridad para cuentas online. Si se necesita fallback local, debe ser explicito para desarrollo/offline y bloqueado para `linked`.
- Los cambios de balance deben vivir en catalogos/seed server-side o datos versionados, no en JSX ni servicios UI.

## Versionado y CHANGELOG
- Mantener `CHANGELOG.md` como historial funcional del alpha.
- Cada iteracion debe quedar documentada bajo una version concreta.
- Usar `PATCH` para fixes, documentacion, tests o ajustes pequenos sin impacto funcional amplio.
- Usar `MINOR` para nuevas pantallas, sistemas, integraciones, pipelines visuales o cambios UX perceptibles.
- Usar `MAJOR` solo para cambios incompatibles de gameplay core, arquitectura, persistencia o direccion de producto.
- Preferir `npm.cmd version <version> --no-git-tag-version` para sincronizar `package.json` y `package-lock.json` sin crear tags automaticamente.
- No cerrar una tarea grande sin indicar si se actualizo version/changelog o por que se pospone.

## GitHub y privacidad
- El repositorio remoto esperado es privado. Antes de cualquier primer push o publicacion, verificar con `gh repo view <owner>/<repo> --json visibility,isPrivate`.
- No hacer push si `isPrivate` no es `true`.
- Mantener `package.json` con `"private": true` salvo decision explicita contraria.
- No commitear `.env`, `.env.local`, logs, capturas temporales, `artifacts/`, builds, dumps ni credenciales.
- Antes de subir codigo, revisar `git status --short` y confirmar que no entran secretos o archivos generados locales.
- No cambiar la visibilidad del repo ni crear repos publicos sin instruccion explicita.

## Skills y mantenimiento del agente
- Usar las skills locales de Duskkeep Fronts cuando una tarea toque su area: cohesion visual, auditoria de pantallas, assets, Duskkeep Fronts, Adventure, rewards, localizacion/i18n o validacion browser.
- Usar `duskkeep-secure-backend` cuando una tarea toque backend, Supabase, Auth, RLS, RPCs, persistencia online, pagos, moneda premium, ladder u operaciones autoritativas.
- Usar `impeccable` como skill auxiliar cuando la tarea trate motion, animacion de personajes/imagenes, microinteracciones, polish visual avanzado, critica de interfaz o iteracion visual en navegador. Para animacion usar especialmente su referencia `animate`, pero mantener siempre las reglas propias de Duskkeep Fronts sobre gameplay, assets, manifests, i18n y validacion.
- Antes de aplicar `impeccable` en tareas de diseno/motion, ejecutar `node .agents/skills/impeccable/scripts/load-context.mjs`. Si faltan `PRODUCT.md` o `DESIGN.md`, no bloquear tareas pequenas: usar el contexto del repo y avisar de que conviene crear esos documentos antes de una pasada visual grande.
- Revisar ocasionalmente si una tarea repetida, una regla fragil o una nueva area estable necesita una skill nueva o una actualizacion de una skill existente.
- Usar `duskkeep-skill-maintenance` para decidir si crear/modificar skills o si conviene actualizar este `AGENTS.md`.
- Mantener `docs/skills/*` como copia fuente y sincronizar los cambios necesarios en `.agents/skills/*` para futuras sesiones.
- No crear skills para tareas puntuales; una skill debe reducir friccion repetida o proteger reglas importantes del proyecto.

## Prioridad de decision
1. Mantener el alpha jugable.
2. Mantener servidor como autoridad para economia/progreso online.
3. No romper la persistencia server-side ni la sesion invitada/vinculada.
4. Preservar determinismo de combate y coherencia de progresion.
5. Mejorar UX movil sin sobreingenieria.

## Reglas practicas para editar
- Favorecer cambios locales y acotados.
- Mantener tipos de dominio en `lib/types.ts` o tipos propios de `features/*` cuando aplique.
- Si una regla pertenece al juego, debe vivir en `features/*`, `data/*` o helpers de dominio; no enterrarla en JSX.
- Si una pantalla solo orquesta, debe delegar el calculo a store/helpers.
- No mover una accion sensible al cliente por comodidad. Crear/usar contrato BFF/RPC y snapshot servidor.
- Evitar refactors amplios si el problema es puntual.

## Comandos recomendados para Codex
Usar primero checks no interactivos:

```powershell
npm.cmd run check
npm.cmd run typecheck
npm.cmd run test
npm.cmd run build
```

Si el entorno permite procesos hijos, usar tambien:

```powershell
npm.cmd run check:full
```

## Criterios de salida por tarea
Una tarea se considera cerrada cuando:
- el cambio principal esta implementado
- el estado del repo queda consistente
- se ejecutan los checks razonables disponibles
- se deja claro cualquier riesgo o limitacion restante

## Regla final
Actua siempre por fases, cubriendo las responsabilidades anteriores aunque la tarea parezca pequena. No te limites a "hacer que funcione": deja el repo en un estado mas facil de mantener por el siguiente pase de Codex.
