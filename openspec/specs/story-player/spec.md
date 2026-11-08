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
The story SHALL end with a "How we calculated this" chapter. A short summary SHALL always be visible: it names the data sources, states that the CO2e saved figure rests on an illustrative comparison laundry, frames the estimate range as the team's declared spread and not a measured range, and states that values are rounded only for display. The chapter SHALL NOT repeat the net CO2e saved cards. The team assumptions (each with its T id, a plain-language label, and its value and unit or "Needs input" when unset) and the data pack assumptions SHALL be in collapsibles.

#### Scenario: Unset assumption
- **WHEN** T001 has no value
- **THEN** the team-assumptions table lists T001 with its plain label as "Needs input" and shows no number for it

#### Scenario: Sensitivity framing
- **WHEN** high sensitivity is selected
- **THEN** the visible summary says the range is the team's declared spread over illustrative comparison factors and names the level shown

#### Scenario: No duplicate cards
- **WHEN** the methodology chapter renders
- **THEN** it contains no CO2e saved or CO2e saved percent card

#### Scenario: Detail in collapsibles
- **WHEN** the page loads with no interaction
- **THEN** the headings and summary are visible and the two assumption tables are inside collapsed sections

### Requirement: Data-readiness chapter
The story SHALL include a "Data readiness" chapter after the methodology chapter. It SHALL always show a short plain summary, any reported cross-check finding (such as out-of-order scans) with its count and provenance, the known data gaps and the open questions for Lindström: what `washing_pct` measures, a typical weekly rental fee per piece, whether a labelled CO2-per-tree illustration is acceptable, average route kilometres, and whether the illustrative comparison laundry's process factor should be reviewed. Per-source rows of invalid or unmapped rows and the team assumptions that still read "Needs input" SHALL be in a collapsible. When no source has invalid or unmapped rows, the summary SHALL say so in one line; otherwise it SHALL name the sources with a count.

#### Scenario: Counts from the report
- **WHEN** the report lists 1,107 out-of-order scans
- **THEN** the chapter shows that count with provenance and describes how it is handled, without computing the count in the page

#### Scenario: Report missing
- **WHEN** `data-quality.json` is missing or unreadable
- **THEN** the build fails with a message naming the file, and no page renders an empty readiness chapter

#### Scenario: Nothing unmapped
- **WHEN** no source has invalid or unmapped rows
- **THEN** the chapter shows one line saying none were found and does not list a "None found" row per source

#### Scenario: Some unmapped rows
- **WHEN** one source has invalid rows
- **THEN** the summary names that source with its count, and its row, with chip and Show math, is in the collapsible

### Requirement: Needs input is never a number
Wherever a Fact has a null value because a team assumption is unset, a figure SHALL read "Needs input" with a plain hint and SHALL NOT show 0, a blank or a placeholder number. A chapter sentence whose figure can be unset SHALL carry a separate missing-case sentence and SHALL NOT contain "Needs input" mid-sentence, following the dashboard's rule.

#### Scenario: Cost of unused allocation
- **WHEN** T001 is unset
- **THEN** the euros chapter reads "The cost of unused garments can be shown once Lindström provides a rental fee." in its text, and the figure reads "Needs input" with its provenance and Show math

#### Scenario: Any figure unset
- **WHEN** any single Fact in a chapter line is null
- **THEN** no chapter line contains "Needs input"

### Requirement: Print-safe layout
The story SHALL render every chapter's text, summaries and figures fully visible as one continuous document, with no tabs, steppers, carousels or hover-only content. Only detail tables MAY sit in collapsibles on the Story page, closed by default; the print route SHALL render them expanded. Show math triggers MAY stay popovers, and the "i" explainers MAY be popovers, but no chapter text SHALL depend on opening them.

#### Scenario: All content present on load
- **WHEN** the Story page loads with no interaction
- **THEN** all chapters, their sentences and summaries are in the document and only detail tables are collapsed

