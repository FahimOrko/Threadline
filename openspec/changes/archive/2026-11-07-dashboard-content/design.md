## Context

See proposal.md for the open choices (C1 to C5), the visual plan, the chart table and the engine additions. Current state: `AppShell` renders a header (pickers outside the dashboard, view toggle, theme, AI toggle), a top tab bar (Dashboard, Impact World, Story) and an AI aside; `/dashboard/layout.tsx` adds a `DashboardSidebar` with pickers and six section links. No chart library. `docs/design.md`: calm data, hairlines, no shadows, one teal accent, Geist and Geist Mono, Phosphor only.

Sources read: shadcn registry `@shadcn/dashboard-01` (page, section-cards, chart-area-interactive, data-table, site-header, nav-*) and `@shadcn/sidebar-07` (app-sidebar, nav-main, nav-projects, nav-user, team-switcher), and the public `@react-bits` registry (`reactbits.dev/r`, `-TS-TW` variants). The React Bits MCP is not installed in this session; the registry JSON was read directly.

The user accepted the recommended option of every choice (C1-A, C2 table, C3-B, C4 table, C5-A) and decided the items in the proposal's "Decided by the user" list. Phase 1 is applied; Phase 2 waits for the look-and-feel review.

## Goals / Non-Goals

**Goals:** one navigation model; section cards, an interactive chart and a data table in the dashboard-01 manner on our tokens; charts that each answer one question; engine series that are plain aggregations; every number keeps provenance and display rounding; one motion exception that cannot mislead.

**Non-Goals:** new modelling, pipeline changes, Story and Impact World redesign, mobile, row drag-and-drop.

## Decisions

### Navigation (phase 1)

1. **Rebuild sidebar-07, do not install blindly.** `npx shadcn view` (and `add` into a scratch copy) shows the sidebar item set: `sidebar`, `breadcrumb`, `collapsible`, `separator`, `dropdown-menu`, `avatar`. Mapping:
   - `team-switcher` becomes the customer switcher: `Select`-style list reusing the existing customer data and `ParamSelect` logic so the URL param rules of ADR 0014 stay in one place. No dropdown-menu or avatar item is added: the existing `Select` is the list; the initials tile is plain markup.
   - `nav-main` (collapsible groups with sub-items) becomes two flat groups, "Dashboard" and "Shared". Flat, because sub-items are hidden when the sidebar is collapsed to icons; flat items stay reachable by icon plus tooltip.
   - `nav-projects` is not used. `nav-user` becomes the footer with the view links and theme toggle.
   - `lucide-react` imports in the installed files are replaced with Phosphor (`SidebarSimple` for the trigger, `CaretRight`, `CaretUpDown`). The mobile `Sheet` branch and `use-mobile` are removed: desktop only. The sidebar's `Tooltip` import is mapped onto `src/components/tooltip.tsx` if its API allows, otherwise the shadcn one is kept for the sidebar only and the gallery notes it.
