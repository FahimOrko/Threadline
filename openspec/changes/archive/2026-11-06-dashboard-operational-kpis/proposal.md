# Proposal

## Why

The dashboard shows one KPI for one hard-coded customer. Slice 3 (core dashboard) needs the operational KPIs, a way to choose a customer, and a per-site view. This is change 1 of 3 and the smallest data extension: it adds only the `service_activity` sheet and gives later changes (money and percentages, footprint) the customer scoping and the wearer and garment denominators they reuse.

## What Changes

- Pipeline loads `service_activity` (dictionary sheet `Service_Activity`, strict schema, header checked, ADR 0012) into `data/generated/`. `washing_pct` stays in the JSON, unused, with a note that its definition is unclear.
- Engine adds one Fact per KPI: Delivery sites, Active wearers, Garments in circulation, Repairs, Service requests, Service requests per 100 wearers (Dec), plus a thin `operationalFacts(data, scope)` that returns the list together with the existing Replacements postponed.
- Active wearers = latest month in the period (Dec 2025), maximum across product rows per site, then summed over sites. NorthStar: 9,607. Show math states that the pack's `sample_output.csv` shows 28,367 because it sums across product rows, which double-counts people.
- Service requests per 100 wearers is labelled "per 100 wearers (Dec)"; Show math explains it divides the full-year count by the December wearers.
- Dashboard renders the Facts as `FactStatCard`s for the selected customer, full year 2025. No period picker. The server page reads `searchParams`, resolves the customer and passes it down.
- Header customer picker replaces the "Customer: not selected" placeholder. It is the shadcn Select primitive, added to `/design` and `docs/design.md`, and it only navigates to `?customer=`. An unknown value falls back to NorthStar with a visible notice, never a crash.
- ProvenanceChip gets a compact variant: method glyph in the certainty tint only, full text in a tooltip and an accessible label, focusable with the tooltip on focus. Shown in `/design` next to the full chip (with the stress case) and in `docs/design.md`.
- New reusable `SiteTable` (wearers, garments, repairs, service requests per site; no drill-down links) with one compact ProvenanceChip and one Show math per numeric column header (wearers CALCULATED, the others MEASURED), added to `/design` with a labelled fixture and to `docs/design.md`. Show math states each column's full method and source.
- Last task records the ADR, convention and runbook updates and the ADR index.
- No role-dependent content: KAM and Customer see the same cards.

Out of scope: money cards, percentages, footprint, baseline selector, site drill-down page, dormant-tier share, period picker.

## Capabilities

### New Capabilities
- `customer-selection`: which customer the app shows, chosen in the header, carried in the URL, with a safe fallback for unknown values.

### Modified Capabilities
- `kpi-engine`: adds the operational KPI Facts, per-site rows and their rules.
- `data-pipeline`: adds the `service_activity` sheet to the scope of sheets.
- `dashboard-kpis`: the dashboard shows the operational cards and the site table for the selected customer.
- `app-shell`: the header customer placeholder becomes a working picker.
- `design-system`: adds the SiteTable and Select components.
- `provenance-display`: adds the compact chip variant.

## Impact

- Code: `src/lib/data/` (schema, pipeline, generated source), `src/lib/engine/`, `src/lib/customer.ts`, `src/app/dashboard/page.tsx`, `src/app/layout.tsx` and `src/components/app-shell.tsx` (customer list passed from the server), new `src/components/ui/select.tsx` and `src/components/site-table.tsx`, `/design` page and sample folder.
- Docs: `docs/design.md`, `docs/conventions.md`, `docs/runbooks/rebuild-data.md`, new ADRs and `docs/adr/README.md`.
- Tests: Vitest for schema, pipeline, each engine function, the fallback logic and the new components.
- New dependency: none expected; the shadcn Select sits on the already installed `@base-ui/react`. The shadcn CLI adds `ui/select.tsx` during apply.

## Done when

- `npm run data:build` loads `service_activity` (1,248 rows, 0 invalid) and a header mismatch fails the build.
- NorthStar shows 24 sites, 9,607 active wearers (Show math explains the pack's 28,367), 31,743 garments, 15,233 repairs, 15,233 replacements postponed, 515 service requests and the per-100-wearers (Dec) rate, each with provenance and Show math.
- The 24 site rows sum to 9,607, 31,743, 15,233 and 515; headers carry per-column compact chips (wearers CALCULATED, others MEASURED); rows have no drill-down links; the table fits 1280px without horizontal scroll.
- The header picker sets `?customer=`; an unknown value shows NorthStar with a notice and the picker agrees; view links keep the customer; the period is fixed at 2025.
- Show math is one popover pattern on cards and table headers, opens and closes by mouse, Enter, Esc and outside click without changing layout, and stays on screen.
- Cards and table are identical in the KAM and Customer roles; the browser never fetches the generated JSON.
- Select, compact chip (with stress case), SiteTable and the popover are in `/design` and `docs/design.md`.
- ADRs 0014 and 0015, the ADR index, conventions and the rebuild runbook are updated.
- `npm run data:build`, `npm test`, `npm run lint`, `npm run build`, both `check:*` scripts and `openspec validate --strict` pass.
