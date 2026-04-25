Frontline card art placeholders.

Expected filenames use card ids, for example:
- `order_twin_slash.png`
- `order_guard_wall.png`
- `order_focus_fire.png`
- `tactic_battle_hymn.png`
- `tactic_sanctuary.png`
- `tactic_smokescreen.png`
- `tactic_core_burst.png`
- `tactic_rally_cry.png`
- `tactic_poisoned_dagger.png`
- `summon_wolf.png`
- `summon_barrier.png`

After adding a file, register it in
`components/game/frontline/frontlineVisualAssets.ts`:

```ts
const FRONTLINE_CARD_ART_ASSETS = {
  order_guard_wall: "/assets/frontline/cards/order_guard_wall.png",
};
```

If a card is not registered, Combat does not request this folder and falls back
to a related portrait or a large glyph.

Currently registered MVP card arts:
- `order_guard_wall`
- `order_twin_slash`
- `order_shadow_dive`
- `order_focus_fire`
- `tactic_battle_hymn`
- `tactic_sanctuary`
- `tactic_smokescreen`
- `tactic_core_burst`
- `tactic_rally_cry`
- `tactic_poisoned_dagger`
- `summon_wolf`
- `summon_barrier`
