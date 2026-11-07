# 0027. Grouped figure panels, linked site counts and the scenario strip on two pages

- Status: accepted
- Date: 2026-11-07
- Supersedes: 0026 in part (the strip is not on every dashboard page); 0025 where it describes one-figure Overview tiles.

## Context

After the second review the pages read as rows of one-figure cards: related figures sat apart, some cards repeated a value a chart already showed, a count of sites ("2 sites with Critical dormant garments") did not say which sites, and a scenario strip sat over pages it does not affect.

## Decision

- A page shows grouped panels: one hero figure, one small visual (ring, part-of-whole bar, bullet or mini chart) and related figures as inline stats. Every figure keeps its chip and Show math. Labels on screen are short; the Fact's full label is in Show math. A Fact that a chart already shows is not also a card.
- A figure that counts sites names them. The list comes from the engine's observations (the flagged sites of the same signal as the count), not from component code, and each name links to its site page with the page's params. The Overview shows up to three, then "+N more" to the Signals page anchored at that signal; Signals lists all.
- The scenario strip is shown only on Overview and Environmental footprint, the pages whose figures depend on the baseline and estimate. Its note always reads "These choices change the savings figures on this page."
- The site page opens with a "Back to sites" button that keeps the params, a summary of name, type, laundry and four figures, then groups by meaning: Garments and use, Costs and service, Repairs.

## Consequences

`SectionCard` is replaced by `FigurePanel`; the five-effect motion list is unchanged (count-up now runs on the figures the panels mark, spotlight wraps the Overview panels). Ring and part-of-whole bar are new plain-markup charts, with their text alternative on the element. No engine computation was added.
