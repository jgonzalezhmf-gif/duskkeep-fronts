# ElevenLabs Audio Pipeline

This project uses ElevenLabs as an optional production pipeline for SFX and music. The live game still has procedural fallback audio, so missing MP3s must not break gameplay or create 404s.

## Setup

Set the key locally. Do not commit it.

```powershell
$env:ELEVENLABS_API_KEY="your_key_here"
```

The scripts also read `.env.local` if it contains:

```text
ELEVENLABS_API_KEY=your_key_here
```

## Generate SFX

```powershell
npm.cmd run audio:sfx
```

By default, generated SFX are written to `public/assets/audio/sfx/_drafts/` so existing final assets are not overwritten. Use `--final` only after explicitly approving a draft.

Generate specific sounds:

```powershell
npm.cmd run audio:sfx -- card_play attack hit
```

Generate the first production batch:

```powershell
npm.cmd run audio:sfx -- --batch=vertical-slice
```

Generate 3 draft variants per sound:

```powershell
npm.cmd run audio:sfx -- --batch=vertical-slice --variants=3
```

Dry run without API access:

```powershell
npm.cmd run audio:sfx -- --dry-run
```

Generate the boss/eclipse draft pass:

```powershell
npm.cmd run audio:sfx -- --batch=boss-audio-v1
```

## Generate Music

```powershell
npm.cmd run audio:music
```

By default, generated music is written to `public/assets/audio/music/_drafts/` so existing final tracks are not overwritten. Use `--final` only after explicitly approving a draft.

Generate a specific theme:

```powershell
npm.cmd run audio:music -- battle
```

Generate the first production batch:

```powershell
npm.cmd run audio:music -- --batch=vertical-slice
```

Generate 2 draft variants per theme:

```powershell
npm.cmd run audio:music -- --batch=vertical-slice --variants=2
```

Dry run without API access:

```powershell
npm.cmd run audio:music -- --dry-run
```

Generate the Eclipse boss draft theme:

```powershell
npm.cmd run audio:music -- battle_boss_eclipse
```

## Registration

Generated files are not used automatically. After approving a file:

1. Put it under `public/assets/audio/sfx/` or `public/assets/audio/music/`.
2. Register the exact file in `lib/audioAssets.ts`.
3. Keep only registered existing files in the manifest.
4. Run `npm.cmd run check`.

This avoids speculative requests and 404s.

Runtime:
- Registered SFX are used by the existing `sfx.*` methods in `lib/audio.ts`.
- Registered route music is used by `audio.setTheme(...)`.
- If an asset is missing from the manifest, the game keeps using procedural fallback audio.
- If an SFX asset fails to load or decode, its procedural fallback is played.

## Prompt Rules

- Do not reference specific artists, songs, franchises, bands or lyrics.
- Use functional descriptions: material, action, emotion, duration, game context.
- Prefer short SFX that communicate a clear state.
- Music prompts should say `instrumental`, `loopable`, and `no vocals` unless we explicitly need vocals.

## Current Target Audio Set

SFX:
- UI: `ui_click`, `ui_hover`, `ui_error`
- Combat: `card_play`, `card_order`, `card_tactic`, `card_summon`, `attack`, `hit`, `death`, `death_human_male`, `death_human_female`, `death_monster`, `heal`, `shield`, `breach`, `summon`, `leader_power`, `core_damage`, `resolve_clash`, `turn_start`
- Status: `poison`, `burn`, `stun`, `guard`, `regen`
- Economy/progression: `purchase`, `claim`, `level_up`, `unlock`
- Results: `victory`, `defeat`

Music:
- `home`
- `adventure`
- `battle`
- `battle_boss`
- `battle_boss_eclipse` draft candidate for Eclipse/boss
- `prebattle`
- `postbattle`
- `shop`
- `event`

Boss/Eclipse draft SFX:
- `eclipse_lightning`
- `boss_tension_riser`
- `fortress_eclipse_pulse`

## Commercial Safety

Use generated audio only from prompts that avoid copyrighted names and lyrics. Keep accepted generated files and prompts versioned so the project can prove provenance later.
