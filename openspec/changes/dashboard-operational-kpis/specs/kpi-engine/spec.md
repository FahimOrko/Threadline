# Spec Delta

## ADDED Requirements

### Requirement: Delivery sites
The engine SHALL compute Delivery sites as the number of sites of the customer, with method MEASURED.

#### Scenario: NorthStar
- **WHEN** the engine runs for CUST001
- **THEN** the value is 24 and the unit is sites

### Requirement: Active wearers
The engine SHALL compute Active wearers for the latest month of the period as the maximum of `active_wearers` across product rows per site, summed over the customer's sites, with method CALCULATED. The Fact's inputs SHALL state the month used and SHALL explain that summing across product rows double-counts wearers.

#### Scenario: NorthStar December 2025
- **WHEN** the engine runs for CUST001 over 2025-01 to 2025-12
- **THEN** the value is 9 607

#### Scenario: Difference from the pack
- **WHEN** the Active wearers Fact is shown with its math
- **THEN** it states that the pack's `sample_output.csv` shows 28 367 because it sums across product rows, and that this figure is not used

#### Scenario: Customer with no rows
- **WHEN** the customer has no service-activity rows in the latest month
- **THEN** the value is 0 and the inputs state zero rows were found

### Requirement: Garments in circulation
The engine SHALL compute Garments in circulation as the sum of `allocated_pieces` for the customer in the latest month of the period, with method MEASURED.

#### Scenario: NorthStar December 2025
- **WHEN** the engine runs for CUST001 over 2025-01 to 2025-12
- **THEN** the value is 31 743 and the unit is pieces

### Requirement: Repairs
The engine SHALL compute Repairs as the sum of `repair_count` for the customer in the period, with method MEASURED.

#### Scenario: NorthStar 2025
- **WHEN** the engine runs for CUST001 over 2025-01 to 2025-12
- **THEN** the value is 15 233 and the unit is repairs

### Requirement: Service requests
The engine SHALL compute Service requests as the sum of `service_requests` for the customer in the period, with method MEASURED, and Service requests per 100 wearers (Dec) as the full-year sum divided by the Active wearers of the latest month times 100, with method CALCULATED. The per-100 Fact's label SHALL read "per 100 wearers (Dec)" and its inputs SHALL state that a full-year count is divided by December wearers.

#### Scenario: NorthStar 2025
- **WHEN** the engine runs for CUST001 over 2025-01 to 2025-12
- **THEN** Service requests is 515

#### Scenario: Per 100 wearers (Dec)
- **WHEN** the engine runs for CUST001 over 2025-01 to 2025-12
- **THEN** the value is 515 divided by 9 607 times 100, the label contains "per 100 wearers (Dec)" and the inputs say the full-year count is divided by December wearers

#### Scenario: No wearers
- **WHEN** Active wearers is 0
- **THEN** Service requests per 100 wearers has value 0 and its inputs state that the rate is undefined without wearers

### Requirement: Operational facts list
The engine SHALL provide one call that returns, for a customer and period, the Delivery sites, Active wearers, Garments in circulation, Repairs, Replacements postponed, Service requests and Service requests per 100 wearers (Dec) Facts in that order, each with provenance.

#### Scenario: List content
- **WHEN** the call runs for a customer and period
- **THEN** it returns seven Facts, each with at least one method, a source, a formula and a scope

### Requirement: Per-site operational figures
The engine SHALL return, for a customer and period, one row per site of the customer with active wearers (same rule as the customer-level Fact, applied to one site), garments in circulation, repairs and service requests, together with one provenance block (methods, source, formula, inputs) per numeric column: active wearers CALCULATED, the other three MEASURED. A site with no rows SHALL appear with zeros.

#### Scenario: Rows reconcile with the customer Facts
- **WHEN** the engine runs for CUST001 over 2025-01 to 2025-12
- **THEN** there are 24 rows and their wearers, garments, repairs and service requests sum to 9 607, 31 743, 15 233 and 515

#### Scenario: Site without activity
- **WHEN** a site has no service-activity rows
- **THEN** its row shows zeros rather than being dropped
