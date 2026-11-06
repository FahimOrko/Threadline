# Conventions

Read before coding, together with `docs/adr/README.md`. Add a new convention here in the same change that discovers it.

## Folders
- Code lives in `src/`: `app/` (routes), `components/` (`ui` is shadcn), `lib/`, `store/`. Import with the `@/` alias.
- `lib/engine` computes numbers, `lib/data` loads and validates data, `lib/ai` holds AI client, tools and prompts.
- Source CSVs in `data/raw/`, generated JSON in `data/generated/`, tests in `tests/`.

## Naming
- Files and folders: kebab-case. React components: PascalCase exports. Zustand stores: `use<Name>Store`.

## Numbers and provenance
- No number is computed outside `src/lib/engine` (ADR 0005).
- Every displayed value carries provenance: method and source (ADR 0004).
- The AI never writes digits; it uses fact tokens.

## Testing
- Vitest, tests in `tests/` named `*.test.ts`. Engine changes need tests. Run with `npm test`.

## Next.js
- This Next.js version differs from older ones. Read the matching guide in `node_modules/next/dist/docs/` before using a routing, caching or metadata API.

## Environment
- Secrets only in `.env.local` and Vercel env vars, never prefixed `NEXT_PUBLIC_`. `.env.example` lists every variable.

## Docs
- ADRs are append-only. `docs/product-spec.md` is only edited on request.
