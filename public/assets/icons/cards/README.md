# Card Type Icons

PNG icons for card categories used by Duskkeep Fronts and Deck.

Current official files:

- `order.png`
- `tactic.png`
- `summon.png`
- `gear.png`
- `signature.png`
- `relic.png`

Register files in `lib/iconAssets.ts` under `GAME_ICON_ASSET_MANIFEST.cards`.

Use `components/game/shared/CardTypeIcon.tsx` instead of direct `<img>` tags. Missing or unregistered types fall back through `GameAssetIcon` without browser 404s.