2. **Layout.** `SidebarProvider` wraps the app in `AppShell`; `AppSidebar` plus `SidebarInset` contain the header, the main area and the AI aside. `collapsible="icon"`. The AI aside keeps its current behaviour (right, 20rem, takes space, collapsed by default on the game). The main area uses container queries, so cards reflow by their own width. Width budget at 1230px: 14rem plus 20rem leaves about 650px; collapsed sidebar plus AI open gives about 850px. Task 7 checks all four combinations at 1230 and 1280.
3. **Items per view.** Pure data in `src/lib/nav.ts`: items with `href`, `match`, label and icon name, plus a function `navItemsFor(view)` that omits the Dashboard group in customer view. Same rules as today: Story is active on `/story*`; Overview is active only on `/dashboard`; Sites stays active on a site page; links go through `carryParams` (leaving the dashboard keeps `view` only). The proxy redirect of ADR 0023 is unchanged.
3b. **AI sidebar collapses the app sidebar on dashboard routes.** The shell holds `pref` (the user's chosen open or collapsed, mirrored to the cookie) and `touched` (the user used the trigger or Ctrl+B since the AI sidebar last changed). On a dashboard route the sidebar is shown collapsed while the AI sidebar is open and `touched` is false; otherwise it shows `pref`. Any AI toggle resets `touched`; a user toggle sets `pref` and `touched`. So closing the AI sidebar restores the previous state, and a toggle in between wins. Automatic changes never write the cookie.
4. **Header.** A server-friendly thin row: `SidebarTrigger`, separator, breadcrumb built from the pathname (and the site name on a site page, passed by the page through a small client context, not recomputed), then on dashboard routes the baseline and estimate `ParamSelect`s, then the AI toggle. The game hides the baseline and estimate pickers as before.
5. **Sidebar state** is a viewer preference stored in a cookie (`sidebar_state`), not in the URL (the URL carries customer, baseline, sensitivity, view; ADR 0014 and 0017 are about values that change numbers). It is read on the client after mount, not on the server: with `cacheComponents` a `cookies()` read in the root layout would make every page's shell dynamic, and a collapsed-by-preference viewer sees one frame of the expanded sidebar. Accepted trade-off for Phase 1; revisit if it is noticeable.
5b. **Ported, not installed.** The shadcn base-nova `sidebar` file was read and cut down to what the app uses (provider, sidebar, trigger, inset, header, footer, content, group, menu, menu button, separator). Dropped: mobile `Sheet`, `use-mobile`, input, skeleton, rail, sub-menus, badges, actions. The sidebar is `sticky` in a flex row, not `fixed` with a gap element, so it can also be shown inside the `/design` gallery. The menu button's tooltip uses the existing `Tooltip` only when collapsed.
6. **Supersession.** ADR 0025 supersedes ADR 0023's "pickers move to the top of the dashboard sidebar and leave the header" only; the rest of 0023 (view in the URL, proxy, `carryParams`) stands.

### Visual language and charts (phase 2)

7. **shadcn chart over Recharts 3.8.0**, peers checked first (task 3.1). The registry item lists `lucide-react`; the installed `chart.tsx` uses none. Fallback if peers reject React 19.3: plain SVG for the simple shapes and an ADR note. Hand-written SVG for everything was considered and rejected: it repeats axes, ticks and tooltips.
8. **Tokens, not per-chart styles.** `--chart-subject` (teal), `--chart-comparison` (neutral), `--chart-uncertain` (amber), `--chart-grid`, five heatmap steps as tints of the subject, plus the sidebar tokens shadcn needs (`--sidebar`, `--sidebar-foreground`, `--sidebar-accent`, `--sidebar-border`, `--sidebar-ring`) mapped onto existing tokens so no new colour appears. Light and dark values, contrast pairs in `scripts/check-contrast.ts`.
9. **Components** (each in `/design` and `docs/design.md`): `AppSidebar`, `AppHeader`, `ChartFrame`, `SectionCard` (dashboard-01 anatomy: label, trend badge, value, line, sparkline, comparison, chip, Show math), `TrendBadge`, `AreaChartInteractive`, `ThreadLine`, `BulletBars`, `PairedBars`, `Waterfall`, `Donut`, `Heatmap` (CSS grid on tokens), `HatchedBar`, `AnimatedValue`. Charts are client components fed by server pages through props; the engine is not imported client-side.
10. **No arithmetic in components.** Values, bands, bucket levels, waterfall starts and ends, range totals and trends all come from the engine. Slicing a series to the last 3, 6 or 12 points, sorting rows and scale mapping are selection and rendering, allowed. The engine returns `windows` (the totals for 3, 6 and 12 months) so the range toggle never sums in the client.
11. **TrendBadge** reuses the DeltaBadge idea: a word (Up, Down, Flat), a Phosphor glyph and a signed mono percent from the engine's `trend`. One neutral style; it states direction, never good or bad, because for dormant sites up is bad and for avoided cost up is good. A Show math entry explains the comparison (Q4 against Q3, or December against September).
12. **Sites table** extends `SiteTable` rather than adding a library: header click sorts (ordering only), a name filter, `aria-sort` on headers, the per-column chip and Show math retained, rows link to the site page. If the user wants column visibility or pagination, `@tanstack/react-table` is added with an ADR (0024 amended before apply; it is not drafted yet).
13. **Provenance chip** (unchanged from the earlier plan): a `label` variant showing method glyph and short word plus a source mark with an accessible name; several methods show the least certain word and "+N". One page legend line from `ChipLegend`.
14. **Comparison naming.** Labels say "comparison" with the chosen name (for example "vs Home washing"); the Cautious, Standard, Generous estimate labels stay; no "baseline factor" in dashboard copy.
15. **Needs input** draws a `HatchedBar` labelled "Needs input", with the assumption id in Show math; never 0.

### Motion (C3-B, Phase 2)

16. **A closed list, stated as a rule.** `docs/design.md` principle "Calm data, effects elsewhere" becomes: "Data views are flat and quiet. Motion in the dashboard is exactly four things: a once-only count-up of the six Overview tile values, an animated hover and active indicator on sidebar items, a soft spotlight on Overview tiles on hover, and a one-time fade-in of chart sections on first load. All are off under `prefers-reduced-motion`. No other number moves; glow, tilt and scene art stay in Story and Impact World." ADR 0025 records the same list. The docs and the ADR are updated in Phase 1 so the rule exists before the motion does.
16b. **Components.** CountUp and SpotlightCard from the `@react-bits` registry, installed and then adapted (theme tokens, no hard-coded colours; the spotlight colour is `--primary` at low alpha). The sidebar indicator and the fade-in are small wrappers on `motion` (React Bits' FadeContent needs `gsap`, an extra runtime for one fade). A component whose dependencies include another icon set is skipped.
16c. **Trend tooltip.** Each trend badge has a tooltip that states the exact comparison period from the engine's `trend.from` and `trend.to` ranges, so the two rules (three months against three, December against September) are visible on the badge.
17. **`AnimatedValue`** wraps React Bits `CountUp` (installed via the shadcn registry, then edited): it receives the Fact's already-formatted display string from `formatCardValue` and the numeric target and decimals derived from that same function's rounding, never a raw engine value. The visually hidden text and the `aria-label` hold the exact final string from `formatCardValue`, so assistive tech and tests see the landed value from the first render; the animated text is `aria-hidden`. On `onEnd`, and whenever `prefers-reduced-motion: reduce` is set, the final string is shown with no animation. A null value (Needs input) renders no count-up. Triggers once when the tile enters view (`trigger="view"`), no replay, no hover replay. `motion` is the only runtime this adds.
18. **Test of the landing.** A Vitest/RTL test renders `AnimatedValue` for a set of display strings (whole, one decimal, percent, large with separator) and asserts the final text equals `formatCardValue` output; a second test with reduced motion asserts no animation timer is started.

## Risks / Trade-offs

- [Four-way width budget, 1230px with both sidebars open] → container queries on cards, 2-column fallback under 640px, checked at 1230 and 1280 in all four sidebar combinations.
- [shadcn sidebar uses `asChild`-style composition, this project's primitives sit on base-ui] → port the installed files to the render-prop style of the existing `button.tsx`/`popover.tsx`; keyboard and focus tests in task 2.
- [Sidebar tooltips duplicate `Tooltip`] → mapped onto the existing `Tooltip`, shown only when collapsed.
- [Superseding part of ADR 0023 moves the pickers a second time] → intended by the user's dislike of the current nav; the URL params do not change, only where the controls sit.
- [Trend model is a presentation choice in the engine] → documented in the series' formula text, tested, flagged for review.
- [Count-up near an exact number can mislead if it ends on a different rounding] → landing test; final string comes from one formatter.
- [`motion` adds bundle weight] → Overview only, client-side, loaded with the tile component; if the user chooses C3-C it is not installed.
- [dashboard-01 gradient cards and shadows] → not carried; tokens and hairlines only.
- [Six tiles with chip, trend, sparkline, bar and Show math is dense] → one line of meaning per tile, equal height, the chip is one line, Show math holds the rest.

## Migration Plan

Two gated phases in one change. Phase 1 (tasks 1 to 4) lands navigation, header, tokens, the two ADRs and docs, and the Overview shell with the six cards on Facts only (the three previous Overview Facts kept as a smaller row), then stops for review. Phase 2 (tasks 5 to 9) adds the engine series, charts, the table and the motion. Rollback of phase 1 is removing the `SidebarProvider` wrapper and restoring the tab bar and `DashboardSidebar` from git.

## Open Questions

- C1 to C5 above, with recommendations; the specs assume them.
- The trend definition (Q4 against Q3; December against September) is to be confirmed.
- Whether the user wants `@tanstack/react-table` after all (recommendation: no).
