# Tasks

## 1. Pipeline: header check and schemas

- [x] 1.1 Add Zod row schemas for repairs, sites, customers and assumptions in `src/lib/data`. Verify: unit test accepts a valid row and rejects a bad `repair_count` with a reason.
- [x] 1.2 Add the header check, comparing columns as a set against the sheet in `data_dictionary.csv`. Verify: tests pass for a matching header and for the same columns reordered, and fail naming the file and column for a missing column and for an unknown extra column.
- [x] 1.3 Add the build script and wire `npm run data:build`, writing the four JSON files to `data/generated/`. Verify: the command on the current `data/raw/` writes the files; pointing it at a file with a missing or extra column exits non-zero and writes nothing.
- [x] 1.4 Add `prebuild` and `predev` scripts that run `data:build`, and add `data/generated/` to `.gitignore`. Verify: after deleting `data/generated/`, `npm run build` regenerates it and `git status` shows it untracked-ignored; a broken header makes `npm run build` stop before Next starts.

## 2. Pipeline: data-quality report and adapter

- [x] 2.1 Write `data-quality.json` with per-file read, valid and invalid counts and reasons. Verify: a test with one injected invalid row reports it with its reason, and the real run reports all rows valid.
- [x] 2.2 Add the repairs cross-check (`repair_count` vs `estimated_replacements_postponed`) to the report. Verify: a test with one disagreeing row lists month, site, product and both values; the real run reports the check passed over 3 635 rows.
- [x] 2.3 Add the `DataSource` interface and the JSON adapter. Verify: a test loads the generated files through the adapter and gets plain objects.

## 3. Engine and formatting

- [x] 3.1 Add the `Fact` type reusing `Method` and `Source`, and the Replacements postponed function taking data, `customerId` and a period. Verify: Vitest, running the pipeline in-process on `data/raw/` (no prior build needed), asserts 15 233 for CUST001, 2025-01 to 2025-12, plus a subset period, another customer and an unknown customer.
- [x] 3.2 Confirm the engine imports no `fs` or server-only modules. Verify: a test or lint rule fails on such an import under `src/lib/engine`.
- [x] 3.3 Add `src/lib/format` for number and unit strings. Verify: tests cover thousands separators, zero and units.

## 4. UI: FactStatCard and gallery

- [x] 4.1 Add `FactStatCard` mapping a Fact to `StatCard`, `ProvenanceChip` and `ShowMath`, with low/high shown as "not yet modelled". Verify: a component test checks label, value, unit, chip text and Show math content.
- [x] 4.2 Add FactStatCard to `/design` with a fixture Fact labelled as sample data, and to the component table in `docs/design.md`. Verify: `/design` shows it in light and dark, and `npm run check:design-imports` passes.

## 5. Dashboard

- [x] 5.1 Load the generated data in the dashboard server component through the adapter, run the engine for CUST001 and 2025, and render one FactStatCard. Verify: `/dashboard` shows 15 233 with the amber ESTIMATED and SYNTHETIC chip, and Show math lists the formula, repair count, A002 and range.
- [x] 5.2 Verify no browser request for the generated JSON. Verify: the network panel on `/dashboard` shows none.

## 6. Decisions and docs

- [x] 6.1 Add ADR 0012 (a missing or unknown column, compared as a set with order ignored, fails the build) and ADR 0013 (generated data is built by `prebuild` and `predev`, `data/generated/` is git-ignored, `data/raw/` stays committed; supersedes the committed-JSON line in the product spec and the runbook step, ADR 0002 is unaffected). Add both rows to `docs/adr/README.md`. Verify: the index lists 0012 and 0013 and both follow the template, 0013 with a "Supersedes" line.
- [x] 6.2 Add to `docs/conventions.md`: data loads only in server components, the engine is pure and isomorphic, formatting lives in `src/lib/format`, generated data is never committed. Verify: the lines are present and match the code.
- [x] 6.3 Update `docs/runbooks/rebuild-data.md`: remove the stub note and the "commit the generated JSON" step, add the re-export and column-set verification steps and the `prebuild`/`predev` behaviour. Verify: following the runbook on a clean checkout gives a passing `npm test` and `npm run build`.
