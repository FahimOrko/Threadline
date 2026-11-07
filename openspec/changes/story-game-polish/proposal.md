## Why

Review of the shipped story game found it hard to follow without a guide: the consequence card hides which comparison each number was made against, sensitivity levels read as jargon, the header pickers compete with the game's own choices, the Story link lands on the report instead of the game, and the layout wastes space. The script also says the same thing to every customer and never explains what a lever is or what a result means.

## What Changes

1. **Baseline labels in the consequence card.** Row labels become neutral ("Water saved", "CO2e saved"). The Before and After column headers name the baseline each column was computed against, resolved from the actual lever values. Applies to every baseline-dependent row (Facts that carry a `baseline`). Card-level display only; engine and dashboard Fact labels stay.
2. **Story nav entry.** The header "Story" link opens `/story/game`. It is active on `/story`, `/story/game` and `/story/print`. The report stays reachable through a "Read the full report" link on the game's first beat and on the ending, with all params preserved.
3. **Plain-language sensitivity labels, everywhere.** low → "Cautious estimate", base → "Standard estimate", high → "Generous estimate", from one label map reused by game buttons, header picker, story text, path strip and print cover. Display only; URL values stay `low`/`base`/`high`. The T002 framing (ADR 0017) stays in Show math and methodology, not in button labels. Any stated spread comes from the T002 Fact through a token.
4. **Header pickers hidden on `/story/game`** (customer, baseline, sensitivity). They stay on every other route.
5. **"Start over" button** on every beat after the first and on the ending. Clears `scene`, `beat` and the four lever params; keeps `?view=` and unknown params (and the locked customer in customer view).
6. **Game layout.** Full content width; left column = character stage + dialogue box; right column = consequence cards + path strip in their own scroll area. Empty band under the table in the stage removed. AI sidebar collapsed by default on `/story/game` only, and when opened it takes space from the left column (the card column keeps its width). Checked at 1280px with the sidebar open.
7. **Guided script.** Each scene gets an *explain* beat before the question (what the lever is, why it matters for this customer) and a *what this means* beat after the answer (what moved, which direction, what it says about the year). Precise language: comparisons named in full, units stated, no bare "baseline", "sensitivity" or "Fact" in dialogue, sensitivity lines use the item 3 labels and say it is the team's declared estimate range, not a measurement, unset assumptions are explained (needs input from Lindström, and why it matters).
8. **Data-conditioned dialogue.** Lines are picked by conditions on the resolved customer's Facts and Slice 5 observations, held as plain `(condition, line)` data in `game.ts` and evaluated by one pure function. Every conditional slot has a fallback. Still template text with `{{fact:id}}` tokens; no invented numbers, no AI.

9. **Suggested choices.** Each choice scene marks one option with a "Suggested for a first run" badge and one plain-language line saying why. Suggestions aim for the clearest, most representative run, never the biggest numbers. They come from one small pure function over conditions held as data (like item 8), with no suggestion hardcoded in components. The suggestion never pre-selects or auto-advances; the reader always clicks. In customer view the locked customer scene shows no badge.

### Conditional script (for review as a table)

Condition kinds: **obs** = Slice 5 observation fired for the customer; **fact** = Fact present / value null; **data** = plain word derived from existing data (no number).

