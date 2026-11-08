# Spec Delta

## ADDED Requirements

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

## MODIFIED Requirements

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

### Requirement: Play the review link
The Story header (not the print route) SHALL offer a "Play the review" link to `/story/game` that preserves every query param, including unknown ones.

#### Scenario: Params preserved
- **WHEN** `/story` is opened with `?customer=CUST002&baseline=B_HOME&view=customer&x=1`
- **THEN** "Play the review" opens `/story/game` with the same four params unchanged

#### Scenario: Not printed
- **WHEN** the print route is rendered
- **THEN** no "Play the review" link is shown
