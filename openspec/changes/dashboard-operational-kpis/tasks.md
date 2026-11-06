# Tasks

Read first: `docs/conventions.md`, `docs/adr/README.md` (ADRs 0002, 0004, 0005, 0010, 0012, 0013), `docs/design.md`, and in `node_modules/next/dist/docs/01-app/03-api-reference/`: `03-file-conventions/page.md` (`searchParams`), `03-file-conventions/layout.md` and `04-functions/use-search-params.md`.

## 1. Pipeline: service_activity

- [x] 1.1 Add `serviceActivitySchema` (strict, columns from the `Service_Activity` sheet in `data_dictionary.csv`), the `ServiceActivity` type, `AppData.serviceActivity` and the `SHEETS` entry keyed `Service_Activity` in `src/lib/data/schemas.ts`; initialise the new array in `buildData`. Keep `washing_pct` validated and in the output, with a comment that its definition is unclear and it is unused. Verify: `tests/data-schemas.test.ts` covers a valid row, a blank number and an unknown column.
- [x] 1.2 Import the JSON the build writes for the new key in `src/lib/data/generated.ts` and add it to `generatedSource`. Verify: `npm run data:build` prints a summary line for it and `npm run build` compiles.
- [x] 1.3 Extend `tests/data-pipeline.test.ts` and the `stems` list in the other tests: 1,248 rows read, 0 invalid for the pack, header mismatch on service_activity fails the build. Verify: `npm test` passes.

## 2. Engine: operational Facts

- [x] 2.1 Add a shared helper for the active-wearers rule and the latest-month filter (`src/lib/engine`, no formatting). Verify: unit test on a tiny hand-made dataset where summing across product rows differs from max-per-site.
- [x] 2.2 Add `deliverySites`, `activeWearers`, `garmentsInCirculation`, `repairs`, `serviceRequests` and `serviceRequestsPer100Wearers`, each returning a `Fact`. `activeWearers` inputs name the month and explain the 28,367 difference. The per-100 Fact is labelled "per 100 wearers (Dec)" and its inputs say a full-year count is divided by December wearers. Verify: `tests/engine.test.ts` asserts NorthStar 24, 9,607, 31,743, 15,233, 515, the per-100 value (515 / 9,607 x 100), both explanation texts, a zero-wearer customer and another customer's isolation.
- [x] 2.3 Add `operationalFacts(data, scope)` returning the seven Facts in order, and export everything from `src/lib/engine/index.ts`. Verify: test checks length 7, order, and that each Fact has a method, source, formula and scope.
- [x] 2.4 Add `operationalSiteRows(data, scope)` returning one row per site plus a provenance block per numeric column (wearers CALCULATED; garments, repairs, requests MEASURED). Verify: test checks 24 NorthStar rows reconcile to 9,607, 31,743, 15,233 and 515, the four column methods, and that a site with no activity shows zeros.

## 3. Customer selection and the Select control

- [x] 3.1 Add `resolveCustomer(param, customers)` in `src/lib/customer.ts` returning the customer and the rejected value (or none), defaulting to CUST001. Verify: `tests/customer.test.ts` covers missing param, valid id, unknown id and an array-valued param.
- [x] 3.2 Add the shadcn Select (`npx shadcn add select`, review the generated `src/components/ui/select.tsx` for token-only colours). Add it to `/design` under Controls in closed, open and disabled states and to the component table in `docs/design.md`. Verify: `/design` shows it in both themes; keyboard arrows and Enter choose an option; `npm run check:design-imports` and `npm run check:contrast` pass.
- [x] 3.3 Make the root layout load customers on the server and pass `{ id, name }[]` to `AppShell`. In a client part wrapped in `<Suspense>` (disabled picker as fallback), read `useSearchParams`, run `resolveCustomer` so the picker shows the same customer as the page, navigate to the same path with `?customer=` on change, and keep `?customer=` on the view links. Replace the disabled customer button. Verify: component test renders all names, shows NorthStar for `?customer=NOPE`, calls navigation with the new param on change, and the view links keep the param.
- [x] 3.4 Update any shell tests that assert the old placeholder text. Verify: `npm test` passes.

## 4. Compact chip and SiteTable

