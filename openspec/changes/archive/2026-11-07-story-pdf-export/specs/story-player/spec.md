## ADDED Requirements

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
