# Proposal

## Why

The dashboard stops at one row per site. Slice 3 change 3b lets a user open a site and see its own figures next to the customer's, so the page says something the dashboard does not.

## What Changes

- **Route** `/dashboard/sites/[siteId]`, linked from the site name in each `SiteTable` row. The link and the back link keep `?customer=`. An unknown `siteId`, or a site that does not belong to the selected customer, renders the not-found page.
- **Header**: site name, site type, laundry name (from `laundries.csv`), and a back link to the dashboard.
- **Pipeline**: `laundries.csv` is added with the existing header check and strict validation and shipped as `laundries.json`. A site whose `primary_laundry_id` is not in `laundries` fails the build, naming the ids and the sheet.
- **Engine**: `OperationalScope` gains an optional `siteId`. When set, every Fact below filters its rows by site and carries the site in `scope`. Without it nothing changes.
- **Sections** reuse the dashboard layout and `FactStatCard` with site scope (see the table). Facts that cannot be computed honestly at site level are left out, and one line on the page says which and why. No customer-level number stands in for them.
- **Comparison**: site vs customer for garment utilization (Dec) and repairs per 100 garments (Dec, all products), as pairs of `FactStatCard`s with labels naming the scope. Both come from existing Facts; repairs per 100 garments is repairs divided by garments in circulation, the same formula as the per-product Fact over all products.
- The site table requirement changes from "SHALL NOT link rows" to "SHALL link rows".

### Which Facts can be site-scoped

| Fact | Site | Why |
|---|---|---|
| Active wearers, Garments in circulation | yes | `service_activity` has `site_id` |
| Repairs, Replacements postponed, Avoided purchase cost | yes | `repairs` has `site_id` |
| Service requests, per 100 wearers (Dec) | yes | `service_activity` has `site_id` |
| Value kept in use, Cost of unused allocation, Utilization | yes | `service_activity` has `site_id` |
| On-time cycle rate | yes | `cycleCounts` keeps `site_id` |
| Repairs per 100 garments, by product | yes | `repairs` and `service_activity` have `site_id` |
| Delivery sites | no | always 1 for a site, so it says nothing |
| Recycling and reuse share | no | waste is reported per laundry and allocated to the customer by washed-kg share (A003), not to sites |
| Footprint (saved, service, delivery) | no | the pipeline's `impactAllocation` reduction drops `site_id`, so the shipped data has no site split. `customer_impacts.csv` does have `site_id`; a later change can keep it |

Out of scope: new KPIs, garment-level signals, mobile layout, footprint at site level.

## Capabilities

### New Capabilities
None.

### Modified Capabilities
- `data-pipeline`: the `laundries` sheet and the site-to-laundry reference check.
- `kpi-engine`: optional `siteId` in the scope, site comparison Facts.
- `dashboard-kpis`: site table links, the site page, not-found rule.

## Impact

- Code: `src/lib/data/` (schemas, pipeline, generated source), `scripts/build-data.ts`, `src/lib/engine/` (`operational.ts`, `value.ts`, `percentage.ts`, `replacements-postponed.ts`, `fact.ts`, `index.ts`), `src/components/site-table.tsx`, new `src/app/dashboard/sites/[siteId]/page.tsx` (and `not-found.tsx` only if none exists), `src/components/fact-stat-card.tsx` (a "Site" line in Show math).
- Docs: `docs/conventions.md` one line on the site scope, `docs/runbooks/rebuild-data.md` (new sheet and check). No new component, so `/design` and `docs/design.md` stay as they are.
- Tests: schema and pipeline (valid `laundries`, header mismatch, missing laundry reference), engine site scope in `tests/`, `site-table.test.tsx` link.
- Dependencies: none.

## Done when

- Site Facts sum to the customer figures where they are additive (wearers, garments, repairs, requests across all of NorthStar's sites match the customer Facts), and the `SiteTable` row values equal the site page values.
- Unknown site and a site of another customer both render not-found; the back link and row links keep `?customer=`.
- A Playwright + Chrome check at 1280px passes in dark and light.
- `npm run data:build` loads `laundries` (4 rows) and a site with an unknown laundry fails the build naming it.
- `npm test`, `npm run lint`, `npm run build`, both `check:*` scripts and `openspec validate site-drill-down --strict` pass.

## Open questions

- **Laundry name** (decided): shown in the header; `laundries.csv` joins the pipeline.
- **Footprint at site level** (decided: leave out). Doable later by keeping `site_id` in `impactAllocation`.
- **Site table link** (decided): rows link to the drill-down.
- **Utilization and repair rate on very small sites** may swing widely; the comparison shows both numbers and does not rate them.
