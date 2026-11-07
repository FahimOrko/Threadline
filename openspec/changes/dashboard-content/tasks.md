## 1. Preconditions

- [x] 1.1 Read `docs/conventions.md`, `docs/adr/README.md`, `docs/design.md` and the Next.js guides in `node_modules/next/dist/docs/` for layouts and cookies. Verify: `openspec list` shows no active `dashboard-refactor`; the user has reviewed this proposal and chosen C1 to C5 (do not start before).
- [x] 1.2 (deferred to Phase 2: nothing is installed from `@react-bits` in Phase 1) Add the `@react-bits` registry to `components.json`. Verify: `npx shadcn view @react-bits/CountUp-TS-TW` resolves.

## 2. App navigation and header (phase 1)

- [x] 2.1 Read the installed shadcn `sidebar`, `breadcrumb`, `collapsible`, `skeleton`, `input` items (view first, scratch copy, do not blind-add). Port to Phosphor and the base-ui render-prop style, remove the mobile Sheet and `use-mobile`. Verify: `grep -r "lucide\|tabler" src` is empty; `npm run build` passes.
- [x] 2.2 Add sidebar tokens mapped onto existing tokens, with contrast pairs. Verify: `npm run check:contrast` passes.
- [x] 2.3 Add `src/lib/nav.ts` (items, `navItemsFor(view)`, active rules) with Vitest tests: customer view omits the Dashboard group; Overview active only on `/dashboard`; Sites active on a site page; Story active on `/story`, `/story/game`, `/story/print`; links keep or drop params through `carryParams`.
- [x] 2.4 Build `AppSidebar` (customer switcher in the header slot, two flat groups, footer with view links and theme toggle), `collapsible="icon"` with labelled tooltips when collapsed, and the AI-sidebar auto-collapse rule (design 3b). Verify: RTL tests for items per view, `aria-current`, accessible names when collapsed, keyboard toggle.
- [x] 2.5 Build `AppHeader` (trigger, breadcrumb, baseline and estimate selects on dashboard routes, AI toggle) and rebuild `AppShell` around `SidebarProvider` and `SidebarInset`; remove the top tab bar and `DashboardSidebar`; keep the print route bare and the AI aside behaviour. Verify: existing `app-shell` tests updated and passing; the game hides the baseline and estimate selects and the customer switcher.
- [x] 2.6 Breadcrumb names the site on a site page. Verify: `/dashboard/sites/<id>` shows Dashboard / Sites / the site name.
- [x] 2.7 Add `AppSidebar` and the header to `/design` and `docs/design.md`.

## 3. Chart foundation (phase 2)

- [ ] 3.1 Check `recharts@3.8.0` peers against React 19.3; if accepted add the shadcn `chart` item, strip any Lucide import. Verify: build passes, `grep -r lucide src` empty.
- [ ] 3.2 Chart tokens (subject, comparison, uncertain, grid, five heatmap steps) light and dark with contrast pairs. Verify: `npm run check:contrast`.
- [ ] 3.3 Build `ChartFrame`, `ThreadLine`, `AreaChartInteractive`, `BulletBars`, `PairedBars`, `Waterfall`, `Donut`, `Heatmap`, `HatchedBar`, `TrendBadge`, `SectionCard`. Each: states, hidden table text alternative, no glow. Add each to `/design` with sample data and to `docs/design.md`. Verify: RTL tests assert the hidden table equals the props; `npm run check:design-imports`.
- [x] 3.4 (done in Phase 1) Write ADR 0024 (chart dependency, visual language, data-only-from-engine) and ADR 0025 (app-wide sidebar, picker and toggle placement superseding the picker part of 0023, the one data-view motion exception) with README rows; mark 0023 "superseded in part". Verify: no existing ADR file edited.

## 4. Overview shell (phase 1 gate)

- [x] 4.1 Overview: six `SectionCard`s on Facts only (value, plain line, chip, Show math), equal height, container-query grid; the three previous Overview Facts kept in a smaller row. Verify: values equal the Facts; equal heights.
- [ ] 4.2 **Stop for review** at 1230 and 1280px, dark and light, AI sidebar open and closed, app sidebar expanded and collapsed. Verify: screenshots of the Overview and one section in all combinations; the user approves the look before phase 2.

