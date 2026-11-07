# 0019. Story priorities live in the URL

- Status: accepted
- Date: 2026-11-07
- Supersedes: none

## Context

The Story personalises its chapter order from two priorities the reader picks. A shared link, and the later print route, must reproduce the same story. ADR 0014 and 0017 already keep the customer, baseline and sensitivity in the URL. ADR 0017 said Story ignores those params until it needs them; it now reads them (that line is not edited, ADRs are append-only).

## Decision

- The picks are `?priorities=<a>,<b>`: a comma list of up to two of water, cost, emissions, circularity, service, hygiene, in pick order. The server page awaits `searchParams` and resolves them with `resolvePriorities` (`src/lib/selection.ts`). Unknown values, duplicates and values beyond two are dropped, never an error, and a notice names them. The notice is marked screen-only so a print route can hide it. No value means no picks and the default chapter order.
- Priority to chapter map: water and emissions both feed "Water and carbon", cost feeds "What it means in euros", circularity feeds "What we kept out of the bin", service feeds "Service and reliability", hygiene feeds "Where we see risk". Picked chapters follow the cover in pick order, each marked "Your priority" in words. A chapter serving both picks (water and emissions) carries both labels and nothing else moves. Cover stays first; Methodology and Data readiness stay last.
- The picker is plain links toggling a pick (a third pick replaces the oldest), so it needs no client state and prints without scripts.
- The header selectors already copy every existing param. The view switcher rebuilt its address from the three known params, so it now also carries `priorities` when present, unvalidated (the page validates).

## Consequences

Picks are shareable and survive the print route. The map is one constant, so changing a chip's chapter is an edit. Priorities are the six chips of the product spec; the nine industry themes in `industry_priorities.csv` are not used, and there is no industry default pick. Free-text priorities and AI re-ranking would need a new ADR.
