## Context

Pages are server components that resolve Facts; `FigurePanel`, `InlineStat`, `ChartFrame` and `Heatmap` render them. Intro text already uses `resolveLine` over `{{fact:id}}` tokens (ADR 0005, `src/lib/dashboard.ts`). Observations live in `src/lib/engine/observations.ts` with plain strings and no digits. `footprintComparison` returns a waterfall, `composition` and `netSaving`; `monthlySeriesBySite` returns cells with a level only; `repairBand` already flags spike months; `wasteSplit` returns a total and a recycled-or-reused amount. The recycling breakdown was dropped in the previous change.

## Goals / Non-Goals

**Goals:** self-explaining figures with the math kept apart; a CO2e chart and heatmap whose visual meaning needs no legend lesson; plain signals wording; every number still from the engine.

**Non-Goals:** a new theme or colour, new motion, changes to Show math content, the story game, the AI sidebar, `docs/product-spec.md`.

## Decisions

1. **Registry in `src/lib/explain.ts`** (`EXPLAIN: Record<string, string>`), keyed by Fact id or `chart:`/`panel:` id, resolved by the existing `resolveLine` with the comparison word as `{comparison}`. Resolution happens on the server page; the client `InfoPopover` receives a finished string. Alternative considered: text next to each component. Rejected: the user wants one place for review and tests.
2. **Placement.** `FigurePanel` shows the hero's "i" in its header row (top-right, beside the trend badge); `InlineStat` shows its own at the right of its label row; `ChartFrame` takes `explain` for the title row. The panel and the frame look the key up; a missing key renders no "i", and a coverage test lists the keys that must exist, so an obvious figure stays clean while a listed one cannot be forgotten.
3. **`InfoPopover`** on the existing `Popover` (hover and focus open, click pins; Escape closes), Phosphor `Info`, name "What does this mean?". Distinct from the Show math trigger (text link) so the two read as different things.
4. **CO2e chart.** Engine: remove `waterfall` and `WaterfallStep`; add `comparisonDelivery`; add Fact `comparison_footprint` (G1). Component `ComparisonBars` in `charts-simple.tsx`: one bar, one stacked bar (process, delivery with direct labels) and a bracket labelled "Net saving" showing `netSaving`. Sentence template in the page, tokens only. `Waterfall` is deleted from components, `/design` and `docs/design.md`.
5. **Heatmap.** Engine `monthlySeriesBySite` marks `highlight` per cell (utilization below `overAllocationCutoffPercent`, repairs from `repairBand`) and `highlighted` per row; the page sorts rows by that count. The five-step level colours go; cells are neutral, highlighted ones use a single token plus a mark (dot) so colour is not the only signal. Legend text is a template with words from engine values (G4). Titles per measure. A new token needs light and dark values and a contrast pair (conventions); prefer the existing `--uncertain` amber only if the meaning is still "uncertain"; otherwise add `--flag`.
6. **Observation wording** stays in the engine file (fixed, digit-free, already tested). `names()` leaves the sentences; `ObservationCard` already lists links. Severity labels come from a map; value type skips the badge.
7. **Needs-input hint** from a map `T-id -> plain phrase` in `explain.ts` with a generic fallback; `fact-stat-card`, `figure-panel` use it. The id stays in Show math (already there).
8. **Recycling.** Extend `wasteSplit` to return four allocated parts (G2) and show them with the existing `PartBar` under the recycling hero.
9. **Flaky test.** Reproduce under `npm test` in full; check whether the first render of `AppShell` (base-ui, jsdom) is the slow step. If a cheap cause shows (for example a heavy static import in the test), fix it; otherwise raise this test's timeout with a comment saying it renders the whole shell and starves under parallel suites.
10. **Docs.** ADR 0028 records the explainer pattern (supersedes nothing; extends 0004 and 0005); index row; `docs/design.md` rows for InfoPopover and ComparisonBars and removal of Waterfall; `docs/conventions.md` gains a rule: explanation text lives in the registry, digits only as tokens, banned words tested.

## Risks / Trade-offs

- A "highlight" colour needs contrast in both themes at 1230px and 1280px; verified with `check:contrast` and screenshots.
- Plain wording loses precision (for example, "far above what is normal"): precision stays one click away in Show math.
- Hover popovers are awkward on touch; click pins them, so touch still works.
- Removing `waterfall` breaks any consumer of that field: the only consumer is the footprint page and `/design`.
- Heatmap "when" (every month) and the "over-allocated sites" count (December only) can differ (G5); the legend and titles name the difference.
