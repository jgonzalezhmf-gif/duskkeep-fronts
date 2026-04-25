Frontline authored effect slots.

Use this folder later for sprites or overlays such as:
- `clash.png`
- `breach.png`
- `hit.png`
- `shield.png`

The current MVP uses CSS effects and floating labels.

When an authored effect exists, register it in
`components/game/frontline/frontlineVisualAssets.ts`:

```ts
const FRONTLINE_EFFECT_ASSETS = {
  breach: "/assets/frontline/effects/breach.png",
};
```

Unregistered effects are not requested by the browser.
