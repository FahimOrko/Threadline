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

## Testing
- Vitest, tests in `tests/` named `*.test.ts`. Engine changes need tests. Run with `npm test`.

## Next.js
- This Next.js version differs from older ones. Read the matching guide in `node_modules/next/dist/docs/` before using a routing, caching or metadata API.

## Environment
- Secrets only in `.env.local` and Vercel env vars, never prefixed `NEXT_PUBLIC_`. `.env.example` lists every variable.

## Docs
- ADRs are append-only. `docs/product-spec.md` is only edited on request.
