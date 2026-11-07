# dashboard-charts Specification

## Purpose
Makes each dashboard section lead with charts that answer one question a KAM would ask, using only values the engine produces.

## Requirements

### Requirement: One question per chart
Each chart SHALL answer one question stated in its title in plain words, show its unit, and carry one caption with a Show math control for its series.

#### Scenario: Chart anatomy
- **WHEN** a chart renders
- **THEN** it shows a question title, a unit, a caption and Show math

### Requirement: Values come from the engine
A chart SHALL plot only values from engine Facts or engine series (monthly series, site by month matrix, repair band, footprint comparison). A component SHALL NOT sum, subtract, average, bucket or otherwise compute a plotted or labelled value; drawing scales are not values.

#### Scenario: Waterfall steps
- **WHEN** the footprint waterfall renders
- **THEN** each bar's start and end come from the engine's steps, not from a sum in the component

#### Scenario: A series is missing
- **WHEN** the engine returns no series for a chart
- **THEN** the chart is not shown and the section still shows its cards

### Requirement: Text alternative and provenance
Every chart SHALL have a text alternative: a visually hidden table of the plotted values with a one-sentence summary. Provenance SHALL stay reachable through Show math, and a series with an estimated or illustrative method SHALL be drawn dashed.

#### Scenario: Screen reader
- **WHEN** a screen reader reaches a chart
- **THEN** it finds the summary and a table of the values

#### Scenario: Estimated series
- **WHEN** a chart plots avoided purchase cost (method estimated)
- **THEN** its line or outline is dashed

### Requirement: Not by colour alone
A chart SHALL identify marks by label, dash or hatch as well as colour, SHALL use theme tokens only, and SHALL show no glow, no gradient fill (an area chart may use a flat 12% tint of the subject colour) and no animation of its own.

#### Scenario: Comparison bars
- **WHEN** a comparison bar shows Lindström and the comparison laundry
- **THEN** each bar carries a direct text label

### Requirement: Display rules
Plotted and labelled values SHALL follow the display rules: whole numbers at 100 or above, one decimal below, percentages with one decimal, rounded only at display.

#### Scenario: Label rounding
- **WHEN** a bar's value is 1234.56
- **THEN** its label reads 1,235

### Requirement: Needs input is a placeholder
A bar whose engine value is null because a team assumption is unset SHALL be drawn as a hatched placeholder labelled "Needs input", and SHALL NOT be drawn as zero or omitted.

#### Scenario: Unset rental fee
- **WHEN** the cost of unused allocation has no value
- **THEN** each site shows a hatched placeholder bar labelled "Needs input"

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

### Requirement: Interactive area chart
The Overview SHALL show one area chart of an engine monthly series, with a measure toggle (water saved, CO₂e saved, avoided purchase cost, garment utilization) and a range toggle (3, 6 or 12 months). The range total SHALL come from the engine's series windows; the chart SHALL only select which months to draw. A series with an estimated or illustrative method SHALL be drawn dashed. The toggles SHALL be keyboard operable and SHALL change nothing but the measure or the range.

#### Scenario: Change range
- **WHEN** the KAM selects "3 months"
- **THEN** the chart draws the last three months and the total shown equals the engine's three-month window for that measure

#### Scenario: Change measure
- **WHEN** the KAM selects "Avoided cost"
- **THEN** the line is dashed, the unit and chip change to that measure's, and the range stays as chosen

#### Scenario: No series
- **WHEN** the engine returns no series for a measure
- **THEN** that measure is not offered

### Requirement: One-time fade-in
A chart section MAY fade in once on first load. It SHALL NOT replay on toggles or navigation within the page, and SHALL NOT fade with `prefers-reduced-motion: reduce`.

#### Scenario: First load
- **WHEN** a section page first renders
- **THEN** its chart panels fade in once

#### Scenario: Reduced motion
- **WHEN** the user prefers reduced motion
- **THEN** the panels show at once

### Requirement: Figures in panels
A Fact that a chart on the same page already shows SHALL NOT also be a card; it stays reachable through the chart's Show math and text alternative. A ring or part-of-whole bar inside a panel SHALL carry its own text alternative with the label and values, and SHALL map engine values to angle or width only.

#### Scenario: Ring
- **WHEN** a panel shows a share as a ring
- **THEN** the ring has an accessible name with the label and the percent

### Requirement: Changed-value highlight
After a scenario change, a Fact card whose Fact value changed SHALL show a brief ring, decided by comparing the Fact values before and after with no new arithmetic. It SHALL play once per change, SHALL NOT play on first load, and SHALL NOT play with `prefers-reduced-motion: reduce`.

#### Scenario: Value changed
- **WHEN** the estimate changes and a card's Fact value differs
- **THEN** the card shows the ring once

#### Scenario: Value unchanged
- **WHEN** the choice does not change a card's Fact value
- **THEN** the card shows no ring

#### Scenario: Reduced motion
- **WHEN** the user prefers reduced motion
- **THEN** no ring is shown

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
