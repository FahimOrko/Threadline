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

- **Header check is by column list, in order, against `data_dictionary.csv`.** The dictionary is read at build time, so a re-exported pack is checked against its own definitions. Alternative: hard-coded column lists in Zod only. Rejected: drift between code and pack goes unnoticed. Zod still validates row values.
- **Engine takes data as an argument.** No `fs`, no `server-only`, no formatting. Loading happens only in the dashboard server component. This keeps ADR 0005 and lets Slice 9 run the same code in the browser.
- **Period is `{ from, to }` inclusive month strings** (`"2025-01"`). Months sort as strings, so no date maths.
- **Computed from `repair_count`.** The pipeline cross-checks `estimated_replacements_postponed` row by row and reports disagreements. Checked on the current pack: 0 of 3 635 rows disagree.
- **Fact reuses `Method` and `Source`.** `methods` is an array, matching `ProvenanceChip`. Confidence comes from the A002 row in the assumptions data (Low-Medium), not a constant in code.
- **Formatting in `src/lib/format`.** Thin-space thousands, matching the `/design` samples. It only turns numbers into strings. Alternative: format in the engine. Rejected: the engine would then serve display and AI tokens with one format.
- **`FactStatCard` is a thin mapper**, not a new card. It is the only place a Fact becomes `StatCard` props. Range low/high missing renders "not yet modelled".
- **Data-quality report is one JSON** with per-file `{ read, valid, invalid: [{row, reason}], crossChecks: [...] }`. Not shown in the UI this slice.
- **Tests:** Vitest for header check (match and mismatch), row validation, cross-check, engine (15 233, other customer, unknown customer, period subset) and format. A component test renders FactStatCard.

## Risks / Trade-offs

- [`data/generated/` not committed breaks `next build`] → generate it in the build script chain and decide tracking in the runbook; tasks verify a clean checkout builds.
- [Header check too strict for harmless column reordering] → compare as ordered lists on purpose; relax only with a new ADR.
- [A002 is Low-Medium confidence] → the card is ESTIMATED with the uncertain tint, and Show math names A002.
- [Only one KPI proves the pipeline thinly] → the Fact shape and adapter are the reusable parts, and Slice 3 adds KPIs without changing them.
