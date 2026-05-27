Frontline card art placeholders.

Expected filenames use card ids, for example:
- `order_twin_slash.webp`
- `order_guard_wall.webp`
- `order_focus_fire.webp`
- `tactic_battle_hymn.webp`
- `tactic_sanctuary.webp`
- `tactic_smokescreen.webp`
- `tactic_core_burst.webp`
- `tactic_rally_cry.webp`
- `tactic_poisoned_dagger.webp`
- `summon_wolf.webp`
- `summon_barrier.webp`

After adding a file, register it in
`components/game/frontline/frontlineVisualAssets.ts`:

```ts
const FRONTLINE_CARD_ART_ASSETS = {
  order_guard_wall: "/assets/frontline/cards/order_guard_wall.webp",
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
