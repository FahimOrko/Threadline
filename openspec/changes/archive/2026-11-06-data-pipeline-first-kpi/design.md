# Design

## Context

`zod` and `papaparse` are installed. `data:build` is a stub, and `src/lib/engine`, `src/lib/data` and `data/generated/` do not exist. `StatCard`, `ProvenanceChip` and `ShowMath` take plain strings; `Method` and `Source` live in `src/lib/provenance.ts`. All 19 CSVs in `data/raw/` were verified against `data_dictionary.csv`. ADR 0002 (static JSON), 0003 (raw CSVs), 0004 (provenance) and 0005 (numbers only in engine) apply. See proposal.md for motivation.

## Goals / Non-Goals

**Goals:**
- One path from CSV to card that later KPIs reuse unchanged.
- An engine that runs in the browser later (overlay slice) without edits.

**Non-Goals:**
- Browser overlay, the other sheets, customer/period selectors, sensitivity.

## Decisions

```
data/raw/*.csv --data:build--> data/generated/{repairs,sites,customers,assumptions}.json
                                              + data-quality.json
        server component: static import --> DataSource (JSON adapter)
        --> engine(data, {customerId, period}) --> Fact (raw number + unit)
        --> FactStatCard --> src/lib/format --> StatCard + ProvenanceChip + ShowMath
```

- **Header check compares column sets against `data_dictionary.csv`.** A missing expected column or an unknown extra column fails the build; order is ignored. The dictionary is read at build time, so a re-exported pack is checked against its own definitions. Alternative: ordered list. Rejected: a harmless reorder should not block the build, while a renamed or extra column is a real signal. Alternative: hard-coded column lists in Zod only. Rejected: drift between code and pack goes unnoticed. Zod still validates row values.
- **Generated data is built, not committed.** `prebuild` and `predev` run `data:build`; `data/generated/` is in `.gitignore`; `data/raw/` stays committed. A failing data build stops dev and build. Recorded as ADR 0013. It supersedes the "Base data: `data/generated/*.json`, committed" line in the product spec (the spec itself is not edited, per ADR 0007) and the runbook's "commit the generated JSON" step. ADR 0002 does not mention committing, so it stands.
- **Tests do not depend on `data/generated/`.** The 15 233 acceptance test runs the pipeline functions in-process on `data/raw/`, so `npm test` works on a clean checkout without a prior build.
- **Engine takes data as an argument.** No `fs`, no `server-only`, no formatting. Loading happens only in the dashboard server component. This keeps ADR 0005 and lets Slice 9 run the same code in the browser.
- **Period is `{ from, to }` inclusive month strings** (`"2025-01"`). Months sort as strings, so no date maths.
- **Computed from `repair_count`.** The pipeline cross-checks `estimated_replacements_postponed` row by row and reports disagreements. Checked on the current pack: 0 of 3 635 rows disagree.
- **Fact reuses `Method` and `Source`.** `methods` is an array, matching `ProvenanceChip`. Confidence comes from the A002 row in the assumptions data (Low-Medium), not a constant in code.
- **Formatting in `src/lib/format`.** Thin-space thousands, matching the `/design` samples. It only turns numbers into strings. Alternative: format in the engine. Rejected: the engine would then serve display and AI tokens with one format.
- **`FactStatCard` is a thin mapper**, not a new card. It is the only place a Fact becomes `StatCard` props. Range low/high missing renders "not yet modelled".
- **Data-quality report is one JSON** with per-file `{ read, valid, invalid: [{row, reason}], crossChecks: [...] }`. Not shown in the UI this slice.
- **Tests:** Vitest for header check (match and mismatch), row validation, cross-check, engine (15 233, other customer, unknown customer, period subset) and format. A component test renders FactStatCard.

## Risks / Trade-offs

- [Ignored `data/generated/` is missing on a clean checkout] → `prebuild` and `predev` generate it; tasks verify a clean checkout runs `npm run build`.
- [Set comparison hides a reordered pack] → accepted: rows are read by column name, so order has no effect on values.
- [Vercel build needs `data/raw/`] → it stays committed, so `prebuild` works there.
- [A002 is Low-Medium confidence] → the card is ESTIMATED with the uncertain tint, and Show math names A002.
- [Only one KPI proves the pipeline thinly] → the Fact shape and adapter are the reusable parts, and Slice 3 adds KPIs without changing them.
