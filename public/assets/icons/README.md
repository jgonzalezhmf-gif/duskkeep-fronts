# Game Icon Assets

Runtime icon assets shared by game screens live under this folder.

## Folders

- `resources/`: currency and combat-resource icons.
- `nav/`: Home, dock, rail and route/navigation icons.
- `combat/`: Duskkeep Fronts state/action icons such as core, breach, clash, attack, shield, heal, stun, summon, target, leader power, danger and advantage.
- `cards/`: Frontline/card type icons such as order, tactic, summon, gear, signature and relic.
- `fortress/`: Fortress system icons such as keep, treasury, barracks, integrity, defense rating, raid, repair, garrison and watchtower.
- `progression/`: progression and reward icons such as upgrade, evolve, star, unlock, claim, level up, tier up and reward chest.
- `status/`: Combat state and keyword icons such as buff, debuff, poison, burn, freeze, silence, guard, rush, bleed, curse, regen and armor break.
- `shop/`: Shop, Market and offer-state icons such as daily offer, bundle, hot deal, best value, limited time, owned, sold out, refresh, premium pack, free claim, featured and discount.

## Registered assets

Assets are loaded only through the explicit manifest in:

`lib/iconAssets.ts`

The browser only requests files registered in `GAME_ICON_ASSET_MANIFEST`. If a name is not registered, `GameAssetIcon` renders the existing `GameGlyph` fallback instead of probing a missing asset path.

## Component

Use:

`components/ui/GameAssetIcon.tsx`

Example:

```tsx
<GameAssetIcon category="resources" name="gold" size="md" />
<GameAssetIcon category="nav" name="adventure" size="lg" />
<GameAssetIcon category="combat" name="breach" size="sm" />
<GameAssetIcon category="cards" name="order" size="sm" />
<GameAssetIcon category="fortress" name="keep" size="md" />
<GameAssetIcon category="progression" name="reward_chest" size="md" />
<GameAssetIcon category="status" name="guard" size="sm" />
<GameAssetIcon category="shop" name="hot_deal" size="sm" />
```

Supported sizes:

- `xs`: 18px
- `sm`: 24px
- `md`: 32px
- `lg`: 48px
- `xl`: 64px

## Adding A New Icon

1. Place the transparent runtime asset in `public/assets/icons/resources/`, `public/assets/icons/nav/`, `public/assets/icons/combat/`, `public/assets/icons/cards/`, `public/assets/icons/fortress/`, `public/assets/icons/progression/`, `public/assets/icons/status/` or `public/assets/icons/shop/`.
2. Register the exact path in `GAME_ICON_ASSET_MANIFEST`.
3. Add or confirm a fallback glyph in `GAME_ASSET_ICON_FALLBACK_GLYPH`.
4. Use `GameAssetIcon` directly, or use shared wrappers such as `ResourceIcon` / `GameIcon` when the icon corresponds to an existing resource or navigation glyph.

Do not build icon paths dynamically from user/data ids unless those ids are checked against the manifest first. That prevents optional future assets from causing 404s.

## Combat Icons

Expected Duskkeep Fronts names:

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

Only register a combat entry in `lib/iconAssets.ts` after the matching asset exists. If it is not registered, Combat uses the fallback glyph and the browser makes no request for that asset.

## Card Type Icons

Official card type names:

- `order.png`
- `tactic.png`
- `summon.png`
- `gear.png`
- `signature.png`
- `relic.png`

Use `components/game/shared/CardTypeIcon.tsx` for card type badges in Combat, Deck and future card UI. Register new card type PNGs in `GAME_ICON_ASSET_MANIFEST.cards` only after the file exists.

## Fortress Icons

Official Fortress icon names:

- `keep.png`
- `treasury.png`
- `barracks.png`
- `integrity.png`
- `defense_rating.png`
- `raid.png`
- `repair.png`
- `garrison.png`
- `watchtower.png`

Use `components/game/shared/FortressIcon.tsx` for Fortress-specific UI. Register new Fortress PNGs in `GAME_ICON_ASSET_MANIFEST.fortress` only after the file exists.

## Progression Icons

Official progression icon names:

- `upgrade.png`
- `evolve.png`
- `star.png`
- `unlock.png`
- `claim.png`
- `level_up.png`
- `tier_up.png`
- `reward_chest.png`

Use `components/game/shared/ProgressionIcon.tsx` for reward, claim, unlock, level-up, upgrade and tier UI. Register progression PNGs in `GAME_ICON_ASSET_MANIFEST.progression` only after the file exists. `evolve.png` is currently expected but not present, so `evolve` intentionally falls back without a browser request.

## Status Icons

Official status/keyword icon names:

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

Use `components/game/shared/StatusIcon.tsx` for status and keyword chips in Combat, Deck and future card UI. Register status PNGs in `GAME_ICON_ASSET_MANIFEST.status` only after the file exists. Until then, status UI intentionally falls back without browser requests.

## Shop Icons

Official Shop/Market icon names:

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

Use `components/game/shared/ShopIcon.tsx` for Shop/Market categories, offer badges, state chips and future storefront UI. Register shop PNGs in `GAME_ICON_ASSET_MANIFEST.shop` only after the file exists. Until then, Shop UI intentionally falls back without browser requests.
