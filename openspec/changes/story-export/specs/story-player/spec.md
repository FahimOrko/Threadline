# Spec Delta

## MODIFIED Requirements

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
- **THEN** only the first valid distinct values up to two are used and a notice names the rejected value

#### Scenario: Picks survive other selections
- **WHEN** the reader changes the customer, baseline or sensitivity from the header
- **THEN** the address keeps `?priorities=` together with every other parameter

#### Scenario: Picks survive view switching
- **WHEN** the reader switches view from the header and back to Story
- **THEN** the picks are still in the address

### Requirement: Data-readiness chapter
The story SHALL include a "Data readiness" chapter after the methodology chapter. It SHALL always show a short plain summary, any reported cross-check finding (such as out-of-order scans) with its count and provenance, and the known data gaps. It SHALL NOT list the open questions for Lindström; those are in the export. Each cross-check finding SHALL carry a plain-language label (for example "Scans out of order"), never a raw check id; the raw id stays in its Show math. Per-source rows of invalid or unmapped rows and the team assumptions that still read "Needs input" SHALL be in a collapsible. When no source has invalid or unmapped rows, the summary SHALL say so in one line; otherwise it SHALL name the sources with a count.

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

#### Scenario: Plain finding label
- **WHEN** the out-of-order scans finding renders
- **THEN** its label is plain language, its Fact id is unchanged and the raw check id is in Show math

#### Scenario: No open questions
- **WHEN** the chapter renders
- **THEN** it holds no open-questions section


### Requirement: Methodology chapter
The story SHALL end with a "How we calculated this" chapter. A short summary SHALL always be visible: it names the data sources, states that the CO2e saved figure rests on an illustrative comparison laundry, frames the estimate range as the team's declared spread and not a measured range, and states that values are rounded only for display. The chapter SHALL NOT repeat the net CO2e saved cards. The team assumptions (each with its T id, a plain-language label, and its value and unit or "Needs input" when unset) and the data pack assumptions SHALL be in collapsibles; the data pack table SHALL keep the pack's own text and carry one plain note saying the wording is the pack's own and what its "starting" or "default" comparison means.

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

## ADDED Requirements

### Requirement: Readable layout
The story SHALL render every chapter's text, summaries and figures fully visible as one continuous document, with no tabs, steppers, carousels or hover-only content. Only detail tables MAY sit in collapsibles, closed by default. Show math triggers and "i" explainers MAY be popovers, but no chapter text SHALL depend on opening them.

#### Scenario: All content present on load
- **WHEN** the Story page loads with no interaction
- **THEN** all chapters, their sentences and summaries are in the document and only detail tables are collapsed

### Requirement: Report header controls
The Story page SHALL open with one header area holding the title, the customer and period, "Play the review", "Export" and the two-priority picker, laid out as one block. "Play the review" SHALL link to `/story/game` keeping every query param, including unknown ones; "Export" SHALL scroll to the export card.

#### Scenario: Controls together
- **WHEN** the Story page loads
- **THEN** Play the review, Export and the priority choices are inside the header area and none sits in the cover chapter

#### Scenario: Params preserved
- **WHEN** `/story` is opened with `?customer=CUST002&baseline=B_HOME&view=customer&x=1`
- **THEN** "Play the review" opens `/story/game` with the same four params unchanged

### Requirement: Report header surface
The Story page's header block SHALL use the dashboard scenario strip's surface: the same accent-tinted border and background. The six priority chips SHALL be a segmented-style group like the strip's toggles, every option visible, the picked ones filled and still carrying "(selected)" for screen readers.

#### Scenario: Same surface
- **WHEN** the Story page and the Overview page are shown in the same theme
- **THEN** the header block and the scenario strip use the same border and background treatment

#### Scenario: Segmented chips
- **WHEN** the Story page is shown
- **THEN** the six priority chips sit in one segmented group with the picked chips filled

#### Scenario: Behaviour unchanged
- **WHEN** the reader activates a priority chip or "Play the review"
- **THEN** each opens the same address as before this change

## REMOVED Requirements

### Requirement: Print-safe layout
**Reason**: Reworded without the print route (ADR 0030).
**Migration**: See the added requirement "Readable layout".

### Requirement: Play the review link
**Reason**: Reworded for the export control; replaced by a requirement of the same behavior without the print route (ADR 0030).
**Migration**: See the added requirement named for the report header.

### Requirement: Story header
**Reason**: Reworded for the export control; replaced by a requirement of the same behavior without the print route (ADR 0030).
**Migration**: See the added requirement named for the report header.

### Requirement: Report header matches the scenario strip
**Reason**: Reworded for the export control; replaced by a requirement of the same behavior without the print route (ADR 0030).
**Migration**: See the added requirement named for the report header.

### Requirement: Print route for the story
**Reason**: The PDF by browser print is replaced by the data export (ADR 0030).
**Migration**: Use the export card (see story-export).

### Requirement: Export PDF action
**Reason**: The PDF by browser print is replaced by the data export (ADR 0030).
**Migration**: Use the export card (see story-export).

### Requirement: Print layout
**Reason**: The PDF by browser print is replaced by the data export (ADR 0030).
**Migration**: Use the export card (see story-export).

### Requirement: Show math printed inline
**Reason**: The PDF by browser print is replaced by the data export (ADR 0030).
**Migration**: Use the export card (see story-export).

### Requirement: Cover block
**Reason**: The PDF by browser print is replaced by the data export (ADR 0030).
**Migration**: Use the export card (see story-export).

