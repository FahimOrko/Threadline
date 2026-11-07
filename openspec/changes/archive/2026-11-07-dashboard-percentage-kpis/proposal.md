# Proposal

## Why

The dashboard shows operational and money KPIs but no rates. Slice 3 change 2b adds three rate KPIs (on-time cycles, repairs per 100 garments by product, recycling and reuse share of waste). Each needs a sheet the pipeline does not load yet.

## What Changes

- **Pipeline** loads `service_cycles`, `waste_circularity` and `customer_impacts` with the existing set-based header check, strict row validation and report lines.
  - `service_cycles` (16 415 rows) is sorted by pickup timestamp per asset and pre-aggregated at build time to per-site counts (`customer_id`, `site_id`, cycles, on-time). The raw cycles are validated but never written to `data/generated/`, so the browser bundle never holds them.
  - Out-of-order scans are counted in the data-quality report with the product spec definition: cycle number order disagrees with timestamp order for the same asset. The product spec expects about 1,107 on the pack; a large difference is reported and explained, the definition is not tuned. The rows stay in the counts.
  - A build-time cross-check requires every laundry-month in the customers' allocated waste to exist in `waste_circularity`; otherwise the build fails naming the missing laundry-months (docs/conventions.md rule for references a computation depends on).
  - `customer_impacts` (1 248 rows) is pre-aggregated to allocated textile waste per customer, laundry and month, the only column the waste KPI needs. `waste_circularity` (48 rows) is small and ships as validated rows.
- **Three KPIs**, per customer through `?customer=`, as Facts rendered with the existing `FactStatCard` in a new "Percentages" dashboard section:
  - **On-time cycle rate** = ON_TIME cycles / all cycles. MEASURED, SYNTHETIC. Labelled as a rate over sampled cycles.
  - **Repairs per 100 garments (Dec)**: one card per product the customer has = full-year repairs / December allocated pieces x 100, unit "per 100 garments", no % sign, one decimal. It counts repair events, so one garment can be repaired more than once and the value can exceed 100. Same "(Dec)" labelling and style as service requests per 100 wearers. CALCULATED, SYNTHETIC.
  - **Recycling and reuse share of textile waste** = (recycling + reuse) / total waste at each laundry-month, weighted by the customer's allocated waste kg. ALLOCATED + ESTIMATED, SYNTHETIC, assumptions A003 and A004. The method text says waste is allocated to the customer by washed-kg share.
- On-time rate and waste share are percentages (`unit: "%"`, existing one-decimal rule). Repairs per 100 garments uses the same one-decimal rule with its own unit.

Out of scope: utilization (done), dormant tier share and garment signals (Slice 5), footprint and baseline percentages (change 3), `washing_pct`, mobile layout, any use of the other `customer_impacts` columns.

## Capabilities

### New Capabilities
None.

### Modified Capabilities
- `data-pipeline`: adds the three sheets, build-time pre-aggregation of cycles and impacts, and the out-of-order count.
- `kpi-engine`: adds the three KPIs and their Facts.
- `dashboard-kpis`: adds the Percentages section.

## Impact

- Code: `src/lib/data/` (schemas, pipeline, generated source), `scripts/build-data.ts`, `src/lib/engine/` (new percentage Facts, `index.ts`), `src/app/dashboard/page.tsx`.
- Docs: `docs/runbooks/rebuild-data.md` (new sheets and expected counts), `docs/conventions.md` only if the "aggregate big sheets at build time" rule is worth one line.
- Tests: Vitest for schemas, pipeline (aggregation, out-of-order count, header mismatch) and each KPI.
- Dependencies: none. No new component, so `/design` and `docs/design.md` are unchanged.

## Done when

- `npm run data:build` prints lines for the three sheets, `data/generated/` holds no raw cycle rows, and the report shows the out-of-order count.
- NorthStar shows the three KPIs with correct provenance; another customer shows its own values; the cards are identical in KAM and Customer roles.
- Engine values match an independent recomputation from the CSVs; any disagreement is reported, never forced.
- A Playwright + Chrome check at 1280px passes in dark and light themes.
- `npm run data:build`, `npm test`, `npm run lint`, `npm run build`, both `check:*` scripts and `openspec validate dashboard-percentage-kpis --strict` pass.
