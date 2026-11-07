# Tasks

Before coding: read `docs/conventions.md`, `docs/adr/README.md`, `docs/design.md`, and the Next.js docs in `node_modules/next/dist/docs/` for route, `searchParams` and print-related behavior.

## 1. Share the story body

- [x] 1.1 Move `StoryContent` and `cardGrid` out of `src/app/story/page.tsx` into `src/app/story/_story-document.tsx` with a `mode: "screen" | "print"` prop; `/story` renders `screen`. Verify: `npm run build` and `/story` renders identically (spot-check three params combinations against the previous output).
- [x] 1.2 Add the print cover (customer, priorities in order or "none chosen", baseline, sensitivity, period, generation date) and skip the picker in `print` mode. Verify: Vitest or component test for cover content with `priorities=cost,hygiene` and with none.

## 2. Print route and shell bypass

- [x] 2.1 Add `src/app/story/print/page.tsx` rendering the shared document in `print` mode, with the print path as one shared constant. Verify: opening it with `?customer=&baseline=&sensitivity=&priorities=` shows the same chapters and numbers as `/story` (compare in browser).
- [x] 2.2 Make `AppShell` return children bare on the print path, with a `shortcut:` comment. Verify: no header, nav, sidebar or role toggle on the print route; `/story` still has them; test for the path check.
- [x] 2.3 Add a client `PrintButton` ("Print / Save as PDF", `window.print()`, `data-print="hide"` and `print:hidden`). Verify: click opens the print dialog; no auto-print on load.

## 3. Export action

- [x] 3.1 Add the "Export PDF" link on `/story` carrying customer, baseline, sensitivity and priorities (priorities only when picked), opening in a new tab. Verify: with `?priorities=water,cost&sensitivity=low` the href carries both; without picks it omits `priorities`. Hidden when printing `/story`.

## 4. Print layout

- [x] 4.1 Add the light print scope (token block shared with `:root`) and `@page` A4 in `src/app/globals.css`. Verify: with the app theme set to dark, the print route renders light; run the existing contrast script for the light tokens.
- [x] 4.2 Page breaks: `break-before: page` per chapter after the cover; `break-inside-avoid` on cards, table rows and observations. Verify: print preview in Chromium shows chapters starting on new pages and no card cut in half (cover, euros, risk, methodology, data readiness checked).
- [x] 4.3 Confirm `data-print="hide"` elements are hidden in print and methodology and readiness text prints in full. Verify: `?priorities=nope` shows the notice on screen and not in print preview.

## 5. Inline Show math

- [x] 5.1 Add `ShowMathInlineProvider` (client) and make `ShowMathPopover` render `ShowMathBody` inline when it is active; wrap the print route in it. Verify: popover unchanged on `/dashboard` and `/story`; every figure on the print route shows formula, inputs, assumption IDs, baseline, range; a null-value Fact shows "Needs input" with its math.

## 6. Docs and decisions

- [x] 6.1 Add the inline Show math mode, print scope and PrintButton to `/design` and `docs/design.md` in this change. Verify: items appear on `/design` and in the component table.
- [x] 6.2 Append ADR 0020 (print by browser, route path, Show math placement) and add it to `docs/adr/README.md`. Verify: index row present; no existing ADR edited.
- [x] 6.3 Run `npm run lint`, `npm run test`, `npm run build` and export one real PDF from the print route; check page count and that provenance is legible. Verify: all pass and the PDF opens with A4 pages.

## Workflow follow-up

- After review of the proposal, `/opsx:apply`, then archive to merge the deltas into `story-player` and `design-system`.
