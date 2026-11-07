# Proposal

## Why

The story report at `/story` does not look like the dashboard. Chapters are a paragraph over a flat grid of `FactStatCard`s, the top has three stacked controls, the text column (65ch) and the card grid (full width) do not line up, and the text breaks the dashboard's own rules: "Critical dormant garments", "Cost of unused allocation: Needs input.", "baseline", T ids and duplicate net CO2e cards. The dashboard patterns (ADR 0027 panels, ADR 0028 "i" explainers) already exist, so the report should reuse them.

## What Changes

- Each chapter is one hero figure (`FigurePanel`), at most one chart reused from the dashboard, and 2 to 3 supporting figures. Every figure keeps chip and Show math, and gets an "i" from the registry where the label is not obvious.
- Chart per chapter, all from engine outputs the dashboard already calls (nothing computed in the page):
  - Water and carbon: net CO2e comparison (`footprintComparison`).
  - Euros: avoided purchases by month (`monthlySeries`).
  - Circularity: textile waste by treatment (`footprintComparison.composition.waste`).
  - Service: service requests by month (`monthlySeries`).
  - Your year in numbers, Where we see risk: no chart (risk keeps its observation cards).
- **Flagged, not built:** no monthly series exists for on-time cycle rate (`SERIES_MEASURES` has no such measure), so the Service hero has no trend chart of its own. Service requests by month is the substitute. A monthly on-time series would be a separate engine change.
- Story chapter lines become registry-style templates (`{ text, ifMissing }`) rendered by the dashboard's `renderTemplate`, so an unset value never reads mid-sentence ("The cost of unused garments can be shown once Lindström provides a rental fee."). A card still reads "Needs input" with its plain hint.
- Banned-word list (`BANNED_ON_SCREEN`) now covers the story's text: "Critical dormant garments" becomes plain wording, "baseline" becomes "comparison", T ids leave visible sentences. T ids stay only in the collapsed team-assumption table.
- Methodology chapter: remove the duplicate CO2e saved cards; keep a short always-visible summary (comparison caveat, estimate range, rounding, sources). Team assumptions (plain-language labels, T ids kept) and data-pack assumptions go in collapsibles.
- Data readiness chapter: always-visible summary and findings; per-source rows in a collapsible, collapsed to one line ("No invalid or unmapped rows in any source") plus any source with a real count. Known gaps and open questions for Lindström stay visible.
- One header area replaces the stacked controls: title, "Play the review", "Export PDF" and the two-priority picker, laid out as one block.
- Text column and card grid share one width and one grid.
- `/story/print` keeps working on the same builder; collapsibles render expanded in print. Its redesign is a later change. Story game, sidebar and `src/proxy.ts` are untouched.
- Desktop only. New reusable pieces (story header, collapsible) go in `/design` and `docs/design.md`.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `story-player`: chapter layout, header controls, methodology and data-readiness presentation, unset-value wording, print-safe rule (collapsibles on screen, expanded in print), Play-the-review placement.
- `explainers`: registry gains story keys; the plain-wording and no-"Needs input"-in-a-sentence rules extend to the story.

## Impact

- Code: `src/app/story/_story-document.tsx`, `src/components/story-chapter.tsx`, `src/components/priority-picker.tsx`, `src/lib/story/index.ts` and `closing.ts`, `src/lib/explain.ts`, new small header and collapsible components, `/design` gallery, `docs/design.md`.
- Tests: `tests/story.test.ts` (the "Needs input" sentence assertion changes), `story-closing`, `story-print`, `explainers`, `on-screen-wording` (add story files).
- No engine, data, dependency or ADR-superseding change. ADR 0028 applies as written; a short new ADR is only needed if the T-id rule in the design is rejected.
- Risks: Recharts in the print route (see design); acceptance is a manual browser check at 1230px and 1280px, light and dark, after apply.