- [x] 4.1 Add a `compact` prop to `ProvenanceChip`: a `<button type="button">` showing only the method glyph(s) in the same tone classes (no visible text, no pointer cursor), `aria-label` "<Methods>, <Source>" (e.g. "Calculated, Synthetic"), wrapped in the existing `Tooltip` with the same text, which opens on hover and on focus. Glyphs `aria-hidden`; full chip unchanged. Verify: extend `tests/provenance.test.tsx`: accessible name has methods and source, no visible method text, focusable, tooltip appears on focus and on hover, two methods show two glyphs and the amber tone, tone equals the full chip's for the same value.
- [x] 4.2 Show the compact chip in `/design` next to the full chip in Provenance, including the stress case (longest method combination, narrow frames as in the existing stress test), and update the ProvenanceChip row in `docs/design.md` (compact variant, keyboard and tooltip behaviour). Verify: `/design` shows both variants in both themes; keyboard Tab reaches the compact chip with a visible focus ring and the tooltip; `npm run check:contrast` and `npm run check:design-imports` pass.
- [x] 4.3 Build `src/components/site-table.tsx`: compact 28px rows, `.num` numbers, formatting through `src/lib/format`, in each numeric column header a compact ProvenanceChip and a Show math control from the per-column provenance blocks (ShowMath inputs include Method and Source lines with the full text), horizontal scroll only when needed, plus populated, empty and loading states (reuse `states.tsx`). Verify: `tests/site-table.test.tsx` renders rows, empty and loading, and asserts per numeric header one compact chip and one Show math, the CALCULATED and MEASURED accessible names, and the Method and Source lines in Show math.
- [x] 4.4 Add the labelled fixture in `src/app/design/_sample/` and the SiteTable section under Data display on `/design`; add the row to the component table in `docs/design.md`. Verify: `/design` shows it in all states, the header stays usable at a narrow width, and `npm run check:design-imports` and `npm run check:contrast` pass.

## 4b. Header Show math as popover (added after review)

- [x] 4b.1 Add the shadcn Popover (`src/components/ui/popover.tsx`, shadow removed), split `ShowMath` into a shared body plus inline `ShowMath` and new `ShowMathPopover`; use it in SiteTable headers; tighten the table (fixed layout, narrow right-aligned numeric columns, `min-w-[40rem]`). Verify: `tests/site-table.test.tsx` shows the popover adds nothing to the table, one open at a time, Esc closes.
- [x] 4b.2 Show the table with an open popover in `/design` and list Popover and ShowMathPopover in `docs/design.md`. Verify: `/design` renders it; `npm run check:design-imports` passes.
- [x] 4b.3 Check in a real browser at 1280px: the table has no horizontal scroll, all four numeric columns are visible, the popover opens, closes on Esc and outside click, and does not move the table.

## 4c. One Show math pattern (added after review)

- [x] 4c.1 Remove the inline `ShowMath`; `ShowMathPopover` (default `align="start"`, table headers pass `end`) is the only Show math. Use it in `FactStatCard`; update the ShowMath tests (open with Enter, Esc, outside click) and the FactStatCard test. Verify: `npm test` passes.
- [x] 4c.2 Update `/design` (open Show math popover in the Provenance panel, FactStatCard text) and `docs/design.md` (drop the ShowMath row, ShowMathPopover is the only pattern). Verify: `/design` renders; `npm run check:design-imports` passes.
- [x] 4c.3 Check in a real browser: card popovers open and close with mouse, Enter and Esc; card heights do not change; both themes; no console errors. Verify: observations recorded in the final report.

## 5. Dashboard page

- [x] 5.1 Rewrite `src/app/dashboard/page.tsx` as an async server component: await `searchParams`, call `resolveCustomer`, show the fallback notice when a value was rejected, keep the period constant in one place, render `operationalFacts` through `FactStatCard` and `operationalSiteRows` through `SiteTable`. No arithmetic in the page. Verify: `npm run build` passes and `npm run lint` is clean.
- [x] 5.2 Check in the running app (`/run`): NorthStar cards read 24, 9 607, 31 743, 15 233, 15 233, 515 and the per-100 rate; Show math on Active wearers explains 28 367 and on the per-100 card explains full-year over December; `?customer=NOPE` shows NorthStar, the notice and a NorthStar picker; another customer shows its own numbers; switching KAM and Customer changes nothing; the picker, the header chips (tooltip on focus) and the column Show math work by keyboard; both themes; narrow width. Verify: record the observations in the final report.

## 6. Decisions, conventions, runbooks

- [x] 6.1 Write ADR 0014 "Selected customer lives in the URL" (page reads `searchParams`, header reads the hook because layouts cannot) and ADR 0015 "Active wearers: latest-month maximum per site", each in the repo template, and add both rows to `docs/adr/README.md`. Verify: the index lists 0014 and 0015 and links resolve.
- [x] 6.2 Add to `docs/conventions.md`: pages read the customer from `?customer=` through `resolveCustomer` and pass it down; the period is a single constant passed to the engine; new sheets are added to `SHEETS` (dictionary name, e.g. `Service_Activity`) and to the test `stems`; a table with mixed methods carries a chip per column. Verify: the text matches what the code does.
- [x] 6.3 Update `docs/runbooks/rebuild-data.md` with the service_activity summary line and the note that `washing_pct` is loaded but unused because its definition is unclear; update `docs/runbooks/add-design-component.md` only if the Select or SiteTable work found a missing step. Verify: following the runbook on a clean checkout rebuilds the data.
- [x] 6.4 Final gate: `npm test`, `npm run lint`, `npm run build`, `npm run check:design-imports`, `npm run check:contrast`, and `openspec validate dashboard-operational-kpis --strict`. Verify: all pass; nothing committed.
