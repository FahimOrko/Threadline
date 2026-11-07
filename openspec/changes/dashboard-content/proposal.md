## Why

`dashboard-refactor` (Part A, archived) gave the dashboard sections and a dashboard-only sidebar under a top tab bar. The user dislikes the top navigation and wants a different look: the shadcn `dashboard-01` block (section cards with trend indicators, an interactive area chart with a time-range toggle, a data table) and the `sidebar-07` block (a sidebar that shrinks to icons), with a little React Bits where it helps a reader. The content plan (charts per section, G1 and G3 engine series, compact provenance chip) stays. This change now covers how the app is navigated and how it all looks.

**Review decisions (2026-11-07).** The user accepted every recommendation below (C1-A, the C2 split, C3 with the additions listed next, C4, C5-A). Phase 1 is applied first and stops for a look-and-feel review; Phase 2 starts only after that review.

**Decided by the user on top of the recommendations**
- Two gated phases. Phase 1: navigation, header, tokens, Overview shell. Phase 2: engine series, charts, table, motion. All motion is Phase 2.
- Trend badges keep the proposed definitions. Each badge's tooltip states its exact comparison period (for example "Oct to Dec 2025 against Jul to Sep 2025" or "Dec 2025 against Sep 2025"), so the mixed rules are never hidden.
- Motion in the dashboard is exactly: CountUp on the six Overview tile values; an animated sidebar hover and active indicator; a soft spotlight hover on the Overview tiles; a one-time fade-in of chart sections on first load. No motion on numbers other than CountUp. Everything is off under `prefers-reduced-motion`. Phosphor-only: any component whose dependencies pull another icon set is skipped.
- When the AI sidebar opens on dashboard routes, the app sidebar collapses to icons so the main area stays usable at 1230px. It restores when the AI sidebar closes, unless the user toggled the sidebar in between.

The open choices below keep their original text for the record.

## Open choices (each with a recommendation)

### C1. Sidebar scope

| Option | What it means | Trade-off |
|---|---|---|
| **A. App-wide sidebar (recommended)** | One collapsible sidebar replaces the top tab bar. Group "Dashboard": six sections. Group "Shared": Story, Impact World. Customer view shows only Story and Impact World. | Removes the nav the user dislikes and gives one navigation model. Costs the most: `AppShell` and the `/dashboard` layout are restructured, ADR 0023's picker placement is superseded. |
| B. Dashboard-only sidebar, top tabs stay | Dashboard gets a sidebar-07 sidebar; the tab bar stays for Dashboard / Story / Impact World. | Smallest change, but keeps the top nav the user dislikes and two navigation levels. |

Recommendation **A**. If B is chosen: drop the `app-shell` delta's "View switching" change, keep the tab bar, and mount the sidebar in `/dashboard/layout.tsx` only.

### C2. What the header keeps, and where the pickers live