#### Scenario: Collapsibles print open
- **WHEN** the print route renders
- **THEN** every collapsible is expanded and its table is in the document

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
The Story header (not the print route) SHALL offer a "Play the review" link to `/story/game` that preserves every query param, including unknown ones.

#### Scenario: Params preserved
- **WHEN** `/story` is opened with `?customer=CUST002&baseline=B_HOME&view=customer&x=1`
- **THEN** "Play the review" opens `/story/game` with the same four params unchanged

#### Scenario: Not printed
- **WHEN** the print route is rendered
- **THEN** no "Play the review" link is shown

### Requirement: Chapter structure follows the dashboard
Each chapter after the cover SHALL show one hero figure, at most one chart reused from the dashboard, and two to three supporting figures. Every figure SHALL keep its provenance chip and Show math and, where its meaning is not obvious, an "i" explainer from the registry. The chart SHALL be drawn from the same engine outputs the dashboard uses, and the story SHALL NOT compute a number for it.

#### Scenario: Water and carbon chapter
- **WHEN** the Water and carbon chapter renders
- **THEN** it shows one hero, the net CO2e comparison chart as on the dashboard, and two or three supporting figures, each with chip, Show math and an "i" where not obvious

#### Scenario: Chapter without a chart
- **WHEN** the Your year in numbers or Where we see risk chapter renders
- **THEN** it shows a hero and supporting figures, and the risk chapter keeps its observation cards, with no chart

#### Scenario: Data the engine does not expose
- **WHEN** a chapter has no engine series for its hero
- **THEN** it shows no chart for that hero rather than computing one in the page

### Requirement: Story header
The Story page SHALL open with one header area holding the title, the customer and period, "Play the review", "Export PDF" and the two-priority picker, laid out as one block. All three functions SHALL keep their behaviour and query params.

#### Scenario: Controls together
- **WHEN** the Story page loads
- **THEN** Play the review, Export PDF and the priority choices are inside the header area and none sits in the cover chapter

#### Scenario: Print route
- **WHEN** the print route renders
- **THEN** the header controls are not shown

### Requirement: Text and cards share one layout
Chapter text, figures, charts and tables SHALL share one container width and left edge, so the page reads as one layout at 1230px and 1280px wide, in light and dark.

#### Scenario: Aligned edges
- **WHEN** a chapter renders at 1280px
- **THEN** its heading, intro sentences and figure panels start at the same left edge and end within the same container

### Requirement: Story text uses plain wording
No story text (chapter titles, lines, captions, hints, explainers, summaries) SHALL contain a word from the dashboard's banned list. An assumption id (T followed by digits) MAY appear only in a table cell of the team-assumptions table.

#### Scenario: Risk intro
- **WHEN** the risk chapter intro renders
- **THEN** it does not contain "Critical" or "dormant" and describes garments unused for a long time in plain words

#### Scenario: Comparison wording
- **WHEN** any story sentence names the comparison laundry
- **THEN** it says "comparison" and never "baseline"

### Requirement: Report header matches the scenario strip
The Story page's header block (customer name, period line, "Play the review", "Export PDF" and the priority picker) SHALL use the dashboard scenario strip's surface: the same accent-tinted border and background. The six priority chips SHALL be a segmented-style group like the strip's toggles, every option visible, the picked ones filled and still carrying "(selected)" for screen readers. The block SHALL keep its controls, links, wording and behaviour, and SHALL stay hidden in print.

#### Scenario: Same surface
- **WHEN** the Story page and the Overview page are shown in the same theme
- **THEN** the header block and the scenario strip use the same border and background treatment

#### Scenario: Segmented chips
- **WHEN** the Story page is shown
- **THEN** the six priority chips sit in one segmented group with the picked chips filled

#### Scenario: Behaviour unchanged
- **WHEN** the reader activates a priority chip, "Play the review" or "Export PDF"
- **THEN** each opens the same address as before this change

#### Scenario: Not printed
- **WHEN** the print route is rendered
- **THEN** no header block is shown
