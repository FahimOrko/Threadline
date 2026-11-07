# Spec Delta

## MODIFIED Requirements

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
