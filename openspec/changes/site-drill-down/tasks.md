# Tasks

Read first: `docs/conventions.md`, `docs/adr/README.md` (ADRs 0004, 0005, 0014), `docs/design.md`, and the Next.js `notFound` and `not-found.js` docs in `node_modules/next/dist/docs/`. Do not commit.

## 1. Pipeline

- [x] 1.1 Add the `Laundries` sheet: strict schema in `SHEETS`, `laundries` in `AppData`, the stem in `scripts/build-data.ts`, `generated.ts` and the stems of the tests that run the pipeline. Add the reference check (site `primary_laundry_id` must exist in `laundries`) failing the build with sheet and ids, and update `docs/runbooks/rebuild-data.md`. Verify: `tests/data-schemas.test.ts` (valid row, blank, unknown column), `tests/data-pipeline.test.ts` (header mismatch, 4 rows valid on the pack, unknown laundry fails naming it), `npm run data:build`.

## 2. Engine

- [x] 2.1 Add optional `siteId` to `OperationalScope`, a shared `inScope` row filter, `siteId`/`siteName` on `Fact.scope` (set by `fact`/`build`), and use the filter in `operational.ts`, `value.ts`, `percentage.ts` (on-time and per-product repairs) and `replacements-postponed.ts`. Add `siteFacts` and `siteComparison` (utilization and repairs per 100 garments, pairs, labels naming the scope) and export them from `index.ts`. Verify: existing tests pass unchanged.
- [x] 2.2 Engine tests in `tests/site-scope.test.ts`: per-site values recomputed independently from the CSVs for two NorthStar sites, additive Facts sum to the customer Facts, a site of another customer counts nothing, no `siteId` leaves values unchanged, comparison pair values, a site without December rows (utilization 0, repair rate omitted), provenance and site in `scope`. Verify: `npm test`.

## 3. Page

- [x] 3.1 Link the `SiteTable` site name with `?customer=` (update `site-table.test.tsx`). Add `src/app/dashboard/sites/[siteId]/page.tsx`: header with the laundry name, back link, sections with `FactStatCard`, comparison pairs, the one-line omitted note, `notFound()` for an unknown site or a site of another customer. Add the "Site" row to `FactStatCard` Show math and a one-line site-scope note in `docs/conventions.md`. Verify: `npm run build`; in dev, row values equal page values, and a bad id and another customer's site give not-found.

## 4. Verification

- [x] 4.1 Run `npm run data:build`, typecheck, `npm test`, `npm run lint`, `npm run build`, `npm run check:design-imports`, `npm run check:contrast` and `openspec validate site-drill-down --strict`. Verify: all pass; anything not run is listed.
- [x] 4.2 One Playwright + Chrome pass at 1280px in dark and light: open a site from the table, check header, back link keeps `?customer=`, cards, comparison, omitted-facts line, Show math names the site, not-found for a bad id and another customer's site, no console errors. Verify: a pass or fail line per check in the final report.