## 5. Engine additions (Vitest first)

- [ ] 5.1 `monthlySeries` for seven measures with `windows` and `trend`. Verify: tests: flow measures sum to their Facts (CUST001 and one site); December utilization equals the Fact; each window equals the matching months; trend for a known case (up, down, flat).
- [ ] 5.2 `monthlySeriesBySite` with quintile `level`. Verify: a site's cells equal its `monthlySeries`; levels 0 to 4 with the max cell at 4.
- [ ] 5.3 `repairBand`, one function shared with `repairSpikeSignal`. Verify: spike months equal for every site of CUST001; existing signal tests pass.
- [ ] 5.4 `footprintComparison` with waterfall and composition. Verify: all three sensitivities and two baselines: comparison minus service equals each saved Fact; last step's end equals the service total.
- [ ] 5.5 Export from `src/lib/engine/index.ts`. Verify: `npm test` and `npm run lint`.

## 6. Provenance and motion

- [ ] 6.1 `label` variant of `ProvenanceChip`, `ChipLegend`, use in `FactStatCard` and `SectionCard`. Verify: RTL: word and glyph, source mark accessible name, "+N" for several methods, null keeps chip and Show math; one legend per page.
- [ ] 6.2 Install CountUp and SpotlightCard from `@react-bits` (add `motion`), build `AnimatedValue` as in design decision 17 and a soft-spotlight `SectionCard` hover; add the sidebar hover and active indicator (`motion` `layoutId`) and a one-time `FadeIn` for chart sections. Verify: RTL landing test; reduced-motion test shows the final string and starts no animation and disables the indicator, spotlight and fade; null shows "Needs input" with no animation; no other number animates. Verify: RTL landing test for whole, one-decimal, percent and separator values equals `formatCardValue`; reduced-motion test shows the final string and starts no animation; null shows "Needs input" with no animation.
- [x] 6.3 (done in Phase 1) Update `docs/design.md` principle with the motion rule. Verify: the rule text matches ADR 0025.

## 7. Sections (phase 2)

- [ ] 7.1 Overview: tiles gain trend badge, sparkline, comparison bar or cut-off tick, count-up; add the interactive area chart (measure and 3 / 6 / 12 month toggles). Verify: tile values and range totals equal the engine; no chart or trend on on-time and dormant tiles, context line instead; toggles change only measure or range.
- [ ] 7.2 Garments and utilization: bullet chart, repair rate by product, monthly repairs, cards. Verify: hidden-table values equal `garmentUtilization` and `repairRateByProduct`.
- [ ] 7.3 Costs: hatched needs-input bars, avoided cost per site (dashed), monthly avoided cost (dashed). Verify: with the rental fee unset every site shows a hatched bar and none shows 0.
- [ ] 7.4 Environmental footprint: waterfall, paired bars, two donuts, cards. Verify: waterfall end equals the service total; donut slices equal the engine parts; delivery note visible.
- [ ] 7.5 Signals: repair line with band and spike markers, dormant tier bars, ObservationCards. Verify: marked months equal the signal's for CUST001.
- [ ] 7.6 Sites: heatmap with toggle; `SiteTable` gains header sort, name filter and `aria-sort`, rows link to the site. Site page: paired bars and monthly repairs. Verify: cell values equal the series; sort reorders rows only and never changes a value; the table fits 1230px without sideways scrolling.

## 8. Docs

- [ ] 8.1 Add chart rules, nav rules and the tile templates to `docs/conventions.md`; complete the `docs/design.md` component table. Verify: every new component is listed and in `/design`.

## 9. Checks

- [ ] 9.1 Run `openspec validate dashboard-content`, `npm test`, `npm run lint`, `npm run build`, `npm run check:contrast`, `npm run check:design-imports`. Verify: all pass.
- [ ] 9.2 Browser check of every section and the site page at 1230px and 1280px, dark and light, AI sidebar open and closed, app sidebar expanded and collapsed; no console errors; keyboard pass over the sidebar, charts, toggles and chips; count-up lands on the exact value and is off under reduced motion. Verify: screenshots saved.
