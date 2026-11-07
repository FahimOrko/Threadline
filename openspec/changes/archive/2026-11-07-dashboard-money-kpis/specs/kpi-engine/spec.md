# Spec Delta

## MODIFIED Requirements

### Requirement: Fact shape
Each Fact SHALL carry id, label, value (a raw number, or null when a required team assumption is unset), unit, methods, source, assumption IDs, confidence, formula, inputs, scope, period and baseline. Methods and source SHALL use the existing provenance types.

#### Scenario: Fact has provenance
- **WHEN** the engine returns any Fact
- **THEN** it has at least one method, a source, a formula and a scope

#### Scenario: Value missing for an unset assumption
- **WHEN** a Fact needs a team assumption whose value is null
- **THEN** its value is null, never 0 or NaN, and its inputs list the unset assumption

## ADDED Requirements

### Requirement: Avoided purchase cost
The engine SHALL compute Avoided purchase cost for a customer and period as the sum over the customer's repairs rows of `repair_count` times the product's `synthetic_purchase_cost_eur`, with method ESTIMATED, source SYNTHETIC and assumption A002. It SHALL fail with a clear error when a row's product is missing from the products data.

#### Scenario: NorthStar full year 2025
- **WHEN** the engine runs for CUST001 over 2025-01 to 2025-12
- **THEN** the value is 660 082 and the unit is EUR (an independent recomputation, not a pack value)

#### Scenario: Unknown product
- **WHEN** a repairs row names a product that is not in the products data
- **THEN** the engine raises an error naming the product

### Requirement: Garment value kept in use
The engine SHALL compute Garment value kept in use (Dec) as the sum of `allocated_pieces` times the product's `synthetic_purchase_cost_eur` for the customer in the latest month of the period, with method ILLUSTRATIVE and source SYNTHETIC.

#### Scenario: NorthStar December 2025
- **WHEN** the engine runs for CUST001 over 2025-01 to 2025-12
- **THEN** the value is 1 335 527 and the unit is EUR (an independent recomputation, not a pack value)

### Requirement: Garment utilization
The engine SHALL compute Garment utilization (Dec) as the sum of `active_assets_scanned` divided by the sum of `allocated_pieces` for the customer in the latest month of the period, times 100, with method CALCULATED and unit %.

#### Scenario: NorthStar December 2025
- **WHEN** the engine runs for CUST001 over 2025-01 to 2025-12
- **THEN** the value is about 83.5 (26 513 of 31 743)

#### Scenario: No allocation
- **WHEN** the customer has no allocated pieces in the latest month
- **THEN** the value is 0 and the inputs state that utilization is undefined without allocated pieces

### Requirement: Cost of unused allocation
The engine SHALL compute Cost of unused allocation (Dec, per week) as unused pieces times team assumption T001, where unused pieces is December `allocated_pieces` minus December `active_assets_scanned`, with method ESTIMATED and source ASSUMPTION. While T001 is unset the value SHALL be null and the inputs SHALL still show the unused pieces.

#### Scenario: T001 set
- **WHEN** T001 has a value and the engine runs for CUST001
- **THEN** the value is 5 230 times that value, in EUR per week

#### Scenario: T001 unset
- **WHEN** T001 is null
- **THEN** the value is null, the inputs show 5 230 unused pieces and T001 as not set, and the unit is EUR per week

### Requirement: Value facts list
The engine SHALL provide one call that returns, for a customer and period, the Avoided purchase cost, Garment value kept in use, Cost of unused allocation and Garment utilization Facts in that order, each with provenance.

#### Scenario: List content
- **WHEN** the call runs for a customer and period
- **THEN** it returns four Facts, each with at least one method, a source, a formula and a scope
