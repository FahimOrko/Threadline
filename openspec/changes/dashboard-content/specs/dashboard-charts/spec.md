# dashboard-charts Specification

## Purpose
Makes each dashboard section lead with charts that answer one question a KAM would ask, using only values the engine produces.

## ADDED Requirements

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
A bar chart SHALL compare sites or products, a line SHALL show a monthly trend, a donut SHALL show a composition of at most three slices, a bullet chart SHALL compare a value with a cut-off, a waterfall SHALL show how a total is built from steps and a heatmap SHALL show sites by month and an area chart SHALL show one measure over months.

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
- **THEN** a waterfall runs from the comparison laundry's emissions through process savings and delivery to the service total, with the net saving labelled

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
