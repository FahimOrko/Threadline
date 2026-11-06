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
A ShowMath panel SHALL list the formula, inputs, assumption IDs, baseline and low/base/high range of a value, and SHALL link them to the value with a thread line in the accent colour.

#### Scenario: Open the math
- **WHEN** the user activates a value's "show math" control
- **THEN** the panel expands showing formula, inputs, assumption IDs, baseline and range

#### Scenario: Keyboard access
- **WHEN** the user focuses the control and presses Enter
- **THEN** the panel toggles and the control reports its expanded state to assistive technology

### Requirement: Fact stat card
A FactStatCard SHALL render an engine Fact as a StatCard with its ProvenanceChip and ShowMath, formatting the value and unit for display and taking all provenance from the Fact.

#### Scenario: Fact rendered
- **WHEN** a Fact is passed to FactStatCard
- **THEN** the card shows its label, formatted value and unit, a chip with the Fact's methods and source, and Show math with its formula, inputs and assumption IDs

#### Scenario: Missing range
- **WHEN** the Fact has no low or high value
- **THEN** Show math shows them as "not yet modelled"

#### Scenario: In the gallery
- **WHEN** the user opens `/design`
- **THEN** FactStatCard appears with a fixture Fact labelled as sample data
