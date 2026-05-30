# Delta Spec: MVP Stability and Polish

## Requirement: Current Ladder work is stabilized first

The system MUST close the existing player-like Ladder opponent work before starting new MVP polish slices.

### Scenario: Ladder matchmaking chooses a same-division simulated commander

Given the player is in a Bronze division  
When Ladder matchmaking resolves an opponent  
Then the selected opponent MUST belong to the player's current division  
And the selected opponent MUST map to a Frontline preset using player heroes and player-card pool cards.

### Scenario: Server catalog remains aligned

Given the frontend Ladder catalog includes active opponents  
When the Supabase migration is reviewed  
Then every frontend opponent id and preset id MUST be represented in the migration.

## Requirement: MVP hardening stays narrow

The implementation MUST NOT add Chapter 2 content, monetization, public competitive Ladder, or broad combat rule redesign in this change.

### Scenario: Future slices add polish without changing economy

Given a later slice changes pending feedback, combat pacing, or Arena presentation  
When server-authoritative operations or rewards are involved  
Then rewards, costs, balances, and ownership MUST remain server-owned in Supabase mode.

## Requirement: Arena differentiation uses lightweight mutators

Arena Trial differentiation SHOULD use data-driven mutators that are previewable, testable, and limited to Arena Trials unless a later spec explicitly expands the scope.
