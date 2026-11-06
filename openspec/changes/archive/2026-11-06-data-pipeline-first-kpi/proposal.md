# Proposal

## Why

Every later slice reads validated data, runs the engine and shows values with provenance, but none of that exists yet: `data:build` is a stub, `src/lib/engine` and `src/lib/data` are empty. Slice 2 proves the whole path with one KPI, Replacements postponed, so Slice 3 onward only adds KPIs.

## What Changes

- `npm run data:build` parses the CSVs it needs (repairs, sites, customers, assumptions), checks each header against its sheet in `data_dictionary.csv`, validates rows with Zod and writes JSON to `data/generated/`. A missing or unknown column (compared as a set, order ignored) fails the build.
- A per-file data-quality report (rows read, valid, invalid with reasons, cross-check results) is written next to the JSON. Invalid rows are counted, never dropped silently.
- A `DataSource` interface with one JSON adapter hands plain data to the engine.
- A pure, isomorphic engine function returns the Replacements postponed Fact (raw number and unit, no formatting). It computes from `repair_count` and cross-checks `estimated_replacements_postponed`.
- `src/lib/format` turns a Fact value into display strings.
- A reusable `FactStatCard` maps a Fact to `StatCard`, `ProvenanceChip` and `ShowMath`. It is added to `/design` (fixture Fact) and `docs/design.md`.
- The dashboard shows one card: Replacements postponed, NorthStar, full year 2025, loaded in a server component.
- `prebuild` and `predev` scripts run `data:build`; `data/generated/` is git-ignored and `data/raw/` stays committed.
- ADR 0012 (column-set mismatch fails the build), ADR 0013 (generated data is built, not committed), a conventions update and a rebuild-data runbook update.

Out of scope: other KPIs, baselines, low/high range (Slice 4), customer selector, period selector, browser overlay, the other 15 sheets.

## Capabilities

### New Capabilities
- `data-pipeline`: CSV to validated JSON, header verification, data-quality report, `DataSource` adapter.
- `kpi-engine`: pure Fact computation, with Replacements postponed as the first KPI.
- `dashboard-kpis`: dashboard card showing an engine Fact with provenance and Show math.

### Modified Capabilities
- `provenance-display`: adds the FactStatCard requirement (Fact to StatCard, chip and ShowMath, with "not yet modelled" range).

## Impact

- New: `scripts/` data build, `src/lib/data`, `src/lib/engine`, `src/lib/format`, `src/components/fact-stat-card.tsx`, `tests/`, `data/generated/` (ignored).
- Changed: `package.json` (`data:build`, `prebuild`, `predev`), `.gitignore`, `src/app/dashboard/page.tsx`, `src/app/design/`, `docs/design.md`, `docs/conventions.md`, `docs/runbooks/rebuild-data.md`, `docs/adr/`.
- No new dependencies (`zod` and `papaparse` are installed).
- Checked against the data: NorthStar repair_count sums to 15 233 over 2 500 rows, equal to the sheet's `estimated_replacements_postponed` on every row.
