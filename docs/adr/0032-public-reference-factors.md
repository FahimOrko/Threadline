# 0032. A published factor keeps a T id but carries the source PUBLIC_REFERENCE

- Status: accepted
- Date: 2026-11-08
- Refines: 0016

## Context

Impact World turns CO2e into trees with the US EPA figure of 0.060 tCO2e per urban tree seedling grown for 10 years. It is not a team guess and not synthetic data, so labelling it ASSUMPTION would mislead. It still has to live in the one config (ADR 0016) and be shown in Show math.

## Decision

- The factor is T011 in `src/lib/engine/assumptions-config.ts`. A `TeamAssumption` may declare `source: "PUBLIC_REFERENCE"`; without it the source stays ASSUMPTION (ADR 0016 unchanged).
- Facts using T011 carry the methods ILLUSTRATIVE and CALCULATED and the source PUBLIC_REFERENCE. Show math lists the factor, its unit, the source URL and the note. The note states that it is a CO2 factor applied to CO2e as an approximation.
- The tree Facts (`tree_factor`, `trees_comparison`, `trees_service`, `trees_saved`, `tree_icon_scale`) are built in `src/lib/engine/equivalences.ts` from the footprint Facts, with no second emissions calculation. Icon counts are rounded up for drawing and capped at 300 with a fixed legend step.
- The report's team-assumptions table lists T011 in plain words.

## Consequences

Further published factors (water, car kilometres) follow the same pattern with their own T id. Equivalences stay illustrations, never reporting.
