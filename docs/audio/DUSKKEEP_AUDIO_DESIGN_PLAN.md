# Duskkeep Fronts Audio Design Plan

## Direction

Duskkeep Fronts should sound like a dark medieval fantasy tactics game: tactile, readable, restrained, and rewarding. Audio must support game state first, then atmosphere.

Core identity:
- Materials: carved stone, iron, leather, parchment, wood, coins, gems, smoky magic, ward glass.
- Music: low strings, restrained brass, hand drums, frame drums, mallets, bells, drones, subtle choir pads.
- Avoid: modern UI bleeps, comedy sounds, excessive trailer impacts, vocals, copyrighted references.

## Mix Priorities

1. Combat feedback must cut through music.
2. Repeated UI sounds must stay short and quiet.
3. Rewards can be brighter and more satisfying.
4. Music should create mood without masking attack, hit, card and reward SFX.
5. Every important sound must have a visual counterpart; audio is reinforcement, not the only signal.

## Production Batches

### Batch 1: Vertical Slice

Purpose: make the current alpha feel alive in Home, Adventure, Combat and Shop.

SFX:
- `ui_click`: primary button and hotspot confirmation.
- `ui_hover`: soft hover/focus shimmer.
- `ui_error`: invalid action or insufficient resource.
- `card_play`: card is committed.
- `attack`: unit attacks.
- `hit`: unit receives damage.
- `death`: unit dies.
- `heal`: healing feedback.
- `shield`: shield/guard feedback.
- `breach`: core/front breach warning.
- `purchase`: shop purchase.
- `claim`: mission/reward claim.
- `victory`: victory stinger.
- `defeat`: defeat stinger.

Music:
- `home`: main hub loop.
- `adventure`: campaign map loop.
- `battle`: combat loop.
- `shop`: market loop.

Revised music direction after first review:
- Battle themes should be longer than one minute. Target 2-3 minutes for normal battle, up to 4 minutes for epic/event battle.
- Battle needs multiple sections: percussion-forward parts, tense violin/string parts, and short instrumental solo phrases.
- Home should be darker, calmer and more melancholic, with less high angelic texture.
- Shop should keep merchant/market identity but become less happy and slightly more melancholic.

Acceptance:
- UI feels tactile but not noisy.
- Combat turn resolution is easier to understand.
- Card play and attack/hit/death are distinct.
- Music improves mood without overpowering SFX.

### Batch 2: Progression And Collection

SFX:
- `level_up`: player/hero/card level up.
- `unlock`: new feature/card/hero unlocked.
- `summon`: summon token appears.
- `move`: tactical movement.
- `ability`: generic skill/magic activation.
- `reward_chest`: larger reward opening.

Music:
- `event`: special events loop.
- `fortress`: defensive management loop.
- `deck`: collection/deckbuilding loop.

Acceptance:
- Upgrades and unlocks feel more valuable.
- Deck/Roster/Fortress can share a calmer strategic sonic layer.

### Batch 3: Combat Detail

SFX:
- `resolve_clash`: turn resolution begins.
- `core_damage`: core takes damage.
- `guard`: guard/taunt/defensive stance.
- `poison`: poison/debuff application.
- `buff`: positive buff application.
- `debuff`: negative effect application.
- `death_monster`: monster death with subtle non-verbal creature voice.
- `death_human_male`: male human hero death with restrained voice.
- `death_human_female`: female human hero death with restrained voice.
- `boss_intro`: elite/boss encounter start.

Music:
- `arena`: more aggressive competitive loop.
- `boss_battle`: higher-tension combat loop.

Acceptance:
- Advanced combat states are identifiable without reading logs.
- Boss/arena modes feel more intense without requiring a new audio system.

## Prompt Rules

- Do not mention artists, bands, songs, franchises, protected characters, lyrics or direct style copies.
- Include function, material, duration, emotional intensity and whether vocals are forbidden.
- For SFX, keep prompts short and concrete.
- For music, specify loopable, instrumental, no vocals, and the intended screen.

## Review Process

1. Generate 3 variants for a batch.
2. Listen at low volume first.
3. Reject anything with vocals, recognizable references, harsh peaks or excessive length.
4. Pick one approved candidate per id.
5. Move/copy approved candidate to the final path in `public/assets/audio`.
6. Register only approved existing files in `lib/audioAssets.ts`.
7. Validate in-game with mute, music volume and SFX volume.

## Volume Targets

- UI hover: quietest.
- UI click: quiet but clear.
- Card play: medium, satisfying.
- Attack/hit/death: medium-high, short.
- Breach/error: attention-getting, not painful.
- Victory/level up: celebratory, limited frequency.
- Music: lower than SFX; should sit under interaction feedback.
