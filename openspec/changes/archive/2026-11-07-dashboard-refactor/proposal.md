## Why

The dashboard is one long page of cards grouped by format ("Money and utilization", "Percentages"), and it is reachable in every view although it is a KAM workspace. Story and Impact World are shared with the customer. This change gives the dashboard a real structure and a clear audience. Charts, lighter cards and new engine series follow in the separate change `dashboard-content`, which builds on this one.

**Name:** the intent was to call this change `dashboard-shell`. OpenSpec has no rename command (`openspec change` only offers show, list and validate), so it keeps the name `dashboard-refactor`. It is Part A only.

## What Changes

- The dashboard becomes a KAM-only workspace with a left sidebar and one subroute per section under `/dashboard`: Overview, Garments and utilization, Costs, Environmental footprint, Signals, Sites.
- Each section opens with a subheading and a 2-3 sentence plain-language intro. The intro is fixed template text; every number in it is a `{{fact:id}}` token, never typed in.
- Today's cards and the site table move into the section where they belong, unchanged in look and content. Nothing is added, no chart, no new KPI.
- `?view=customer` is wired. The header KAM/Customer toggle writes `?view=`, and the persisted role store is deleted, so `?view=` is the single source of truth (`resolveView`, KAM by default).
- A Next.js proxy (`src/proxy.ts`; "middleware" was renamed Proxy in Next.js 16, checked in the bundled docs) redirects any `/dashboard/:path*` request to `/story/game` when `view=customer`, keeping `view` and `customer`. No per-page guards.
- In customer view the dashboard is absent from navigation. Leaving the dashboard for Story or Impact World carries `view` only; `customer`, `baseline`, `sensitivity` and `priorities` are dropped. Inside Story, the game, report and print keep sharing params as today.
- The customer, baseline and sensitivity pickers move to the top of the dashboard sidebar and leave the header on `/dashboard` routes. They stay in the header on Impact World. The Cautious / Standard / Generous estimate labels are unchanged.
- Signal observations move to the Signals section, linking to site pages. The site table moves to `/dashboard/sites`, and site pages (`/dashboard/sites/[siteId]`) keep working inside the sidebar layout.

**BREAKING (UI only):** `/dashboard` stops being one long page, and `/dashboard/sites` is new.

## Section intros (drafts)

`{customer}` and `{period}` are plain words filled by the page, as `{baseline}` is in Story. Intros do not mention charts, which arrive in `dashboard-content`.

| Section (route) | Subheading | Intro draft | Cards moved here (existing Facts) |
|---|---|---|---|
| Overview `/dashboard` | What this dashboard shows | This is {customer}'s {period} with Lindström. We looked after garments for {{fact:active_wearers}} at {{fact:delivery_sites}}, keeping {{fact:garments_in_circulation}} in use. The pages on the left go deeper: garments, costs, the environment, things worth acting on and each site. Each figure has a "Show math" link that says where it comes from. | `delivery_sites`, `active_wearers`, `garments_in_circulation` |
| Garments and utilization `/dashboard/garments` | How the garments are used | Garments only create value when they are worn. Here {{fact:garments_in_circulation}} garments are shared among {{fact:active_wearers}}, and {{fact:garment_utilization}} of them are in use. Repairs, such as {{fact:repairs}} this year, keep garments in service longer. | `garment_utilization`, `repairs`, `service_requests`, `service_requests_per_100_wearers`, `on_time_cycle_rate`, `repair_rate_*` |
| Costs `/dashboard/costs` | What the service saved in purchases | Buying garments is a cost the customer avoids when Lindström keeps them in circulation. {{fact:avoided_purchase_cost}} of purchases were avoided this year, and {{fact:garment_value_kept_in_use}} of garment value is still in use. Pieces allocated but not used cost {{fact:cost_of_unused_allocation}}, which is where the customer can save more. | `avoided_purchase_cost`, `garment_value_kept_in_use`, `cost_of_unused_allocation`, `replacements_postponed` |
| Environmental footprint `/dashboard/footprint` | What the service saved the environment | Compared with {baseline}, using the {sensitivity}, the service saved {{fact:water_saved}} of water, {{fact:energy_saved}} of energy and {{fact:co2e_saved}}. Delivery is {{fact:delivery_share}} of the service's own emissions. Baseline values are illustrative, so the savings move with the estimate chosen. | footprint groups saved, service, delivery; `recycling_reuse_share` |
| Signals `/dashboard/signals` | Where to look first | The data points to a few places that deserve a conversation. Pieces sitting unused for long, sites with too few garments for their wearers and sudden repair spikes show up here. Each one links to the site, so the KAM can check the story before raising it. | the observations, each flagged site linking to its page |
| Sites `/dashboard/sites` | Compare your sites | Each site is a place where garments are worn. Compare them here, then open one to see its own numbers. Wearers and garments are December {period}; repairs and requests are the full year. | the site table |

Each existing Fact appears on exactly one page. If `replacements_postponed` is not in the operational list today, it is shown on Costs as it is now. Intro text with a missing token value shows "needs input", never a number.

## Capabilities

### New Capabilities
- `dashboard-navigation`: sidebar, subroutes, customer-view absence and proxy redirect, param dropping on leaving the dashboard, picker placement.
- `dashboard-sections`: the section opening (subheading and token-only intro) and the Overview explanation.

### Modified Capabilities
- `app-shell`: header pickers are hidden on `/dashboard` (they move into the sidebar), view links drop params, and the view toggle writes `?view=`.
- `role-mode`: the toggle writes `?view=`; no store.
- `dashboard-kpis`: one page becomes subroutes, "Same content for both roles" becomes "KAM only", observations move to Signals, and the site page sits under the sidebar.

## Impact

- Code: `src/app/dashboard/**` (new layout and 5 new routes), new `src/proxy.ts`, `src/components/app-shell.tsx`, `src/lib/selection.ts` (a link-params helper and a customer-redirect helper, both pure), deletion of `src/store/role-store.ts` after a grep shows no other reader, a new dashboard sidebar component, `docs/design.md` and `/design` for the sidebar component, `docs/conventions.md` (view and link params).
- Dependencies: none.
- Docs: a new ADR for view mode and the proxy redirect.
- Tests: Vitest for the new selection helpers and the proxy decision.

## Out of scope

Charts, engine additions, the provenance chip change, the new Overview KPIs (all in `dashboard-content`), the story report and PDF, Impact World, AI features, mobile.
