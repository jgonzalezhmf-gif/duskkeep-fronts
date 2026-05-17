# Duskkeep Fronts

Juego tactico de fantasia oscura por turnos para **web y mobile**. El alpha actual se centra en Duskkeep Fronts: Home como hub, flujo de Adventure, pre-combate, combate de cartas en tres frentes, progresion de Deck, Fortress, Market, Missions, Events y Arena. Funciona en modo local para desarrollo y tambien tiene persistencia online opcional con Supabase mediante operaciones server-authoritative.

> Fuentes de referencia: `AGENTS.md`, `docs/DOCUMENTATION_INDEX.md`,
> `docs/DUSKKEEP_FRONTS_FUNCTIONAL_HANDOFF.md`, `docs/ARCHITECTURE.md`,
> `docs/ENGINEERING_STANDARDS.md`, `docs/GAMEPLAY_GUIDE.md`,
> `docs/QUALITY_AND_RELEASE.md` y `docs/SECURITY_AND_BACKEND_ROADMAP.md`.

## Stack

- **Next.js App Router** + TypeScript.
- **Tailwind CSS** para UI responsive y shell de juego.
- **Zustand** como store de UI y cache de snapshot.
- **Zod** para contratos y validacion de operaciones servidor.
- **Vitest** para tests unitarios de motor, RNG y rewards.
- **Supabase SDK** para Auth, persistencia online y RPCs autoritativas.

## Documentacion

- `docs/DOCUMENTATION_INDEX.md`: orden de lectura por area y huecos actuales de documentacion.
- `docs/ARCHITECTURE.md`: capas del codigo, flujo de datos, limites y reglas de extension.
- `docs/ENGINEERING_STANDARDS.md`: estandares de arquitectura, calidad, seguridad, rendimiento y lanzamiento.
- `docs/GAMEPLAY_GUIDE.md`: loop jugable, pantallas y expectativas de gameplay.
- `docs/DEMO_GUIDE.md`: recorrido recomendado para demostrar la vertical slice en 10-15 minutos.
- `docs/QUALITY_AND_RELEASE.md`: checklist de lanzamiento, comandos de prueba, rutas de validacion rapida y gates de calidad.
- `docs/SECURITY_AND_BACKEND_ROADMAP.md`: persistencia online, validacion backend y roadmap de seguridad.
- `docs/BACKEND_DATA_MODEL.md`: modelo de datos objetivo para persistencia online segura.
- `docs/SERVER_AUTHORITATIVE_OPERATIONS.md`: contratos de operaciones que deben validarse en servidor.
- `docs/DUSKKEEP_FRONTS_FUNCTIONAL_HANDOFF.md`: handoff detallado para futuras sesiones de implementacion.

## Arranque Rapido

```bash
npm install
cp .env.example .env.local
npm run dev
```

La app quedara disponible en `http://localhost:3000`. Para pruebas en mobile, abrir la URL desde un dispositivo en la misma red.

### Estabilidad en Windows / OneDrive

El repo usa `webpack` por defecto para `npm run dev`. Es intencionado.

`next dev` con Turbopack produjo estados corruptos en `.next/dev/cache/turbopack` en este entorno, especialmente cuando:

- el repo esta dentro de OneDrive
- hay mas de un proceso `next dev` contra el mismo repo
- queda un servidor dev antiguo vivo mientras se arranca otro

Si el modo dev entra en un estado incorrecto:

```bash
npm run clean:next
npm run dev
```

Si se quiere probar Turbopack explicitamente:

```bash
npm run dev:turbo
```

Recomendacion: mantener un solo proceso local `next dev` por repo.

### Comandos

```bash
npm run check        # lint + typecheck
npm run check:full   # check + test + build
npm run build        # build de produccion
npm run start        # servir build de produccion
npm run clean:next   # limpiar .next si se corrompe la cache dev
npm run typecheck    # TypeScript sin emitir archivos
npm run lint         # ESLint
npm run test         # tests unitarios
npm run test:watch   # tests en watch mode
npm run screenshots  # capturas contra una app ya arrancada
npm run screenshots:auto # arranca servidor local y captura pantallas
```

Para probar la build de produccion en local:

```bash
npm run build
npm run start
```

### Automatizacion de Capturas

El repo incluye captura de pantallas con Playwright para revision visual.

Salida por defecto:

```bash
tmp/playwright-screenshots/<timestamp>/
```

Uso habitual:

```bash
npm run screenshots:auto
```

Ese comando:

1. construye la app si hace falta
2. arranca la build en `http://127.0.0.1:3004`
3. espera a que el servidor este listo
4. captura las rutas principales en desktop y mobile
5. escribe un `manifest.json` con los archivos generados

Si la app ya esta arrancada:

```bash
$env:BASE_URL="http://127.0.0.1:3000"; npm run screenshots
```

Si Playwright falla en Windows con `spawn EPERM`, se puede forzar un navegador del sistema:

```powershell
$env:PLAYWRIGHT_CHANNEL="msedge"; npm run screenshots:auto
```

Para usar Chrome:

```powershell
$env:PLAYWRIGHT_CHANNEL="chrome"; npm run screenshots:auto
```

Tambien se puede apuntar directamente al ejecutable:

