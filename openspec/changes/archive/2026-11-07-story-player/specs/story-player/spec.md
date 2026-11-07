# Spec Delta

## Purpose
Presents one customer's year as a deterministic, data-bound story with personalised emphasis, a methodology note and a data-readiness note, reproducible from the address and ready to print.

## ADDED Requirements

### Requirement: Deterministic story from engine outputs
The Story page SHALL show the selected customer's story for the fixed period using fixed template text. Every number in the text SHALL come from an engine Fact, SHALL carry provenance (method, source and Show math), and SHALL be rounded only for display. The page SHALL NOT call an AI service.

#### Scenario: Numbers come from Facts
- **WHEN** the Story page is opened for a customer
- **THEN** each figure in the story matches the same Fact on the dashboard for that customer, baseline and sensitivity, and offers Show math

#### Scenario: Same address, same story
- **WHEN** two people open the same Story address
- **THEN** they see the same chapters, order and numbers

### Requirement: Selection read from the address
The Story page SHALL read `?customer=`, `?baseline=` and `?sensitivity=` with the same resolvers, defaults and fallback notices as the dashboard, and SHALL state the customer, baseline, sensitivity and period in the cover chapter.

#### Scenario: Unknown value
- **WHEN** the address holds `?baseline=NOPE`
- **THEN** local laundry is used, a notice names "NOPE", and the story still renders

### Requirement: Two-priority personalization
The reader SHALL be able to pick two priorities from water, cost, emissions, circularity, service and hygiene. The picks SHALL be kept in the address as `?priorities=<a>,<b>`, in pick order. The story SHALL list the chapters of the picked priorities first, in pick order, mark each picked chapter with a "Your priority" text label (a chapter that serves both picks shows both labels and no further reordering happens), and SHALL keep the other chapters after them in the default order. The cover chapter SHALL stay first and the methodology and data-readiness chapters SHALL stay last.

#### Scenario: Two picks reorder
- **WHEN** the address holds `?priorities=cost,hygiene`
- **THEN** the euros chapter and the risk chapter follow the cover, in that order, each marked as a priority, and the remaining chapters follow in default order

#### Scenario: Water and emissions
- **WHEN** the address holds `?priorities=water,emissions`
- **THEN** the Water and carbon chapter follows the cover, carries two priority labels, and the other chapters follow in default order

#### Scenario: Hygiene
- **WHEN** the address holds `?priorities=hygiene`
- **THEN** the risk chapter (garment signals) is placed first after the cover and labelled as a priority

#### Scenario: No picks
- **WHEN** the address has no `?priorities=`
- **THEN** the chapters appear in the default order and the picker asks for two priorities

#### Scenario: Invalid picks
- **WHEN** the address holds an unknown priority, a duplicate, or more than two values
- **THEN** only the first valid distinct values up to two are used and a notice names the rejected value; the notice is marked as screen-only so a print layout can hide it

#### Scenario: Picks survive other selections
- **WHEN** the reader changes the customer, baseline or sensitivity from the header
- **THEN** the address keeps `?priorities=` together with every other parameter

#### Scenario: Picks survive view switching
- **WHEN** the reader switches view from the header and back to Story
- **THEN** the picks are still in the address

### Requirement: Methodology chapter
The story SHALL end with a "How we calculated this" chapter that names the data sources, lists each team assumption (T-prefixed) as set with its value and unit or as unset ("Needs input"), states that the CO2e saved figure rests on an illustrative local laundry baseline, frames the sensitivity band as the declared T002 spread and not a measured range, and states that values are rounded only for display.

#### Scenario: Unset assumption
- **WHEN** T001 has no value
- **THEN** the chapter lists T001 as "Needs input" and shows no number for it

#### Scenario: Sensitivity framing
- **WHEN** high sensitivity is selected
- **THEN** the chapter says the range is the team's declared ±T002 spread over illustrative baseline factors and names the level shown

### Requirement: Data-readiness chapter
The story SHALL include a "Data readiness" chapter after the methodology chapter showing, from the data-quality report, the number of rows read and the number of unmapped or invalid rows per source and any reported cross-check finding (such as out-of-order scans), the team assumptions that still read "Needs input", the known data gaps, and the open questions for Lindström: what `washing_pct` measures, a typical weekly rental fee per piece, whether a labelled CO2-per-tree illustration is acceptable, average route kilometres, and whether the illustrative local laundry baseline process factor should be reviewed.

#### Scenario: Counts from the report
- **WHEN** the report lists 1,107 out-of-order scans
- **THEN** the chapter shows that count with provenance and describes how it is handled, without computing the count in the page

#### Scenario: Report missing
- **WHEN** `data-quality.json` is missing or unreadable
- **THEN** the build fails with a message naming the file, and no page renders an empty readiness chapter

#### Scenario: Nothing unmapped
- **WHEN** a source has no invalid rows
- **THEN** the chapter states that none were found rather than omitting the source

### Requirement: Needs input is never a number
Wherever a Fact has a null value because a team assumption is unset, the story text SHALL read "Needs input" and SHALL NOT show 0, a blank or a placeholder number.

#### Scenario: Cost of unused allocation
- **WHEN** T001 is unset
- **THEN** the euros chapter reads "Needs input" for the cost of unused allocation and keeps its provenance and Show math

### Requirement: Print-safe layout
The story SHALL render every chapter fully visible as one continuous document, with no tabs, accordions, steppers, carousels, hover-only or click-only content. Show math triggers MAY stay popovers, but the chapter text SHALL NOT depend on opening them.

#### Scenario: All content present on load
- **WHEN** the page loads with no interaction
- **THEN** all chapters and their text are in the document
