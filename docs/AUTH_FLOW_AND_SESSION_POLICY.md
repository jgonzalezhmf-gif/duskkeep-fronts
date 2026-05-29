# Flujo de Auth y Politica de Sesion

Este documento describe el comportamiento objetivo de entrada al juego, modo invitado, login y conversion de invitado a cuenta. Sirve como contrato funcional para futuras iteraciones de UI, Supabase y seguridad.

## Orden de Entrada

Al abrir la URL del juego:

1. Se muestra la intro cinematica si la ruta lo permite.
2. Al terminar o saltar la intro, se muestra la pantalla de autenticacion si el jugador todavia no ha tomado una decision en esta carga.
3. El jugador puede iniciar sesion, registrarse o jugar como invitado.
4. Si el jugador elige invitado y recarga/cierra la pagina, la pantalla de autenticacion vuelve a aparecer tras la intro para permitir iniciar sesion con una cuenta existente o continuar como invitado.
5. Si el jugador navega dentro del juego y vuelve a Home sin recargar la aplicacion, la intro no vuelve a aparecer.

La intro no debe depender de si el usuario ya vio la intro en una sesion anterior. El objetivo es que aparezca al entrar a la web, no cada vez que se vuelve a Home por navegacion interna.

## Login y Registro

La pantalla inicial permite:

- Iniciar sesion con cuenta existente.
- Crear cuenta nueva con password de mas de 8 caracteres y confirmacion de password.
- Autenticarse con Google cuando Supabase este configurado.
- Jugar como invitado.

El registro muestra validacion local de formato y fortaleza de password antes de enviar la solicitud al proveedor de Auth. Esta validacion es solo UX/shift-left; Supabase Auth sigue siendo la autoridad real de identidad.

Los mensajes de error de registro, login y recuperacion deben ser genericos. No se debe confirmar si una cuenta existe, no existe, esta confirmada o tiene otro estado. Esta regla evita enumeracion de cuentas.

## Modo Invitado

El modo invitado intenta crear una sesion anonima de Supabase.

Si Supabase esta configurado:

- El invitado tiene `auth.users.id`.
- El progreso online puede asociarse a ese usuario anonimo.
- El usuario puede convertir esa sesion anonima en cuenta nueva mas adelante.

Si Supabase no esta configurado o falla:

- El juego conserva fallback local para alpha/offline.
- Ese fallback no debe tratarse como fuente de verdad para economia online futura.

## Conversion Invitado a Cuenta

La conversion invitado -> cuenta solo permite crear una cuenta nueva sobre la sesion anonima actual.

No se permite iniciar sesion con una cuenta existente desde el flujo de conversion de invitado. Si el jugador quiere usar una cuenta existente, debe hacerlo desde la pantalla inicial despues de entrar o recargar la web.

Motivo:

- Evita merges ambiguos entre progreso invitado y progreso de cuenta existente.
- Reduce riesgos de ownership incorrecto.
- Mantiene una regla sencilla: la cuenta nueva hereda el mismo `user_id` anonimo.

Tras convertir:

- Se sincroniza el snapshot local permitido como puente alpha.
- El cliente refresca el estado desde servidor cuando procede.
- La sesion pasa a modo vinculado.

## Expiracion por Inactividad

Las cuentas vinculadas pueden expirar por inactividad.

Regla actual:

- El timeout de inactividad es de 60 minutos.
- La actividad de usuario renueva el contador local de inactividad.
- Si la sesion vinculada expira o desaparece, el usuario vuelve a la pantalla de login.
- El mensaje debe indicar que la sesion expiro sin exponer detalles tecnicos.

El modo invitado no se fuerza a expirar con esta regla local, porque no representa una cuenta vinculada con datos sensibles.

## Limites de Seguridad

El cliente nunca debe:

- Confirmar existencia de cuenta.
- Mostrar errores crudos del proveedor de auth.
- Guardar tokens en snapshots de juego.
- Tratar `localStorage` como fuente autoritativa de economia online.
- Fusionar progreso invitado con una cuenta existente.

Supabase Auth sigue siendo la autoridad real de sesion. Los helpers del cliente solo normalizan estados para la UI y filtran informacion sensible.

## Validacion Esperada

Cobertura minima por tests:

- La pantalla de auth no aparece antes de terminar la intro.
- La pantalla de auth aparece para `undecided`.
- La pantalla de auth reaparece para `guest` tras una nueva carga si no se ha elegido invitado en esa carga.
- La pantalla de auth no aparece para `guest` despues de pulsar continuar como invitado en la misma carga.
- La pantalla de auth no aparece para `linked`, salvo expiracion gestionada por el monitor de sesion.
- Los errores de registro y upgrade invitado usan mensajes genericos.
- Los links de recuperacion limpian tokens de la URL visible.

## Validacion Supabase Local

El flujo invitado -> cuenta nueva se valida con estos smokes:

```powershell
npm.cmd run smoke:supabase:guest
npm.cmd run smoke:supabase:snapshot
npm.cmd run smoke:supabase:guest-upgrade
```

Cobertura validada:

- Un usuario anonimo provisiona perfil, recursos, heroes starter, cartas starter y loadout inicial.
- `get_player_snapshot` devuelve un snapshot autoritativo del usuario autenticado.
- La conversion de usuario anonimo a cuenta nueva conserva el mismo `user_id`.
- La conversion conserva el mismo `profileId` de servidor.
- Tras convertir, `sync_local_snapshot` puede importar el progreso local permitido sin cambiar ownership.

Esto confirma el comportamiento que se quiere en producto: si un invitado decide crear una cuenta nueva, su progreso se guarda sobre la misma identidad anonima convertida, no mediante merge con una cuenta existente.

## Pendiente Antes de Produccion

- Validacion browser end-to-end con Supabase remoto.
- Confirmar Anonymous Sign-Ins en el proyecto remoto.
- Activar mitigaciones anti-abuso para altas anonimas si aumenta trafico.
- Revisar el flujo final con OAuth y cabeceras de seguridad, especialmente si se endurece `Cross-Origin-Opener-Policy`.
- Definir politicas de retencion de cuentas invitadas antiguas.
