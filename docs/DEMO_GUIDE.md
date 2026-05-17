# Guia de Demo y Recorrido Presentable

Esta guia define un recorrido breve para demostrar la vertical slice actual sin depender del historial de desarrollo. No sustituye a los documentos de arquitectura ni a los gates de release.

## Objetivo de la Demo

Duracion recomendada: 10-15 minutos.

Mostrar:

- entrada al juego, intro, autenticacion o invitado
- Home como hub principal
- Adventure Chapter 1 como mapa jugable
- pre-combate y combate Frontline
- recompensas y persistencia
- sistemas secundarios: Deck, Team/Roster, Shop, Missions, Arena, Events y Fortress

No presentar como cerrado:

- Chapter 2, que debe seguir bloqueado hasta tener contenido propio
- pagos reales o monetizacion
- ladder publico competitivo
- validacion completa server-side del combate

## Preparacion Local

Modo local/offline:

```powershell
npm.cmd install
copy .env.example .env.local
npm.cmd run build
npm.cmd run start
```

Modo Supabase:

```powershell
npx.cmd supabase start
npx.cmd supabase db reset
npm.cmd run dev:supabase
```

Para Supabase remoto, validar primero:

```powershell
npm.cmd run check:supabase:remote
```

No usar credenciales reales en capturas, documentos o commits.

## Checklist Antes de Mostrar

- `npm.cmd run check` pasa.
- La app abre sin errores de consola visibles.
- Home carga con recursos, navegacion e intro/auth correctos.
- Adventure Chapter 1 permite seleccionar un nodo disponible.
- `Start Adventure` abre el pre-combate.
- Una victoria vuelve al resultado y luego al mapa.
- Recursos y progreso se mantienen tras recargar si se usa Supabase.
- No hay 404 de assets principales.
- No hay overflow horizontal en desktop.

## Recorrido Recomendado

### 1. Entrada e Identidad del Juego

1. Abrir la URL del juego.
2. Dejar ver la intro o usar skip si se quiere acelerar.
3. Entrar como invitado o con una cuenta de prueba.
4. Explicar que el invitado permite jugar rapido, pero la cuenta vinculada sincroniza progreso con el servidor.

Puntos a destacar:

- tono dark fantasy
- Home como mapa/hub central
- recursos visibles y navegacion clara

### 2. Home

Mostrar:

- tarjeta de jugador
- recursos superiores
- accesos a Adventure, Deck, Team/Roster, Shop, Missions, Arena, Events y Fortress
- configuracion de audio/opciones si aplica

Evitar entrar todavia en demasiadas pantallas; Home debe funcionar como orientacion.

### 3. Adventure Chapter 1

Entrar en Adventure y mostrar:

- Chapter 1 activo
- Chapter 2 bloqueado como alcance de demo
- nodos, rutas y marcador de party
- mission card compacta al seleccionar un nodo
- cofre interactuable con Adventure Keys si esta disponible

Accion recomendada:

1. Seleccionar un nodo disponible.
2. Revisar tipo, recompensa y poder enemigo.
3. Pulsar `Start Adventure`.

### 4. Pre-Combate

Mostrar:

- enemigo y contexto de la mision
- recompensas previstas
- boton para iniciar combate
- opcion de volver si se quiere cambiar de decision

Mantener la explicacion corta: el objetivo es llegar al combate.

### 5. Combat Frontline

Mostrar:

- tres frentes
- heroes propios y enemigos
- command disponible
- cartas de mano
- coste de cartas
- resolucion de choque
- vida de cores y unidades

Accion recomendada:

1. Jugar una carta.
2. Usar o senalar la habilidad de lider si esta disponible.
3. Resolver el choque.
4. Completar el combate hasta victoria o derrota.

No entrar en detalle tecnico del motor salvo que se pregunte.

### 6. Resultado y Recompensas

Tras el combate:

- mostrar pantalla de victoria/derrota
- revisar recompensas
- volver a Adventure
- comprobar que el nodo queda completado o que se desbloquea el siguiente

Si se usa cuenta con Supabase, recargar la pagina despues de una recompensa para demostrar persistencia.

### 7. Progresion

Mostrar de forma breve:

- Team/Roster para heroes, roles y desbloqueos
- Deck para cartas y paquete de combate
- Missions para objetivos reclamables
- Shop para ofertas y recursos

No forzar upgrades si no hay recursos suficientes; basta con mostrar el sistema y, si hay recursos, hacer una mejora segura.

### 8. Sistemas Secundarios

Mostrar solo una vista rapida de:

- Arena: modo competitivo preparado, sin venderlo como ladder final publico
- Events: operaciones temporales y recompensas
- Fortress: sistema de base/raid preparado para progresion

La demo debe cerrar volviendo a Home o Adventure.

## Demo de Persistencia Online

Para demostrar que el servidor es fuente de verdad:

1. Entrar con cuenta de prueba vinculada.
2. Completar una accion que cambie recursos o progreso.
3. Recargar la pagina.
4. Cerrar sesion y volver a entrar.
5. Confirmar que recursos/progreso vienen del snapshot servidor.

Si algo falla, no insistir con clicks repetidos. Revisar consola y logs de `/api/server/authoritative`.

## Troubleshooting Rapido

### No llegan emails de Supabase

- Confirmar SMTP externo configurado.
- Revisar rate limits del proveedor.
- Usar una cuenta ya creada para demo si el flujo de email no es el foco.

### La app parece mezclar progreso antiguo

- Confirmar `NEXT_PUBLIC_PERSISTENCE=supabase`.
- Confirmar `SERVER_AUTHORITATIVE_API_ENABLED=true`.
- Cerrar sesion y volver a entrar.
- En local/offline, limpiar `localStorage` solo si la demo no depende de ese progreso.

### Una operacion online muestra error generico

- Revisar consola del servidor.
- Buscar `requestId`.
- Confirmar que Supabase esta iniciado o que el remoto esta configurado.
- No asumir que el cliente puede corregir recursos/progreso manualmente.

### Una pantalla visual se ve mal

- Probar recarga completa.
- Revisar 404 de assets.
- Evitar calibrar assets durante la demo; dejarlo como incidencia para QA.

## Gates de Cierre

Antes de considerar la demo lista:

```powershell
npm.cmd run check
npm.cmd run build
```

Si el bloque toca Supabase:

```powershell
npm.cmd run smoke:supabase:snapshot
npm.cmd run smoke:authoritative-api
```

Si el bloque toca visuales:

```powershell
npm.cmd run screenshots:auto
```

Cerrar cualquier navegador o servidor auxiliar que se haya abierto para validar.
