# Design

## Context

The report is `StoryDocument` (`src/app/story/_story-document.tsx`), a server component that resolves customer, baseline, sensitivity and priorities from the URL and builds Facts with `storyFacts`, `dataReadinessFacts`, `assumptionRows` and the closing text in `src/lib/story/closing.ts`. The print route renders the same component with `mode="print"`. Show math content comes from `factShowMath`. The dashboard's banned list is `BANNED_ON_SCREEN` in `src/lib/explain.ts`. See proposal.md for motivation.

## Goals / Non-Goals

**Goals:** one pure export model; two serializers; a client-side download; the whole print path deleted.

**Non-Goals:** no API route, database or PDF library; no new engine numbers; no change to the game or sidebar beyond the two touches named in the proposal; no mobile layout.

## Decisions

1. **One model, two serializers, in `src/lib/story/export.ts`.** `buildExport(input)` takes the same Facts the page already built (cards of every chapter in `buildStory`, observation facts, the chart series Facts, readiness Facts), `assumptionRows()`, the closing text and the selection, and returns plain data. `toMarkdown(model)` and `toJson(model)` are pure. Each figure holds `id`, `label`, `value` (full precision or null), `display` (from `factText`), `unit`, `status` (methods, confidence), `source`, and `showMath` (the `factShowMath` fields). Alternative: serialize the rendered DOM; rejected, it would repeat the rounding and be brittle.
2. **The server builds the two strings; a small client component only downloads.** `StoryDocument` passes `{ md, json, fileBase }` to `ExportCard` (client), which makes a `Blob` and an `<a download>`. The browser never computes a figure. Payload is the report's Fact set, a few hundred KB at most. Alternative: build in the browser from Facts props; rejected, it ships the model code and Fact objects to the client for no benefit.
3. **JSON shape.** `{ note, customer, period {from,to}, comparison, estimate, priorities[], figures[], assumptions[], readiness {summary, findings[], gaps[]}, openQuestions[] }`. Unset values are `null`, never a number. The `.md` prints "Needs input" for the same cases.
4. **Banned words and digits.** The ban applies to the `.md` template text (headings, notes, labels). Engine formulas, Show math inputs and T ids are quoted data and exempt; T ids appear in the assumptions list and in "Assumptions used". The Show math "baseline" key is written "Comparison" in the template. The test scans the template constants (not rendered output) with `BANNED_ON_SCREEN` minus nothing, and a digit scan over the same strings; ids come from data, not the template.
5. **File names.** `<customer-slug>-<from>-to-<to>-value-review.<ext>`, e.g. `northstar-2025-01-to-2025-12-value-review.md`. The slug is lower-case letters and digits with hyphens.
6. **Export control.** A plain `<a href="#export">` styled as the header's outline button; the card has `id="export"` and `scroll-mt`. Smooth scroll only under `prefers-reduced-motion: no-preference` via CSS `scroll-behavior`. No JS, no param change.
7. **Open questions.** `OPEN_QUESTIONS` stays the single source in `closing.ts`; the chapter's section is deleted; the export reads it.
8. **Cross-check label.** `dataReadinessFacts` maps the check id to a plain label (e.g. "Scans out of order") via a small lookup next to the Fact, falling back to "Data check". The Fact id `crosscheck_<key>_<i>` and the raw id (as a Show math input, `note: true`) are kept. A test fails on a label containing `.` or `(`.
9. **Data-pack assumptions and "baseline"** (decision for review). The table must keep the pack's own text as data. Options:
   - **A (recommended)** Leave cell text verbatim and add one plain note above the table: the wording is the data pack's own; where it speaks of a starting or default comparison it means the comparison chosen at the top of the report. The note avoids the banned word itself.
   - **B** A footnote marker only on rows that contain the word, with the same note under the table.
   - **C** A "Data pack wording" column header and the note, no per-row marks.
   - **D** Replace the word with "comparison" in display. Rejected: it edits the pack's data.
   The wording test keeps scanning story prose only, not the pack data rows.
10. **Print removal is a deletion list**, not a feature flag: route, `PrintButton`, `STORY_PRINT_PATH`, the `AppShell` pathname branch, `ShowMathInlineProvider`, `asTable` and the `open` props, `Notice screenOnly`, `data-print`, `.print-scope`, `@page` and `@media print`, `break-inside-avoid` print comments, the `/design` print sections, and `docs/design.md` rows. `Co2eComparisonChart` and `ChartFrame` keep working without `asTable`.
11. **Game ending (needs the user's confirmation).** "Open PDF version" would point at a deleted route. Default: repoint it to `/story#export` labelled "Download the data" and drop the now-unused `newTab` prop of `ChoiceButton`. Alternative: remove the button. Both touch the game's ending only.
12. **Dead nav case.** `/story/print` in `tests/nav.test.ts` and `src/lib/nav.ts`/`app-sidebar` comments is removed; the sidebar's behavior does not change.

## Risks / Trade-offs

- The `.md` includes engine formulas and Show math text that may contain words from the banned list → quoted data is exempt and labelled as such; the test covers template text only.
- Large inline payload to the client → measure once; if over about 1 MB, build on click through a server action (not an API route).
- Removing a route that a bookmark may hit → `/story/print` returns the app's not-found page; acceptable for a hackathon prototype.
- ADR 0020 stays accepted-as-written and is marked superseded only in the index.

## Open Questions

- Option A, B or C for the data-pack "baseline" wording (recommended A).
- Game ending: repoint (default) or remove the button.
