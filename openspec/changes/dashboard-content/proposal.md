## Why

After `dashboard-refactor` (Part A) gives the dashboard sections and a KAM-only shell, each section is still a grid of cards. A KAM asks questions ("is it improving, where is it uneven, what do I raise first") that a number alone does not answer. This change makes each section lead with a chart that answers one such question, and makes every card lighter to read without hiding where a value comes from.

**Depends on `dashboard-refactor`.** Apply and archive it first: this change builds on its routes, sidebar and section intros. Nothing here is applied until the user reviews it.

## What Changes

- Add shadcn charts (a Recharts wrapper) and a small set of distinctive chart components on theme tokens. Calm, flat, no glow and no motion (docs/design.md: effects belong to Story and Impact World).
- Engine additions, aggregations of existing data only, no new modelling, each with Vitest tests:
  - **G1** a monthly series for the measures that already sum monthly rows, a per-site by month matrix, and the monthly repair band the spike rule already uses.
  - **G3** a footprint comparison: comparison versus service per metric, the CO₂e waterfall steps, and the composition parts for the donuts.
- Overview shows six headline KPIs, each with one plain-language line, a sparkline where monthly data exists, and a thin comparison bar where a pair exists. All six tiles have the same height and layout; a tile without a sparkline shows a short context line in that slot (accepted at review).
- Each section gets charts chosen by the question a KAM would ask (tables below), with a text alternative and reachable provenance.
- Provenance: every card shows one compact chip with the method (icon plus short word) and a small source mark (reading accepted at review), Show math on every card, and a one-line legend per page. ADR 0004 stands; no amendment.
- Costs draws an unset assumption ("Needs input") as a hatched placeholder bar, never as zero.
- An ADR records the chart dependency, the visual language and the data-only-from-engine rule.

## Design Read

Reading this as: a data workspace for one KAM at a time, with a calm, quiet language, on the existing token system (teal accent, Geist and Geist Mono, 8px panels, hairlines, no shadows). Dials: variance 3, motion 1, density 5. The distinct part is a shared chart language, not decoration:

- **The thread.** Lines are one thin teal stroke with small nodes, echoing the thread line on Show math. A series built on an estimated or illustrative method is drawn dashed, so certainty is visible in the chart as it is on the chip.
- **Direct labels, no legends.** Values and names sit at the mark. Gridlines are hairlines in `--border`. All numbers are Geist Mono with tabular figures.
- **One accent.** Teal for the subject (Lindström), neutral muted for the comparison, amber only where a value is uncertain. No gradients, no fills beyond a 12% tint, no filled progress tracks, one radius scale.
- **Words, not colour alone.** Every mark is also identified by a label, dash or hatch.

## Charts per section (for review)

All values come from engine Facts or the new G1 and G3 outputs. "Exists" means an engine function that exists today. Recommendation is the first row of each section; the rest is the fallback if a gap is declined.

| Section | Question the chart answers | Chart | Data source | If the gap is declined |
|---|---|---|---|---|
| **Overview** (recommended) | How is each headline figure moving, and how does it compare with the alternative? | Six KPI tiles. Each: value and one plain line, a sparkline of its monthly values (thread line, end node), and a thin comparison bar (Lindström against the selected comparison laundry, two thin bars on one shared scale, no track). Sparklines for water saved, CO₂e saved, avoided cost and utilization. Comparison bars for water and CO₂e. Utilization shows a tick at the over-allocation cut-off instead. On-time rate and critical dormant sites show the value only: their data has no month, and nothing is invented. | G1 monthly series, G3 comparison, the six Facts | Without G1: tiles without sparklines. Without G3: tiles without comparison bars. |
| Overview, alternative | Same | Six plain cards | Facts only | |
| **Garments and utilization** (recommended) | Which sites have too many garments sitting unused, against the line we treat as over-allocated? | Bullet chart per site: a thin bar for the site's utilization, a tick at the over-allocation cut-off, a shaded band under the cut-off. Sorted lowest first. | `garmentUtilization` per site (exists), cut-off from the team assumptions config (exists) | n/a, data exists |
| | Which products need the most repair? | Bar: repair rate by product, labelled with the value | `repairRateByProduct` (exists) | n/a |
| | Is repair load rising or falling? | Thread line, monthly repairs | G1 | Dropped |
| **Costs** (recommended) | Where does unused allocation cost money, and what is still unknown? | Bar per site for cost of unused allocation. A site whose value is unset shows a hatched placeholder bar labelled "Needs input", never a bar of zero. | `costOfUnusedAllocation` per site (exists; null when the rental fee assumption is unset) | n/a |
| | Where were purchases avoided? | Bar per site, avoided purchase cost; dashed outline because the method is estimated | `avoidedPurchaseCost` per site (exists) | n/a |
| | When were purchases avoided? | Thread line, monthly avoided cost (dashed, estimated) | G1 | Dropped |
| **Environmental footprint** (recommended) | Why is the net CO₂e saving what it is? | Waterfall: comparison laundry emissions, minus process savings, plus delivery, to the service's total, with the net saving labelled. Makes the delivery honesty note visible: delivery can add emissions while the total still falls. | G3 waterfall steps (start and end per step) | Dropped; the saved cards stay |
| | How do water, energy and CO₂e compare? | Paired thin bars per metric, comparison against Lindström, with the saved percentage labelled | G3 | The six saved cards only |
| | How much of the service's CO₂e is delivery? | Donut, two slices (process, delivery) | G3 composition | Dropped |
| | How much textile waste is recycled or reused? | Donut, two slices (recycled or reused, other) | G3 composition | Dropped |
| **Signals** (recommended) | Is a site's repair trend heading for a spike, and when did it cross the line? | Thread line of monthly repairs per flagged site, the spike threshold drawn as a band (mean to threshold), spike months marked with a node and a word label | G1 monthly repair band, `repairSpikeSignal` sites (exists) | Spike months only, from `repairSpikeSignal` (exists) |
| | Which sites have been dormant longest? | Stacked bar per site, gaps by tier (watch, risk, critical) | `dormantSignal` sites (exists) | n/a |
| | Then the ObservationCards, each linking to its site | | | |
| **Sites** (recommended) | Which site-months stand out? | Heatmap grid, sites by month, five steps in the teal tint scale, with a metric toggle (utilization or repairs). Each cell carries its value in the text alternative and a tooltip. Steps come from the engine. | G1 site by month matrix | Ranked bar of the four site-table columns (exists: `operationalSiteRows`) |
| | Then the site table | | `operationalSiteRows` (exists) | |
| Site page | How does this site sit against the customer? | Paired bars site versus customer; thread line, monthly repairs | `siteComparison` (exists), G1 | Bars only |

