# Tasks

## 1. Engine: T011, tree Facts, icon scale

- [ ] 1.1 Add optional `source` to `TeamAssumption`, add T011 (0.060 tCO2e per tree, EPA, ILLUSTRATIVE) to `assumptions-config.ts`, and make `teamAssumptionInputs` list the source; verify `tests/team-assumptions.test.ts` covers T011 and passes
- [ ] 1.2 Write `src/lib/engine/equivalences.ts` (`treeFacts`, ladder, 300 cap, round-up, saved = comparison - service, negative and null cases) and export it from `index.ts`; verify new Vitest tests (agreement with footprint, cap, ladder, icons add up, negative, null) pass
- [ ] 1.3 Add `tree_factor`, `trees_comparison`, `trees_service`, `trees_saved`, `tree_icon_scale` to `storyFacts` or a world facts helper so the page loads them with the same call as the dashboard; verify a test lists them with ILLUSTRATIVE and PUBLIC_REFERENCE
- [ ] 1.4 Write ADR 0031 (world foundation: route, `?zone=`, equal hub, registry, replaces `/impact`) and ADR 0032 (public-reference factors refine 0016), and add both to `docs/adr/README.md`; verify the index lists them

## 2. Registry, wording, navigation

- [ ] 2.1 Create `src/lib/world.ts` (`ZONES`, `resolveZone`, hub headline Fact ids, `worldHref`) with tests; verify unknown zone falls back with a rejected value
- [ ] 2.2 Add `zone:*` and illustration wording to `src/lib/explain.ts` and extend `tests/explainers.test.ts` and `tests/on-screen-wording.test.ts` to the new files; verify no banned word or stray digit
- [ ] 2.3 Point the nav row to `/world`, delete `src/app/impact/`, collapse the AI sidebar by default on `/world` in `app-shell.tsx`; update `tests/nav.test.ts` and `tests/app-shell.test.tsx`; verify both pass and `/world` is active in both views

## 3. Components

- [ ] 3.1 Extract `ScenarioControls` from `scenario-strip.tsx` and build `WorldHeader` (Story header surface, customer, period, controls); verify the dashboard strip renders unchanged (existing tests) and the header test passes
- [ ] 3.2 Build `ZoneLayout` (explanation with Show math and "i", stage, card slot, "All zones"), reusing `FigurePanel`, `InfoPopover`, `ShowMathPopover`; verify a component test for slots and back link keeping params
- [ ] 3.3 Build `WorldHub` (SVG wedges, HTML labels, coming-soon state, needs-input state, centre label, grow-in and ring motion under no-preference only); verify tests for six equal wedges, a link on Trees only, coming-soon text, and params kept
- [ ] 3.4 Build `TreesStage` (custom SVG tree symbol, sky, hills, ground, deterministic layout, cap, legend, Illustration badge, Replay, negative-saving state, CSS timeline in `globals.css`); verify tests for icon count at most 300, legend text, end-state class, no `Math.random`
- [ ] 3.5 Build `CompanyPicker` for the customer view; verify a test for the question, three buttons and "Change company"

## 4. Page, game and report

- [ ] 4.1 Build `src/app/world/page.tsx` and its view (Suspense, customer handling, header, hub or zone, notices, Trees card with ring and one small bar, text from the registry); verify `/world` renders in KAM and customer views through a page test
- [ ] 4.2 Add the opening explanation lines to `SCENES[0].intro` and `CUSTOMER_VIEW_INTRO`; verify `tests/story-game.test.ts` (no digit, no banned word) passes
- [ ] 4.3 Set `IMPACT_WORLD_HREF = "/world"`, render the primary "See your impact on the world" button in the ending, fix `END_LINES.actions`; verify `tests/game-components.test.tsx` checks the link keeps `view` and unknown params
- [ ] 4.4 Change the data-sources note in `closing.ts`; verify `tests/story-closing.test.ts` and `tests/story-export.test.ts` read the new sentence

## 5. Design gallery and docs

- [ ] 5.1 Add hub, zone layout and trees stage (all states) to `/design` with labelled sample data under `src/app/design/_sample/`; verify `npm run check:design-imports` passes
- [ ] 5.2 Update `docs/design.md` component table and effects list, and add the world conventions to `docs/conventions.md`; verify the text matches the components and mentions no product-spec edit

## 6. Integration

- [ ] 6.1 Run `npm test`, `npm run lint`, `npm run build` and `npm run check:contrast`; verify all pass
- [ ] 6.2 After the user has approved and the change is applied, check in the browser at 1230px and 1280px, dark and light, KAM and customer view, with reduced motion on and off; verify the hub, Trees zone, picker, back link, ending button and story intro look and behave as specified, and record what was not checked
