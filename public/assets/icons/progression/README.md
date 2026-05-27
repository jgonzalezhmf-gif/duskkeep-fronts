# Progression Icon Assets

This folder contains runtime icons for progression and reward feedback.

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

Do not build speculative paths. Add an asset here first, then register it in `GAME_ICON_ASSET_MANIFEST.progression` inside `lib/iconAssets.ts`. Missing or unregistered entries fall back to `GameGlyph` and do not generate browser 404s.
