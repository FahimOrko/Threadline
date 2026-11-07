# Design

## Context

`/story` is a stub. The dashboard already does the work this needs: it awaits `searchParams`, resolves customer, baseline and sensitivity (ADR 0014, 0017), builds Facts in the pure engine, and renders them with `FactStatCard` and `ObservationCard`. `data/generated/data-quality.json` exists but nothing loads it, and `generatedSource` does not expose it. Team assumptions are in `assumptions-config.ts` (T001 unset, T002 to T010 set). See proposal.md for scope and the open choices.

## Goals / Non-Goals

**Goals:**
- One page, one column, every chapter in the document, same markup reusable by a later print route.
- Story text is a template over fact tokens so the later AI story can swap in without changing resolution.

**Non-Goals:**
- Scenes, characters, Enter-to-advance, motion (spec's visual-novel look). Stored stories, story ids, Zod Story JSON.
- Responsive tuning below desktop. Next year's plan. Free-text priorities.

## Decisions

1. **Story is a pure builder, in `src/lib/story`, not in the engine.** `buildStory({ facts, observations, assumptions, readiness, priorities })` returns ordered chapters of `{ id, title, lines (tokenised), factIds, priority? }`. It computes nothing: it selects, orders and phrases. Numbers are resolved at render by looking up each `{{fact:id}}` and formatting with `formatCardValue`/`formatValue`; null becomes "Needs input". A token with no matching Fact fails a test rather than rendering blank. Alternative: JSX strings with inline `formatValue(fact.value)`. Rejected: it hides which Facts a chapter depends on, which the later stale-chapter logic and AI fallback both need.
2. **Priority to chapter map** (a constant next to the builder): water and emissions both feed "Water and carbon" (water leads its Facts, or CO2e does, depending on which is picked; picking both keeps the default Fact order and shows both "Your priority" badges); cost feeds "What it means in euros"; circularity feeds "What we kept out of the bin"; service feeds "Service and reliability", a chapter of the service-request and on-time Facts and the late-cycle observation; hygiene feeds "Where we see risk" (dormant and over-allocation observations). Two picks mapping to one chapter (water and emissions) yield one prioritised chapter with two badges and no further reordering; the picker notes this. Hygiene feeds the existing "Where we see risk" chapter (confirmed in review); its intro line names hygiene because the title is about risk. Alternative: one chapter per priority. Rejected: water and emissions share one baseline comparison and splitting would repeat Facts. The service chapter is added to the spec's default list so each of the six priorities has a home; kept in review.
3. **Priorities resolver beside `selection.ts`:** `resolvePriorities(param)` returns `{ priorities: Priority[], rejected: string[] }`, same fallback-with-notice style. Pure, isomorphic, unit-tested. Link helper `storyHref(params)` keeps customer, baseline, sensitivity and priorities; the picker uses it so changing a pick keeps everything else.
4. **Param preservation (read in review, `src/components/app-shell.tsx`).** `ParamSelect` already builds `next` from `new URLSearchParams(params.toString())`, sets only its own name and pushes, so it keeps `?priorities=` and any other param; my earlier risk note was wrong for the selectors. The gap is `ViewLinks`: it rebuilds the query from `customer`, `baseline` and `sensitivity` only, so switching view drops `priorities`. Change: `ViewLinks` also copies `priorities` when present, kept raw (no validation in the header; the page validates). Alternative: copy every param. Rejected for now: it would carry unknown junk and future page-local params across views; revisit if a second page-local param appears. Tests: `ParamSelect` keeps `priorities` and an unrelated param when one selector changes (regression lock); `ViewLinks` keeps `priorities`.
5. **Picker is links, not client state.** Each priority is a link toggling it in `?priorities=`; at most two selected, a third pick replaces the oldest. The "unknown priority dropped" notice carries a `print:hidden` class and a `data-print="hide"` marker so a print route can hide it; chapter text is never hidden. No JS needed, shareable, prints without it. See decision 4 for header param preservation.
6. **Data-readiness Facts in the engine.** `dataReadinessFacts(report)` turns `QualityReport` into Facts (rows read, invalid rows per source, cross-check disagreements, method CALCULATED... source from the report as SYNTHETIC) so counts are not computed in a page. `src/lib/data/generated.ts` gains a sibling export for the quality JSON (server components only, ADR 0013). The report's `QualityReport` type already exists. `data-quality.json` is a computation dependency of the readiness chapter, so per the conventions rule a missing or unreadable file fails the build: it is imported statically like the other generated files (a missing file breaks `next build`), and the loader validates its shape and throws a message naming the file. The page has no empty-chapter branch. The text about handling (sort by timestamp; `washing_pct` not used; route km absent; Public_References missing) is static template text drawn from the product spec's data-quality findings, with no digits.
7. **Methodology facts** come from `TEAM_ASSUMPTIONS` and `DORMANT_SITE_TYPE_TIERS`, listed id, note, value and unit or "Needs input", plus the pack assumptions A001 to A008 already in `data.assumptions`. The local-laundry baseline caveat and the open questions are static text. The 0.62 kgCO2e/kg figure comes from the baseline row via a Fact input, not typed into text.
8. **Page is a server component** with the dashboard's Suspense pattern. New reusable pieces: `StoryChapter` (heading, optional "Your priority" Badge, body, fact rows) and `PriorityPicker`. Both go into `/design` and `docs/design.md`. Cards inside chapters reuse `FactStatCard`.
9. **Print safety by construction:** no `hidden`, `details`, tabs or client-only reveal for chapter text; chapter containers get `break-inside: avoid` classes now so the print route inherits them.
10. **New ADR 0019** records `?priorities=` in the URL, the priority to chapter map and that the view switcher carries the param. ADR 0017's "Story ignores the params" line is not edited (append-only); 0019 notes Story now reads them.

## Risks / Trade-offs

- [Six priorities over seven chapters can feel arbitrary] → the map is one constant, shown in the proposal for review.
- [Two picks sharing a chapter] → the picker text says so; both slots are still stored in the URL so a later layout can use them.
- [View switcher drops `?priorities=`] → `ViewLinks` carries it, with a test (decision 4).
- [Quality JSON import adds build coupling] → same pattern as the other generated files; `predev`/`prebuild` already create it.
- [Story text drifts from the dashboard] → a test asserts every token resolves and that story numbers equal the dashboard Facts.

## Open Questions

- Should the cover also show the industry's default priorities as a hint? Safe to defer; does not change the specs.
