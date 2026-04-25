# Progression Icon Assets

This folder contains PNG icons for progression and reward feedback.

Official names:

- `upgrade`
- `evolve`
- `star`
- `unlock`
- `claim`
- `level_up`
- `tier_up`
- `reward_chest`

Use `components/game/shared/ProgressionIcon.tsx` or `GameAssetIcon` with `category="progression"`.

Do not build speculative paths. Add a PNG here first, then register it in `GAME_ICON_ASSET_MANIFEST.progression` inside `lib/iconAssets.ts`. Missing or unregistered entries fall back to `GameGlyph` and do not generate browser 404s.

Current note: `evolve.png` is expected by naming convention but is not present yet, so `evolve` is supported as a fallback-only icon until the PNG is added.
