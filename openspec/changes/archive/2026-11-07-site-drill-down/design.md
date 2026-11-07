# Design

## Context

`OperationalScope` is `{ customerId, period }` and every Fact builder filters rows by `customer_id`. All needed sheets (`service_activity`, `repairs`, `cycleCounts`) already carry `site_id`. The page conventions: the customer comes from `?customer=` via `resolveCustomer` (ADR 0014), numbers only from `src/lib/engine`.

## Goals / Non-Goals

- Goals: one route, site-scoped reuse of existing Facts, one small comparison, honest omissions.
- Non-goals: new KPIs, footprint split by site, mobile layout.

## Decisions

- **Scope, not new functions.** Add `siteId?: string` to `OperationalScope` and one shared row filter (`inScope`) in `operational.ts`. Each existing builder swaps its `customer_id ===` filter for it, so the site Facts use the same formulas. `Fact.scope` gains optional `siteId` and `siteName`; `FactStatCard` Show math adds a "Site" row when present.
- **Wearers rule at site level.** The maximum-across-product-rows rule already works per site, so it holds unchanged.
- **Omitted Facts are omitted by the page, not by flags in the engine.** `siteFacts(data, scope)` returns the operational (minus delivery sites), value and percentage (minus recycling share) Facts; the page prints one line listing recycling share and footprint as customer-level only, with the reason.
- **Comparison.** `siteComparison(data, scope)` returns pairs `{ site: Fact, customer: Fact }` for utilization and repairs per 100 garments, built by calling the same builders with and without `siteId`. Repairs per 100 garments (all products) is repairs over garments in circulation x 100, labelled "(Dec)" like the per-product Fact. Labels end in "this site" and "all <customer> sites". The page renders each pair as two `FactStatCard`s.
- **Route and guard.** `page.tsx` awaits `params` and `searchParams` inside `Suspense` like the dashboard (cacheComponents is on), resolves the customer, finds the site with `site_id === siteId && customer_id === customer.customer_id`, and calls `notFound()` when absent. Read `node_modules/next/dist/docs/` for `notFound` and `not-found.js` before coding.
- **Laundry name.** `Laundries` joins `SHEETS` (key `laundries`, strict schema of the five columns) and `AppData`. A reference check in `buildData` collects site `primary_laundry_id`s missing from `laundries` and throws `UnknownReferenceError` naming sheet `sites` and the ids; the pack's check passes with a report line. The page looks the name up in `data.laundries`; the lookup is not an engine number.
- **Links.** `SiteTable` links the site name to `/dashboard/sites/<id>?customer=<table.scope.customerId>` with the `Link` already used by the shell. The back link goes to `/dashboard?customer=<id>`.
- **Units and rounding.** Display through the existing `formatCardValue`; no rounding in the engine.

## Risks / Trade-offs

- A site with no December rows gives zero garments, so utilization is shown as 0 with the existing "undefined" note, and the repair rate is omitted rather than divided by zero.
- Sites of the same customer share a laundry, so footprint omission could look like a gap; the one-line note says why.
