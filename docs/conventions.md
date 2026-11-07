# Conventions

Read before coding, together with `docs/adr/README.md`. Add a new convention here in the same change that discovers it.

## Folders
- Code lives in `src/`: `app/` (routes), `components/` (`ui` is shadcn), `lib/`, `store/`. Import with the `@/` alias.
- `lib/engine` computes numbers, `lib/data` loads and validates data, `lib/ai` holds AI client, tools and prompts.
- Source CSVs in `data/raw/`, generated JSON in `data/generated/`, tests in `tests/`.
- `data/generated/` is built by `predev` and `prebuild` and never committed (ADR 0013). Load it only in server components, through `src/lib/data/generated.ts`.

## Naming
- Files and folders: kebab-case. React components: PascalCase exports. Zustand stores: `use<Name>Store`.

## UI
- Before building UI, read `docs/design.md` and check `src/components` for an existing component.
- Every new reusable component is added to the `/design` gallery and to `docs/design.md` in the same change.
- Nothing outside `src/app/design/` imports the `/design` sample data (ADR 0010). `npm run check:design-imports` enforces it.
- Numbers use Geist Mono with tabular figures (the `.num` class). Icons come from Phosphor only.
- Colours come from theme tokens in `globals.css`, never hard-coded. A new token needs light and dark values and a pair in `scripts/check-contrast.ts`.

## Pages and data
- The selected customer comes from `?customer=`: a page awaits `searchParams`, calls `resolveCustomer` and passes the customer down (ADR 0014). The period is one constant passed to the engine.
- A new sheet goes into `SHEETS` under its `data_dictionary.csv` name (e.g. `Service_Activity`), into the `stems` list of `scripts/build-data.ts` and into the `stems` of the tests that run the pipeline.

## Numbers and provenance
- No number is computed outside `src/lib/engine` (ADR 0005).
- Every displayed value carries provenance: method and source (ADR 0004).
- The engine is pure and isomorphic: data in as an argument, no `fs` or server-only imports, raw numbers and a unit out. Display strings come from `src/lib/format`.
- The AI never writes digits; it uses fact tokens.
- A table whose columns differ in method carries a compact ProvenanceChip and Show math per column header, with the full method and source in Show math.
- Values only the team or Lindström can supply go in `src/lib/engine/assumptions-config.ts` with a T-prefixed id, are unset as `null` (never a placeholder) and render as assumed (ADR 0016).
- A site page narrows the same Facts with `siteId` in the scope (`inScope`, `factScope` in `src/lib/engine/fact.ts`). A Fact the data cannot split by site is left out and the page says so; a customer-level number never stands in for it.
- Garment-signal thresholds (T003 to T010) are set team modelling choices, not unknowns (ADR 0018). The pipeline ships a threshold-free aggregate (pickup-gap histogram) and the engine applies the tiers; observations carry no digits in their text, the numbers live in the Facts they list.
- A baseline is always a parameter of an engine function, never read inside it. The dashboard passes the row chosen by `?baseline=` and the level from `?sensitivity=`, both resolved in `src/lib/selection.ts` (ADR 0017); unknown values fall back to `DEFAULT_BASELINE_ID` and base with a notice.
- Story priorities are `?priorities=a,b` (ADR 0019), resolved by `resolvePriorities` in `src/lib/selection.ts`; unknown picks are dropped with a screen-only notice. Story text is a template over `{{fact:id}}` tokens in `src/lib/story`; a null Fact reads "Needs input".
- The story game (`/story/game`, ADR 0021) holds scene, beat and the four levers in the URL; every game link goes through `gameHref`, which copies all other query params (including unknown ones such as `view`). Characters speak only template text over `{{fact:id}}` tokens; `tests/story-game.test.ts` fails on a digit outside a token, `CO2e` or a T-prefixed id. A Fact change is `factDelta` from the engine, never a subtraction in a component.
- The game script is conditional data (ADR 0022): explain and meaning slots of `(condition, line)` with a fallback each, picked by `pickLine`; no condition in a component. Dialogue never says "baseline", "sensitivity" or "Fact" (tested). Sensitivity is shown as Cautious / Standard / Generous estimate from `SENSITIVITY_LABEL` in `src/lib/selection.ts` on every surface; URL values stay low/base/high. Suggestions come from `suggest`, never pre-select. On `/story/game` the header pickers are hidden and the AI sidebar starts collapsed.
- A reference a computation depends on (e.g. `product_id` for money KPIs) fails the build, naming the ids and the sheet. A row that is merely unmapped is counted in the data-quality report and excluded.

## Testing
- Vitest, tests in `tests/` named `*.test.ts`. Engine changes need tests. Run with `npm test`.

## Next.js
- This Next.js version differs from older ones. Read the matching guide in `node_modules/next/dist/docs/` before using a routing, caching or metadata API.

## Environment
- Secrets only in `.env.local` and Vercel env vars, never prefixed `NEXT_PUBLIC_`. `.env.example` lists every variable.

## Docs
- ADRs are append-only. `docs/product-spec.md` is only edited on request.
