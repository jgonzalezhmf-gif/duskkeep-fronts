# Audio Assets

Generated and approved audio lives here.

Folders:
- `sfx/`: short interaction, combat and reward sounds.
- `music/`: loopable screen themes and longer music beds.

Rules:
- Register only existing, approved files in `lib/audioAssets.ts`.
- Do not point the manifest at future files. That would create 404s.
- Keep generated source prompts in `scripts/audio/elevenlabs-audio-plan.json`.
- Never commit API keys or ElevenLabs account data.

Fallback:
- If an asset is not registered, the game should keep using the current procedural audio.
- Future runtime integration should always query `getAudioSfxAsset()` or `getAudioMusicAsset()` first.

Drafts:
- Generated variants go under `_drafts/`.
- Do not register `_drafts/` files directly.
- Copy or rename the approved candidate to the final filename first.
- `_drafts/` is ignored by Git; final approved files are the only audio assets to version.
- Historical backups/archives should live outside `public/assets` and are ignored if temporarily restored under `archive/`.
