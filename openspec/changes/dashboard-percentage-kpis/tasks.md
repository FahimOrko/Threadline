# Tasks

Read first: `docs/conventions.md`, `docs/adr/README.md` (ADRs 0004, 0005, 0012, 0013), `docs/design.md`. Do not commit.

## 1. Pipeline

- [x] 1.1 Add schemas for `Service_Cycles`, `Waste_Circularity` and `Customer_Impacts` (strict, columns from the dictionary, `performance_flag` limited to ON_TIME and LATE) to `SHEETS`, and add the three stems to `scripts/build-data.ts` and the tests that run the pipeline. Verify: `tests/data-schemas.test.ts` covers a valid row, a blank number, an unknown column and an unknown flag for each sheet; `tests/data-pipeline.test.ts` shows a header mismatch on each new file fails the build.
- [x] 1.2 In `buildData`, sort cycles per asset by pickup timestamp, count out-of-order cycles into a report cross-check, then replace the raw sheets with `cycleCounts` and `wasteAllocation` in `AppData`; write only the aggregates and `waste_circularity` in `scripts/build-data.ts` and import them in `generated.ts` and the data source. Verify: pipeline tests on small CSV fixtures assert the aggregates, the out-of-order count (0 for clean data, 1 for an asset whose cycle 3 is picked up before cycle 2, build still succeeds), and that the pack's counts sum to its valid rows; `ls data/generated` shows no raw cycle file.

- [x] 1.3 Add the waste reference check: after aggregation, every (laundry, month) in `wasteAllocation` must exist in `waste_circularity`; otherwise `data:build` exits non-zero, writes no JSON and names the missing laundry-months. Verify: `tests/data-pipeline.test.ts` covers a missing laundry-month (fails, names it, no JSON) and the pack passing; run `npm run data:build` on the pack and compare the out-of-order count with the product spec's about 1,107 (report any large difference, do not tune).

## 2. Engine

- [x] 2.1 Add `onTimeCycleRate`, `repairRateByProduct` and `recyclingReuseShare` and a `percentageFacts(data, scope)` list, exported from `src/lib/engine/index.ts`. Verify: `tests/percentage-facts.test.ts` asserts, for NorthStar and a second customer, the values against an independent recomputation from the CSVs, methods, source, assumption IDs (A003, A004 on the waste share only), the "sampled cycles" and "(Dec)" labels, the zero-cycles and zero-allocation omissions, the missing laundry-month backstop error, and customer isolation. A disagreement with the recomputation is reported, never forced.

## 3. Dashboard

- [x] 3.1 Add the "Percentages" section to `src/app/dashboard/page.tsx` rendering `percentageFacts` with `FactStatCard`, and extend the `data/raw` lines in `docs/runbooks/rebuild-data.md` for the three sheets and the out-of-order count. Verify: `npm run build` compiles; with `npm run dev` the section follows `?customer=` and values print with one decimal.

## 4. Verification

- [x] 4.1 Run `npm run data:build`, `npm test`, `npm run lint`, `npm run build`, `npm run check:design-imports`, `npm run check:contrast` and `openspec validate dashboard-percentage-kpis --strict`. Verify: all pass; anything not run is listed.
- [x] 4.2 One Playwright + Chrome pass at 1280px width in dark and light themes: the Percentages section for NorthStar and a second customer, a Show math popover on each of the three KPI types (waste share names A003, A004 and washed-kg allocation), no client fetch of generated JSON, no console errors. Verify: a pass or fail line per check in the final report.
