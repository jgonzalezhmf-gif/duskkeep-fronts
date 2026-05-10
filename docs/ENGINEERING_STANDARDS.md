# Estandares de Ingenieria

Este documento define el nivel tecnico minimo para futuros cambios en Duskkeep Fronts. Es intencionadamente pragmatico: primero proteger el alpha jugable, despues mejorar estructura, seguridad, rendimiento y mantenibilidad en iteraciones pequenas.

## Prioridades

1. Mantener el alpha jugable.
2. Preservar compatibilidad con la persistencia local existente.
3. Mantener reglas de gameplay, economia y rewards deterministas y auditables.
4. Mantener una cohesion visual clara sin cargar assets innecesarios.
5. Preparar el terreno para autoridad de backend sin acoplar demasiado pronto el alpha offline a un backend.

## Estandares de Arquitectura

### Responsabilidad por Capa

- `app/*` gestiona rutas y composicion de alto nivel de pantallas.
- `components/game/*` gestiona presentacion de juego y UI de pantallas.
- `components/ui/*` gestiona primitives visuales reutilizables.
- `features/*` gestiona reglas de dominio y helpers de gameplay.
- `data/*` gestiona contenido seed y configuracion estatica.
- `lib/*` gestiona store, persistencia, tipos compartidos, manifests y utilidades.

### Ubicacion de Reglas

Las reglas deben vivir donde puedan probarse y reutilizarse:

- Las reglas de combate van en `features/frontline/*`.
- Las reglas de nodos Adventure e interacciones de mapa van en `features/adventure/*`.
- La visibilidad y normalizacion de rewards va en helpers compartidos, no repetida en JSX.
- Las mutaciones de economia deben pasar por acciones de store o helpers de feature.
- La configuracion estatica de balance puede vivir en `data/*`, pero el comportamiento no debe esconderse dentro de los datos.

### Limites de Componentes

Los componentes deben:

- aceptar props tipadas
- renderizar estado
- llamar callbacks
- usar primitives compartidas para iconos, rewards, fondos y paneles
- evitar duplicar reglas de juego

Los componentes no deben:

- mutar economia directamente
- hardcodear valores ocultos de balance
- generar rutas especulativas de assets
- contener subsistemas grandes no relacionados
- mezclar rediseno UI, cambios de gameplay y cambios de persistencia en una misma pasada

## SOLID Aplicado de Forma Pragmatica

- Responsabilidad unica: un componente/helper debe tener una razon clara para cambiar.
- Abierto/cerrado: nuevos assets, cartas, nodos y rewards deben anadirse mediante manifests/configuracion antes que cambiando logica de render.
- Sustitucion de Liskov: las primitives compartidas deben comportarse igual entre pantallas y no requerir hacks especificos.
- Segregacion de interfaces: pasar solo los datos necesarios; evitar objetos amplios del store cuando bastan selectores.
- Inversion de dependencias: la UI debe depender de helpers tipados y manifests, no de rutas raw, detalles de backend o internals de storage.

## Estandares de Store y Persistencia

La persistencia actual es local:

- Zustand persist escribe en `localStorage`.
- Las migraciones de store deben proporcionar defaults seguros para campos nuevos.
- Los snapshots existentes no deben resetearse destructivamente durante iteraciones normales.
- Los nuevos datos persistentes deben tolerar campos ausentes y ser compatibles con versiones previas.

Hasta que exista autoridad de backend:

- No presentar balances del cliente como seguros.
- No depender de `localStorage` para nada monetizado o competitivo.
- Mantener centralizadas las operaciones sensibles de economia para poder moverlas despues a servidor.

## Estandares de Seguridad

El navegador no es autoritativo.

Para el alpha offline actual:

- Nunca commitear `.env`, `.env.local`, service keys, logs o dumps.
- Mantener `package.json` como privado.
- Mantener assets opcionales detras de manifests para evitar 404 y path probing.
- Validar inputs expuestos en endpoints API/dev.
- Tratar endpoints dev-only como herramientas locales, no como funcionalidades de produccion.

Para el futuro modo online:

- Autenticar usuarios antes de persistir.
- Verificar ownership en servidor.
- Validar rewards, compras y resultados de batalla en servidor.
- Usar claves de idempotencia para claims y compras.
- Registrar cambios de recursos en un ledger auditable.
- Mantener service-role keys solo en servidor.

