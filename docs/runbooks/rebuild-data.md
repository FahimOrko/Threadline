# Rebuild data from CSVs

`npm run dev` and `npm run build` run `npm run data:build` first (`predev`, `prebuild`). `data/generated/` is git-ignored (ADR 0013).

## Re-export or replace the pack

1. Put the 19 source CSVs in `data/raw/`, named after their sheets (`repairs.csv`, `sites.csv`, ...).
2. Check every file holds its own sheet: run `npm run data:build`. It compares each file's columns, as a set, with its sheet in `data_dictionary.csv` and fails naming the file and the missing or unknown columns (ADR 0012). Order does not matter.
3. If it fails, the export is wrong or the dictionary changed. Fix the export; do not rename files to fit. A faulty manual export once shipped every file under another sheet's name.

## Rebuild

1. Run `npm run data:build`.
2. Read the one-line summary per file (repairs, sites, customers, assumptions, serviceActivity, products, serviceCycles, wasteCircularity, customerImpacts, laundryResources, baselines, laundries) and `data/generated/data-quality.json`: rows read, valid, invalid with reasons, the repairs cross-check and the product_id checks. A `product_id` in repairs or service_activity that is missing from `products.csv` fails the build and names the ids and the sheet. So does a laundry-month with allocated waste in `customer_impacts` that has no `waste_circularity` row, a laundry-month with washed kg that has no `laundry_resources` row with `washed_kg` above zero, a missing default baseline (`B_LOCAL`) in `baselines`, and a site whose `primary_laundry_id` is not in `laundries`.
3. Run `npm test` and `npm run build`. Tests run the pipeline on `data/raw/` themselves and do not need `data/generated/`.

## Known data caveats

- `washing_pct` in `service_activity` is loaded into `data/generated/serviceActivity.json` but unused: it is mostly above 100% and its definition is unclear. Keep it out of claims until Lindström confirms.
- `serviceActivity.json` holds 1,248 rows; expect `valid 1248, invalid 0` on the pack.
- `products.json` holds the 6 products (`synthetic_purchase_cost_eur` feeds the money KPIs); expect `valid 6, invalid 0` on the pack.
- `service_cycles` (16,415 rows) and `customer_impacts` (1,248 rows) are validated and reported but written only as aggregates: `cycleCounts.json` (per site) and `impactAllocation.json` (washed kg and allocated waste per customer, laundry, month, 60 rows on the pack). `laundry_resources` (48 rows) and `baselines` (3 rows) and `laundries` (4 rows) are shipped as they are. Expect `valid 16415` and `valid 1248`, invalid 0.
- The `info` line for `service_cycles` is the out-of-order scan count (cycle number order disagrees with pickup timestamp order for the same asset): 1,107 on the pack, matching the product spec. It is reported, never a failure.
