# 0022. The story game script is conditional data, and sensitivity has one plain label map

- Status: accepted
- Date: 2026-11-07
- Supersedes: none (builds on 0017 and 0021)

## Context

Review of the shipped game (ADR 0021) found the same script said the same things to every customer, jargon ("baseline", "sensitivity") in dialogue, and no guidance for a first-time reader. The script still may not state a number that is not a Fact (ADR 0005) and still frames the estimate range as a declared modelling choice (ADR 0017).

## Decision

- Each scene has explain slots before its question and meaning slots after its answer. A slot is `{ speaker, rules: [{ when, text }], fallback }`: plain data in `src/lib/story/game.ts`. One pure function, `pickLine`, takes the first rule whose condition holds, else the fallback, so every customer gets a complete script. No condition lives in a component.
- Conditions are a closed union: a fired Slice 5 observation, a Fact that needs input, a derived plain value (largest site by garments in circulation, a comparison laundry with no delivery, an unset spread) or the chosen estimate level. Lines are still fixed template text over `{{fact:id}}` tokens and plain-word tokens (site names); the digit-scan test covers every rule and fallback, and another test bans the words "baseline", "sensitivity" and "Fact" in dialogue.
- Suggested choices ("Suggested for a first run") come from one pure function `suggest`, never pre-select or advance, and aim for the clearest run, not the biggest numbers: most fired observations for the customer (ties to the lowest id), the pack's default comparison laundry, the Standard estimate, and the chapter with the most fired observations (ties and none fired go to default chapter order). None on the locked customer scene.
- Sensitivity levels are displayed as Cautious, Standard and Generous estimate from one map in `src/lib/selection.ts`, used by the header, the game, the story text and the print cover. URL values stay `low`, `base` and `high`. The T002 framing stays in Show math and methodology.
- The consequence card names the comparison in the Before and After column headers (resolved from the levers) and keeps row labels neutral. Engine and dashboard labels are unchanged.

## Consequences

The script is reviewable as a table of conditions. New slots need a fallback and a test. Adding an observation or a condition kind means touching the union and `holds`. The explain and meaning beats shift `?beat=` numbers of links shared before this change.
