## ADDED Requirements

### Requirement: Tree equivalence Facts
The engine SHALL provide, for a customer, period, comparison and estimate level, the Facts `tree_factor` (T011), `trees_comparison`, `trees_service`, `trees_saved` and `tree_icon_scale`. Tree counts SHALL be the CO2e Fact in tonnes divided by the factor: `trees_comparison` from the comparison footprint, `trees_service` from the service footprint (process and delivery), `trees_saved` as their difference. The methods SHALL include ILLUSTRATIVE, the source PUBLIC_REFERENCE, and Show math SHALL list the factor, its source and the footprint Facts used. A tree Fact whose CO2e Fact is null SHALL be null.

#### Scenario: Counts agree with the footprint
- **WHEN** the tree Facts are built for a customer
- **THEN** `trees_comparison` times the factor equals the comparison footprint in tonnes, `trees_service` times the factor equals the service footprint in tonnes, and `trees_saved` equals their difference

#### Scenario: Negative saving
- **WHEN** the comparison footprint is below the service footprint
- **THEN** `trees_saved` is negative and the zone consumer treats it as "Lindström needs more"

#### Scenario: Null footprint
- **WHEN** the comparison footprint is null
- **THEN** every tree Fact that depends on it is null, never 0

### Requirement: Tree icon scale
The engine SHALL return, with the tree Facts, the icon counts for drawing: one icon stands for N trees, N taken from a fixed ladder (1, 5, 10, 25, 50, 100, 250, 500, 1000, and so on by that pattern) as the smallest step keeping the larger of the two counts at or below 300 icons; icon counts are the tree counts divided by N, rounded up, and the saved icons are the comparison icons minus the service icons. `tree_icon_scale` SHALL be a Fact whose Show math states the cap and the rounding.

#### Scenario: Cap holds
- **WHEN** the tree counts are 10 and 2,000,000
- **THEN** the larger icon count is at most 300 and N is the smallest ladder step that achieves it

#### Scenario: Icons add up
- **WHEN** icon counts are returned
- **THEN** service icons plus saved icons equal comparison icons
