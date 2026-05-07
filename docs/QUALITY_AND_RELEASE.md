# Quality And Release Checklist

This document defines the minimum quality bar for a presentable Duskkeep Fronts build.

## Release Goals

- The alpha is playable from Home through Adventure, Combat and rewards.
- Core screens load without runtime crashes.
- The codebase has clear boundaries and documented systems.
- Assets load through manifests or safe fallbacks.
- Local persistence remains compatible.
- Checks are green or blockers are explicitly documented.

## Required Commands

Run before a release candidate:

```powershell
npm.cmd run check
npm.cmd run test
npm.cmd run build
```

If the environment blocks child process spawning with `spawn EPERM`, rerun outside the restricted shell and record the limitation.

## Browser Smoke Routes

Validate these routes:

- `/`
- `/adventure`
- `/adventure/c1l1`
- `/battle?start=1`
- `/deck`
- `/team`
- `/roster`
- `/shop`
- `/fortress`
- `/missions`
- `/arena`
- `/events`

For each route check:

- Page loads.
- No critical console errors.
- No 404 for registered assets.
- No horizontal overflow.
- Main CTA is visible.
- Mobile layout is usable.

## Gameplay Scenarios

Validate at least:

- Start an Adventure battle.
- Return from pre-combat to Adventure.
- Finish a battle and reach result screen.
- Claim a reward.
- Open a key chest if eligible.
- Buy a normal shop item if resources allow.
- Change Deck or Team selection without breaking Combat startup.

## Code Quality Checklist

- TypeScript types are explicit for domain data.
- Gameplay rules are not buried in JSX.
- Economy mutations go through store actions or feature helpers.
- Optional assets are registered in manifests.
- Components reuse shared screen chrome, icons and reward UI.
- No `Date.now()` or random values in React render paths.
- No broad `any` unless isolated and justified.
- No secrets or environment files committed.

## Performance Checklist

- Avoid large animated blurs, box shadows and global particles.
- Prefer CSS transforms and opacity for motion.
- Respect reduced motion settings for decorative animation.
- Keep background and sprite layers bounded.
- Avoid loading assets for screens that are not visible where practical.

## Accessibility And UX Checklist

- Buttons and links have accessible names.
- Images that are decorative use `alt=""` and `aria-hidden`.
- Important state is conveyed by text plus visual treatment, not color alone.
- Touch targets are large enough on mobile.
- Keyboard focus should remain usable on menus and dialogs.

## Security Checklist

Current alpha is local/offline. For any online release:

- Do not trust client-side resource balances.
- Do not award premium currency purely on the client.
- Do not accept battle/reward claims without server validation.
- Do not expose service-role keys or private tokens to the browser.
- Gate persistence by authenticated user ownership.

## Release Notes

Each closed iteration must update:

- `CHANGELOG.md`
- `package.json`
- `package-lock.json`

Use:

- Patch for fixes, docs and small polish.
- Minor for visible systems, new flows or meaningful UX changes.
- Major only for incompatible architecture or gameplay direction changes.
