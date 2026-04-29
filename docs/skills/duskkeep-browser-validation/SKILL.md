---
name: duskkeep-browser-validation
description: "Use this skill whenever validating Duskkeep Fronts UI changes in browser, especially after visual, navigation, asset, responsive, Home, Combat, Adventure, Shop, Fortress, Deck, Arena or Events work. It defines the agent-browser/browser QA checklist for screenshots, console errors, 404s, hydration warnings, desktop/mobile/resize checks and route-specific evidence."
---

# Duskkeep Fronts Browser Validation

Use this skill after UI, asset or route changes when browser validation is possible.

## Base URL

Prefer one base URL consistently during a validation pass:
- `http://127.0.0.1:3000`

Avoid mixing `localhost` and `127.0.0.1` in the same evidence set unless debugging origin issues.

## Core Routes

Validate relevant routes:
- Home: `/`
- Combat: `/battle?start=1`
- Adventure: `/adventure`
- Pre-combat: `/adventure/[levelId]`
- Deck: `/deck`
- Heroes/Roster: `/roster`
- Quests/Missions: `/missions`
- Events: `/events`
- Arena: `/arena`
- Market/Shop: `/shop`
- Fortress: `/fortress`

## Required Checks

Check:
- Page loads.
- No obvious runtime crash.
- No 404s for registered assets.
- No hydration mismatch warnings.
- Home return path exists on non-combat screens where expected.
- Desktop layout.
- Mobile layout.
- Strong resize or scale equivalent if requested.
- Key visual states for the task.

## Evidence

When agent-browser works:
- Capture desktop screenshot.
- Capture mobile screenshot.
- Capture relevant selected/hover/post-action state.
- Record short video for interaction-heavy Combat tasks if available.

When agent-browser is blocked:
- Report the exact error.
- Use available fallback validation: `npm.cmd run check`, `npm.cmd run build`, HTTP route checks, asset HTTP 200 checks.
- Do not claim visual validation was completed if screenshots were not generated.

## Output

Report:
- Commands executed.
- Routes checked.
- Screenshots/video paths.
- Console/network issues.
- What was objectively verified.
- What still needs manual/browser review.
