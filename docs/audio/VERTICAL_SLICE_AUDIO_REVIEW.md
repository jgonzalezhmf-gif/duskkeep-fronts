# Vertical Slice Audio Review

Generated local drafts:
- SFX: `public/assets/audio/sfx/_drafts/`
- Music: `public/assets/audio/music/_drafts/`

Drafts are intentionally ignored by Git. Only approved final MP3s should be copied to:
- `public/assets/audio/sfx/{id}.mp3`
- `public/assets/audio/music/{id}.mp3`

Then register approved files in `lib/audioAssets.ts`.

## SFX Candidates

Pick one variant for each id:

| ID | Candidates | Intended Use | Notes |
| --- | --- | --- | --- |
| `ui_click` | `v01`, `v02`, `v03` | buttons, hotspots | Must be short and non-annoying. |
| `ui_hover` | `v01`, `v02`, `v03` | hover/focus | Quietest UI sound. |
| `ui_error` | `v01`, `v02`, `v03` | invalid action | Clear, not too harsh. |
| `card_play` | `v01`, `v02`, `v03` | card committed | Needs satisfying parchment + magic. |
| `attack` | `v01`, `v02`, `v03` | unit attack | Should cut through battle music. |
| `hit` | `v01`, `v02`, `v03` | damage taken | Shorter/drier than attack. |
| `death` | `v01`, `v02`, `v03` | KO/death | Should feel like defeat, not gore. |
| `heal` | `v01`, `v02`, `v03` | healing | Warm, readable, not too long. |
| `shield` | `v01`, `v02`, `v03` | shield/guard | Protective snap, blue-gold feel. |
| `breach` | `v01`, `v02`, `v03` | core/front breach | Dramatic warning, not alarm siren. |
| `purchase` | `v01`, `v02`, `v03` | shop buy | Premium coin/gem feedback. |
| `claim` | `v01`, `v02`, `v03` | reward claim | Brighter than purchase. |
| `victory` | `v01`, `v02`, `v03` | result stinger | Celebratory, 2-3s. |
| `defeat` | `v01`, `v02`, `v03` | result stinger | Low and final, not irritating. |

Approved first pass:
- `attack`: `v01`
- `breach`: `v01`
- `card_play`: `v01`
- `claim`: `v01` (`v02` remains a good alternate)
- `death`: `v02` temporary; regenerate a slightly voiced death cue.
- `death_monster`: `death_voice_v01` approved for monster deaths.
- `death_human_male`: `death_human_male_v02`
- `death_human_female`: `death_human_female_v03`
- `defeat`: `v02`
- `heal`: `heal_clean_v01`
- `hit`: `v01`
- `purchase`: `v03`
- `shield`: `v01`
- `ui_click`: `v02`
- `ui_error`: `v03`
- `ui_hover`: `v03`
- `victory`: `v02`

## Music Candidates

Pick one variant for each id:

| ID | Candidates | Intended Use | Notes |
| --- | --- | --- | --- |
| `home` | `v01`, `v02` | main hub | Warm fortress at dusk, long-session friendly. |
| `adventure` | `v01`, `v02` | campaign map | Travel, danger, exploration. |
| `battle` | `v01`, `v02` | combat | Tense and rhythmic, must leave SFX space. |
| `shop` | `v01`, `v02` | market | Premium, relaxed, coin/mallet character. |

Approved or pending:
- `adventure`: `v01` promoted as current Adventure theme. `v02` may be reused later for another world.
- `battle`: both drafts are liked, especially `v01`, but need longer 2-4 minute battle themes.
- `battle`: long `battle_v01` promoted for normal battles.
- `battle_boss`: long `battle_v02` promoted for bosses, mini-bosses and event battles.
- `home`: long `home_v01` promoted temporarily; likely to revisit after Home art direction changes.
- `shop`: long `shop_v01` promoted.

## Promotion Commands

Example:

```powershell
Copy-Item "public/assets/audio/sfx/_drafts/card_play_v02.mp3" "public/assets/audio/sfx/card_play.mp3"
Copy-Item "public/assets/audio/music/_drafts/battle_v01.mp3" "public/assets/audio/music/battle.mp3"
```

After promotion, register only final files in `lib/audioAssets.ts`.

## Acceptance Checklist

- No vocals.
- No recognizable copyrighted reference.
- No clipping or painful high-frequency content.
- Repeated UI sounds remain subtle.
- Combat SFX are distinct from each other.
- Music supports the screen mood without overpowering feedback.
