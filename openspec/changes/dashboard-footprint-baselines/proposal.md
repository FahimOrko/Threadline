# Proposal

## Why

The dashboard has no environmental numbers yet, which is the core of Lindström's value story. Slice 3 change 3a adds water, energy and CO2e saved against a baseline, the service footprint and the delivery footprint. Slice 4 will add the baseline selector and sensitivity, so the engine must already take the baseline as a parameter.

## What Changes

- **Baseline** is fixed to the local laundry (`B_LOCAL`, assumption A001) in the dashboard. Every footprint and savings function takes the baseline as an argument, so Slice 4 only wires the selector. Every Fact carries `range = { low: null, base: value, high: null }` like the existing operational Facts: `base` equals the Fact value, only low and high stay empty until Slice 4. `value` and `range.base` are never `null` (null is reserved for unset team assumptions).
- **Pipeline** loads `laundry_resources` (48 rows) and `baselines` (3 rows) with the existing header check, strict validation and report lines. The `customer_impacts` reduction gains one column, the customer's washed kg per customer, laundry and month (it already holds allocated waste), and is renamed `impactAllocation`. The precomputed allocated and "vs local" columns are still not shipped.
- **Build-time reference checks** (docs/conventions.md rule), each failing the build non-zero with no JSON and naming the ids:
  - every laundry-month with washed kg in the impact allocation has a `laundry_resources` row with `washed_kg` > 0;
  - the default baseline id `B_LOCAL` exists in `baselines`.
- **Engine formulas** (washed kg per customer, laundry and month from the allocation; factors from the laundry-month and the baseline):
  - saving = sum of washed_kg x (baseline factor - laundry factor). Laundry water and energy factors are the sheet's per-kg columns; laundry process and delivery factors are the month's emissions / its washed_kg. The CO2e baseline factor is process + delivery.
  - saving % = saving / sum of washed_kg x baseline factor x 100.
  - service footprint = sum of washed_kg x (process + delivery factor), which equals the washed-kg share of the laundry's emissions; per tonne washed = footprint / (washed kg / 1000).
- **KPIs**, per customer through `?customer=`, as Facts rendered with `FactStatCard` in a new "Footprint" section with three groups. Every savings and footprint label names the baseline ("vs local laundry"), taken from the baseline passed in:
  - **Saved vs local laundry**: water (L, %), energy (kWh, %), CO2e (kgCO2e, %), and the net CO2e saved (process + delivery). ALLOCATED + ESTIMATED, SYNTHETIC, A001. The CO2e Show math notes that the local laundry baseline process factor is marked illustrative in the pack and sits far above the laundries' own factors, which drives the high percentage.
  - **Service footprint**: allocated process + delivery CO2e total, per tonne washed (kgCO2e/t), per active wearer (Dec). ALLOCATED (per tonne and per wearer also CALCULATED), SYNTHETIC.
  - **Delivery footprint**: allocated delivery CO2e and its share of total service emissions (%), with the net CO2e saved vs local laundry shown beside them (the same Fact as in the saved group, rendered in both places). Show math carries the product spec's honesty note and the delivery factor of the laundry against the baseline's. ALLOCATED, SYNTHETIC.
- **Route kilometres** stay a listed data gap: the delivery group and its Show math say so; there is no estimate and no Fact.
- Savings Facts are not read from the `customer_impacts` "vs local" columns. A test compares the engine totals with those columns per customer as a sanity cross-check and reports any disagreement.

Out of scope: equivalences (trees, bathtubs, car km), baseline selector and sensitivity (Slice 4), site drill-down (change 3b), mobile layout, textile waste diverted, avoided products.

## Capabilities

### New Capabilities
None.

### Modified Capabilities
- `data-pipeline`: adds the two sheets, the washed-kg column in the impact reduction and the two reference checks.
- `kpi-engine`: adds the baseline-parameterised savings, service footprint and delivery footprint Facts.
- `dashboard-kpis`: adds the Footprint section.

## Impact

