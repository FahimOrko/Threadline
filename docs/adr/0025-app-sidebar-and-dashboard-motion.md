# 0025. App-wide sidebar, where the controls live, and the closed list of dashboard motion

- Status: accepted
- Date: 2026-11-07
- Supersedes: 0023 in part (only where the pickers sit; view in the URL, the proxy and `carryParams` stand)

## Context

The top tab bar plus a dashboard-only sidebar gave two navigation levels, and the user dislikes the top navigation. ADR 0023 put the customer, baseline and sensitivity pickers at the top of the dashboard sidebar. The AI sidebar on the right takes 20rem, so at 1230px a full-width app sidebar leaves a narrow main area. The dashboard also wants a little life without breaking the calm-data rule in `docs/design.md`.

## Decision

**Navigation.** One collapsible sidebar replaces the top tab bar on every view except the print route. It is the shadcn base-nova `sidebar` item, cut down to what is used (no mobile Sheet, input, skeleton, rail or sub-menus), with Phosphor icons. Group "Dashboard": Overview, Garments and utilization, Costs, Environmental footprint, Signals, Sites. Group "Shared": Story, Impact World. In customer view only Story and Impact World show; the proxy redirect of 0023 is unchanged. Items are flat, so they stay reachable by icon and tooltip when collapsed. Open or collapsed is a viewer preference in a cookie (`sidebar_state`), read after mount; it is not a URL param.

**Controls.** Customer picker: the sidebar's switcher slot (initials when collapsed; hidden on the game). KAM/Customer and theme toggles: the sidebar footer. Header: sidebar trigger, breadcrumb, then on dashboard routes the baseline and estimate (sensitivity) pickers, and the AI toggle. Each picker still changes only its own URL param (0014, 0017). A site page names its last breadcrumb crumb.

**AI sidebar.** On dashboard routes, while the AI sidebar is open the app sidebar shows collapsed to icons, so the main area stays usable at 1230px. It restores when the AI sidebar closes, unless the user toggled the app sidebar since the AI sidebar last changed. An automatic collapse does not write the cookie.

**Motion in data views, a closed list.** `docs/design.md` said motion, glow and scene art appear only in Story and Impact World. The dashboard now allows exactly four things, all off under `prefers-reduced-motion`: (1) a once-only count-up of the six Overview tile values (React Bits `CountUp`), which lands on the exact string the display rules produce, with the same string in the accessible text from first render; (2) an animated hover and active indicator on sidebar items; (3) a soft pointer-following spotlight on Overview tiles on hover (React Bits `SpotlightCard`), no tilt and no layout shift; (4) a one-time fade-in of chart sections on first load, no replay. No other number animates. Glow, tilt and scene art stay in Story and Impact World. A React Bits component whose dependencies pull another icon set is not used (Phosphor only).

**Dependencies.** The shadcn sidebar items (ported), and `motion@^12` for the four effects in Phase 2 (the fade-in is built on `motion` rather than React Bits `FadeContent`, which needs `gsap`).

## Consequences

- `AppShell` is rebuilt around the sidebar; `DashboardSidebar` and the tab bar are removed. Pickers move a second time, but no URL param changes.
- The calm-data rule has a closed exception; adding a fifth effect needs a new ADR.
- The cookie is read on the client, so a viewer who collapsed the sidebar sees one expanded frame on load. A server read would make every page's shell dynamic under `cacheComponents`.
- Reading the sidebar state in tests: `data-state` on the sidebar element.
