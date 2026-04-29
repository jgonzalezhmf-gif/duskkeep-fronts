---
name: duskkeep-combat
description: "Use this skill whenever working on Duskkeep Fronts Combat: battle UI, command economy display, lanes/fronts, heroes, enemies, card presentation, Clash/Breach feedback, Adventure/Arena/Event battle integration, post-battle rewards, or enemy/card data. It protects the current rules unless the user explicitly asks for gameplay redesign."
---

# Duskkeep Fronts Combat

Use this skill for Combat and all systems that launch or depend on Duskkeep Fronts.

## Current Core Identity

Duskkeep Fronts is the current combat core:
- 3 fixed heroes per side.
- 3 fronts: left, center, right.
- Core per side.
- Fixed Command economy.
- Short deck and hand.
- Card-driven actions.
- Clash resolution by fronts.
- Breach damage to Core when a front opens.
- Temporary summons/supports as tokens.

## Boundaries

Do not change combat rules unless the user explicitly requests gameplay/system redesign.

Safe areas for normal polish:
- Presentation.
- Readability.
- Standee/card visuals.
- Clash/Breach feedback.
- Asset registration and fallbacks.
- Enemy/hero visual mapping.
- Pre-combat display.
- Post-battle reward presentation.

Risky areas:
- Command economy.
- Draw rules.
- Clash/Breach formulas.
- Core values.
- Card effects.
- Progression/rewards.

## Important Files

Inspect as needed:
- `components/game/frontline/FrontlineBattle.tsx`
- `components/game/frontline/FrontlineVisualPrimitives.tsx`
- `components/game/frontline/frontlineVisualAssets.ts`
- `features/frontline/`
- `components/game/BattlePageClient.tsx`
- `app/battle/page.tsx`
- `features/frontline/adventure.ts`
- `app/adventure/[levelId]/page.tsx`
- `app/arena/page.tsx`
- `app/events/page.tsx`

## UX Priorities

Combat should communicate:
- Which front is winning or losing.
- Which front is open.
- Which action/card affects which front.
- Command available.
- Clash result.
- Breach damage.
- Rewards after victory.

Prefer visual feedback over logs and long explanations.

## Output

Report:
- Whether rules were untouched.
- What Combat/Frontline areas changed.
- What integration points were affected.
- How to test `/battle?start=1` and any mode-specific entry.
- Any remaining risk in gameplay, rewards or data.
