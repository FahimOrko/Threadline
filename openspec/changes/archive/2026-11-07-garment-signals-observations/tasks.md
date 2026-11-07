# Tasks

## 1. Data and config

- [x] 1.1 Pipeline: build the per-site gap histogram from `service_cycles` sorted by pickup timestamp per asset, add its schema and generated JSON file, and wire it into `AppData` and the generated source. Verify with a Vitest pipeline test: out-of-order cycles use timestamp order, a single pickup adds no gap, and CUST001 has 9 244 gaps, median 49, max 170.
- [x] 1.2 Config: add T003 to T010 and the T006 map to `assumptions-config.ts` and export them from the engine index. Verify with a test: all set, tier rows 60/90/120, 90/120/150, 120/150/none, Central Laundry Hub unmapped, T010 is 10.

## 2. Engine signals and rules

- [x] 2.1 Signals (`signals.ts`): dormant, over-allocation and repair spike as Facts with source ASSUMPTION and their T ids. Verify with one test per signal on fixtures (tier boundaries, Office without Critical, unmapped type listed as not classified in Show math, no allocation, short history, ratio met but floor not met) and one NorthStar check each: S007 and S018 Critical, S010/S001/S024/S002 under 0.80, five spike sites (S006, S007, S018, S021, S023; S022 excluded by the floor).
- [x] 2.2 Rules (`observations.ts`): `Observation[]` in the spec shape from the signals, Replacements postponed and Cost of unused allocation. Verify with tests: NorthStar returns 1 value, 3 risks and 1 gap, every `factIds` entry resolves, an unflagged signal emits nothing, dormant text names sites and never people.

## 3. UI and docs

- [x] 3.1 `ObservationCard` plus the dashboard Observations section with site links that keep `customer`, `baseline` and `sensitivity`. Add the card to `/design` (sample data under `src/app/design/`) and to `docs/design.md`. Verify with `npm run check:design-imports`, `npm run lint` and `npx tsc --noEmit`.
- [x] 3.2 Docs: ADR 0018 (thresholds as team choices, histogram split), one line in `docs/conventions.md`, and `docs/adr/README.md` index. Verify the ADR links to 0016 and 0017.

## 4. Check

- [x] 4.1 Run `npm test`, then one Playwright and Chrome check at 1280px in dark and light: the dashboard for NorthStar shows 5 cards, Show math opens, a site link opens the site page with the three params kept, `/design` shows the card. Report anything failing, and record screenshots in the scratchpad, not the repo.
