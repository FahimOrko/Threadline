# Design

## Context

Facts are the only way a number leaves the engine (ADR 0004, 0005). Percentages are stored as 0 to 100 with unit "%" and printed by `formatPercent` (one decimal), as utilization already is. The pipeline loads sheets through `SHEETS` and returns `AppData`; `generated.ts` imports the JSON in server components only (ADR 0002, 0013). `service_cycles.csv` has 16 415 rows, which must not reach the browser. See proposal.md for scope.

## Goals / Non-Goals

**Goals:**
- Three percentage Facts with honest labels, no new component.
- Big sheets reduced at build time to exactly what the KPIs read.

**Non-Goals:**
- Period filtering of cycles, drill-down to single assets, sensitivity ranges.

## Decisions

1. **Aggregate in the pipeline, not the engine.** `buildData` validates every raw row (so invalid rows are reported), then replaces the raw sheets with `cycleCounts` (`customer_id`, `site_id`, `cycles`, `on_time`) and `wasteAllocation` (`customer_id`, `laundry_id`, `month`, `allocated_textile_waste_kg`) in `AppData`. Counting and summing at build time is data shaping; every ratio is still computed in the engine (ADR 0005). Alternative: ship raw rows and aggregate in the engine; rejected because 16k rows would inflate the page payload. The engine stays pure and gets the small data as an argument.
2. **Sort, then count out-of-order.** Cycles are sorted per asset by `cycle_number`, and a cycle is out of order when its pickup timestamp is earlier than the previous cycle's: cycle-number order disagrees with timestamp order, the product spec definition (about 1,107 expected). The per-site counts do not depend on row order, so no separate timestamp sort is performed; the product spec's "sort on timestamp" only matters for sequence-based KPIs (Slice 5). The count goes in the report as a cross-check line with a few offending rows; it never fails the build and never drops rows. A big difference from 1,107 is reported, not tuned away.
3. **Cycles are not period-filtered.** All pack pickups are in 2025 (23 deliveries land in early 2026), so the on-time rate covers every cycle in the sheet. Per-site counts have no month, so a future period picker would need month-level counts; that is deferred.
4. **On-time cycle rate.** `on_time / cycles` x 100 summed over the customer's sites. Methods MEASURED, source SYNTHETIC, no assumption IDs. The label and Show math say it is a rate over sampled cycles (the sheet is a sample, not every service event), so it is not read as the customer's whole service level. A customer with zero cycles has no Fact (null means needs-input, so it is not used here); the list omits it.
5. **Repair rate by product (Dec).** `repairRateByProduct` returns one Fact per product with December allocated pieces > 0: full-year repair count (customer, product) / December allocated pieces (sum over the customer's sites) x 100. Methods CALCULATED, source SYNTHETIC. Product name comes from `products`, so ids are `repair-rate-<product_id>`. The label carries "(Dec)" and Show math states the full-year over December basis, same wording as per 100 wearers. A product with no December allocation is omitted, never shown as 0 or NaN. A rate above 100 is possible in principle and is shown as computed.
6. **Recycling and reuse share.** For each of the customer's (laundry, month) rows, share = (recycling_kg + reuse_kg) / textile_waste_total_kg from `waste_circularity`; the KPI is the average of those shares weighted by the customer's allocated waste kg, which equals allocated recycled-or-reused kg / allocated total kg. Methods ALLOCATED and ESTIMATED, source SYNTHETIC, assumptions A003 (allocation by washed-kg share) and A004. The waste share depends on `waste_circularity`, so the pipeline fails the build when a (laundry, month) in `wasteAllocation` has no `waste_circularity` row, naming the missing laundry-months, in the same way as the product reference check (conventions.md). The engine keeps a throw naming the laundry and month as a backstop for data that bypassed the build. Show math inputs list the allocated kg total and the recycled-or-reused kg.
7. **Dashboard placement.** A "Percentages" section under "Money and utilization", same grid as the other sections, rendering `percentageFacts(data, scope)`. The grid may hold up to eight cards; four per row at 1280px gives two rows, no layout change needed. No new component.
8. **Pack caveat found in exploration.** The current spec says `customer_impacts` is allocated by washed-kg share and A003 says the same; the engine trusts that column as given and does not re-allocate.

## Risks / Trade-offs

- [The out-of-order count may differ from the product spec's 1,107] → report and explain, never tune.
- [Sampled cycles may be misread as full service] → label and Show math say "sampled cycles".
- [Repair rate mixes a full-year numerator with a December denominator] → "(Dec)" label and Show math, as for per 100 wearers; it is not an annual rate.
- [Dropping raw cycles from `AppData` means a future per-asset KPI (Slice 5) needs a new aggregate] → accepted; add it then.
- [Aggregation at build time hides row-level data from the engine tests] → pipeline tests assert aggregates against hand-built CSV fixtures.
