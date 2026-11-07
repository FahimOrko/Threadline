## 1. Engine

- [ ] 1.1 `footprintComparison`: remove `waterfall`/`WaterfallStep`; add `comparisonDelivery`; add Fact `comparison_footprint` with Show math; export from `src/lib/engine/index.ts`; update `tests/footprint-facts.test.ts` (comparison = service + net saving = `co2e_saved`, per baseline and sensitivity)
- [ ] 1.2 `wasteSplit` returns recycling, reuse, energy recovery and incineration (allocated kg); `composition.waste` carries the four parts; test parts sum to the total and recycling + reuse equals the share Fact's amount
- [ ] 1.3 `monthlySeriesBySite`: `highlight` per cell (utilization below the cut-off, none when unset; repairs from `repairBand`) and `highlighted` per row; tests: highlights equal the cut-off and the spike signal's months

## 2. Explainer pattern

- [ ] 2.1 Read ADR 0004, 0005, 0016, 0017, 0027 again; write ADR 0028 and its index row
- [ ] 2.2 `src/lib/explain.ts`: registry for every key in review table A, needs-input phrase map, `resolveExplain` over `resolveLine` with `{comparison}`
- [ ] 2.3 `src/components/info-popover.tsx` on `Popover` (Phosphor `Info`, name "What does this mean?"); wire into `FigurePanel`, `InlineStat`, `ChartFrame`
- [ ] 2.4 Tests: every listed key exists; no digit outside tokens and no banned word in any entry; "i" opens by keyboard and leaves Show math closed; token value equals the card value
- [ ] 2.5 `/design` gallery entry (dark and light), `docs/design.md`, `docs/conventions.md`

## 3. CO2e chart and recycling

- [ ] 3.1 `ComparisonBars` in `charts-simple.tsx` (comparison bar, stacked service bar, "Net saving" label); delete `Waterfall` from components, `/design` and docs
- [ ] 3.2 Footprint page: sentence over the chart from tokens, no-delivery note when `comparisonDelivery` is 0, hidden table equals the values; test label equals the `co2e_saved` Fact
- [ ] 3.3 Recycling panel: `PartBar` of the four treatments under the hero; "Less than {short}" ring caption

## 4. Heatmap

- [ ] 4.1 `Heatmap`: neutral cells, highlighted cell token (light and dark, contrast pair in `scripts/check-contrast.ts`) plus a mark, hover and focus tooltip, legend template from engine values, titles per measure
- [ ] 4.2 Sites page: rows sorted by highlighted months, links keep params; test order and that highlights match the engine

## 5. Wording and labels

- [ ] 5.1 Rewrite observations per review table B (no site names, no ids, no digits); severity map (Low, Medium, High); no badge on value observations; update `tests/garment-signals.test.ts` and observation tests; `ObservationCard` gallery sample
- [ ] 5.2 Apply review table C across dashboard pages, `src/lib/dashboard.ts` and `needs input` hints; grep the dashboard for remaining banned words and list any extra fixes in the summary
- [ ] 5.3 Test: intros, labels and captions free of banned words

## 6. Flaky test and verification

- [ ] 6.1 Reproduce the `tests/story-print.test.tsx` timeout under the full suite; fix the cause or raise that test's timeout with a why-comment
- [ ] 6.2 `npm test`, `npm run lint`, `npm run check:contrast`, `npm run check:design-imports`, `npm run build`
- [ ] 6.3 Check every dashboard section and `/design` at 1230px and 1280px in dark and light; do not commit