```powershell
$env:PLAYWRIGHT_EXECUTABLE_PATH="C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe"; npm run screenshots:auto
```

Para depurar visualmente en modo con ventana:

```powershell
$env:PLAYWRIGHT_HEADLESS="0"; npm run screenshots:auto
```

Escenarios capturados actualmente:

- `home`
- `adventure-ch1`
- `adventure-ch2`
- `shop-featured`
- `shop-daily`
- `deck`
- `fortress`
- `arena`
- `battle-pre`
- `battle-live`

## Flujo de Verificacion

Para una validacion rapida:

```bash
npm run check
```

Para candidatas a lanzamiento:

```bash
npm run check
npm run test
npm run build
```

Usar `npm run check:full` cuando el entorno permita procesos hijos de Vitest/esbuild y workers de build de Next. En sandboxes restringidos, tests o build pueden fallar con `spawn EPERM` aunque el codigo sea correcto.

Para una demo funcional, seguir `docs/DEMO_GUIDE.md`.

## Implementado en el Alpha

- **Home** con nivel de cuenta, XP, acceso a continuar Adventure y navegacion a sistemas principales.
- **Roster** con heroes, estados de desbloqueo, roles, rareza y progresion visual.
- **Team builder** para revisar squad y paquete de combate.
- **Adventure** con Chapter 1 activo, nodos, rutas, marcador de party, interacciones de mapa y Chapter 2 bloqueado para el alcance demo.
- **Frontline Combat** como combate principal manual en tres frentes, con cartas, command, cores y resolucion de choque.
- **Arena** basada en presets Frontline y tickets.
- **Events** basados en operaciones Frontline y reglas diarias.
- **Missions** con progreso diario/semanal y recompensas reclamables.
- **Shop** con ofertas, recursos, feedback visual y Adventure Keys.
- **Resources**: gold, dust, gems, tickets, Adventure Keys y account XP.
- **Persistencia local**: Zustand + `localStorage` para desarrollo/offline.
- **Persistencia online**: Supabase Auth, snapshots de jugador y operaciones server-authoritative para rewards, compras, claims y progreso sensible.
- **Mobile UX** con layout responsive, safe-area y targets tactiles.
- **Tests** para simulacion determinista, RNG, recompensas y helpers criticos.

## Estructura del Proyecto

```text
app/                   # rutas Next.js y composicion de pantallas
components/
  ui/                  # primitives reutilizables
  game/                # componentes de juego y pantallas compuestas
features/
  frontline/           # motor principal Frontline, datos y helpers
  adventure/           # helpers de nodos, interacciones y recompensas Adventure
  battle/              # motor legacy/auto-battle
  tactical/            # prototipo tactico legacy
data/                  # seed data de heroes, aventura, misiones, eventos, shop, arena
lib/                   # store, persistencia, rng, tipos, manifests, constantes
supabase/              # migraciones, seed, smokes y RPCs Supabase
tests/                 # cobertura de motores, recompensas, rng y helpers
```

## Reset de Datos Locales

Desde la app:

1. Abrir DevTools.
2. Ir a Application.
3. Abrir Local Storage.
4. Borrar la clave `duskkeep-fronts:player:v1`.
5. Refrescar la pagina.

Desde consola del navegador:

```js
localStorage.removeItem("duskkeep-fronts:player:v1");
location.reload();
```

## Supabase Opcional

Ver `supabase/README.md` y `docs/SUPABASE_REMOTE_OPERATIONS.md`. El modo online se activa con:

```text
NEXT_PUBLIC_PERSISTENCE=supabase
SERVER_AUTHORITATIVE_API_ENABLED=true
```

en `.env.local`, junto con `NEXT_PUBLIC_SUPABASE_URL` y `NEXT_PUBLIC_SUPABASE_ANON_KEY`.

Comandos utiles:

```bash
npm run dev:supabase
npm run check:supabase:remote
npm run smoke:supabase:snapshot
npm run smoke:authoritative-api
```

Regla de seguridad: el cliente no debe ser fuente de verdad para recursos, compras, rewards, claims, progreso online ni futuros rankings.

## TODO Priorizado

### P0

1. Mantener `npm run check`, `npm run test` y `npm run build` en verde.
2. Terminar el pulido demo de Chapter 1 y mantener Chapter 2 bloqueado hasta tener contenido.
3. Anadir boundaries de error por ruta y estados vacios.
4. Mantener la persistencia online server-authoritative sin ampliar fallback local sensible.
5. Mantener documentacion actualizada con gameplay, arquitectura y estado de lanzamiento.

### P1

1. Timers de reset diario/semanal y rotacion de calendario de eventos.
2. Tiers/evolucion de heroes y uso mas profundo de shards.
3. Replays deterministas en servidor y resumenes de resultado.
4. Hook de analitica y flags de funcionalidad.
5. Mejorar observabilidad de errores Auth/RPC/snapshot.

### P2

1. Validacion server-side mas fuerte de combate.
2. Ladder de Arena y validacion anti-tamper.
3. Cosmeticos, skins y flujos de tienda premium.
4. Notificaciones push.
5. Social, clanes y PvP en tiempo real.

## Licencia

Privado para iteracion alpha.
