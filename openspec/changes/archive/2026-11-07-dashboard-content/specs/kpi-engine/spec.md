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

### Requirement: Series windows and trend
Each monthly series SHALL also carry the total for the last 3, 6 and 12 months (for a snapshot measure such as utilization, its value in the last month of the window) and a trend: for flow measures the change of the last three months against the three before, for utilization the change of the last month against the month three earlier, as a relative percent with a direction of up, down or flat (flat when the percent rounds to 0.0 at display). A series with fewer months than a window needs SHALL omit that window and the trend.

#### Scenario: Window equals the months
- **WHEN** the 6-month window of water saved is read
- **THEN** it equals the sum of the last six points

#### Scenario: Trend direction
- **WHEN** the last three months total more than the three before
- **THEN** the trend direction is up and the change is the engine's relative percent

#### Scenario: Short series
- **WHEN** a flow series has fewer than six points
- **THEN** it has no trend and no 6-month window

#### Scenario: No earlier activity
- **WHEN** the earlier span totals zero
- **THEN** the series has no trend, never an infinite or empty percent

### Requirement: Site by month matrix
The engine SHALL provide, for utilization and for repairs, one row per site with one cell per month, each cell carrying its value and a level from 0 to 4 assigned by the engine in five equal steps from the lowest to the highest cell of the customer's matrix.

#### Scenario: Matrix equals series
- **WHEN** a site's cells are compared with the monthly series for that site
- **THEN** the values are equal

### Requirement: Repair band
The engine SHALL provide, for each site the repair spike rule examines, the monthly repairs with the mean, the threshold and a spike flag, using the same team assumptions as the spike rule.

#### Scenario: Spike months agree
- **WHEN** the band's spike months are compared with the repair spike signal
- **THEN** they are the same months

### Requirement: Footprint comparison
The engine SHALL provide, for a baseline and a sensitivity level, the comparison and service total per metric (water, energy, CO₂e), the CO₂e waterfall steps with a start, an end and a signed change each, and the composition parts for process versus delivery and for recycled or reused versus other textile waste, all built from the totals the footprint Facts use.

#### Scenario: Savings agree
- **WHEN** comparison minus service is computed for each metric and sensitivity level
- **THEN** it equals the matching saved Fact

#### Scenario: Waterfall closes
- **WHEN** the last waterfall step is read
- **THEN** its end equals the service total, and the net saving equals the CO₂e saved Fact
