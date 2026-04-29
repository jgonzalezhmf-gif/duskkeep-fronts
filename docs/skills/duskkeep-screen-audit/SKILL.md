---
name: duskkeep-screen-audit
description: "Use this skill whenever auditing, planning, or updating a Duskkeep Fronts screen. It produces a practical screen status review covering whether the screen is recoverable or needs redesign, how outdated it is versus Home and Combat, what shared components/assets it should reuse, and what action plan should be followed before implementation."
---

# Duskkeep Fronts Screen Audit

Use this skill before major work on Adventure, Pre-Combat, Deck, Heroes/Roster, Quests/Missions, Events, Arena, Market/Shop, Fortress, Team/Squad, Home or any future mode screen.

## Audit Goals

The audit should protect the game from inconsistent one-off screens.

Assess:
- Current functional state.
- Current visual/art state.
- Whether the screen is recoverable or should be redesigned.
- Whether it uses current shared systems.
- Whether it still depends on legacy combat, old nav, old icons, old rewards or old panel styles.
- How it connects to Home, Combat, progression, rewards and other screens.

## Required Review

For each screen, inspect:
- Route in `app/`.
- Main composed components in `components/game/`.
- Data dependencies in `data/`, `features/` and `lib/store.ts`.
- Shared UI usage: `ScreenScaffold`, `GameBackNav`, `GameIcon`, `GameResourceBar`, `GameRewardToken`, `ResourceIcon`, `GameAssetIcon`.
- Visual consistency with Home and Frontline Combat.
- Mobile layout and scroll behavior.
- Home return path.

## Decision Labels

Use one of these:
- `Aligned`: usable with minor polish.
- `Recoverable`: functional base is useful but visual/UX pass needed.
- `Legacy`: uses old systems or old design language; replace in phases.
- `Redesign`: base direction is wrong; create a new presentation.

## Output Format

Always report:
1. Current state.
2. Recoverable or redesign.
3. Main mismatches with Home/Combat.
4. Shared components/assets to reuse.
5. Dependencies with other systems.
6. Action plan.
7. Risks and important notes.

Keep the audit practical. It should directly guide implementation, not become a long essay.
