# Resource Icons

Runtime resource icons used by the shared game UI live here.

## Registered icons

- `gold.png`
- `gems.png`
- `dust.png`
- `shards.png`
- `tickets.png`
- `command.png`
- `adventure_key.webp`

## How they are loaded

The UI only requests icons declared in the central manifest:

`lib/iconAssets.ts`

Register new files in `GAME_ICON_ASSET_MANIFEST.resources`. If an icon is not registered, the UI uses the existing SVG fallback and does not request a speculative asset path.

## Naming

Use lowercase resource ids:

- `gold`
- `gems` / `gem`
- `dust`
- `shards`
- `tickets`
- `command`

Keep transparent assets where possible so the same icon can be reused in the top resource bar, rewards, shop, fortress and combat.
