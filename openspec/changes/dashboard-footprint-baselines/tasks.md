# Tasks

Read first: `docs/conventions.md`, `docs/adr/README.md` (ADRs 0004, 0005, 0012, 0013), `docs/design.md`. Do not commit.

## 1. Pipeline

- [x] 1.1 Add strict schemas for `Laundry_Resources` and `Baselines` to `SHEETS`, add their stems to `scripts/build-data.ts` and the tests that run the pipeline, and import their JSON in `generated.ts` and the data source. Verify: `tests/data-schemas.test.ts` covers a valid row, a blank number and an unknown column for each; `tests/data-pipeline.test.ts` shows a header mismatch on each new file fails the build; `npm run data:build` reports 48 and 3 rows valid.
- [x] 1.2 Rename `wasteAllocation` to `impactAllocation` and add `customer_washed_kg` to it (update `percentage.ts`, `generated.ts`, tests, runbook). Verify: the existing waste tests pass unchanged apart from the name, and a pipeline test asserts the washed-kg sum per customer equals the CSV.
- [x] 1.3 Add the two reference checks (laundry-month with washed kg has a `laundry_resources` row with `washed_kg` > 0; default baseline id exists), failing the build non-zero with no JSON and naming ids and sheet. Verify: `tests/data-pipeline.test.ts` covers a missing laundry-month, a zero-kg laundry-month, a missing baseline and the pack passing.

## 2. Engine

- [x] 2.1 Add `src/lib/engine/footprint.ts`: `Baseline` type, short-name map with fallback, `DEFAULT_BASELINE_ID`, savings Facts (water, energy, CO2e, absolute and %), service footprint Facts (total, per tonne washed in kgCO2e/t, per wearer (Dec)), `range` {low null, base = value, high null} on every Fact, the illustrative-baseline note in the CO2e saved Show math and delivery Facts (emissions, share) with the honesty and data-gap notes, plus `footprintFacts(data, scope, baseline)` and the group id lists; export from `index.ts`. Verify: `tests/footprint-facts.test.ts` asserts, for NorthStar and a second customer, every value against an independent recomputation from the CSVs, methods, source, A001 on savings only, the baseline name in each label, a different baseline row changing values and labels, omission for no kg or no wearers, the missing laundry-month backstop error, and the delivery notes. Disagreements are reported, never forced.
- [x] 2.2 Add the cross-check test of engine totals against the sums of the `customer_impacts` allocated and "vs local" columns for all three customers (0.1% tolerance). Verify: the test passes, or fails printing both numbers, and any difference is listed in the final report.

## 3. Dashboard

- [x] 3.1 Add `formatCardValue` (100 or more whole, below 100 one decimal, "%" one decimal) to `src/lib/format` with a format test, use it for the card headline in `FactStatCard`, update the formatting note in `docs/design.md`, and add the "Footprint" section with its three groups to `src/app/dashboard/page.tsx` using `FactStatCard` and the engine group lists (net CO2e card in both the saved and delivery groups from one Fact, route-km data gap line), and update `docs/runbooks/rebuild-data.md` and the baseline line in `docs/conventions.md`. Verify: `npm run build` compiles; with `npm run dev` the section follows `?customer=` and shows the NorthStar values from the spec.

## 4. Verification

- [x] 4.1 Run `npm run data:build`, `npm test`, `npm run lint`, `npm run build`, `npm run check:design-imports`, `npm run check:contrast` and `openspec validate dashboard-footprint-baselines --strict`. Verify: all pass; anything not run is listed.
- [x] 4.2 One Playwright + Chrome pass at 1280px in dark and light: the Footprint section for NorthStar and a second customer via the picker, labels name the baseline, Show math on every card (delivery note, route-km gap and baseline illustrative note visible), no client fetch of generated JSON, no console errors or hydration warnings. Verify: a pass or fail line per check in the final report.
