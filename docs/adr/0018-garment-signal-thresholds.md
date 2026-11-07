# 0018. Garment signal thresholds are team modelling choices; the pipeline ships gap histograms

- Status: accepted
- Date: 2026-11-07
- Supersedes: none

## Context

Slice 5 adds three garment signals (dormant garments, over-allocation, repair spikes) and rule-based observations. Each needs thresholds. The pack's own assumptions (A001 to A008) hold none; the product spec gives the dormant tier table and "labelled assumptions" for the rest. ADR 0016 keeps unknowns unset and ADR 0017 sets declared modelling choices.

## Decision

- T003 to T010 in `assumptions-config.ts` are declared modelling choices with set values, like T002: three dormant tier rows (T003 to T005), the site-type to tier map (T006), the over-allocation cut-off 0.80 (T007), the repair-spike ratio 1.5 (T008), its trailing window of 3 months (T009) and a floor of 10 repairs above the trailing mean (T010). Signal Facts have source ASSUMPTION and list the T ids they used.
- The pipeline ships only a per-site histogram of pickup gaps in whole days, taken from each asset's pickups sorted by timestamp. The engine applies the tiers, so a threshold changes with a config edit and no data rebuild. Raw cycles still never ship.
- A site type missing from T006 is skipped for dormant classification and listed in Show math as not classified; it raises a data-gap observation.
- Observations are one per signal and list the flagged sites; there is no ranking or curation until Review Prep.

## Consequences

Thresholds are visible and challengeable but are not Lindström data; changing one is a code change. Gaps cover all of 2025 and are not clipped to the period. Dormant counts are per site and never per person.