- Code: `src/lib/data/` (schemas, pipeline, generated source), `scripts/build-data.ts`, `src/lib/format/` (card number display rule, all sections), `src/lib/engine/` (new footprint module, rename in `percentage.ts`, `index.ts`), `src/app/dashboard/page.tsx`.
- Docs: `docs/runbooks/rebuild-data.md` (two sheets, rename, new checks), `docs/conventions.md` only for a baseline-is-a-parameter line.
- Tests: schemas, pipeline (aggregate, both reference checks, header mismatch), each KPI against an independent recomputation, and the "vs local" cross-check. No new component, so `/design` and `docs/design.md` are unchanged.
- Dependencies: none.

## Done when

- `npm run data:build` loads `laundry_resources` (48) and `baselines` (3), both reference checks pass on the pack, and a missing laundry-month or baseline fails the build naming it.
- NorthStar from an independent recomputation (pack sample: 1 406 482.6 L and 255 073.1 kgCO2e): water saved 1 406 483 L (29.5%), energy saved 171 643 kWh (32.6%), CO2e saved 255 074 kg (77.6%); service footprint 73 785 kgCO2e, 147 kgCO2e/t washed, 7.7 per wearer (Dec); delivery 23 785 kgCO2e, 32.2% of service emissions. Any disagreement is reported, never forced.
- The engine totals agree with the `customer_impacts` "vs local" columns within rounding, or the differences are reported.
- Cards follow `?customer=`, are identical for KAM and Customer, and every savings and footprint label names the baseline.
- A Playwright + Chrome check at 1280px passes in dark and light.
- `npm run data:build`, `npm test`, `npm run lint`, `npm run build`, both `check:*` scripts and `openspec validate dashboard-footprint-baselines --strict` pass.

## Open questions and data surprises

- **Baseline process factor looks high** (decided: keep). `B_LOCAL` process is 0.62 kgCO2e/kg against 0.028 to 0.369 per kg at the laundries (energy 1.05 vs 0.74 kWh/kg is similar), so CO2e saved is 77.6% for NorthStar and 87.4% for Apex. The sheet marks the values "illustrative". The engine uses them as given, the cards carry the uncertain tint, and the CO2e Show math carries a note. A bullet in `docs/product-spec.md` "Open questions for Lindström" asks for a review of the factor.
- **Delivery is above the baseline's even for local laundry.** Laundry delivery is 0.026 to 0.065 kgCO2e/kg, above `B_LOCAL` 0.035 in 41 of 48 months (NorthStar 0.047). So delivery alone reads worse than the baseline, not only worse than home washing (0 delivery). Hence the net comparison beside it. No baseline has zero delivery except `B_HOME`, and no laundry-month has zero delivery or zero washed kg.
- **Units are consistent.** Baseline factors (L/kg, kWh/kg, kgCO2e/kg) match the laundry per-kg columns, and laundry process and delivery are totals in kgCO2e, so per-kg values are derived. No unit conversion is needed.
- **Mismatch with the precomputed columns.** Per-row, the engine formula reproduces allocated water and energy within 0.01% and 0.3% and the "vs local" savings within 0.4% (energy), 0.2% (CO2e) and 0.04% (water); totals for NorthStar agree to the unit. Row differences come from the pack's rounding of small values.
- **Intensity is per tonne washed** (decided): about 147 kgCO2e/t for NorthStar.
- **Card number display** (decided): values of absolute size 100 or more show whole, values below 100 one decimal, "%" keeps one decimal. One shared helper, so earlier sections follow it too (per 100 wearers 5.4). Show math keeps its formatting.
- **Net CO2e saved appears twice** (decided): in the saved group and beside delivery, rendered from the same Fact.
- **Per wearer divides the full-year footprint by December wearers**, labelled "(Dec)" like per 100 wearers.
- **Baseline short names** ("local laundry", "home washing", "in-house laundry") live in a small engine map by baseline id, falling back to the sheet's name, because the sheet only has "Outsourced local laundry".
