# 0017. Baseline and sensitivity live in the URL; the spread is a declared modelling choice

- Status: accepted
- Date: 2026-11-07
- Supersedes: none

## Context

Slice 4 adds a comparison baseline (local laundry, home washing, in-house) and a sensitivity level (low, base, high). The engine already takes the baseline as an argument. The data pack has no low or high factors (`baselines.csv` has one factor set per baseline). ADR 0014 put the customer in the URL; ADR 0016 keeps values only the team or Lindström can supply unset until they are supplied.

## Decision

- The baseline is `?baseline=<baseline_id>` and the sensitivity is `?sensitivity=low|base|high`. Both follow ADR 0014: the server page awaits `searchParams` and resolves them with `resolveBaseline` and `resolveSensitivity` (`src/lib/selection.ts`), the header reads the same params through the same functions, unknown values fall back (local laundry, base) with a visible notice, and view links keep every param.
- Sensitivity is one team assumption, T002 in `assumptions-config.ts`, set to 0.2. Low scales each baseline factor by 1 - T002 and high by 1 + T002. Laundry factors are pack data and are not scaled. Only the six savings Facts (water, energy, net CO2e saved and their percentages) carry a range; service footprint, delivery emissions, delivery share and all other Facts keep `low` and `high` null.
- A Fact's value is the range entry of the selected level. Off base, the savings Facts have source `ASSUMPTION` and list T002 (ADR 0016's certainty tint); at base they keep SYNTHETIC and A001, and Show math still lists T002 for the range.

### Why T002 is set while ADR 0016 keeps unknowns unset

ADR 0016 is for unknowns: a value only the team or Lindström can supply and nobody has, such as a rental fee. A made-up number there would pass as data, so it stays `null` and shows "Needs input". T002 is not an unknown. It is a modelling choice the team has declared and stated: the width of the sensitivity band. No one else holds the right answer, so waiting for Lindström would only leave the selector empty. It is set, labelled assumed, and shown in Show math so a reader can see and challenge it. Changing it is an edit to the config.

## Consequences

Links with baseline and sensitivity are shareable and the data stays on the server. The ±20 % band is one spread for water, energy and CO2e and is not physically differentiated. If Lindström later supplies real low and high factors, a new ADR supersedes the spread. Story and Impact World ignore the params until they need them.
