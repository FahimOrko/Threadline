# dashboard-overview Specification

## Purpose
Gives the Overview six headline figures, each readable at a glance and tied to the plain meaning of the number.

## ADDED Requirements

### Requirement: Six headline KPIs
After its intro, the Overview SHALL show six KPI tiles in this order: water saved, CO₂e saved, avoided purchase cost, garment utilization, on-time cycle rate, critical dormant sites. Each tile SHALL show a plain-language label, the value and unit, one line saying what it means, a compact provenance chip and Show math.

#### Scenario: Tiles
- **WHEN** the Overview opens for CUST001
- **THEN** six tiles show the same values as the matching cards elsewhere

### Requirement: Sparkline where monthly data exists
A tile SHALL show a sparkline of the engine's monthly series for water saved, CO₂e saved, avoided purchase cost and garment utilization. A tile without a monthly series (on-time cycle rate, critical dormant sites) SHALL show its value only and SHALL NOT draw an invented trend.

#### Scenario: No monthly data
- **WHEN** the on-time rate tile renders
- **THEN** it has no sparkline

### Requirement: Comparison bar where a pair exists
The water saved and CO₂e saved tiles SHALL show a thin comparison bar of Lindström against the selected comparison laundry from the engine's footprint comparison. The utilization tile SHALL show the over-allocation cut-off as a tick. Other tiles SHALL show no comparison.

#### Scenario: Water tile
- **WHEN** the comparison is "Home washing"
- **THEN** the water tile's bar compares the service's water use with home washing, labelled with both values

#### Scenario: No comparison for avoided cost
- **WHEN** the avoided purchase cost tile renders
- **THEN** it shows no comparison bar

### Requirement: Equal tiles
All six tiles SHALL have the same height and layout. A tile without a sparkline SHALL show a short context line, as fixed template text, in the sparkline's slot, and SHALL NOT leave the slot empty.

#### Scenario: Tile without a monthly series
- **WHEN** the on-time rate or critical dormant sites tile renders
- **THEN** it is as tall as the other tiles and a context line (for example that the figure has no monthly breakdown) sits where the sparkline would be
