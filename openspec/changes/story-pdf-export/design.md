# Design

## Context

- `src/app/story/page.tsx` holds all chapter JSX (cover, one chapter per `buildStory` entry, methodology, data readiness) inside `StoryContent`. `buildStory`, `resolveLine`, `storyFacts` and `closing.ts` already live in `src/lib/story/`; the rendering does not.
- The root layout wraps every route in `AppShell` (header, nav, AI sidebar) and `ThemeProvider` (next-themes, `.dark` class on `<html>`).
- `ShowMathPopover` is a client popover used by `FactStatCard`, `ObservationCard` and the readiness list. `Notice screenOnly` already emits `data-print="hide"` and `print:hidden`; `StoryChapter` already has `break-inside-avoid`.
- ADRs 0014, 0017, 0019 put selection in the URL; 0016 makes unset assumptions "Needs input". Next.js 16: read the matching docs in `node_modules/next/dist/docs/` before writing route, `searchParams` or metadata code (AGENTS.md).

## Goals / Non-Goals

**Goals:**
- One rendering of the story shared by screen and print; the only differences are layout switches.
- No new numbers; everything displayed stays an engine Fact with provenance.

**Non-Goals:**
- Server-generated PDF files, page numbers or running headers beyond what the browser provides, a table of contents, any change to chapter text.

## Decisions

1. **Extract the story body into a shared server component** (`src/app/story/_story-document.tsx`, taking resolved `searchParams` and `mode: "screen" | "print"`). `/story` renders it in `screen` mode (picker, h1 as today); the print route renders `print` mode (print cover, no picker). *Alternative:* copy the JSX into the print page: rejected, duplicates chapter logic and text.
2. **Print by browser (A1, pending user choice).** Print route plus `@page { size: A4 }`, `break-before: page` per chapter, and a client `PrintButton` calling `window.print()`. No auto-print (popup blockers, and the reader may want to review first). *Alternatives:* server Chromium (size, cold start, timeouts on Vercel) and client PDF libraries (second renderer). See proposal A.
3. **Route `/story/print` (B, pending).** It sits under `/story` so the header link stays active and params carry.
4. **Shell bypass in `AppShell`.** It already is a client component; return `children` bare when `usePathname()` starts with `/story/print`. *Alternative:* route groups `(app)` and `(print)` with two layouts, which cleanly separates but moves every existing page; rejected as too large for the deadline. The pathname check is one line and is noted as a `shortcut:` comment.
5. **Forced light theme via a print scope**, a wrapper class that re-declares the light tokens (shared with `:root` through one token block, not a copy), so the dark `.dark` class on `<html>` has no effect inside it. *Alternative:* nested next-themes `forcedTheme`: it only applies at the provider and would require a second provider. To verify during apply: the scope covers portals (none are used when Show math is inline).
6. **Inline Show math through React context** (`ShowMathInlineProvider`, client). `ShowMathPopover` reads it and renders `ShowMathBody` in place in a bordered block, keeping the thread line. No prop changes in `FactStatCard`, `ObservationCard` or the readiness list. *Alternative:* an `inline` prop threaded through three components: more diff, same result.
7. **Inline per chapter (C, pending).** Appendix would need a collector and numbering.
8. **Cover block** is a print-mode cover in the shared component: customer, priorities (`PRIORITY_LABEL`), baseline short name, sensitivity, `formatPeriod(PERIOD)`, and generation date. The date is formatted at render with `Intl.DateTimeFormat` in a fixed locale and timezone; it is a document stamp, not a computed metric, so it is not an engine value, and is labelled "Generated".
9. **Export PDF link** is a plain `<a target="_blank" rel="noopener">` built with the existing `siteHref`-style param helper from the resolved selection, adding `priorities` only when picks exist. It is server-rendered, no client JS.
10. **Print hiding** reuses `data-print="hide"` plus `print:hidden`; the print route also hides the print button the same way.

## Risks / Trade-offs

- [Output depends on the browser's print engine] → Specify Chromium "Save as PDF" with background graphics on; document in the runbook; keep colours readable without backgrounds (badges already use words, not colour alone).
- [Inline Show math makes the PDF long] → Compact spacing in print scope; accept, and revisit appendix (C) if too long.
- [`break-inside-avoid` on large chapters can leave big gaps or overflow] → Apply to cards, table rows and observations rather than whole chapters in print; chapters get `break-before: page` only.
- [Shell bypass by pathname is brittle] → One constant for the print path shared by the route and the check; covered by a test.
- [Dev overlays or `AppShell` hydration flash of the header] → The check runs on `usePathname`, which is available during SSR for this route; verify no flash in a production build.

## Migration Plan

Additive. `/story` behavior is unchanged apart from the Export PDF link and the extraction. Rollback: remove the print route and link; revert the extraction.

## Open Questions

- Decisions A, B and C in the proposal need the user's answer before apply (recommended: A1, `/story/print`, inline per chapter). The artifacts are written for these recommendations.
