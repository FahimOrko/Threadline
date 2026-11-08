# Tasks

## 1. Decide and record

- [x] 1.1 Write `docs/adr/0030-story-data-export.md` (supersedes 0020; check 0030 is free, else the next number) and update `docs/adr/README.md` (new row, 0020 marked superseded). Verify the index links resolve and the ADR follows the template.

## 2. Remove the print path

- [x] 2.1 Delete `src/app/story/print/`, `src/components/print-button.tsx`, `src/lib/story/print.ts`, and the `STORY_PRINT_PATH` use in `app-shell.tsx`, `_story-document.tsx`, `_game-view.tsx`, and the dead `/story/print` case in `nav.ts` comments. Verify `grep -rn "story/print\|STORY_PRINT_PATH\|PrintButton" src tests` is empty.
- [x] 2.2 Remove `ShowMathInlineProvider`, the `asTable` props (`ChartFrame`, `Co2eComparisonChart`), the `open` print use of `Collapsible`, `Notice screenOnly`, every `data-print` and `print:` class, `.print-scope`, `@page` and `@media print` in `globals.css`. Verify `grep -rn "print" src` shows no print-only code and `npm run build` passes.
- [x] 2.3 Delete `tests/story-print.test.tsx`, the print cases in `tests/app-shell.test.tsx`, `tests/notice.test.tsx`, `tests/nav.test.ts` and `tests/story-game.test.ts`. Verify `npm test` passes.
- [x] 2.4 Repoint the game ending's "Open PDF version" to `/story#export` labelled "Download the data", keeping all current params including `?view=`, and drop `ChoiceButton`'s `newTab`. Verify the game test for ending links passes with params preserved.

## 3. Export model and files

- [x] 3.1 Add `src/lib/story/export.ts`: `buildExport`, `toMarkdown`, `toJson`, `exportFileName`, from Facts and closing data only. Verify with Vitest (`tests/story-export.test.ts`): every figure of the report is in the model; unset assumptions are `null` in JSON and "Needs input" in the `.md`; JSON holds full precision plus display; the note is first in both files; the `.md` template text has no digit and no banned word; file names carry customer and period; one customer with two priorities lists them in order.
- [x] 3.2 Make the cross-check label plain in `src/lib/engine/readiness.ts` (keep the Fact id, put the raw id in Show math). Verify `tests/readiness-facts.test.ts` asserts the id is unchanged and the label has no `.` or `(`.

## 4. Report UI

- [x] 4.1 Add `src/components/export-card.tsx` (client download buttons, theme tokens only) and render it last in `StoryDocument` with `id="export"`. Verify a component test: both buttons exist, plain wording passes the banned list and digit scan.
- [x] 4.2 Replace "Export PDF" in `StoryHeader` actions with an `<a href="#export">` Export control in the strip styling; remove the open-questions section from the data-readiness chapter; add the one plain note to the data-pack table (option A, decided: pack text verbatim, note avoids the banned word). Verify a test that the rendered report has no open-question text and `tests/story-closing.test.ts` still passes.
- [x] 4.3 Add the export card to `/design` (remove the print sections) and to `docs/design.md` (remove `ShowMathInlineProvider`, `PrintButton`, `.print-scope`, print notes on `Notice`, `Collapsible`, `Co2eComparisonChart`); add the export convention to `docs/conventions.md`. Verify `npm run check:design-imports` and the design page render.

## 5. Integration check

- [x] 5.1 Run `npm test`, `npm run lint`, `npm run build`, and `openspec validate story-export --strict`.
- [x] 5.2 After the change is applied and approved: in the browser at 1230px and 1280px, dark and light, KAM and customer view, for one customer with two priorities set, download both files and confirm their content matches the report on screen; also confirm the game ending's "Download the data" lands on the export card in customer view.

## Workflow follow-up

- Do not commit; archive after review.
