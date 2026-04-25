# Art Pipeline for Codex

This project should treat art production as a layered pipeline, not a single tool choice.

## Core Rule

Use three layers together:

1. Key art / illustration:
   - Primary painted scene for `Home`, campaign splash art, card portraits, enemies, bosses.
   - Generated or authored as bitmap art.
   - This is the emotional anchor and the main source of visual appeal.

2. UI composition:
   - HTML/CSS/React layout for navigation, labels, rewards, CTA buttons, overlays, deck management.
   - Keeps the game readable, responsive and easy to maintain.

3. Live effects layer:
   - PixiJS canvas for particles, glows, floating embers, pulses, sparks, rune loops, parallax props, reward bursts.
   - Used to make scenes feel alive without repainting the whole screen.

PixiJS should not replace the main illustration. It should amplify it.

## Recommended Use in Duskkeep Fronts

### Home

Use a painted key art background plus a lightweight live layer:

- painted fortress valley scene
- localized glow around castle, shrine, arena and shop
- drifting fog, sparks, fireflies, magical dust
- gentle camera parallax on desktop
- stronger click feedback on hotspots

### Deck

Use HTML/CSS for structure, then layer in high-value motion:

- foil shimmer on rare or legendary cards
- subtle particle burst when selecting a card
- animated mana-cost gem
- leader power pulse when active

### Battle

Keep battle readable first. Use art only where it reinforces clarity:

- summon burst
- spell impact decal
- leader power wave
- victory reward burst

Do not overload the battlefield with constant particles.

## Web vs Mobile

The project needs distinct art framing for each target:

### Web

- target wide composition first
- preserve lateral scenery
- allow more environmental detail
- stronger parallax depth
- side rails can coexist with art

### Mobile

- center the fortress and critical landmarks
- avoid small unreadable props
- keep hotspot spacing generous
- reduce overdraw and particle density

The same illustration can be reused only if it is composed with safe crop zones.

## Asset Strategy

### For Key Art

Prepare at least:

- `Home` master illustration
- mobile crop
- web crop
- overlay-safe version with soft negative space for UI

### For Cards

Split assets into:

- card frame
- portrait art
- rarity treatment
- effect overlay
- faction/school icon

This makes the card system scalable and easier to theme.

### For Enemies

Prepare silhouette-first designs:

- one strong shape read
- one dominant color family
- one special VFX signature

Enemies should be readable even at small portrait size.

## Codex Workflow

When working on art-heavy tasks in this repo:

1. Define the screen goal:
   - retention
   - readability
   - fantasy payoff

2. Decide what belongs to each layer:
   - bitmap illustration
   - DOM/UI
   - PixiJS effects

3. Build responsive composition first.

4. Add motion second.

5. Add spectacle last.

If a screen looks noisy, remove effects before removing layout clarity.

## Using the Local Pixi Skill

The local `.agents/skills/pixijs-2d` material is useful as a technical reference for:

- particle containers
- filters
- performance limits
- sprite batching
- overlay architecture

Treat it as implementation guidance, not as product direction.

## Current Direction for This Project

Near-term plan:

1. Replace the current `Home` pseudo-map look with a proper key art backed layout.
2. Keep hotspot navigation in React/HTML for reliability.
3. Add a PixiJS live layer only after the static art composition is approved.
4. Rebuild the deck screen to feel collectible and premium.
5. Standardize card art and enemy art briefs before mass production.
