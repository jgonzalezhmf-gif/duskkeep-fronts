# Combat Icons

Place Duskkeep Fronts runtime combat icons here.

Expected files:

- `core.webp`
- `breach.webp`
- `clash.webp`
- `attack.webp`
- `shield.webp`
- `heal.webp`
- `stun.webp`
- `summon.webp`
- `target.webp`
- `leader_power.webp`
- `danger.webp`
- `advantage.webp`

After adding an asset, register it in `lib/iconAssets.ts` under `GAME_ICON_ASSET_MANIFEST.combat`.

Do not rely on automatic URL construction. Unregistered icons use `GameGlyph` fallbacks and do not generate browser 404s.
