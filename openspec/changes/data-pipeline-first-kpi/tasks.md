# Tasks

## 1. Pipeline: header check and schemas

- [ ] 1.1 Add Zod row schemas for repairs, sites, customers and assumptions in `src/lib/data`. Verify: unit test accepts a valid row and rejects a bad `repair_count` with a reason.
- [ ] 1.2 Add the header check against the sheet columns in `data_dictionary.csv`. Verify: tests pass for a matching header and fail with file and column names for a mismatched one.
- [ ] 1.3 Add the build script and wire `npm run data:build`, writing the four JSON files to `data/generated/`. Verify: the command on the current `data/raw/` writes the files; pointing it at a file with a changed header exits non-zero and writes nothing.

## 2. Pipeline: data-quality report and adapter

- [ ] 2.1 Write `data-quality.json` with per-file read, valid and invalid counts and reasons. Verify: a test with one injected invalid row reports it with its reason, and the real run reports all rows valid.
- [ ] 2.2 Add the repairs cross-check (`repair_count` vs `estimated_replacements_postponed`) to the report. Verify: a test with one disagreeing row lists month, site, product and both values; the real run reports the check passed over 3 635 rows.
- [ ] 2.3 Add the `DataSource` interface and the JSON adapter. Verify: a test loads the generated files through the adapter and gets plain objects.

## 3. Engine and formatting

- [ ] 3.1 Add the `Fact` type reusing `Method` and `Source`, and the Replacements postponed function taking data, `customerId` and a period. Verify: Vitest asserts 15 233 for CUST001, 2025-01 to 2025-12, plus a subset period, another customer and an unknown customer.
- [ ] 3.2 Confirm the engine imports no `fs` or server-only modules. Verify: a test or lint rule fails on such an import under `src/lib/engine`.
- [ ] 3.3 Add `src/lib/format` for number and unit strings. Verify: tests cover thousands separators, zero and units.

## 4. UI: FactStatCard and gallery

- [ ] 4.1 Add `FactStatCard` mapping a Fact to `StatCard`, `ProvenanceChip` and `ShowMath`, with low/high shown as "not yet modelled". Verify: a component test checks label, value, unit, chip text and Show math content.
- [ ] 4.2 Add FactStatCard to `/design` with a fixture Fact labelled as sample data, and to the component table in `docs/design.md`. Verify: `/design` shows it in light and dark, and `npm run check:design-imports` passes.

## 5. Dashboard

- [ ] 5.1 Load the generated data in the dashboard server component through the adapter, run the engine for CUST001 and 2025, and render one FactStatCard. Verify: `/dashboard` shows 15 233 with the amber ESTIMATED and SYNTHETIC chip, and Show math lists the formula, repair count, A002 and range.
- [ ] 5.2 Verify no browser request for the generated JSON. Verify: the network panel on `/dashboard` shows none.

## 6. Decisions and docs

- [ ] 6.1 Add ADR 0012 (a header mismatch fails the build) with status accepted and today's date, and add its row to `docs/adr/README.md`. Verify: the index lists 0012 and the ADR follows the template.
- [ ] 6.2 Add to `docs/conventions.md`: data loads only in server components, the engine is pure and isomorphic, formatting lives in `src/lib/format`. Verify: the lines are present and match the code.
- [ ] 6.3 Update `docs/runbooks/rebuild-data.md`: remove the stub note, add the re-export and header verification steps and whether `data/generated/` is committed. Verify: following the runbook on a clean checkout produces a passing `npm test` and `npm run build`.
