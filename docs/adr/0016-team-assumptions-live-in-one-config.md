# 0016. Team assumptions live in one config

- Status: accepted
- Date: 2026-11-07
- Supersedes: none

## Context

Some inputs the product needs are not in the pack and only the team or Lindström can supply them: a rental fee now, and later the meaning of `washing_pct`, a CO2-per-tree factor and route kilometres. Without a rule, each would be hard-coded where it is first used, shown as a made-up number, or kept in client state. ADR 0004 requires every displayed value to carry provenance and ADR 0005 keeps numbers in the engine; this ADR applies both to values nobody has supplied yet. The pack's own assumptions (A001 to A008) are CSV data and are unaffected.

## Decision

- Team-supplied unknowns live in one typed plain-data file, `src/lib/engine/assumptions-config.ts`, imported by the pure engine. They are not in Zustand or any client state and are not editable at runtime.
- Each entry has an `id` with a T prefix (T001 onwards, distinct from the pack's A-prefixed IDs), a `value`, a `unit`, a `note` and the certainty "assumed".
- A Fact that uses an entry has source `ASSUMPTION`, so the existing certainty tint renders it amber with no change to the provenance rules. Its Show math lists the entry's id, value, unit and note.
- An entry without a supplied value has `value: null`. No placeholder number stands in for it. A Fact that needs an unset entry has a null value, and the UI shows "Needs input" instead of 0 or NaN.
- Any future unknown of this kind (washing_pct, CO2-per-tree, route kilometres) is added as a new entry under this rule. Setting a value later is an edit to the config and does not touch this ADR.
- Pack data stays data. A product purchase cost comes from the products sheet as SYNTHETIC data and gets no T ID.

### Deviation from the product spec

`docs/product-spec.md` lists "ESTIMATED, SYNTHETIC_TEAM" for Cost of unused allocation. This change uses source `ASSUMPTION`. A rental fee is an assumed parameter, not team-generated data rows, so `ASSUMPTION` is the accurate source; `SYNTHETIC_TEAM` describes rows of data the team generated. The product spec is not edited (it is the vision, ADR 0007); the built behaviour is recorded here and in `openspec/specs/`.

## Consequences

Unknowns are visible in one place and always flagged as assumed, and a missing value can never leak into a total as zero. Changing a value needs a code change and a deploy, which is acceptable for a prototype with one rental-fee entry; a runtime editor would need its own ADR and a store. `Fact.value` may be null, so every consumer must handle it.
