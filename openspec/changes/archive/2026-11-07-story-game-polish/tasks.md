# Tasks

Read first: `docs/conventions.md`, `docs/adr/README.md` (0017, 0019, 0021), `docs/design.md`, `openspec/specs/story-choices-game`, `story-player`, `app-shell`, and the Next.js guides in `node_modules/next/dist/docs/` for `usePathname` and layouts.

## 1. Shared label map and nav

- [x] 1.1 Add `SENSITIVITY_LABEL` and descriptions in `src/lib/selection.ts`; use it in the header picker, `optionsFor`, recap, path strip, story text and print cover. Verify: `tests/story-game.test.ts` asserts every surface renders the map's labels and URL values stay low/base/high.
- [x] 1.2 Story link to `/story/game`, active on `/story*` in `app-shell.tsx`. Verify: test for target and active state on `/story`, `/story/game`, `/story/print`.
- [x] 1.3 Hide the three pickers on `/story/game`. Verify: test absent there, present on `/dashboard`.

## 2. Consequence card

- [x] 2.1 Neutral row labels for Facts that carry `baseline`; Before/After headers name each column's resolved baseline. Verify: test in the baseline scene (local laundry vs home washing) and a non-baseline scene; no baseline name in any row label.

## 3. Navigation inside the game

- [x] 3.1 "Start over" link via `gameHref`; shown after the first beat and on the ending. Verify: test clears levers, scene, beat; keeps `view` and unknown params; customer view keeps the customer.
- [x] 3.2 "Read the full report" link on the first beat and the ending using `exitHref`. Verify: test params preserved.

## 4. Script

- [x] 4.1 Add `explain`/`meaning` beats, `Slot` and `Condition` data, and `pickLine` in `game.ts`, with the ten slots in the proposal table. Verify: unit test per slot: condition present picks its line, absent picks the fallback.
- [x] 4.2 Rewrite templates: full comparison names, units, Cautious/Standard/Generous labels, "declared estimate range, not a measurement", needs-input explanation. Verify: extend the digit-scan test to conditional lines and fallbacks; add the forbidden-words test (baseline, sensitivity, Fact).
- [x] 4.3 Build the script for every customer in the data pack. Verify: test asserts no empty beat for every customer.

## 4b. Suggestions

- [x] 4.4 Add suggestion rules as data and a pure `suggest` in `game.ts`; `optionsFor` flags the suggested option; show the "Suggested for a first run" Badge and why line; none in customer view scene 1; nothing pre-selected or auto-advanced. Verify: tests for exactly one suggestion per scene for every customer, deterministic customer pick with lowest-id tie-break that changes when observation counts change, no suggestion in customer view scene 1, and no option pre-selected.
- [x] 4.5 Implement the priority rule R2: most fired observations attached to a chapter, ties to default chapter order, first chapter when none fire; why line framed as where the year had the most going on. Verify: unit tests for different counts, a tie, none fired, and that the suggestion changes when observation counts change.

## 5. Layout and sidebar

- [x] 5.1 Two-column full-width layout, own scroll area for cards and path strip, remove the empty band in the stage and the card's fixed max height. Use the design-taste skill and shadcn MCP within `docs/design.md` tokens. Verify: browser check at 1280px, light and dark.
- [x] 5.2 Sidebar as a flow sibling (takes space, card column keeps width), collapsed by default on `/story/game`, route default until the user toggles. Verify: test collapsed on `/story/game` only and open elsewhere; browser check at 1280px with it open, and report the stage width; if too narrow, narrower card column first, then path strip under the cards.

## 6. Docs and checks

- [x] 6.0 Confirm the T002 token id for slot G against the existing Show math token before wiring the line.

- [x] 6.1 Add ADR 0022 and its README row; update `docs/design.md`, `/design` for any new reusable component, and `docs/conventions.md` (label map, script slots). Verify: `npm run check:design-imports`.
- [x] 6.2 Run `npm test`, `npm run lint`, `npx tsc --noEmit`, `openspec validate story-game-polish`. Do not commit.

## 7. Review fixes (second pass)

- [x] 7.1 Stage scales to fit with `meet` and a fixed-aspect, max-height box; no cropping. Verify: measured at 1230, 1280, 1440 and 1536px, sidebar open and closed, dark and light: both figures' heads, left and right edges inside the stage in all 16 cases.
- [x] 7.2 "Play the review" link on the Story cover with all params preserved. Verify: `tests/story-print.test.tsx` (params kept, bare path, absent in print).
- [x] 7.3 Start over beside the title on every beat, disabled on the first beat; "Read the full report" joins it on the first beat. Verify: `startOverState` tests (first beat disabled, later beats and ending enabled, lever set enables, locked customer not a choice).
- [x] 7.4 Side column height equals the stage column, top and bottom, with inner scroll. Verify: measured top and height deltas of 0 in the 16 cases.
- [x] 7.5 Find and fix the dev overlay issue. Verify: dev log shows no `/story/print` error after the fix; `connection()` mocked in the print tests.
- [x] 7.6 Run tests, lint, tsc, `check:contrast`, `check:design-imports`, `npm run build`, `openspec validate story-game-polish`.

## 8. Review fixes (third pass)

- [x] 8.1 "Read the full report" in the header: disabled with the hint until the ending, active on the ending with all params kept. Verify: `reportLinkState` tests and header render tests (disabled and hint before the ending; link, params and no hint on the ending).
- [x] 8.2 Panel alignment: one grid, panel spanning stage and dialogue rows, panel box fills the height, path strip on top, cards scroll inside. Verify: screenshots and measured tops and bottoms at 1230 and 1280px, sidebar open and closed, dark and light (panel top equals stage top, panel bottom equals dialogue bottom, all 8 cases).
- [x] 8.3 Run tests, lint, tsc, `check:contrast`, `check:design-imports`, `npm run build`, `openspec validate story-game-polish`.
