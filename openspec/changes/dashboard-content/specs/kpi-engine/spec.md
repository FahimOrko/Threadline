# kpi-engine Delta

## ADDED Requirements

### Requirement: Monthly series
The engine SHALL provide a monthly series per measure, with its provenance and one point per month of the period, for repairs, service requests, avoided purchase cost, water saved, energy saved, CO₂e saved and garment utilization. It SHALL add up existing monthly rows and SHALL NOT model new values.

#### Scenario: Flow measures add up
- **WHEN** the monthly series of repairs is summed for CUST001 over 2025-01 to 2025-12
- **THEN** the total equals the repairs Fact

#### Scenario: Utilization month
- **WHEN** the December point of the utilization series is read
- **THEN** it equals the garment utilization Fact

#### Scenario: Site scope
- **WHEN** a series is requested with a site in the scope
- **THEN** its points cover that site only

### Requirement: Site by month matrix
The engine SHALL provide, for utilization and for repairs, one row per site with one cell per month, each cell carrying its value and a level from 0 to 4 assigned by the engine from the customer's matrix.

#### Scenario: Matrix equals series
- **WHEN** a site's cells are compared with the monthly series for that site
- **THEN** the values are equal

### Requirement: Repair band
The engine SHALL provide, for each site the repair spike rule examines, the monthly repairs with the mean, the threshold and a spike flag, using the same team assumptions as the spike rule.

#### Scenario: Spike months agree
- **WHEN** the band's spike months are compared with the repair spike signal
- **THEN** they are the same months

### Requirement: Footprint comparison
The engine SHALL provide, for a baseline and a sensitivity level, the comparison and service total per metric (water, energy, CO₂e), the CO₂e waterfall steps with a start and an end each, and the composition parts for process versus delivery and for recycled or reused versus other textile waste, all built from the totals the footprint Facts use.

#### Scenario: Savings agree
- **WHEN** comparison minus service is computed for each metric and sensitivity level
- **THEN** it equals the matching saved Fact

#### Scenario: Waterfall closes
- **WHEN** the last waterfall step is read
- **THEN** its end equals the service total, and the net saving equals the CO₂e saved Fact
