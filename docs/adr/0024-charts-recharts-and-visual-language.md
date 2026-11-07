# 0024. Charts on Recharts, one visual language, values only from the engine

- Status: accepted
- Date: 2026-11-07
- Supersedes: none

## Context

The dashboard sections are grids of cards. A KAM asks questions (is it improving, where is it uneven) that a number alone does not answer, so each section leads with a chart. The project has no chart library, and ADR 0005 says no number is computed outside the engine.

## Decision

- Charts use the shadcn `chart` item over `recharts@3.8.0`, after checking its peer range against React 19.3. The item's `lucide-react` import is removed; icons stay Phosphor. If Recharts rejects React 19.3, the simple shapes (sparkline, bullet, hatched bar, heatmap, paired bar) are plain SVG and this ADR is amended by a new one.
- One visual language, as tokens in `globals.css` with light and dark values and contrast pairs: subject (teal), comparison (neutral), uncertain (amber), grid (hairline) and five heatmap steps. Lines are one thin stroke with an end node; estimated or illustrative series are dashed; a value that needs input is a hatched bar, never zero; marks are identified by label, dash or hatch as well as colour; no legends, direct labels; a flat 12% tint is the only fill.
- Charts plot only engine Facts and engine series (monthly series with window totals and trend, site by month matrix, repair band, footprint comparison). A component never sums, subtracts, averages or buckets a plotted or labelled value; slicing a series to a range, sorting rows and scale mapping are rendering.
- Every chart has a question as its title, a unit, a caption with Show math, and a hidden table plus a one-sentence summary as its text alternative.
- The Sites table is the existing `SiteTable` extended with header sort and a name filter. `@tanstack/react-table`, `@dnd-kit/*` and `@tabler/icons-react` (dashboard-01's dependencies) are not added.

## Consequences

- One new runtime dependency, `recharts`, loaded in section pages only; charts are client components fed plain rows by server pages.
- The engine gains aggregation functions with tests; the chart code stays free of arithmetic.
- Changing the colour or dash rules is a new ADR.
