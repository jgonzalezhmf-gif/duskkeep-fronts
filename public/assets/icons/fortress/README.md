# Fortress Icon Assets

This folder contains PNG icons for the Fortress system.

Registered names:

- `keep`
- `treasury`
- `barracks`
- `integrity`
- `defense_rating`
- `raid`
- `repair`
- `garrison`
- `watchtower`

Use `components/game/shared/FortressIcon.tsx` or `GameAssetIcon` with `category="fortress"`.

Do not build speculative paths. Add a PNG here first, then register it in `GAME_ICON_ASSET_MANIFEST.fortress` inside `lib/iconAssets.ts`. Missing or unregistered entries fall back to `GameGlyph` and do not generate browser 404s.
