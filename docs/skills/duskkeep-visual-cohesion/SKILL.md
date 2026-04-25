---
name: duskkeep-visual-cohesion
description: "Use this skill whenever changing Duskkeep Fronts game UI, screens, icons, backgrounds, navigation, or shared visual components. It preserves a coherent dark medieval fantasy game style across Home, Adventure, Deck, Heroes, Quests, Events, Arena, Market, Fortress, and non-Combat screens, prioritizing visual information over text and preventing screens from drifting into mismatched legacy UI."
---

# Duskkeep Fronts Visual Cohesion

Use this skill before editing any Duskkeep Fronts screen or shared UI component that affects the game's visual language.

## Product Direction

Duskkeep Fronts should feel like one connected game, not unrelated screens.

Core direction:
- Dark medieval fantasy.
- Pixel-art inspired icons with chunky silhouettes and thick outlines.
- Visual information first, text second.
- Strong reusable resources, heroes, enemies, landmarks, cards and buttons.
- Home is the main hub; most non-combat screens should clearly return to Home.
- Combat can have its own battle presentation, but still shares resources, rewards and asset rules.

## Scope

Apply this skill to:
- Screen redesigns and polish.
- Shared chrome, TopBar, resource display and navigation.
- Buttons, CTAs, medallions, cards, panels and reward tokens.
- Reusable icon, asset and visual component work.
- Any task where one screen risks becoming stylistically disconnected from Home and Combat.

## Mandatory Checks

Before editing:
- Identify which shared components already exist for this visual pattern.
- Check whether icons/assets should come from a manifest instead of hardcoded paths.
- Check if the screen needs a Home return control.
- Check whether the screen should reuse `ScreenScaffold`, `GameIcon`, `GameRewardToken`, `ResourceIcon`, `GameAssetIcon`, `FrontlineCardView` or `FrontlineHeroStandee`.
- For animation, microinteraction, character/image motion, motion polish or live visual iteration, also consult `impeccable` and especially `.agents/skills/impeccable/reference/animate.md` after running its context loader.

While editing:
- Prefer visual hierarchy, icons, silhouettes, cards, landmarks and clear CTAs over long explanatory text.
- Avoid adding new one-off icon systems or duplicated button styles.
- Avoid over-paneling: fewer boxes, more scene composition.
- Keep mobile legibility in view.
- Keep motion purposeful: state feedback, guidance, impact or delight. Avoid animation fatigue, bounce/elastic easing, layout-property animation and anything that ignores reduced-motion preferences.

Before finishing:
- Verify the screen still belongs to the same art direction as Home and Combat.
- Verify resource icons and nav icons use the central manifest/fallback system.
- Verify no speculative asset URLs can cause 404s.
- Run available checks when code was changed.

## Output

Report:
- What shared visual language was preserved.
- What shared components/assets were reused.
- What one-off or legacy UI was removed or avoided.
- Any remaining mismatch with Home/Combat.
