# Proposal

## Why

The dashboard shows one KPI for one hard-coded customer. Slice 3 (core dashboard) needs the operational KPIs, a way to choose a customer, and a per-site view. This is change 1 of 3 and the smallest data extension: it adds only the `service_activity` sheet and gives later changes (money and percentages, footprint) the customer scoping and the wearer and garment denominators they reuse.

## What Changes

- Pipeline loads `service_activity` (strict schema, header checked against the data dictionary, ADR 0012) into `data/generated/`.
- Engine adds one Fact per KPI: Delivery sites, Active wearers, Garments in circulation, Repairs, Service requests, Service requests per 100 wearers, plus a thin `operationalFacts(data, scope)` that returns the list together with the existing Replacements postponed.
- Active wearers = latest month in the period (Dec 2025), maximum across product rows per site, then summed over sites. NorthStar: 9,607. Show math states that the pack's `sample_output.csv` shows 28,367 because it sums across product rows, which double-counts people.
- Dashboard renders the Facts as `FactStatCard`s for the selected customer, full year 2025. No period picker.
- Header customer picker replaces the "Customer: not selected" placeholder and sets `?customer=`. An unknown value falls back to NorthStar with a visible notice, never a crash.
- New reusable `SiteTable` component (wearers, garments, repairs, service requests per site; no drill-down links), added to `/design` with a labelled fixture and to `docs/design.md`.
- Last task records the ADR, convention and runbook updates and the ADR index.
- No role-dependent content: KAM and Customer see the same cards.

Out of scope: money cards, percentages, footprint, baseline selector, site drill-down page, dormant-tier share, period picker.

## Capabilities

### New Capabilities
- `customer-selection`: which customer the app shows, chosen in the header, carried in the URL, with a safe fallback for unknown values.

### Modified Capabilities
- `kpi-engine`: adds the operational KPI Facts and their rules.
- `data-pipeline`: adds the `service_activity` sheet to the scope of sheets.
- `dashboard-kpis`: the dashboard shows the operational cards and the site table for the selected customer.
- `app-shell`: the header customer placeholder becomes a working picker.
- `design-system`: adds the SiteTable component to the base set and the gallery.

## Impact

- Code: `src/lib/data/` (schema, pipeline, generated source), `src/lib/engine/`, `src/app/dashboard/page.tsx`, `src/app/layout.tsx` and `src/components/app-shell.tsx` (customer list passed from the server), new `src/components/site-table.tsx`, `/design` page and sample folder.
- Docs: `docs/design.md`, `docs/conventions.md`, `docs/runbooks/rebuild-data.md`, new ADR and `docs/adr/README.md`.
- Tests: Vitest for schema, pipeline, each engine function and the fallback logic; existing engine test file's sheet list grows.
- No new dependencies.
