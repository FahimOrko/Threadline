## 1. Docs first
- [x] 1.1 Write ADR 0033 "Game progress is kept in sessionStorage" (refines 0014 and 0021, address stays the source of truth) and add its row to `docs/adr/README.md`
- [x] 1.2 Add the "Copy voice" section and a sessionStorage line to `docs/conventions.md`; update the game and Impact World conventions lines (gate, `ended=1`, no "trees saved")

## 2. Engine
- [x] 2.1 Add the `washed_kg` Fact in `src/lib/engine/footprint.ts` from the rows already summed; null with the footprint, never 0
- [x] 2.2 In `src/lib/engine/equivalences.ts` relabel `trees_saved` ("Young trees equal to the emissions avoided"), unit "young trees", new formula text; keep the id
- [x] 2.3 Vitest: `washed_kg` matches the footprint input, null case; tree labels contain no "saved"; negative difference; update `tests/tree-facts.test.ts` and export tests

## 3. Progress persistence
- [x] 3.1 `src/lib/story/progress.ts`: key, read, write, clear, mark-ended, all in try/catch, validated shape
- [x] 3.2 Vitest `tests/story-progress.test.ts`: round trip, bare-address-only restore rule, corrupt value, throwing storage, clear
- [x] 3.3 Client `GameProgress` on `/story/game`: restore by `router.replace` on a bare address, save on each address change, mark ended on `scene=end`
- [x] 3.4 Replace the Start over link in `_game-header.tsx` with a client control that clears progress then navigates (same look, same disabled rule)

## 4. World gate
- [x] 4.1 `useReviewEnded(view, customer)` hook (`useSyncExternalStore`, unknown until read)
- [x] 4.2 `WorldGate` wrapper in `src/app/world`: KAM passes through; customer view shows skeleton, locked panel (reuse `REPORT_HINT` style, link to the game) or content; `ended=1` bypasses and records
- [x] 4.3 Ending button: add `ended=1` via `exitHref` for `IMPACT_WORLD_HREF`
- [x] 4.4 Sidebar: locked Impact World item in the customer view (`Lock`, `aria-disabled`, description, collapsed tooltip); `nav.ts` gets the `gate` flag; update `tests/nav.test.ts` and `tests/app-shell.test.tsx`
- [x] 4.5 Component tests for the gate (locked, unlocked, KAM, `ended=1`, storage throwing)

## 5. Trees framing
- [x] 5.1 Replace "trees saved" in `world.ts`, `explain.ts` (`zone:trees`, `text:trees-saving`), `_world-view.tsx`, `trees-stage.tsx` (accessible name, legend), `closing.ts` note, `/design` sample data and page, `docs/design.md`
- [x] 5.2 Zone headline "The emissions you avoided equal what {{fact:trees_saved}} absorb in 10 years." with the honest "needs more" variant and needs-input variant
- [x] 5.3 `HowWeGotHere` component (three steps, Fact tokens, chip and Show math each, negative case, CSS-only motion off under reduced motion); place it in the zone layout; add to `/design` and `docs/design.md`
- [x] 5.4 Vitest: no "trees saved" in labels, `EXPLAIN` or rendered world components; strip renders three steps, extra case, unset factor

## 6. Copy
- [x] 6.1 Replace the first slide in `SCENES[0].intro[0]` and `CUSTOMER_VIEW_INTRO[0]` with the user's text verbatim; test both
- [x] 6.2 Apply the ten reviewed rewrites from the proposal
- [x] 6.3 Rewrite the rest of the game script (`SCENES`, `END_LINES`, suggestions' "why", card labels) to the Copy voice rules
- [x] 6.4 Rewrite the report chapter lines, panel titles, `closing.ts` text and `EXPORT_TEXT` the same way; adjust export snapshots
- [x] 6.5 Run the digit, banned-word and on-screen scans; fix any hit

## 7. Specs, checks and browser
- [x] 7.1 `npm test`, `npm run lint`, `npm run build`, `npm run check:design-imports`, contrast script
- [x] 7.2 Browser check at 1230px and 1280px, light and dark, KAM and customer view: hub in dark at 1280px, KAM view in dark, reduced motion on the trees stage, game intro and ending, locked World in the customer view, progress surviving a trip to `/world` and back plus a refresh, and a skim of the story and report for the new copy
- [x] 7.3 Fix findings; do not commit
