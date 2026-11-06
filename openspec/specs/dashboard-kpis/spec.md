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

### Requirement: Operational cards
The dashboard SHALL show one card each for Delivery sites, Active wearers, Garments in circulation, Repairs, Replacements postponed, Service requests and Service requests per 100 wearers (Dec) for the selected customer, full year 2025, each with value, unit, provenance chip and Show math.

#### Scenario: NorthStar cards
- **WHEN** the user opens the dashboard for NorthStar Foods Group
- **THEN** the cards show 24, 9 607, 31 743, 15 233, 15 233 and 515, and the per-100-wearers card shows the rate computed from 515 and 9 607

#### Scenario: Active wearers explanation
- **WHEN** the user opens Show math on Active wearers
- **THEN** it explains why the figure differs from the pack's 28 367

#### Scenario: Per 100 wearers explanation
- **WHEN** the user opens Show math on the per-100-wearers card
- **THEN** it states that the full-year service-request count is divided by the December wearers

#### Scenario: Another customer
- **WHEN** the user selects another customer
- **THEN** every card shows that customer's values and name

### Requirement: Site table
The dashboard SHALL show a table of the selected customer's sites with active wearers, garments in circulation, repairs and service requests per site for 2025, and SHALL NOT link rows to a drill-down page. Each numeric column SHALL have its own compact ProvenanceChip in its header and its own Show math, and Show math SHALL state the column's full method and source.

#### Scenario: Rows
- **WHEN** the user opens the dashboard for NorthStar Foods Group
- **THEN** the table has 24 rows, one per site, and the columns for garments in circulation and service requests sum to 31 743 and 515

#### Scenario: Column provenance
- **WHEN** the table is shown
- **THEN** the active-wearers header carries a compact CALCULATED chip, the other three numeric headers carry compact MEASURED chips, and each header's Show math lists that column's method, source, formula and inputs

#### Scenario: Header chip by keyboard
- **WHEN** the user tabs to a header chip
- **THEN** a tooltip shows the full method and source and the column's Show math control is reachable next

### Requirement: Same content for both roles
The operational cards and the site table SHALL be identical in the KAM and Customer roles.

#### Scenario: Role switch
- **WHEN** the user switches from KAM to Customer
- **THEN** the cards and the table do not change