Every chart has: a title that states the question in plain words, a unit, a one-line caption with a Show math control for its series, and a text alternative (a visually hidden table of the plotted values plus a one-sentence summary).

## Engine additions (decided: add both)

Aggregations of data the engine already reads; no new modelling.

| # | Export | Returns | Test |
|---|---|---|---|
| G1 | `monthlySeries(data, scope, measure, ...)` for repairs, service requests, avoided purchase cost, water saved, energy saved, CO₂e saved and garment utilization | `{ label, unit, methods, source, points: [{ month, value }] }` | The points of each flow measure sum to the matching Fact. The December point of utilization equals the Fact. |
| G1 | `monthlySeriesBySite(data, scope, measure)` for utilization and repairs | rows of `{ siteId, siteName, cells: [{ month, value, level }] }`, `level` 0 to 4 as the engine's quintile of the customer's matrix | Cells for one site equal `monthlySeries` with that site's scope. |
| G1 | `repairBand(data, scope)` | per flagged site, `{ month, repairs, mean, threshold, spike }` from the same T008 to T010 rule `repairSpikeSignal` applies | The `spike` months equal the months `repairSpikeSignal` reports. |
| G3 | `footprintComparison(data, scope, baseline, sensitivity)` | per metric `{ comparison, service, unit }`; CO₂e waterfall steps `[{ label, start, end, kind }]`; composition parts for process versus delivery and recycled versus other | Comparison minus service equals the saved Fact for each sensitivity. The last waterfall step's end equals the service total. |

On-time rate and dormant sites have no month in the build-time aggregates, so no monthly series exists for them. Adding one would be a pipeline change, which is out of scope.

## Capabilities

### New Capabilities
- `dashboard-charts`: chart rules and per-section chart behaviour, text alternatives, the hatched needs-input bar.
- `dashboard-overview`: the six headline KPIs with sparkline and comparison bar.

### Modified Capabilities
- `kpi-engine`: monthly series, site by month matrix, repair band, footprint comparison (ADDED requirements).
- `provenance-display`: the Fact stat card carries one compact method chip and the page legend (ADR 0004 unchanged).

## Impact

- Code: new chart components in `src/components` and `/design`, `docs/design.md`, chart tokens in `src/app/globals.css` with contrast pairs in `scripts/check-contrast.ts`, `src/lib/engine` (new `series.ts`, additions to `footprint.ts` and `signals.ts`, exports), every section page, `fact-stat-card.tsx`, `provenance-chip.tsx`.
- Dependencies: shadcn `chart` adds `recharts@3.8.0` (the registry answered this time; peer range against React 19.3 is checked in task 2.1). The registry also lists `lucide-react` for the item; this project uses Phosphor only, so that import is replaced, not installed.
- Docs: one new ADR (chart dependency, visual language, data-only-from-engine). `docs/conventions.md` gets chart rules.
- Tests: Vitest for G1 and G3, RTL for chart text alternatives and the chip.
- Order: after `dashboard-refactor` is archived, the Overview text in `dashboard-sections` still says three cards. A task here updates it with a MODIFIED delta.

## Out of scope

New modelling or pipeline changes (no monthly on-time or dormant series), story report and PDF, Impact World, AI features, mobile, motion and glow effects.
