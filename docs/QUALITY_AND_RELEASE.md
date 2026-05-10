# Checklist de Calidad y Lanzamiento

Este documento define el minimo de calidad para una build presentable de Duskkeep Fronts.

## Objetivos de Lanzamiento

- El alpha es jugable desde Home hasta Adventure, Combat y recompensas.
- Las pantallas principales cargan sin crashes runtime.
- El codigo tiene limites claros y sistemas documentados.
- Los assets cargan mediante manifests o fallbacks seguros.
- La persistencia local sigue siendo compatible.
- Los checks estan en verde o los bloqueos quedan documentados.

## Comandos Requeridos

Ejecutar antes de una candidata a lanzamiento:

```powershell
npm.cmd run check
npm.cmd run test
npm.cmd run build
```

Si el entorno bloquea procesos hijos con `spawn EPERM`, repetir fuera del shell restringido y documentar la limitacion.

## Rutas de Validacion Rapida en Navegador

Validar estas rutas:

- `/`
- `/adventure`
- `/adventure/c1l1`
- `/battle?start=1`
- `/deck`
- `/team`
- `/roster`
- `/shop`
- `/fortress`
- `/missions`
- `/arena`
- `/events`

En cada ruta comprobar:

- La pagina carga.
- No hay errores criticos de consola.
- No hay 404 en assets registrados.
- No hay overflow horizontal.
- El CTA principal es visible.
- El layout mobile es usable.

## Escenarios de Gameplay

Validar al menos:

- Iniciar una batalla desde Adventure.
- Volver de pre-combate a Adventure.
- Terminar una batalla y llegar a pantalla de resultado.
- Reclamar una recompensa.
- Abrir un key chest si se cumplen requisitos.
- Comprar un item normal de Shop si hay recursos.
- Cambiar seleccion de Deck o Team sin romper el inicio de Combat.

## Checklist de Calidad de Codigo

- Los tipos TypeScript son explicitos en datos de dominio.
- Las reglas de gameplay no estan enterradas en JSX.
- Las mutaciones de economia pasan por acciones de store o helpers de feature.
- Los assets opcionales estan registrados en manifests.
- Los componentes reutilizan chrome, iconos y UI de recompensas compartidos.
- No hay `Date.now()` ni valores aleatorios en rutas de render React.
- No hay `any` amplio salvo que este aislado y justificado.
- No se commitean secretos ni archivos de entorno.

## Checklist de Rendimiento

- Evitar blurs animados grandes, `box-shadow` animado y particulas globales.
- Preferir transforms y opacity para motion.
- Respetar `prefers-reduced-motion` en animacion decorativa.
- Mantener capas de fondo y sprites acotadas.
- Evitar cargar assets de pantallas que no estan visibles cuando sea practico.

## Checklist de Accesibilidad y UX

- Botones y links tienen nombres accesibles.
- Imagenes decorativas usan `alt=""` y `aria-hidden` cuando aplica.
- El estado importante se comunica con texto y tratamiento visual, no solo color.
- Los touch targets son suficientemente grandes en mobile.
- El foco de teclado sigue siendo usable en menus y dialogos.

## Checklist de Seguridad

El alpha actual es local/offline. Para cualquier release online:

- No confiar en balances de recursos del cliente.
- No conceder moneda premium solo en cliente.
- No aceptar claims de batalla/recompensa sin validacion de servidor.
- No exponer service-role keys ni tokens privados al navegador.
- Restringir persistencia por ownership de usuario autenticado.

## Notas de Lanzamiento

Cada iteracion cerrada debe actualizar:

- `CHANGELOG.md`
- `package.json`
- `package-lock.json`

Usar:

- Patch para fixes, documentacion y polish pequeno.
- Minor para sistemas visibles, flujos nuevos o cambios UX relevantes.
- Major solo para cambios incompatibles de arquitectura o direccion de gameplay.
