# Combat Icons

Place Duskkeep Fronts PNG icons here.

Expected files:

- `core.png`
- `breach.png`
- `clash.png`
- `attack.png`
- `shield.png`
- `heal.png`
- `stun.png`
- `summon.png`
- `target.png`
- `leader_power.png`
- `danger.png`
- `advantage.png`

After adding a PNG, register it in `lib/iconAssets.ts` under `GAME_ICON_ASSET_MANIFEST.combat`.

Do not rely on automatic URL construction. Unregistered icons use `GameGlyph` fallbacks and do not generate browser 404s.

Current note: `clash.png` is still missing and intentionally falls back until a real PNG is added.