| Scene · beat | Slot | Condition | Line triggered | Fallback (nothing fires) |
|---|---|---|---|---|
| 1 Customer · explain | A | data: customer's largest site by garments in circulation (name only) | KAM: "The biggest of your sites is {largestSite}, so that is where this year weighs most." | KAM: "I will look at the account as a whole." |
| 1 · explain | B | obs `obs_repair_spike` | Ops: "Repairs rose above the site's own trend at {spikeSites}; I would like that explained." | Ops: "Nothing in our repair data stands out against each site's own trend." |
| 1 · meaning | C | obs `obs_over_allocation` | KAM: "At {overSites} more garments are allocated than were scanned last month." | KAM: "No site had more garments allocated than scanned last month." |
| 1 · meaning | D | fact `cost_of_unused_allocation` value null (T001 unset) | KAM: the cost of unused allocation needs input from Lindström (the rental fee per piece), because without it we cannot say what idle garments cost. | KAM: "Idle garments cost {{fact:cost_of_unused_allocation}}." |
| 2 Baseline · explain | E | obs `obs_replacements_postponed` | Ops: "Repairs kept garments in use, so how we are compared matters." | Ops: "So the answer depends on who we are compared with." |
| 2 · meaning | F | data: chosen laundry has zero delivery (home washing) | KAM: delivery alone looks worse than that comparison, so read delivery with the net CO2e saved. | KAM: states saving direction against the named comparison. |
| 3 Sensitivity · explain | G | fact: spread T002 unset (range null) | KAM: the estimate range needs input from Lindström; until then only the Standard estimate is shown. | KAM: "The team declared a range of {{fact:t002}} around the pack's factors." (token id confirmed at apply) |
| 3 · meaning | H | lever: Cautious / Standard / Generous | One line per level, same labels as the buttons, "the team's declared estimate range, not a measurement". | none: exactly one level always applies |
| 4 Priority · explain | I | obs `obs_dormant_critical` | KAM: "One thing deserves raising first: garments at {dormantSites} sat unused for a long time." | KAM: "No garments reached the longest unused tier, so nothing here is urgent." |
| 4 · meaning | J | obs `obs_repair_spike` or `obs_over_allocation` fired | KAM: ties the leading chapter to the flagged sites. | KAM: restates the leading chapter only. |

### Suggestion rules (same review table, one per choice scene)

| Scene | Suggested option | Rule (condition as data) | Why line (plain language) |
|---|---|---|---|
| 1 Customer | Customer with the most Slice 5 observations fired | count of fired observations per customer, highest wins; tie → lowest `customer_id` | "This account has the most to discuss, so the story has the most to say." |
| 2 Comparison laundry | The data pack's default baseline (`DEFAULT_BASELINE_ID`, local laundry) | fixed rule: the default | "The headline savings figure uses this comparison." |
| 3 Estimate | Standard estimate | fixed rule: base | "These are the factors exactly as given in the data pack." |
| 4 Priority | Chapter with the most fired observations attached for this customer | count of fired observations per chapter, highest wins; tie → default chapter order; none fired → first chapter in default order | "This is where your year had the most going on. Pick what matters most to you." |

Rules: exactly one suggested option per scene for every customer; scene 1 has none in customer view; no option is pre-selected or auto-advanced.

## Capabilities

### New Capabilities
- none

### Modified Capabilities
- `story-choices-game`: baseline-aware card headers, guided and data-conditioned script, suggested choices, Start over, "Read the full report" links, game layout.
- `app-shell`: Story link target and active state, pickers hidden on `/story/game`, sidebar default and space-taking behaviour.
- `baseline-sensitivity`: one display label map (Cautious / Standard / Generous) used on every surface.

## Decisions from review

- Shifting `?beat=` is accepted.
- Largest site = most garments in circulation.
- The three non-Fact conditions (largest site, zero-delivery laundry, sensitivity level) stay as named plain-data conditions.
- The sidebar uses the route default until the user toggles it, then the user's choice wins.
- Stage width at 1280px with the sidebar open is measured at apply and reported; if too narrow, apply the fallback: narrower card column first, then the path strip under the cards.
- The T002 token id for slot G is confirmed at apply.

## Decisions (continued)

- **Priority suggestion = R2:** the chapter with the most fired observations attached; ties to default chapter order; when no observation fires, the first chapter in default order. The why line frames it as where the year had the most going on, not as a problem.

## Impact

`src/lib/story/game.ts`, `src/app/story/game/*`, `src/components/{app-shell,character-stage,dialogue-box,...}.tsx`, story text and print cover, `docs/design.md`, `docs/conventions.md`, tests. New ADR for conditional dialogue as data. No engine numbers change; no engine API change beyond nothing.

**Out of scope:** dashboard refactor, Impact World, AI features, mobile.
