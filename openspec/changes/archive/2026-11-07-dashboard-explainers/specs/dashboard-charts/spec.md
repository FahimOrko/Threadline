## MODIFIED Requirements

### Requirement: Chart types
A bar chart SHALL compare sites or products, a line SHALL show a monthly trend, a donut SHALL show a composition of at most three slices, a bullet chart SHALL compare a value with a cut-off, a heatmap SHALL show sites by month and an area chart SHALL show one measure over months. A comparison chart SHALL put the comparison's total next to the service's stacked total with the gap labelled, and a part-of-whole bar SHALL show a composition of any number of parts.

#### Scenario: Garments section
- **WHEN** the Garments and utilization section opens
- **THEN** a bullet chart shows each site's utilization against the over-allocation cut-off

#### Scenario: Signals section
- **WHEN** the Signals section opens for a customer with a repair spike
- **THEN** a line shows monthly repairs with the spike threshold as a band and the spike months marked and labelled

#### Scenario: Sites section
- **WHEN** the Sites section opens
- **THEN** a heatmap shows sites by month with a toggle between utilization and repairs

#### Scenario: Footprint section
- **WHEN** the Environmental footprint section opens
- **THEN** the net CO2e chart shows one bar for the comparison's emissions and one stacked bar for the service (process plus delivery) with the gap labelled as the net saving

## ADDED Requirements

### Requirement: Net CO2e comparison chart
The chart "Why is the net CO2e saving what it is?" SHALL show one bar for what the comparison would emit, one stacked bar for the service (process, delivery) and the gap labelled "Net saving". A sentence above it SHALL be a template over `{{fact:comparison_footprint}}`, `{{fact:service_footprint}}` and `{{fact:co2e_saved}}`: what the comparison would emit, what the service emitted including delivery, and that the difference is the net saving. When the engine reports the comparison's delivery as 0 the chart SHALL state the comparison has no delivery emissions. Its hidden table SHALL equal the values drawn.

#### Scenario: Label equals Fact
- **WHEN** the chart renders for any comparison and estimate
- **THEN** the net saving label equals the CO2e saved Fact value, and the comparison bar equals the service total plus it

#### Scenario: Home washing
- **WHEN** the comparison is home washing
- **THEN** the chart says home washing has no delivery emissions

### Requirement: Recycling breakdown
The recycling panel SHALL show allocated textile waste by treatment (recycling, reuse, energy recovery, incineration) as one part-of-whole bar from the engine's values, with the recycled-or-reused share as the hero figure. A customer without waste data SHALL show no bar.

#### Scenario: Parts sum
- **WHEN** the four parts are added
- **THEN** they equal the allocated waste total, and recycling plus reuse equals the recycled-or-reused part of the share Fact

### Requirement: Chart titles state the question
Every chart title SHALL be the question the chart answers and SHALL carry an "i" explanation.

#### Scenario: Heatmap titles
- **WHEN** the heatmap shows utilization
- **THEN** the title reads "Where and when were garments under-used?"; for repairs, "Where and when did repairs spike?"

### Requirement: Hatching means a missing value
Hatching SHALL mean "needs input" only. An illustrative or estimated value SHALL NOT be drawn with a hatched bar; it SHALL use no bar or a dashed one.

#### Scenario: Garment value in use
- **WHEN** the Garments in use panel shows an illustrative value
- **THEN** it has no hatched bar

### Requirement: Unused-cost chart placeholder
While the rental fee is unset, the Costs page SHALL replace the per-site cost chart with one placeholder panel saying the per-site cost appears once Lindström provides the rental fee, with its "i" and Show math. When the fee is set, the per-site bars SHALL render.

#### Scenario: Fee unset
- **WHEN** the Costs page opens while the fee is unset
- **THEN** one placeholder panel shows and no per-site hatched row does

### Requirement: Full-width panel layout
A full-width panel SHALL place its ring beside its hero figure and its related figures beside them, leaving no empty middle.

#### Scenario: Service quality
- **WHEN** the Service quality panel renders at 1230px
- **THEN** the on-time ring sits next to its hero and the request figures sit beside them
