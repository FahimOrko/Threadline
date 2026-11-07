# Tasks

## 1. Decisions and docs

- [x] 1.1 Read `docs/design.md`; write ADR 0017 (baseline and sensitivity in the URL; T002 is a declared team modelling choice, set at 0.2, unlike ADR 0016's unset unknowns; references 0016) and append one row to `docs/adr/README.md`; update the baseline line in `docs/conventions.md`. Verify: README row present, no existing ADR edited.

## 2. Engine

- [x] 2.1 Add T002 (0.2, share of baseline factor) to `assumptions-config.ts` and a `Sensitivity` type; add `sensitivity` to `footprintFacts` and fill `range` and `value` on the six savings Facts (source ASSUMPTION and T002 off base; wording of the illustrative note generalised). Verify: `npm test`.
- [x] 2.2 Tests in `tests/footprint-facts.test.ts`: each of the three baselines (labels, factors) and each of low, base, high (values equal 0.8 / 1 / 1.2 scaled factors, ordering, null range on service and delivery Facts), plus home washing keeps delivery note and net CO2e Fact. Verify: `npm test` passes, base NorthStar values unchanged.

## 3. URL params and header

- [x] 3.1 Add pure baseline and sensitivity resolvers next to `src/lib/customer.ts` with tests for default, valid, unknown and repeated values. Verify: `npm test`.
- [x] 3.2 Replace the disabled header button with the two selectors (reuse the customer picker pattern and `ui/Select` or `ToggleGroup`), preserving the other params in view links; add any new reusable component to `/design` and `docs/design.md`. Verify: `app-shell` test and manual keyboard use.
- [x] 3.3 Dashboard page awaits `?baseline=` and `?sensitivity=`, passes the row and level to the engine, shows fallback notices, and makes the section description follow the baseline. Verify: dashboard renders for all three baselines with no console errors.

## 4. Browser check

- [x] 4.1 One Playwright + Chrome pass at 1280px in dark and light: home washing + high shows "vs home washing" labels, net CO2e beside delivery, Show math with low/base/high, no clipping. Verify: screenshots, no console errors.
