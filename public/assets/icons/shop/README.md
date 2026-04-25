# Shop Icon Assets

Place Shop, Market and offer-state PNGs here.

Expected official names:

- `daily_offer.png`
- `bundle.png`
- `hot_deal.png`
- `best_value.png`
- `limited_time.png`
- `owned.png`
- `sold_out.png`
- `refresh.png`
- `premium_pack.png`
- `free_claim.png`
- `featured.png`
- `discount.png`

Register files in `lib/iconAssets.ts` under `GAME_ICON_ASSET_MANIFEST.shop` only after the matching PNG exists.

Use `components/game/shared/ShopIcon.tsx` for Shop/Market badges, offer state chips, category buttons and future storefront UI. Missing or unregistered shop icons fall back through `GameAssetIcon` without browser 404s.
