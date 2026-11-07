# Design

## Context

Facts are the only way a number leaves the engine (ADR 0004, 0005). `Fact.value` is a `number`, the engine is pure, and `FactStatCard` is the only Fact-to-card mapping. Provenance tint comes from `chipTone`: an uncertain method or source `ASSUMPTION` is amber. `products.csv` (6 rows) and the `Products` dictionary sheet exist but are not loaded. See proposal.md for scope.

## Goals / Non-Goals

**Goals:**
- One rule for team-supplied unknowns that later values (washing_pct, CO2-per-tree, route km) reuse without a new mechanism.
- An unset value can never reach the screen as 0 or NaN.

**Non-Goals:**
- Editing assumptions in the UI, annualising the weekly cost.

## Decisions

1. **`Fact.value: number | null`; `range.base` follows.** null means "needs input". Alternatives: a separate `status` field (two fields that can disagree) or value 0 plus a flag (the exact failure to avoid). The type change makes the compiler list every consumer: `FactStatCard`, `serviceRequestsPer100Wearers` (reads `.value` of Facts that are never null) and tests.
2. **Config shape.** `assumptions-config.ts` exports `TeamAssumption = { id: `T${string}`; value: number | null; unit: string; note: string; certainty: "assumed" }` and `TEAM_ASSUMPTIONS` (`as const satisfies`), keyed by name (`rentalFeePerPieceWeek`). Engine functions take the config as an optional last argument defaulting to the import, so tests can set T001 without mocking modules. It lives in `src/lib/engine/` because it holds numbers (ADR 0005). Product costs stay CSV data.
3. **Source ASSUMPTION for the rental-fee Fact.** Certainty "assumed" maps to source `ASSUMPTION`. The product spec's KPI table lists SYNTHETIC_TEAM for Cost of unused allocation. A rental fee is an assumed parameter, not team-generated data rows, so ASSUMPTION is the accurate source. The spec is not edited; the deviation and its reason are recorded in ADR 0016 (task 1.2). Confidence reads "Assumed".
4. **Provenance per KPI.**

| KPI | Methods | Source | Assumption IDs |
|---|---|---|---|
| Avoided purchase cost | ESTIMATED | SYNTHETIC | A002 (confidence from A002) |
| Garment value kept in use (Dec) | ILLUSTRATIVE | SYNTHETIC | none |
| Cost of unused allocation (Dec, per week) | ESTIMATED | ASSUMPTION | T001 |
| Garment utilization (Dec) | CALCULATED | SYNTHETIC | none |

   The A002 tint on purchase-cost KPIs comes from their uncertain methods. Purchase cost gets no T ID because it is pack data. The A002 ID is attached only where repairs drive the figure.
5. **Team assumption in Show math.** One engine helper turns a `TeamAssumption` into Fact `inputs` (id and name, value or "not set", unit) plus a `note: true` input for its note. `assumptionIds` carries "T001". No type change is needed in `ShowMathPopover`.
6. **Needs-input card.** `StatCard` gets an optional `needsInput` hint prop; when set, it replaces the value row with "Needs input" in the sans font, muted, and shows the hint under it. Same box, so no layout jump. `FactStatCard` sets it when `fact.value === null` and builds the hint from the unset assumption.
7. **Percent as 0 to 100.** Utilization is stored as 83.5 with unit "%", formatted by `formatNumber`, matching "per 100 wearers" which is also not a fraction.
8. **Product references are checked twice.** The pipeline fails the build when a `product_id` in repairs or service_activity is missing from products, naming the IDs and the source sheet (a referential check, unlike the report-only repairs cross-check). The money Facts keep a runtime throw for an unknown `product_id` as a backstop for data that bypassed the build, like `replacementsPostponed` does for a missing A002. A silent skip would understate cost.
9. **Placement.** A new `valueFacts(data, scope, team)` returns the four Facts; `operationalFacts` is unchanged. The dashboard renders them in a second section under the operational cards.
10. **Same snapshot rule as change 1.** Unused pieces, utilization and value kept in use use the latest month of the period (December), labelled "(Dec)". Avoided purchase cost is the full year.

## Risks / Trade-offs

- [Widening `Fact.value` touches existing code] → the compiler finds each use; existing tests keep their assertions.
- [The weekly cost beside a December snapshot may be read as an annual figure] → label says "per week", Show math states the basis; annualising is a later decision.
- [Independent recomputation could disagree with the engine] → tasks flag it for investigation; numbers are never adjusted to match.
- [T001 stays unset in the demo] → the card shows "Needs input" by design; filling it is a one-line config change with no ADR edit.
