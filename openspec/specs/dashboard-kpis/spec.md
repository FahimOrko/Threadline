# dashboard-kpis Specification

## Purpose
Shows engine Facts on the dashboard as cards, each with its provenance and a way to open the math.

## Requirements

### Requirement: Replacements postponed card
The dashboard SHALL show one card for Replacements postponed for NorthStar Foods Group, full year 2025, with its value, unit, provenance chip and Show math.

#### Scenario: Card content
- **WHEN** the user opens the dashboard
- **THEN** the card shows 15 233, the ESTIMATED and SYNTHETIC chip in the uncertain tint, and a Show math control

#### Scenario: Show math content
- **WHEN** the user opens Show math
- **THEN** it lists the formula, the repair count input, assumption A002 and the baseline as not applicable

### Requirement: Range not yet modelled
Show math SHALL display the base value and SHALL mark low and high as not yet modelled until sensitivity exists.

#### Scenario: Range
- **WHEN** Show math is open
- **THEN** low and high read "not yet modelled" and base shows the value

### Requirement: Data loaded on the server
The dashboard SHALL load generated data in a server component and pass it to the engine; the browser SHALL NOT fetch the data files.

#### Scenario: No client fetch
- **WHEN** the dashboard renders
- **THEN** no request for the generated JSON is made from the browser
