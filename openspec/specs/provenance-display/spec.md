# provenance-display Specification

## Purpose
Defines how any displayed value presents its method, source and formula so a reader can judge how certain it is and open the math behind it.

## Requirements

### Requirement: Provenance chip
A ProvenanceChip SHALL show the value's method and source as text plus a glyph, and SHALL NOT rely on colour alone.

#### Scenario: Chip content
- **WHEN** a value has method CALCULATED and source SYNTHETIC
- **THEN** the chip shows both labels with their glyphs

### Requirement: Certainty tint
The chip SHALL use a neutral tint for MEASURED, CALCULATED and ALLOCATED and the pale-amber tint for ESTIMATED, ILLUSTRATIVE, MANUAL_EDIT and for the ASSUMPTION source.

#### Scenario: Estimated value
- **WHEN** a value has method ESTIMATED
- **THEN** its chip uses the amber tint

#### Scenario: Chip contrast in both themes
- **WHEN** a neutral chip and an amber chip are shown in the dark theme and in the light theme
- **THEN** the label text of each meets WCAG AA contrast (4.5:1) against its chip background and the chip edge is distinguishable from the page background

### Requirement: Least certain method wins
When a value has several methods, the chip SHALL take the tint of its least certain method.

#### Scenario: Allocated and estimated
- **WHEN** a value has methods ALLOCATED and ESTIMATED
- **THEN** its chip shows both labels and uses the amber tint

### Requirement: Show math panel
A Show math control SHALL open a popover that lists the formula, inputs, assumption IDs, baseline and low/base/high range of a value, and SHALL link them to the value with a thread line in the accent colour. Show math SHALL always open as a popover, on cards and in table headers alike, and SHALL NOT change the size or layout of what it sits in.

#### Scenario: Open the math
- **WHEN** the user activates a value's "show math" control
- **THEN** a popover opens showing formula, inputs, assumption IDs, baseline and range, and the card or table around it keeps its size

#### Scenario: Keyboard access
- **WHEN** the user focuses the control and presses Enter
- **THEN** the popover opens, the control reports its expanded state to assistive technology, and Esc closes it and returns focus to the control

#### Scenario: Popover layout
- **WHEN** a Show math popover is open
- **THEN** it is about 30rem wide but never wider than the viewport, the formula spans the full width in the mono face, rows use a one-third label and two-thirds value grid, and long explanatory text appears as a note across the full width below the rows in the sans face

#### Scenario: Mono only for numbers
- **WHEN** a row value is a name or plain words such as "NorthStar Foods Group" or "not yet modelled"
- **THEN** it is shown in the sans face, while numbers, formulas and IDs stay mono

#### Scenario: Stays on screen
- **WHEN** the popover opens from a trigger near the edge of a narrow window
- **THEN** it stays fully inside the viewport

#### Scenario: Outside click and one at a time
- **WHEN** a popover is open and the user clicks outside it or opens another Show math
- **THEN** it closes, so only one is open at a time

### Requirement: Fact stat card
A FactStatCard SHALL render an engine Fact as a StatCard with its ProvenanceChip and ShowMath, formatting the value and unit for display and taking all provenance from the Fact. A Fact whose value is null SHALL render the StatCard "Needs input" state with the chip and Show math kept.

#### Scenario: Fact rendered
- **WHEN** a Fact is passed to FactStatCard
- **THEN** the card shows its label, formatted value and unit, a chip with the Fact's methods and source, and Show math with its formula, inputs and assumption IDs

#### Scenario: Missing range
- **WHEN** the Fact has no low or high value
- **THEN** Show math shows them as "not yet modelled"

#### Scenario: In the gallery
- **WHEN** the user opens `/design`
- **THEN** FactStatCard appears with a fixture Fact labelled as sample data

#### Scenario: Fact without a value
- **WHEN** a Fact with a null value is passed to FactStatCard
- **THEN** the card shows "Needs input" instead of a number, and the chip and Show math are still present

### Requirement: Compact provenance chip
ProvenanceChip SHALL offer a compact variant that shows only the glyph of each method in the certainty tint, with the full method and source text available in a tooltip and an accessible label. The compact variant SHALL be reachable and operable by keyboard, SHALL show its tooltip on focus as well as on hover, and SHALL NOT rely on colour alone: the glyph and the accessible label carry the method.

#### Scenario: Compact content
- **WHEN** a value has method CALCULATED and source SYNTHETIC and the compact chip is shown
- **THEN** it shows the CALCULATED glyph in the neutral tint, shows no visible method or source text, and has an accessible name containing "Calculated" and "Synthetic"

#### Scenario: Tooltip on focus
- **WHEN** the user tabs to the compact chip
- **THEN** it takes focus with a visible focus ring and a tooltip shows the full method and source text

#### Scenario: Tooltip on hover
- **WHEN** the user hovers the compact chip
- **THEN** the same tooltip shows

#### Scenario: Several methods
- **WHEN** a value has methods ALLOCATED and ESTIMATED and the compact chip is shown
- **THEN** it shows both glyphs, uses the amber tint, and its accessible name lists both methods and the source

#### Scenario: Same tone as the full chip
- **WHEN** the full chip and the compact chip are shown for the same value
- **THEN** both use the same tint and, in both themes, the glyph meets the same contrast as the full chip's text

#### Scenario: In the gallery
- **WHEN** the user opens `/design`
- **THEN** the compact chip appears next to the full chip, including the stress case with the longest method combination, and is listed in `docs/design.md`
