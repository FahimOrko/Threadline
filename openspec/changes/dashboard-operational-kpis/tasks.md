# Tasks

Read first: `docs/conventions.md`, `docs/adr/README.md` (ADRs 0002, 0004, 0005, 0010, 0012, 0013), `docs/design.md`, and the Next.js guide in `node_modules/next/dist/docs/` for `searchParams` and `useSearchParams`.

## 1. Pipeline: service_activity

- [ ] 1.1 Add `serviceActivitySchema` (strict, columns from the `ServiceActivity` sheet in `data_dictionary.csv`), the `ServiceActivity` type, `AppData.serviceActivity` and the `SHEETS` entry in `src/lib/data/schemas.ts`; initialise the new array in `buildData`. Verify: `tests/data-schemas.test.ts` covers a valid row, a blank number and an unknown column.
- [ ] 1.2 Import `data/generated/serviceactivity.json` (or the key the pipeline writes) in `src/lib/data/generated.ts` and add it to `generatedSource`. Verify: `npm run data:build` prints a summary line for it and `npm run build` compiles.
- [ ] 1.3 Extend `tests/data-pipeline.test.ts` and the `stems` list in the other tests: 1,248 rows read, 0 invalid for the pack, header mismatch on service_activity fails the build. Verify: `npm test` passes.

## 2. Engine: operational Facts

- [ ] 2.1 Add a shared helper for the active-wearers rule and the latest-month filter (`src/lib/engine`, no formatting). Verify: unit test on a tiny hand-made dataset where summing across product rows differs from max-per-site.
- [ ] 2.2 Add `deliverySites`, `activeWearers`, `garmentsInCirculation`, `repairs`, `serviceRequests` and `serviceRequestsPer100Wearers`, each returning a `Fact` with methods, source, assumption IDs (none where none apply), confidence, formula and inputs; `activeWearers` inputs name the month and explain the 28,367 difference. Verify: `tests/engine.test.ts` asserts NorthStar 24, 9,607, 31,743, 15,233, 515, the 28,367 text, a zero-wearer customer and another customer's isolation.
- [ ] 2.3 Add `operationalFacts(data, scope)` returning the seven Facts in order, and export everything from `src/lib/engine/index.ts`. Verify: test checks length 7, order, and that each Fact has a method, source, formula and scope.
- [ ] 2.4 Add `operationalSiteRows(data, scope)` returning one row per site plus one provenance block. Verify: test checks 24 NorthStar rows reconcile to 9,607, 31,743, 15,233 and 515, and a site with no activity shows zeros.

## 3. Customer selection

- [ ] 3.1 Add `resolveCustomer(param, customers)` in `src/lib/customer.ts` returning the customer and the rejected value (or none), defaulting to CUST001. Verify: `tests/customer.test.ts` covers missing param, valid id, unknown id and an array-valued param.
- [ ] 3.2 Make the root layout load customers on the server and pass `{ id, name }[]` to `AppShell`; replace the disabled customer button with a labelled native select that navigates to the same path with `?customer=`; keep `?customer=` on the view links, inside a Suspense boundary as the Next docs require. Verify: component test renders the select with all names, and changing it calls navigation with the new param; view links keep the param.
- [ ] 3.3 Update `tests` for the shell if any assert the old placeholder text. Verify: `npm test` passes.

## 4. SiteTable component

- [ ] 4.1 Build `src/components/site-table.tsx`: compact 28px rows, `.num` numbers, formatting through `src/lib/format`, one ProvenanceChip and ShowMath for the table, plus populated, empty and loading states (reuse `states.tsx`). Verify: `tests/site-table.test.tsx` renders rows, empty and loading, and asserts the chip and Show math are present.
- [ ] 4.2 Add the labelled fixture in `src/app/design/_sample/` and the SiteTable section under Data display on `/design`; add the row to the component table in `docs/design.md`. Verify: `/design` shows it in all states; `npm run check:design-imports` and `npm run check:contrast` pass.

## 5. Dashboard page

- [ ] 5.1 Rewrite `src/app/dashboard/page.tsx` as an async server component: read `searchParams`, call `resolveCustomer`, show the fallback notice when a value was rejected, keep the period constant in one place, render `operationalFacts` through `FactStatCard` and `operationalSiteRows` through `SiteTable`. No arithmetic in the page. Verify: `npm run build` passes and `npm run lint` is clean.
- [ ] 5.2 Check in the running app (`/run`): NorthStar cards read 24, 9 607, 31 743, 15 233, 15 233, 515 and the per-100 rate; Show math on Active wearers explains 28 367; `?customer=NOPE` shows NorthStar plus the notice; another customer shows its own numbers; switching KAM and Customer changes nothing; the picker works by keyboard; both themes. Verify: record the observations in the final report.

## 6. Decisions, conventions, runbooks

- [ ] 6.1 Write ADR 0014 "Selected customer lives in the URL" and ADR 0015 "Active wearers: latest-month maximum per site", each in the repo template with context, decision and consequences, and add both rows to `docs/adr/README.md`. Verify: the index lists 0014 and 0015 and links resolve.
- [ ] 6.2 Add to `docs/conventions.md`: pages read the customer from `?customer=` through `resolveCustomer`; the period is a single constant passed to the engine; new sheets are added to `SHEETS` and to the test `stems`. Verify: the text matches what the code does.
- [ ] 6.3 Update `docs/runbooks/rebuild-data.md` with the service_activity sheet in the expected summary and the check that its generated JSON exists; update `docs/runbooks/add-design-component.md` only if the SiteTable work found a missing step. Verify: following the runbook on a clean checkout rebuilds the data.
- [ ] 6.4 Final gate: `npm test`, `npm run lint`, `npm run build`, `npm run check:design-imports`, `npm run check:contrast`, and `openspec validate dashboard-operational-kpis --strict`. Verify: all pass; nothing committed.
