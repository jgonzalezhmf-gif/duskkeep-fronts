# Proposal: MVP Stability and Polish

## Intent

Stabilize the current Duskkeep Fronts MVP before adding broad new content. The work improves quality, validation, waiting feedback, combat readability, and Arena differentiation while preserving the existing alpha scope.

## Scope

- Close the current player-like Ladder opponent work first.
- Harden validation and release checks.
- Add shared pending/loading feedback for server-authoritative actions.
- Improve Frontline combat readability and pacing without changing core economy/reward rules.
- Add lightweight data-driven Arena Trial mutators.

## Out of Scope

- Chapter 2 content expansion.
- Monetization or premium currency.
- Public competitive Ladder hardening beyond documenting gates.
- Full server-side combat simulation.

## Rollback

Each slice must remain independently revertible. The first slice is limited to Ladder catalog/presets/migration/tests and can be reverted without touching Combat, Shop, Adventure, or Auth.
