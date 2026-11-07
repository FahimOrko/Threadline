# Tasks

## 1. Text and registry

- [ ] 1.1 Convert `StoryChapter.lines` to `Template` in `src/lib/story/index.ts` (euros uses the dashboard Costs sentence with `ifMissing`); render with `renderTemplate`. Update the `tests/story.test.ts` "Needs input" test to expect the missing-case sentence; run `npx vitest run tests/story.test.ts`.
- [ ] 1.2 Rewrite story wording in `index.ts` and `closing.ts` (risk intro, "baseline" to "comparison", drop "(T001)" from open questions); add a plain `label` per T id to `assumptionRows()`. Add story files to `tests/on-screen-wording.test.ts` and confirm it passes.
- [ ] 1.3 Add missing registry keys in `src/lib/explain.ts` (`chart:waste-treatment`, `chart:requests-trend`, `panel:risk-observations`, `panel:story-methodology`, `panel:story-readiness`, readiness finding Facts); extend `tests/explainers.test.ts` coverage to the story keys and confirm it passes.

## 2. Chapter model and components

- [ ] 2.1 Reshape chapters to hero, optional chart key, 2 to 3 cards (water and carbon hero is CO2e, or water when only water is picked); update `tests/story.test.ts` order and lead tests and run them.
- [ ] 2.2 Add `Collapsible` (native `details`, `open` prop) and `StoryHeader` (title, customer and period, Play the review, Export PDF, picker); add both to `/design` and `docs/design.md`; verify the design gallery renders and the component tests pass.
- [ ] 2.3 Rebuild `src/app/story/_story-document.tsx` with `FigurePanel`, the four reused dashboard charts (co2e comparison, avoided purchases by month, waste treatment, service requests by month) and `explain()` on every non-obvious figure; one shared container and grid; verify `npx tsc --noEmit` and `npx vitest run` pass.

## 3. Methodology and data readiness

- [ ] 3.1 Methodology: remove the duplicate CO2e cards, keep the visible summary, move team and data-pack assumption tables into collapsibles; verify with a render test that no CO2e saved card is present and the tables are in collapsed sections.
- [ ] 3.2 Data readiness: one summary line for sources with no findings, named sources with counts otherwise, per-source rows and "still needs input" in a collapsible, findings, gaps and open questions visible; add a test for the none-found and one-source-found cases.
- [ ] 3.3 Print route: pass `open` so collapsibles print expanded, confirm the header is absent and charts degrade to their table; update `tests/story-print.test.tsx` and verify it passes.

## 4. Integration

- [ ] 4.1 Run `npx vitest run`, `npx tsc --noEmit` and lint; all green.
- [ ] 4.2 After the user approves the proposal and the change is applied, browser-check `/story` and `/story/print` at 1230px and 1280px, dark and light (alignment, header, collapsibles, "i" popovers, no banned words).

## Workflow follow-up

- Do not commit; the user reviews first.
- Archive the change after review (`/opsx:archive`).
