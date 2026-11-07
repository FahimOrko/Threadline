# story-player Specification

## Purpose
Presents one customer's year as a deterministic, data-bound story with personalised emphasis, a methodology note and a data-readiness note, reproducible from the address and ready to print.

## Requirements

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

### Requirement: Print route for the story
The system SHALL provide a print route that renders the same story as the Story page, built from the same chapter builder, template text and Facts, with no separate copy of chapter logic or text. It SHALL read `?customer=`, `?baseline=`, `?sensitivity=` and `?priorities=` with the same resolvers, defaults and fallback notices as the Story page.

#### Scenario: Same story as the screen
- **WHEN** the print route and the Story page are opened with identical params
- **THEN** they show the same chapters in the same order with the same text and numbers

#### Scenario: Params honored
- **WHEN** the print route is opened with `?customer=X&baseline=Y&sensitivity=high&priorities=cost,hygiene`
- **THEN** the document is for customer X against baseline Y at high sensitivity, and the cost and risk chapters follow the cover in that order

#### Scenario: Unknown value
- **WHEN** the print route is opened with `?baseline=NOPE`
- **THEN** local laundry is used, a notice names "NOPE", and the document still renders

### Requirement: Export PDF action
The Story page SHALL offer an "Export PDF" action that opens the print route with the current customer, baseline, sensitivity and priorities. The print route SHALL offer a "Print / Save as PDF" control that opens the browser print dialog; the document SHALL NOT print automatically on load.

#### Scenario: Params carried over
- **WHEN** the reader has `?customer=X&sensitivity=low&priorities=water,cost` on the Story page and chooses Export PDF
- **THEN** the print route opens with those same values

#### Scenario: No priorities picked
- **WHEN** the Story page has no `?priorities=` and the reader chooses Export PDF
- **THEN** the print route opens without `?priorities=` and shows the default chapter order

### Requirement: Print layout
The print route SHALL lay out on A4, use the light theme regardless of the app theme, and show no app shell, header pickers, view links, AI sidebar or priority picker. Each chapter SHALL start on a new page. A card, table row or observation SHALL NOT be split across pages where avoidable. Elements marked `data-print="hide"` SHALL NOT print. Chapter text, the methodology chapter and the data-readiness chapter SHALL always print in full.

#### Scenario: Dark app theme
- **WHEN** the reader's app theme is dark and the print route is printed
- **THEN** the output uses the light theme

#### Scenario: Dropped priorities notice
- **WHEN** the address holds an invalid priority
- **THEN** the screen shows the notice and the printed output does not

#### Scenario: Chapter pages
- **WHEN** the document is printed
- **THEN** each chapter begins at the top of a page and its text is fully present

### Requirement: Show math printed inline
On the print route every Show math SHALL be printed expanded in place, next to its figure, showing formula, inputs, assumption IDs, baseline and range, with no popover or click needed.

#### Scenario: Figure with Show math
- **WHEN** a chapter containing a figure with Show math is printed
- **THEN** the formula, inputs, assumption IDs, baseline and range appear under that figure

#### Scenario: Needs input
- **WHEN** a Fact has a null value because a team assumption is unset
- **THEN** the print shows "Needs input" and its expanded Show math, never a number

### Requirement: Cover block
The print route SHALL open with a cover block stating the customer name, the chosen priorities in pick order (or that none were chosen), the baseline, the sensitivity level, the period, and the generation date.

#### Scenario: Two priorities
- **WHEN** the print route is opened with `?priorities=cost,hygiene`
- **THEN** the cover lists Cost and Hygiene in that order

#### Scenario: Generation date
- **WHEN** the document is generated
- **THEN** the cover shows the date it was generated, labelled as the generation date and not as a data date

### Requirement: Play the review link
The Story cover (not the print route) SHALL offer a "Play the review" link to `/story/game` that preserves every query param, including unknown ones.

#### Scenario: Params preserved
- **WHEN** `/story` is opened with `?customer=CUST002&baseline=B_HOME&view=customer&x=1`
- **THEN** "Play the review" opens `/story/game` with the same four params unchanged

#### Scenario: Not printed
- **WHEN** the print route is rendered
- **THEN** no "Play the review" link is shown
