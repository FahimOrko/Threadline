# Tasks

## 1. Text and registry

- [x] 1.1 Convert `StoryChapter.lines` to `Template` in `src/lib/story/index.ts` (euros uses the dashboard Costs sentence with `ifMissing`); render with `renderTemplate`. Update the `tests/story.test.ts` "Needs input" test to expect the missing-case sentence; run `npx vitest run tests/story.test.ts`.
- [x] 1.2 Rewrite story wording in `index.ts` and `closing.ts` (risk intro, "baseline" to "comparison", drop "(T001)" from open questions); add a plain `label` per T id to `assumptionRows()`. Add story files to `tests/on-screen-wording.test.ts` and confirm it passes.
- [x] 1.3 Add missing registry keys in `src/lib/explain.ts` following ADR 0028 as the dashboard does (`chart:requests-trend`, readiness finding Facts; none for obvious figures); extend `tests/explainers.test.ts` coverage to the story keys and confirm it passes.

## 2. Chapter model and components

- [x] 2.1 Reshape chapters to hero, optional chart key, 2 to 3 cards (water and carbon: hero net CO2e saved, cards water saved, energy saved, delivery emissions, whatever the picks); update `tests/story.test.ts` order and lead tests and run them.
- [x] 2.2 Add `Collapsible` (native `details`, `open` prop) and `StoryHeader` (title, customer and period, Play the review, Export PDF, picker); add both to `/design` and `docs/design.md`; verify the design gallery renders and the component tests pass.
- [x] 2.3 Rebuild `src/app/story/_story-document.tsx` with `FigurePanel`, the four reused dashboard charts (co2e comparison, avoided purchases by month, waste treatment, service requests by month) and `explain()` on every non-obvious figure; one shared container and grid; verify `npx tsc --noEmit` and `npx vitest run` pass.

## 3. Methodology and data readiness

- [x] 3.1 Methodology: remove the duplicate CO2e cards, keep the visible summary, move team and data-pack assumption tables into collapsibles; verify with a render test that no CO2e saved card is present and the tables are in collapsed sections.
- [x] 3.2 Data readiness: one summary line for sources with no findings, named sources with counts otherwise, per-source rows and "still needs input" in a collapsible, findings, gaps and open questions visible; add a test for the none-found and one-source-found cases.
- [x] 3.3 Print route: pass `open` so collapsibles print expanded, confirm the header is absent and every chart shows as its table fallback; update `tests/story-print.test.tsx` and verify it passes.

## 4. Integration

- [x] 4.1 Run `npx vitest run`, `npx tsc --noEmit` and lint; all green.
- [x] 4.2 browser-check `/story` and `/story/print` at 1230px and 1280px, dark and light (alignment, header, collapsibles, "i" popovers, no banned words); `/story/print` renders without console errors and its charts show as tables.

## Workflow follow-up

- Do not commit; the user reviews first.
- Archive the change after review (`/opsx:archive`).
