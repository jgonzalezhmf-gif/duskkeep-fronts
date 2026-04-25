# Status Icon Assets

Place Frontline/status keyword PNGs here.

Expected official names:

- `buff.png`
- `debuff.png`
- `poison.png`
- `burn.png`
- `freeze.png`
- `silence.png`
- `guard.png`
- `rush.png`
- `bleed.png`
- `curse.png`
- `regen.png`
- `armor_break.png`

Register files in `lib/iconAssets.ts` under `GAME_ICON_ASSET_MANIFEST.status` only after the matching PNG exists.

Use `components/game/shared/StatusIcon.tsx` for status and keyword chips in Combat, Deck and future card UI. Missing or unregistered status icons fall back through `GameAssetIcon` without browser 404s.
