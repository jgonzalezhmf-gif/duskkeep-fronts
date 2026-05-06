# Adventure Map Interactions Backlog

Notes for post-demo Adventure map mechanics. These are intentionally not implemented in the current demo lock pass.

## Demo Scope

- Chapter 2 stays visible in the chapter list but locked until its background, music, layout and encounter pacing are designed.
- Completing the Chapter 1 boss should mark Chapter 1 progress complete without redirecting to Chapter 2.

## Branching Routes

- Nodes can unlock multiple targets through `unlocks` in Adventure data or `connectsTo` in the Adventure QA map layout.
- The first Chapter 1 branch example is `c1l2 -> c1l3, c1l7`.
- Future branch pairs should keep difficulty comparable across parallel routes, then converge into elite, event or boss gates.

## Future Interactables

- Map chest: use the visible chest near the lower-right path as an interactable cache once conditions are met.
- Keys: optional key rewards from fights, shop offers or events can open special map caches.
- Timed caches: daily or chapter-progress caches can pulse when claimable, but must not become infinite farming.
- Hidden nodes: mechanisms, lore objects or elite clears can reveal secret nodes or hidden reward caches.
- Lore scraps: non-combat nodes can unlock short world documents instead of rewards.
- Special fights: triggered nodes can spawn danger/elite encounters without changing the base route.

## Visual Rules

- Interactables should live in the same 1920x1080 Adventure map coordinate system.
- Claimable objects can use small localized sprite/light effects, not large generic glows.
- All future interactables should be editable/exportable from `?qa=adventure-map`.
