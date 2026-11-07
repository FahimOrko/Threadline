# Design

## Context

`pipeline.ts` already validates `service_cycles`, ships only `cycleCounts` and deletes the raw rows. The engine is pure, returns Facts (ADR 0004, 0005) and reads thresholds from `assumptions-config.ts` (ADR 0016, 0017). `garmentUtilization` and `repairs` Facts already exist and the site page already exists. Checked on the pack: no assumption A001 to A008 holds a threshold (A007 only says rules use industry and priority), so every threshold is a new T entry. All 3 076 assets stay at one site, so a gap belongs to one site.

## Goals / Non-Goals

**Goals:** three signals and five NorthStar observations with provenance; a shape Review Prep can reuse unchanged.
**Non-Goals:** ranking, KAM curation, AI wording, a period picker (period stays the 2025 constant), per-person dormant data.

## Decisions

1. **Pipeline ships a gap histogram, not counts per tier.** `{ customer_id, site_id, gapDays: { "<days>": count } }` per site, about 170 keys at most. Tiers are team assumptions (ADR 0016) and the engine owns classification, so changing a threshold never needs a data rebuild. Alternative: per-tier counts in the pipeline; rejected because it bakes thresholds into build output. Alternative: all gaps as an array (9k numbers); rejected, "ship only the aggregate".
2. **Gap attributed to the later pickup's site, whole days (floor).** Assets never change site in the pack, so this is exact; a cross-check is not added.
3. **Gaps cover all of 2025 with no period filter.** The pack is one year and the dashboard period is fixed, so a gap is not clipped to a period. Stated in Show math notes.
4. **Config shape.** T003 to T005 are one entry per tier row. Each keeps `value` (the Watch days) and gains an optional `tiers: { watch, risk, critical: number | null }`. T006 is a typed map exported next to the config with the same id, unit "n/a" and certainty. T007 to T010 are plain numeric entries. Alternative: nine scalar entries; rejected as noisy. All are set values, like T002.
5. **Unmapped types are shown, not dropped.** The dormant signal returns the list of unclassified sites (name and type) and the dormant Facts list them in Show math as "not classified". They add no counts and no Critical flag. The same list raises the data-gap observation.
6. **Signals live in `src/lib/engine/signals.ts`, rules in `observations.ts`.** Each signal Fact has source ASSUMPTION and lists its T ids (ADR 0016 tint). Counts are per site; the dormant Fact is the number of Critical gaps, with Watch, Risk and share in its inputs.
7. **Dormant risk fires on Critical gaps only.** Counting Risk would flag nearly every site (3 to 7 Risk gaps per Production Plant, over 20 sites with some), which says nothing. The loose row has no Critical, so Office and Distribution sites never fire; that follows the spec table ("n/a").
8. **Over-allocation uses December utilization, below 0.80.** It reuses `garmentUtilization` for the last month of the period, so the number on the card equals the number on the dashboard.
9. **Repair spike: ratio 1.5 (T008) over a 3-month trailing mean (T009), and an increase of at least 10 repairs over that mean (T010).** The floor stops low-volume sites firing on a few repairs (S022: 18 against 12). Both must hold. 1.5 is the first round value that flags a minority (without the floor 6 of 24 sites; 1.4 flags 10, 1.3 flags 18). With the floor 5 of 24 fire: S006, S007, S018, S021, S023. Nothing was tuned to a site. A spike is evaluated for months 4 to 12 and the observation names the latest spike month per site.
10. **One observation per signal, not per site.** `scope: { customerId, siteIds? }` lists the flagged sites. Five cards for NorthStar instead of up to twelve. Site links reuse the existing site route and keep all three params through one small link helper next to the selection code.
11. **Observation shape** is `{ id, type, severity, scope, factIds, audience, suggestedAction }` plus display `text` (plain English with no digits typed by hand: the card prints Facts through the existing formatters). Audience is `kam` or `both`; the gap observation is `kam`. Severity: dormant Critical is high, others medium; value is low. Ranking is left to Slice 7, so the list order is rule order.
12. **ObservationCard** takes an observation plus its Facts, reusing Badge, Panel, ProvenanceChip and ShowMathPopover. No new tokens.
13. **A new ADR** (0018) records the thresholds as team modelling choices and the histogram split between pipeline and engine. It supersedes nothing.

## Risks / Trade-offs

- A large site can still fire on a modest rise and a small site can never fire → T008 to T010 are one config edit.
- Rule thresholds are assumed, not Lindström data → source ASSUMPTION and the amber tint on every signal Fact.
- The dormant risk shows only Production Plants for NorthStar, so it reads as a plant discussion, not a food-hygiene one → wording says hygiene and availability, at site level.
- Gaps are all-year, not period-bound → noted in Show math; revisit if a period picker arrives.
