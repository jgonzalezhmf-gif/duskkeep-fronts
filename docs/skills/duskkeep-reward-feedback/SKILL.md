---
name: duskkeep-reward-feedback
description: "Use this skill whenever working on Duskkeep Fronts rewards, resources, victory screens, shop pricing display, fortress payouts, post-battle results, resource icons, or reward feel. It improves visual dopamine and clarity without changing economy values unless the user explicitly asks for economy/gameplay changes."
---

# Duskkeep Fronts Reward Feedback

Use this skill when touching reward or resource presentation.

## Scope

Applies to:
- Gold, gems, dust, shards, tickets and Command visuals.
- Top resource HUD.
- Shop/Market offers.
- Fortress raid rewards.
- Post-battle rewards.
- Mission/Event/Arena reward chips.
- Victory/defeat feedback.

## Core Rule

Do not change economy values, costs or rewards unless explicitly requested.

This skill is about:
- Presentation.
- Clarity.
- Visibility.
- Reward feel.
- Animation/feedback.
- Asset consistency.

## Visual Priorities

Resources should feel worth chasing:
- Large enough to read.
- Strong silhouette.
- Glow/shine used intentionally.
- No nested circles that shrink the icon.
- Consistent across screens.
- Registered through manifests with fallbacks.

Rewards should communicate:
- What was gained.
- Why it matters.
- Account progress.
- Next action.

## Implementation Patterns

Prefer:
- `GameRewardToken`.
- `GameResourceBar`.
- `ResourceIcon`.
- `GameAssetIcon`.
- Shared reward reveal components when available.

Avoid:
- Inline SVG/glyph copies for registered resources.
- Tiny resource icons trapped inside multiple containers.
- Cold text-only reward summaries.
- Speculative asset URLs.

## Output

Report:
- What reward/resource presentation changed.
- Confirm economy values were untouched.
- Shared components/assets used.
- How to test reward/resource display.
