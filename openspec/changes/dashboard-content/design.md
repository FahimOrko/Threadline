## Context

See proposal.md for the chart tables and the engine additions. Current state after `dashboard-refactor`: six section pages, each a server component that calls the engine and renders `FactStatCard`s. There is no chart library. `docs/design.md` sets the language: calm data, hairlines, no shadows, one teal accent, Geist and Geist Mono (`.num`), Phosphor icons only, 8px panels. `ProvenanceChip` has a full and a glyph-only compact variant. The engine already holds the totals the new series need: `totalsFor` in `footprint.ts` (per laundry-month), monthly repairs inside `repairSpikeSignal`, monthly service-activity rows behind `latestRows`.

## Goals / Non-Goals

**Goals:** charts that each answer one question; engine series that are plain aggregations; a chip that stays visible at a glance on every card; a visual language that is distinct without effects.

**Non-Goals:** new modelling, pipeline changes (no monthly on-time or dormant data), motion and glow, mobile layout, any change to ADR 0004.

## Decisions

1. **shadcn chart over Recharts 3.8.0.** The shadcn registry answered on retry (`@shadcn/chart`: dependencies `cn`, `recharts@3.8.0`, `lucide-react`). Verify the peer range against React 19.3 in task 2.1 before installing. The item lists `lucide-react`; the project uses Phosphor only, so the installed `chart.tsx` is edited to use no Lucide import and `lucide-react` is not added. If Recharts rejects React 19.3, the ADR records it and the fallback is plain SVG for the five simple shapes (sparkline, bullet, hatched bar, heatmap, paired bar), which need no axes library. Alternative considered: hand-written SVG for everything. It repeats axes, tooltips and ticks, so the library is kept for line and bar charts.
2. **Visual language as tokens, not styles per chart.** New tokens in `globals.css` with light and dark values and contrast pairs in `scripts/check-contrast.ts`: `--chart-subject` (teal, from the accent), `--chart-comparison` (neutral), `--chart-uncertain` (amber, from `--uncertain`), `--chart-grid` (hairline), and five heatmap steps built as tints of the subject token. Series identity is by direct label, plus dash for estimated and hatch for needs-input. A shared `ChartFrame` renders title (the question), unit, caption, Show math and the text alternative so no chart can omit them.
3. **Components** (each in `/design` and `docs/design.md`): `ChartFrame`, `ThreadLine` (line and sparkline), `BulletBars`, `PairedBars` (comparison versus service), `Waterfall`, `Donut` (two or three slices), `Heatmap` (CSS grid on tokens, not Recharts, because the library has none), `HatchedBar` (SVG pattern for needs-input). Charts are client components fed by server pages via props; the engine is not imported client-side.
4. **No arithmetic in components.** The rule covers values, bands, bucket levels, waterfall starts and ends. Drawing scales (axis range, pixel mapping) are rendering. The engine therefore returns waterfall `start` and `end`, the heatmap `level`, the repair band's `threshold` and the monthly series. Ordering rows (lowest first) is sorting, not computing, and is allowed.
5. **Engine additions** in `src/lib/engine`: a new `series.ts` for `monthlySeries` and `monthlySeriesBySite` reusing the filters of the Fact builders (`inScope`, period); `repairBand` in `signals.ts`, refactoring the existing spike loop so `repairSpikeSignal` and `repairBand` share one function and cannot disagree; `footprintComparison` in `footprint.ts` reusing `totalsFor`. The heatmap `level` is a quintile of the customer's matrix, chosen by the engine, documented in the series' formula text. Each returns provenance in the same shape as a Fact so Show math works unchanged.
6. **Provenance chip.** A new `label` variant of `ProvenanceChip`: method glyph plus short word ("Measured", "Calculated", "Allocated", "Estimated", "Illustrative", "Edited"), then a source mark (glyph only, with an accessible name and tooltip). One chip per card. With several methods it shows the least certain method's word and "+N", reusing `chipTone`. The existing full and compact variants stay for the site table and elsewhere. The page legend is one line from a shared `ChipLegend` component. This keeps ADR 0004 as is: the label is on every card. The brief says "method and source stay visible at a glance"; reading it as method in words and source as a mark, to avoid a second word group on every card. Accepted at review.
7. **Overview tiles.** A `KpiTile` composes `FactStatCard`'s pieces (label, value, chip, Show math) with a `ThreadLine` sparkline and a `PairedBars` strip. Plain-language lines are fixed template text beside the intro templates; any number in them is a `{{fact:id}}` token.
8. **Comparison naming.** The brief's "selected comparison laundry" is the baseline the user already picks. Labels say "comparison" with the chosen name (for example "vs Home washing"), and the Cautious / Standard / Generous estimate labels stay. Dashboard copy does not say "baseline factor".
9. **Costs placeholder.** `HatchedBar` is drawn when the Fact's value is null, labelled "Needs input", with the assumption id in Show math. It never plots 0.
10. **Cleanup.** Remove or keep `FactStatCard`'s old full chip only where a table needs it (site table).

## Risks / Trade-offs

- [Recharts 3.8.0 may not support React 19.3] → check peers first (task 2.1); fall back to SVG components and record it in the ADR.
- [Chart code in the client bundle] → load charts only in section pages, pass plain rows as props, no engine import in client files.
- [Quintile levels are a presentation choice inside the engine] → documented in the series formula; changing the rule is an engine change with a test.
- [Waterfall readers may misread a positive delivery step] → the step is labelled in words ("adds emissions") and the caption repeats the delivery honesty note already in the footprint Facts.
- [Sparklines on four tiles only] → the other two tiles state nothing invented; the legend and tile line say why in plain words ("no monthly figure").
- [Six tiles with a chip each is still dense] → the chip is one line, the tile has one meaning line, and Show math holds the rest. Tiles share one height and layout; where there is no sparkline, a context line takes its slot.

## Open Questions

None that change the specs or tasks. The chip reading in decision 6 and the equal-height tiles were accepted at review.