## Estandares de Rendimiento

### Recursos Visuales

- Mantener laminas fuente/raw fuera de `public/assets`.
- Registrar assets de runtime mediante manifests.
- Preferir variantes WebP/AVIF para entrega en navegador cuando sea posible.
- Usar variantes responsive para imagenes que se muestran pequenas.
- Mantener fallbacks PNG solo cuando sean necesarios.
- No anadir assets grandes sin revisar `npm.cmd run audit:assets`.

### Renderizado

- Preferir `transform` y `opacity` para motion.
- Evitar animar `left`, `top`, `width`, `height`, `box-shadow`, blurs grandes o colores de borde.
- Respetar `prefers-reduced-motion` en animaciones decorativas.
- Cargar de forma diferida overlays, editores y paneles pesados que no sean necesarios en el primer pintado.
- No importar Combat o editores QA en hubs/listados salvo que sea necesario.

### Presupuestos

Usar:

```powershell
npm.cmd run audit:assets
npm.cmd run audit:build
npm.cmd run check:performance
```

Los checks actuales de presupuesto son simples de forma intencionada y deben mantenerse verdes:

- peso total de public assets
- tamano de `.next/static`
- tamano de `.next/server/app`
- HTML prerenderizado mas pesado

## Estandares de Calidad

Antes de cerrar una iteracion relevante:

- ejecutar pronto la validacion mas pequena util
- ejecutar checks mas amplios antes del commit si se ha tocado codigo de app
- actualizar `CHANGELOG.md`
- subir version en `package.json` y `package-lock.json`
- mantener commits acotados y revisables

Comandos recomendados:

```powershell
npm.cmd run typecheck
npm.cmd run check
npm.cmd run test
npm.cmd run build
npm.cmd run check:full
```

Usar `check:full` para iteraciones cerradas de codigo de app cuando el entorno lo permita.

## Estandares de Pruebas

Anadir o preservar tests para:

- comportamiento determinista de combate
- politicas de claim de rewards y replay
- reglas de key chest
- migraciones de store y helpers sensibles de persistencia
- helpers puros de dominio extraidos

La validacion en navegador debe usarse para:

- cambios visuales
- cambios de navegacion
- cambios responsive
- integracion de assets
- flujos de reward/claim

Documentacion pura o refactors aislados de dominio no necesitan validacion en navegador salvo que el riesgo sea alto.

## Estandares de Recursos Visuales

- Usar `lib/iconAssets.ts` para iconos compartidos del juego.
- Usar manifests de pantalla/feature para fondos, portraits, card art, efectos y props.
- No construir URLs publicas desde ids arbitrarios.
- No pedir assets futuros que no existen.
- Proporcionar fallback visual o glyph para assets opcionales.
- Reportar problemas de alpha, checker o fondo visible en vez de forzar assets rotos.

## Estandares de Lanzamiento

Antes de una build presentable:

- `npm.cmd run check`
- `npm.cmd run test`
- `npm.cmd run build`
- smoke test en navegador de rutas principales
- confirmar cero 404 en assets registrados
- confirmar que no hay overflow horizontal en desktop/mobile
- confirmar que funcionalidades futuras sensibles no se presentan como seguras si siguen siendo local-only

## Estandares de Refactor

Refactorizar en slices seguros:

- Extraer helpers puros antes de mover comportamiento.
- Preservar APIs publicas de componentes salvo cambio intencional.
- Evitar renombres amplios.
- Evitar crear muchos archivos pequenos sin un limite claro.
- Preferir modulos por feature antes que volcar todo en `lib`.
- Parar si cambios no relacionados del usuario entran en conflicto con la tarea actual.

## Preparacion para Servidor

Cuando empiece el trabajo de backend, seguir este orden:

1. Documentar schema objetivo y operaciones de servidor.
2. Anadir contratos de validacion.
3. Anadir persistencia autenticada para datos de bajo riesgo de perfil/progreso.
4. Mover claims de rewards y compras a servidor.
5. Anadir ledger de recursos e idempotencia.
6. Anadir flujos competitivos o monetizados solo cuando exista autoridad real.

No acoplar pagos, ladder o economia premium directamente a estado controlado por cliente.
