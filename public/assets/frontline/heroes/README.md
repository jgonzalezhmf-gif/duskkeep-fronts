Hero standee placeholders.

Expected filenames:
- `bran.webp`
- `kara.webp`
- `mira.webp`
- `tovi.webp`
- `vex.webp`
- `drak.webp`
- `Enemy1.webp` to `Enemy6.webp` for enemy-only combat units

After adding a file, register it in
`components/game/frontline/frontlineVisualAssets.ts`:

```ts
const FRONTLINE_HERO_STANDEE_ASSETS = {
  bran: "/assets/frontline/heroes/bran.webp",
};
```

If a hero is not registered, Combat does not request this folder and falls back
to `public/art/portraits/{hero}.png`.

Enemy units are not part of the player Deck/Fortress pools. They are registered
as Frontline enemy combatants in `features/frontline/data.ts` and mapped to art
in `components/game/frontline/frontlineVisualAssets.ts`.