Recommended split (sidebar-07's slots in brackets):

| Control | Where | Why |
|---|---|---|
| Customer picker | Sidebar top [team-switcher slot]: shows the customer name, opens a list. Collapsed: the customer's initials. Hidden in customer view and on the game, as the header picker is today. | Customer is a context for the whole app, like a workspace. |
| Section and view links | Sidebar body | |
| KAM / Customer toggle, theme toggle | Sidebar footer [nav-user slot] | They are settings about the viewer, not about the page. |
| Baseline and estimate (sensitivity) pickers | Header, on `/dashboard` routes only | They change the numbers on the page, so they stay visible while reading and survive a collapsed sidebar. |
| Sidebar trigger, breadcrumb (Dashboard, section, site name), AI sidebar toggle | Header | The header becomes one thin 40px row. |

Alternatives: all pickers in the sidebar (header becomes nearly empty, but pickers vanish when the sidebar is collapsed); toggles stay in the header (more header clutter). Recommendation as in the table.

### C3. React Bits intensity

Verified: the React Bits MCP is **not configured in this session**, so this was read from the public `@react-bits` registry (`reactbits.dev/r/registry.json`, TS and Tailwind variants) directly. Installing is `npx shadcn add @react-bits/<Name>-TS-TW` after adding the registry to `components.json`; apply must do that, never by copy.

| Option | What it means |
|---|---|
| A. Heavy everywhere | Count-up, spotlight, tilt, animated lists on every dashboard card and in the nav. Cost: it fights the "calm data" principle and makes numbers harder to read and to check. |
| **B. Subtle in the dashboard, heavy in Story and Impact World (recommended)** | Dashboard: one effect, a count-up on the six Overview tile values (once, when scrolled into view). Nav: none. Story and Impact World: heavy effects, proposed below but done in their own later change. |
| C. Story and Impact World only | Dashboard and nav stay fully static. Zero risk to the "calm data" rule. |

Recommendation **B**, which changes a rule: `docs/design.md` says "Motion, glow and scene art appear only in Story and Impact World". B adds a small, closed exception for data views: *Overview tile values count up once and land on the exact displayed value; the sidebar has an animated hover and active indicator; Overview tiles have a soft spotlight on hover; chart sections fade in once on first load; nothing else moves, glows or tilts; `prefers-reduced-motion` turns all of it off.* (The user extended the original count-up-only exception with the three extras.) This needs a docs/design.md edit and an ADR (0025, below). If C is chosen, no rule changes and the count-up tasks are dropped.

Per place, which component and why it helps the reader (all from the React Bits registry):

| Place | Component | Verdict | Why |
|---|---|---|---|
| Overview tile values | **CountUp** (`motion@^12`) | Use (B) | Draws the eye to the six headline numbers once; lands on the displayed string |
| Overview tiles | **SpotlightCard** (no deps) | Use, soft (user decision) | A faint pointer-following light on hover only; no tilt, no glow at rest, no layout shift |
| Overview tiles | TiltedCard, GlareHover | Reject | Tilt and glare move the card under the pointer |
| Garments, Costs, Footprint | none | | Charts and cards already carry the point; motion would repeat it |
| Signals ObservationCards | AnimatedList | Reject | Needs `@hugeicons` (breaks the Phosphor-only rule) and animates content the KAM must act on |
| Sites table | none | | A table must not move while sorting or reading |
| Sidebar items | animated hover and active indicator (small `motion` `layoutId` indicator, no React Bits component fits) | Use (user decision) | Shows where you are and where you are about to go; 150 ms, off under reduced motion |
| Chart sections | **FadeContent** idea, built on `motion` instead of the component's `gsap` dependency | Use (user decision) | One-time fade-in on first load so charts do not pop in; no replay |
| Header | none | | |
| Story chapters | SplitText or BlurText on chapter titles, FadeContent on chapter reveal | Propose, later change | Story is a narrative; reveal pacing helps the telling |
| Story game stage | SpotlightCard on the speaking character, AnimatedContent for beat transitions | Propose, later change | Effects are already allowed there (ADR 0021) |
| Impact World | TiltedCard or ProfileCard-style tilt, ChromaGrid, GradientBlinds or PixelBlast as backdrop | Propose, later change | Scene and exploration surface; decoration is the point |
| Anywhere | AnimatedList, Stepper, FlowingMenu, ProfileCard, PeekRating | Reject | Registry deps include `@hugeicons/*`; Phosphor only |

### C4. New dependencies

| Dependency | For | Needed? | ADR |
|---|---|---|---|
| `recharts@3.8.0` (via shadcn `chart`) | Charts | Yes (already in the plan; peers checked in task 2.1) | 0024 |
| shadcn `sidebar` block items (`sidebar`, `breadcrumb`, `collapsible`, `skeleton`, `input`, `sheet`, `use-mobile`) | App sidebar | Yes; `lucide-react` imports are replaced with Phosphor, the mobile `Sheet` path is removed (desktop only), the sidebar's own tooltip is mapped onto the existing `Tooltip` | 0025 |
| `motion@^12.23` (React Bits CountUp, sidebar indicator, fade-in) | Count-up, indicator, fade-in | Yes (user accepted; installed in Phase 2) | 0025 |
| `@tanstack/react-table` | Sites table | **Not recommended.** The table has about 20 rows and four numeric columns; sort-by-header and a name filter are about 40 lines in the existing `SiteTable`. Add the library only if column visibility or pagination is wanted. | 0024 if added |
| `@dnd-kit/*`, `@tabler/icons-react`, `zod` (dashboard-01 deps) | Drag rows, icons | **No.** Row dragging has no use here; tabler breaks Phosphor-only; zod is already installed | |
| `gsap` | FadeContent, SplitText | Not now: the fade-in is built on `motion`; revisit in the Story and World change | |

### C5. One change or two

| Option | Trade-off |
|---|---|
| **A. One change, two gated phases (recommended)** | Phase 1: app navigation, header, tokens, Overview shell. Phase 2: charts, engine series, Sites table. Apply stops after phase 1 for a look-and-feel review. One set of specs, one archive, no stale deltas. |
| B. Split into `app-navigation` and `dashboard-content` | Cleaner review units, but the Overview layout depends on sidebar width, the specs overlap (app-shell, dashboard-navigation, dashboard-sections) and the second needs the first archived. Moving the task groups and delta files is mechanical if the user prefers this. |

## What Changes

- **App navigation (phase 1).** shadcn sidebar-07 rebuilt as an app-wide icon-collapsible sidebar with Phosphor icons; the top tab bar is removed; the header becomes a thin row; ADR 0023's picker placement is superseded by a new ADR.
- **Dashboard look (phases 1 and 2).** dashboard-01 mapped onto Threadline: Overview gets six section cards (value, trend indicator, sparkline, comparison bar) and one interactive area chart with a measure toggle and a 3 / 6 / 12 month range toggle; Sites gets a sortable data table under the heatmap.
- **Engine** (aggregations only, Vitest): **G1** monthly series (now also `windows` and `trend`), site by month matrix, repair band; **G3** footprint comparison.
- **Charts** as in the per-section table below, on theme tokens.
- **Provenance** compact chip with method word and source mark, page legend, Show math on every card; ADR 0004 unchanged. Animated numbers keep the same chip and Show math.
- **Motion** (Phase 2): CountUp on the six tile values, an animated sidebar hover and active indicator, a soft spotlight on Overview tiles, a one-time fade-in of chart sections; nothing else moves.
- **Costs** unset assumption: hatched "Needs input" bar, never zero.
- **Docs**: ADRs 0024 (charts, visual language, data-only-from-engine) and 0025 (app-wide sidebar, picker and toggle placement, the one data-view motion exception); `docs/design.md`, `docs/conventions.md`.

## Design Read

A data workspace for one KAM at a time, now framed like a product dashboard (sidebar, section cards, one hero chart, a table) rather than a stack of cards, but still calm: teal accent, Geist and Geist Mono (`.num`), 8px panels, hairlines, no shadows, no gradient fills, Phosphor only, dark and light. Dials: variance 3, motion 1 (the count-up only), density 5. Desktop only; checked at 1230 and 1280px with the AI sidebar open and closed and the app sidebar expanded and collapsed.

dashboard-01 as shipped uses gradient card fills, `shadow-xs`, tabler icons and sample data; none of that comes over. What does: the section-card anatomy, the area chart with its range toggle, the data table's header and toolbar pattern, the header-with-trigger pattern.

The shared chart language is unchanged: one thin teal stroke with end node (the thread), a 12% teal tint under area charts only, direct labels, no legends, hairline grid in `--border`, dashed for estimated or illustrative, hatched for needs-input, amber only for uncertainty, every mark also identified by a label, dash or hatch.

## Visual plan per page (for review before apply)

Widths: main area is the viewport minus the app sidebar (14rem expanded, 3.5rem collapsed) minus the AI sidebar (20rem when open). At 1230px with both open the main area is about 650px; sections use container queries, not viewport breakpoints.

**Sidebar (expanded).** Top: customer switcher (initials tile, customer name, period "2025", a caret). Group label "Dashboard": Overview, Garments and utilization, Costs, Environmental footprint, Signals, Sites, each with a Phosphor icon (SquaresFour, TShirt, Coins, Leaf, Bell, Buildings). Hairline. Group "Shared": Story (BookOpen), Impact World (Globe). Footer: KAM / Customer segmented links and the theme toggle. Active item: `--muted` fill, foreground text, `aria-current="page"`; no coloured pill.
**Sidebar (collapsed to icons).** Icon column with Tooltips carrying the labels, switcher shows initials only, footer shows two icon buttons (view, theme). Trigger and `Ctrl+B` toggle it. State kept in a cookie (a viewer preference, not a number, so it stays out of the URL).

**Header.** One 40px row, bottom hairline: sidebar trigger, vertical separator, breadcrumb (Dashboard / Costs, or Dashboard / Sites / Site name). Right: on dashboard routes the Baseline and Estimate selects (compact, labelled), then the AI toggle. Customer view: breadcrumb and AI toggle only.

**Overview.** Title and the intro paragraph. Legend line. A row of six equal section cards (3 by 2 when the main area is 640px or wider, 2 by 3 under it). Card: label top left, trend badge top right (Phosphor TrendUp or TrendDown or Minus, a signed percent in mono and a word: "Up", "Down", "Flat", never colour alone), the value large in Geist Mono (counts up once), one plain line, a sparkline in the thread style, a thin comparison bar or the cut-off tick, then the compact chip and Show math. On-time and dormant tiles: no trend badge and no sparkline, the same slots hold "No monthly figure". Below the six cards, a smaller row keeps the three Facts the Overview showed before (delivery sites, active wearers, garments in circulation), so no Fact leaves the dashboard. Under that: the interactive chart panel: title is the question ("How is it moving?"), a measure toggle (Water saved, CO₂e saved, Avoided cost, Utilization) and a range toggle (3 months, 6 months, 12 months), an area with the thread line and a 12% tint, dashed line for estimated measures, a range total and its chip, a hidden data table, Show math.

**Garments and utilization.** Intro, legend. Panel: bullet bars per site against the cut-off. Panel: repair rate by product bars; monthly repairs thread line beside it when width allows. Then the Fact cards in a three-column grid.

**Costs.** Intro, legend. Panel: cost of unused allocation per site (hatched "Needs input" when unset). Panel: avoided cost per site (dashed outline), and its monthly dashed thread line. Then cards.

**Environmental footprint.** Intro, legend. Panel: CO₂e waterfall with the net saving labelled and the delivery note. Panel: paired bars for water, energy, CO₂e. Two small donuts side by side (process vs delivery, recycled vs other). Then cards.

**Signals.** Intro, legend. Panel: repair thread line per flagged site with the threshold band and labelled spike months. Panel: dormant tier stacked bars. Then ObservationCards linking to sites.

**Sites.** Intro, legend. Panel: heatmap sites by month with a Utilization / Repairs toggle. Panel: data table (dashboard-01 table anatomy): toolbar with a name filter, sortable numeric headers (each keeps its compact chip and Show math), 28px rows, a row links to the site page, empty state built in. No drag handles, no tabs, no row drawer.

**Site drill-down.** Breadcrumb Dashboard / Sites / name replaces the back link. Panel: site versus customer paired bars and monthly repairs thread line. Cards below as today. Same table-free layout as before.

**Story and Impact World.** Reached from the sidebar's Shared group. Their content is unchanged in this change; React Bits effects for them are proposals above, a later change.

## Charts per section (carried over)

All values come from engine Facts or the new G1 and G3 outputs. "Exists" means an engine function that exists today. The first row of each section is the recommendation; the rest is the fallback if a gap is declined.

| Section | Question the chart answers | Chart | Data source | If the gap is declined |
|---|---|---|---|---|
| **Overview** (recommended) | How is each headline figure moving, and how does it compare with the alternative? | Six section cards: value, trend badge, sparkline (water saved, CO₂e saved, avoided cost, utilization), comparison bar (water, CO₂e; utilization shows a tick at the over-allocation cut-off). On-time rate and critical dormant sites show the value only. | G1 monthly series (with `trend`), G3 comparison, the six Facts | Without G1: cards without sparklines or trend. Without G3: no comparison bars. |
| Overview, main chart | How is one measure moving over the year, and what did the last 3, 6 or 12 months add up to? | Interactive area: measure toggle (water, CO₂e, avoided cost, utilization) and range toggle (3, 6, 12 months). The range total comes from the engine (`windows`). | G1 monthly series | The chart is dropped; cards stay |
| Overview, alternative | Same | Six plain cards | Facts only | |
| **Garments and utilization** | Which sites have too many garments sitting unused? | Bullet chart per site: bar, tick at the over-allocation cut-off, shaded band under it. Sorted lowest first. | `garmentUtilization` per site, cut-off from team assumptions | n/a |
| | Which products need the most repair? | Bar: repair rate by product | `repairRateByProduct` | n/a |
| | Is repair load rising or falling? | Thread line, monthly repairs | G1 | Dropped |
| **Costs** | Where does unused allocation cost money, and what is still unknown? | Bar per site; unset shows a hatched "Needs input" bar, never zero | `costOfUnusedAllocation` per site | n/a |
| | Where were purchases avoided? | Bar per site, dashed outline (estimated) | `avoidedPurchaseCost` per site | n/a |
| | When were purchases avoided? | Thread line, monthly avoided cost (dashed) | G1 | Dropped |
| **Environmental footprint** | Why is the net CO₂e saving what it is? | Waterfall: comparison emissions, minus process savings, plus delivery, to the service total, net saving labelled | G3 waterfall steps | Dropped |
| | How do water, energy and CO₂e compare? | Paired thin bars per metric with the saved percentage labelled | G3 | The six saved cards only |
| | How much of the service's CO₂e is delivery? | Donut, two slices | G3 composition | Dropped |
| | How much textile waste is recycled or reused? | Donut, two slices | G3 composition | Dropped |
| **Signals** | Is a site's repair trend heading for a spike, and when did it cross the line? | Thread line per flagged site, threshold as a band, spike months marked and labelled | G1 repair band, `repairSpikeSignal` | Spike months only |
| | Which sites have been dormant longest? | Stacked bar per site by tier | `dormantSignal` | n/a |
| **Sites** | Which site-months stand out? | Heatmap sites by month, five steps, utilization or repairs toggle | G1 site by month matrix | Ranked bar of the table columns |
| | Which site is where, for each measure? | Sortable data table | `operationalSiteRows` | n/a |
| Site page | How does this site sit against the customer? | Paired bars; thread line, monthly repairs | `siteComparison`, G1 | Bars only |

Every chart has: a title that states the question in plain words, a unit, a one-line caption with Show math for its series, and a text alternative (a visually hidden table plus a one-sentence summary).

## Engine additions (decided: add both)

| # | Export | Returns | Test |
|---|---|---|---|
| G1 | `monthlySeries(data, scope, measure, ...)` for repairs, service requests, avoided purchase cost, water saved, energy saved, CO₂e saved, garment utilization | `{ label, unit, methods, source, points: [{ month, value }], windows: { 3, 6, 12 → { from, to, value } }, trend }` | Flow points sum to the matching Fact; December utilization equals the Fact; each window's value equals the sum (or last point, for utilization) of its months |
| G1 | `monthlySeriesBySite(data, scope, measure)` for utilization and repairs | rows of `{ siteId, siteName, cells: [{ month, value, level }] }`, `level` 0 to 4 as the engine's quintile | Cells equal `monthlySeries` for that site's scope |
| G1 | `repairBand(data, scope)` | per flagged site `{ month, repairs, mean, threshold, spike }`, sharing one function with `repairSpikeSignal` | Band spike months equal the signal's |
| G3 | `footprintComparison(data, scope, baseline, sensitivity)` | per metric `{ comparison, service, unit }`; waterfall steps `[{ label, start, end, kind }]`; composition parts | Comparison minus service equals the saved Fact for each sensitivity; last step's end equals the service total |

`trend` is `{ from, to, change, direction }` and is a modelling choice the user should confirm at review: for flow measures, the last three months against the three before (Q4 against Q3); for utilization (a snapshot), December against September. `change` is a relative percent, `direction` is `up`, `down` or `flat` (flat when the rounded change is 0.0). A card with no monthly series has no `trend`. On-time rate and dormant sites have no monthly data in the build-time aggregates; adding one is a pipeline change, out of scope.

## Capabilities

### New Capabilities
- `dashboard-charts`: chart rules, per-section charts, interactive area chart, text alternatives, hatched needs-input bar.
- `dashboard-overview`: six section cards with trend indicator, sparkline, comparison bar, count-up; the main interactive chart.
- `dashboard-sites`: the sortable Sites data table under the heatmap.

### Modified Capabilities
- `kpi-engine`: monthly series (with windows and trend), site by month matrix, repair band, footprint comparison (ADDED).
- `provenance-display`: Fact stat card carries one compact method chip; page legend.
- `app-shell`: sidebar replaces the top tab bar; header content; Story link and game picker rules move to the sidebar.
- `dashboard-navigation`: the sidebar is the app sidebar; customer picker in its switcher slot; baseline and estimate in the header.
- `dashboard-sections`: Overview now six cards; Overview cards repeat headline Facts that also appear on their own section page.

## Impact

- Code: `src/components/app-shell.tsx` (rebuilt around `SidebarProvider`), `src/components/dashboard-sidebar.tsx` (replaced by `app-sidebar`), `src/app/dashboard/layout.tsx`, `src/components/ui/sidebar.tsx` and friends, new chart and card components in `src/components` and `/design`, `src/lib/engine` (`series.ts`, `footprint.ts`, `signals.ts`, exports), every section page, `fact-stat-card.tsx`, `provenance-chip.tsx`, `site-table.tsx`, chart and sidebar tokens in `globals.css` with contrast pairs.
- Dependencies: C4 table. `lucide-react` and `@tabler/icons-react` are never added.
- Docs: ADRs 0024 and 0025, `docs/design.md` (motion exception, sidebar and chart components), `docs/conventions.md`.
- Tests: Vitest for G1 and G3; RTL for chart text alternatives, the chip, the sidebar (items per view, active state, collapsed labels) and count-up landing.
- ADR 0023's "pickers move to the sidebar and leave the header" is superseded in part by ADR 0025 (new ADR, 0023 untouched, README marks it).

## Out of scope

New modelling or pipeline changes (no monthly on-time or dormant series), Story and Impact World redesign and their React Bits effects (proposed above, later change), PDF, AI features, mobile and tablet layout (the app sidebar and AI sidebar overlay paths are removed or unused), row drag-and-drop, row drawers.
