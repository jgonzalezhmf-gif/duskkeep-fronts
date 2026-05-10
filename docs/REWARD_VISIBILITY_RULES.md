# Reglas de Visibilidad de Recompensas

Fecha de corte: 2026-04-28

Este documento fija la regla funcional para mostrar recompensas en Duskkeep Fronts sin dejar basura visual despues de reclamar.

## Regla Base

Una recompensa ya obtenida no debe seguir apareciendo como accion reclamable ni como bonus disponible.

Excepciones:

- Una recompensa repetible puede seguir mostrandose como preview si el jugador puede volver a ganarla.
- Una cadena por tiers no desaparece como sistema: avanza al siguiente tier o muestra estado completado.
- Un feedback temporal de compra/claim puede permanecer unos segundos para que el jugador vea lo ganado.

## Tipos

### One-Shot

Se oculta o deja de marcarse como disponible tras reclamar:

- Ofertas `oneTime` de Shop.
- Misiones reclamadas del ciclo actual.
- Bonuses `firstClearRewards` de Adventure.
- Desbloqueos de cartas Frontline de primera limpieza.

Regla: si `claimed`, `cleared` o `firstClearTaken` ya es `true`, no se muestra como recompensa disponible.

### Daily / Rotation

Se oculta hasta reset o se muestra como completado no reclamable:

- Ofertas con `dailyLimit`.
- Misiones daily/weekly reclamadas.
- Eventos completados en la rotacion diaria.

Regla: si el contador diario llega a 0 o la fecha de completado coincide con hoy, no debe haber CTA de claim. Puede mantenerse un CTA de replay si el modo permite repetir sin payout diario.

### Tier / Chain

No se borra el sistema completo; se avanza al siguiente hito:

- Roadmap.
- Milestones de cuenta.
- Daily Login streak.
- Futuro pase/reward track.

Regla: el elemento reclamado no se trata como stock activo. La pantalla debe mostrar el siguiente tier disponible, el estado de espera o el track completado.

### Preview Repetible

Puede seguir visible porque no representa algo ya reclamado:

- Recompensas de Arena por rival.
- Recompensas base de Adventure al repetir nodo.
- Forecast de raid de Fortress antes de resolver.
- Resultado de batalla/post-battle del combate recien terminado.

Regla: se puede mostrar como expectativa o resultado, pero no como bonus one-shot si ya fue consumido.

## Implementacion Actual

- `lib/rewardVisibility.ts` centraliza helpers puros para daily login, roadmap, milestones, eventos diarios, Adventure first-clear y deteccion de payloads vacios.
- `features/frontline/adventure.ts` centraliza el merge de recompensas de Adventure para Frontline: precombat preview y victoria usan `getFrontlineAdventureRewardPreview(...)` / `getFrontlineAdventureVictoryRewards(...)`.
- Shop filtra stock consumido en `app/shop/page.tsx`.
- Missions filtra contratos reclamados en `app/missions/page.tsx`.
- Adventure solo muestra `firstClearRewards` cuando `isAdventureFirstClearRewardAvailable(...)` devuelve `true`.
- Battle precombat usa la misma regla para no previsualizar bonuses de primera limpieza ya tomados.
- Events mantiene el replay, pero oculta y no vuelve a entregar el payout diario cuando `eventCompletions[id]` coincide con hoy.
- Store usa la misma regla al resolver `markAdventureCleared(...)` para evitar dobles grants en estados migrados.
- Deck no decide desbloqueos: solo refleja `frontlineCardUnlocks`; los unlocks de cartas entran por `Rewards.frontlineCards` otorgados realmente.

## Checklist para Nuevas Pantallas

Antes de pintar una recompensa:

- Determinar si es `one-shot`, `daily`, `tier` o `repeatable`.
- Usar `lib/rewardVisibility.ts` antes de anadir condiciones inline en JSX/store.
- Si es asset/recompensa opcional, usar manifest/fallback y no URLs especulativas.
- Si es texto visible, usar i18n.
- Si ya fue reclamada, no mostrarla como accion disponible.
- Si es tier, mostrar el siguiente escalon o un estado completado claro.
- Si es resultado de recompensa, mostrar solo lo realmente otorgado en esa accion.

## Riesgos a Vigilar

- No confundir `firstClearRewards` con recompensas base repetibles.
- No ocultar previews de Arena/Fortress si siguen siendo acciones repetibles.
- No cambiar economia para resolver un problema de presentacion.
- No depender solo de labels como `claimed`; el CTA y el chip de recompensa tambien deben reflejar el estado real.
