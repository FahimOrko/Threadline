# Proposal

## Why

The story-player spec promises a story that is "ready to print", but today a reader who prints `/story` gets the app shell, header pickers, dark theme, popover-only Show math and cards split across pages. A KAM needs a clean A4 document of the same story for a customer meeting, with the numbers and provenance visible on paper.

## What Changes

- New print route that renders the same story as `/story` (same `buildStory`, `resolveLine`, `storyFacts`, closing text) from the same params: `?customer=`, `?baseline=`, `?sensitivity=`, `?priorities=`.
- The story body now lives in one shared server component used by both `/story` and the print route, so no chapter logic or text is duplicated. Today it is inline in `src/app/story/page.tsx`.
- "Export PDF" action on `/story` that opens the print route in a new tab with the current (validated) params.
- Print route has no app shell, no header pickers, no AI sidebar, light theme forced, A4 page size, a page break before each chapter, and avoids splitting a card across pages.
- Elements marked `data-print="hide"` (the dropped-priorities notice) do not print. Chapter text, methodology and data readiness always print in full.
- Show math renders expanded inline on the print route (formula, inputs, assumption IDs, baseline, range), not as a popover.
- Cover block: customer name, chosen priorities, baseline, sensitivity, period, generation date.

Out of scope: choices game, dashboard refactor, AI features, mobile layout.

## Open choices (need the user's decision before apply)

### A. How the PDF is produced

| Option | What | Pros | Cons |
|---|---|---|---|
| **A1. Browser print (recommended)** | Print route + print CSS + a "Print / Save as PDF" button calling `window.print()` | No dependency, no server cost, no Vercel limits, works with the existing dev/build, smallest diff, fastest to ship | The reader picks "Save as PDF" in the print dialog; output depends on the browser (Chromium best); no file generated server-side, so no direct download link |
| A2. Server-side Chromium | Route handler returns `application/pdf` using `puppeteer-core` + `@sparticuz/chromium` | One-click download, identical output everywhere | Large binary near Vercel's 250 MB function limit, cold starts of several seconds, memory and timeout tuning on the free tier, new dependencies, hard to debug close to the deadline |
| A3. Client-side library | `html2pdf.js` / `@react-pdf/renderer` | Download without a dialog | Rasterised or re-implemented layout (duplicates chapter rendering, breaks "no duplicated chapter logic"), text not selectable or a second renderer to maintain |

Recommendation: A1. The print route is the same document either way, so A2 can be added later as a thin wrapper that screenshots the route.

### B. Route path for the print view

| Option | Notes |
|---|---|
| **`/story/print` (recommended)** | Nested under Story, so the header "Story" link stays active and params carry as usual |
| `/print/story` | Groups future print views, but adds a top-level segment for one page |
| `/story?print=1` | No new route, but the page must branch on a flag and the root layout still renders the shell |

### C. Where Show math prints

| Option | Notes |
|---|---|
| **Inline per chapter (recommended)** | The assumptions and sources sit next to the figure they explain, as the scope states. Longer document (about one extra block per card) |
| Appendix at the end | Shorter chapters, but needs figure-to-appendix numbering and a new collection step, i.e. extra code that duplicates the card-to-math mapping |

## Capabilities

### New Capabilities
<!-- none -->

### Modified Capabilities
- `story-player`: adds the print route, its params, the Export PDF action, the print layout and cover block.
- `design-system`: adds the inline (expanded) Show math mode and the print-scope light theme.

## Impact

- `src/app/story/page.tsx`: body extracted into a shared server component (behavior unchanged); gains the Export PDF link.
- New `src/app/story/print/page.tsx` (path per decision B), plus a small client component for the print button.
- `src/components/app-shell.tsx`: renders children bare on the print route (the root layout wraps every page in AppShell).
- `src/components/show-math.tsx`: inline mode. `fact-stat-card.tsx`, `observation-card.tsx` and the readiness list pick it up without prop changes.
- `src/app/globals.css`: `@page` A4 and print rules.
- `docs/design.md`, `/design` page: new reusable pieces documented in the same change.
- New ADR (print by browser, print route in the URL scheme), appended after the user picks A and B.
- No engine changes, so no new numbers and no new engine tests. No new dependencies under A1.
