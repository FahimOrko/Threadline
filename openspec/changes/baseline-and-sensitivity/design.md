# Design

## Context

`footprintFacts(data, scope, baseline)` already takes the baseline row; the dashboard hard-codes `DEFAULT_BASELINE_ID`. `Fact.range` exists with nulls. `?customer=` is resolved by a pure `resolveCustomer` shared by the page and the header (ADR 0014). The pack's `baselines.csv` has one factor set per baseline and no low/high columns; `assumptions.csv` has no spread either (A002 is only tagged "Sensitivity-test").

## Goals / Non-Goals

**Goals:** two URL-backed selectors, one source of truth per param, ranges on savings Facts, labels and notes correct for all three baselines.

**Non-Goals:** period picker, per-site baseline, ranges on operational, money, service or delivery Facts, Impact World, mobile.

## Decisions

1. **Resolvers mirror `resolveCustomer`.** Pure functions for baseline and sensitivity (same `{ value, rejected }` shape), called by the server page and the header. Unknown or repeated values fall back to local laundry / base with a notice. The `?baseline=` value is the pack's `baseline_id` (`B_LOCAL`, `B_HOME`, `B_INHOUSE`). Alternative: a Zustand store; rejected, the page is server-rendered (ADR 0014).
2. **Sensitivity is a spread on the baseline factors.** The pack gives no low/high factors, so T002 in `assumptions-config.ts` holds `0.2` (unit: share of factor, note: team-chosen, not from the pack). Low scales each baseline factor (water, energy, process, delivery) by 1 - s, high by 1 + s; laundry factors are pack data and stay fixed. Savings are linear in the baseline factor, so low gives the smallest saving. T002 is a declared team modelling choice, not an unknown awaiting Lindström input, so it is set (ADR 0016 keeps unknowns unset as null; this is a value the team decided and states). ADR 0017 says so and references ADR 0016 without editing it. Source label: `ASSUMPTION` with T002 in `assumptionIds` whenever the selected level is not base; at base the Fact keeps SYNTHETIC / A001 and Show math still lists T002 for the range. Alternative: spread on laundry factors too, rejected because those are measured-style pack values and the spec says the baseline is the uncertain side.
3. **Engine computes all three levels, value follows the selection.** `footprintFacts(data, scope, baseline, sensitivity)`; each savings Fact sets `range = { low, base, high }` and `value = range[sensitivity]`. Percent Facts get a range the same way. Alternative: three engine calls from the page; rejected, Show math needs all three in one Fact.
4. **Ranges only where an input is assumed.** Savings Facts (water, energy, net CO2e, and their percent) get a range. Service footprint, delivery emissions and delivery share use laundry factors only, and operational, money, percentage and replacements Facts use counts or pack rows, so they keep `low/high: null` and Show math keeps "not yet modelled" for them. A002 and A003/A004 uncertainty is not modelled here.
5. **Labels and notes derive from the baseline.** Labels already use `baselineShortName`; the dashboard description and the illustrative-factor note must stop saying "local laundry". The illustrative note applies to every baseline (all three rows say "Values illustrative"); wording is generalised, not removed.
6. **Delivery honesty under home washing.** The net CO2e saved card is already rendered from the same Fact in the saved and delivery groups. No layout change; a test asserts the delivery group still contains it with a zero baseline delivery factor and for all sensitivity levels.

## Risks / Trade-offs

- [±20 % is a team modelling choice] → confirmed by the user, labelled ASSUMPTION, shown in Show math, single edit point.
- [Single spread for water, energy and CO2e] → simple and honest, but not physically differentiated; noted in the T002 note.
- [Header selectors on every view while only the dashboard uses them] → they are kept in view links; Story and Impact ignore them for now.

## Open Questions

None. The ±20 % value and the savings-only range scope are confirmed.
