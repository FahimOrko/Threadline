# 0021. The story choices game keeps its state in the URL and takes deltas from the engine

- Status: accepted
- Date: 2026-11-07
- Supersedes: none

## Context

A decision game over the story lets a reader move the levers the product already has and see which Facts change. It must add no numbers (ADR 0005), keep provenance on every value (ADR 0004), show "Needs input" for unset assumptions (ADR 0016) and frame sensitivity as the declared T002 spread (ADR 0017). A later customer view (`?view=customer`) will lock the game to one customer.

## Decision

- The game is `/story/game`. Scenes, beats and dialogue are plain data in `src/lib/story/game.ts`; characters speak fixed template text over `{{fact:id}}` tokens resolved by the Story's `resolveLine`. A test fails on a digit outside a token, `CO2e` or a T-prefixed assumption id.
- State is `?scene=<1..4|end>&beat=<n>` plus the four lever params (`customer`, `baseline`, `sensitivity`, `priorities`), as ADR 0014, 0017 and 0019. Every beat is a link, so there is no client state; a bad value falls back with a notice, and a reaction beat with no choice shows the question.
- A scene's "before" state is the same address with that scene's lever at its default. No `prev` param.
- A change in a Fact is `factDelta(before, after)` in `src/lib/engine` (after minus before, same unit, null if either side is null), with Vitest tests. A component never subtracts.
- Every game link goes through `gameHref`, which copies all other query params, including repeated keys and ones unknown today such as `view`, and overwrites only what the step sets. Links out to `/story` and `/story/print` drop `scene` and `beat` and spell out the four resolved levers.
- `resolveView` (in `src/lib/selection.ts`) returns `kam` or `customer`; the default and every unknown value is `kam`. In the customer view scene 1 is a confirmation ("Start the review") that lists and reaches no other customer. Nothing sets the view yet.
- The Impact World link is `IMPACT_WORLD_HREF` in `game.ts`, `null` until that route exists; while null the ending renders nothing for it. `src/app/impact` is a heading stub today and is not linked.
- No score or total. The path strip shows the existing CO2e saved Fact.

## Consequences

Any beat is shareable and reproducible. The delta helper is a second place the engine owns arithmetic, not a loosening of ADR 0005. Revisiting an earlier scene changes later comparisons, because the "before" state is rebuilt from the address. Many beats mean many addresses, which is fine for server-rendered links. The dialogue box is a small client component only for the Space key.
