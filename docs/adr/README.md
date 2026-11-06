# Architecture Decision Records

Read this index first and open only the ADRs that apply. ADRs are append-only: an accepted ADR is never edited. A changed decision gets a new ADR that says "Supersedes NNNN", and this index marks the old one superseded.

Template: Title, Status (accepted / superseded), Date, Context, Decision, Consequences, Supersedes.

| # | Title | Status | Summary |
|---|-------|--------|---------|
| [0001](0001-nextjs-vercel-no-database.md) | Next.js App Router on Vercel, npm, no database | accepted | Next.js on Vercel with npm; no server state |
| [0002](0002-static-json-plus-overlay.md) | Base data as static JSON plus browser overlay | accepted | Edits live in the browser on top of build-time JSON |
| [0003](0003-raw-csv-in-data-raw.md) | Raw CSVs in `data/raw/`, not in `docs/` | accepted | Keeps large files out of agent context |
| [0004](0004-provenance-labels.md) | Provenance labels on every displayed value | accepted | Each value shows method and source |
| [0005](0005-numbers-only-in-engine.md) | All numbers computed in the engine | accepted | AI uses fact tokens and never writes digits |
| [0006](0006-ai-sdk-openrouter-free.md) | Vercel AI SDK with OpenRouter free models | accepted | Free models only, version pinned, key server-only |
| [0007](0007-spec-vision-vs-built.md) | Product spec is the vision, `openspec/specs/` is built truth | accepted | Planned and built never mix |
| [0008](0008-src-directory-layout.md) | Code lives in `src/` | accepted | `@/` alias maps to `./src/*` |
| [0009](0009-app-name-threadline.md) | App name is Threadline | accepted | Replaces the working title "Customer Value Review" |
