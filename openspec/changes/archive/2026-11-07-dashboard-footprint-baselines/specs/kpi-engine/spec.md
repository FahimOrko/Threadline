## ADDED Requirements

### Requirement: Savings vs a baseline
The engine SHALL compute, for a customer and a baseline passed as an argument, the water, energy and CO2e saved as washed kg x (baseline factor - laundry factor) summed over the customer's laundry-months, and each as a percentage of washed kg x baseline factor, with methods ALLOCATED and ESTIMATED, source SYNTHETIC and assumption A001. Each label SHALL name the baseline.

#### Scenario: NorthStar against local laundry
- **WHEN** the engine runs for CUST001 with the local laundry baseline
- **THEN** it returns 1 406 483 L, 171 643 kWh and 255 074 kgCO2e saved, and 29.5%, 32.6% and 77.6%, and every label contains "vs local laundry"

#### Scenario: Formula inputs
- **WHEN** the CO2e saving is computed
- **THEN** the baseline factor is process plus delivery per kg, and the precomputed "vs local" columns are not read

#### Scenario: Another baseline
- **WHEN** the engine runs with a different baseline row
- **THEN** the values use that baseline's factors and the labels name it

#### Scenario: No washed kg
- **WHEN** a customer has no washed kg
- **THEN** no savings Fact is returned

#### Scenario: Range
- **WHEN** any footprint Fact is returned
- **THEN** its `range.base` equals its value, `range.low` and `range.high` are null, and its value is never null

#### Scenario: Illustrative baseline note
- **WHEN** Show math is opened on a CO2e saved Fact
- **THEN** it notes that the local laundry baseline process factor is marked illustrative in the pack and sits far above the laundries' own factors, which drives the high percentage

#### Scenario: Missing laundry-month (backstop)
- **WHEN** data that bypassed the build lacks a laundry-month the customer needs
- **THEN** the engine throws an error naming the laundry and month instead of returning a number

### Requirement: Service footprint
The engine SHALL compute the customer's service footprint as allocated process plus delivery emissions (washed kg x laundry factors), as a total in kgCO2e, per tonne washed (kgCO2e/t), and per active wearer (Dec), with method ALLOCATED, source SYNTHETIC.

#### Scenario: NorthStar
- **WHEN** the engine runs for CUST001
- **THEN** the total is 73 785 kgCO2e and per tonne washed is 147 kgCO2e/t, and per wearer divides the full-year total by the December wearers and is labelled "(Dec)"

#### Scenario: No wearers
- **WHEN** a customer has no December wearers
- **THEN** the per-wearer Fact is omitted, not 0 or NaN

### Requirement: Delivery footprint
The engine SHALL compute allocated delivery emissions and their share of total service emissions, and the delivery Fact SHALL state the laundry delivery factor against the baseline's and the note that a baseline with zero delivery makes delivery alone look worse, to be read with the net comparison. Route kilometres SHALL be stated as a data gap and SHALL NOT be estimated.

#### Scenario: NorthStar
- **WHEN** the engine runs for CUST001
- **THEN** delivery is 23 785 kgCO2e and its share is 32.2%

#### Scenario: Honesty and data gap
- **WHEN** Show math is opened on the delivery Fact
- **THEN** it lists both delivery factors, the net-comparison note and the route-kilometre data gap

### Requirement: Savings agree with the precomputed columns
The engine totals per customer SHALL be checked in tests against the sums of the pack's allocated and "vs local" columns, and any disagreement SHALL be reported, not forced.

#### Scenario: Cross-check
- **WHEN** the test compares engine totals with the pack columns for each customer
- **THEN** they agree within 0.1% or the test fails showing both numbers
