# Proposal

## Why

The report leaves the app as a PDF made by browser print (ADR 0020). That PDF cannot be read by a reader's own AI tool, drags a print-only layout through the whole codebase (a route, inline Show math, a light scope, page-break rules), and is a poor fit for a report whose value is traceable figures. A data export carries the same figures, provenance and Show math as plain files a person or a tool can read, and costs far less to keep.

## What Changes

- **BREAKING** Remove `/story/print` and everything that exists only for it: the page, `PrintButton`, `STORY_PRINT_PATH`, the `AppShell` bare-route branch, `ShowMathInlineProvider`, the `asTable` and `open` print props, the `screenOnly` print hooks, `.print-scope` and the `@media print` rules (including "detail tables print open"), and their tests. ADR 0030 supersedes ADR 0020; the ADR index is updated.
- Add an **export card** at the end of the report (`id="export"`). Plain wording: this is the data behind your report, to read or to give to your own AI tool. Two downloads: Markdown (`.md`) and JSON (`.json`).
- Replace "Export PDF" in the report header (scenario-strip styling) with an **Export** control that scrolls to the card.
- Both files are built from one **export model** that reads engine Facts only: customer, period, comparison, estimate level, the two priorities; every figure (label, value, unit, status, source, Show math inputs); team assumptions with T ids (unset = "Needs input" in `.md`, `null` in `.json`); data-readiness summary, findings and known data gaps; open questions for Lindström. The `.md` uses display rounding; the `.json` has full precision plus the rounded display value.
- Both files open with a note that the data is synthetic and the export is not audit-ready sustainability reporting.
- Files are built in the browser and downloaded; no API route, no database. KAM and customer view can both download. File names carry customer and period.
- **Open questions for Lindström** leave the on-screen report; they appear only in the export.
- Report wording: the raw cross-check label ("service_cycles.out-of-order scans ...") is reworded in plain language at its source in the engine; the Fact id is unchanged and the raw id stays in Show math. The data-pack assumptions table keeps the pack's text as data; decided: option A (verbatim cells plus one plain note above the table that avoids the banned word).

## Capabilities

### New Capabilities
- `story-export`: the export card, the single export model, the Markdown and JSON files, their contents, notices, wording and file names.

### Modified Capabilities
- `story-player`: removes the print route, print layout, inline Show math, cover block and Export PDF requirements; Story header and its strip-styled variant get an Export control; open questions leave the on-screen data-readiness chapter; plain label for the cross-check finding.
- `app-shell`: drops the print route from header, sidebar and Story-group rules.
- `story-choices-game`: the ending's "Open PDF version" button and the link rules that name the print route.
- `dashboard-navigation`: "report and print links" wording.
- `design-system`: removes the inline-Show-math and light-print-scope requirements; adds the ExportCard component.

## Impact

- Code: `src/app/story/print/`, `src/components/print-button.tsx`, `src/lib/story/print.ts`, `src/components/{app-shell,show-math,collapsible,notice,chart-frame,co2e-comparison-chart,story-header}.tsx`, `src/app/globals.css`, `src/app/story/_story-document.tsx`, `src/lib/engine/readiness.ts`; new `src/lib/story/export.ts` and `src/components/export-card.tsx`; `/design` gallery.
- Tests removed or cut: `story-print`, print cases in `app-shell`, `notice`, `nav`, `story-game`. New: export model and wording tests.
- Docs: ADR 0030 (supersedes 0020), ADR index, `docs/design.md`, `docs/conventions.md`.
- **Two touches the scope said to avoid, needed because they point at the deleted route** (confirmed at review): the game ending's "Open PDF version" button (`_game-view.tsx`), repointed to `/story#export` as "Download the data" with all current params including `?view=` kept, and the dead `/story/print` active-path case in the sidebar/nav tests. Both are removals or repoints only; no behavior of the game or sidebar otherwise changes.
- No new dependency. Desktop only.
