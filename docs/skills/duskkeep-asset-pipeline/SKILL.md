---
name: duskkeep-asset-pipeline
description: "Use this skill whenever adding, replacing, cropping, registering, or debugging Duskkeep Fronts visual assets: resource icons, navigation icons, hero standees, enemy images, card art, effects, backgrounds, landmarks, or future tier art. It enforces manifests, safe fallbacks, no 404s, reusable naming, and a future-proof asset replacement workflow."
---

# Duskkeep Fronts Asset Pipeline

Use this skill for any asset work in Duskkeep Fronts.

## Asset Principles

Assets must be:
- Reusable across screens.
- Registered through explicit manifests when optional.
- Safe when missing: no speculative browser requests.
- Prepared for future replacement without rewriting UI.
- Named consistently and predictably.

## Current Important Paths

Use these existing patterns:
- `public/assets/icons/resources/`
- `public/assets/icons/nav/`
- `public/assets/frontline/heroes/`
- `public/assets/frontline/cards/`
- `public/assets/frontline/effects/`
- `lib/iconAssets.ts`
- `components/ui/GameAssetIcon.tsx`
- `components/game/shared/ResourceIcon.tsx`
- `components/game/frontline/frontlineVisualAssets.ts`

## Rules

When adding optional PNG assets:
- Do not build URLs dynamically from ids unless checked against a manifest.
- Register real files explicitly.
- Provide a fallback glyph, generated visual, placeholder or existing portrait.
- Validate that registered files exist.
- Avoid causing 404s for future assets that are planned but not present.

When processing character or enemy images:
- Preserve transparent backgrounds.
- Prefer clean silhouettes over aggressive background removal that deletes body parts.
- Keep original source sheets if useful, but register only final usable assets.
- Use stable ids such as `bran`, `kara`, `mira`, `vex`, `drak`, `tovi`, `enemy_1`.

When adding new resource/nav icons:
- Put the PNG in the correct public folder.
- Register it in `lib/iconAssets.ts`.
- Use `GameAssetIcon`, `ResourceIcon` or `GameIcon` instead of `<img>` directly.

## Validation

Check:
- `npm.cmd run check` when TS/React changed.
- `npm.cmd run build` when routes/components changed.
- HTTP 200 for registered assets if a local server is available.
- Browser console for missing asset 404s when agent-browser works.

## Output

Report:
- Assets added/replaced.
- Manifest entries changed.
- Fallback behavior.
- Screens/components affected.
- Any assets still provisional.
