# Tasks

Read first: `docs/conventions.md`, `docs/adr/README.md` (ADRs 0004, 0005, 0010, 0012, 0013, 0015), `docs/design.md`. Do not commit.

## 1. Team assumptions rule

- [x] 1.1 Create `src/lib/engine/assumptions-config.ts`: the `TeamAssumption` type and `TEAM_ASSUMPTIONS` with T001 `rentalFeePerPieceWeek` (`value: null`, unit "EUR/piece/week", note, certainty "assumed"). Verify: `tests/team-assumptions.test.ts` asserts every entry has a T-prefixed id, unit, note and certainty "assumed", and T001 value is null.
- [x] 1.2 Create `docs/adr/0016-team-assumptions-live-in-one-config.md` (new file only) and append one row to the index in `docs/adr/README.md`. The ADR states the rule: config location, T prefix, not runtime-editable, always rendered as assumed, unset state instead of placeholders, applies to future unknowns (washing_pct, CO2-per-tree, route km). It also states the deviation from `docs/product-spec.md`, which lists SYNTHETIC_TEAM for Cost of unused allocation: a rental fee is an assumed parameter, not team-generated data rows, so source ASSUMPTION is the accurate one; `docs/product-spec.md` is not edited. It contains no assumption value and references earlier ADRs only from itself. Verify: `git diff --stat docs/adr` shows one new file and one changed file (`README.md`, one added line), `grep -n "EUR" docs/adr/0016-*` finds no value, the ADR names SYNTHETIC_TEAM and ASSUMPTION with the reason, and `git diff --stat docs/product-spec.md` is empty.
- [x] 1.3 Add one line to `docs/conventions.md` (Numbers and provenance): unknowns supplied by the team go in the config (ADR 0016). Verify: line present.

## 2. Pipeline: products

- [ ] 2.1 Add `productSchema` (strict, columns from the `Products` dictionary sheet), `Product` type, `AppData.products` and the `SHEETS` entry; initialise the array in `buildData`; add `products` to the `stems` in `scripts/build-data.ts` and in the tests that run the pipeline. Verify: `tests/data-schemas.test.ts` covers a valid row, a blank number and an unknown column.
- [ ] 2.2 Import the new JSON in `src/lib/data/generated.ts` and extend `tests/data-pipeline.test.ts` and `tests/data-source.test.ts`: 6 rows read, 6 valid, 0 invalid on the pack; a header mismatch on products fails the build. Verify: `npm run data:build` prints a `products` line and `npm test` passes.
- [ ] 2.3 Add a referential check in the pipeline: after validation, every `product_id` in repairs and service_activity must exist in products; otherwise `data:build` exits non-zero, writes no JSON, and the error names the missing IDs and the source sheet for each (for example `repairs: unknown product_id [P9999]`). Verify: `tests/data-pipeline.test.ts` covers a repairs row with an unknown product, a service_activity row with an unknown product (both fail, naming IDs and sheet), the pack passing, and a customer-independent case (the check covers all rows, not one customer).

## 3. Engine: Facts

- [ ] 3.1 Widen `Fact.value` and `range.base` to `number | null` in `src/lib/engine/fact.ts`; fix every compile error with the smallest change (`serviceRequestsPer100Wearers` keeps using the non-null Facts). Verify: `npx tsc --noEmit` passes and existing tests pass unchanged.
- [ ] 3.2 Add a shared helper that finds a product's purchase cost and throws an error naming an unknown `product_id` (a backstop; the build already rejects such data, task 2.3), and one that turns a `TeamAssumption` into Fact inputs (id and name, value or "not set", unit, plus a note input). Verify: unit tests for a known product, an unknown product, a set and an unset assumption.
- [ ] 3.3 Add `avoidedPurchaseCost` and `garmentValueKeptInUse`. Verify: `tests/value-facts.test.ts` asserts NorthStar 660 082 and 1 335 527 EUR, methods, source, A002 on the first only, another customer's isolation and the unknown-product error. If the engine value differs from these independent figures, stop and report it as an open investigation; do not change the expected numbers to match.
- [ ] 3.4 Add `garmentUtilization` and `costOfUnusedAllocation` (optional config argument, default `TEAM_ASSUMPTIONS`). Verify: tests assert NorthStar utilization about 83.5 and 5 230 unused pieces in the inputs (same investigation rule as 3.3), a zero-allocation customer, value null with T001 unset (not 0, not NaN), and 5 230 times a test fee with T001 set, source ASSUMPTION, `assumptionIds` containing "T001" and the note in the inputs.
- [ ] 3.5 Add `valueFacts(data, scope, team?)` returning the four Facts in order and export everything from `src/lib/engine/index.ts`. Verify: test checks length 4, order, and that each Fact has a method, source, formula and scope.

## 4. Needs-input card

- [ ] 4.1 Add the optional `needsInput` hint prop to `StatCard` (replaces the value row, same box, sans font, muted) and make `FactStatCard` use it when `fact.value` is null, with range base shown as not available. Verify: extend `tests/fact-stat-card.test.tsx`: null value shows "Needs input" and the hint, no "0" or "NaN" text, the chip and the Show math control are present, and Show math lists T001 as "not set".
- [ ] 4.2 Add the needs-input StatCard next to a normal one in `/design` (Data display), with a labelled fixture, and a `docs/design.md` note on the StatCard row. Verify: `/design` shows it in both themes at equal width; `npm run check:design-imports` and `npm run check:contrast` pass.

## 5. Dashboard

- [ ] 5.1 In `src/app/dashboard/page.tsx` add a "Money and utilization" section under the operational cards, rendering `valueFacts` with `FactStatCard` for the resolved customer. Verify: `npm run build` compiles; with `npm run dev` the section follows `?customer=` and shows 660 082 EUR, 1 335 527 EUR, "Needs input" and 83.5 % for NorthStar.
- [ ] 5.2 Add the runbook line for the `products` sheet (6 rows, `valid 6, invalid 0`) to `docs/runbooks/rebuild-data.md`. Verify: line present and matches the `data:build` output.

## 6. Real-browser verification and gates

- [ ] 6.1 With Playwright and Chrome check, in dark and light themes: the four cards and values for NorthStar and for a second customer via the picker, the needs-input card (hint names T001, amber chip, no 0 or NaN), Show math popovers on the four cards (open, Esc, outside click; T001 row visible), identical content in KAM and Customer roles, no client fetch of generated JSON and no console errors. Verify: a pass or fail line per check in the final report.
- [ ] 6.2 Run `npm run data:build`, `npm test`, `npm run lint`, `npm run build`, `npm run check:design-imports`, `npm run check:contrast` and `openspec validate dashboard-money-kpis --strict`. Verify: all pass; anything not verifiable is listed.
