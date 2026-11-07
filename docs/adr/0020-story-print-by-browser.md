# 0020. Story prints by the browser at /story/print

- Status: accepted
- Date: 2026-11-07
- Supersedes: none

## Context

The Story must leave the app as a clean A4 document with numbers and provenance on paper. ADR 0019 already puts the selection in the URL so a print route reproduces the same story.

## Decision

- PDF is produced by the browser: a `/story/print` route (`STORY_PRINT_PATH` in `src/lib/story/print.ts`), print CSS (`@page` A4, a page break before each chapter after the cover) and a "Print / Save as PDF" button calling `window.print()`. No auto-print, no server Chromium, no client PDF library.
- The route renders the same `StoryDocument` as `/story` with `mode="print"`: cover block (customer, priorities, baseline, sensitivity, period, generation date), no picker, light theme through `.print-scope`.
- Show math prints expanded inline next to each figure through `ShowMathInlineProvider`; the popover remains the screen pattern. An appendix was rejected: it needs figure numbering and a collector that duplicates the card-to-math mapping.
- `AppShell` (a client component) returns children bare when `usePathname()` equals the print path. Route groups would be cleaner but move every page; revisit if more bare routes appear.
- The generation date is read per request after `searchParams`, in a fixed locale and zone; it is a document stamp, not an engine value.

## Consequences

No new dependency. Output depends on the browser's print engine (Chromium with background graphics is the reference). The PDF is longer because Show math is inline. A server-side PDF can later wrap this same route.
