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
| [0010](0010-design-sample-data-exception.md) | Sample data exists only inside /design | accepted | Labelled strings, never imported elsewhere |
| [0011](0011-theme-tokens-icons.md) | Theme, tokens and icons | accepted | next-themes, CSS-variable tokens, Phosphor, contrast script |
| [0012](0012-header-mismatch-fails-build.md) | A column mismatch fails the data build | accepted | CSV headers are compared as a set with the dictionary sheet |
| [0013](0013-generated-data-built-not-committed.md) | Generated data is built, not committed | accepted | `predev` and `prebuild` run `data:build`; `data/generated/` is ignored |
| [0014](0014-selected-customer-lives-in-the-url.md) | The selected customer lives in the URL | accepted | `?customer=` read by the server page; header mirrors it; unknown falls back to NorthStar |
| [0015](0015-active-wearers-latest-month-max-per-site.md) | Active wearers: latest-month maximum per site | accepted | Avoids the double count in the pack's 28 367; December snapshot |
| [0016](0016-team-assumptions-live-in-one-config.md) | Team assumptions live in one config | accepted | Typed config with T-prefixed IDs; always assumed; unset is null, shown as "Needs input" |
| [0017](0017-baseline-and-sensitivity-in-the-url.md) | Baseline and sensitivity live in the URL; the spread is a declared modelling choice | accepted | `?baseline=` and `?sensitivity=` follow ADR 0014; T002 (±20 % on baseline factors) is set, unlike ADR 0016's unknowns |
| [0018](0018-garment-signal-thresholds.md) | Garment signal thresholds are team modelling choices; the pipeline ships gap histograms | accepted | T003 to T010 set values; the engine applies tiers to a per-site gap histogram; unmapped site types are listed, not dropped |
| [0019](0019-story-priorities-in-the-url.md) | Story priorities live in the URL | accepted | `?priorities=a,b` (two of six chips), resolved like ADR 0014/0017; picks reorder and label chapters; view switcher carries the param |
| [0020](0020-story-print-by-browser.md) | Story prints by the browser at `/story/print` | accepted | Print route + print CSS, no PDF library; Show math expanded inline per chapter; AppShell goes bare by pathname |
| [0021](0021-story-choices-game.md) | The story choices game keeps its state in the URL and takes deltas from the engine | accepted | `/story/game` with `scene`, `beat` and the four levers in the address; `factDelta` in the engine; links keep every other param; `resolveView` ready for the customer view |
