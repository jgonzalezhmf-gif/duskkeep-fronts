---
name: duskkeep-adventure-flow
description: "Use this skill whenever working on Duskkeep Fronts Adventure, pre-combat, campaign map, nodes, roads, enemy previews, rewards, or Adventure-to-Frontline integration. It keeps Adventure as the main early-game path and ensures the map, pre-combat and battle entry are visual, clear, connected and not legacy."
---

# Duskkeep Fronts Adventure Flow

Use this skill for Adventure map, pre-combat and Adventure battle entry.

## Product Role

Adventure is the main early-game path into Duskkeep Fronts.

It should:
- Show a readable campaign map.
- Feel like a real path through a fantasy world.
- Preview enemy squad, rewards and threat visually.
- Keep the Start Adventure CTA visible without excessive scroll.
- Launch the current Duskkeep Fronts combat, not legacy systems.

## Required Checks

Before editing:
- Inspect `app/adventure/page.tsx`.
- Inspect `components/game/adventure/AdventureCampaignScene.tsx`.
- Inspect `app/adventure/[levelId]/page.tsx`.
- Inspect `features/frontline/adventure.ts`.
- Confirm whether the task is map, pre-combat or battle-entry work.

Map work should improve:
- Background/terrain.
- Road/path materiality.
- Node icons and state.
- Landmark detail.
- Right panel overlap and hierarchy.
- CTA visibility.

Pre-combat work should improve:
- Enemy visuals.
- Hero matchup.
- Rewards.
- Threat/readiness.
- Clear launch action.
- Less text-only presentation.

## Avoid

- Returning to old tactical/grid combat.
- Text-only mission panels.
- Generic node buttons with no world feeling.
- Hiding the start CTA below long scroll.
- Duplicating Frontline data manually in JSX.

## Output

Report:
- What part of Adventure changed.
- How it connects to Frontline.
- What visual information replaced text.
- Whether CTA is visible.
- How to test the route.
