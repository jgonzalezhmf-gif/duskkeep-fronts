Duskkeep Fronts visual asset slots.

Drop production art here and register it in
`components/game/frontline/frontlineVisualAssets.ts` before the UI will request it:
- `heroes/{heroId}.webp` for 2.5D standees.
- `heroes/Enemy1.webp` ... `heroes/Enemy6.webp` for the current enemy unit set.
- `cards/{cardId}.webp` for full-art card illustrations.
- `effects/{effectKey}.png` for authored combat VFX sprites or overlays.

The Combat UI uses an explicit asset manifest so optional future art does not
create 404s while placeholders are missing. Adding a PNG file alone is not
enough; add its path to the matching manifest:

- `FRONTLINE_HERO_STANDEE_ASSETS`
- `FRONTLINE_CARD_ART_ASSETS`
- `FRONTLINE_EFFECT_ASSETS`

Fallbacks:
- heroes use existing `public/art/portraits/{hero}.png` portraits.
- cards use a related portrait when mapped, otherwise a large type glyph.
- effects use CSS pulses/floating labels until an effect asset is registered.

Current enemy standee IDs:
- `enemy_bone_archer` -> `heroes/Enemy1.webp`
- `enemy_plague_troll` -> `heroes/Enemy2.webp`
- `enemy_ember_ogre` -> `heroes/Enemy3.webp`
- `enemy_blood_duelist` -> `heroes/Enemy4.webp`
- `enemy_rotmaw` -> `heroes/Enemy5.webp`
- `enemy_void_acolyte` -> `heroes/Enemy6.webp`
