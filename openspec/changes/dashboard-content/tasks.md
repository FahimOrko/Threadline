## 1. Preconditions

- [ ] 1.1 Confirm `dashboard-refactor` is applied and archived; read `docs/conventions.md`, `docs/adr/README.md`, `docs/design.md`. Verify: `openspec list` shows no active `dashboard-refactor`; the six section routes exist.
- [ ] 1.2 Update the Overview text in `dashboard-sections` (three cards) to the six-tile Overview with a MODIFIED delta in this change's `specs/`. Verify: `openspec validate dashboard-content` passes.

## 2. Chart foundation

- [ ] 2.1 Check `recharts@3.8.0` peers against React 19.3 (`npm view recharts@3.8.0 peerDependencies`); if they accept it, add the shadcn `chart` item; remove its Lucide import (Phosphor only) and do not add `lucide-react`. Verify: `npm run build` passes and `grep -r lucide src` is empty.
- [ ] 2.2 Add chart tokens (subject, comparison, uncertain, grid, five heatmap steps) with light and dark values and contrast pairs. Verify: `npm run check:contrast` passes with the new pairs.
- [ ] 2.3 Build `ChartFrame`, `ThreadLine`, `BulletBars`, `PairedBars`, `Waterfall`, `Donut`, `Heatmap`, `HatchedBar`. Each: states, a visually hidden table text alternative, no glow, no animation. Add each to `/design` with sample data and to `docs/design.md`. Verify: RTL tests assert the text alternative table matches the props; `npm run check:design-imports` passes; the gallery renders both themes.
- [ ] 2.4 Write the ADR (chart dependency, visual language, data-only-from-engine) and add its README row. Verify: no existing ADR edited; row present.

## 3. Engine additions (Vitest first)

- [ ] 3.1 `monthlySeries` for the seven measures. Verify: tests that flow measures sum to their Facts for CUST001 and one site, and the December utilization point equals the Fact.
- [ ] 3.2 `monthlySeriesBySite` with engine quintile `level`. Verify: tests that a site's cells equal its `monthlySeries`, and levels are 0 to 4 with the max cell at 4.
- [ ] 3.3 `repairBand`, sharing one function with `repairSpikeSignal`. Verify: test that the band's spike months equal the signal's for every site of CUST001; the existing signal tests still pass.
- [ ] 3.4 `footprintComparison` with waterfall steps and composition parts. Verify: tests for all three sensitivity levels and two baselines: comparison minus service equals each saved Fact; the last step's end equals the service total.
- [ ] 3.5 Export from `src/lib/engine/index.ts`. Verify: `npm test` and `npm run lint` pass.

## 4. Provenance chip

- [ ] 4.1 Add the `label` variant to `ProvenanceChip` and the `ChipLegend` line; use it in `FactStatCard`. Verify: RTL tests: word and glyph show, source mark has an accessible name, several methods show the least certain word and "+N", null value keeps chip and Show math.
- [ ] 4.2 Add one legend line per section page. Verify: each page shows exactly one legend and no card repeats it.

## 5. Sections

- [ ] 5.1 Overview: six `KpiTile`s with plain lines, sparklines (water, CO₂e, avoided cost, utilization), comparison bars (water, CO₂e) and the cut-off tick (utilization); none for on-time and dormant, which show a context line in the sparkline slot so all six tiles share one height. Verify: tile values equal the Facts; no chart on the two tiles without monthly data; equal tile heights.
- [ ] 5.2 Garments and utilization: bullet chart per site against the cut-off, repair rate by product, monthly repairs line, then the cards. Verify: hidden-table values equal `garmentUtilization` per site and `repairRateByProduct`.
- [ ] 5.3 Costs: unused-allocation bars with hatched "Needs input" placeholders, avoided cost per site (dashed), monthly avoided cost (dashed). Verify: with the rental fee unset, every site shows a hatched bar and none shows 0.
- [ ] 5.4 Environmental footprint: waterfall, paired bars, two donuts, then the cards. Verify: waterfall end equals the service total; donut slices equal the engine parts; delivery note visible.
- [ ] 5.5 Signals: repair line with threshold band and spike markers per flagged site, dormant tier bars, then the ObservationCards. Verify: marked months equal the signal's spike months for CUST001.
- [ ] 5.6 Sites and site page: heatmap with a utilization/repairs toggle, then the table; site-versus-customer paired bars and monthly repairs on the site page. Verify: cell values equal the series; the toggle changes only the metric.

## 6. Docs and checks

- [ ] 6.1 Add chart rules and the intro and tile templates to `docs/conventions.md`; update `docs/design.md`. Verify: the component table lists every new component.
- [ ] 6.2 Run `openspec validate dashboard-content`, `npm test`, `npm run lint`, `npm run build`, `npm run check:contrast`, `npm run check:design-imports`. Verify: all pass.
- [ ] 6.3 Check every section at 1280px in dark and light with the browser tool, no console errors, and a keyboard pass over charts and chips. Verify: screenshots of all six sections in both themes.
