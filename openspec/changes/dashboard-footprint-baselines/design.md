# Design

## Context

Facts are the only way a number leaves the engine (ADR 0004, 0005). The engine is pure and isomorphic. Percentages use the one-decimal rule, and the pack's precomputed impact columns are not to be relied on (product spec, Calculation engine). `customer_impacts` is already reduced at build time to waste per customer, laundry and month (`wasteAllocation`). See proposal.md for scope and open questions.

## Goals / Non-Goals

**Goals:**
- Savings and footprint computed from first principles with the baseline as an argument.
- Honest delivery presentation: delivery never appears without the net result.

**Non-Goals:**
- Selector UI, low/base/high, equivalences, site level.

## Decisions

1. **Baseline is a parameter.** `type Baseline = Baselines row`. Every footprint function takes `(data, scope, baseline)`. The dashboard passes the row with id `DEFAULT_BASELINE_ID = "B_LOCAL"` (A001), looked up in `data.baselines`; Slice 4 replaces that lookup with the selected id. Fact `baseline` is set to the baseline's name (the field exists and is null today), and the label carries a short name from a map by id (`B_LOCAL` "local laundry", `B_HOME` "home washing", `B_INHOUSE` "in-house laundry") with the sheet name as fallback.
2. **Factors come from `laundry_resources`, quantities from the allocation.** The impact reduction becomes `impactAllocation` rows (`customer_id`, `laundry_id`, `month`, `customer_washed_kg`, `allocated_textile_waste_kg`), a rename of `wasteAllocation` plus one column; the waste KPI keeps working. For each row the engine reads the laundry-month: water `fresh_water_l_per_kg`, energy `energy_kwh_per_kg`, process and delivery factors = emissions / `washed_kg`. Allocated process + delivery equals `customer_washed_kg` x factor, which equals the washed-kg share x the laundry's emissions (checked against the pack). Alternative: ship the allocated columns and sum them; rejected because the savings must use the engine formula and one source of factors keeps footprint and savings consistent.
3. **Formulas.** saving = sum of kg x (baseline - laundry) per resource; CO2e baseline factor = process + delivery. saving % = saving / sum of kg x baseline factor x 100, so a negative saving shows as a negative percentage, never clamped. Service footprint = sum of kg x (process + delivery); per tonne washed divides by total kg / 1000; per wearer divides the full-year total by December active wearers (`activeWearers`), labelled "(Dec)". Delivery share = delivery / service total x 100. Zero kg or zero wearers gives no Fact (omitted), never 0 or NaN.
4. **Provenance.** Savings: ALLOCATED + ESTIMATED, SYNTHETIC, A001, confidence from A001; they take the uncertain tint because the baseline values are illustrative. Service and delivery footprints: ALLOCATED (per tonne, per wearer, share also CALCULATED), SYNTHETIC, no assumption. Show math lists washed kg, the factor pairs (baseline and laundry-weighted), and the baseline name. The CO2e saved Facts add a note: the local laundry baseline process factor is marked illustrative in the pack and sits far above the laundries' own factors, which drives the high percentage. Every Fact has `range = { low: null, base: value, high: null }` (low and high wait for Slice 4); `value` and `range.base` are never null.
5. **Delivery honesty.** The delivery group renders the delivery emissions, its share, and the net CO2e saved Fact (the same Fact as in the saved group, process + delivery; rendered in both places). The delivery Fact's Show math adds the laundry delivery factor against the baseline's and the product spec note: a baseline with zero delivery (home washing) makes delivery alone look worse, so read it with the net comparison. A second note states route kilometres are not in the pack. The note text lives with the Fact (engine), not in the page.
6. **Reference checks in the pipeline.** After aggregation: every laundry-month in `impactAllocation` with washed kg > 0 must have a `laundry_resources` row with `washed_kg` > 0, and `DEFAULT_BASELINE_ID` must exist in `baselines`. A miss throws the existing reference error, naming ids and sheet, so no JSON is written. The engine keeps a named throw for both as a backstop (same pattern as products and waste).
7. **Display.** Units "L", "kWh", "kgCO2e" use `formatNumber`; "%" uses the one-decimal rule; "kgCO2e/t" is a plain number and also uses `formatNumber` (e.g. 147), so `src/lib/format` does not change.
8. **Placement.** `footprintFacts(data, scope, baseline)` returns the Facts in group order; the page splits them into the three groups by Fact id lists exported from the engine, so the page does no arithmetic. One "Footprint" section with three small headers.
9. **Cross-check in tests only.** The precomputed "vs local" and allocated columns are read from the CSV in a test and compared with the engine's per-customer totals at 0.1% tolerance; a disagreement fails the test with the numbers, to be reported, not forced.

## Risks / Trade-offs

- [Illustrative baseline factors drive large savings (CO2e 77.6%)] → uncertain tint, "illustrative" noted in Show math, flagged in open questions.
- [Delivery above baseline delivery reads badly] → the net card sits beside it and Show math explains.
- [Renaming `wasteAllocation` touches the waste KPI and its tests] → mechanical, covered by the existing waste tests.
- [Per wearer mixes a full-year numerator with a December denominator] → "(Dec)" label and Show math, as for per 100 wearers.
- [A fixed `B_LOCAL` id is a constant until Slice 4] → one constant, passed in, no engine dependency on it.
