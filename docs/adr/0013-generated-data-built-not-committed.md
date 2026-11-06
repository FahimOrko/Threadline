# 0013. Generated data is built on dev and build, and never committed

- Status: accepted
- Date: 2026-11-06
- Supersedes: the "committed" detail for base data in the Storage section of `docs/product-spec.md` (line edited with the user's approval) and the "commit the generated JSON" step in the rebuild-data runbook. ADR 0002 is unaffected: it says base data is static JSON generated at build time and does not mention committing.

## Context

Generated JSON is derived from `data/raw/`. Committing it lets it drift from the CSVs and adds about 1 MB of diff noise per rebuild.

## Decision

`data/generated/` is git-ignored. `predev` and `prebuild` run `npm run data:build`, so `npm run dev` and `npm run build` always start from fresh data and stop if the build fails (ADR 0012). `data/raw/` stays committed. Tests do not depend on `data/generated/`: they run the pipeline in-process on `data/raw/`.

## Consequences

A clean checkout needs no extra step, and Vercel builds from `data/raw/`. Anything that reads `data/generated/` outside dev or build, such as a standalone script, must run `npm run data:build` first.
