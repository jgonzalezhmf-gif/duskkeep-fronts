---
name: duskkeep-home-effect-calibration
description: "Use this skill whenever calibrating Duskkeep Fronts Home landmark spritesheets, micro-life effects, flames, flags, portals, crystals, or any visual effect that must align precisely to landmarks. Use it especially after repeated visual feedback that an effect is too small, too transparent, drifting, or not anchored to the correct torch, flagpole, portal, or crystal."
---

# Duskkeep Home Effect Calibration

Use this skill for precise Home effect alignment. It complements `duskkeep-visual-cohesion`, `duskkeep-asset-pipeline`, `frontend-design`, `impeccable`, and `agent-browser`.

## Scope

Apply only to Home landmark effects:
- `components/game/home/HomeEffectSprite.tsx`
- `components/game/home/homeEffectLayout.ts`
- `components/game/home/HomeLandmarkAsset.tsx`
- Home effect assets under `public/assets/home/effects/`

Do not touch Combat, Adventure page, Shop, Deck page, Fortress page, audio, backend, economy, progression, or gameplay rules.

## Calibration Workflow

1. Capture the current Home screenshot at the user's relevant viewport before changing values.
2. Export DOM metrics for:
   - `[data-home-landmark]`
   - `[data-home-effect]`
   - `[data-home-hotspot]`
3. Treat `homeEffectLayout.ts` as the single source of truth for effect placement.
4. Calibrate in this order:
   - Frame mechanics first: one frame visible, no strip, no lateral drift.
   - Asset suitability second: no grey boxes or bad alpha; disable bad sprites.
   - Position third: align to real torch/flag/portal/crystal anchor.
   - Size fourth: match the scale of the drawn effect in the landmark art.
   - Opacity last: increase until it reads clearly without covering the art.
5. Validate after every meaningful pass with screenshot and, for animation, a 5 second video.

## Alignment Rules

- Position values are percentages relative to the landmark asset, not the viewport.
- Use small, deliberate deltas. For landmarks already close, move by `0.3-1.2` percentage points, not arbitrary jumps.
- A flame should sit on the painted flame/torch center, not in the geometric middle of the torch holder.
- If the sprite has internal empty transparent margin, increase `width`/`height` more than the visible target suggests.
- If a sprite contains its own pole/frame, align that included structure to the painted structure; otherwise it will look duplicated.
- Prefer fewer correctly aligned effects over many approximate ones.

## Sprite Sheet Checks

For each spritesheet:
- Confirm frame count from manifest.
- Verify whether frames are internally centered.
- If frame centers vary, use corrected keyframes in `HomeEffectSprite.tsx` or regenerate/clean the asset.
- Avoid CSS glows, radial circles, random particles, or overlay effects as substitutes for bad alignment.

## Browser Validation

Use `agent-browser`:

```powershell
agent-browser set viewport 1440 900
agent-browser open http://127.0.0.1:3000/
agent-browser wait 1500
agent-browser screenshot artifacts/validation/home-effects-calibration.png
agent-browser record start artifacts/validation/home-effects-calibration.webm
agent-browser wait 5200
agent-browser record stop
```

Also check:
- no 404 for `/assets/home/effects/*`
- no page errors
- no horizontal overflow
- 6 landmarks and 6 hotspots still exist

## Output

Report:
- Which effects were recalibrated.
- Before/after placement changes.
- Which sprites remained disabled or need regenerated art.
- Screenshot/video paths.
- Validation commands and results.
