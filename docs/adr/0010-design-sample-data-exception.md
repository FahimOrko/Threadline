# 0010. Sample data exists only inside /design

- Status: accepted
- Date: 2026-11-06
- Supersedes: none

## Context

ADR 0005 says all numbers are computed in the engine, and ADR 0004 says every displayed value carries provenance. The `/design` gallery has to show KPI tiles, chips and the show-math panel before the engine exists (Slice 1 comes before the data pipeline), so it needs example values.

## Decision

Example values for `/design` are fixed strings in `src/app/design/_sample/`. They are never computed. Every place that shows one carries the label "sample data, not engine output". No file outside `src/app/design/` may import the sample folder; `npm run check:design-imports` fails if one does.

## Consequences

ADR 0005 keeps holding for every real view: the exception covers only the gallery, which shows no customer data. Later slices that need realistic fixtures for tests use `tests/` fixtures, not this folder. If the gallery ever shows engine output, switch it to engine fixtures and retire the sample folder.
