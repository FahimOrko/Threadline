## ADDED Requirements

### Requirement: Washed weight Fact
The engine SHALL provide the Fact `washed_kg`, the customer's washed weight in kg for the period, from the same service-activity rows the footprint uses, so the first step of the Trees strip names garments washed with a Fact. Its method is CALCULATED and its source is the data pack; Show math lists the rows' sum. It SHALL be null when the footprint cannot be built, never 0.

#### Scenario: Matches the footprint
- **WHEN** the footprint Facts and `washed_kg` are built for a customer
- **THEN** `washed_kg` equals the washed kg input listed in Show math of the service footprint

## MODIFIED Requirements

### Requirement: Tree equivalence Facts
The engine SHALL provide, for a customer, period, comparison and estimate level, the Facts `tree_factor` (T011), `trees_comparison`, `trees_service`, `trees_saved` and `tree_icon_scale`. The `trees_saved` id is kept for continuity but its label SHALL be "Young trees equal to the emissions avoided" and no label, formula text shown on screen or note SHALL say "trees saved"; its Show math formula SHALL read "trees equal to the emissions avoided = trees for the comparison - trees for Lindström". Tree counts SHALL be the CO2e Fact in tonnes divided by the factor: `trees_comparison` from the comparison footprint, `trees_service` from the service footprint (process and delivery), `trees_saved` as their difference. The methods SHALL include ILLUSTRATIVE, the source PUBLIC_REFERENCE, and Show math SHALL list the factor, its source and the footprint Facts used. A tree Fact whose CO2e Fact is null SHALL be null.

#### Scenario: Counts agree with the footprint
- **WHEN** the tree Facts are built for a customer
- **THEN** `trees_comparison` times the factor equals the comparison footprint in tonnes, `trees_service` times the factor equals the service footprint in tonnes, and `trees_saved` equals their difference

#### Scenario: Negative saving
- **WHEN** the comparison footprint is below the service footprint
- **THEN** `trees_saved` is negative and the zone consumer treats it as "Lindström needs more"

#### Scenario: Null footprint
- **WHEN** the comparison footprint is null
- **THEN** every tree Fact that depends on it is null, never 0

#### Scenario: Label
- **WHEN** the Facts are built
- **THEN** no tree Fact label contains "saved"
