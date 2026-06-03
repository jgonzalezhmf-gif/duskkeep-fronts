# Product

## Register

product

## Users

Duskkeep Fronts is for players who want a tactical fantasy game that is quick to read, satisfying to interact with, and visually driven. The primary user is an early alpha player exploring the loop through Home, Adventure, pre-combat, Combat, Deck, Heroes, Fortress, Market, Events, Missions and Arena.

The user context is short-to-medium play sessions on desktop and mobile. Players should understand the next useful action without reading long instructions: choose a route, prepare a squad, play cards, resolve combat, collect rewards, upgrade, and return to the Home hub.

## Product Purpose

Duskkeep Fronts is a dark medieval fantasy tactics alpha with a meta-progression layer. Its current vertical slice centers on Duskkeep Fronts: three fronts, hero standees, cards, clash resolution, breach damage, rewards and progression.

The product exists to make the loop "prepare, fight, earn, improve, return" feel like a coherent game rather than a set of disconnected web screens. Success means players can enter the game, understand where to go, enjoy the visual feedback, and want to play another run.

## Brand Personality

Tactical, vivid, collectible.

The interface should feel like a fantasy command table brought to life: carved icons, glowing resources, illustrated cards, tactical pieces, dramatic battle feedback, and a strong sense of place. It should be game-first, not dashboard-first.

Tone should be direct and compact. Use visual symbols, characters, rewards and states before explanatory text. Text exists to label, confirm and clarify, not to carry the whole experience.

## Anti-references

- Generic SaaS dashboards, analytics panels, table-heavy admin UI and nested glass cards.
- Flat web app tactical tools where heroes, cards and rewards feel like form fields.
- Overwritten screens that ignore the shared Home/Combat visual language.
- Overly verbose panels that explain every rule permanently on screen.
- Motion that is decorative noise, slow, bouncy, or blocks the player.
- Speculative asset URLs that generate 404s.

## Design Principles

1. Visual information first. Icons, heroes, cards, landmarks, resources and state should communicate before text does.
2. Home is the world hub. Most non-combat screens should preserve a clear route back to Home and feel connected to the same world.
3. Combat is a game scene, not a control panel. Heroes should feel like pieces, cards should feel playable, and Clash/Breach should read through feedback.
4. Assets must be replaceable. Heroes, cards, resources, nav icons, combat icons and rewards should use manifests and safe fallbacks.
5. Improve by reusable systems. Shared visual primitives should prevent old screens from drifting away from the current style.
6. Motion must serve play. Animation should clarify state, guide attention, reward action or add impact, while respecting reduced motion.

## Accessibility & Inclusion

Duskkeep Fronts should support readable contrast on dark backgrounds, mobile touch targets, reduced motion, visual effect reduction, text scaling and multilingual UI. For the MVP, the maintained i18n baseline is English and Spanish only, with English fallback. Additional locales should not be exposed until they can be maintained to the same quality bar.

Avoid relying only on color for critical state. Pair color with iconography, labels, shape, glow or placement. Keep player-facing language compact and avoid hiding essential actions below long scroll sections.
