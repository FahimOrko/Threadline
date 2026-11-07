# Proposal

## Why

The dashboard shows numbers but no reading of them. Slice 5 turns the data already in the pack into three garment signals (dormant garments, over-allocation, repair spikes) and a small set of rule-based observations, so a reviewer sees what to discuss first. The product spec requires at least 3 observations (one value highlight, one risk, one data gap); Review Prep (Slice 7) will reuse the same list later.

## What Changes

- Build-time pipeline step: for each asset, sort pickups by timestamp, take the gaps between consecutive pickups and ship a per-site gap histogram (whole days to count). Raw cycles still never ship.
- Team assumptions T003 to T010 in `assumptions-config.ts`: three dormant tier rows (Watch/Risk/Critical days), the site-type to tier mapping, the over-allocation cut-off (80 %), the repair-spike ratio (1.5), its trailing window (3 months) and a minimum absolute increase over the trailing mean (10 repairs). All are declared modelling choices with set values (ADR 0017), not unknowns. No pack assumption (A001 to A008) covers any of them.
- Unmapped site types (Central Laundry Hub) are skipped by dormant classification and listed in Show math as not classified, never dropped silently.
- Engine signals, each returning Facts with provenance: dormant garments per site, over-allocation per site, repair spikes per site.
- Engine rules function returning `Observation[]` in the product spec shape. No ranking, no curation.
- `ObservationCard` component (in `/design` and `docs/design.md`) and a new "Observations" section on the dashboard. Site-scoped observations link to the existing site page, keeping `?customer=`, `?baseline=` and `?sensitivity=`.

Result for NorthStar (full year 2025, checked on the pack):

| Observation | Type | Flags |
|---|---|---|
| Replacements postponed by repairs (15 233) | value | customer |
| Dormant garments reached the Critical tier | risk | S007 (2 gaps), S018 (1 gap) |
| Low garment utilization (Dec, below 80 %) | risk | S010 75.6 %, S001 76.2 %, S024 78.5 %, S002 79.0 % |
| Repair spike (month at 1.5x or more of the trailing 3-month mean and at least 10 repairs above it) | risk | S006 (Nov), S007 (Nov), S018 (Aug, Oct), S021 (May), S023 (Nov) |
| Cost of unused allocation needs the rental fee (T001 unset) | data gap | customer |

The thresholds were set from the spec table and round numbers, not tuned to a site. The 10-repair floor removes S022, which the ratio alone flagged on 18 repairs against a mean of 12. At 1.4 the repair rule would flag 10 of the 24 sites and at 1.3 eighteen of the 24; 1.5 was kept as the first round value that flags a minority of sites.

## Capabilities

### New Capabilities
- `garment-signals`: dormant garment, over-allocation and repair-spike signals as Facts, with thresholds from team assumptions.
- `observations`: rule-based observations built from the signals and existing Facts, in a shape Review Prep can reuse.

### Modified Capabilities
- `data-pipeline`: adds the per-site pickup-gap aggregate.
- `team-assumptions`: adds T003 to T010 as set modelling choices.
- `design-system`: adds the ObservationCard component.
- `dashboard-kpis`: adds the Observations section.

## Impact

- `scripts/build-data.ts` and `src/lib/data/` (pipeline, schemas, generated JSON gains one file), `src/lib/engine/` (config, signals, rules, exports), `src/components/` and `src/app/design/`, `src/app/dashboard/page.tsx`, `docs/design.md`, `docs/conventions.md` (one line), a new ADR for the thresholds, Vitest tests in `tests/`.
- Out of scope: SYNTHETIC_TEAM generator, hi-vis for NorthStar, shortage risk, late cycles, service-request hotspots, ranking, KAM curation, an observations block on the site page, mobile layout.
