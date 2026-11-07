## MODIFIED Requirements

### Requirement: Savings vs a baseline
The engine SHALL compute, for a customer, a baseline and a sensitivity level passed as arguments, the water, energy and CO2e saved as washed kg x (baseline factor - laundry factor) summed over the customer's laundry-months, and each as a percentage of washed kg x baseline factor, with methods ALLOCATED and ESTIMATED. Each label SHALL name the baseline. Each of these Facts SHALL carry range low, base and high as defined in the baseline-sensitivity capability, and its value SHALL be the range entry of the selected level.

#### Scenario: NorthStar against local laundry
- **WHEN** the engine runs for CUST001 with the local laundry baseline at base
- **THEN** it returns 1 406 483 L, 171 643 kWh and 255 074 kgCO2e saved, and 29.5%, 32.6% and 77.6%, and every label contains "vs local laundry"

#### Scenario: Formula inputs
- **WHEN** the CO2e saving is computed
- **THEN** the baseline factor is process plus delivery per kg, and the precomputed "vs local" columns are not read

#### Scenario: Another baseline
- **WHEN** the engine runs with the home washing or in-house baseline
- **THEN** the values use that baseline's factors and every label names it ("vs home washing", "vs in-house laundry")

#### Scenario: Each sensitivity level
- **WHEN** the engine runs at low, base and high for the same baseline
- **THEN** the values equal range.low, range.base and range.high, and they equal the saving computed with baseline factors scaled by 0.8, 1 and 1.2

#### Scenario: No washed kg
- **WHEN** a customer has no washed kg
- **THEN** no savings Fact is returned

#### Scenario: Range
- **WHEN** a service footprint or delivery Fact is returned
- **THEN** its `range.base` equals its value, `range.low` and `range.high` are null, and its value is never null; savings Facts carry all three

#### Scenario: Illustrative baseline note
- **WHEN** Show math is opened on a CO2e saved Fact for any baseline
- **THEN** it notes that the baseline factors are marked illustrative in the pack and may sit far above the laundries' own factors, which drives the high percentage

#### Scenario: Missing laundry-month (backstop)
- **WHEN** data that bypassed the build lacks a laundry-month the customer needs
- **THEN** the engine throws an error naming the laundry and month instead of returning a number
