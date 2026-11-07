## MODIFIED Requirements

### Requirement: Site by month matrix
The engine SHALL provide, for utilization and for repairs, one row per site with one cell per month, each cell carrying its value, a level from 0 to 4 in five equal steps and a `highlight` flag, and each row carrying its count of highlighted months. For utilization a cell SHALL be highlighted when its value is below the over-allocation cut-off (none while the cut-off is unset); for repairs when the repair band flags that month as a spike.

#### Scenario: Matrix equals series
- **WHEN** a site's cells are compared with the monthly series for that site
- **THEN** the values are equal

#### Scenario: Highlights agree with the rules
- **WHEN** the highlighted repair months are compared with the repair spike signal
- **THEN** they are the same months, and utilization highlights are exactly the cells below the cut-off

### Requirement: Footprint comparison
The engine SHALL provide, for a baseline and a sensitivity level, the comparison and service total per metric (water, energy, CO₂e), the comparison's delivery emissions, the net CO₂e saving, the composition parts for process versus delivery, and the allocated textile waste by treatment (recycling, reuse, energy recovery, incineration), all built from the totals the footprint Facts use. It SHALL provide a Fact `comparison_footprint` (what the comparison would emit, CO₂e) with provenance and Show math.

#### Scenario: Savings agree
- **WHEN** comparison minus service is computed for each metric and sensitivity level
- **THEN** it equals the matching saved Fact

#### Scenario: Waterfall closes
- **WHEN** the comparison Fact is compared with the service total and the net saving
- **THEN** comparison equals service total plus net saving, and the net saving equals the CO₂e saved Fact

#### Scenario: Waste parts
- **WHEN** the four waste parts are added
- **THEN** they equal the allocated waste total, and recycling plus reuse equals the recycled-or-reused amount behind the recycling share Fact
