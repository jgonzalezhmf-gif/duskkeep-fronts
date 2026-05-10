# Documentation Index

This index is the recommended entry point for understanding and extending Duskkeep Fronts without depending on previous conversations.

## Start Here

Read these documents first:

- `README.md`: project overview, commands and local development flow.
- `AGENTS.md`: working rules for Codex and future implementation sessions.
- `docs/DUSKKEEP_FRONTS_FUNCTIONAL_HANDOFF.md`: current functional state, decisions and continuity notes.
- `docs/ARCHITECTURE.md`: codebase layers, boundaries, data flow and extension rules.
- `docs/ENGINEERING_STANDARDS.md`: quality, security, performance and development standards for future work.

## By Area

### Architecture And Code Organization

- `docs/ARCHITECTURE.md`: current architecture, layer boundaries and known risks.
- `docs/GAME_ARCHITECTURE_AND_VISUAL_SYSTEM.md`: broader game architecture and visual system direction.
- `docs/ENGINEERING_STANDARDS.md`: practical rules for keeping changes small, safe and maintainable.

Use these before:

- extracting large components
- moving domain rules
- adding new feature modules
- changing shared UI primitives
- adding persistence fields

### Gameplay And Systems

- `docs/GAMEPLAY_GUIDE.md`: player-facing game loop and screen expectations.
- `docs/FRONTLINE_COMBAT_HANDOFF.md`: Frontline Combat behavior and integration notes.
- `docs/FRONTLINE_PROGRESSION.md`: heroes, cards, unlocks and progression rules.
- `docs/FRONTLINE_SYNERGIES.md`: planned and existing tactical synergy direction.
- `docs/ADVENTURE_MAP_INTERACTIONS_BACKLOG.md`: planned Adventure map interactions and key chest ideas.

Use these before:

- changing Adventure node behavior
- changing Combat or presets
- changing Deck, heroes, cards or rewards
- adding new mission/event/arena rules

### Assets And Visual Cohesion

- `docs/ART_PIPELINE_CODEX.md`: asset registration, paths and safe fallback rules.
- `docs/GAME_ARCHITECTURE_AND_VISUAL_SYSTEM.md`: visual direction and shared UI language.
- `docs/IMPECCABLE_ANIMATION_USAGE.md`: motion and animation guidelines.
- `docs/ASSET_RIGHTS_NOTES.md`: asset usage notes.

Use these before:

- adding PNG/WebP assets
- replacing icons, portraits, card art, backgrounds or effects
- adding new animation loops
- touching Home, Adventure map or Combat visuals

### Rewards, Economy And Progression

- `docs/REWARD_VISIBILITY_RULES.md`: when rewards should be visible, hidden, claimed or replay-reduced.
- `docs/FRONTLINE_PROGRESSION.md`: card/hero progression and unlock expectations.
- `docs/SECURITY_AND_BACKEND_ROADMAP.md`: future authoritative handling of economy-sensitive actions.

Use these before:

- adding rewards
- changing first-clear/replay behavior
- changing key chest claims
- changing shop offers
- changing missions or daily rewards

### Security And Backend

- `docs/SECURITY_AND_BACKEND_ROADMAP.md`: target backend phases, sensitive operations and Supabase direction.
- `docs/QUALITY_AND_RELEASE.md`: security checklist for the presentable alpha.

Use these before:

- adding authentication
- moving persistence out of localStorage
- adding paid/premium flows
- adding online ladder or account storage
- accepting any client-submitted economy or battle result

### Performance And Release

- `docs/PERFORMANCE_BASELINE.md`: current budgets, asset audit status and performance practices.
- `docs/QUALITY_AND_RELEASE.md`: release checks, browser smoke routes and quality gates.

Use these before:

- adding large assets
- adding global CSS or animation
- changing bundle-loading behavior
- preparing a release candidate
- investigating Lighthouse regressions

## Current Documentation Gaps

These are the next documentation improvements to consider:

- Add a backend data model design once the persistence pass starts.
- Add an API contract document before implementing server-authoritative rewards or purchases.
- Add a screen-by-screen UX acceptance checklist once the current visual direction stabilizes.
- Add a lightweight troubleshooting guide for local development, browser validation and asset issues.

## Documentation Rules

- Do not document temporary experiments as final architecture.
- Keep docs aligned with code after each meaningful iteration.
- Prefer updating existing docs over creating duplicates.
- Do not include private project context that is not intended for the repository.
- If a doc describes a future system, clearly mark it as roadmap or target architecture.
