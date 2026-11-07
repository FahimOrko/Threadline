# Tasks

## 1. Priorities and selection

- [x] 1.1 Add `resolvePriorities` and `storyHref` beside `selection.ts`, with Vitest cases in `tests/selection.test.ts` (none, valid two, duplicate, unknown, more than two, repeated param). Verify: `npm test` passes.
- [x] 1.2 Write ADR 0019 (priorities in the URL, priority to chapter map, view switcher carries `priorities`), add its row to `docs/adr/README.md`, add the `?priorities=` line to `docs/conventions.md`. Verify: files updated, no existing ADR edited.

## 2. Engine and data

- [x] 2.1 Expose the data-quality report to server components next to `generatedSource`, validating its shape and throwing a message naming the file when it is missing or unreadable. Verify: a test loads it and finds the 1,107 out-of-order cross-check; a test that an absent or malformed report throws.
- [x] 2.2 Add `dataReadinessFacts(report)` to `src/lib/engine` returning Facts (rows read, invalid rows, cross-check disagreements) with provenance. Verify: Vitest cases for a source with zero invalid rows and the out-of-order finding.

## 3. Story builder

- [x] 3.1 Add `src/lib/story` with the chapter list, priority to chapter map, token syntax and resolver (`{{fact:id}}`, null becomes "Needs input", unknown token throws). Verify: Vitest cases for ordering with each of the six priorities, two picks on one chapter, and no picks.
- [x] 3.2 Add the methodology chapter content (sources, T001 to T010 set versus unset, A001 to A008, illustrative baseline caveat, sensitivity framing from T002, rounding note) and the data-readiness chapter content (report Facts, unset assumptions, data gaps, open questions for Lindström). The open questions are washing_pct meaning, rental fee, CO2-per-tree illustration, route km and the baseline process factor. Verify: a test that T001 renders "Needs input", that all five questions appear and that no chapter text contains a digit outside tokens.
- [x] 3.3 Test that story Facts equal the dashboard Facts for the same customer, baseline and sensitivity. Verify: `npm test` passes.

## 4. Page and components

- [x] 4.1 Add `StoryChapter` and `PriorityPicker` components, following `docs/design.md`; add both to `/design` and the component table. Verify: `/design` shows them and `npm run check:design-imports` passes.
- [x] 4.2 Build `src/app/story/page.tsx`: await `searchParams`, resolve customer, baseline, sensitivity and priorities, show fallback notices, render cover, chapters in personalised order, then methodology and data readiness, all expanded. The unknown-priority notice carries a print-hide marker. Verify: open `/story` for each customer, for `?priorities=cost,hygiene` and `?priorities=water,emissions` (one chapter, two badges); order and labels match the spec; a test that the notice has the marker.
- [x] 4.3 Make `ViewLinks` in `src/components/app-shell.tsx` carry `priorities` when present (`ParamSelect` already preserves all params). Verify: tests in `tests/app-shell.test.tsx` that switching view keeps `?priorities=`, and that changing any `ParamSelect` keeps `priorities` and an unrelated param.
- [x] 4.4 Verify the print-safe rule: no hidden or interaction-gated chapter text. Verify: load with scripts disabled and see every chapter; `npm run lint`, `npm test`, `npm run build` pass; light and dark contrast check passes.
